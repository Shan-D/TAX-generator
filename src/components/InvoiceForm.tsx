import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, Calendar, MapPin, FileText, CreditCard, ChevronRight, Phone, Info, CheckCircle, Sparkles } from 'lucide-react';
import { InvoiceData, FuelCode, FuelRates, StationProfile, PaymentMode, InvoiceItem, BuyerRecord } from '../types/invoice';
import { FuelCalculator } from './FuelCalculator';
import { formatToYYYYMMDD, formatToMMDDYYYY } from '../utils/vatCalculator';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  fuelRates: FuelRates;
  supplierProfile: StationProfile;
  savedBuyers?: BuyerRecord[];
  onSaveBuyer?: (buyer: { name: string; tin: string; address: string; phone: string }) => void;
  onChangeField: <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => void;
  onAddItem: (item: Omit<InvoiceItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
  onPreviewClick: () => void;
  onSaveAndReset: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  fuelRates,
  supplierProfile,
  savedBuyers = [],
  onSaveBuyer,
  onChangeField,
  onAddItem,
  onRemoveItem,
  onPreviewClick,
  onSaveAndReset
}) => {
  const [activeFormStep, setActiveFormStep] = useState<1 | 2>(1);
  const [showBuyerDropdown, setShowBuyerDropdown] = useState(false);
  const [justSavedBuyerToast, setJustSavedBuyerToast] = useState(false);

  const buyerDropdownRef = useRef<HTMLDivElement>(null);
  const buyerInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buyerDropdownRef.current &&
        !buyerDropdownRef.current.contains(e.target as Node)
      ) {
        setShowBuyerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter saved buyers based on input
  const trimmedName = invoiceData.purchaserName.trim().toLowerCase();
  const filteredBuyers = useMemo(() => {
    if (!savedBuyers || savedBuyers.length === 0) return [];
    if (!trimmedName) return savedBuyers.slice(0, 8);
    return savedBuyers.filter(b =>
      (b.name && b.name.toLowerCase().includes(trimmedName)) ||
      (b.tin && b.tin.toLowerCase().includes(trimmedName)) ||
      (b.phone && b.phone.includes(trimmedName))
    );
  }, [savedBuyers, trimmedName]);

  // Check if current name matches a saved buyer
  const matchedBuyer = useMemo(() => {
    if (!trimmedName || !savedBuyers) return null;
    return savedBuyers.find(b => b.name && b.name.trim().toLowerCase() === trimmedName);
  }, [savedBuyers, trimmedName]);

  // Check if details differ from saved profile
  const hasUnsavedChanges = useMemo(() => {
    if (!matchedBuyer) return false;
    return (
      (invoiceData.purchaserTin || '').trim() !== (matchedBuyer.tin || '').trim() ||
      (invoiceData.purchaserAddress || '').trim() !== (matchedBuyer.address || '').trim() ||
      (invoiceData.purchaserPhone || '').trim() !== (matchedBuyer.phone || '').trim()
    );
  }, [matchedBuyer, invoiceData.purchaserTin, invoiceData.purchaserAddress, invoiceData.purchaserPhone]);

  // Handle selecting a buyer from suggestions
  const handleSelectBuyer = (buyer: BuyerRecord) => {
    onChangeField('purchaserName', buyer.name);
    onChangeField('purchaserTin', buyer.tin || '');
    onChangeField('purchaserAddress', buyer.address || '');
    onChangeField('purchaserPhone', buyer.phone || '');
    setShowBuyerDropdown(false);
  };

  const handleQuickSaveBuyer = () => {
    if (!invoiceData.purchaserName.trim()) return;
    if (onSaveBuyer) {
      onSaveBuyer({
        name: invoiceData.purchaserName.trim(),
        tin: invoiceData.purchaserTin.trim(),
        address: invoiceData.purchaserAddress.trim(),
        phone: invoiceData.purchaserPhone.trim()
      });
      setJustSavedBuyerToast(true);
      setTimeout(() => setJustSavedBuyerToast(false), 2000);
    }
  };

  // Parse dates for HTML inputs
  const invoiceDateInputVal = formatToYYYYMMDD(invoiceData.invoiceDate);
  const deliveryDateInputVal = formatToYYYYMMDD(invoiceData.dateOfSupply);

  return (
    <div className="space-y-4 pb-28">
      {/* Form Step Indicator Pills */}
      <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
        <button
          type="button"
          onClick={() => setActiveFormStep(1)}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeFormStep === 1
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Step 1: Customer & Supply</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveFormStep(2)}
          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeFormStep === 2
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Step 2: Add Items ({invoiceData.items.length})</span>
        </button>
      </div>

      {/* STEP 1: Customer Details & Supply Logistics */}
      {activeFormStep === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Customer & Supply Details
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Purchaser TIN, Telephone & Supply Details
              </p>
            </div>
          </div>

          {/* Invoice Meta Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Tax Invoice No.
              </label>
              <input
                type="text"
                value={invoiceData.taxInvoiceNumber}
                onChange={(e) => onChangeField('taxInvoiceNumber', e.target.value)}
                placeholder="26SEP_PLC1_0001"
                className="w-full px-3 py-1.5 font-mono font-bold text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Invoice Date (MM-DD-YYYY)
              </label>
              <input
                type="date"
                value={invoiceDateInputVal}
                onChange={(e) => onChangeField('invoiceDate', formatToMMDDYYYY(e.target.value))}
                className="w-full px-2 py-1.5 font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Purchaser Fields */}
          <div className="space-y-3">
            <div className="relative" ref={buyerDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Purchaser / Customer Name *
                </label>
                <div className="flex items-center gap-1.5">
                  {matchedBuyer ? (
                    <>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Saved Profile</span>
                      </span>
                      {hasUnsavedChanges && (
                        <button
                          type="button"
                          onClick={handleQuickSaveBuyer}
                          className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
                        >
                          Update Details
                        </button>
                      )}
                    </>
                  ) : invoiceData.purchaserName.trim().length > 1 ? (
                    <button
                      type="button"
                      onClick={handleQuickSaveBuyer}
                      className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Save as Usual Buyer</span>
                    </button>
                  ) : null}

                  {justSavedBuyerToast && (
                    <span className="text-[10px] font-bold text-emerald-600 animate-pulse">
                      Saved to database!
                    </span>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  ref={buyerInputRef}
                  type="text"
                  required
                  placeholder="Type to search or enter customer name (e.g. AB Logistics)..."
                  value={invoiceData.purchaserName}
                  onChange={(e) => {
                    onChangeField('purchaserName', e.target.value);
                    setShowBuyerDropdown(true);
                  }}
                  onFocus={() => setShowBuyerDropdown(true)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 pr-8"
                  autoComplete="off"
                />
                {invoiceData.purchaserName && (
                  <button
                    type="button"
                    onClick={() => {
                      onChangeField('purchaserName', '');
                      setShowBuyerDropdown(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {showBuyerDropdown && filteredBuyers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Saved Usual Buyers ({filteredBuyers.length})</span>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400">Click to autofill all details</span>
                  </div>
                  {filteredBuyers.map((buyer) => (
                    <button
                      key={buyer.id}
                      type="button"
                      onClick={() => handleSelectBuyer(buyer)}
                      className="w-full px-3 py-2 text-left hover:bg-brand-50/80 dark:hover:bg-slate-800/90 transition-colors flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-slate-800 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 group-hover:bg-brand-200 dark:group-hover:bg-slate-700">
                        {buyer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate">
                          {buyer.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                          {buyer.tin ? <span>TIN: {buyer.tin}</span> : <span className="italic">No TIN</span>}
                          {buyer.phone && <span>• Tel: {buyer.phone}</span>}
                        </div>
                        {buyer.address && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {buyer.address}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchaser's TIN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 109823471-7000"
                  value={invoiceData.purchaserTin}
                  onChange={(e) => onChangeField('purchaserTin', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Purchaser's Telephone No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. +94 77 123 4567"
                  value={invoiceData.purchaserPhone}
                  onChange={(e) => onChangeField('purchaserPhone', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchaser Address
              </label>
              <input
                type="text"
                placeholder="e.g. 50 Station Road, Kandy"
                value={invoiceData.purchaserAddress}
                onChange={(e) => onChangeField('purchaserAddress', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Delivery
                </label>
                <input
                  type="date"
                  value={deliveryDateInputVal}
                  onChange={(e) => onChangeField('dateOfSupply', formatToMMDDYYYY(e.target.value))}
                  className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Place of Supply
                </label>
                <input
                  type="text"
                  placeholder="KANDY"
                  value={invoiceData.placeOfSupply}
                  onChange={(e) => onChangeField('placeOfSupply', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Additional Information replacing Vehicle No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" /> Additional Information
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Vehicle No: WP CAB-1234, Driver Name, Slip notes..."
                value={invoiceData.additionalInfo}
                onChange={(e) => onChangeField('additionalInfo', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PO / Order Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-89210"
                  value={invoiceData.orderNumber}
                  onChange={(e) => onChangeField('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mode of Payment
                </label>
                <select
                  value={invoiceData.paymentMode}
                  onChange={(e) => onChangeField('paymentMode', e.target.value as PaymentMode)}
                  className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Credit">Credit</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveFormStep(2)}
              className="w-full py-3 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>Proceed to Item Entry & Calc</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Multi-item Fuel Entry */}
      {activeFormStep === 2 && (
        <FuelCalculator
          items={invoiceData.items}
          fuelRates={fuelRates}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />
      )}
    </div>
  );
};
