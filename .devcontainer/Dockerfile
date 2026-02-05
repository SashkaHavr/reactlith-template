FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm
USER node

RUN npm install -g bun@1.3.3
ENV BUN_INSTALL_BIN=/home/node/.local/bin

RUN bun add -g opencode-ai
RUN bun add -g agent-browser
RUN chmod +x /home/node/.bun/install/global/node_modules/agent-browser/bin/agent-browser-linux-x64
RUN bunx skills add https://github.com/anthropics/skills -s frontend-design -a opencode -g --yes
RUN bunx skills add https://github.com/vercel-labs/agent-browser -s agent-browser -a opencode -g --yes
RUN bunx skills add https://github.com/vercel-labs/agent-skills -s vercel-composition-patterns -a opencode -g --yes