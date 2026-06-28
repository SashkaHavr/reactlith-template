const fs = require("node:fs");
const path = require("node:path");
const vscode = require("vscode");

const localhostUrlPattern =
  /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)(?:\/[^\s\])>'"]*)?/g;

function activate(context) {
  context.subscriptions.push(
    vscode.window.registerTerminalLinkProvider({
      provideTerminalLinks(context) {
        const mappings = getComposeMappings();
        if (mappings.size === 0) return [];

        const links = [];
        const line = context.line;

        for (const match of line.matchAll(localhostUrlPattern)) {
          const port = match[1];
          const host = mappings.get(port);

          if (host === undefined || match.index === undefined) continue;

          const originalUrl = match[0];
          const forwardedUrl = originalUrl.replace(
            /^(https?:)\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+/,
            `$1//${host}`,
          );

          links.push({
            startIndex: match.index,
            length: originalUrl.length,
            tooltip: `Open ${forwardedUrl}`,
            forwardedUrl,
          });
        }

        return links;
      },
      handleTerminalLink(link) {
        vscode.env.openExternal(vscode.Uri.parse(link.forwardedUrl));
      },
    }),
  );
}

function getComposeMappings() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder === undefined) return new Map();

  const composePath = path.join(workspaceFolder.uri.fsPath, ".devcontainer", "docker-compose.yaml");
  let compose;

  try {
    compose = fs.readFileSync(composePath, "utf8");
  } catch {
    return new Map();
  }

  const routers = new Map();
  const services = new Map();

  for (const line of compose.split(/\r?\n/)) {
    const routerMatch = line.match(/traefik\.http\.routers\.([^.]+)\.rule=Host\(`([^`]+)`\)/);
    if (routerMatch) {
      routers.set(routerMatch[1], routerMatch[2]);
      continue;
    }

    const serviceMatch = line.match(/traefik\.http\.routers\.([^.]+)\.service=([^\s]+)/);
    if (serviceMatch) {
      services.set(serviceMatch[2], { router: serviceMatch[1] });
      continue;
    }

    const portMatch = line.match(
      /traefik\.http\.services\.([^.]+)\.loadbalancer\.server\.port=(\d+)/,
    );
    if (portMatch) {
      services.set(portMatch[1], { ...services.get(portMatch[1]), port: portMatch[2] });
    }
  }

  const mappings = new Map();
  for (const service of services.values()) {
    const host = routers.get(service.router);
    if (service.port !== undefined && host !== undefined) mappings.set(service.port, host);
  }

  return mappings;
}

function deactivate() {}

module.exports = { activate, deactivate };
