# Google Analytics en el proyecto académico

Este documento explica **cómo instalar y configurar Google Analytics 4 (GA4)** en el frontend del proyecto, y qué eventos se están enviando desde el **login** y el **CRUD de estudiantes**.

---

## 1. Crear propiedad GA4 y obtener el ID de medición

1. Entra a [`https://analytics.google.com`](https://analytics.google.com) con una cuenta que tenga permisos para administrar GA.
2. Ve a **Administrar** (según la interfaz puede aparecer como un menú lateral o superior).
3. Crea (o selecciona) una **Cuenta** y luego crea una **Propiedad GA4** (no Universal Analytics).
4. En el asistente de creación de la propiedad:
   - Selecciona plataforma **Web**
   - Configura nombre de la propiedad, zona horaria y moneda
5. Crea un **Data stream** de tipo **Web**:
   - Ingresa el dominio/sitio del frontend (en local puedes usar `http://localhost:5173`, pero en producción usa el dominio real)
6. Al finalizar, GA te muestra el **Measurement ID** con formato `G-XXXXXXXXXX`.

Lo llamaremos `GA_MEASUREMENT_ID`.

### 1.1. Dónde encontrar el `Measurement ID` después de crear el stream

Si necesitas localizarlo más adelante:

1. Abre la **propiedad** GA4
2. Ve a **Flujos de datos** (Data streams)
3. Entra al stream **Web** correspondiente
4. Copia el **Measurement ID** (aparece en “Tagging instructions” o en la pantalla de detalles del stream)

---

## 2. Configurar la variable de entorno en el frontend

El frontend espera el ID de medición en la variable `VITE_GA_MEASUREMENT_ID` (build-time).

### 2.1. Desarrollo local

En la raíz del repo, crea o edita el archivo `.env` (o el env que ya use el frontend) y añade:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Después, levanta el frontend normalmente:

```bash
npm run dev -w frontend
```

Si la variable está definida, el bundle cargará GA4 solo en el navegador.

### 2.2. Producción (Vercel / DigitalOcean / AWS)

Según la guía de despliegue que uses (`DEPLOY-VERCEL.md`, `DEPLOY-DIGITALOCEAN.md`, `DEPLOY-AWS.md`):

- **Frontend**: añade `VITE_GA_MEASUREMENT_ID` en las **variables de entorno de build** de la plataforma con el valor `G-XXXXXXXXXX`.
- No subas `.env` al repositorio; usa siempre el gestor de secretos/variables de la plataforma.

---

## 3. Implementación técnica en el frontend

### 3.1. Inicialización de GA4

Se creó el módulo `src/lib/analytics.ts` en el paquete `frontend`. Este módulo:

- Lee `VITE_GA_MEASUREMENT_ID`.
- Inyecta el script oficial de GA4 (`https://www.googletagmanager.com/gtag/js?id=...`).
- Inicializa `window.dataLayer` y `window.gtag`.
- Desactiva el `page_view` automático para poder controlar los page views manualmente.

Se inicializa en `src/main.tsx` antes de renderizar la aplicación:

- Si **no hay** `VITE_GA_MEASUREMENT_ID`, no hace nada.
- Si se ejecuta en **SSR o tests** (sin `window`), también se desactiva sola.

### 3.2. Helpers disponibles

En `src/lib/analytics.ts` existen tres funciones principales:

- **`initAnalytics()`**: se llama una vez al inicio (ya está usado en `main.tsx`).
- **`trackPageView(path: string, title?: string)`**: envía un evento `page_view` manual.
- **`trackEvent(action: string, params?: Record<string, ...>)`**: envía un evento personalizado con el nombre `action` y parámetros adicionales.

Todas las funciones son **seguras**: si no hay ID o no existe `window.gtag`, simplemente retornan sin lanzar errores.

---

## 4. Eventos en Login

Archivo: `packages/frontend/src/components/pages/LoginPage/LoginPage.tsx`

### 4.1. Page view del login

Al renderizar la página de login se envía un page view manual:

- **Evento**: `page_view`
- **Parámetros**:
  - `page_path`: `/login`
  - `page_title`: `Login`

### 4.2. Evento de login exitoso

Después de un login exitoso se envía:

- **Evento**: `login`
- **Parámetros**:
  - `method`: `"password"`
  - `user_role`: rol del usuario (`admin`, `student`, etc.).

Esto permite ver cuántos logins se completan y con qué tipo de usuario.

---

## 5. Eventos en el CRUD de estudiantes

Archivo: `packages/frontend/src/components/pages/EstudiantesPage/EstudiantesPage.tsx`

### 5.1. Page view del listado

Cuando se monta la página de estudiantes:

- **Evento**: `page_view`
- **Parámetros**:
  - `page_path`: `/estudiantes`
  - `page_title`: `Listado de estudiantes`

### 5.2. Click en "Agregar estudiante"

Al hacer clic en el botón para registrar un nuevo estudiante:

- **Evento**: `student_create_click`
- **Parámetros**: *(ninguno adicional por ahora)*.

### 5.3. Click en "Editar"

En la columna de acciones de la tabla, al hacer clic en **Editar**:

- **Evento**: `student_edit_click`
- **Parámetros**:
  - `student_id`: ID interno del estudiante.

### 5.4. Eliminación de estudiante

Cuando se confirma y completa la eliminación de un estudiante:

- **Evento**: `student_delete`
- **Parámetros**:
  - `student_id`: ID interno del estudiante eliminado.

---

## 6. Cómo extender la instrumentación

Para instrumentar nuevas pantallas o acciones:

1. Importa los helpers donde los necesites:

   ```ts
   import { trackPageView, trackEvent } from '../../lib/analytics';
   ```

2. Para una pantalla nueva, al montar el componente:

   ```ts
   useEffect(() => {
     trackPageView('/ruta', 'Título de la pantalla');
   }, []);
   ```

3. Para una acción de usuario:

   ```ts
   const handleAlgo = () => {
     trackEvent('nombre_evento', { extra_param: 'valor' });
     // lógica de la acción...
   };
   ```

Recomendaciones:

- Usa nombres de evento **consistentes**, cortos y en inglés si el equipo lo prefiere (`student_create`, `student_update`, etc.).
- Evita enviar datos sensibles o identificadores personales (DNI, emails completos) a Analytics.

---

## 7. Verificación rápida

1. Abre el frontend en `http://localhost:5173/login`.
2. Entra a la sección **"En tiempo real"** de GA4.
3. Actualiza la página de login y verifica que aparece un `page_view`.
4. Inicia sesión y luego navega a **Estudiantes**:
   - Verifica los `page_view` y los eventos `login`, `student_create_click`, `student_edit_click`, `student_delete` al interactuar con la UI.

Si no se ve nada:

- Asegúrate de que `VITE_GA_MEASUREMENT_ID` esté correctamente configurado.
- Confirma que no tienes un bloqueador de anuncios/script que bloquee Google Analytics.

