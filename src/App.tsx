import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceSummary } from './components/InvoiceSummary';
import { PreviewModal } from './components/PreviewModal';
import { SettingsModal } from './components/SettingsModal';
import { InvoiceHistory } from './components/InvoiceHistory';
import {
  InvoiceData,
  FuelCode,
  FuelRates,
  StationProfile,
  InvoiceRecord,
  InvoiceItem
} from './types/invoice';
import {
  loadStationProfile,
  saveStationProfile,
  loadFuelRates,
  saveFuelRates,
  getNextInvoiceNumber,
  saveInvoiceRecord,
  saveRawInvoiceRecords,
  getSavedInvoices,
  deleteInvoiceRecord
} from './utils/storage';
import {
  calculateInvoiceTotals,
  formatToMMDDYYYY
} from './utils/vatCalculator';
import { numberToWords } from './utils/numberToWords';
import { Eye, Download, PlusCircle, CheckCircle } from 'lucide-react';
import { exportInvoiceToPDF } from './utils/pdfExport';
import { isFirebaseConfigured } from './config/firebase';
import {
  subscribeCloudInvoices,
  subscribeCloudSettings,
  fetchCloudInvoices,
  fetchCloudSettings
} from './utils/firebaseSync';

export function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('lk_vat_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lk_vat_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Network online/offline state
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistent Settings
  const [stationProfile, setStationProfile] = useState<StationProfile>(loadStationProfile);
  const [fuelRates, setFuelRates] = useState<FuelRates>(loadFuelRates);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceRecord[]>(getSavedInvoices);

  // Firebase Cloud Sync Listeners & Initial Hydration
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isFirebaseConfigured());

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsCloudConnected(configured);
    if (!configured) return;

    // Immediate initial cloud fetch on startup
    fetchCloudInvoices().then((records) => {
      if (records && records.length > 0) {
        setSavedInvoices(records);
        saveRawInvoiceRecords(records);
      }
    });

    fetchCloudSettings().then((settings) => {
      if (settings) {
        if (settings.profile) {
          setStationProfile(settings.profile);
          try { localStorage.setItem('lk_vat_fuel_station_profile', JSON.stringify(settings.profile)); } catch (e) {}
        }
        if (settings.rates) {
          setFuelRates(settings.rates);
          try { localStorage.setItem('lk_vat_fuel_rates', JSON.stringify(settings.rates)); } catch (e) {}
        }
      }
    });

    // 1. Real-time Cloud Invoices synchronization
    const unsubInvoices = subscribeCloudInvoices((cloudInvoices) => {
      if (cloudInvoices && cloudInvoices.length > 0) {
        setSavedInvoices(cloudInvoices);
        saveRawInvoiceRecords(cloudInvoices);
      }
    });

    // 2. Real-time Cloud Station Settings & Fuel Rates synchronization
    const unsubSettings = subscribeCloudSettings(({ profile, rates }) => {
      if (profile) {
        setStationProfile(profile);
        try { localStorage.setItem('lk_vat_fuel_station_profile', JSON.stringify(profile)); } catch (e) {}
      }
      if (rates) {
        setFuelRates(rates);
        try { localStorage.setItem('lk_vat_fuel_rates', JSON.stringify(rates)); } catch (e) {}
      }
    });

    return () => {
      unsubInvoices();
      unsubSettings();
    };
  }, []);

  // App Tabs: 'create' | 'history'
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  // Default Today Date formatted in MM-DD-YYYY
  const todayMMDDYYYY = formatToMMDDYYYY(new Date().toISOString().split('T')[0]);

  // Active Invoice Form Data
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    taxInvoiceNumber: getNextInvoiceNumber(), // YYMMM_PLC1_0000 format e.g. 26SEP_PLC1_0001
    invoiceDate: todayMMDDYYYY,
    dateOfSupply: todayMMDDYYYY,
    placeOfSupply: stationProfile.defaultPlaceOfSupply,
    purchaserName: '',
    purchaserTin: '',
    purchaserAddress: '',
    purchaserPhone: '',
    orderNumber: '',
    additionalInfo: '',
    items: [],
    totalAmountExclVat: 0,
    totalVatAmount: 0,
    totalAmountIncludingVat: 0,
    paymentMode: 'Cash',
    amountInWords: ''
  });

  // Recalculate summary totals whenever invoiceData.items changes
  useEffect(() => {
    const totals = calculateInvoiceTotals(invoiceData.items);
    setInvoiceData((prev) => ({
      ...prev,
      totalAmountExclVat: totals.totalAmountExclVat,
      totalVatAmount: totals.totalVatAmount,
      totalAmountIncludingVat: totals.totalAmountIncludingVat,
      amountInWords: numberToWords(totals.totalAmountIncludingVat)
    }));
  }, [invoiceData.items]);

  // Handle adding an item to the current invoice
  const handleAddItem = (item: Omit<InvoiceItem, 'id'>) => {
    const newItem: InvoiceItem = {
      ...item,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    setInvoiceData((prev) => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Handle removing an item from the current invoice
  const handleRemoveItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id)
    }));
  };

  const handleFieldChange = <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => {
    setInvoiceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = (newProfile: StationProfile, newRates: FuelRates) => {
    setStationProfile(newProfile);
    setFuelRates(newRates);
    saveStationProfile(newProfile);
    saveFuelRates(newRates);
    setIsCloudConnected(isFirebaseConfigured());
  };

  // Save to history & reset form for next invoice
  const handleSaveAndReset = () => {
    if (invoiceData.items.length === 0) {
      alert('Please add at least one fuel item to save the invoice.');
      return;
    }

    saveInvoiceRecord(invoiceData);
    setSavedInvoices(getSavedInvoices());

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);

    // Reset inputs for next bill
    setInvoiceData({
      taxInvoiceNumber: getNextInvoiceNumber(),
      invoiceDate: todayMMDDYYYY,
      dateOfSupply: todayMMDDYYYY,
      placeOfSupply: stationProfile.defaultPlaceOfSupply,
      purchaserName: '',
      purchaserTin: '',
      purchaserAddress: '',
      purchaserPhone: '',
      orderNumber: '',
      additionalInfo: '',
      items: [],
      totalAmountExclVat: 0,
      totalVatAmount: 0,
      totalAmountIncludingVat: 0,
      paymentMode: 'Cash',
      amountInWords: ''
    });
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoiceRecord(id);
    setSavedInvoices(getSavedInvoices());
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* App Header */}
      <Header
        isOnline={isOnline}
        isCloudConnected={isCloudConnected}
        stationProfile={stationProfile}
        activeTab={activeTab}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'create' ? (
          <div className="space-y-4">
            <InvoiceForm
              invoiceData={invoiceData}
              fuelRates={fuelRates}
              supplierProfile={stationProfile}
              onChangeField={handleFieldChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onPreviewClick={() => setIsPreviewOpen(true)}
              onSaveAndReset={handleSaveAndReset}
            />

            {/* Real-time Summary for all items */}
            <InvoiceSummary invoiceData={invoiceData} />
          </div>
        ) : (
          <InvoiceHistory
            invoices={savedInvoices}
            supplierProfile={stationProfile}
            onDeleteInvoice={handleDeleteInvoice}
          />
        )}
      </main>

      {/* Mobile-First Sticky Action Bar */}
      {activeTab === 'create' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 py-3 px-2 sm:px-4 bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <Eye className="w-4 h-4 text-brand-400" />
              <span>A4 Preview</span>
            </button>

            <button
              onClick={() => {
                setIsPreviewOpen(true);
                setTimeout(() => exportInvoiceToPDF('a4-tax-invoice-document', `Tax_Invoice_${invoiceData.taxInvoiceNumber}.pdf`), 300);
              }}
              className="flex-1 py-3 px-2 sm:px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleSaveAndReset}
              className="flex-1 py-3 px-2 sm:px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>Save & Next</span>
            </button>
          </div>
        </div>
      )}

      {/* Saved Toast Notification */}
      {showSavedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Invoice Saved to History {isCloudConnected ? '& Cloud!' : '!'}</span>
        </div>
      )}

      {/* Settings Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        stationProfile={stationProfile}
        fuelRates={fuelRates}
        onSave={handleSaveSettings}
      />

      {/* A4 Tax Invoice Document Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={invoiceData}
        supplierProfile={stationProfile}
      />
    </div>
  );
}
