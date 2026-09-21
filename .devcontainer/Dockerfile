FROM oven/bun:1.4.2-slim AS build-extensions

COPY proxy-links /extensions/proxy-links
WORKDIR /extensions/proxy-links
RUN bunx @vscode/vsce@3 package --no-dependencies --out /extensions/proxy-links/proxy-links.vsix

FROM mcr.microsoft.com/devcontainers/base:debian

RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential python3 pkg-config

USER vscode

COPY --from=build-extensions /extensions/proxy-links/proxy-links.vsix /extensions/proxy-links/

RUN curl -o- https://fnm.vercel.app/install | bash
ENV FNM_PATH="/home/vscode/.local/share/fnm"
ENV PATH="$FNM_PATH:$PATH"
RUN fnm install 26

RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.2"
ENV BUN_INSTALL="/home/vscode/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

RUN bun add -g opencode-ai@1
RUN bun add -g @railway/cli@5
