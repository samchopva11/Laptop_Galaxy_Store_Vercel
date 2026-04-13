/**
 * Formats a numeric value into a string with dot as thousands separator (e.g., 1000000 -> "1.000.000")
 */
export const formatDisplayPrice = (value) => {
  if (value === undefined || value === null || value === '') return '';
  // Ensure we are working with a string and remove any existing non-digit characters
  const cleanValue = value.toString().replace(/\D/g, '');
  if (!cleanValue) return '';
  // Use toLocaleString for grouping and then swap commas for dots for standard VN formatting
  return Number(cleanValue).toLocaleString('vi-VN').replace(/,/g, '.');
};

/**
 * Removes dot separators from a formatted string to get the pure numeric value
 */
export const parseNumericPrice = (formattedValue) => {
  if (formattedValue === undefined || formattedValue === null || formattedValue === '') return '';
  return formattedValue.toString().replace(/\./g, '');
};

/**
 * Returns a formatted currency string for display only (adds '₫')
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || amount === '') return '0₫';
  return formatDisplayPrice(amount) + '₫';
};
