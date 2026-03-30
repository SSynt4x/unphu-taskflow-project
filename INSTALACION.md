# 🎓 UNPHU TaskFlow - Guía de Instalación y Despliegue

## 📋 Descripción del Proyecto

Sistema de gestión de tareas personales para estudiantes de la Universidad Nacional Pedro Henríquez Ureña (UNPHU). Incluye:
- ✅ Registro e inicio de sesión con JWT
- ✅ CRUD de tareas con fecha y hora
- ✅ Estados: Pendiente, Completada, No Finalizada
- ✅ Dashboard con estadísticas y actividad reciente
- ✅ Historial con descarga en PDF
- ✅ Planes futuros para metas académicas
- ✅ Sistema de gamificación con puntos y rangos
- ✅ Modo oscuro/claro

## 🛠️ Requisitos Previos

### Software Necesario:
- **Node.js** v18 o superior
- **Python** 3.10 o superior
- **MongoDB** 4.4 o superior
- **Yarn** (gestor de paquetes)

### Instalación de Requisitos:

#### En Windows:
```bash
# Instalar Node.js desde https://nodejs.org
# Instalar Python desde https://python.org
# Instalar MongoDB desde https://mongodb.com/try/download/community

# Instalar Yarn
npm install -g yarn
```

#### En macOS:
```bash
brew install node python mongodb-community yarn
brew services start mongodb-community
```

#### En Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip mongodb
sudo npm install -g yarn
sudo systemctl start mongodb
```

## 📦 Instalación del Proyecto

### 1. Extraer el archivo ZIP
```bash
unzip unphu-taskflow.zip
cd unphu-taskflow
```

### 2. Configurar el Backend
```bash
cd backend

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 3. Configurar Variables de Entorno del Backend
Editar el archivo `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=unphu_taskflow
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=tu-clave-secreta-aqui-cambiar-en-produccion
```

### 4. Configurar el Frontend
```bash
cd ../frontend

# Instalar dependencias
yarn install
```

### 5. Configurar Variables de Entorno del Frontend
Editar el archivo `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🚀 Ejecutar la Aplicación

### Opción 1: Ejecución Manual (Desarrollo)

**Terminal 1 - Backend:**
```bash
cd backend
# Activar entorno virtual si no está activo
source venv/bin/activate  # o venv\Scripts\activate en Windows

# Iniciar servidor
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001/api

### Opción 2: Usando Scripts (Recomendado)

Crear un archivo `start.sh` (macOS/Linux) o `start.bat` (Windows):

**start.sh:**
```bash
#!/bin/bash
# Iniciar MongoDB si no está corriendo
mongod --fork --logpath /var/log/mongodb.log

# Iniciar Backend
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 &

# Iniciar Frontend
cd ../frontend
yarn start
```

**start.bat (Windows):**
```batch
@echo off
start cmd /k "cd backend && venv\Scripts\activate && uvicorn server:app --host 0.0.0.0 --port 8001"
start cmd /k "cd frontend && yarn start"
```

## 🌐 Despliegue en Producción

### Opción 1: VPS/Servidor Dedicado

1. **Configurar Nginx como proxy inverso:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /var/www/unphu-taskflow/frontend/build;
        try_files $uri /index.html;
    }
}
```

2. **Construir el frontend:**
```bash
cd frontend
yarn build
```

3. **Usar PM2 para el backend:**
```bash
npm install -g pm2
cd backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name unphu-backend
pm2 save
pm2 startup
```

### Opción 2: Heroku

1. Crear `Procfile` en la raíz:
```
web: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```

2. Desplegar:
```bash
heroku create tu-app-unphu
heroku addons:create mongolab:sandbox
git push heroku main
```

### Opción 3: Docker

Crear `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=unphu_taskflow
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    depends_on:
      - backend

volumes:
  mongo_data:
```

Ejecutar:
```bash
docker-compose up -d
```

## 🎮 Sistema de Gamificación

| Rango | Puntos Mínimos | Color |
|-------|----------------|-------|
| Procrastinador | 0 | Gris |
| Freshman | 100 | Verde |
| Sophomore | 300 | Azul |
| Business Man | 600 | Morado |
| Soldier | 1000 | Dorado |

**Puntos otorgados:**
- Completar una tarea: +10 puntos

## 📱 Uso Sin Conexión

La aplicación almacena datos en `localStorage` para funcionar sin internet:
- Tareas, planes y actividades se cachean localmente
- Los datos se sincronizan cuando hay conexión

## 🔧 Solución de Problemas

### Error: "MongoDB connection failed"
- Verificar que MongoDB esté corriendo: `mongod --version`
- Verificar la URL en `backend/.env`

### Error: "CORS policy"
- Agregar tu dominio a `CORS_ORIGINS` en `backend/.env`

### Error: "Module not found"
- Ejecutar `pip install -r requirements.txt` en backend
- Ejecutar `yarn install` en frontend

## 📞 Soporte

Para soporte técnico, contactar:
- Email: soporte@unphu.edu.do
- Documentación API: http://localhost:8001/docs

---

**Desarrollado para UNPHU - Universidad Nacional Pedro Henríquez Ureña**
