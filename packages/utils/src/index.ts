// ==========================================
// FORMATTERS
// ==========================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

// ==========================================
// STRING UTILS
// ==========================================

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
}

export function truncateText(text: string, length = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// ==========================================
// CRYPTO UTILS
// ==========================================

export function generateUUID(): string {
  return crypto.randomUUID();
}

// ==========================================
// LOGGER
// ==========================================

export const logger = {
  info(message: string, ...args: any[]) {
    console.log(`[INFO] [${new Date().toISOString()}] ${message}`, ...args);
  },
  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, ...args);
  },
  error(message: string, error?: any, ...args: any[]) {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error || "", ...args);
  },
  debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
};
