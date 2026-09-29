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
  InvoiceRecord
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
  calculateFromAmount,
  calculateFromQuantity,
  VATCalculationResult
} from './utils/vatCalculator';
import { numberToWords } from './utils/numberToWords';
import { Eye, Download, PlusCircle, CheckCircle } from 'lucide-react';
import { exportInvoiceToPDF } from './utils/pdfExport';
import { isFirebaseConfigured } from './config/firebase';
import { subscribeCloudInvoices } from './utils/firebaseSync';

const FUEL_NAMES: Record<FuelCode, string> = {
  '95_PETROL': '95 Octane Petrol',
  'SUPER_DIESEL': 'Super Diesel',
  '92_PETROL': '92 Petrol',
  'AUTO_DIESEL': 'Auto Diesel'
};

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

  // Firebase Cloud Sync Listener
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isFirebaseConfigured());

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsCloudConnected(configured);
    if (!configured) return;

    // Real-time Cloud Firestore synchronization
    const unsubscribe = subscribeCloudInvoices((cloudInvoices) => {
      if (cloudInvoices && cloudInvoices.length > 0) {
        setSavedInvoices(cloudInvoices);
        saveRawInvoiceRecords(cloudInvoices);
      }
    });

    return () => unsubscribe();
  }, []);

  // App Tabs: 'create' | 'history'
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  // Active Invoice Form Data
  const todayStr = new Date().toISOString().split('T')[0];

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    taxInvoiceNumber: getNextInvoiceNumber(),
    invoiceDate: todayStr,
    dateOfSupply: todayStr,
    placeOfSupply: stationProfile.defaultPlaceOfSupply,
    purchaserName: '',
    purchaserTin: '',
    purchaserAddress: '',
    purchaserPhone: '',
    orderNumber: '',
    vehicleNumber: '',
    additionalInfo: '',
    fuelCode: '95_PETROL',
    fuelName: FUEL_NAMES['95_PETROL'],
    quantityLitres: 0,
    unitPrice: fuelRates['95_PETROL'],
    unitPriceExclVat: fuelRates['95_PETROL'] / 1.18,
    amountExclVat: 0,
    vatAmount: 0,
    amountIncludingVat: 0,
    paymentMode: 'Cash',
    amountInWords: ''
  });

  // String Inputs for dual-reactive calculator
  const [amountInput, setAmountInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [lastEditedField, setLastEditedField] = useState<'amount' | 'quantity'>('amount');

  // Calculate live results
  const calcResult: VATCalculationResult = useMemo(() => {
    const currentPrice = fuelRates[invoiceData.fuelCode] || 0;
    if (lastEditedField === 'amount') {
      const amt = parseFloat(amountInput) || 0;
      return calculateFromAmount(amt, currentPrice);
    } else {
      const qty = parseFloat(quantityInput) || 0;
      return calculateFromQuantity(qty, currentPrice);
    }
  }, [amountInput, quantityInput, lastEditedField, invoiceData.fuelCode, fuelRates]);

  // Sync calcResult to invoiceData state
  useEffect(() => {
    setInvoiceData((prev) => ({
      ...prev,
      quantityLitres: calcResult.quantityLitres,
      unitPrice: calcResult.unitPrice,
      unitPriceExclVat: calcResult.unitPriceExclVat,
      amountExclVat: calcResult.amountExclVat,
      vatAmount: calcResult.vatAmount,
      amountIncludingVat: calcResult.amountIncludingVat,
      amountInWords: numberToWords(calcResult.amountIncludingVat)
    }));
  }, [calcResult]);

  // Dual calculator handlers
  const handleAmountChange = (val: string) => {
    setAmountInput(val);
    setLastEditedField('amount');
    const amt = parseFloat(val) || 0;
    const price = fuelRates[invoiceData.fuelCode] || 1;
    if (amt > 0 && price > 0) {
      setQuantityInput((amt / price).toFixed(2));
    } else {
      setQuantityInput('');
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantityInput(val);
    setLastEditedField('quantity');
    const qty = parseFloat(val) || 0;
    const price = fuelRates[invoiceData.fuelCode] || 1;
    if (qty > 0) {
      setAmountInput((qty * price).toFixed(2));
    } else {
      setAmountInput('');
    }
  };

  const handleFuelChange = (code: FuelCode) => {
    const price = fuelRates[code] || 0;
    setInvoiceData((prev) => ({
      ...prev,
      fuelCode: code,
      fuelName: FUEL_NAMES[code],
      unitPrice: price
    }));

    if (lastEditedField === 'amount') {
      const amt = parseFloat(amountInput) || 0;
      if (amt > 0 && price > 0) {
        setQuantityInput((amt / price).toFixed(2));
      }
    } else {
      const qty = parseFloat(quantityInput) || 0;
      if (qty > 0) {
        setAmountInput((qty * price).toFixed(2));
      }
    }
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
    const saved = saveInvoiceRecord(invoiceData);
    setSavedInvoices(getSavedInvoices());

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);

    // Reset inputs for next bill
    setAmountInput('');
    setQuantityInput('');
    setInvoiceData({
      taxInvoiceNumber: getNextInvoiceNumber(),
      invoiceDate: todayStr,
      dateOfSupply: todayStr,
      placeOfSupply: stationProfile.defaultPlaceOfSupply,
      purchaserName: '',
      purchaserTin: '',
      purchaserAddress: '',
      purchaserPhone: '',
      orderNumber: '',
      vehicleNumber: '',
      additionalInfo: '',
      fuelCode: invoiceData.fuelCode,
      fuelName: FUEL_NAMES[invoiceData.fuelCode],
      quantityLitres: 0,
      unitPrice: fuelRates[invoiceData.fuelCode],
      unitPriceExclVat: fuelRates[invoiceData.fuelCode] / 1.18,
      amountExclVat: 0,
      vatAmount: 0,
      amountIncludingVat: 0,
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
              amountInput={amountInput}
              quantityInput={quantityInput}
              calcResult={calcResult}
              onChangeField={handleFieldChange}
              onAmountChange={handleAmountChange}
              onQuantityChange={handleQuantityChange}
              onFuelChange={handleFuelChange}
              onPreviewClick={() => setIsPreviewOpen(true)}
              onSaveAndReset={handleSaveAndReset}
            />

            {/* Real-time Calculation Summary */}
            <InvoiceSummary
              calcResult={calcResult}
              fuelName={invoiceData.fuelName}
            />
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
