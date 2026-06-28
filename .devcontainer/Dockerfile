FROM mcr.microsoft.com/devcontainers/base:bookworm

USER vscode

RUN curl -fsSL https://bun.sh/install | bash
RUN curl -o- https://fnm.vercel.app/install | bash
ENV FNM_PATH="/home/vscode/.local/share/fnm"
ENV PATH="$FNM_PATH:$PATH"
RUN fnm install 24
