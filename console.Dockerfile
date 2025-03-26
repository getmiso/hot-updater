FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder

WORKDIR /app

COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm --filter @hot-updater/console add @hot-updater/postgres@0.12.7

RUN echo "import { postgres } from '@hot-updater/postgres'; \n\
export default { \n\
  database: postgres({ \n\
    host: process.env.HOT_UPDATER_POSTGRES_HOST, \n\
    port: process.env.HOT_UPDATER_POSTGRES_PORT, \n\
    user: process.env.HOT_UPDATER_POSTGRES_USER, \n\
    password: process.env.HOT_UPDATER_POSTGRES_PASSWORD, \n\
    database: process.env.HOT_UPDATER_POSTGRES_DATABASE, \n\
  }), \n\
};" > packages/console/hot-updater.config.js

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "--filter", "@hot-updater/console", "run", "dev", "--host"]