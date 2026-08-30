# Plain Node image + explicit `playwright install`, instead of the
# pre-baked mcr.microsoft.com/playwright image. This guarantees the browser
# binaries always match whatever "playwright" version npm actually resolves
# from package.json — no more manually keeping a base-image tag in sync with
# a package.json version by hand (that's what caused the previous
# "Executable doesn't exist... Playwright was just updated" crash).
FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN npm install

# Installs Chromium + all required OS-level libraries (fonts, codecs, etc)
# for whatever Playwright version was just installed above.
RUN npx playwright install --with-deps chromium

COPY server.ts ./
COPY tsconfig.json ./

# tsx runs the TypeScript file directly — no separate build step needed.
RUN npm install -g tsx

EXPOSE 8787
CMD ["tsx", "server.ts"]
