# Replay Next.js Project 🚀

Este es un proyecto desarrollado con **Next.js 16** y **TypeScript**, totalmente dockerizado para garantizar un entorno de desarrollo consistente, portátil y aislado.

Utiliza una arquitectura de contenedores orquestada con **Docker Compose**, integrando la aplicación, la base de datos y herramientas de gestión.

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
* (Opcional) Node.js en local (solo para soporte de Intellisense en VS Code).

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

> **Nota:** El archivo `.env.example` ya viene con valores por defecto compatibles con Docker. Si necesitas cambiar contraseñas, hazlo en el archivo `.env`.

### 3. Levantar los Contenedores

Este comando descargará las imágenes e instalará las dependencias dentro del contenedor:

```bash
docker compose up -d --build

```

*La primera vez puede tardar unos minutos en construir la imagen y descargar todo.*

### 4. Sincronizar la Base de Datos

Al iniciar por primera vez, ejecuta este comando para crear las tablas:

```bash
docker compose exec app npx prisma db push

```

---

## 💻 Configuración para VS Code (Recomendado)

Para que VS Code tenga autocompletado y no muestre errores de TypeScript, instala las dependencias localmente (esto no afecta al contenedor de Docker):

```bash
# Instalar dependencias para el editor
pnpm install

# Generar los tipos de la base de datos
npx prisma generate

```

---

## 🌐 Acceso a los Servicios

Una vez levantado el entorno, tendrás acceso a:

| Servicio | URL | Credenciales (Por defecto) |
| --- | --- | --- |
| **Aplicación Web** | [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) | - |
| **PhpMyAdmin** | [http://localhost:8080](https://www.google.com/search?q=http://localhost:8080) | **User:** `root` <br>

<br> **Pass:** `root` |
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

* **`Dockerfile`**: Define la imagen de la aplicación (Node 22 Alpine + OpenSSL + pnpm).
* **`docker-compose.yml`**: Orquesta la App, MySQL y PhpMyAdmin.
* **`.env`**: Contiene secretos (no se sube al repositorio).

---

## 🚀 Despliegue en Producción (CI/CD)

El proyecto cuenta con un pipeline de **Integración y Despliegue Continuo (CI/CD)** totalmente automatizado utilizando **GitHub Actions** y **Azure**.

### Arquitectura de Despliegue
1.  **Push a Main:** Cada vez que se hace un `git push` a la rama `master/main`.
2.  **GitHub Actions:** Se dispara un workflow que:
    * Compila la aplicación Next.js optimizada para producción.
    * Construye la imagen Docker.
    * Sube la imagen al **Azure Container Registry (ACR)**.
3.  **Azure App Service:** Detecta la nueva imagen vía Webhook y actualiza el contenedor automáticamente.

### URLs de Producción
* **Web Pública:** [https://replay-david-web-axawbxenhxc5hhep.francecentral-01.azurewebsites.net/](https://replay-david-web-axawbxenhxc5hhep.francecentral-01.azurewebsites.net/)
* **Monitorización:** Azure Portal

---

## ☁️ Arquitectura Cloud (Azure for Students)

Debido a las limitaciones de créditos educativos, se ha optado por una arquitectura eficiente de costes:
* **App Service (Linux Plan B1):** Ejecución de contenedores Docker.
* **Azure Database for MySQL (Flexible Server):** Base de datos gestionada con backups automáticos.
* **Azure Container Registry:** Almacenamiento seguro de imágenes privadas.