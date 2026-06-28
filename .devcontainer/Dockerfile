FROM mcr.microsoft.com/devcontainers/base:debian

USER vscode

RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL="/home/vscode/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

RUN curl -o- https://fnm.vercel.app/install | bash
ENV FNM_PATH="/home/vscode/.local/share/fnm"
ENV PATH="$FNM_PATH:$PATH"

RUN fnm install 26

RUN bun add -g opencode-ai

RUN git clone https://github.com/Effect-TS/effect-smol.git /home/vscode/references/effect-smol
