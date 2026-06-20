# Underground

Underground is a Next.js MVP for tournament registration, brackets, match results, and rankings.

## Tech stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth

## Available scripts

```bash
npm install
npm run dev
npm run build
npm run start
npm run prisma:generate
```

## Database

Configure `DATABASE_URL` in `.env` before running Prisma.

## Pages

- `/` — Home
- `/tournaments` — Tournament list
- `/tournaments/[id]` — Tournament details
- `/rankings` — Leaderboard
- `/players` — Player directory
- `/players/[username]` — Player profile
- `/teams` — Teams
- `/login` — Login
- `/register` — Register
- `/dashboard` — User dashboard
- `/admin` — Admin dashboard
