FROM ghcr.io/voidzero-dev/vite-plus:latest AS build-extensions

COPY proxy-links /app
WORKDIR /app
RUN vpx @vscode/vsce@3 package --no-dependencies --out /app/proxy-links.vsix

FROM ghcr.io/voidzero-dev/vite-plus:latest

COPY --from=build-extensions /app/proxy-links.vsix /extensions/proxy-links/

RUN vp add -g --allow-build=@opencode/cli @opencode/cli@2
RUN vp add -g @railway/cli@5
