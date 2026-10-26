export const mockBillingOverview = {
  kpis: [
    { label: "Billed this month", value: 284650, change: 8.2, icon: "wallet" },
    { label: "Collected revenue", value: 251840, change: 6.4, icon: "chart" },
    { label: "Outstanding balance", value: 32810, change: -2.1, icon: "clock" },
    { label: "Accounts needing review", value: 3, change: 12.5, icon: "alert", count: true }
  ],
  trend: [
    { month: "May", billed: 182, collected: 163 },
    { month: "Jun", billed: 205, collected: 184 },
    { month: "Jul", billed: 194, collected: 176 },
    { month: "Aug", billed: 232, collected: 207 },
    { month: "Sep", billed: 248, collected: 222 },
    { month: "Oct", billed: 285, collected: 252 }
  ],
  revenueMix: [
    { name: "Wireless", value: 42, color: "#1ba88a" },
    { name: "Internet", value: 28, color: "#658ce2" },
    { name: "Voice", value: 18, color: "#f0ad4e" },
    { name: "Other", value: 12, color: "#a78be5" }
  ],
  aging: [
    { bucket: "Current", amount: 18400, color: "#1ba88a" },
    { bucket: "1–30 days", amount: 8200, color: "#658ce2" },
    { bucket: "31–60 days", amount: 4100, color: "#f0ad4e" },
    { bucket: "60+ days", amount: 2110, color: "#e77d83" }
  ],
  enterprises: [
    { id: "1", name: "Northstar Wireless", account: "ENT-20481", plan: "National Connect", balance: 18400, status: "Current", nextBill: "2026-11-01", usage: [32, 39, 36, 47, 43, 56] },
    { id: "2", name: "Evergreen Telecom", account: "ENT-20814", plan: "Enterprise Plus", balance: 12450, status: "Review", nextBill: "2026-11-03", usage: [28, 34, 32, 41, 48, 45] },
    { id: "3", name: "Blue Peak Systems", account: "ENT-21032", plan: "Business Unlimited", balance: 12750, status: "Current", nextBill: "2026-11-05", usage: [21, 26, 31, 29, 36, 42] },
    { id: "4", name: "Summit Business Group", account: "ENT-21308", plan: "Global Enterprise", balance: 15890, status: "Past due", nextBill: "2026-11-06", usage: [48, 45, 53, 49, 58, 62] },
    { id: "5", name: "Cedar Networks", account: "ENT-21776", plan: "Regional Connect", balance: 11900, status: "Current", nextBill: "2026-11-08", usage: [22, 25, 24, 33, 31, 38] }
  ],
  invoices: [
    { id: "INV-2026-0842", enterpriseId: "1", enterprise: "Northstar Wireless", issued: "2026-10-20", due: "2026-11-19", amount: 18400, status: "Paid" },
    { id: "INV-2026-0841", enterpriseId: "2", enterprise: "Evergreen Telecom", issued: "2026-10-19", due: "2026-11-18", amount: 12450, status: "Pending" },
    { id: "INV-2026-0840", enterpriseId: "4", enterprise: "Summit Business Group", issued: "2026-09-12", due: "2026-10-12", amount: 15890, status: "Overdue" },
    { id: "INV-2026-0839", enterpriseId: "3", enterprise: "Blue Peak Systems", issued: "2026-10-14", due: "2026-11-13", amount: 12750, status: "Paid" },
    { id: "INV-2026-0838", enterpriseId: "5", enterprise: "Cedar Networks", issued: "2026-10-12", due: "2026-11-11", amount: 11900, status: "Pending" },
    { id: "INV-2026-0837", enterpriseId: "1", enterprise: "Northstar Wireless", issued: "2026-09-10", due: "2026-10-10", amount: 17680, status: "Paid" }
  ],
  exceptions: [
    { id: "EX-1048", enterpriseId: "2", enterprise: "Evergreen Telecom", title: "Usage exceeds allowance", detail: "International data usage is 18% above the contracted allowance.", amount: 1240, severity: "High", type: "usage" },
    { id: "EX-1052", enterpriseId: "4", enterprise: "Summit Business Group", title: "Unmatched service charge", detail: "A roaming charge could not be matched to a service line.", amount: 680, severity: "Medium", type: "charge" },
    { id: "EX-1061", enterpriseId: "1", enterprise: "Northstar Wireless", title: "Contract rate mismatch", detail: "Two lines are using a rate that differs from the active contract.", amount: 420, severity: "Low", type: "contract" }
  ],
  pendingBillRun: { cycle: "October 2026", accounts: 1284, ready: 1281, exceptions: 3, scheduled: "2026-10-29T09:00:00" },
  allowance: { used: 82, total: 100, unit: "TB" },
  billRunStatus: [
    { label: "Validated", value: 1281, color: "#1ba88a" },
    { label: "Needs review", value: 3, color: "#f0ad4e" }
  ]
};

export function findMockEnterprise(id) {
  return mockBillingOverview.enterprises.find(account => account.id === id);
}
