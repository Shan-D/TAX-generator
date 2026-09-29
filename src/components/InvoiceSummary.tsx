import React from 'react';
import { VATCalculationResult, formatCurrency } from '../utils/vatCalculator';

interface InvoiceSummaryProps {
  calcResult: VATCalculationResult;
  fuelName: string;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ calcResult, fuelName }) => {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase block">
            Selected Fuel Item
          </span>
          <span className="font-bold text-white text-base">{fuelName || 'Fuel'}</span>
          <span className="text-xs text-slate-400 ml-2">
            ({calcResult.quantityLitres.toFixed(2)} Litres @ Rs. {formatCurrency(calcResult.unitPrice)})
          </span>
        </div>

        <div className="text-right w-full sm:w-auto flex justify-between sm:block">
          <span className="text-xs text-slate-400 font-medium sm:hidden">Grand Total:</span>
          <span className="font-mono font-extrabold text-2xl text-emerald-400">
            LKR {formatCurrency(calcResult.amountIncludingVat)}
          </span>
        </div>
      </div>

      {/* Tax Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 text-center">
        <div className="bg-slate-800/60 p-2 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Value Excl. VAT</span>
          <span className="font-mono text-sm font-bold text-slate-200">
            Rs. {formatCurrency(calcResult.amountExclVat)}
          </span>
        </div>

        <div className="bg-slate-800/60 p-2 rounded-xl border border-brand-500/20">
          <span className="text-[11px] text-brand-300 block font-semibold">VAT @ 18%</span>
          <span className="font-mono text-sm font-bold text-brand-300">
            Rs. {formatCurrency(calcResult.vatAmount)}
          </span>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
          <span className="text-[11px] text-emerald-400 block font-semibold">Total Payable</span>
          <span className="font-mono text-sm font-extrabold text-emerald-400">
            Rs. {formatCurrency(calcResult.amountIncludingVat)}
          </span>
        </div>
      </div>
    </div>
  );
};
