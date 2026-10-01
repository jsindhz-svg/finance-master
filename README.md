# Simple Monthly Budget App

A zero-based budgeting app with a web frontend (React + Vite), a mobile app (Expo React Native), and a shared serverless backend (Convex).

## Features

- Zero-based budgeting with "ready to assign" tracking
- Category management with spending targets and savings goals
- Income and expense tracking with monthly views
- Plaid integration for automatic bank transaction syncing
- Credit card payment auto-categorization
- Reports and planning pages
- Password and anonymous authentication

## Tech Stack

- **Web:** React 19, Vite, Tailwind CSS, React Router, shadcn/ui
- **Mobile:** Expo 54, React Native, Expo Router
- **Backend:** Convex (serverless functions + database)
- **Auth:** @convex-dev/auth (Password + Anonymous providers)
- **Bank sync:** Plaid API (optional)

## Project Structure

```
├── src/              # Web app (React + Vite)
├── mobile/           # Mobile app (Expo React Native)
├── convex/           # Backend (shared by web and mobile)
│   ├── budget/       # Budget aggregation
│   ├── categories/   # Category CRUD and targets
│   ├── categoryBudgets/  # Monthly budget allocation
│   ├── transactions/ # Income and expense management
│   ├── plaid/        # Plaid bank integration
│   ├── reports/      # Report aggregation
│   └── shared/       # Validators and utilities
├── .env.example      # Template for environment variables
└── mobile/.env.example   # Template for mobile environment variables
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Docker (for self-hosted Convex) or a [Convex](https://convex.dev) account

### Option A: Self-Hosted Convex (Recommended for Contributors)

Run your own local Convex backend — no account needed.

**1. Start the Convex backend with Docker:**

```bash
# Download docker-compose.yml from the Convex repo
curl -O https://raw.githubusercontent.com/get-convex/convex-backend/main/self-hosted/docker-compose.yml

# Start the backend and dashboard
docker compose up
```

This starts:
- Backend API at `http://127.0.0.1:3210`
- Dashboard at `http://localhost:6791`

**2. Generate an admin key:**

```bash
docker compose exec backend ./generate_admin_key.sh
```

**3. Set up environment variables:**

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=<your generated admin key>
VITE_CONVEX_URL=http://127.0.0.1:3210
```

**4. Install dependencies and start developing:**

```bash
npm install
npx convex dev
```

In a separate terminal:

```bash
npm run dev:frontend
```

### Option B: Convex Cloud

Use a free Convex cloud deployment.

**1. Create a Convex account and project:**

```bash
npm install
npx convex dev
```

This will prompt you to log in and create a new project. It writes your deployment URL to `.env.local` automatically.

**2. Set the Vite env variable:**

Add your Convex URL to `.env.local`:

```
VITE_CONVEX_URL=<your convex deployment URL>
```

**3. Start the app:**

```bash
npm run dev
```

### Setting Up Auth

After your Convex backend is running, set up the auth environment variables:

```bash
npx @convex-dev/auth
```

This configures the `JWKS` and `SITE_URL` environment variables that Convex Auth needs.

### Plaid Integration (Optional)

Bank syncing via Plaid is optional. To enable it:

1. Create a free [Plaid](https://plaid.com) sandbox account
2. Set these environment variables in your Convex dashboard (or via `npx convex env set`):

```
PLAID_CLIENT_ID=<your client id>
PLAID_SECRET=<your sandbox secret>
PLAID_ENV=sandbox
```

Without these, the app works fine — you just won't have automatic bank transaction imports.

## Running the Mobile App

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `mobile/.env` and set your Convex URL:

```
EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
```

Then start Expo:

```bash
npx expo start
```

> **Note:** The mobile app imports Convex functions from `../convex/` via the `@convex/` path alias configured in Metro, Babel, and TypeScript.

## Development

```bash
# Start web + backend together
npm run dev

# Or start them separately
npm run dev:backend    # Convex dev server
npm run dev:frontend   # Vite dev server

# Type check and build
npm run lint
npm run build
```

## License

MIT
