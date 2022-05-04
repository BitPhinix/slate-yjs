### BASE ###
FROM node:gallium-buster-slim AS base

RUN apt-get update && apt-get install --no-install-recommends --yes openssl

WORKDIR /app

# Install production dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/

COPY packages/core/package.json ./packages/core/
COPY examples/backend/package.json ./examples/backend/

RUN yarn workspaces focus @slate-yjs/example-backend --production

### BUILDER ###
FROM base AS builder

# Install all dependencies
RUN yarn workspaces focus @slate-yjs/example-backend

# Copy source files
COPY config/ ./config/
COPY packages/core/ ./packages/core/
COPY examples/backend/ ./examples/backend/

# Build
RUN yarn build

### RUNNER ###
FROM base

# Copy runtime dependencies
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/examples/backend/dist ./examples/backend/dist

USER node

WORKDIR /app/examples/backend

CMD ["yarn", "run", "start"]
