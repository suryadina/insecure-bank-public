# Insecure Bank — Security Learning Lab

An intentionally vulnerable banking application built as a hands-on security
training lab. It simulates a realistic online bank (accounts, transfers,
deposits, device enrollment) alongside a gamification service, so students can
practice web application attacks in a safe, disposable environment.

> **Warning:** This application contains deliberate security vulnerabilities.
> It is intended for security education and authorized penetration testing only.
> Do not deploy it where real data or real money is involved.

## What's inside

| Piece | Tech | Notes |
|---|---|---|
| `auth-service` | Spring Boot (Java) | Registration, login, OTP, device enrollment |
| `transaction-service` | Node.js | Transfers, withdrawals, search |
| `customer-service` | Node.js | Hidden customer-service portal |
| `db-admin` | Python | Database admin web UI |
| `frontend-react` | React | Main banking SPA |
| `game-service` | Kotlin (Spring) | Gamification API (rewards, wheel, webhook) |
| `game-frontend` | React | Gamification SPA |
| `wordpress-blog` | WordPress (PHP/Apache) | Corporate blog + leaked `.git` + upload plugin |
| `nginx.conf` | nginx | API gateway / route mapping |
| `init-db.sql` | PostgreSQL | Schema + seed data |
| `docs/master-list.json` | JSON | Canonical findings master list (27 items + taxonomy) |

## Quick start

```bash
docker compose up -d --build
```

Wait for the gateway to come up, then open:

- Bank app: `http://localhost/`
- Gamification app: `http://localhost/app/`
- Blog: `http://localhost/blog/`

The gateway routes:

| Path | Backend |
|---|---|
| `/api/auth` | auth-service |
| `/api/transactions` | transaction-service |
| `/api/cs` | customer-service |
| `/TtFkwWSGlzyMrua` | db-admin |
| `/app/api` | game-service |
| `/app` | game-frontend |
| `/blog/` | wordpress-blog |
| `/` | frontend-react |

## Reset

The lab ships with a fresh database on first boot (`init-db.sql`). To wipe and
re-seed:

```bash
docker compose down -v
docker compose up -d --build
```

## Master list of findings

See [`docs/master-list.json`](docs/master-list.json) for the canonical list of
intended vulnerabilities, organized by finding ID with severity, endpoint,
description, impact, and remediation guidance.