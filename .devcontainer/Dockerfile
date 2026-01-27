FROM mcr.microsoft.com/devcontainers/javascript-node:24-bookworm
USER node
RUN echo "node:node" | sudo chpasswd

RUN npm install -g bun@1.3.3

ENV BUN_INSTALL_BIN=/home/node/.local/bin

RUN bun add -g opencode-ai
RUN bun add -g agent-browser
RUN bunx skills add https://github.com/anthropics/skills -s frontend-design -a opencode -g --yes
RUN bunx skills add https://github.com/vercel-labs/agent-browser -s agent-browser -a opencode -g --yes
RUN bunx skills add https://github.com/vercel-labs/agent-skills -s vercel-composition-patterns -a opencode -g --yes
