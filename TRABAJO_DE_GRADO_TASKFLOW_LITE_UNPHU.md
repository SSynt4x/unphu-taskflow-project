# TRABAJO DE GRADO - ESCUELA DE INFORMÁTICA
## Universidad Nacional Pedro Henríquez Ureña
### Facultad de Ciencias y Tecnología
### Escuela de Informática

---

# TASKFLOW LITE - UNPHU
## Sistema de Gestión de Tareas Académicas con Gamificación para Estudiantes Universitarios

---

**Sustentantes:**
- Lenin Ariza Figueroa - 24-0150
- Rodolfo Tapia Morales - 24-0286
- Diego Caraballo - 23-1479
- Juan Daniel Montas Peralta - 21-1819
- Odalmer Pimentel

**Presentado para optar por el título de:**
Ingeniero en Sistemas Computacionales

**Asesor:**
Ing. Mario Vinicio Mesa

**Lugar y Fecha:**
Santo Domingo, D.N. 2025

---

# DEDICATORIAS

Dedicamos este trabajo de grado a nuestras familias, quienes han sido el pilar fundamental en nuestra formación académica y personal. A nuestros padres, por su apoyo incondicional, sacrificio y motivación constante que nos impulsó a alcanzar esta meta.

A la Universidad Nacional Pedro Henríquez Ureña (UNPHU), institución que nos brindó las herramientas y conocimientos necesarios para desarrollarnos como profesionales competentes en el área de la informática.

A todos los estudiantes universitarios que buscan mejorar su productividad académica, esperando que este sistema les sea de utilidad en su vida estudiantil.

---

# AGRADECIMIENTOS

Agradecemos primeramente a Dios por darnos la sabiduría, fortaleza y perseverancia necesarias para culminar este proyecto de grado.

A nuestro asesor, Ing. Mario Vinicio Mesa, por su guía experta, paciencia y dedicación durante todo el proceso de desarrollo de este trabajo. Sus orientaciones fueron fundamentales para alcanzar los objetivos propuestos.

A los profesores de la Escuela de Informática de la UNPHU, quienes a lo largo de nuestra carrera nos transmitieron los conocimientos técnicos y valores profesionales que aplicamos en este proyecto.

A nuestros compañeros de clase, por el intercambio de ideas y apoyo mutuo durante estos años de formación académica.

Finalmente, a todas las personas que de una u otra forma contribuyeron al desarrollo exitoso de TaskFlow Lite - UNPHU.

---

# RESUMEN

El presente trabajo de grado aborda el desarrollo de TaskFlow Lite - UNPHU, un sistema de gestión de tareas académicas diseñado específicamente para estudiantes universitarios de la Universidad Nacional Pedro Henríquez Ureña. La motivación principal surge de la necesidad identificada en el entorno académico de contar con una herramienta digital que permita organizar eficientemente las actividades estudiantiles, incorporando elementos de gamificación para aumentar la motivación y el compromiso de los usuarios.

El sistema desarrollado permite crear, editar y eliminar tareas con fecha y hora específica, gestionar estados (pendiente, completada, no finalizada), visualizar un dashboard con estadísticas de desempeño y gráficos de progreso temporal, mantener un historial de actividades con exportación a PDF, registrar planes futuros y metas académicas. El componente de gamificación incluye un sistema dual de puntos: puntos de rango para ascender entre cinco niveles (Procrastinador, Freshman, Sophomore, Business Man y Soldier) y puntos canjeables para desbloquear avatares personalizados.

Se concluye que TaskFlow Lite - UNPHU representa una solución efectiva para la gestión del tiempo académico, combinando funcionalidad práctica con elementos motivacionales. El sistema fue desarrollado utilizando tecnologías modernas (React, FastAPI, MongoDB) y cuenta con modo oscuro/claro, diseño responsivo y capacidad de funcionamiento offline mediante almacenamiento local.

---

# ABSTRACT

This thesis addresses the development of TaskFlow Lite - UNPHU, an academic task management system specifically designed for university students at Universidad Nacional Pedro Henríquez Ureña. The main motivation arises from the identified need in the academic environment for a digital tool that allows efficient organization of student activities, incorporating gamification elements to increase user motivation and engagement.

The developed system allows creating, editing and deleting tasks with specific date and time, managing states (pending, completed, incomplete), displaying a dashboard with performance statistics and temporal progress charts, maintaining an activity history with PDF export, and recording future plans and academic goals. The gamification component includes a dual point system: rank points to advance through five levels (Procrastinator, Freshman, Sophomore, Business Man and Soldier) and redeemable points to unlock customized avatars.

It is concluded that TaskFlow Lite - UNPHU represents an effective solution for academic time management, combining practical functionality with motivational elements. The system was developed using modern technologies (React, FastAPI, MongoDB) and features dark/light mode, responsive design and offline capability through local storage.

---

# TABLA DE CONTENIDOS

1. INTRODUCCIÓN
2. CAPÍTULO 1: PLANTEAMIENTO DEL PROBLEMA
   - 1.1 Antecedentes
   - 1.2 Definición del problema
   - 1.3 Objetivos
   - 1.4 Justificación
   - 1.5 Alcance
3. CAPÍTULO 2: MARCO TEÓRICO
4. CAPÍTULO 3: MARCO METODOLÓGICO
5. CAPÍTULO 4: ANÁLISIS Y DISEÑO DEL SISTEMA
6. CAPÍTULO 5: RESULTADOS
7. CAPÍTULO 6: EVALUACIÓN
8. CAPÍTULO 7: CONCLUSIONES
9. CAPÍTULO 8: RECOMENDACIONES
10. CAPÍTULO 9: REFERENCIAS
11. ANEXOS

---

# INTRODUCCIÓN

El presente trabajo de grado documenta el proceso de desarrollo de TaskFlow Lite - UNPHU, un sistema web de gestión de tareas académicas orientado a estudiantes universitarios. En un contexto donde la carga académica y las múltiples responsabilidades estudiantiles demandan herramientas eficientes de organización, surge la necesidad de crear soluciones tecnológicas que no solo permitan administrar tareas, sino que también motiven al usuario a mantener un rendimiento constante.

La procrastinación y la falta de organización son problemas comunes entre estudiantes universitarios, afectando directamente su rendimiento académico y bienestar personal. TaskFlow Lite - UNPHU aborda esta problemática mediante la implementación de un sistema intuitivo que combina la gestión tradicional de tareas con elementos de gamificación, creando una experiencia de usuario atractiva y motivadora.

El documento se estructura en nueve capítulos que abarcan desde el planteamiento del problema hasta las recomendaciones finales. El Capítulo 1 presenta los antecedentes, definición del problema, objetivos y justificación del proyecto. El Capítulo 2 desarrolla el marco teórico con los conceptos y tecnologías utilizadas. El Capítulo 3 describe la metodología empleada. El Capítulo 4 detalla el análisis y diseño del sistema. El Capítulo 5 presenta los resultados obtenidos. El Capítulo 6 incluye la evaluación del proyecto. Finalmente, los Capítulos 7, 8 y 9 contienen las conclusiones, recomendaciones y referencias bibliográficas respectivamente.

---

# CAPÍTULO 1: PLANTEAMIENTO DEL PROBLEMA

## 1.1 Antecedentes

### 1.1.1 Aplicaciones de Gestión de Tareas Existentes

En el mercado actual existen diversas aplicaciones de gestión de tareas como Todoist, Microsoft To-Do, Trello y Asana. Sin embargo, estas herramientas están diseñadas para un público general y carecen de características específicas orientadas al entorno académico universitario. Además, muchas de ellas requieren suscripciones de pago para acceder a funcionalidades avanzadas.

### 1.1.2 Gamificación en la Educación

Estudios recientes han demostrado la efectividad de la gamificación en entornos educativos. Aplicaciones como Duolingo y Habitica han implementado exitosamente sistemas de puntos, niveles y recompensas para mantener la motivación del usuario. Sin embargo, existe una carencia de herramientas que combinen específicamente la gestión de tareas académicas con elementos de gamificación adaptados al contexto universitario dominicano.

## 1.2 Definición del Problema

Los estudiantes universitarios de la UNPHU enfrentan dificultades para organizar sus múltiples responsabilidades académicas, lo que resulta en procrastinación, incumplimiento de fechas límite y estrés. Las herramientas existentes no ofrecen una experiencia personalizada que motive al estudiante a mantener un seguimiento constante de sus tareas, ni proporcionan métricas de desempeño que permitan visualizar el progreso académico a lo largo del tiempo.

## 1.3 Objetivos

### 1.3.1 Objetivo General

Desarrollar un sistema web de gestión de tareas académicas con gamificación para estudiantes de la Universidad Nacional Pedro Henríquez Ureña, que permita organizar actividades, visualizar el progreso y motivar al usuario mediante un sistema de puntos y recompensas.

### 1.3.2 Objetivos Específicos

1. Implementar un módulo de autenticación seguro con registro e inicio de sesión mediante JWT.
2. Desarrollar funcionalidades CRUD (Crear, Leer, Actualizar, Eliminar) para la gestión de tareas con fecha, hora y estados.
3. Crear un dashboard interactivo con estadísticas de desempeño y gráficos de progreso temporal.
4. Implementar un sistema de historial de actividades con capacidad de exportación a formato PDF.
5. Desarrollar un módulo de planes futuros para el registro de metas académicas.
6. Diseñar e implementar un sistema de gamificación con puntos de rango y puntos canjeables.
7. Crear una tienda de avatares desbloqueables mediante puntos canjeables.
8. Implementar modo oscuro/claro y diseño responsivo adaptado a dispositivos móviles.

## 1.4 Justificación

### 1.4.1 Contexto Institucional

La Universidad Nacional Pedro Henríquez Ureña promueve el uso de tecnologías innovadoras en el proceso de enseñanza-aprendizaje. TaskFlow Lite - UNPHU se alinea con esta visión al proporcionar una herramienta tecnológica que facilita la organización académica de sus estudiantes.

### 1.4.2 Necesidad Identificada

Mediante observación directa y conversaciones con estudiantes de la UNPHU, se identificó la necesidad de una herramienta de gestión de tareas que sea gratuita, accesible y motivadora.

### 1.4.3 Originalidad

TaskFlow Lite - UNPHU presenta características únicas que lo diferencian de otras aplicaciones:
- Sistema dual de puntos (rango y canjeables)
- Cinco niveles de gamificación con iconos distintivos
- Tienda de avatares personalizados
- Diseño con identidad visual de la UNPHU (logo del búho, colores institucionales)
- Gráficos de desempeño con evolución temporal

### 1.4.4 Profundidad

El proyecto abarca el ciclo completo de desarrollo de software, desde el análisis de requerimientos hasta la implementación y pruebas. Se utilizan tecnologías modernas y buenas prácticas de desarrollo como:
- Arquitectura cliente-servidor
- API RESTful
- Base de datos NoSQL
- Autenticación JWT
- Diseño responsivo

### 1.4.5 Impacto

El sistema tiene el potencial de impactar positivamente en:
- La productividad académica de los estudiantes
- La reducción de la procrastinación
- La motivación mediante gamificación
- La visualización del progreso personal

## 1.5 Alcance

El proyecto TaskFlow Lite - UNPHU incluye:
- Sistema de autenticación (registro/login)
- Gestión completa de tareas (CRUD)
- Estados de tareas: pendiente, completada, no finalizada
- Dashboard con estadísticas y gráficos
- Historial de actividades con exportación PDF
- Módulo de planes futuros
- Sistema de gamificación con 5 rangos
- Tienda de avatares (4 avatares desbloqueables)
- Modo oscuro/claro
- Almacenamiento local para funcionamiento offline

No incluye:
- Aplicación móvil nativa
- Integración con calendarios externos
- Notificaciones push
- Colaboración entre usuarios
- Integración con el sistema académico de la UNPHU

---

# CAPÍTULO 2: MARCO TEÓRICO

## 2.1 Conceptos Generales

### 2.1.1 Gestión de Tareas

La gestión de tareas es el proceso de administrar una tarea a través de su ciclo de vida, incluyendo la planificación, prueba, seguimiento e informes. Permite a individuos y equipos organizar, priorizar y completar trabajo de manera eficiente (Drucker, 2006).

### 2.1.2 Gamificación

La gamificación es la aplicación de elementos típicos de los juegos (puntos, insignias, tablas de clasificación) en contextos no lúdicos para motivar la participación y el compromiso (Deterding et al., 2011). En el ámbito educativo, ha demostrado aumentar la motivación intrínseca y el engagement de los estudiantes.

### 2.1.3 Productividad Académica

Se refiere a la eficiencia con la que un estudiante completa sus responsabilidades académicas en relación con el tiempo y recursos invertidos. Factores como la organización, gestión del tiempo y motivación influyen directamente en este indicador.

## 2.2 Conceptos de Desarrollo de Software

### 2.2.1 Arquitectura Cliente-Servidor

Modelo de arquitectura donde las tareas se reparten entre los proveedores de recursos o servicios (servidores) y los demandantes (clientes). En TaskFlow Lite, el frontend React actúa como cliente y el backend FastAPI como servidor.

### 2.2.2 API RESTful

REST (Representational State Transfer) es un estilo de arquitectura de software que define un conjunto de restricciones para crear servicios web. Una API RESTful utiliza métodos HTTP estándar (GET, POST, PUT, DELETE) para realizar operaciones CRUD.

### 2.2.3 JWT (JSON Web Token)

Estándar abierto (RFC 7519) que define una forma compacta y autónoma de transmitir información de forma segura entre partes como un objeto JSON. Se utiliza comúnmente para autenticación y autorización en aplicaciones web.

### 2.2.4 Base de Datos NoSQL

MongoDB es una base de datos NoSQL orientada a documentos que almacena datos en formato BSON (Binary JSON). Ofrece flexibilidad en el esquema y escalabilidad horizontal, ideal para aplicaciones web modernas.

### 2.2.5 React

Biblioteca de JavaScript para construir interfaces de usuario. Utiliza un paradigma de componentes reutilizables y un DOM virtual para optimizar el rendimiento de las actualizaciones de la interfaz.

### 2.2.6 FastAPI

Framework moderno de Python para construir APIs web de alto rendimiento. Ofrece validación automática de datos, documentación interactiva y soporte nativo para operaciones asíncronas.

---

# CAPÍTULO 3: MARCO METODOLÓGICO

## 3.1 Metodología del Proyecto

Para el desarrollo de TaskFlow Lite - UNPHU se utilizó una metodología ágil basada en Scrum, adaptada a las necesidades del equipo de desarrollo académico. Esta metodología permite:
- Entregas incrementales de funcionalidad
- Adaptación a cambios de requerimientos
- Retroalimentación continua
- Colaboración efectiva del equipo

## 3.2 Ciclo de Vida del Proyecto

El proyecto siguió las siguientes fases:

1. **Análisis de Requerimientos**: Identificación de necesidades de los usuarios y definición de funcionalidades.

2. **Diseño**: Creación de wireframes, diseño de base de datos y arquitectura del sistema.

3. **Desarrollo**: Implementación del backend (FastAPI + MongoDB) y frontend (React + Tailwind CSS).

4. **Pruebas**: Verificación de funcionalidades mediante pruebas unitarias y de integración.

5. **Despliegue**: Configuración del entorno de producción y documentación de instalación.

## 3.3 Recopilación de Datos

La recopilación de datos para el proyecto se realizó mediante:

- **Observación directa**: Análisis del comportamiento de estudiantes en la gestión de sus tareas académicas.
- **Revisión bibliográfica**: Estudio de aplicaciones similares y literatura sobre gamificación educativa.
- **Pruebas de usuario**: Evaluación del sistema con usuarios reales para obtener retroalimentación.

---

# CAPÍTULO 4: ANÁLISIS Y DISEÑO DEL SISTEMA

## 4.1 Requerimientos

### 4.1.1 Requerimientos Funcionales

| ID | Requerimiento | Prioridad |
|----|---------------|-----------|
| RF01 | El sistema debe permitir el registro de usuarios con email, contraseña y nombre | Alta |
| RF02 | El sistema debe permitir el inicio de sesión mediante credenciales | Alta |
| RF03 | El sistema debe permitir crear tareas con título, descripción, fecha y hora | Alta |
| RF04 | El sistema debe permitir editar tareas existentes | Alta |
| RF05 | El sistema debe permitir eliminar tareas | Alta |
| RF06 | El sistema debe permitir cambiar el estado de las tareas (pendiente/completada/no finalizada) | Alta |
| RF07 | El sistema debe mostrar un dashboard con estadísticas del usuario | Alta |
| RF08 | El sistema debe mostrar un gráfico de desempeño temporal | Media |
| RF09 | El sistema debe mantener un historial de actividades | Media |
| RF10 | El sistema debe permitir exportar el historial a PDF | Media |
| RF11 | El sistema debe permitir registrar planes futuros | Media |
| RF12 | El sistema debe otorgar 10 puntos de rango por tarea completada | Alta |
| RF13 | El sistema debe otorgar 5 puntos canjeables por tarea completada | Alta |
| RF14 | El sistema debe mostrar el rango actual del usuario | Alta |
| RF15 | El sistema debe permitir desbloquear avatares con puntos canjeables | Media |
| RF16 | El sistema debe permitir seleccionar un avatar desbloqueado | Baja |
| RF17 | El sistema debe permitir alternar entre modo oscuro y claro | Baja |

### 4.1.2 Requerimientos No Funcionales

| ID | Requerimiento | Categoría |
|----|---------------|-----------|
| RNF01 | El sistema debe responder en menos de 2 segundos | Rendimiento |
| RNF02 | El sistema debe ser accesible desde navegadores modernos | Compatibilidad |
| RNF03 | El sistema debe tener diseño responsivo | Usabilidad |
| RNF04 | El sistema debe funcionar offline mediante localStorage | Disponibilidad |
| RNF05 | Las contraseñas deben almacenarse encriptadas | Seguridad |
| RNF06 | La autenticación debe utilizar tokens JWT | Seguridad |
| RNF07 | El código debe seguir buenas prácticas de desarrollo | Mantenibilidad |

## 4.2 Cronograma

| Fase | Duración | Actividades |
|------|----------|-------------|
| Análisis | 2 semanas | Requerimientos, investigación |
| Diseño | 2 semanas | Arquitectura, wireframes, base de datos |
| Desarrollo Backend | 3 semanas | API, autenticación, modelos |
| Desarrollo Frontend | 4 semanas | Componentes, páginas, integración |
| Pruebas | 2 semanas | Testing, correcciones |
| Documentación | 1 semana | Manual, trabajo de grado |

## 4.3 Arquitectura

TaskFlow Lite - UNPHU utiliza una arquitectura de tres capas:

```
┌─────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN          │
│   React + Tailwind CSS + Shadcn/UI      │
│         (Puerto 3000)                   │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│           CAPA DE NEGOCIO               │
│        FastAPI + Python                 │
│         (Puerto 8001)                   │
└─────────────────┬───────────────────────┘
                  │ MongoDB Driver
┌─────────────────▼───────────────────────┐
│           CAPA DE DATOS                 │
│            MongoDB                      │
│         (Puerto 27017)                  │
└─────────────────────────────────────────┘
```

## 4.4 Diagramas UML

### 4.4.1 Diagrama de Casos de Uso

**Actores:**
- Usuario (Estudiante)
- Sistema

**Casos de Uso Principales:**
1. Registrarse
2. Iniciar Sesión
3. Gestionar Tareas
4. Ver Dashboard
5. Ver Historial
6. Exportar PDF
7. Gestionar Planes
8. Ver Perfil
9. Canjear Avatares
10. Cambiar Tema

### 4.4.2 Diagrama Entidad-Relación

**Entidades:**

**Usuario (users)**
- id: String (PK)
- email: String
- password: String (hash)
- name: String
- points: Integer
- redeemable_points: Integer
- unlocked_avatars: Array
- current_avatar: String
- created_at: DateTime

**Tarea (tasks)**
- id: String (PK)
- user_id: String (FK)
- title: String
- description: String
- due_date: String
- due_time: String
- status: String
- created_at: DateTime
- updated_at: DateTime

**Plan Futuro (future_plans)**
- id: String (PK)
- user_id: String (FK)
- title: String
- description: String
- target_date: String
- created_at: DateTime

**Actividad (activities)**
- id: String (PK)
- user_id: String (FK)
- action: String
- description: String
- points_earned: Integer
- created_at: DateTime

## 4.5 Diccionario de Datos

### Colección: users

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | Identificador único UUID |
| email | String | Correo electrónico del usuario |
| password | String | Contraseña encriptada con bcrypt |
| name | String | Nombre del usuario |
| points | Integer | Puntos de rango acumulados |
| redeemable_points | Integer | Puntos canjeables disponibles |
| unlocked_avatars | Array | Lista de IDs de avatares desbloqueados |
| current_avatar | String | ID del avatar seleccionado |
| created_at | String | Fecha de creación ISO 8601 |

### Colección: tasks

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | Identificador único UUID |
| user_id | String | Referencia al usuario propietario |
| title | String | Título de la tarea |
| description | String | Descripción detallada |
| due_date | String | Fecha límite (YYYY-MM-DD) |
| due_time | String | Hora límite (HH:MM) |
| status | String | Estado: pending/completed/incomplete |
| created_at | String | Fecha de creación |
| updated_at | String | Fecha de última modificación |

## 4.6 Diseño de Pantallas

### Pantalla de Login
- Logo del búho UNPHU
- Título "TaskFlow Lite"
- Subtítulo "UNPHU - Gestión de Tareas Académicas"
- Campo de email
- Campo de contraseña
- Botón "Iniciar Sesión"
- Enlace a registro

### Dashboard
- Bienvenida personalizada
- 4 tarjetas de estadísticas (completadas, pendientes, no finalizadas, planes)
- Sección de rango con barra de progreso
- Lista de actividad reciente
- Gráfico de desempeño temporal

### Página de Tareas
- Botón "Nueva Tarea"
- Filtro por estado
- Lista de tareas con:
  - Indicador de estado
  - Título y descripción
  - Fecha y hora
  - Menú de acciones

### Página de Perfil
- Avatar actual
- Información del usuario
- Puntos de rango y canjeables
- Tienda de avatares

---

# CAPÍTULO 5: RESULTADOS

## 5.1 Cumplimiento de Objetivos

El desarrollo de TaskFlow Lite - UNPHU cumplió exitosamente con todos los objetivos específicos planteados:

### 5.1.1 Sistema de Autenticación (Objetivo 1)

Se implementó un módulo de autenticación completo utilizando JWT (JSON Web Tokens) con las siguientes características:
- Registro de usuarios con validación de email
- Encriptación de contraseñas mediante bcrypt
- Generación de tokens con expiración de 7 días
- Protección de rutas mediante middleware de autenticación

### 5.1.2 Gestión de Tareas CRUD (Objetivo 2)

Se desarrollaron las funcionalidades completas de gestión de tareas:
- Crear tareas con título, descripción, fecha y hora
- Listar tareas del usuario con filtros por estado
- Actualizar tareas existentes
- Eliminar tareas
- Cambiar estado entre pendiente, completada y no finalizada

### 5.1.3 Dashboard Interactivo (Objetivo 3)

El dashboard incluye:
- 4 tarjetas de estadísticas en tiempo real
- Sección de rango con progreso visual
- Lista de actividades recientes
- Gráfico de área con evolución temporal de puntos y tareas completadas

### 5.1.4 Historial con Exportación PDF (Objetivo 4)

Se implementó:
- Registro automático de todas las actividades del usuario
- Agrupación por fecha
- Exportación a PDF mediante jsPDF con formato profesional

### 5.1.5 Módulo de Planes Futuros (Objetivo 5)

Funcionalidades implementadas:
- Crear planes con título, descripción y fecha objetivo
- Editar planes existentes
- Eliminar planes
- Visualización en grid responsivo

### 5.1.6 Sistema de Gamificación (Objetivo 6)

Sistema dual de puntos:
- **Puntos de Rango**: +10 por tarea completada
- **Puntos Canjeables**: +5 por tarea completada

Cinco niveles con iconos distintivos:
| Rango | Puntos Mínimos | Icono |
|-------|----------------|-------|
| Procrastinador | 0 | Coffee |
| Freshman | 300 | Sprout |
| Sophomore | 500 | BookOpen |
| Business Man | 800 | Briefcase |
| Soldier | 1200 | Shield |

### 5.1.7 Tienda de Avatares (Objetivo 7)

Cuatro avatares desbloqueables:
| Avatar | Precio |
|--------|--------|
| Búho Estudiante | 500 pts |
| Búho Intelectual | 600 pts |
| Búho Graduado | 1000 pts |
| Búho Dorado | 2000 pts |

### 5.1.8 Diseño Visual (Objetivo 8)

- Modo oscuro con tema verde neón
- Modo claro con verde y blanco
- Toggle de tema en sidebar y header móvil
- Diseño responsivo con breakpoints para móvil, tablet y desktop

---

# CAPÍTULO 6: EVALUACIÓN

## 6.1 Estudio de Factibilidad

### 6.1.1 Factibilidad de Mercado

El mercado objetivo está claramente definido: estudiantes universitarios de la UNPHU que buscan mejorar su organización académica. La demanda está respaldada por:
- Alta tasa de procrastinación estudiantil
- Adopción generalizada de tecnología entre universitarios
- Interés en aplicaciones con gamificación

### 6.1.2 Factibilidad Técnica

El proyecto es técnicamente factible dado que:
- Las tecnologías utilizadas son maduras y bien documentadas
- El equipo cuenta con conocimientos en desarrollo web
- No se requiere hardware especializado
- El software necesario es de código abierto

### 6.1.3 Factibilidad Económica

El desarrollo del proyecto tiene bajo costo:
- Herramientas de desarrollo gratuitas
- Hosting en servidor proporcionado por la universidad
- Sin costos de licenciamiento

### 6.1.4 Conclusiones Generales

El proyecto TaskFlow Lite - UNPHU es factible en todas las dimensiones evaluadas, presentando un balance favorable entre costo, beneficio y viabilidad técnica.

## 6.2 Requerimientos para el Desarrollo

**Hardware:**
- Computadora con mínimo 8GB RAM
- Conexión a Internet

**Software:**
- Node.js v18+
- Python 3.10+
- MongoDB 4.4+
- Editor de código (VS Code)

## 6.3 Presupuesto

| Concepto | Costo |
|----------|-------|
| Desarrollo (5 estudiantes x 200 horas) | RD$ 0 (académico) |
| Herramientas de desarrollo | RD$ 0 (open source) |
| Hosting de desarrollo | RD$ 0 (Emergent Platform) |
| Dominio (opcional) | RD$ 1,500/año |
| **Total** | **RD$ 1,500** |

## 6.4 Plan de Implementación

1. **Preparación del Servidor**
   - Instalar Node.js, Python y MongoDB
   - Configurar variables de entorno

2. **Despliegue del Backend**
   - Clonar repositorio
   - Instalar dependencias Python
   - Iniciar servicio FastAPI

3. **Despliegue del Frontend**
   - Instalar dependencias con Yarn
   - Compilar para producción
   - Configurar servidor web

4. **Pruebas de Producción**
   - Verificar conectividad
   - Probar funcionalidades críticas
   - Monitorear rendimiento

---

# CAPÍTULO 7: CONCLUSIONES

El desarrollo de TaskFlow Lite - UNPHU ha demostrado ser una solución efectiva para abordar la problemática de la gestión del tiempo y organización académica de los estudiantes universitarios. A través de este proyecto se logró:

1. **Crear una herramienta funcional y completa** que permite a los estudiantes gestionar sus tareas académicas de manera eficiente, con características como la asignación de fechas límite, seguimiento de estados y visualización de progreso.

2. **Implementar exitosamente elementos de gamificación** que añaden un componente motivacional al proceso de gestión de tareas. El sistema dual de puntos y los avatares desbloqueables crean incentivos para que los usuarios mantengan un uso constante de la aplicación.

3. **Desarrollar una interfaz de usuario atractiva y funcional** con el tema verde neón característico, modo oscuro/claro y diseño responsivo, proporcionando una experiencia de usuario agradable en cualquier dispositivo.

4. **Aplicar tecnologías modernas de desarrollo web** (React, FastAPI, MongoDB) demostrando la capacidad del equipo para implementar soluciones con arquitecturas actuales y buenas prácticas de programación.

5. **Generar documentación completa** que permite la instalación y despliegue del sistema por parte de otros usuarios o instituciones interesadas.

El proyecto representa un aporte significativo al ecosistema tecnológico de la UNPHU, proporcionando una herramienta gratuita y personalizada para sus estudiantes.

---

# CAPÍTULO 8: RECOMENDACIONES

Para futuras mejoras y extensiones del proyecto TaskFlow Lite - UNPHU, se recomienda:

1. **Desarrollar una aplicación móvil nativa** para iOS y Android que complemente la versión web, aprovechando características del dispositivo como notificaciones push y widgets.

2. **Implementar un sistema de recordatorios** mediante notificaciones por correo electrónico o SMS para alertar a los usuarios sobre tareas próximas a vencer.

3. **Integrar con el sistema académico de la UNPHU** para sincronizar automáticamente fechas de exámenes, entregas y eventos académicos.

4. **Añadir funcionalidades colaborativas** como tareas grupales, compartir listas y tableros de equipo para proyectos académicos.

5. **Expandir el sistema de gamificación** con logros desbloqueables, rachas de productividad y tablas de clasificación opcionales.

6. **Implementar inteligencia artificial** para sugerir priorización de tareas basada en fechas límite, dificultad y patrones de comportamiento del usuario.

7. **Crear una API pública documentada** que permita a desarrolladores de la comunidad UNPHU crear extensiones e integraciones.

8. **Realizar estudios de impacto** para medir cuantitativamente el efecto del sistema en el rendimiento académico de los usuarios.

---

# CAPÍTULO 9: REFERENCIAS

Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification". Proceedings of the 15th International Academic MindTrek Conference, 9-15.

Drucker, P. F. (2006). The Effective Executive: The Definitive Guide to Getting the Right Things Done. Harper Business.

FastAPI. (2024). FastAPI Documentation. https://fastapi.tiangolo.com/

MongoDB. (2024). MongoDB Documentation. https://docs.mongodb.com/

React. (2024). React Documentation. https://react.dev/

Tailwind CSS. (2024). Tailwind CSS Documentation. https://tailwindcss.com/docs

---

# ANEXO A - Guía de Instalación

## Requisitos Previos

- Node.js v18 o superior
- Python 3.10 o superior
- MongoDB 4.4 o superior
- Yarn (gestor de paquetes)

## Instalación del Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o venv\Scripts\activate en Windows
pip install -r requirements.txt
```

## Configuración de Variables de Entorno

**backend/.env:**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=unphu_taskflow
JWT_SECRET=tu-clave-secreta
```

**frontend/.env:**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Instalación del Frontend

```bash
cd frontend
yarn install
```

## Ejecución

**Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd frontend
yarn start
```

---

# ANEXO B - Endpoints de la API

## Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/me | Obtener usuario actual |

## Tareas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/tasks | Listar tareas |
| POST | /api/tasks | Crear tarea |
| PUT | /api/tasks/{id} | Actualizar tarea |
| DELETE | /api/tasks/{id} | Eliminar tarea |

## Planes Futuros

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/plans | Listar planes |
| POST | /api/plans | Crear plan |
| PUT | /api/plans/{id} | Actualizar plan |
| DELETE | /api/plans/{id} | Eliminar plan |

## Estadísticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/stats | Obtener estadísticas |
| GET | /api/stats/history | Obtener historial para gráfico |
| GET | /api/activities | Obtener actividades |

## Avatares

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/avatars | Listar avatares |
| POST | /api/avatars/{id}/unlock | Desbloquear avatar |
| POST | /api/avatars/{id}/select | Seleccionar avatar |

---

**FIN DEL DOCUMENTO**
