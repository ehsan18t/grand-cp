# OpenNext Starter

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.

## Develop

This project runs API routes on the Cloudflare/OpenNext runtime in development.
This project uses a local dev env file: `.env.dev` (gitignored).

1) Create your local runtime env file:

```bash
cp .env.example .env.dev
```

2) Fill in `BETTER_AUTH_*` and (if using Google sign-in) `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

3) Initialize your local D1 database tables (this is also run automatically before `bun dev`):

```bash
bun db:init:local
```

If you want a full reset + seed (problems/phases), run:

```bash
bun db:reset:local
```

Run the Next.js development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
bun preview
```

## Deploy

Deploy the application to Cloudflare:

```bash
bun deploy
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
