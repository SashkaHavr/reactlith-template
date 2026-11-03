import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  Config,
  Console,
  Data,
  Effect,
  FileSystem,
  Redacted,
  Schedule,
  Schema,
  Stream,
} from "effect";
import { Command, Flag } from "effect/cli";
import { ChildProcess } from "effect/process";

class CommandFailed extends Data.TaggedError("CommandFailed")<{
  command: string;
  code: number;
}> {}

const run = Effect.fn(function* (
  command: string,
  args: ReadonlyArray<string>,
  options: ChildProcess.CommandOptions = {},
) {
  const handle = yield* ChildProcess.make(command, args, {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    ...options,
  });
  const [output, code] = yield* Effect.all(
    [handle.stdout.pipe(Stream.decodeText, Stream.mkString), handle.exitCode],
    { concurrency: "unbounded" },
  );
  if (code !== 0) {
    return yield* new CommandFailed({ command: `${command} ${args.join(" ")}`, code });
  }
  return output;
}, Effect.scoped);

function railwayJson<A, R>(args: ReadonlyArray<string>, schema: Schema.ConstraintDecoder<A, R>) {
  return run("railway", [...args, "--json"], { stdout: "pipe" }).pipe(
    Effect.flatMap(Schema.fromJsonString(schema).pipe(Schema.decodeUnknownEffect)),
  );
}

const extractDatabaseUrl = Effect.fn(function* (service: string) {
  const services = yield* railwayJson(
    ["service", "list"],
    Schema.Array(Schema.Struct({ name: Schema.String })),
  ).pipe(Effect.orElseSucceed(() => []));
  let databaseUrl = "";
  if (services.some(({ name }) => name === service)) {
    const { proxies } = yield* railwayJson(
      ["tcp-proxy", "list", "--service", service],
      Schema.Struct({ proxies: Schema.Array(Schema.Struct({ endpoint: Schema.String })) }),
    );
    const { DATABASE_URL } = yield* railwayJson(
      ["variables", "list", "--service", service],
      Schema.Struct({ DATABASE_URL: Schema.String }),
    );
    databaseUrl = DATABASE_URL.replace(/@[^/]+/, () => `@${proxies[0]?.endpoint ?? "null"}`);
  }
  if (databaseUrl) {
    yield* Console.log(`::add-mask::${databaseUrl}`);
  }
  return Redacted.make(databaseUrl);
});

const deploy = Command.make(
  "deploy",
  {
    domains: Flag.Boolean("domains"),
    force: Flag.Boolean("force"),
    service: Flag.String("service").pipe(Flag.withDefault("db")),
  },
  ({ domains, force, service }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      let databaseUrl = yield* extractDatabaseUrl(service);
      const pushDatabase = (args: ReadonlyArray<string> = []) =>
        run("vpr", ["db#push", ...args], {
          env: { DATABASE_URL: databaseUrl },
          extendEnv: true,
        });

      yield* run("railway", ["config", "plan", "--out", "railway-plan.json"]);
      if (!force) {
        const plan = yield* fs
          .readFileString("railway-plan.json")
          .pipe(
            Effect.flatMap(
              Schema.Struct({ destructive: Schema.Unknown }).pipe(
                Schema.fromJsonString,
                Schema.decodeUnknownEffect,
              ),
            ),
          );
        if (plan.destructive === true || plan.destructive === "true") {
          return yield* new CommandFailed({
            command: "Destructive Railway plan rejected",
            code: 1,
          });
        }
      }
      if (Redacted.value(databaseUrl)) {
        yield* pushDatabase(["--explain"]);
      }
      yield* run("railway", [
        "config",
        "apply",
        "--plan",
        "railway-plan.json",
        "--yes",
        ...(force ? ["--confirm-destructive"] : []),
      ]);
      databaseUrl = yield* extractDatabaseUrl(service);
      yield* pushDatabase().pipe(
        Effect.retry({
          times: 20,
          while: (error) => error._tag === "CommandFailed" && error.code === 1,
          schedule: Schedule.spaced("5 seconds").pipe(
            Schedule.tap(({ attempt }) =>
              Console.log(`Database push failed (attempt ${attempt}/20); retrying in 5 seconds...`),
            ),
          ),
        }),
      );
      if (domains) {
        yield* run("railway", ["domain", "--service", "web", "--json"]);
        const result = yield* railwayJson(
          ["domain", "--service", "web"],
          Schema.Struct({ domains: Schema.Array(Schema.String) }),
        );
        yield* fs.writeFileString(
          yield* Config.String("GITHUB_OUTPUT"),
          `domains-web=${result.domains[0] ?? "null"}\n`,
          { flag: "a" },
        );
      }
    }),
);

deploy.pipe(
  Command.run({ version: "1.0.0" }),
  Effect.catchTag("CommandFailed", (error) =>
    Console.error(`${error.command} (exit ${error.code})`).pipe(
      Effect.andThen(
        Effect.sync(() => {
          process.exitCode = error.code;
        }),
      ),
    ),
  ),
  Effect.provide(NodeServices.layer),
  NodeRuntime.runMain,
);
