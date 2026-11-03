FROM ghcr.io/voidzero-dev/vite-plus:1.4.0 AS build-extensions

COPY --chown=vp:vp .devcontainer/proxy-links /app
WORKDIR /app
RUN vpx @vscode/vsce@3 package --no-dependencies --out /app/proxy-links.vsix

FROM ghcr.io/voidzero-dev/vite-plus:1.4.0

COPY --from=build-extensions /app/proxy-links.vsix /extensions/proxy-links/

RUN sudo apt-get update \
 && sudo apt-get install -y --no-install-recommends \
      jq \
 && sudo rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://pkg.lightpanda.io/install.sh | bash -s "1.0.2"

ENV pnpm_config_store_dir=/home/vp/.local/share/pnpm/store

WORKDIR /home/vp/reactlith-template
COPY --chown=vp:vp package.json ./
RUN vp env install

RUN vp add -g --allow-build=@opencode/cli @opencode/cli@2
RUN vp add -g @railway/cli@5

ENV AGENT_BROWSER_ENGINE=lightpanda
RUN vp add -g agent-browser
