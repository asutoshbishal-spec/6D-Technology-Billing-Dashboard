const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export function formatMoney(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

export function formatPercent(value, digits = 1) {
  return `${Number(value || 0).toFixed(digits)}%`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
