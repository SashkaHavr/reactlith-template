FROM ghcr.io/voidzero-dev/vite-plus AS build-extensions

COPY --chown=vp:vp proxy-links /extensions/proxy-links
WORKDIR /extensions/proxy-links
RUN vpx @vscode/vsce package --no-dependencies --out /extensions/proxy-links/proxy-links.vsix

FROM mcr.microsoft.com/devcontainers/base:debian

RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential python3 pkg-config

USER vscode

RUN curl -fsSL https://vite.plus | bash
ENV VP_HOME="/home/vscode/.vite-plus"
ENV PATH="/home/vscode/.vite-plus/bin:$PATH"

RUN vp add -g opencode-ai

RUN git clone https://github.com/Effect-TS/effect-smol.git /home/vscode/references/effect-smol

COPY --from=build-extensions /extensions/proxy-links/proxy-links.vsix /extensions/proxy-links/
