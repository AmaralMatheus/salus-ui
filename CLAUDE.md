# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run serve   # dev server at http://localhost:8080
npm run build   # production build
npm run lint    # ESLint via vue-cli-service
```

There are no tests. The `.github/workflows/percy.yml` CI workflow is broken — `percy:run` script and `@percy/cli` package are both missing. It fires on every PR and fails. Safe to delete the file.

## Environment

Requires a `.env` file at the root with these variables:

```
VUE_APP_API_URL=
VUE_APP_S3_ACCESS_KEY=
VUE_APP_S3_SCRT=
VUE_APP_S3_REGION=
VUE_APP_IBGE_API_URL=
VUE_APP_API_CEP_URL=
VUE_APP_G_CALENDAR_TOKEN=
VUE_APP_G_CALENDAR_API_URL=
```

In development, axios `baseURL` is set to `http://localhost:8080` (`src/bootstrap.js`). `vue.config.js` sets up a dev proxy at `/api` → `localhost:8080`. The backend is a Laravel API hosted on Heroku; locally it can also be proxied through ngrok (the `ngrok-skip-browser-warning` header is included in all authenticated requests via `authHeader()`).

`VUE_APP_API_URL` must end with a trailing slash (e.g. `https://host/api/`) — all service calls concatenate paths directly onto it without a separator.

## Architecture

**Stack:** Vue 3 (Options API throughout — do not use Composition API), Vuetify 3, Vuex 4, Vue Router 4, axios, date-fns v4, vue3-toastify, maska.

**Directory layout:**
- `src/pages/` — route-level views (one file per route)
- `src/components/` — domain-organized components: `agenda/`, `client/`, `company/`
- `src/services/` — axios API wrappers (one class per domain, exported as singleton)
- `src/store/` — Vuex store with a single `auth` module
- `src/router.js` — all routes + `beforeEach` auth guard
- `src/bootstrap.js` — global axios config (baseURL, headers)

**API calls:** All HTTP calls go through service classes in `src/services/`. Every authenticated request passes `authHeader()`, which reads `localStorage.getItem('user')` and returns `{ Authorization: 'Bearer <token>', ... }`. Auth state lives in `this.$store.state.auth.user`.

**User types:** `currentUser.type === 1` means doctor/admin. This flag gates visibility of UI elements throughout the app (e.g. "Doutor" selector in Scheduler, settings menu, full appointment list vs. personal view).

**Agenda module:** `src/pages/Agenda.vue` is the main calendar page with daily/weekly/monthly views. It shares `MiniCalendar.vue` (a reusable Monday-first calendar) with the `Scheduler.vue` modal. `MiniCalendar` accepts `v-model` (Date) and an `appointments` array for dot indicators.

**Brand identity:** Primary color `#C62424` (red). Font: Montserrat (loaded via Google Fonts in `App.vue`). SVG icons from `src/assets/` are recolored to red using CSS `filter: invert(15%) sepia(90%) saturate(2200%) hue-rotate(345deg) brightness(82%) contrast(100%)`. Active nav icons use `filter: invert(0) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(300%) contrast(110%)`.

**Sidebar nav:** `App.vue` renders a collapsible sidebar (`width: 58px` → `220px` on hover) with nav items in `.nav-top` and feedback shortcut in `.nav-bottom`.

**Feedback module:** `FeedbackDialog.vue` (triggered from sidebar) sends a POST to Formspree (`https://formspree.io/f/xbdeyjwj`) with `email`, `rating`, `category`, `message`, and `contato` fields.
