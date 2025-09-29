# Repository Overview

## Project Structure
- **client/**: Frontend React application built with Vite and Tailwind CSS.
- **server/**: Express-based backend with session handling, MongoDB helpers, and Drizzle ORM integrations.
- **shared/**: Shared TypeScript schema definitions and utilities used across client and server.
- **attached_assets/**: Supplemental documentation and design notes for specific features.

## Tooling & Scripts
- **`npm run dev`**: Starts the development server (Express backend via `tsx`). The frontend is served through the backend's Vite middleware.
- **`npm run build`**: Builds the Vite client and bundles the backend entry using esbuild.
- **`npm run start`**: Runs the production build from the bundled `dist` directory.
- **`npm run check`**: Type-checks the project with TypeScript.
- **`npm run db:push`**: Applies schema changes via Drizzle Kit.

## Environment & Dependencies
- Uses Node.js with TypeScript (`type: module`).
- Backend relies on Express, Passport (local strategy), and MongoDB integrations via `mongodb`.
- Frontend leverages React 18, Radix UI components, React Query, Tailwind CSS, and assorted UI libraries.
- Session storage options include `connect-pg-simple` and `memorystore`.

## Deployment Notes
- Vercel configuration provided via `vercel.json`.
- Additional deployment guidance in `DEPLOYMENT.md` and `MONGODB_SETUP.md`.

## Getting Started
1. Install dependencies: `npm install`.
2. Copy `.env.example` to `.env` and fill in required environment variables (database credentials, session secrets, etc.).
3. Run `npm run dev` for development, or `npm run build && npm run start` for production testing.

## Known Requirements
- Some features depend on external services (MongoDB, potentially Neon/PostgreSQL via Drizzle).
- Ensure environment variables required by both client and server are properly configured.

_This file summarizes the repository to help automated assistants provide accurate support._