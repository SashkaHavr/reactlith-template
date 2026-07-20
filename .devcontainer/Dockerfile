FROM ghcr.io/voidzero-dev/vite-plus:0.2.5 AS build-extensions

COPY --chown=vp:vp proxy-links /extensions/proxy-links
WORKDIR /extensions/proxy-links
RUN vpx @vscode/vsce package --no-dependencies --out /extensions/proxy-links/proxy-links.vsix

FROM mcr.microsoft.com/devcontainers/base:debian

RUN apt-get update
RUN apt-get install -y --no-install-recommends build-essential python3 pkg-config

USER vscode

COPY --from=build-extensions /extensions/proxy-links/proxy-links.vsix /extensions/proxy-links/

RUN curl -fsSL https://vite.plus | VP_VERSION="0.2.5" bash
ENV VP_HOME="/home/vscode/.vite-plus"
ENV PATH="/home/vscode/.vite-plus/bin:$PATH"

RUN vp add -g opencode-ai
