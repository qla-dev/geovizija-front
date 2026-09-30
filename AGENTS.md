# Geovizija frontend

React + Vite site served at https://geovizija.com. This repo is the web root: `.htaccess` serves the built `dist/`, falls back to `dist/index.html` for client routes, and passes `/endpoints/*` (the Laravel backend, a separate repo cloned into `endpoints/`) and `/redeploy.php` through untouched.

The API lives at `https://geovizija.com/endpoints/api/...` (`/categories`, `/posts`, `/posts/{id or slug}`).

# Deployment

After pushing, redeploy by opening (plain-text streamed output):

- Frontend: https://geovizija.com/redeploy.php — `git pull --ff-only`, `npm ci`, `npm run build`
- Backend: https://geovizija.com/endpoints/redeploy.php — `git pull --ff-only`, `composer install --no-dev`, clears caches, `config:cache`

`npm ci` requires `package-lock.json` to be committed and in sync with `package.json`.

Do not commit `dist/`, `node_modules/` or `endpoints/`.
