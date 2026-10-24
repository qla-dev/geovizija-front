# Geovizija frontend

React + Vite site served at https://geovizija.com. This repo is the web root: `.htaccess` serves the built `dist/`, falls back to `dist/index.html` for client routes, and passes `/endpoints/*` (the Laravel backend, a separate repo cloned into `endpoints/`) and `/redeploy.php` through untouched.

The API lives at `https://geovizija.com/endpoints/api/...` (`/categories`, `/posts`, `/posts/{id or slug}`).

All content comes from that API: `services/api.ts` is the client, `components/ContentProvider.tsx` loads categories and posts once, and pages read them with `useContent()`. There is no mock data at runtime.

The shared post loader follows every API page. `ArticlePage` also fetches `/posts/{id or slug}` when an article is absent from the shared list; only an API 404 shows "not found", while temporary failures offer a retry.

`index.html` declares `geovizija:article-loader=direct-api-v1` for the backend's sharing guard; keep it aligned with direct article lookup. `og.php` includes the exact `geovizija:post-id` in crawler previews. Deploy this frontend before a backend that requires these checks; the backend intentionally refuses to share with an older deployment.

Production HTTP and `www` requests redirect with 308 to `https://geovizija.com`, keeping the path and query string (including Facebook tracking). The HTTPS check also respects the host's `X-Forwarded-Proto` TLS proxy header to avoid loops. HTML responses use `no-store` so mobile in-app browsers do not retain an obsolete app entry page; hashed assets remain cacheable. Do not allow the app to run on the HTTP origin: the API intentionally permits the HTTPS origins only.

Backend switch (`VITE_API_BACKEND`, set in `.env.local`, see `.env.example`):

- `production` (default) — `https://geovizija.com/endpoints/api`, also from a local `npm run dev`
- `local` — `http://127.0.0.1:8000/api` (`php artisan serve` in the backend repo)

# Deployment

After pushing, redeploy by opening (plain-text streamed output):

- Frontend: https://geovizija.com/redeploy.php — `git pull --ff-only`, `npm ci`, `npm run build`
- Backend: https://geovizija.com/endpoints/redeploy.php — `git pull --ff-only`, `composer install --no-dev`, clears caches, `config:cache`

`npm ci` requires `package-lock.json` to be committed and in sync with `package.json`.

Do not commit `dist/`, `node_modules/` or `endpoints/`.
