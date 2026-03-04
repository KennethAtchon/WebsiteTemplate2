# Stage 1: Build
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Define arguments for environment variables needed at build time
ARG APP_ENV
ARG ADMIN_SPECIAL_CODE_HASH
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_BASE_URL
ARG ENCRYPTION_KEY
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG FIREBASE_CLIENT_EMAIL
ARG FIREBASE_PRIVATE_KEY
ARG REDIS_URL
ARG R2_ACCOUNT_ID
ARG R2_ACCESS_KEY_ID
ARG R2_SECRET_ACCESS_KEY
ARG R2_BUCKET_NAME
ARG R2_PUBLIC_URL
ARG R2_ENABLED
ARG RESEND_API_KEY
ARG DATABASE_URL
ARG NEXT_PUBLIC_DEBUG
ARG NEXT_PUBLIC_LOG_LEVEL
ARG CSRF_SECRET

# Set environment variables for the build
ENV APP_ENV=$APP_ENV
ENV ADMIN_SPECIAL_CODE_HASH=$ADMIN_SPECIAL_CODE_HASH
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV ENCRYPTION_KEY=$ENCRYPTION_KEY
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL
ENV FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY
ENV REDIS_URL=$REDIS_URL
ENV R2_ACCOUNT_ID=$R2_ACCOUNT_ID
ENV R2_ACCESS_KEY_ID=$R2_ACCESS_KEY_ID
ENV R2_SECRET_ACCESS_KEY=$R2_SECRET_ACCESS_KEY
ENV R2_BUCKET_NAME=$R2_BUCKET_NAME
ENV R2_PUBLIC_URL=$R2_PUBLIC_URL
ENV R2_ENABLED=$R2_ENABLED
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_DEBUG=$NEXT_PUBLIC_DEBUG
ENV CSRF_SECRET=$CSRF_SECRET

# Generate Prisma Client
RUN bunx prisma generate --schema=./infrastructure/database/prisma/schema.prisma

# Build the Next.js app
RUN bun run build

# Stage 2: Production
FROM oven/bun:1-alpine

WORKDIR /app

# Runtime dependencies including timezone data
RUN apk add --no-cache libc6-compat tzdata

# Copy package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Install production dependencies
RUN bun install --frozen-lockfile --production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/infrastructure/database/lib/generated/prisma ./infrastructure/database/lib/generated/prisma
COPY --from=builder /app/infrastructure/database/prisma ./infrastructure/database/prisma

# Expose port
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "bunx prisma migrate deploy --schema=./infrastructure/database/prisma/schema.prisma && bun start"]
