import React from 'react';
import { Fuel } from 'lucide-react';
import { FuelCode, FuelRates } from '../types/invoice';
import { formatCurrency } from '../utils/vatCalculator';

interface FuelCalculatorProps {
  selectedFuel: FuelCode;
  fuelRates: FuelRates;
  amountInput: string;
  quantityInput: string;
  onFuelChange: (code: FuelCode) => void;
  onAmountChange: (val: string) => void;
  onQuantityChange: (val: string) => void;
}

const FUEL_OPTIONS: { code: FuelCode; label: string; badge: string }[] = [
  { code: '95_PETROL', label: '95 Octane Petrol', badge: '95 Petrol' },
  { code: 'SUPER_DIESEL', label: 'Super Diesel', badge: 'Super Diesel' },
  { code: '92_PETROL', label: '92 Petrol', badge: '92 Petrol' },
  { code: 'AUTO_DIESEL', label: 'Auto Diesel', badge: 'Auto Diesel' }
];

export const FuelCalculator: React.FC<FuelCalculatorProps> = ({
  selectedFuel,
  fuelRates,
  amountInput,
  quantityInput,
  onFuelChange,
  onAmountChange,
  onQuantityChange
}) => {
  const currentUnitPrice = fuelRates[selectedFuel] || 0;

  const handleQuickAmount = (val: number) => {
    onAmountChange(val.toString());
  };

  const handleQuickQuantity = (litres: number) => {
    onQuantityChange(litres.toString());
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Fuel Selection & Dual Calculator
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Instant 18% VAT calculation as you type
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">Unit Rate</span>
          <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm sm:text-base">
            Rs. {formatCurrency(currentUnitPrice)} <span className="text-[10px] text-slate-500 font-normal">/ L</span>
          </span>
        </div>
      </div>

      {/* Fuel Type Picker Pills */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Select Fuel Type:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FUEL_OPTIONS.map((item) => {
            const isSelected = selectedFuel === item.code;
            const rate = fuelRates[item.code];
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => onFuelChange(item.code)}
                className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/80 dark:bg-brand-950/60 dark:border-brand-500 ring-2 ring-brand-500/20 text-brand-900 dark:text-brand-100 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs sm:text-sm leading-tight truncate">{item.label}</span>
                  <Fuel className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                </div>
                <div className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  Rs. {formatCurrency(rate)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bi-Directional Dual Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
        {/* Total Amount Input */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Total Amount (Rs. Incl. VAT)
            </label>
            <span className="text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-800 dark:text-brand-200 font-semibold px-2 py-0.5 rounded-full">
              Amount Input
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
              Rs.
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amountInput}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 font-mono font-bold text-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-inner"
            />
          </div>
          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick:</span>
            {[1000, 2000, 3000, 5000, 10000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Litres Input */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Quantity in Litres (L)
            </label>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
              Litre Input
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={quantityInput}
              onChange={(e) => onQuantityChange(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-slate-900 font-mono font-bold text-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-inner"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
              L
            </span>
          </div>
          {/* Quick Litre chips */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick:</span>
            {[5, 10, 15, 20, 30, 50].map((litres) => (
              <button
                key={litres}
                type="button"
                onClick={() => handleQuickQuantity(litres)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 transition-colors"
              >
                {litres}L
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
