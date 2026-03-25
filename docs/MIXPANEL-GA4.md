# Mixpanel + GA4 (frontend)

Este documento explica cómo **configurar e implementar Mixpanel junto con Google Analytics 4 (GA4)** en el frontend del proyecto.

La instrumentación está centralizada en `packages/frontend/src/lib/analytics.ts` y actualmente envía los mismos eventos a **GA4** y a **Mixpanel** (si están configurados).

---

## 1. Crear cuenta, proyecto y token en Mixpanel

### 1.1 Requisitos

- Acceso a una propiedad de **Google Analytics 4**.
- Acceso a un proyecto de **Mixpanel** y su **Project Token** (el que usa el cliente web).

### 1.2 Crear cuenta Mixpanel

1. Entra a Mixpanel con [`https://mixpanel.com`](https://mixpanel.com).
2. Regístrate o inicia sesión.
3. Acepta/crea la cuenta (según el flujo de la interfaz).

### 1.3 Crear un proyecto (Project)

1. Una vez dentro, crea un **Project** (puede pedírtelo al iniciar o desde el selector de proyectos).
2. Elige la configuración para tu caso (web app).
3. Guarda el proyecto y continúa.

### 1.4 Obtener el Project Token que se usa en el frontend

En Mixpanel el token que usa `mixpanel-browser` normalmente se conoce como **Project token**.

1. Abre el proyecto que acabas de crear.
2. Ve a **Project settings** (o **Settings** del proyecto).
3. Busca la sección de **API tokens / Access tokens**.
4. Copia el **Project token** (el que está destinado al cliente/SDK web).
5. Guárdalo como `MIXPANEL_TOKEN`.

> Nota: si ves más de un tipo de token, verifica que estás copiando el **Project token** para frontend (no un token “secret” si la interfaz lo separa).

---

## 2. Variables de entorno

### 2.1. GA4

- **Variable**: `VITE_GA_MEASUREMENT_ID`
- **Valor esperado**: `G-XXXXXXXXXX`

### 2.2. Mixpanel

- **Variable**: `VITE_MIXPANEL_TOKEN`
- **Valor esperado**: **Project token** de Mixpanel (por ejemplo `abcd1234...`), el que corresponde a frontend/web

> Ambas variables son **build-time** (Vite). Si no están definidas, el tracking correspondiente se desactiva automáticamente.

---

## 3. Configuración en local

En tu `.env` (o el env que uses para el frontend) agrega:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_MIXPANEL_TOKEN=YOUR_MIXPANEL_PROJECT_TOKEN
```

Luego ejecuta:

```bash
npm run dev -w frontend
```

---

## 4. Configuración en producción

En la plataforma donde construyas/despliegues el **frontend** (Vercel, DO, AWS, etc.), define las variables de entorno:

- `VITE_GA_MEASUREMENT_ID`
- `VITE_MIXPANEL_TOKEN`

No subas `.env` al repositorio.

---

## 5. Implementación en el código

### 5.1. Inicialización

Archivo: `packages/frontend/src/main.tsx`

- Se llama a `initAnalytics()` antes de renderizar `<App />`.

Archivo: `packages/frontend/src/lib/analytics.ts`

- Si existe `VITE_GA_MEASUREMENT_ID`, se inyecta el script oficial de GA4 y se inicializa `window.gtag`.
- Si existe `VITE_MIXPANEL_TOKEN`, se inicializa `mixpanel-browser`.
- Se desactiva el `page_view` automático (tanto en GA4 como en Mixpanel) para enviar page views manualmente.

### 5.2. API de tracking

Desde cualquier componente puedes usar:

- `trackPageView(path, title?)`
- `trackEvent(action, params?)`

Ejemplo:

```ts
import { trackEvent, trackPageView } from '../../lib/analytics';

trackPageView('/login', 'Login');
trackEvent('login', { method: 'password' });
```

---

## 6. Eventos instrumentados actualmente

### 6.1. Login

En `LoginPage`:

- **Page view**: `page_view` con `page_path=/login`
- **Login exitoso**: `login` con:
  - `method=password`
  - `user_role=<rol>`

### 6.2. CRUD de estudiantes (listado)

En `EstudiantesPage`:

- **Page view**: `page_view` con `page_path=/estudiantes`
- **Crear (click)**: `student_create_click`
- **Editar (click)**: `student_edit_click` con `student_id`
- **Eliminar (éxito)**: `student_delete` con `student_id`

---

## 7. Verificación

### 7.1. GA4

1. Abre **Tiempo real** en GA4.
2. Navega por `/login` y `/estudiantes`.
3. Verifica `page_view` y los eventos listados.

### 7.2. Mixpanel

1. Abre **Live View** (o Events) en Mixpanel.
2. Repite navegación y acciones.
3. Verifica que aparezcan los mismos nombres de evento (`page_view`, `login`, `student_*`).

---

## 8. Buenas prácticas

- No envíes PII (documento, email completo, etc.) a Mixpanel/GA.
- Mantén nombres de eventos consistentes.
- Si más adelante quieres “usuarios” en Mixpanel (identify/alias), se puede agregar al momento del login con el `user.id`.

