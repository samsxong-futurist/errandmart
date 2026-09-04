# ErrandMart Architecture

ErrandMart is a supermarket catalogue and WhatsApp ordering application. The frontend is React/Vite, the backend is Node.js/Express, and Supabase stores the catalogue.

## Request Flow

```text
CSV or inventory API
        |
        v
Import and synchronisation layer
        |
        v
Supabase products table
        |
        v
Node/Express JSON API
        |
        v
React/Vite catalogue UI
        |
        v
Local order list -> WhatsApp order message
```

The browser does not access Supabase directly. It calls the Express API, which keeps the service-role key and catalogue write operations on the server.

## Project Structure

| Path | Purpose |
| --- | --- |
| `server.js` | Root Node launcher used by npm and nodemon |
| `backend/server.ts` | Express application, API routes, static frontend serving, and development Vite middleware |
| `frontend/App.tsx` | Browser entry application and simple `/` or `/admin` screen selection |
| `frontend/routes/index.tsx` | Customer catalogue, search, category filtering, and order-list entry point |
| `frontend/routes/admin.tsx` | Passcode-protected CSV import and catalogue overview |
| `frontend/libs/api.ts` | Typed browser client for the Express JSON API |
| `backend/import.server.ts` | Server-side import synchronisation: match, update, insert, deactivate, and log |
| `backend/supabase-public.server.ts` | Server-side read-only Supabase client for public catalogue queries |
| `backend/integration/supabase/client.server.ts` | Server-side Supabase service-role client for trusted admin operations |
| `frontend/integration/supabase/types.ts` | Generated TypeScript types for the Supabase schema |
| `frontend/libs/cart.tsx` | Local order-list state and local-storage persistence |
| `frontend/libs/csv.ts` | CSV parser, price parser, and column auto-mapping |
| `frontend/libs/whatsapp.ts` | WhatsApp order message and click-to-chat URL generation |
| `frontend/config/store.ts` | Store name, branding, address, hours, currency, and WhatsApp configuration |
| `supabase/migrations/` | Database schema, policies, indexes, triggers, and sample products |

## API Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/products` | Search active products by text and category |
| `GET` | `/api/categories` | List active product categories |
| `POST` | `/api/admin/overview` | Return catalogue and recent imports after passcode validation |
| `POST` | `/api/admin/import` | Validate and synchronise a CSV-derived product list |

## Database

The migration creates:

- `products`: product name, numeric price, optional image/SKU/category, active state, and timestamps.
- `import_runs`: import file, totals, status, and timestamps.

Public users can read active products through Supabase's read policy. Admin writes happen through Express using the server-only service-role key.

## Environment

Required server variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSCODE`

The `VITE_*` Supabase variables are retained for compatibility with the environment template, but the current browser application uses the Express API and does not create a Supabase client in the browser.

## Local Commands

```sh
npm install
npm run dev
npm run build
npm start
```

`npm run dev` starts Express on port `3000` and attaches Vite middleware. Set `PORT` to use another port.

## Deliberate Scope

There is no online payment, checkout workflow, delivery-fee calculation, account system, reviews, or wishlist. Availability, delivery, and payment are agreed with the customer on WhatsApp.
