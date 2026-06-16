# AGENTS.md — 浙里Trip

## Project Layout

Two independent apps in one repo:

- `app/` — Python FastAPI backend (entry: `app/main.py`)
- `h5/` — React 19 + Vite + Tailwind 4 frontend (entry: `h5/src/main.tsx`)

Backend creates `data/zheilitrip.db` (SQLite) at startup. Config via `.env` (pydantic-settings).

## Commands

```bash
# Start both (backend :8000, frontend :5173)
./start_all.sh
# Stop both
./start_all.sh stop

# Backend only
source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Frontend only (from h5/)
npm run dev          # dev server on :2001 (CLI arg) or :5173 (vite.config default if no arg)
npm run build        # tsc -b && vite build
npm run typecheck    # tsc --noEmit (preferred)
npx tsc --noEmit     # type-check only (run from h5/)
npm run lint         # eslint

# Single backend endpoint test
curl http://localhost:8000/health
```

Always run `npm run typecheck` from `h5/` before considering frontend changes complete. There is no test suite.

## Architecture

### Backend (`app/`)

| File | Role |
|---|---|
| `main.py` | App entry, CORS, router registration |
| `config.py` | `Settings` singleton from `.env` |
| `models.py` | All Pydantic request/response models |
| `routes.py` | Travel + Amap + LLM routes (**sync `def`, not `async`**) |
| `user_routes.py` | User auth + preferences (**sync `def`, not `async`**) |
| `llm_service.py` | LLM manager (BigModel/DeepSeek), prompt logic |
| `amap_service.py` | Amap REST API wrapper |
| `image_cache.py` | Global image cache manager |
| `template_renderer.py` | HTML invitation template renderer |
| `templates/` | 3 HTML templates (gradient/glow/ink) |
| `database.py` | SQLite init, `get_db()` context manager |
| `utils/hexagram.py` | 64 hexagram travel hints |

### Frontend (`h5/src/`)

| Path | Role |
|---|---|
| `stores/travelStore.ts` | Travel state, plan generation, location cache |
| `stores/userStore.ts` | Auth + preferences (calls backend API) |
| `services/amap.ts` | Amap JS SDK wrapper (browser-side) |
| `services/mock.ts` | Mock destinations for fallback |
| `pages/HomePage/` | Landing with video background |
| `pages/SelectPage/` | Direction/style/time picker |
| `pages/LoadingPage/` | Triggers plan generation |
| `pages/InvitationPage/` | LLM-generated HTML invitation |
| `pages/ProfilePage/` | User preferences form |
| `components/BaguaDivination/` | Leaf-scatter hexagram animation |
| `utils/hexagram.ts` | 64 hexagram map + destination selection |

Path alias: `@/` → `h5/src/`.

### API Proxy

Vite proxies `/api` → `localhost:8000` in dev. Frontend also uses `VITE_API_BASE` (defaults to `http://localhost:8000`) for direct calls in stores.

## Key Gotchas

- **LLM JSON parsing**: Extracts JSON from `` ```json `` fences only. If LLM returns bare JSON or embeds HTML in JSON, parsing fails → falls back to mock data. Keep prompts strict.
- **LLM model fallback chain**: `glm-4.7` → `glm-4.6v` → `glm-4.5-air`. Implemented in `chat_with_fallback()`. Each model is tried in order; first success wins.
- **Image caching**: Searched images are downloaded and cached in `data/images/{目的地}/`. Naming: `{category}_{spot}_{seq}.jpg`. Served via `GET /api/v1/images/{dest}/{file}`. Cache is global (shared across all users).
- **No auth tokens**: Login returns user info but no JWT. Preferences API uses `user_id` in URL path — no server-side session validation.
- **Location caching**: `userLocation` and `locationStatus` are cached in `localStorage` (key: `zheilitrip-location`). `reset()` preserves location. Don't clear it unless intentional.
- **Race conditions**: `travelStore` uses a `generationCounter` to discard stale plan generation results. If modifying `generatePlan`/`generateRichPlan`, preserve this pattern.
- **DOMPurify**: LLM HTML output is sanitized with DOMPurify in `InvitationPage`. Any new place rendering LLM HTML must also sanitize.
- **SQLite `init_db()`**: Runs at module import time (`database.py`). Table schema changes need `ALTER TABLE` or DB deletion — no migration tool.
- **Password hashing**: Uses `hashlib.pbkdf2_hmac` (not bcrypt). Comparison uses `hmac.compare_digest` for timing safety. Max password length is not enforced.
- **Amap SDK key**: Frontend Amap JS SDK key is hardcoded in `h5/index.html` `<script>` tag, not in `.env`.
- **Dev port**: `npm run dev` uses port 2001 (CLI arg in package.json). `start_all.sh` uses port 5173 (its own `--port 5173` arg). Vite config `server.port` is only the default when no CLI arg is given. These are inconsistent — pick one and be aware.
- **No test suite**: No unit/integration tests exist. Verify changes manually or with `curl`.

### Frontend

- **React.lazy code splitting**: All page components are lazy-loaded via `React.lazy()`. The app shell (`App.tsx`) loads only `framer-motion`, `react-router-dom`, and `ErrorBoundary` eagerly.
- **Zustand selectors**: All components use `useShallow` or individual selectors to avoid unnecessary re-renders. When adding new store consumers, always use selectors.
- **ErrorBoundary**: `App.tsx` wraps the router in `<ErrorBoundary>`. If a page throws during render, the user sees a "返回首页" fallback instead of a white screen.
- **DOMPurify**: LLM HTML is sanitized with a tight allowlist (no `<style>`, `<script>`, `<iframe>`). The `FORBID_TAGS` list includes `style` to prevent CSS injection.
- **prefers-reduced-motion**: `tokens.css` includes a `@media (prefers-reduced-motion: reduce)` override that disables all animations.
