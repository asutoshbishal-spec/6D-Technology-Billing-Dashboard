import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mockBillingOverview } from "../src/data/mockBillingData.js";

const app = express();
const port = Number(process.env.API_PORT || 3001);
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, "../dist");
const accounts = mockBillingOverview.enterprises;
const openExceptions = new Map(mockBillingOverview.exceptions.map(item => [item.id, item]));

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "6D Technology billing API" });
});

app.get("/api/billing/overview", (_request, response) => {
  const overview = structuredClone(mockBillingOverview);
  const exceptions = structuredClone([...openExceptions.values()]);
  const exceptionCount = exceptions.length;
  const readyCount = Math.max(0, overview.pendingBillRun.accounts - exceptionCount);
  overview.exceptions = exceptions;
  overview.kpis = overview.kpis.map(item => item.label === "Accounts needing review"
    ? { ...item, value: exceptionCount }
    : item);
  overview.pendingBillRun.exceptions = exceptionCount;
  overview.pendingBillRun.ready = readyCount;
  overview.billRunStatus = [
    { ...overview.billRunStatus[0], value: readyCount },
    { ...overview.billRunStatus[1], value: exceptionCount }
  ];
  response.json({ ...overview, enterprises: structuredClone(accounts) });
});

app.get("/api/billing/enterprise/:id", (request, response) => {
  const account = accounts.find(item => item.id === request.params.id);
  if (!account) return response.status(404).json({ error: "Enterprise account not found." });
  return response.json(structuredClone(account));
});

app.post("/api/billing/reminders/:id", (request, response) => {
  const account = accounts.find(item => item.id === request.params.id);
  if (!account) return response.status(404).json({ error: "Enterprise account not found." });
  return response.status(202).json({ sent: true, enterpriseId: account.id });
});

app.post("/api/billing/exceptions/:id/resolve", (request, response) => {
  const exception = openExceptions.get(request.params.id);
  if (!exception) return response.status(404).json({ error: "Open billing exception not found." });
  openExceptions.delete(request.params.id);
  return response.json({ resolved: true, id: exception.id });
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "Billing API route not found." });
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("*", (_request, response) => response.sendFile(path.join(distDir, "index.html")));
}

app.use((error, _request, response, _next) => {
  console.error("Billing API request failed:", error);
  response.status(error.status || 500).json({
    error: error.status ? error.message : "The billing API encountered an unexpected error."
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Billing API listening at http://127.0.0.1:${port}`);
  if (!existsSync(distDir)) console.log("Build the frontend with npm run build, or use npm run dev for Vite development.");
});
