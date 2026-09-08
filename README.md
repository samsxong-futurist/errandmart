# ErrandMart

ErrandMart is a supermarket catalogue and WhatsApp ordering app. Customers search the catalogue, add products to an order list, and send the list to the store on WhatsApp. The app does not process payments or calculate delivery fees.

## Stack

- Node.js and Express
- React 19 and JavaScript
- Vite and Tailwind CSS
- Supabase PostgreSQL
- WhatsApp click-to-chat

## Run locally

Requirements: Node.js 20 or newer and an npm-compatible package manager.

```sh
npm install
npm run dev
```

The Express development server runs at `http://localhost:3000`. It starts Vite in middleware mode, serves the React UI, and exposes the `/api` endpoints from the same process.

## Use your own Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the Supabase SQL Editor and run the migration in `supabase/migrations/`.
3. Copy the project URL and publishable key from Supabase project settings.
4. Create a local `.env` file using this shape:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSCODE=choose-a-private-admin-passcode
VITE_WHATSAPP_NUMBER=2348012345678
```

The service role key is server-only. Never expose it as a `VITE_` variable or commit it.

The sample catalogue is inserted by the migration and can be replaced from `/admin` with a CSV file. The admin page matches rows by SKU first and exact product name second.

## Rebrand the store

Edit `frontend/config/store.js` for the store name, address, hours, currency, and WhatsApp display number. The customer UI and order message use this configuration.

## Useful commands

```sh
npm run dev
npm run build
npm run preview
npm run lint
```

For production, build the frontend and start Express:

```sh
npm run build
npm start
```

## Architecture

The React UI talks to JSON endpoints in `backend/server.js`, not directly to Supabase. Supabase is the database, while CSV import is the synchronization layer. The Vercel `api/index.js` file is only a deployment adapter for the Express app.

The main flow is:

```text
CSV or inventory API -> import/sync layer -> Supabase products -> Express API -> React catalogue UI
catalogue UI -> local order list -> WhatsApp message
```
