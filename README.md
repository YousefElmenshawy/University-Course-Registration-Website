# RegIx — University Course registration (Next.js + TypeScript)

A small Next.js (App Router) project for a university course registration UI. It is written in TypeScript and uses the `src/app` structure with React server and client components.

## Quick start

1. Install dependencies

   ```bash
   npm install
   ```

2. Run the dev server

   ```bash
   npm run dev
   ```

3. Open the app

   [http://localhost:3000](http://localhost:3000)

## Useful scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — start the production server after build

## Features

- Basic authentication UI (login/signup) and a protected area
- Component-based UI (Navbar, Button, InputForm, Auth card, Logo)
- App Router layout structure with nested protected routes
- Simple database client helper in `src/lib` (integration stub)
- Static assets in `public/` (logo.svg, favicon.ico)

## Where to look

- `src/app/` — application routes and layouts (App Router)
  - `src/app/page.tsx` — main public landing / auth page
  - `src/app/protected/` — protected area routes and nested layouts
- `src/components/` — reusable UI components (Navbar, Button, InputForm, Auth, Logo, etc.)
- `public/` — static assets (logo.svg, favicon.ico, images)
- `src/lib/databaseClient.ts` — simple database client helper (if present)
- `next.config.ts`, `tsconfig.json`, `package.json` — project configuration


## TODO / Roadmap (short)
- Implement course catalog, registration, and schedule flows
- Add tests and linting rules

## Contributing / Contact

If you want changes or find issues, open an issue or reach out in the project tracker.
