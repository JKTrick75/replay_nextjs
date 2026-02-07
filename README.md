# Replay Next.js Project 🚀

Este es un proyecto desarrollado con **Next.js 16** y **TypeScript**, totalmente dockerizado para garantizar un entorno de desarrollo consistente, portátil y aislado.

Utiliza una arquitectura de contenedores orquestada con **Docker Compose**, integrando la aplicación, la base de datos y herramientas de gestión sin necesidad de instalar dependencias complejas en tu máquina local.

## 🛠️ Stack Tecnológico

* **Framework:** Next.js 16 (App Router)
* **Lenguaje:** TypeScript
* **Base de Datos:** MySQL 8.0
* **ORM:** Prisma
* **Estilos:** Tailwind CSS
* **Autenticación:** NextAuth.js (v5 Beta)
* **Infraestructura:** Docker & Docker Compose
* **Entorno recomendado:** WSL 2 (Windows Subsystem for Linux) o Linux nativo.

## 📋 Requisitos Previos

Asegúrate de tener instalado:

* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (con integración WSL 2 si usas Windows).
* Git.

> **Nota:** No es necesario tener Node.js ni MySQL instalados en tu máquina local. Docker se encarga de todo.

---

## 🚀 Instalación y Despliegue (Quick Start)

Sigue estos pasos para levantar el entorno de desarrollo desde cero:

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd replay_nextjs

```

### 2. Configurar Variables de Entorno

El proyecto utiliza variables de entorno para configurar la conexión a la base de datos dentro de Docker de forma segura.

Crea el archivo `.env` basándote en el ejemplo:

```bash
cp .env.example .env

```

> **Nota:** El archivo `.env.example` ya viene con valores por defecto compatibles con la configuración de `docker-compose.yml`. Si necesitas cambiar contraseñas, hazlo en el archivo `.env` recién creado.

### 3. Levantar los Contenedores

Este comando descargará las imágenes, instalará las dependencias (`node_modules`) dentro del contenedor y levantará los servicios:

```bash
docker compose up -d --build

```

*La primera vez puede tardar unos minutos en construir la imagen y descargar todo.*

### 4. Sincronizar la Base de Datos

Al iniciar por primera vez, la base de datos estará vacía. Ejecuta este comando para crear las tablas definidas en el esquema de Prisma:

```bash
docker compose exec app npx prisma db push

```

*(Opcional) Si dispones de un script de seed, puedes poblar la base de datos:*

```bash
# Ejemplo:
# docker compose exec app npm run seed

```

---

## 🌐 Acceso a los Servicios

Una vez levantado el entorno, tendrás acceso a:

| Servicio | URL | Credenciales (Por defecto) |
| --- | --- | --- |
| **Aplicación Web** | [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) | - |
| **PhpMyAdmin** | [http://localhost:8080](https://www.google.com/search?q=http://localhost:8080) | **User:** root / **Pass:** root |
| **MySQL (Interno)** | `db:3306` | Accesible solo desde la red de Docker |

---

## 🐳 Comandos Útiles de Docker

Aquí tienes una lista de comandos frecuentes para gestionar el entorno:

**Detener el entorno (sin borrar datos):**

```bash
docker compose stop

```

**Detener y borrar contenedores (los datos persisten en el volumen):**

```bash
docker compose down

```

**Ver logs en tiempo real:**

```bash
docker compose logs -f

```

**Entrar a la terminal del contenedor de la App:**

```bash
docker compose exec app sh

```

**Regenerar el cliente de Prisma (si cambias el schema):**

```bash
docker compose exec app npx prisma generate

```

---

## 📂 Estructura del Entorno

* **`Dockerfile`**: Define la imagen de la aplicación (Node 22 Alpine + OpenSSL + pnpm/npm).
* **`docker-compose.yml`**: Orquesta los 3 servicios:
* `app`: Next.js (con Hot Reload configurado mediante volúmenes).
* `db`: MySQL 8.0 con volumen persistente (`mysql_data`).
* `phpmyadmin`: Interfaz visual para gestionar la BD.


* **`.env`**: Contiene secretos y configuración de entorno (no se sube al repositorio).

```

```