# next-strapi-starter

Monorepo starter with **Next.js 16 App Router**, **Auth.js v5**, **Strapi 5**, **Kubb** type generation, and **shadcn/ui**.

## Quick start

```bash
npm create next-strapi-starter my-app
```

Or use as a **GitHub template** — click "Use this template" above.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) |
| Auth | Auth.js v5 (NextAuth) — Credentials Provider → Strapi |
| Backend / CMS | Strapi 5 |
| API types | Kubb 4 (generates typed clients from OpenAPI) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Package manager | npm workspaces |
| File storage | Cloudflare R2 (S3-compatible) |
| DB | SQLite (local) / PostgreSQL (production) |
| Backend hosting | Railway |
| Frontend hosting | Vercel |

## What's included

- Login + Register pages wired to Strapi `/api/auth/local`
- Auth.js session stores the Strapi JWT (encrypted cookie)
- Fixed header with auth-aware user navigation
- Kubb code generation: typed axios clients auto-generated from Strapi OpenAPI schema
- FSD (Feature-Sliced Design) folder structure in frontend
- Strapi `users-permissions` + `documentation` plugins enabled
- Cloudflare R2 upload provider pre-configured (just add env vars)

## Project structure

```
next-strapi-starter/
├── apps/
│   ├── frontend/          # Next.js
│   └── backend/           # Strapi 5
├── package.json           # npm workspaces root
└── .gitignore
```

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+

### 1. Scaffold

```bash
# Recommended — via npm create
npm create next-strapi-starter my-app
cd my-app

# Or clone directly
git clone https://github.com/Imba-Sharik/next-strapi-starter.git my-app
cd my-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

**Backend** (`apps/backend/.env`):

```bash
cp apps/backend/.env.example apps/backend/.env
```

Generate secrets and fill in the values:

```bash
# Generate APP_KEYS (4 random base64 strings, comma-separated)
node -e "const c=require('crypto');console.log([1,2,3,4].map(()=>c.randomBytes(16).toString('base64')).join(','))"

# Other secrets — generate individually
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

**Frontend** (`apps/frontend/.env.local`):

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Run locally

```bash
# Terminal 1 — Strapi backend (http://localhost:1337)
npm run backend

# Terminal 2 — Next.js frontend (http://localhost:3000)
npm run frontend
```

On first Strapi launch, create an admin account at http://localhost:1337/admin.

## Kubb — API type generation

When you add a new content type in Strapi:

```bash
# 1. Start Strapi (updates OpenAPI schema automatically)
npm run backend

# 2. Generate typed clients
cd apps/frontend && npm run generate
```

New types and axios clients appear in `src/shared/api/generated/`.

Use generated clients with `strapiConfig(token?)` in application code.
In `auth.ts` use raw `fetch` (Edge Runtime compatibility) + Kubb types.

## Cloudflare R2 — file uploads

The starter comes pre-configured with Cloudflare R2 as the Strapi upload provider.

1. Create a bucket in [Cloudflare R2](https://dash.cloudflare.com) and enable **Public Access** (R2.dev subdomain)
2. Create an **R2 API Token** (Object Read & Write)
3. Fill in the `CF_*` variables in `apps/backend/.env`:

```env
CF_ACCESS_KEY_ID=your_access_key
CF_SECRET_ACCESS_KEY=your_secret_key
CF_ACCOUNT_ID=your_account_id
CF_BUCKET=your_bucket_name
CF_PUBLIC_URL=https://pub-xxx.r2.dev
```

Upload a file via Strapi Admin → Media Library to verify.

## Deployment

### Backend → Railway

1. Create a new Railway project, add a **PostgreSQL** service
2. Deploy `apps/backend` (Root Directory: `apps/backend`)
3. Set environment variables (see `apps/backend/.env.example` Railway section):
   - `DATABASE_URL`, `NODE_ENV=production`, secrets, `CORS_ORIGINS`, `URL`
   - `CF_*` variables (same as local) for R2 file uploads

### Frontend → Vercel

1. Import the repository, set **Root Directory**: `apps/frontend`
2. Set **Install Command**: `npm install --prefix=../..`
3. Set environment variables:
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `STRAPI_URL` — your Railway Strapi URL
4. After deploy, add the Vercel URL to `CORS_ORIGINS` on Railway

## Architecture decisions

- `apps/frontend/src/shared/api/strapi.ts` — single place with backend URL (`STRAPI_URL`). Change only here when migrating.
- Auth.js Credentials Provider calls Strapi `/api/auth/local`, stores the JWT in the session.
- Strapi JWT is forwarded as `Authorization: Bearer <token>` in API requests.

## License

MIT
