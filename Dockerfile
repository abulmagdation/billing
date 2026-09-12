# Build the Vite website; no secrets are required during this stage.
FROM node:22-bookworm-slim AS website-build
WORKDIR /build/website
COPY website/package.json website/package-lock.json ./
RUN npm ci
COPY website/index.html website/vite.config.js ./
COPY website/src ./src
RUN npm run build

# One Cloud Run service serves both /api and the production React website.
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server/server.js server/hosting.js ./
COPY --from=website-build --chown=node:node /build/website/dist /app/website/dist
USER node
EXPOSE 8080
CMD ["node", "server.js"]
