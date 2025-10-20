# ---- Builder Stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build the app
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json & lockfile for npm start
COPY package*.json ./

# Copy built Next.js output
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Copy node_modules from builder (needed for runtime)
COPY --from=builder /app/node_modules ./node_modules

# Expose the port Next.js listens on
EXPOSE 3000

# Run Next.js in production
CMD ["npm", "start"]
