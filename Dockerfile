FROM node:20-bookworm

# Install Python runtime for server-side execution and per-user venvs
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv python3-pip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./
RUN npm install

# Copy Prisma schema for Prisma client generation caching
COPY prisma ./prisma
RUN npm run prisma:generate

# Copy rest of the application
COPY . .

# Build with Next.js caching enabled
# Next.js will cache .next directory between builds if it exists
RUN npm run build

EXPOSE 3000

CMD ["npm","run","start"]
