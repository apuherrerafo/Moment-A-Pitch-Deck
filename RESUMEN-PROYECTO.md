# Resumen completo del proyecto Moment-A Pitch Deck

Documento técnico para traspaso a asistente externo. Incluye objetivo, stack, estructura, flujos, estado actual, errores conocidos y decisiones de diseño.

---

## 1. Objetivo del proyecto

**Qué es:** Moment-A es una **landing / pitch deck** (sitio estático) que presenta una plataforma de **giveaways impulsados por creadores** (influencers). Sirve como demo y material de presentación, no como producto en producción.

**Para qué sirve:**
- Mostrar el concepto: creadores lanzan sorteos verificados; la comunidad participa de forma gamificada y puede ganar premios reales.
- Demostrar flujos de usuario: explorar giveaways, ver perfiles de hosts, registro (Sign Up) y login con un auth de demostración.
- Base para futuras fases: autenticación real, dashboards de creators/entrants, backend de giveaways, pagos, gamificación.

**No incluye (aún):** Backend, base de datos real, APIs, sistema de pagos, lógica real de sorteos ni dashboards.

---

## 2. Stack tecnológico

| Tecnología | Uso | Versión / Origen |
|------------|-----|-------------------|
| **HTML5** | Markup de todas las páginas | — |
| **Tailwind CSS** | Estilos (utility-first) | CDN: `cdn.tailwindcss.com?plugins=forms,container-queries` |
| **JavaScript (vanilla)** | Lógica de modales, auth, navegación | ES5-compatible, sin bundler |
| **Google Fonts** | Tipografía | Space Grotesk (display), Noto Sans (body) |
| **Material Symbols Outlined** | Iconos | CDN Google Fonts |
| **localStorage** | Persistencia de usuarios y sesión (demo) | API del navegador |

**Sin:** Node/npm, framework JS (React/Vue/etc.), preprocesadores CSS, base de datos, servidor propio. Todo es estático + CDNs + un único archivo JS (`auth.js`).

---

## 3. Estructura del proyecto

```
Moment-A-Pitch-Deck/
├── index.html              # Landing principal: hero, explore, how it works, trust, CTA, pricing, footer
├── hosts.html              # Listado de creators/hosts con carrusel y grid
├── host-profile.html       # Perfil del host @CarLifestyle (Toyota RAV4)
├── sneakerhead-profile.html # Perfil @SneakerHead (Nike Sneakers)
├── techguru-profile.html   # Perfil @TechGuru (iPhone 15 Pro)
├── ireviewer-profile.html  # Perfil @iReviewer (iPhone 15 Pro Max) — layout mínimo
├── travelwithme-profile.html # Perfil @TravelWithMe (Trip to Cancún) — layout mínimo
├── auth.js                 # Lógica de auth: Sign Up multi-step, Login, localStorage, actualización de nav
├── README.md               # Documentación del proyecto (diseño, secciones, uso local)
└── RESUMEN-PROYECTO.md     # Este documento
```

**Descripción por archivo:**

- **index.html:** Página de inicio. Incluye navegación (con `#nav-guest` y `#nav-user`), hero, grid de Moment-A's, How It Works, Trust & Featured Hosts, CTA, Pricing, footer. Modales: `logInModal`, `signUpModal` (multi-step). No tiene `enterRequiredModal` (solo en perfiles).
- **hosts.html:** Página de descubrimiento de hosts. Carrousel de creators destacados, scroll horizontal de cards, footer. Incluye `logInModal`, `signUpModal`, `nav-guest`, `nav-user`. Sin `enterRequiredModal`.
- **host-profile.html, sneakerhead-profile.html, techguru-profile.html:** Perfiles “completos”: nav con links, breadcrumb, hero del giveaway, botón “Enter Moment-A”, feed/related content, footer. Cada uno tiene `logInModal`, `enterRequiredModal`, `signUpModal` y `nav-guest` / `nav-user`.
- **ireviewer-profile.html, travelwithme-profile.html:** Perfiles “mínimos”: nav simple (logo + “Back to Hosts”), sección central con avatar, título del giveaway y botón “Enter Now”, footer. Tienen `enterRequiredModal` y `signUpModal`; **no** tienen `logInModal` ni `nav-guest`/`nav-user` en la barra.
- **auth.js:** Un solo script compartido. Gestiona: apertura/cierre de modales con animación (transform origin desde el botón), flujo Sign Up en 4 pasos, validación OTP (código fijo `111111`), guardado en `localStorage`, login por teléfono/email + PIN, y `updateNavForAuth()` para mostrar “abc123” y ocultar Log in / Sign Up.

---

## 4. Flujo de funcionamiento (usuario)

1. **Entrada:** El usuario abre `index.html` (o cualquier página). Ve la landing o el listado de hosts o un perfil.
2. **Navegación:** Desde index puede ir a Explore → Moment-A's o Hosts. En Hosts ve un carrusel y cards que enlazan a perfiles concretos (`host-profile.html`, `sneakerhead-profile.html`, etc.).
3. **Sin sesión (nav “guest”):** En index, hosts y perfiles completos ve los botones “Log in” y “Sign Up” en la barra.
4. **Sign Up (crear cuenta):**
   - Clic en “Sign Up” (o “Sign Up” desde el modal de Enter en un perfil).
   - **Paso 1:** Completa DNI, teléfono, email; marca “I accept the Terms and Conditions”, “I accept the Privacy Policy” y opcionalmente promociones. Clic en “Continue”.
   - **Paso 2:** Mensaje de “código enviado al teléfono”. El usuario debe ingresar un código de 6 dígitos. En demo, el único código aceptado es **111111** (no se muestra en UI). Botón “Verify”.
   - **Paso 3:** Crear PIN de 6 dígitos. Botón “Create Account”.
   - **Paso 4:** Mensaje “Account created successfully!” y botón “OK”. Al hacer clic se cierra el modal y se considera usuario logueado.
5. **Login:** Desde “Log in” o desde “Enter Moment-A” en un perfil se abre el modal correspondiente. El usuario ingresa teléfono o email y PIN de 6 dígitos. Si coinciden con un usuario guardado en `localStorage`, se cierra el modal y se actualiza la nav.
6. **Con sesión (nav “user”):** En páginas que tienen `#nav-guest` y `#nav-user`, los botones Log in / Sign Up se ocultan y se muestra el texto **abc123** (siempre el mismo nombre de demostración).
7. **Enter Moment-A (perfiles):** En cualquier perfil, al hacer clic en “Enter Moment-A” o “Enter Now” se abre `enterRequiredModal` con el mensaje de que debe iniciar sesión, campos teléfono/email y PIN, y enlace a Sign Up. Tras login exitoso desde ahí, el usuario “queda participando” en ese contexto (solo demo; no hay lógica de participación real).

**Persistencia:** Usuarios y sesión viven en `localStorage` (`momentA_users`, `momentA_currentUser`). No hay backend ni cookies de sesión.

---

## 5. Estado actual

**Funcionando correctamente:**
- Carga de todas las páginas HTML y estilos (Tailwind vía CDN).
- Navegación entre index, hosts y perfiles mediante enlaces.
- Footer idéntico en todas las páginas (brand, Platform, Support, Legal, copyright).
- Modales con animación (scale desde el botón, overlay con blur).
- Sign Up multi-step: validación de campos, OTP `111111`, PIN 6 dígitos, guardado en `localStorage`.
- Login por teléfono/email + PIN contra datos de `localStorage`.
- En páginas con nav completa: alternancia entre “Log in”/“Sign Up” y “abc123” según haya sesión o no.
- En perfiles: botón “Enter Moment-A”/“Enter Now” abre el modal de login requerido y desde ahí se puede ir a Sign Up.
- Responsive y modo oscuro (clase `dark` en `<html>`) en las páginas que lo usan.

**Incompleto o limitado:**
- Barra de búsqueda sin lógica (no filtra).
- Botones “Become a host”, “Host Application”, “See Rules” sin flujo real.
- Enlaces “Forgot password?”, “Terms and Conditions”, “Privacy Policy” son placeholders (# o sin destino).
- No hay logout: no hay botón para cerrar sesión ni limpiar `momentA_currentUser`.
- Perfiles mínimos (ireviewer, travelwithme) no muestran “abc123” en la barra al estar logueado (no tienen `nav-user`).
- Contenido de giveaways y hosts es estático (texto e imágenes de placeholder); no hay datos dinámicos ni API.

---

## 6. Errores conocidos

- **OTP hardcodeado:** El código válido es `111111`; está en `auth.js` como `VALID_OTP`. No se indica en la UI; es intencional para pruebas pero puede confundir a usuarios que no lo sepan.
- **Duplicación de IDs en modales:** En páginas con varios modales (p. ej. host-profile) existen varios `id="dni"`, `id="email"`, `id="phone"`, `id="terms"`, etc. (uno por paso/modal). El script usa `getElementById` y toma el primero que encuentra; si se duplican pasos o formularios puede haber conflictos.
- **Sin logout:** El usuario logueado no puede cerrar sesión desde la UI; solo borrando `localStorage` o con una consola.
- **Nav en perfiles mínimos:** En `ireviewer-profile.html` y `travelwithme-profile.html` no se actualiza la barra al iniciar sesión (no tienen `#nav-guest` ni `#nav-user`).
- **Mensajes en inglés:** Alertas y textos de auth están en inglés; el resto del sitio mezcla inglés y español.
- **Dependencia de `auth.js`:** Si `auth.js` no carga (ruta incorrecta, bloqueador), los botones Log in / Sign Up / Enter no harán nada o darán error en consola.

---

## 7. Decisiones de diseño importantes

- **Sin build:** Todo es HTML/CSS/JS estático. Tailwind se usa por CDN con configuración en `<script id="tailwind-config">` en cada HTML. No hay npm ni compilación.
- **Un solo script de auth:** Toda la lógica de autenticación y modales está en `auth.js`. Se carga al final del `<body>` en todas las páginas que tienen modales. Las funciones se exponen en `window` (p. ej. `openEnterModal`, `openSignUpModal`) para `onclick` en el HTML.
- **Modales por ID:** Los modales se identifican por ID (`logInModal`, `signUpModal`, `enterRequiredModal`). `auth.js` usa `getElementById` y comprueba existencia antes de usar; las páginas que no tienen un modal no lo incluyen en el DOM.
- **Sign Up en pasos:** El flujo de registro está dividido en 4 bloques en el mismo `<form id="signUpForm">`: `signUpStep1` … `signUpStep4`. La visibilidad se controla con `display` desde JS (`showSignUpStep`, `resetSignUpSteps`). El submit del form dispara el handler del paso actual según qué paso esté visible.
- **Datos de usuario en demo:** Se guarda `{ dni, phone, email, pin }` por usuario. La “sesión” es `{ displayName: 'abc123', email, phone }`. El nombre mostrado es siempre `abc123` (constante `DISPLAY_USERNAME`).
- **Footer único:** El mismo bloque de footer (logo, descripción, iconos sociales, enlaces Platform/Support/Legal, copyright) está copiado en cada HTML para mantener consistencia sin includes ni SSR.
- **Animación de modales:** El contenido del modal usa `transform: scale(0.05)` inicial y al abrir `scale(1)`, con `transform-origin` calculado desde la posición del botón que abrió el modal para un efecto de “crecimiento” desde el clic.
- **Paleta y clases:** Colores custom en Tailwind: `primary` (#13b6ec), `secondary` (#a855f7), `background-light`, `background-dark`. Clases propias: `.glass-nav`, `.aura-glow`, `.modal-overlay`, `.modal-content` definidas en `<style>` en cada página que las usa.

---

*Documento generado para traspaso a asistente externo. Repositorio: https://github.com/apuherrerafo/Moment-A-Pitch-Deck*
