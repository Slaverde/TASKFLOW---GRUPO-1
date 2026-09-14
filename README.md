# TaskFlow

Gestor de tareas minimalista desarrollado como proyecto del Seminario de Sistemas. Permite crear, organizar, priorizar y completar tareas, con vistas de calendario diario y semanal.

## Stack

- **Frontend:** React 18 + Vite
- **Estilos:** Tailwind CSS
- **Persistencia y autenticación:** Supabase (PostgreSQL)
- **Despliegue:** Vercel
- **CDN / DNS:** Cloudflare

## Funcionalidades

- Autenticación de usuarios (registro / inicio de sesión) con Supabase Auth.
- Gestión de tareas: crear, editar, eliminar, completar, reordenar.
- Categorías personalizadas por usuario.
- Subtareas y prioridades.
- Vista de calendario (diaria y semanal) con eventos.
- Interfaz responsive tipo PWA (instalable, ícono y manifest propios).

## Instalación local

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto a partir de `.env.example`:

```bash
cp .env.example .env
```

y completar con las credenciales de tu proyecto de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
```

Levantar el entorno de desarrollo:

```bash
npm run dev
```

## Build de producción

```bash
npm run build
```

## Estructura del proyecto

```
├── public/               # Assets estáticos, manifest PWA, service worker
├── src/
│   ├── components/       # Componentes de UI (layout, tareas, calendario, auth)
│   │   └── ui/           # Componentes de UI reutilizables/base
│   ├── hooks/            # Hooks de lógica de negocio (useTaskFlow)
│   ├── lib/               # Cliente de Supabase y utilidades
│   ├── App.jsx           # Componente raíz
│   └── main.jsx          # Entry point
├── index.html
└── vite.config.js
```

## Base de datos (Supabase)

La aplicación utiliza las siguientes tablas en PostgreSQL:

- `tasks`: tareas del usuario (título, descripción, fecha, prioridad, categoría, subtareas, estado).
- `categories`: categorías de tareas por usuario.
- `calendar_events`: eventos del calendario.
- `settings`: preferencias del usuario.

Todas las tablas están relacionadas al usuario autenticado (`user_id`) mediante Supabase Auth.

## Despliegue

La aplicación está desplegada en Vercel, vinculada al repositorio de GitHub para despliegue continuo, y expuesta mediante un dominio configurado con Cloudflare como capa de DNS/HTTPS.

