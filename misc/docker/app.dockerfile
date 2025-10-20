# ---- Builder Stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Make sure build-time env vars are available
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the app with env vars injected
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs


# Expose the port Next.js listens on
EXPOSE 3000

# Run Next.js in production
CMD ["npm", "start"]
