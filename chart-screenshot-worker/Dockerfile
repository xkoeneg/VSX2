# Official Playwright image already has Chromium + every system dependency
# it needs pre-installed — far more reliable on Railway/Render than trying
# to `npx playwright install --with-deps` on a generic node:20 image.
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package.json ./
RUN npm install

COPY server.ts ./
COPY tsconfig.json ./

# tsx runs the TypeScript file directly — no separate build step needed.
RUN npm install -g tsx

EXPOSE 8787
CMD ["tsx", "server.ts"]
