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
| `backend/server.js` | Express application, API routes, static frontend serving, and development Vite middleware |
| `frontend/App.js` | Browser entry application and simple `/` or `/admin` screen selection |
| `frontend/routes/index.js` | Customer catalogue, search, category filtering, and order-list entry point |
| `frontend/routes/admin.js` | Passcode-protected CSV import and catalogue overview |
| `frontend/libs/api.js` | Browser client for the Express JSON API |
| `backend/import.server.js` | Server-side import synchronisation: match, update, insert, deactivate, and log |
| `backend/supabase-public.server.js` | Server-side read-only Supabase client for public catalogue queries |
| `backend/integration/supabase/client.server.js` | Server-side Supabase service-role client for trusted admin operations |
| `frontend/libs/cart.js` | Local order-list state and local-storage persistence |
| `frontend/libs/csv.js` | CSV parser, price parser, and column auto-mapping |
| `frontend/libs/whatsapp.js` | WhatsApp order message and click-to-chat URL generation |
| `frontend/config/store.js` | Store name, branding, address, hours, currency, and WhatsApp configuration |
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

The browser does not receive Supabase credentials. It calls Express, and only the backend reads the Supabase URL, publishable key, and service-role key.

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
