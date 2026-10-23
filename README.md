# 6D Telecom billing demo

This is a self-contained billing UI connected to a local fake REST API. It uses Node.js built-ins only; no package installation or build step is needed.

## Run locally

1. Install Node.js 18 or later.
2. Open a terminal in this folder and run:

   ```powershell
   node server.js
   ```

3. Open <http://localhost:3000>.

The server binds to `0.0.0.0` by default. To use a different port, set `PORT` before starting it, for example `$env:PORT=8080; node server.js`. To access the demo from another device on the same network, open `http://<this-computer-LAN-IP>:3000` and allow Node.js through the host firewall if prompted.

## Demo API

- `GET /api/health` — health check
- `GET /api/dashboard?period=yearly|quarterly|monthly` — billing metrics, chart series, and service revenue
- `GET /api/invoices?search=&status=all|paid|pending|overdue&page=1&pageSize=5` — filtered, paginated invoices
- `GET /api/invoices/:id` — one invoice
- `POST /api/invoices` — create an invoice
- `PATCH /api/invoices/:id` — update its status
- `DELETE /api/invoices/:id` — remove an invoice
- `GET /api/invoices/export.csv?search=&status=` — export matching invoices

Invoices are stored in `db.json`, so demo edits survive server restarts. Stop the server before manually editing this file. **This is mock data and a demo API only**: it has no authentication, payment processing, database hardening, or production safeguards. Do not expose it to the public internet or use it for real customer data.

## Contributors

- [asutoshbishal-spec](https://github.com/asutoshbishal-spec)
