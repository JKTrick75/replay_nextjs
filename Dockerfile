# Usamos Node 22 (Alpine) para coincidir con tu versión local
FROM node:22-alpine

# Instalamos pnpm globalmente
RUN npm install -g pnpm

# --- LÍNEA NUEVA AÑADIDA ---
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

# Exponemos el puerto
EXPOSE 3000

# Comando para desarrollo con TurboPack (por defecto en Next 16 si usas --turbo, o normal)
CMD ["pnpm", "dev"]