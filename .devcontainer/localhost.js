import { userInfo } from "node:os";
import path from "node:path";

if (userInfo().username !== "vscode") process.exit(0);

const serviceName = path.basename(process.cwd());
const packageJson = await Bun.file(path.join(process.cwd(), "package.json")).json();
const isDrizzleStudio = packageJson.scripts?.studio?.includes("drizzle-kit studio") ?? false;
const compose = await Bun.file(new URL("docker-compose.yaml", import.meta.url)).text();
const routerPattern = /traefik\.http\.routers\.([^.]+)\.rule=Host\(`([^`]+)`\)/g;
const router = [...compose.matchAll(routerPattern)].find((match) =>
  match[1]?.endsWith(`-${serviceName}`),
);
const host = router?.[2];

if (host === undefined) {
  console.error(`No localhost route found for ${serviceName}`);
  process.exit(1);
}

const link = isDrizzleStudio
  ? `https://local.drizzle.studio/?port=80&host=${host}`
  : `http://${host}`;
const frame = `+${"-".repeat(link.length + 2)}+`;
const indentation = " ".repeat(
  Math.max(0, Math.floor(((process.stdout.columns ?? 80) - frame.length) / 2)),
);
const bold = "\u001B[1m";
const blue = "\u001B[34m";
const defaultColor = "\u001B[39m";
const reset = "\u001B[0m";

console.log(
  `${indentation}${bold}${frame}\n` +
    `${indentation}| ${blue}${link}${defaultColor} |\n` +
    `${indentation}${frame}${reset}`,
);
