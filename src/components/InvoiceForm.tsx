import React, { useState } from 'react';
import { User, Calendar, MapPin, FileText, CreditCard, ChevronRight } from 'lucide-react';
import { InvoiceData, FuelCode, FuelRates, StationProfile, PaymentMode } from '../types/invoice';
import { FuelCalculator } from './FuelCalculator';
import { VATCalculationResult } from '../utils/vatCalculator';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  fuelRates: FuelRates;
  supplierProfile: StationProfile;
  amountInput: string;
  quantityInput: string;
  calcResult: VATCalculationResult;
  onChangeField: <K extends keyof InvoiceData>(field: K, value: InvoiceData[K]) => void;
  onAmountChange: (val: string) => void;
  onQuantityChange: (val: string) => void;
  onFuelChange: (code: FuelCode) => void;
  onPreviewClick: () => void;
  onSaveAndReset: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  fuelRates,
  supplierProfile,
  amountInput,
  quantityInput,
  calcResult,
  onChangeField,
  onAmountChange,
  onQuantityChange,
  onFuelChange,
  onPreviewClick,
  onSaveAndReset
}) => {
  const [activeFormStep, setActiveFormStep] = useState<1 | 2>(1);

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
          <span>Step 1: Customer & Delivery</span>
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
          <span>Step 2: Fuel Entry & Calc</span>
        </button>
      </div>

      {/* STEP 1: Customer & Delivery Logistics */}
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
                Purchaser VAT TIN & Delivery Details
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
                className="w-full px-3 py-1.5 font-mono font-bold text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Invoice Date
              </label>
              <input
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => onChangeField('invoiceDate', e.target.value)}
                className="w-full px-2 py-1.5 font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Purchaser Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchaser / Customer Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AB Logistics (Pvt) Ltd or Cash Customer"
                value={invoiceData.purchaserName}
                onChange={(e) => onChangeField('purchaserName', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchaser VAT / TIN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 109823471-7000 (Mandatory for VAT Credit)"
                  value={invoiceData.purchaserTin}
                  onChange={(e) => onChangeField('purchaserTin', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. WP CAB-1234"
                  value={invoiceData.vehicleNumber}
                  onChange={(e) => onChangeField('vehicleNumber', e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono uppercase font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Purchaser Address
              </label>
              <input
                type="text"
                placeholder="e.g. 50 Station Road, Colombo 03"
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
                  value={invoiceData.dateOfSupply}
                  onChange={(e) => onChangeField('dateOfSupply', e.target.value)}
                  className="w-full px-2 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Place of Supply
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kelaniya"
                  value={invoiceData.placeOfSupply}
                  onChange={(e) => onChangeField('placeOfSupply', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PO / Order / Slip Ref
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
              <span>Proceed to Fuel Entry & Calc</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Fuel Entry & Reactive Dual Calculator */}
      {activeFormStep === 2 && (
        <FuelCalculator
          selectedFuel={invoiceData.fuelCode}
          fuelRates={fuelRates}
          amountInput={amountInput}
          quantityInput={quantityInput}
          onFuelChange={onFuelChange}
          onAmountChange={onAmountChange}
          onQuantityChange={onQuantityChange}
        />
      )}
    </div>
  );
};
