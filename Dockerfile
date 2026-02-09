# Usamos Node 22 (Alpine) para coincidir con tu versión local
FROM node:22-alpine

# Instalamos pnpm globalmente
RUN npm install -g pnpm

# Instalamos OpenSSL y compatibilidad necesaria para Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat
# ---------------------------

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# 1. Copiamos solo los archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package.json pnpm-lock.yaml ./

# 2. Copiamos la carpeta prisma (necesaria para instalar dependencias y generar el cliente)
COPY prisma ./prisma/

# 3. Instalamos dependencias
# RUN pnpm install --frozen-lockfile
RUN pnpm install

# 4. Generamos el cliente de Prisma (OBLIGATORIO para que funcione en Linux)
RUN npx prisma generate

# 5. Copiamos el resto del código fuente
COPY . .

# --- CONSTRUIMOS LA APP PARA PRODUCCIÓN ---
# Esto crea la versión optimizada y super rápida de Next.js
RUN pnpm run build

# Exponemos el puerto
EXPOSE 3000

# --- COMANDO POR DEFECTO ---
# En Azure arrancará en modo producción.
# En local, tu docker-compose ignorará esto y usará "dev" (gracias a tu override).
CMD ["pnpm", "start"]