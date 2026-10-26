import { findMockEnterprise, mockBillingOverview } from "../data/mockBillingData";

const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
const resolvedExceptions = new Set();

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isApiUnavailable(error) {
  return error instanceof TypeError || (error instanceof ApiError && error.status >= 500);
}

async function request(path, options) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(response.status, payload.error || `Billing API request failed (${response.status}).`);
  }
  return response.json();
}

export async function getBillingOverview() {
  try {
    return await request("/billing/overview");
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    const exceptions = mockBillingOverview.exceptions.filter(item => !resolvedExceptions.has(item.id));
    const exceptionCount = exceptions.length;
    const accounts = mockBillingOverview.pendingBillRun.accounts;
    return {
      ...mockBillingOverview,
      dataSource: "mock",
      kpis: mockBillingOverview.kpis.map(item => item.label === "Accounts needing review"
        ? { ...item, value: exceptionCount }
        : item),
      exceptions,
      pendingBillRun: {
        ...mockBillingOverview.pendingBillRun,
        exceptions: exceptionCount,
        ready: Math.max(0, accounts - exceptionCount)
      },
      billRunStatus: [
        { ...mockBillingOverview.billRunStatus[0], value: Math.max(0, accounts - exceptionCount) },
        { ...mockBillingOverview.billRunStatus[1], value: exceptionCount }
      ]
    };
  }
}

export async function getEnterpriseById(id) {
  try {
    return await request(`/billing/enterprise/${encodeURIComponent(id)}`);
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    const enterprise = findMockEnterprise(id);
    if (!enterprise) throw new Error("Enterprise account not found.");
    return { ...enterprise, dataSource: "mock" };
  }
}

export async function sendReminder(id) {
  try {
    return await request(`/billing/reminders/${encodeURIComponent(id)}`, { method: "POST" });
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    const enterprise = findMockEnterprise(id);
    if (!enterprise) throw new Error("Enterprise account not found.");
    return { sent: true, enterpriseId: id, mocked: true };
  }
}

export async function resolveException(id) {
  try {
    return await request(`/billing/exceptions/${encodeURIComponent(id)}/resolve`, { method: "POST" });
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    const exists = mockBillingOverview.exceptions.some(item => item.id === id);
    if (!exists) throw new Error("Billing exception not found.");
    resolvedExceptions.add(id);
    return { resolved: true, id, mocked: true };
  }
}
