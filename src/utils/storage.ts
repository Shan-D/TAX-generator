import { StationProfile, FuelRates, InvoiceRecord, BuyerRecord } from '../types/invoice';
import {
  syncInvoiceToCloud,
  deleteInvoiceFromCloud,
  syncSettingsToCloud,
  syncBuyerToCloud,
  deleteBuyerFromCloud
} from './firebaseSync';

const KEYS = {
  STATION_PROFILE: 'lk_vat_fuel_station_profile',
  FUEL_RATES: 'lk_vat_fuel_rates',
  INVOICE_SEQUENCE: 'lk_vat_fuel_invoice_seq',
  INVOICE_HISTORY: 'lk_vat_fuel_invoices',
  BUYERS: 'lk_vat_fuel_buyers'
};

export const DEFAULT_STATION_PROFILE: StationProfile = {
  supplierName: 'PLC ALWIS ENTERPRICES',
  supplierTin: '103417660-7000',
  supplierAddress: '144, ANAGARIKA DHARMAPALA MAWATHA, KANDY',
  supplierPhone: '+94 777769870',
  defaultPlaceOfSupply: 'KANDY'
};

export const DEFAULT_FUEL_RATES: FuelRates = {
  '92_PETROL': 371.00,
  '95_PETROL': 456.00,
  'AUTO_DIESEL': 317.00,
  'SUPER_DIESEL': 385.00
};

// Station Profile Persistence
export function loadStationProfile(): StationProfile {
  try {
    const raw = localStorage.getItem(KEYS.STATION_PROFILE);
    if (raw) return { ...DEFAULT_STATION_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load station profile:', e);
  }
  return DEFAULT_STATION_PROFILE;
}

export function saveStationProfile(profile: StationProfile): void {
  try {
    localStorage.setItem(KEYS.STATION_PROFILE, JSON.stringify(profile));
    syncSettingsToCloud(profile, loadFuelRates());
  } catch (e) {
    console.error('Failed to save station profile:', e);
  }
}

// Fuel Rates Persistence
export function loadFuelRates(): FuelRates {
  try {
    const raw = localStorage.getItem(KEYS.FUEL_RATES);
    if (raw) return { ...DEFAULT_FUEL_RATES, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load fuel rates:', e);
  }
  return DEFAULT_FUEL_RATES;
}

export function saveFuelRates(rates: FuelRates): void {
  try {
    localStorage.setItem(KEYS.FUEL_RATES, JSON.stringify(rates));
    syncSettingsToCloud(loadStationProfile(), rates);
  } catch (e) {
    console.error('Failed to save fuel rates:', e);
  }
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function getYearMonthFromDate(dateInput?: string | Date): { yearYY: string; monthMMM: string } {
  if (!dateInput) {
    const now = new Date();
    return {
      yearYY: now.getFullYear().toString().slice(-2),
      monthMMM: MONTHS[now.getMonth()]
    };
  }

  if (dateInput instanceof Date) {
    if (!isNaN(dateInput.getTime())) {
      return {
        yearYY: dateInput.getFullYear().toString().slice(-2),
        monthMMM: MONTHS[dateInput.getMonth()]
      };
    }
  }

  const str = String(dateInput).trim();

  // Check YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = parseInt(ymdMatch[2], 10);
    if (month >= 1 && month <= 12) {
      return {
        yearYY: year.slice(-2),
        monthMMM: MONTHS[month - 1]
      };
    }
  }

  // Check MM-DD-YYYY or MM/DD/YYYY
  const mdyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mdyMatch) {
    const month = parseInt(mdyMatch[1], 10);
    const year = mdyMatch[3];
    if (month >= 1 && month <= 12) {
      return {
        yearYY: year.slice(-2),
        monthMMM: MONTHS[month - 1]
      };
    }
  }

  // Fallback to standard JS Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return {
      yearYY: parsed.getFullYear().toString().slice(-2),
      monthMMM: MONTHS[parsed.getMonth()]
    };
  }

  const now = new Date();
  return {
    yearYY: now.getFullYear().toString().slice(-2),
    monthMMM: MONTHS[now.getMonth()]
  };
}

export function updateInvoiceNumberDate(currentInvoiceNumber: string, dateInput: string | Date): string {
  const { yearYY, monthMMM } = getYearMonthFromDate(dateInput);

  if (!currentInvoiceNumber || !currentInvoiceNumber.trim()) {
    return getNextInvoiceNumber(dateInput);
  }

  const trimmed = currentInvoiceNumber.trim();

  // 1. Standard format: YYMMM_PLC1_XXXX e.g. 26SEP_PLC1_0001
  const standardMatch = trimmed.match(/^(\d{2})([A-Za-z]{3})(_.*)$/);
  if (standardMatch) {
    return `${yearYY}${monthMMM}${standardMatch[3]}`;
  }

  // 2. Format with hyphen or other separator: YYMMM-XXXX or YY-MMM-XXXX
  const altMatch = trimmed.match(/^(\d{2})[-_]?([A-Za-z]{3})([-_\s].*)$/);
  if (altMatch) {
    return `${yearYY}${monthMMM}${altMatch[3]}`;
  }

  // 3. Format with 3 letters only at start: MMM_PLC1_XXXX
  const monthOnlyMatch = trimmed.match(/^([A-Za-z]{3})(_.*)$/);
  if (monthOnlyMatch) {
    return `${yearYY}${monthMMM}${monthOnlyMatch[2]}`;
  }

  // 4. If there's an underscore followed by something ending with digits (e.g. anything_0001)
  const suffixMatch = trimmed.match(/(_.*)$/);
  if (suffixMatch) {
    return `${yearYY}${monthMMM}${suffixMatch[1]}`;
  }

  return `${yearYY}${monthMMM}_${trimmed}`;
}

// Sequence Number Helper (Auto-increment format YYMMM_PLC1_0000 e.g. 26SEP_PLC1_0001)
export function getNextInvoiceNumber(dateInput?: string | Date): string {
  let seq = 1;
  try {
    const raw = localStorage.getItem(KEYS.INVOICE_SEQUENCE);
    if (raw) seq = parseInt(raw, 10) || 1;
  } catch (e) {
    console.error('Failed to load invoice sequence:', e);
  }
  
  const { yearYY, monthMMM } = getYearMonthFromDate(dateInput);
  const paddedSeq = seq.toString().padStart(4, '0'); // e.g. 0001

  return `${yearYY}${monthMMM}_PLC1_${paddedSeq}`;
}

export function incrementInvoiceSequence(): void {
  try {
    const raw = localStorage.getItem(KEYS.INVOICE_SEQUENCE);
    let seq = raw ? parseInt(raw, 10) || 1 : 1;
    seq += 1;
    localStorage.setItem(KEYS.INVOICE_SEQUENCE, seq.toString());
  } catch (e) {
    console.error('Failed to increment sequence:', e);
  }
}

export function setInvoiceSequence(num: number): void {
  try {
    localStorage.setItem(KEYS.INVOICE_SEQUENCE, num.toString());
  } catch (e) {
    console.error('Failed to set invoice sequence:', e);
  }
}

// Invoice History Persistence
export function getSavedInvoices(): InvoiceRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.INVOICE_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get saved invoices:', e);
  }
  return [];
}

export function saveInvoiceRecord(record: Omit<InvoiceRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): InvoiceRecord {
  const invoices = getSavedInvoices();
  const existingIndex = invoices.findIndex(inv => 
    (record.id && inv.id === record.id) || 
    (inv.taxInvoiceNumber && record.taxInvoiceNumber && inv.taxInvoiceNumber.trim().toUpperCase() === record.taxInvoiceNumber.trim().toUpperCase())
  );

  let savedRecord: InvoiceRecord;

  if (existingIndex >= 0) {
    savedRecord = {
      ...invoices[existingIndex],
      ...record,
      updatedAt: new Date().toISOString()
    };
    invoices[existingIndex] = savedRecord;
  } else {
    savedRecord = {
      ...record,
      id: record.id || ('inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
      createdAt: record.createdAt || new Date().toISOString()
    };
    invoices.unshift(savedRecord);
    incrementInvoiceSequence();
  }

  try {
    localStorage.setItem(KEYS.INVOICE_HISTORY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoice record:', e);
  }

  // Trigger Cloud Sync automatically
  syncInvoiceToCloud(savedRecord);

  return savedRecord;
}

export function saveRawInvoiceRecords(records: InvoiceRecord[]): void {
  try {
    localStorage.setItem(KEYS.INVOICE_HISTORY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save raw invoice records:', e);
  }
}

export function deleteInvoiceRecord(id: string): void {
  const invoices = getSavedInvoices();
  const updated = invoices.filter(inv => inv.id !== id);
  try {
    localStorage.setItem(KEYS.INVOICE_HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete invoice record:', e);
  }

  // Trigger Cloud Delete
  deleteInvoiceFromCloud(id);
}

// Frequent Buyers Directory Persistence
export function getSavedBuyers(): BuyerRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.BUYERS);
    if (raw) {
      const parsed: BuyerRecord[] = JSON.parse(raw);
      return parsed.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
  } catch (e) {
    console.error('Failed to get saved buyers:', e);
  }
  return [];
}

export function saveBuyerRecord(buyer: Omit<BuyerRecord, 'id' | 'createdAt'> & { id?: string }): BuyerRecord {
  const buyers = getSavedBuyers();
  const trimmedName = buyer.name.trim();

  // Look for existing buyer by id, or by exact case-insensitive name
  const existingIndex = buyers.findIndex(b => 
    (buyer.id && b.id === buyer.id) || 
    (b.name && b.name.trim().toLowerCase() === trimmedName.toLowerCase())
  );

  let savedRecord: BuyerRecord;

  if (existingIndex >= 0) {
    // Update existing record
    const existing = buyers[existingIndex];
    savedRecord = {
      ...existing,
      name: trimmedName,
      tin: buyer.tin !== undefined ? buyer.tin.trim() : existing.tin,
      address: buyer.address !== undefined ? buyer.address.trim() : existing.address,
      phone: buyer.phone !== undefined ? buyer.phone.trim() : existing.phone,
      updatedAt: new Date().toISOString()
    };
    buyers[existingIndex] = savedRecord;
  } else {
    // Insert new buyer record
    savedRecord = {
      id: buyer.id || 'buyer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: trimmedName,
      tin: (buyer.tin || '').trim(),
      address: (buyer.address || '').trim(),
      phone: (buyer.phone || '').trim(),
      createdAt: new Date().toISOString()
    };
    buyers.push(savedRecord);
  }

  // Sort alphabetically
  buyers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  try {
    localStorage.setItem(KEYS.BUYERS, JSON.stringify(buyers));
  } catch (e) {
    console.error('Failed to save buyers to local storage:', e);
  }

  // Sync to Cloud
  syncBuyerToCloud(savedRecord);

  return savedRecord;
}

export function saveRawBuyerRecords(records: BuyerRecord[]): void {
  try {
    const sorted = [...records].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    localStorage.setItem(KEYS.BUYERS, JSON.stringify(sorted));
  } catch (e) {
    console.error('Failed to save raw buyer records:', e);
  }
}

export function deleteBuyerRecord(id: string): void {
  const buyers = getSavedBuyers();
  const updated = buyers.filter(b => b.id !== id);
  try {
    localStorage.setItem(KEYS.BUYERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete buyer record from local storage:', e);
  }

  // Trigger Cloud Delete
  deleteBuyerFromCloud(id);
}
