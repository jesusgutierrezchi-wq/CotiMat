FROM node:20-slim

# Debian (glibc) evita el problema de detección de OpenSSL del motor de Prisma en
# imágenes Alpine/musl. Se instala openssl explícitamente igual, por si acaso.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "dev"]
