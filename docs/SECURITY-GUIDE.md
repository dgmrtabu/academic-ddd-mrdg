# Guía de seguridad del proyecto académico

Este documento resume las **medidas de seguridad implementadas** en el proyecto (backend + frontend) y ofrece una **checklist de buenas prácticas** para mantener el sistema seguro en desarrollo y producción.

---

## 1. Backend (NestJS)

### 1.1. Configuración general

- Uso de `@nestjs/config` para leer variables de entorno.
- Configuración de TypeORM sin `synchronize` en producción (`synchronize: false`).
- Archivo `.env.example` con las variables mínimas necesarias (`PORT`, `JWT_SECRET`, `TYPEORM_*`, etc.).

### 1.2. CORS

En `src/main.ts`:

- Se habilita CORS con orígenes configurables mediante `CORS_ORIGIN`:
  - En desarrollo puede ser un único origen (`http://localhost:5173`).
  - En producción se recomienda una lista separada por comas con los dominios válidos del frontend.

**Recomendación**:

- Mantener `CORS_ORIGIN` **lo más restrictivo posible** (no usar `*` en producción).

### 1.3. Helmet (cabeceras de seguridad)

En `src/main.ts` se usa `helmet`:

- Añade cabeceras como `X-DNS-Prefetch-Control`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, etc.
- El `contentSecurityPolicy` se activa automáticamente en producción (en desarrollo se desactiva para evitar fricción).

**Recomendación**:

- Ajustar el CSP (`contentSecurityPolicy`) si se añaden nuevos orígenes estáticos (CDNs, fuentes, etc.).

### 1.4. Validación y sanitización

Se añadió un `ValidationPipe` global en `src/main.ts`:

- `whitelist: true`: solo se aceptan propiedades definidas en los DTOs.
- `forbidNonWhitelisted: true`: si llegan propiedades extra, se devuelve un error de validación.
- `transform: true`: transforma payloads al tipo esperado, útil con DTOs tipados.

**Recomendación**:

- Definir DTOs con `class-validator`/`class-transformer` para todas las rutas públicas.
- No aceptar `any` en controladores; usar siempre objetos tipados.

### 1.5. Autenticación y JWT

Módulo `AuthModule`:

- JWT con expiración (`expiresIn: '2h'`).
- Estrategia `JwtStrategy` y guard `JwtAuthGuard` para proteger rutas.
- Decorador `@Public()` para marcar endpoints que no requieren autenticación (por ejemplo, `POST /auth/login`).

**Puntos clave**:

- En `.env.example` el `JWT_SECRET` se documenta como valor de ejemplo:
  - En producción se debe usar un secreto **largo, aleatorio y no predecible**.
- Evitar compartir el mismo secreto entre entornos (dev, staging, prod).

### 1.6. Rate limiting (protección contra fuerza bruta / abuso)

Se añadió `@nestjs/throttler` en `AppModule`:

- Configuración global (ejemplo):
  - Límite general de peticiones por IP (100 por minuto).
  - Límite más agresivo para rutas sensibles como login (10 por minuto).

**Recomendación**:

- Ajustar los límites según el tráfico esperado.
- Monitorizar logs de bloqueos y adaptar la configuración para evitar falsos positivos.

### 1.7. Gestión de contraseñas y usuarios

- Existe una contraseña temporal por defecto para estudiantes (`STUDENT_DEFAULT_PASSWORD`).

**Recomendaciones**:

- Forzar el cambio de contraseña en el primer login de un usuario que tenga la contraseña por defecto.
- Usar siempre hashing fuerte (por ejemplo, `bcrypt` con factor adecuado) en el backend para almacenar contraseñas.
- Nunca devolver hashes ni contraseñas en las respuestas de la API.

### 1.8. Base de datos

- No se usa `synchronize` en producción.
- Migraciones dedicadas para cambios de esquema.

**Buenas prácticas**:

- Conceder al usuario de base de datos solo los permisos necesarios (principio de mínimo privilegio).
- No reutilizar usuarios root de la base de datos.

---

## 2. Frontend (Vite/React)

### 2.1. Manejo de autenticación

El frontend usa un `useAuthStore` con Zustand:

- Guarda `user` en `localStorage` (para mantener sesión a nivel UI).
- El JWT se guarda en una cookie `HttpOnly` definida por el backend (no accesible desde JavaScript).
- Las llamadas al API se hacen con `credentials: 'include'` y el backend valida el JWT desde la cookie.

**Riesgo**:

- Con tokens en cookies `HttpOnly`, un XSS **no** debería poder leer el JWT directamente.
- Aun así, se incrementa la importancia de evitar XSS y de considerar protección anti-CSRF para operaciones sensibles.

**Mitigaciones recomendadas**:

- Mantener una política estricta de CSP (en el backend) para reducir la superficie de XSS.
- Evitar `dangerouslySetInnerHTML` en React y sanitizar cualquier HTML dinámico.
- Mantener `SameSite` en la cookie (actualmente `lax`) y usar `Secure` en producción.
- Considerar añadir protección CSRF adicional si en el futuro se realizan cambios con más superficie (por ejemplo, si se amplía el uso de cookies en más rutas).

### 2.2. Configuración de API base

- La URL del backend se lee desde `VITE_API_BASE` (build-time).

**Recomendación**:

- No codificar URLs de producción en el código; usar solo variables de entorno.

### 2.3. Dependencias y build

- Usar siempre versiones actualizadas de dependencias (React, Vite, etc.).

**Recomendación**:

- Ejecutar periódicamente `npm audit` y revisar vulnerabilidades críticas.
- Actualizar dependencias que tengan CVEs conocidos.

---

## 3. Infraestructura y despliegue

### 3.1. Variables de entorno y secretos

- No se incluye ningún `.env` real en el repositorio; solo `.env.example`.
- Guías de despliegue (AWS, DigitalOcean, Vercel) recomiendan usar secretos propios de cada plataforma.

**Buenas prácticas**:

- Nunca subir llaves privadas, tokens o secretos reales al repositorio.
- Rotar secretos (JWT, DB, API keys) si hay sospecha de fuga.

### 3.2. HTTPS

- En producción, el frontend y backend deben estar detrás de HTTPS (certificados válidos).

**Recomendaciones**:

- Usar certificados gestionados por la plataforma (Let’s Encrypt, certificados administrados en AWS/DO/Vercel).
- Forzar redirección HTTP → HTTPS (por Nginx/ingress o configuración de la plataforma).

### 3.3. Logs y monitorización

**Recomendaciones**:

- No loguear contraseñas, tokens ni datos altamente sensibles.
- Centralizar logs en una herramienta (CloudWatch, Loki, Elastic, etc.).
- Configurar alertas ante picos inusuales de errores 4xx/5xx o intentos de login fallidos.

---

## 4. Checklist rápida de seguridad

### 4.1. Antes de subir a producción

- [ ] `JWT_SECRET` es largo, aleatorio y distinto a los de otros entornos.
- [ ] `CORS_ORIGIN` solo incluye dominios válidos del frontend.
- [ ] La base de datos usa un usuario con permisos mínimos.
- [ ] Se ejecutaron tests (unitarios + e2e) y pasan.
- [ ] El despliegue está detrás de HTTPS.

### 4.2. Cada cierto tiempo (mantenimiento)

- [ ] Revisar y aplicar actualizaciones de dependencias (`npm outdated`, `npm audit`).
- [ ] Revisar logs de accesos fallidos y tráfico inusual.
- [ ] Validar que no hay endpoints públicos expuestos sin intención.
- [ ] Revisar que las políticas de CORS y Helmet siguen alineadas con el frontend.

### 4.3. Desarrollo diario

- [ ] Usar DTOs con validación para nuevas rutas.
- [ ] No usar `any` para payloads de controladores.
- [ ] Evitar interpolar datos sin escapar en el frontend.
- [ ] Revisar siempre que nuevas features no exponen datos sensibles.

---

## 5. Próximos pasos sugeridos

Si se quiere elevar aún más el nivel de seguridad:

- Implementar autenticación basada en **cookies HTTPOnly** o tokens de corta vida con refresh seguros.
- Añadir un WAF (Web Application Firewall) delante del backend.
- Auditar el modelo de permisos/roles para evitar escaladas de privilegios.
- Añadir tests específicos de seguridad (por ejemplo, pruebas de acceso no autorizado a endpoints protegidos).

