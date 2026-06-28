FROM oven/bun:1.3.11-alpine AS build-extensions

COPY --chown=vscode:vscode proxy-links /extensions/proxy-links
WORKDIR /extensions/proxy-links
RUN bunx --bun @vscode/vsce package --no-dependencies --out /extensions/proxy-links/proxy-links.vsix

FROM mcr.microsoft.com/devcontainers/base:debian

USER vscode

RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/home/vscode/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

RUN curl -o- https://fnm.vercel.app/install | bash
ENV FNM_PATH="/home/vscode/.local/share/fnm"
ENV PATH="$FNM_PATH:$PATH"

RUN fnm install 26

COPY --from=build-extensions /extensions/proxy-links/proxy-links.vsix /extensions/proxy-links/

RUN bun add -g opencode-ai

RUN git clone https://github.com/Effect-TS/effect-smol.git /home/vscode/references/effect-smol
