import { NodeRuntime, NodeServices } from "@effect/platform-node";
import {
  Config,
  Console,
  Data,
  Effect,
  FileSystem,
  Record,
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

const railway = (args: ReadonlyArray<string>, options: ChildProcess.CommandOptions = {}) =>
  run("railway", args, {
    ...options,
    // railway/iac uses $_ to locate the CLI for its minimum-version check.
    env: { ...options.env, _: "railway" },
    extendEnv: true,
  });

function railwayJson<A, R>(args: ReadonlyArray<string>, schema: Schema.ConstraintDecoder<A, R>) {
  return railway([...args, "--json"], { stdout: "pipe" }).pipe(
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
    preview: Flag.Boolean("preview"),
    service: Flag.String("service").pipe(Flag.withDefault("db")),
  },
  ({ preview, service }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      let databaseUrl = yield* extractDatabaseUrl(service);
      const pushDatabase = (args: ReadonlyArray<string> = []) =>
        run("vpr", ["db#push", ...args], {
          env: { DATABASE_URL: databaseUrl },
          extendEnv: true,
        });

      yield* railway(["config", "plan", "--out", "railway-plan.json"]);
      if (!preview) {
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
      yield* railway([
        "config",
        "apply",
        "--plan",
        "railway-plan.json",
        "--yes",
        ...(preview ? ["--confirm-destructive"] : []),
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
      if (preview) {
        yield* railway(["domain", "--service", "web", "--json"]);
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
      const { resources } = yield* railwayJson(
        ["config", "pull"],
        Schema.Struct({
          resources: Schema.Array(
            Schema.Struct({
              address: Schema.String,
              variables: Schema.Record(Schema.String, Schema.Unknown).pipe(
                Schema.NullOr,
                Schema.optional,
              ),
            }),
          ),
        }),
      );
      const requiredVariables = {
        web: [
          "PUBLIC_URL",
          "BETTER_AUTH_ALLOWED_HOSTS",
          "BETTER_AUTH_SECRET",
          "DATABASE_URL",
          "GOOGLE_CLIENT_ID",
          "GOOGLE_CLIENT_SECRET",
          "GOOGLE_EMULATE_URL",
        ],
        "drizzle-gateway": ["MASTERPASS"],
      };
      const missing: Array<string> = [];
      for (const [service, names] of Record.toEntries(requiredVariables)) {
        const variables = resources.find(
          (resource) => resource.address === `service.${service}`,
        )?.variables;
        for (const name of names) {
          const value = variables?.[name];
          if (value !== null && value !== undefined && value !== "") {
            continue;
          }
          if (preview) {
            const envName = `PREVIEW_${service.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_${name}`;
            const fallback = yield* Config.Redacted(envName).pipe(
              Config.withDefault(Redacted.make("")),
            );
            if (Redacted.value(fallback)) {
              yield* railway(["variables", "set", name, "--service", service, "--stdin"], {
                stdin: Stream.succeed(Redacted.value(fallback)).pipe(Stream.encodeText),
              });
              continue;
            }
          }
          missing.push(`${service}.${name}`);
        }
      }
      if (missing.length > 0) {
        return yield* new CommandFailed({
          command: `Missing required Railway variables: ${missing.join(", ")}`,
          code: 1,
        });
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
