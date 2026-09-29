import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '../config/firebase';
import { InvoiceRecord, StationProfile, FuelRates } from '../types/invoice';

const INVOICES_COLLECTION = 'invoices';
const SETTINGS_COLLECTION = 'settings';

export async function syncInvoiceToCloud(invoice: InvoiceRecord): Promise<boolean> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const docRef = doc(db, INVOICES_COLLECTION, invoice.id);
    await setDoc(docRef, {
      ...invoice,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to sync invoice to cloud:', e);
    return false;
  }
}

export async function deleteInvoiceFromCloud(id: string): Promise<boolean> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (e) {
    console.error('Failed to delete invoice from cloud:', e);
    return false;
  }
}

export async function fetchCloudInvoices(): Promise<InvoiceRecord[]> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) return [];

  try {
    const snap = await getDocs(collection(db, INVOICES_COLLECTION));
    const records: InvoiceRecord[] = [];
    snap.forEach((docSnap) => {
      records.push(docSnap.data() as InvoiceRecord);
    });
    records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return records;
  } catch (e) {
    console.error('Failed to fetch cloud invoices:', e);
    return [];
  }
}

export function subscribeCloudInvoices(
  onSuccess: (invoices: InvoiceRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const unsubscribe = onSnapshot(
      collection(db, INVOICES_COLLECTION),
      (snapshot) => {
        const records: InvoiceRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as InvoiceRecord);
        });
        records.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onSuccess(records);
      },
      (err) => {
        console.error('Firestore snapshot subscription error:', err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.error('Error setting up cloud invoices subscription:', e);
    return () => {};
  }
}

export async function fetchCloudSettings(): Promise<{ profile?: StationProfile; rates?: FuelRates } | null> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) return null;

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'station_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        profile: data.profile as StationProfile,
        rates: data.rates as FuelRates
      };
    }
  } catch (e) {
    console.error('Failed to fetch cloud settings:', e);
  }
  return null;
}

export async function syncSettingsToCloud(profile: StationProfile, rates: FuelRates): Promise<boolean> {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) return false;

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'station_config');
    await setDoc(docRef, {
      profile,
      rates,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (e) {
    console.error('Failed to sync settings to cloud:', e);
    return false;
  }
}

export function subscribeCloudSettings(
  onSuccess: (data: { profile: StationProfile; rates: FuelRates }) => void
): () => void {
  const db = getDb();
  if (!db || !isFirebaseConfigured()) return () => {};

  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'station_config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile && data.rates) {
          onSuccess({
            profile: data.profile as StationProfile,
            rates: data.rates as FuelRates
          });
        }
      }
    }, (err) => {
      console.error('Settings snapshot listener error:', err);
    });

    return unsubscribe;
  } catch (e) {
    console.error('Error subscribing to cloud settings:', e);
    return () => {};
  }
}
