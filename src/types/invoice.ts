export type FuelCode = '92_PETROL' | '95_PETROL' | 'AUTO_DIESEL' | 'SUPER_DIESEL';

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

export interface InvoiceData {
  taxInvoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dateOfSupply: string; // YYYY-MM-DD (Date of Delivery)
  placeOfSupply: string;
  
  // Purchaser details
  purchaserName: string;
  purchaserTin: string;
  purchaserAddress: string;
  purchaserPhone: string;
  
  // Logistics / Reference
  orderNumber: string;
  vehicleNumber: string;
  additionalInfo: string;
  
  // Fuel entry details
  fuelCode: FuelCode;
  fuelName: string;
  quantityLitres: number;
  unitPrice: number; // Price per litre (incl. VAT)
  unitPriceExclVat: number; // Price per litre (excl. VAT)
  amountExclVat: number;
  vatAmount: number; // 18% VAT
  amountIncludingVat: number; // Grand Total
  
  // Payment
  paymentMode: PaymentMode;
  amountInWords: string;
  
  createdAt?: string;
}

export interface InvoiceRecord extends InvoiceData {
  id: string;
  createdAt: string;
}
