FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm run build

RUN groupadd -g 1001 miso && useradd -u 1001 -g miso -s /bin/sh -m miso

USER 1001

EXPOSE 3000

CMD ["pnpm", "--filter", "@hot-updater/postgres", "run", "dev", "--host"]