import { StationProfile, FuelRates, InvoiceRecord } from '../types/invoice';
import { syncInvoiceToCloud, deleteInvoiceFromCloud, syncSettingsToCloud } from './firebaseSync';

const KEYS = {
  STATION_PROFILE: 'lk_vat_fuel_station_profile',
  FUEL_RATES: 'lk_vat_fuel_rates',
  INVOICE_SEQUENCE: 'lk_vat_fuel_invoice_seq',
  INVOICE_HISTORY: 'lk_vat_fuel_invoices'
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

// Sequence Number Helper (Auto-increment format YYMMM_PLC1_0000 e.g. 26SEP_PLC1_0001)
export function getNextInvoiceNumber(): string {
  let seq = 1;
  try {
    const raw = localStorage.getItem(KEYS.INVOICE_SEQUENCE);
    if (raw) seq = parseInt(raw, 10) || 1;
  } catch (e) {
    console.error('Failed to load invoice sequence:', e);
  }
  
  const now = new Date();
  const yearYY = now.getFullYear().toString().slice(-2); // e.g. 26
  const monthMMM = now.toLocaleString('en-US', { month: 'short' }).toUpperCase(); // e.g. SEP
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

export function saveInvoiceRecord(record: Omit<InvoiceRecord, 'id' | 'createdAt'>): InvoiceRecord {
  const invoices = getSavedInvoices();
  const newRecord: InvoiceRecord = {
    ...record,
    id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString()
  };
  
  const updated = [newRecord, ...invoices];
  try {
    localStorage.setItem(KEYS.INVOICE_HISTORY, JSON.stringify(updated));
    incrementInvoiceSequence();
  } catch (e) {
    console.error('Failed to save invoice record:', e);
  }

  // Trigger Cloud Sync automatically
  syncInvoiceToCloud(newRecord);

  return newRecord;
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
