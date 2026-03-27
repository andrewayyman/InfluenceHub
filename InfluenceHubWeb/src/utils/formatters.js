const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatCompactNumber = (value) => compactFormatter.format(Number(value || 0));

export const formatNumber = (value) => numberFormatter.format(Number(value || 0));

export const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

export const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return dateFormatter.format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return dateTimeFormatter.format(new Date(value));
};

export const formatPercent = (value, digits = 1) => `${(Number(value || 0) * 100).toFixed(digits)}%`;
