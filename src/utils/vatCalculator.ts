import { InvoiceItem } from '../types/invoice';

export interface VATCalculationResult {
  quantityLitres: number;
  unitPrice: number;
  unitPriceExclVat: number;
  amountExclVat: number;
  vatAmount: number;
  amountIncludingVat: number;
}

export const VAT_RATE = 0.18; // 18% VAT

export function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Format date string from YYYY-MM-DD to MM-DD-YYYY
 */
export function formatToMMDDYYYY(dateInput: string): string {
  if (!dateInput) return '';
  // If already in MM-DD-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateInput)) return dateInput;

  const parts = dateInput.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) { // YYYY-MM-DD
      const [year, month, day] = parts;
      return `${month}-${day}-${year}`;
    }
  }
  return dateInput;
}

/**
 * Convert MM-DD-YYYY back to YYYY-MM-DD for HTML input[type="date"]
 */
export function formatToYYYYMMDD(dateInput: string): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) return dateInput;

  const parts = dateInput.split('-');
  if (parts.length === 3) {
    if (parts[2].length === 4) { // MM-DD-YYYY
      const [month, day, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate line item totals starting from Amount Including VAT
 */
export function calculateFromAmount(amountInclVat: number, unitPrice: number): VATCalculationResult {
  if (unitPrice <= 0 || amountInclVat <= 0) {
    return {
      quantityLitres: 0,
      unitPrice,
      unitPriceExclVat: roundToTwoDecimals(unitPrice / 1.18),
      amountExclVat: 0,
      vatAmount: 0,
      amountIncludingVat: roundToTwoDecimals(amountInclVat)
    };
  }

  const rawLitres = amountInclVat / unitPrice;
  const quantityLitres = roundToTwoDecimals(rawLitres);
  
  const amountExclVat = roundToTwoDecimals(amountInclVat / 1.18);
  const vatAmount = roundToTwoDecimals(amountInclVat - amountExclVat);
  const unitPriceExclVat = roundToTwoDecimals(unitPrice / 1.18);

  return {
    quantityLitres,
    unitPrice: roundToTwoDecimals(unitPrice),
    unitPriceExclVat,
    amountExclVat,
    vatAmount,
    amountIncludingVat: roundToTwoDecimals(amountInclVat)
  };
}

/**
 * Calculate line item totals starting from Quantity in Litres
 */
export function calculateFromQuantity(quantityLitres: number, unitPrice: number): VATCalculationResult {
  if (unitPrice <= 0 || quantityLitres <= 0) {
    return {
      quantityLitres: roundToTwoDecimals(quantityLitres),
      unitPrice,
      unitPriceExclVat: roundToTwoDecimals(unitPrice / 1.18),
      amountExclVat: 0,
      vatAmount: 0,
      amountIncludingVat: 0
    };
  }

  const amountIncludingVat = roundToTwoDecimals(quantityLitres * unitPrice);
  const amountExclVat = roundToTwoDecimals(amountIncludingVat / 1.18);
  const vatAmount = roundToTwoDecimals(amountIncludingVat - amountExclVat);
  const unitPriceExclVat = roundToTwoDecimals(unitPrice / 1.18);

  return {
    quantityLitres: roundToTwoDecimals(quantityLitres),
    unitPrice: roundToTwoDecimals(unitPrice),
    unitPriceExclVat,
    amountExclVat,
    vatAmount,
    amountIncludingVat
  };
}

/**
 * Calculate total invoice summary across all items
 */
export function calculateInvoiceTotals(items: InvoiceItem[]) {
  let totalAmountExclVat = 0;
  let totalVatAmount = 0;
  let totalAmountIncludingVat = 0;

  items.forEach((item) => {
    totalAmountExclVat += item.amountExclVat;
    totalVatAmount += item.vatAmount;
    totalAmountIncludingVat += item.amountIncludingVat;
  });

  return {
    totalAmountExclVat: roundToTwoDecimals(totalAmountExclVat),
    totalVatAmount: roundToTwoDecimals(totalVatAmount),
    totalAmountIncludingVat: roundToTwoDecimals(totalAmountIncludingVat)
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
