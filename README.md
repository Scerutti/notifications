# 📧 Notifications Microservice

> **Sistema de notificaciones asíncrono con soporte para Email y Telegram**  
> Desarrollado con NestJS, MongoDB, Redis y BullMQ

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🚀 Características

- ✅ **Notificaciones asíncronas** con BullMQ y Redis
- ✅ **Multi-canal**: Email (Resend) y Telegram
- ✅ **Configuración por usuario** de canales preferidos
- ✅ **Reintentos automáticos** con backoff exponencial
- ✅ **Health checks** completos del sistema
- ✅ **API REST** con documentación Swagger
- ✅ **Arquitectura limpia** con DDD y Clean Architecture
- ✅ **Dockerizado** y listo para producción
- ✅ **Logging detallado** para debugging

## 📋 Tabla de Contenidos

- [🚀 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [📚 API Endpoints](#-api-endpoints)
- [🔧 Variables de Entorno](#-variables-de-entorno)
- [🐳 Docker](#-docker)
- [🏗️ Arquitectura](#️-arquitectura)
- [📊 Monitoreo](#-monitoreo)
- [🛠️ Desarrollo](#️-desarrollo)

## 🚀 Instalación

### Prerrequisitos

- Node.js 20+
- MongoDB Atlas o MongoDB local
- Redis 7+
- npm o yarn

### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd notifications

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
npm run start:dev
```

### Instalación con Docker

```bash
# Clonar y ejecutar con Docker Compose
git clone <repository-url>
cd notifications

# Configurar .env
cp .env.example .env

# Ejecutar servicios
docker-compose up -d
```

## ⚙️ Configuración

### Variables de Entorno Requeridas

```env
# Base de datos
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/notifications

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=optional
REDIS_PASSWORD=optional

# Email (Resend)
RESEND_KEY=re_your_resend_api_key
MAIL_TO=destinatario@example.com
MAIL_FROM=noreply@tudominio.com

# Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Aplicación
PORT=8080
NODE_ENV=development
```

### Configuración de Servicios Externos

#### 📧 Resend (Email)
1. Crear cuenta en [Resend](https://resend.com/)
2. Obtener API key desde el dashboard
3. Configurar dominio verificado
4. Agregar `RESEND_KEY` y `MAIL_FROM` al .env

#### 📱 Telegram Bot
1. Crear bot con [@BotFather](https://t.me/botfather)
2. Obtener token del bot
3. Obtener tu Chat ID (usar [@userinfobot](https://t.me/userinfobot))
4. Agregar `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` al .env

## 📚 API Endpoints

### 🏥 Health Check

#### `GET /health`
Verifica el estado de todos los servicios del sistema.

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "app": "ok",
    "redis": "ok",
    "mongodb": "ok"
  },
  "queue": {
    "waiting": 0,
    "active": 0,
    "completed": 15,
    "failed": 1
  },
  "timestamp": "2025-01-10T01:53:41.000Z",
  "uptime": 3600.5,
  "version": "1.0.0"
}
```

---

### ⚙️ Configuración de Notificaciones

#### `POST /config/notifications`
Crea una nueva configuración de notificaciones para un usuario.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "channels": ["email", "telegram"],
  "enabled": true
}
```

**Response:**
```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "email": "usuario@example.com",
  "channels": ["email", "telegram"],
  "enabled": true,
  "createdAt": "2025-01-10T01:53:41.000Z",
  "updatedAt": "2025-01-10T01:53:41.000Z"
}
```

#### `PUT /config/notifications/:id`
Actualiza la configuración de notificaciones por ID.

**Request Body:**
```json
{
  "channels": ["email"],
  "enabled": false
}
```

#### `GET /config/notifications/by-email?email=usuario@example.com`
Obtiene la configuración de un usuario por email.

#### `GET /config/notifications/:id`
Obtiene la configuración por ID.

---

### 📧 Notificaciones

#### `POST /notifications?owner=usuario@example.com`
Envía una notificación a un usuario por los canales configurados.

**Query Parameters:**
- `owner` (string, required): Email del usuario configurado

**Request Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "message": "Hola, tienes una nueva notificación importante",
  "metadata": {
    "priority": "high",
    "category": "alert"
  }
}
```

**Response:**
```json
{
  "_id": "64a1b2c3d4e5f6789012345",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "message": "Hola, tienes una nueva notificación importante",
  "status": "PENDING",
  "channels": ["email", "telegram"],
  "retryCount": 0,
  "metadata": {
    "priority": "high",
    "category": "alert"
  },
  "createdAt": "2025-01-10T01:53:41.000Z",
  "updatedAt": "2025-01-10T01:53:41.000Z"
}
```

#### `GET /notifications`
Obtiene lista de notificaciones con filtros opcionales.

**Query Parameters:**
- `status` (string, optional): `PENDING`, `SENT`, `FAILED`
- `email` (string, optional): Búsqueda parcial por email
- `limit` (number, optional): Límite de resultados (default: 50)
- `offset` (number, optional): Offset para paginación (default: 0)

**Response:**
```json
{
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "message": "Hola, tienes una nueva notificación",
      "status": "SENT",
      "channels": ["email", "telegram"],
      "sentAt": "2025-01-10T01:53:45.000Z",
      "retryCount": 0,
      "createdAt": "2025-01-10T01:53:41.000Z",
      "updatedAt": "2025-01-10T01:53:45.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### `GET /notifications/stats`
Obtiene estadísticas de notificaciones.

**Response:**
```json
{
  "total": 150,
  "status": {
    "pending": 5,
    "sent": 140,
    "failed": 5
  },
  "channels": {
    "email": [
      { "_id": "SENT", "count": 120 },
      { "_id": "FAILED", "count": 3 }
    ],
    "telegram": [
      { "_id": "SENT", "count": 20 },
      { "_id": "FAILED", "count": 2 }
    ]
  },
  "recent": {
    "last24Hours": 12
  },
  "successRate": "93.33"
}
```

#### `GET /notifications/:id`
Obtiene una notificación específica por ID.

#### `GET /notifications/test-telegram`
Prueba la conexión con Telegram (para diagnóstico).

**Response:**
```json
{
  "success": true,
  "message": "Conexión con Telegram exitosa",
  "botInfo": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Mi Bot",
    "username": "mi_bot"
  },
  "timestamp": "2025-01-10T01:53:41.000Z"
}
```

## 🔧 Variables de Entorno

### Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `REDIS_HOST` | Host de Redis | `localhost` |
| `RESEND_KEY` | API Key de Resend | `re_1234567890abcdef` |
| `MAIL_TO` | Email destinatario | `notifications@example.com` |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram | `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `TELEGRAM_CHAT_ID` | Chat ID de Telegram | `123456789` |

### Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `REDIS_USERNAME` | Usuario de Redis | `undefined` |
| `REDIS_PASSWORD` | Contraseña de Redis | `undefined` |
| `MAIL_FROM` | Email remitente | `noreply@example.com` |
| `PORT` | Puerto de la aplicación | `8080` |
| `NODE_ENV` | Entorno de ejecución | `development` |

## 🐳 Docker

### Docker Compose (Recomendado)

```yaml
version: "3.9"

services:
  notifications-service:
    image: scerutti/notifications-service:latest
    build: .
    container_name: notifications-service
    ports:
      - "8080:8080"
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - redis

  redis:
    image: redis:7
    container_name: notifications-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --maxmemory-policy noeviction
```

### Comandos Docker

```bash
# Construir imagen
docker build -t notifications-service .

# Ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

## 🏗️ Arquitectura

### Clean Architecture + DDD

```
src/
├── domain/                    # 🏛️ DOMAIN LAYER
│   ├── entities/             # Entidades de negocio
│   ├── value-objects/        # Objetos de valor
│   ├── services/             # Servicios de dominio
│   └── repositories/         # Interfaces de repositorio
├── application/              # 🎮 APPLICATION LAYER
│   ├── use-cases/           # Casos de uso
│   ├── services/            # Servicios de aplicación
│   └── notification-application.service.ts
├── infrastructure/           # 🔧 INFRASTRUCTURE LAYER
│   ├── repositories/        # Implementaciones de repositorio
│   ├── schemas/             # Esquemas de MongoDB
│   ├── mailer.service.ts    # Servicio de email
│   └── telegram.service.ts  # Servicio de Telegram
└── presentation/            # 🌐 PRESENTATION LAYER
    ├── controllers/         # Controladores REST
    └── dto/                 # Data Transfer Objects
```

### Flujo de Notificaciones

```mermaid
graph TD
    A[Frontend] -->|POST /notifications| B[Controller]
    B --> C[Application Service]
    C --> D[Use Case]
    D --> E[Domain Service]
    E --> F[Repository]
    F --> G[MongoDB]
    D --> H[Queue Service]
    H --> I[BullMQ + Redis]
    I --> J[Processor]
    J --> K[Email Service]
    J --> L[Telegram Service]
    K --> M[Resend API]
    L --> N[Telegram API]
```

### Tecnologías

- **Framework**: NestJS con Fastify
- **Base de datos**: MongoDB con Mongoose
- **Cache/Queue**: Redis con BullMQ
- **Email**: Resend API
- **Telegram**: Telegram Bot API
- **Documentación**: Swagger/OpenAPI
- **Containerización**: Docker + Docker Compose

## 📊 Monitoreo

### Health Checks

El endpoint `/health` proporciona información detallada sobre:

- ✅ Estado de la aplicación
- ✅ Conectividad con MongoDB
- ✅ Conectividad con Redis
- ✅ Estadísticas de la cola de trabajos
- ✅ Tiempo de actividad
- ✅ Versión de la aplicación

### Logging

El sistema incluye logging detallado para:

- 📝 Creación de notificaciones
- 🚀 Encolado de trabajos
- 🔄 Procesamiento de trabajos
- ✅ Envío exitoso
- ❌ Errores y fallos
- 🔍 Variables de entorno (debug)

### Métricas Disponibles

- Total de notificaciones
- Notificaciones por estado (PENDING, SENT, FAILED)
- Notificaciones por canal (email, telegram)
- Notificaciones recientes (últimas 24h)
- Tasa de éxito
- Estadísticas de la cola

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod

# Build
npm run build

# Linting
npm run lint

# Tests
npm run test
```

### Estructura del Proyecto

```
notifications/
├── src/
│   ├── app.module.ts              # Módulo principal
│   ├── app.controller.ts          # Health controller
│   ├── main.ts                    # Punto de entrada
│   ├── notifications/             # Módulo de notificaciones
│   │   ├── domain/               # Capa de dominio
│   │   ├── application/          # Capa de aplicación
│   │   ├── infrastructure/       # Capa de infraestructura
│   │   ├── presentation/         # Capa de presentación
│   │   └── notifications.module.ts
│   └── notification-config/       # Módulo de configuración
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

### Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Sebastián Cerutti**
- GitHub: [@scerutti](https://github.com/scerutti)
- Email: softsys95@gmail.com

---

<div align="center">

**¡Construido con ❤️ usando NestJS!**

[⬆ Volver arriba](#-notifications-microservice)

</div>