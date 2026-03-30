# Guía de Despliegue - TaskFlow Lite UNPHU

## Opción 1: Railway (Más Fácil - Recomendado)

Railway es una plataforma en la nube que permite desplegar aplicaciones full-stack con un solo clic.

### Pasos:

1. **Crea una cuenta** en https://railway.app (puedes usar tu GitHub)

2. **Sube tu código a GitHub:**
   - Crea un repositorio nuevo en https://github.com/new
   - Sube los archivos del proyecto (backend/ y frontend/)

3. **Desplegar el Backend:**
   - En Railway, haz clic en "New Project" > "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Configura el servicio como "Backend":
     - Root Directory: `backend`
     - Start Command: `uvicorn server:app --host 0.0.0.0 --port 8001`
   - Agrega las variables de entorno:
     - `MONGO_URL`: Tu cadena de conexión de MongoDB Atlas (ver paso 5)
     - `DB_NAME`: `taskflow_db`
     - `SECRET_KEY`: Una cadena secreta cualquiera (ej: `mi-clave-secreta-2024`)
   - Railway le asignará una URL pública (ej: `https://tu-backend.up.railway.app`)

4. **Desplegar el Frontend:**
   - Agrega otro servicio al mismo proyecto: "New" > "GitHub Repo" (mismo repo)
   - Root Directory: `frontend`
   - Build Command: `yarn install && yarn build`
   - Start Command: `npx serve -s build -l 3000`
   - Variables de entorno:
     - `REACT_APP_BACKEND_URL`: La URL del backend de Railway (del paso 3)

5. **Base de Datos MongoDB Atlas (Gratis):**
   - Ve a https://www.mongodb.com/atlas y crea una cuenta
   - Crea un cluster gratuito (M0 Free Tier)
   - En "Database Access", crea un usuario con contraseña
   - En "Network Access", permite acceso desde cualquier IP (0.0.0.0/0)
   - Copia la cadena de conexión: `mongodb+srv://usuario:contraseña@cluster.mongodb.net/taskflow_db`
   - Usa esta cadena como `MONGO_URL` en el backend

### Costo: GRATIS (Railway ofrece $5/mes gratis, suficiente para este proyecto)

---

## Opción 2: Render

1. **Crea cuenta** en https://render.com
2. **Backend:** New > Web Service > Connect GitHub repo
   - Root: `backend`
   - Runtime: Python
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn server:app --host 0.0.0.0 --port 8001`
   - Agrega variables de entorno (MONGO_URL, DB_NAME, SECRET_KEY)
3. **Frontend:** New > Static Site > Connect GitHub repo
   - Root: `frontend`
   - Build: `yarn install && yarn build`
   - Publish directory: `build`
   - Variable: `REACT_APP_BACKEND_URL` = URL del backend

### Costo: GRATIS (tier gratuito disponible)

---

## Opción 3: Vercel (Frontend) + Railway (Backend)

1. **Frontend en Vercel:**
   - Ve a https://vercel.com y conecta tu GitHub
   - Importa el repositorio, selecciona `frontend` como directorio raíz
   - Framework: Create React App
   - Variable: `REACT_APP_BACKEND_URL` = URL del backend
   - Haz clic en Deploy

2. **Backend en Railway:** (ver Opción 1, pasos 3 y 5)

### Costo: GRATIS

---

## Opción 4: VPS (DigitalOcean / Linode)

Para control total sobre el servidor:

1. **Crea un Droplet/VPS** (Ubuntu 22.04, $6/mes mínimo)

2. **Instala dependencias:**
   ```bash
   sudo apt update && sudo apt install -y python3-pip python3-venv nodejs npm nginx certbot
   sudo npm install -g yarn
   ```

3. **Configura MongoDB:**
   ```bash
   # Opción A: Usa MongoDB Atlas (recomendado - gratis)
   # Opción B: Instala MongoDB local
   sudo apt install -y mongodb
   sudo systemctl start mongodb
   ```

4. **Despliega el Backend:**
   ```bash
   cd /home/usuario/taskflow/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Crea el archivo .env
   echo "MONGO_URL=mongodb://localhost:27017" > .env
   echo "DB_NAME=taskflow_db" >> .env
   echo "SECRET_KEY=tu-clave-secreta" >> .env
   
   # Ejecuta con supervisor o systemd
   uvicorn server:app --host 0.0.0.0 --port 8001
   ```

5. **Despliega el Frontend:**
   ```bash
   cd /home/usuario/taskflow/frontend
   echo "REACT_APP_BACKEND_URL=https://tu-dominio.com" > .env
   yarn install && yarn build
   ```

6. **Configura Nginx:**
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;
       
       # Frontend
       location / {
           root /home/usuario/taskflow/frontend/build;
           try_files $uri /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://127.0.0.1:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

7. **SSL con Certbot (HTTPS gratis):**
   ```bash
   sudo certbot --nginx -d tu-dominio.com
   ```

---

## Resumen Rápido

| Plataforma | Dificultad | Costo | Ideal para |
|-----------|-----------|-------|-----------|
| Railway | Fácil | Gratis | Presentación rápida |
| Render | Fácil | Gratis | Alternativa a Railway |
| Vercel + Railway | Medio | Gratis | Mejor rendimiento frontend |
| VPS (DigitalOcean) | Avanzado | $6/mes | Producción real |

## Notas Importantes

- **MongoDB Atlas** es siempre la opción más fácil para la base de datos (gratis hasta 512MB)
- El pago con tarjeta es una **simulación académica** - no procesa pagos reales
- Para producción real, necesitarías integrar un gateway de pago como Stripe
- Recuerda cambiar las variables de entorno en cada plataforma
