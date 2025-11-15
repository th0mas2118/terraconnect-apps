# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lockb* ./

# Installer les dépendances
RUN bun install --frozen-lockfile

# Copier le code source
COPY . .

# Builder l'application TypeScript
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json bun.lockb* ./

# Installer uniquement les dépendances de production
RUN bun install --production --frozen-lockfile

# Copier les fichiers buildés depuis le builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Démarrer l'application
CMD ["bun", "run", "start"]
