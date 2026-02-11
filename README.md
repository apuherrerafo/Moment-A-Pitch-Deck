# Moment-A Landing Page

## 🎯 Descripción del Proyecto

Moment-A es una plataforma de giveaways creator-driven donde influencers pueden crear sorteos verificados y transparentes para sus comunidades. Los fans participan en estos "Moment-A's" (giveaways) de forma gamificada y tienen la oportunidad de ganar premios reales.

## 🎨 Características de Diseño

### Tecnologías Utilizadas
- **HTML5** puro
- **Tailwind CSS** (vía CDN con plugins de forms y container-queries)
- **Google Fonts**: Space Grotesk (display) y Noto Sans (body)
- **Material Symbols Outlined** para iconografía

### Paleta de Colores
- **Primary**: `#13b6ec` (cyan/azul brillante)
- **Secondary**: `#a855f7` (púrpura)
- **Background Light**: `#f9fafa`
- **Background Dark**: `#121221`

### Efectos Especiales
- `.glass-nav`: Navegación con efecto glassmorphism (backdrop-filter blur)
- `.aura-glow`: Efecto de resplandor radial suave
- Transiciones suaves en hover con scale y shadows
- Bordes redondeados generosos (rounded-3xl)

## 📋 Secciones de la Página

### 1. **Header/Navigation** (sticky)
- Logo de Moment-A con icono infinity
- Barra de búsqueda
- Links: About Us, Explore, How it works, Pricing
- Botones: "Become a host", "Log in", "Join"

### 2. **Hero Section**
- Imagen de fondo (creator con fans)
- Badge: "The Future of Engagement"
- Título grande: "Reward Your Community with Real Giveaways"
- Subtitle descriptivo
- CTAs: "Explore Moment-A's" y "Become a host"

### 3. **Live & Upcoming Moment-A's**
Grid de 6 cards de giveaways:
- PS5 (LIVE)
- iPhone 15 Pro (LIVE)
- Toyota RAV4 (UPCOMING)
- AirPods Pro (LIVE)
- Nike Sneakers (LIVE)
- Trip to Cancún (UPCOMING)

Cada card incluye:
- Imagen del premio
- Badge de status (LIVE/UPCOMING)
- Avatar del creator
- Nombre del creator
- Título del premio
- Descripción
- Botón "View Moment-A"

### 4. **How It Works** (fondo oscuro)
3 pasos con iconos:
- **Create**: Creators set up verified giveaways
- **Participate**: Fans join through gamified challenges
- **Win**: Winners receive real prizes

### 5. **Trust & Featured Hosts** (con efecto aura-glow)
Stats:
- 99.9% Prizes delivered
- 2.5M+ Active members

Grid de 4 featured creators con avatares y follower counts

### 6. **CTA Section** (gradiente vibrante)
- "Ready to reward your fans?"
- Botón "Host Application"
- Imagen de creators colaborando

### 7. **Pricing**
2 cards:
- **For Entrants**: Free (unlimited entries, gamified participation)
- **For Hosts**: $49/month (unlimited creation, analytics, priority support)

### 8. **Footer**
- Logo y descripción
- Links organizados: Platform, Support, Legal
- Social media icons

## 🚀 Cómo Usar

### Visualización Local
Simplemente abre el archivo `index.html` en tu navegador:

```bash
# Opción 1: Doble clic en el archivo
# Opción 2: Desde la terminal
start index.html
```

### Desarrollo Futuro
Esta landing page será la base para un sistema completo con múltiples flujos de usuario:
- Sistema de autenticación de usuarios
- Dashboard de creators
- Dashboard de entrants
- Sistema de creación de giveaways
- Sistema de participación gamificada
- Panel de administración

## 📱 Responsive Design
La página es completamente responsive con breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎭 Modo Dark/Light
La página soporta modo oscuro usando la clase `dark` en el elemento `<html>`. Para cambiar entre modos, modifica:

```html
<!-- Light mode -->
<html class="light" lang="en">

<!-- Dark mode -->
<html class="dark" lang="en">
```

## 🔗 CDN Links Utilizados
- Tailwind CSS: `https://cdn.tailwindcss.com?plugins=forms,container-queries`
- Google Fonts: Space Grotesk & Noto Sans
- Material Symbols: Outlined variant

## 📝 Notas Importantes
- Las imágenes utilizan placeholders de Unsplash y Pravatar
- Los avatares de creators son generados con Pravatar
- Todos los botones tienen hover effects apropiados
- La navegación es sticky con efecto glass
- 100% responsive en todos los dispositivos

## 🎯 Próximos Pasos
1. Implementar sistema de autenticación
2. Crear flujos de usuario (Creator/Entrant)
3. Desarrollar backend para giveaways
4. Integrar sistema de pagos
5. Implementar gamificación
6. Añadir analytics y tracking

---

**Versión**: 1.0.0  
**Fecha**: Febrero 2024  
**Autor**: Moment-A Team
