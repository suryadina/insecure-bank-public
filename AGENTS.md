# AGENTS.md

Context for AI agents and developers working on **Insecure Bank** — an
intentionally vulnerable banking lab for security training.

## Read this first

- **This app is deliberately insecure.** Every service contains real,
  student-facing vulnerabilities (see `docs/master-list.json`, 27 findings).
  Do NOT "fix" these, add auth, or harden endpoints unless explicitly asked —
  that defeats the purpose of the lab.
- **Never deploy where real data or real money is involved.** For authorized
  security training only.
- The master list of findings lives in `docs/master-list.json`. It is the
  canonical source of truth for what vulnerabilities exist and how they map to
  the 7 services. `LAB-XX` IDs are used to reference findings.

## Architecture

Docker Compose stack (9 services), all on one `insecure-bank-network`:

| Service | Tech | Port (internal) | Purpose |
|---|---|---|---|
| `postgresql` | postgres:15-alpine | 5432 (host-exposed) | Shared DB, seeded by `init-db.sql` |
| `auth-service` | Spring Boot (Java) | 8080 | Registration, login, OTP, device enrollment |
| `transaction-service` | Node.js | 8081 | Transfers, withdrawals, search |
| `customer-service` | Node.js | 8083 | Hidden customer-service portal |
| `db-admin` | Python | 8082 | DB admin web UI |
| `frontend-react` | React (nginx) | 80 | Main banking SPA |
| `game-service` | Kotlin (Spring) | 9090 | Gamification API |
| `game-frontend` | React (nginx) | 80 | Gamification SPA |
| `wordpress-db` | mysql:8.0 | 3306 (wordpress-net) | Blog DB (MySQL) |
| `wordpress-blog` | WordPress (Apache) | 80 (wordpress-net) | Corporate blog + leaked `.git` + upload plugin |
| `api-gateway` | nginx:alpine | 80 (host) | Route mapping (`nginx.conf`) |

### Gateway routes (`nginx.conf`)

| Path | Backend |
|---|---|
| `/api/auth` | auth-service |
| `/api/transactions` | transaction-service |
| `/api/cs` | customer-service |
| `/TtFkwWSGlzyMrua` | db-admin |
| `/app/api/` | game-service |
| `/app/` + `/app` | game-frontend |
| `/blog/` | wordpress-blog |
| `/health/auth` etc. | per-service health |
| `/` | frontend-react |

`/api/transactions/deposit` returns 404 from the gateway on purpose — it is
only reachable internally via the game-service SSRF webhook.

## Deploy

Requires Docker + Docker Compose v2.

```bash
docker compose up -d --build
```

Wait for `api-gateway` to depend on all services healthy, then:

- Bank app: `http://localhost/`
- Game app: `http://localhost/app/`
- Blog: `http://localhost/blog/`
- DB admin: `http://localhost/TtFkwWSGlzyMrua/`

### Build notes

- Both React frontends build inside their Dockerfiles (node:18-alpine →
  nginx:alpine). No host-side `npm install`/`npm run build` needed.
- On a small VPS (≤4GB RAM), build one service at a time to avoid OOM:
  ```bash
  docker compose build frontend-react
  docker compose build
  docker compose up -d
  ```
- `postgresql` needs the most care: it has `mem_limit: 1g` and 300
  connections / 512MB shared_buffers tuned in the compose file.

## Verify after deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/          # 200 (bank)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/app/      # 200 (game)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/health/auth  # 200
docker compose ps   # all 9 services Up
```

## Reset / reseed

First boot seeds the DB from `init-db.sql`. To wipe and re-seed:

```bash
docker compose down -v
docker compose up -d --build
```

## Common gotchas

- **The DB password** (`yxjccsKBzvr8Ywh87OZuVXwnyZfB` in `docker-compose.yml`)
  is a workshop value, not a real secret — do not treat it as one.
- **Seed data resets** on `down -v`. If a student's state "disappears", that's
  the 6-hour reset behaviour by design.
- **auth-service leak**: on a long-running lab, auth-service can OOM if its
  inquiry/phone-lookup paths create a new `HttpClient` per request. If you see
  `unable to create native thread` in auth logs, the fix is to share one
  `httpClient` (AuthService.kt) — but only fix if asked; the lab is meant to
  run with the intentional vulns present.
- **Do not add** new auth headers, rate limits, WAF rules, or scan-detection
  at the gateway unless asked — it changes the challenge surface students
  are tested against.

## Code layout (per service)

- `auth-service/src/main/kotlin/...` — Spring Boot Kotlin
- `transaction-service/src/...` — Node.js
- `customer-service/src/...` — Node.js
- `db-admin/...` — Python
- `frontend-react/src/...` — React + TypeScript
- `game-service/src/...` — Kotlin (Spring), Gradle
- `game-frontend/src/...` — React + TypeScript
- `wordpress-blog/` — WordPress (Apache/PHP); plugin at `wp-content/plugins/bank-media-uploader/`, leaked git at `leaked-git/` (served as `/blog/.git/`), seed posts in `seed-posts.xml`

## WordPress blog notes

- The blog runs **isolated** on `wordpress-net` (only `wordpress-blog` + `wordpress-db` + `api-gateway`). The container is `www-data`, read-only rootfs, caps dropped — even the intentional upload RCE cannot reach the bank/game services.
- First boot seeds posts from `seed-posts.xml` and creates `publisher.bot` (admin, password `admin123`, bcrypt-hashed) as the ONLY WordPress user. `admin` is deleted.
- `diagnostics.php` is the intentional error-based SQLi (master list LAB-27); `staff_accounts` table mirrors the `wp_users` hash.
- The `leaked-git/` dir is a real git repo (`.git` contents) served at `/blog/.git/`; rebuild it with a work-tree overlay if you change the plugin files, keeping the same HEAD file set (README.md + plugin PHP).
- Do NOT remove the intentional blog vulns (leaked `.git`, upload endpoint, diagnostics SQLi) — they are lab findings.

Keep changes minimal and idiomatic to each service. Match existing style —
don't reformat whole files.