# Moment-A Pitch Deck — Project Rules & Design System

## CRITICAL: Read this before writing ANY code for this project.

---

## 1. Project Identity

**Moment-A** is a creator-powered giveaway platform. This repo is a static pitch deck / demo site — NOT a production app. There is no backend, no database, no real APIs. Everything is HTML + Tailwind CSS (CDN) + vanilla JS.

**Purpose:** Demonstrate 3 key flows for investors/stakeholders:
1. Entrant flow: Explore → Host Profile → Enter Moment-A → Sign Up → Subscribe → View Moment-A's
2. Host flow: Become a Host → Fill application form → Submit
3. Live Moment-A: Watch/participate in a live color-elimination giveaway

---

## 2. Tech Stack (DO NOT deviate)

| Tech | How | Notes |
|------|-----|-------|
| HTML5 | Semantic markup | One .html file per page |
| Tailwind CSS | CDN only | `cdn.tailwindcss.com?plugins=forms,container-queries` |
| JavaScript | Vanilla ES5+ | No frameworks. No npm. No bundler. |
| Google Fonts | CDN | Space Grotesk (headings), Noto Sans (body) |
| Material Symbols Outlined | CDN | Icons |
| localStorage | Browser API | All persistence (demo only) |

**NEVER:**
- Install npm packages or suggest npm/node workflows
- Use React, Vue, Svelte, or any JS framework
- Create a build step, bundler, or preprocessor
- Use fonts other than Space Grotesk and Noto Sans
- Use icon libraries other than Material Symbols Outlined

---

## 3. Visual Design System

### Color Palette (defined in Tailwind config in each HTML file)

- **primary:** #13b6ec (cyan/blue — main brand color)
- **secondary:** #a855f7 (purple — accent)
- **background-light:** #f8fafc
- **background-dark:** #0f172a

### Aesthetic Direction

- **Dark mode first** — the site uses class="dark" on <html>. All new pages must support dark mode.
- **Glassmorphism** — nav and key cards use .glass-nav class (backdrop-blur, semi-transparent bg, subtle border).
- **Gradient accents** — primary-to-secondary gradients on section headers, CTAs, and decorative elements.
- **Aura glow** — .aura-glow class for subtle colored glows behind hero elements.
- **Smooth animations** — modals scale from click origin (transform-origin calculated from button position). Hover states on cards use scale + shadow transitions.
- **Rounded corners** — rounded-xl to rounded-2xl on cards and containers. rounded-lg on inputs.
- **Spacing** — generous padding. Sections use py-16 to py-24. Content max-width is typically max-w-7xl for grids, max-w-3xl for forms.

### DO NOT:

- Use flat white backgrounds (always dark mode compatible)
- Use generic card designs without the glass/gradient treatment
- Use sharp corners (always rounded)
- Break the color palette with random colors
- Use inline styles when Tailwind classes exist

---

## 4. Page Architecture Patterns

### Navigation

Every page with full nav MUST have:

- **#nav-guest** — Shown when logged out: Logo, links, Log in button, Sign Up button
- **#nav-user** (class="hidden" by default) — Shown when logged in: Logo, links, user display name

The auth.js script toggles visibility based on localStorage session.

### Modals

- Identified by ID: logInModal, signUpModal, enterRequiredModal
- Each modal has .modal-overlay (fixed inset-0, bg-black/60, backdrop-blur) and .modal-content (the panel).
- Modal open/close uses transform scale animation with origin from click position.
- Functions are exposed on window: openLogInModal(), openSignUpModal(), openEnterModal(), closeModal(id).

### Footer

Identical across ALL pages. Contains: brand column (logo + description + social icons), Platform links, Support links, Legal links, copyright bar.

### Scripts

- auth.js is loaded at the END of <body> on every page that has auth modals.
- Page-specific JS goes in a <script> tag BEFORE auth.js.
- Functions that need to be called from HTML onclick must be on window.

---

## 5. Form Design Patterns

When creating forms (like the Host Application):

- Use the SAME visual language as the Sign Up modal flow:
  - Dark card containers with subtle borders (border-white/10 or border-gray-700)
  - Inputs: bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent
  - Labels: text-sm font-medium text-gray-300 mb-1
  - Section headers: gradient background (primary to secondary), white text, rounded-lg, px-6 py-3
  - Buttons primary: bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl px-8 py-3 hover:opacity-90 transition
  - Error messages: text-red-400 text-sm mt-1
  - Checkboxes/radios: accent-primary or styled with Tailwind forms plugin

- Multi-step forms use step divs (step1, step2, etc.) toggled with display: none/block.
- Always include a progress indicator (step dots or progress bar with gradient fill).

---

## 6. File Naming & Structure

```
Moment-A-Pitch-Deck/
├── index.html                # Landing page
├── hosts.html                # Host discovery
├── host-profile.html         # Full profile (CarLifestyle)
├── sneakerhead-profile.html  # Full profile (SneakerHead)
├── techguru-profile.html    # Full profile (TechGuru)
├── ireviewer-profile.html    # Minimal profile
├── travelwithme-profile.html # Minimal profile
├── host-application.html     # NEW: Host application form
├── live-momenta.html         # NEW: Live giveaway experience
├── auth.js                   # Shared auth logic (DO NOT MODIFY unless explicitly asked)
├── README.md
├── PROJECT-RULES.md          # This file
└── RESUMEN-PROYECTO.md
```

**Rules:**

- New pages = new .html files. Never cram new flows into existing pages.
- New JS logic = <script> in the page OR a new .js file. Do NOT bloat auth.js with unrelated logic.
- All IDs must be unique within a page. If a page has multiple modals, prefix IDs to avoid collisions.

---

## 7. Content Language

- ALL UI text in English.
- Demo/placeholder data uses Peruvian context (+51, Lima, etc.).
- The platform is worldwide — use international labels (Country, City, ID Number) not local ones (Departamento, Provincia, DNI).

---

## 8. Auth & Demo Data

- OTP code for demo: **111111** (hardcoded in auth.js as VALID_OTP)
- Display username after login: **abc123** (hardcoded as DISPLAY_USERNAME)
- User data stored in localStorage key: **momentA_users**
- Current session: localStorage key: **momentA_currentUser**
- New features should store data under **momentA_** prefixed keys (e.g., momentA_hostApplications)

---

## 9. Common Mistakes to Avoid

1. **Forgetting dark mode** — never use bg-white without dark mode equivalent. Since the site is dark-mode-first, just use dark colors directly.
2. **Duplicating IDs across modals** — use prefixed IDs (e.g., host-app-email not just email).
3. **Breaking auth.js** — this file is shared and fragile. Add new logic elsewhere.
4. **Using npm/React** — this is a STATIC site. CDN only.
5. **Inconsistent footer** — copy the exact footer from index.html.
6. **Missing Tailwind config** — every new HTML file needs the `<script id="tailwind-config">` block with the custom colors.
7. **Forgetting to load auth.js** — if the page has login/signup functionality, it needs auth.js.
