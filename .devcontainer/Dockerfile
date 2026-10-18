FROM ghcr.io/voidzero-dev/vite-plus:1.3.0 AS build-extensions

COPY --chown=vp:vp .devcontainer/proxy-links /app
WORKDIR /app
RUN vpx @vscode/vsce@3 package --no-dependencies --out /app/proxy-links.vsix

FROM ghcr.io/voidzero-dev/vite-plus:1.3.0

COPY --from=build-extensions /app/proxy-links.vsix /extensions/proxy-links/

WORKDIR /home/vp/reactlith-template
COPY --chown=vp:vp package.json ./
RUN vp env install

RUN vp add -g --allow-build=@opencode/cli @opencode/cli@2
RUN vp add -g @railway/cli@5
