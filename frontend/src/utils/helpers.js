/**
 * Format a date string (ISO) to readable format
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * Format a number as INR currency
 */
export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a number with comma separators
 */
export function formatNumber(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-IN').format(n)
}

/**
 * Return days left until a date (negative if expired)
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Return true if license is expired
 */
export function isLicenseExpired(expiryDate) {
  return daysUntil(expiryDate) < 0
}

/**
 * Return true if license expires within `days` days
 */
export function isLicenseExpiringSoon(expiryDate, days = 30) {
  const d = daysUntil(expiryDate)
  return d !== null && d >= 0 && d <= days
}

/**
 * Capitalise + replace underscores for display
 */
export function humanize(str) {
  if (!str) return ''
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Truncate a string
 */
export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}
