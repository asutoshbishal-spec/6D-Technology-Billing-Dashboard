# cmp-billing-and-invoice-mfe

Billing operations dashboard built with React, Vite, Tailwind CSS, Recharts, and an Express mock API.

## Requirements

- Node.js 18 or later
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open <http://localhost:5173>. Vite serves the React app and proxies `/api` requests to the local API on port 3001. To use another API URL, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

Create a production build with `npm run build`. Then `npm start` serves the built app and API on <http://localhost:3001>.

## Routes

- `/` — billing overview, trends, receivables aging, enterprise accounts, exceptions, and upcoming bill run
- `/enterprises` — searchable enterprise account directory
- `/invoices` — invoice register with search and status filters
- `/enterprise/:id` — enterprise usage, account metadata, and billing snapshot
- `/pre-bill-review` — pre-bill queue with reminder and exception-resolution actions
- `/reports` — revenue, service mix, and receivables aging reports

## API

- `GET /api/health`
- `GET /api/billing/overview`
- `GET /api/billing/enterprise/:id`
- `POST /api/billing/reminders/:id`
- `POST /api/billing/exceptions/:id/resolve`

The dashboard falls back to local mock data when the API cannot be reached. In offline mode, reminder and resolution actions are simulated in the current browser session and are not sent to or persisted by the API. The included API is for demonstration only: it has no authentication, production database, or billing/payment processing and should not be exposed to the public internet or used with real customer data.
