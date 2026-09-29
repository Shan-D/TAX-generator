export type FuelCode = '95_PETROL' | 'SUPER_DIESEL' | '92_PETROL' | 'AUTO_DIESEL';

export interface FuelRateItem {
  code: FuelCode;
  name: string;
  pricePerLitre: number; // Inclusive of VAT
}

export type FuelRates = Record<FuelCode, number>;

export interface StationProfile {
  supplierName: string;
  supplierTin: string;
  supplierAddress: string;
  supplierPhone: string;
  defaultPlaceOfSupply: string;
}

export type PaymentMode = 'Cash' | 'Card' | 'Credit' | 'Bank Transfer';

export interface InvoiceItem {
  id: string;
  fuelCode: FuelCode;
  fuelName: string;
  quantityLitres: number;
  unitPrice: number; // Price per litre (incl. VAT)
  unitPriceExclVat: number; // Price per litre (excl. VAT)
  amountExclVat: number;
  vatAmount: number; // 18% VAT
  amountIncludingVat: number; // Line Total
}

export interface InvoiceData {
  taxInvoiceNumber: string; // e.g. 26SEP_PLC1_0001
  invoiceDate: string; // MM-DD-YYYY
  dateOfSupply: string; // MM-DD-YYYY
  placeOfSupply: string;
  
  // Purchaser details
  purchaserName: string;
  purchaserTin: string;
  purchaserAddress: string;
  purchaserPhone: string;
  
  // Logistics / Reference
  orderNumber: string;
  additionalInfo: string;
  
  // Multi-item support
  items: InvoiceItem[];
  
  // Summary Totals
  totalAmountExclVat: number;
  totalVatAmount: number;
  totalAmountIncludingVat: number;
  
  // Payment
  paymentMode: PaymentMode;
  amountInWords: string;
  
  createdAt?: string;
}

export interface InvoiceRecord extends InvoiceData {
  id: string;
  createdAt: string;
}
