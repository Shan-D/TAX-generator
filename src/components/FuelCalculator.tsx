import React, { useState } from 'react';
import { Fuel, Plus, Trash2, ShoppingCart, Check } from 'lucide-react';
import { FuelCode, FuelRates, InvoiceItem } from '../types/invoice';
import {
  calculateFromAmount,
  calculateFromQuantity,
  formatCurrency,
  VATCalculationResult
} from '../utils/vatCalculator';

interface FuelCalculatorProps {
  items: InvoiceItem[];
  fuelRates: FuelRates;
  onAddItem: (item: Omit<InvoiceItem, 'id'>) => void;
  onRemoveItem: (id: string) => void;
}

const FUEL_OPTIONS: { code: FuelCode; label: string }[] = [
  { code: '95_PETROL', label: '95 Octane Petrol' },
  { code: 'SUPER_DIESEL', label: 'Super Diesel' },
  { code: '92_PETROL', label: '92 Petrol' },
  { code: 'AUTO_DIESEL', label: 'Auto Diesel' }
];

const FUEL_NAMES: Record<FuelCode, string> = {
  '95_PETROL': '95 Octane Petrol',
  'SUPER_DIESEL': 'Super Diesel',
  '92_PETROL': '92 Petrol',
  'AUTO_DIESEL': 'Auto Diesel'
};

export const FuelCalculator: React.FC<FuelCalculatorProps> = ({
  items,
  fuelRates,
  onAddItem,
  onRemoveItem
}) => {
  const [selectedFuel, setSelectedFuel] = useState<FuelCode>('95_PETROL');
  const [amountInput, setAmountInput] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [lastEdited, setLastEdited] = useState<'amount' | 'quantity'>('amount');
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  const currentUnitPrice = fuelRates[selectedFuel] || 0;

  // Live item calculation
  const calcResult: VATCalculationResult = (() => {
    if (lastEdited === 'amount') {
      const amt = parseFloat(amountInput) || 0;
      return calculateFromAmount(amt, currentUnitPrice);
    } else {
      const qty = parseFloat(quantityInput) || 0;
      return calculateFromQuantity(qty, currentUnitPrice);
    }
  })();

  const handleAmountChange = (val: string) => {
    setAmountInput(val);
    setLastEdited('amount');
    const amt = parseFloat(val) || 0;
    if (amt > 0 && currentUnitPrice > 0) {
      setQuantityInput((amt / currentUnitPrice).toFixed(2));
    } else {
      setQuantityInput('');
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantityInput(val);
    setLastEdited('quantity');
    const qty = parseFloat(val) || 0;
    if (qty > 0) {
      setAmountInput((qty * currentUnitPrice).toFixed(2));
    } else {
      setAmountInput('');
    }
  };

  const handleFuelChange = (code: FuelCode) => {
    setSelectedFuel(code);
    const price = fuelRates[code] || 0;
    if (lastEdited === 'amount') {
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

  const handleAddCurrentItem = () => {
    if (calcResult.amountIncludingVat <= 0 || calcResult.quantityLitres <= 0) {
      alert('Please enter a valid amount or litre quantity.');
      return;
    }

    onAddItem({
      fuelCode: selectedFuel,
      fuelName: FUEL_NAMES[selectedFuel],
      quantityLitres: calcResult.quantityLitres,
      unitPrice: calcResult.unitPrice,
      unitPriceExclVat: calcResult.unitPriceExclVat,
      amountExclVat: calcResult.amountExclVat,
      vatAmount: calcResult.vatAmount,
      amountIncludingVat: calcResult.amountIncludingVat
    });

    // Reset current item inputs
    setAmountInput('');
    setQuantityInput('');
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* List of Added Items */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Invoice Items ({items.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {items.length === 0 ? 'No items added yet' : `${items.length} Line Item(s)`}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="py-6 text-center text-slate-400 dark:text-slate-600 space-y-1">
            <Fuel className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold">Select a fuel type below to add items to this invoice</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {item.fuelName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {item.quantityLitres.toFixed(2)} L @ Rs. {formatCurrency(item.unitPrice)} / L
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      Rs. {formatCurrency(item.amountIncludingVat)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Excl: Rs. {formatCurrency(item.amountExclVat)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="Remove line item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Entry & Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Add Fuel Item
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                18% VAT auto-calculated per item
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Unit Price</span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
              Rs. {formatCurrency(currentUnitPrice)} / L
            </span>
          </div>
        </div>

        {/* Fuel Type Picker */}
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
                  onClick={() => handleFuelChange(item.code)}
                  className={`p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/80 dark:bg-brand-950/60 dark:border-brand-500 ring-2 ring-brand-500/20 text-brand-900 dark:text-brand-100 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{item.label}</div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Rs. {formatCurrency(rate)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Linked Dual Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Total Item Amount (Rs. Incl. VAT)
            </label>
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
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 font-mono font-bold text-base text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
              Quantity in Litres (L)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={quantityInput}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-900 font-mono font-bold text-base text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                L
              </span>
            </div>
          </div>
        </div>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={handleAddCurrentItem}
          className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
        >
          {addedNotice ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Item Added to Invoice!</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Item to Invoice</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
