const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const dataFile = path.join(__dirname, "db.json");

const seed = {
  nextInvoiceNumber: 843,
  subscribers: 2845,
  invoices: [
    { id: "INV-2026-0842", customer: "Sarah Chen", email: "sarah.chen@email.com", issueDate: "2026-10-20", dueDate: "2026-11-03", amount: 189, status: "paid" },
    { id: "INV-2026-0841", customer: "James Rodriguez", email: "j.rodriguez@acme.co", issueDate: "2026-10-19", dueDate: "2026-11-02", amount: 245.5, status: "pending" },
    { id: "INV-2026-0840", customer: "Metro Partners", email: "accounts@metropartners.com", issueDate: "2026-10-15", dueDate: "2026-10-22", amount: 1280, status: "overdue" },
    { id: "INV-2026-0839", customer: "Ava Thompson", email: "ava.t@email.com", issueDate: "2026-10-14", dueDate: "2026-10-28", amount: 98.75, status: "paid" },
    { id: "INV-2026-0838", customer: "Brightway Logistics", email: "billing@brightway.io", issueDate: "2026-10-12", dueDate: "2026-10-26", amount: 560, status: "pending" },
    { id: "INV-2026-0837", customer: "Northstar Wireless", email: "billing@northstar.net", issueDate: "2026-10-10", dueDate: "2026-10-24", amount: 18400, status: "paid" },
    { id: "INV-2026-0836", customer: "Evergreen Telecom", email: "accounts@evergreen.co", issueDate: "2026-10-08", dueDate: "2026-10-22", amount: 12450, status: "paid" },
    { id: "INV-2026-0835", customer: "Blue Peak Systems", email: "finance@bluepeak.io", issueDate: "2026-10-06", dueDate: "2026-10-20", amount: 12750, status: "paid" },
    { id: "INV-2026-0834", customer: "Summit Business Group", email: "billing@summit.example", issueDate: "2026-10-04", dueDate: "2026-10-18", amount: 15890, status: "paid" },
    { id: "INV-2026-0833", customer: "Cedar Networks", email: "ap@cedarnetworks.com", issueDate: "2026-10-02", dueDate: "2026-10-16", amount: 11900, status: "paid" },
    { id: "INV-2026-0832", customer: "Westline Communications", email: "finance@westline.com", issueDate: "2026-09-29", dueDate: "2026-10-13", amount: 12612.25, status: "pending" },
    { id: "INV-2026-0831", customer: "Pinecrest Services", email: "accounts@pinecrest.io", issueDate: "2026-09-27", dueDate: "2026-10-11", amount: 845, status: "overdue" }
  ],
  revenue: {
    yearly: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], current: [48, 56, 51, 67, 61, 74, 68, 82, 76, 91, 85, 98], previous: [42, 49, 45, 58, 53, 64, 59, 71, 66, 78, 73, 84] },
    quarterly: { labels: ["Q1", "Q2", "Q3", "Q4"], current: [155, 202, 226, 274], previous: [136, 181, 198, 231] },
    monthly: { labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"], current: [46, 58, 50, 68, 61], previous: [38, 49, 44, 56, 52] }
  },
  serviceRevenue: [
    { name: "Mobile plans", amount: 42145, color: "#23b492" },
    { name: "Internet", amount: 25287, color: "#5d8ee2" },
    { name: "Business voice", amount: 10115, color: "#e9aa4b" },
    { name: "Other services", amount: 6743, color: "#a88be3" }
  ]
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function readDatabase() {
  try {
    return JSON.parse(await fs.readFile(dataFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeDatabase(seed);
    return structuredClone(seed);
  }
}

let writeQueue = Promise.resolve();
function writeDatabase(database) {
  const snapshot = JSON.stringify(database, null, 2) + "\n";
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    const temporaryFile = `${dataFile}.${process.pid}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(temporaryFile, snapshot, "utf8");
    await fs.rename(temporaryFile, dataFile);
  });
  return writeQueue;
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(value));
}

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new HttpError(413, "Request body is too large.");
  }
  try {
    return JSON.parse(body || "{}");
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

function getFilteredInvoices(database, search, status) {
  const normalizedSearch = search.toLocaleLowerCase();
  return database.invoices
    .filter(invoice => status === "all" || invoice.status === status)
    .filter(invoice => !normalizedSearch || `${invoice.id} ${invoice.customer} ${invoice.email}`.toLocaleLowerCase().includes(normalizedSearch))
    .sort((a, b) => b.id.localeCompare(a.id));
}

function getDashboard(database) {
  const revenue = database.invoices.filter(invoice => invoice.status === "paid").reduce((total, invoice) => total + invoice.amount, 0);
  const outstanding = database.invoices.filter(invoice => invoice.status !== "paid").reduce((total, invoice) => total + invoice.amount, 0);
  const baseServiceTotal = database.serviceRevenue.reduce((total, item) => total + item.amount, 0);
  const serviceRevenue = database.serviceRevenue.map(item => ({
    ...item,
    amount: baseServiceTotal ? item.amount / baseServiceTotal * revenue : 0
  }));
  return {
    metrics: {
      revenue,
      outstanding,
      subscribers: database.subscribers,
      overdueInvoices: database.invoices.filter(invoice => invoice.status === "overdue").length,
      invoiceCount: database.invoices.length
    },
    revenuePeriods: database.revenue,
    serviceRevenue
  };
}

async function handleApi(request, response, url) {
  const method = request.method;
  const route = url.pathname;
  const database = await readDatabase();

  if (route === "/api/health" && method === "GET") {
    return sendJson(response, 200, { status: "ok", service: "6D Technology demo API" });
  }
  if (route === "/api/dashboard" && method === "GET") {
    const dashboard = getDashboard(database);
    const period = url.searchParams.get("period") || "yearly";
    if (!dashboard.revenuePeriods[period]) throw new HttpError(400, "Period must be yearly, quarterly, or monthly.");
    return sendJson(response, 200, {
      metrics: dashboard.metrics,
      revenue: { period, ...dashboard.revenuePeriods[period] },
      serviceRevenue: dashboard.serviceRevenue
    });
  }

  if (route === "/api/invoices" && method === "GET") {
    const status = url.searchParams.get("status") || "all";
    if (!["all", "paid", "pending", "overdue"].includes(status)) throw new HttpError(400, "Invalid invoice status.");
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("pageSize") || "5", 10)));
    if (!Number.isFinite(page) || !Number.isFinite(pageSize)) throw new HttpError(400, "Invalid pagination values.");
    const filtered = getFilteredInvoices(database, url.searchParams.get("search") || "", status);
    return sendJson(response, 200, {
      invoices: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
      pages: Math.ceil(filtered.length / pageSize)
    });
  }

  if (route === "/api/invoices/export.csv" && method === "GET") {
    const status = url.searchParams.get("status") || "all";
    if (!["all", "paid", "pending", "overdue"].includes(status)) throw new HttpError(400, "Invalid invoice status.");
    const invoices = getFilteredInvoices(database, url.searchParams.get("search") || "", status);
    const header = ["Invoice", "Customer", "Email", "Issue date", "Due date", "Amount (USD)", "Status"];
    const lines = invoices.map(invoice => [
      invoice.id, invoice.customer, invoice.email, invoice.issueDate, invoice.dueDate, invoice.amount.toFixed(2), invoice.status
    ]);
    const csv = [header, ...lines].map(row => row.map(escapeCsv).join(",")).join("\r\n");
    response.writeHead(200, {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="6d-telecom-invoices.csv"',
      "x-content-type-options": "nosniff"
    });
    response.end(csv);
    return;
  }

  if (route === "/api/invoices" && method === "POST") {
    const body = await readJson(request);
    const customer = typeof body.customer === "string" ? body.customer.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const amount = Number(body.amount);
    if (!customer || customer.length > 120) throw new HttpError(400, "Customer name is required (up to 120 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new HttpError(400, "Enter a valid email address.");
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) throw new HttpError(400, "Amount must be greater than zero.");
    if (!validDate(body.issueDate) || !validDate(body.dueDate) || body.dueDate < body.issueDate) {
      throw new HttpError(400, "Enter valid issue and due dates; due date cannot be before issue date.");
    }
    const invoice = {
      id: `INV-2026-${String(database.nextInvoiceNumber++).padStart(4, "0")}`,
      customer,
      email,
      issueDate: body.issueDate,
      dueDate: body.dueDate,
      amount: Math.round(amount * 100) / 100,
      status: "pending"
    };
    database.invoices.push(invoice);
    await writeDatabase(database);
    return sendJson(response, 201, invoice);
  }

  const invoiceRoute = route.match(/^\/api\/invoices\/(INV-\d{4}-\d{4})$/);
  if (invoiceRoute) {
    const invoiceIndex = database.invoices.findIndex(invoice => invoice.id === invoiceRoute[1]);
    if (invoiceIndex < 0) throw new HttpError(404, "Invoice not found.");
    if (method === "PATCH") {
      const body = await readJson(request);
      if (!["paid", "pending", "overdue"].includes(body.status)) throw new HttpError(400, "Invalid invoice status.");
      database.invoices[invoiceIndex].status = body.status;
      await writeDatabase(database);
      return sendJson(response, 200, database.invoices[invoiceIndex]);
    }
    if (method === "DELETE") {
      const [deleted] = database.invoices.splice(invoiceIndex, 1);
      await writeDatabase(database);
      return sendJson(response, 200, { deleted: true, invoice: deleted });
    }
    if (method === "GET") return sendJson(response, 200, database.invoices[invoiceIndex]);
  }

  throw new HttpError(404, "API route not found.");
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") throw new HttpError(405, "Method not allowed.");
    if (url.pathname !== "/" && url.pathname !== "/index.html") throw new HttpError(404, "Page not found.");
    const html = await fs.readFile(path.join(__dirname, "index.html"));
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
    });
    response.end(request.method === "HEAD" ? undefined : html);
  } catch (error) {
    if (response.headersSent) {
      response.destroy(error);
      return;
    }
    if (error instanceof HttpError) {
      sendJson(response, error.status, { error: error.message });
      return;
    }
    console.error("Request failed:", error);
    sendJson(response, 500, { error: "The demo API encountered an unexpected error." });
  }
});

server.listen(port, host, () => {
  console.log(`6D Technology demo is running at http://localhost:${port}`);
  console.log(`Database file: ${dataFile}`);
  if (host === "0.0.0.0") console.log("To allow access from your network, use this machine's LAN address and port.");
});
