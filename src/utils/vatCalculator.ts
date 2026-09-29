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
 * Calculate totals starting from Amount Including VAT (A_total)
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
 * Calculate totals starting from Quantity in Litres (Q)
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
