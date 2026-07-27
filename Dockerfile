# Optional: for platforms that deploy via Dockerfile (Railway, Fly.io, etc.)
# instead of a native Node buildpack. Render's native `runtime: node`
# (see render.yaml) doesn't need this file at all.
#
# Runs as a non-root user deliberately: the Claude Agent SDK refuses
# permissionMode 'bypassPermissions' when the process is running as root,
# as a safety guard. Most buildpack-based hosts (Render, Heroku-style)
# already run your app as non-root; plain `docker run` defaults to root
# unless told otherwise, which is what this Dockerfile fixes.

FROM node:20-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev
COPY . .
RUN mkdir -p output/web && chown -R node:node /app

# Optional, for in-container visual QA previews (skipped gracefully if
# absent — see .claude/skills/deck-sop/SKILL.md headless workflow):
#   RUN apt-get update && apt-get install -y --no-install-recommends \
#       libreoffice poppler-utils && rm -rf /var/lib/apt/lists/*

USER node
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
