import React from 'react';
import { formatCurrency } from '../utils/vatCalculator';
import { InvoiceData } from '../types/invoice';

interface InvoiceSummaryProps {
  invoiceData: InvoiceData;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ invoiceData }) => {
  const itemCount = invoiceData.items.length;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase block">
            Invoice Summary Breakdown
          </span>
          <span className="font-bold text-white text-base">
            {itemCount === 0 ? 'No items added' : `${itemCount} Item(s) Included`}
          </span>
        </div>

        <div className="text-right w-full sm:w-auto flex justify-between sm:block">
          <span className="text-xs text-slate-400 font-medium sm:hidden">Grand Total:</span>
          <span className="font-mono font-extrabold text-2xl text-emerald-400">
            LKR {formatCurrency(invoiceData.totalAmountIncludingVat)}
          </span>
        </div>
      </div>

      {/* Tax Breakdown Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 text-center">
        <div className="bg-slate-800/60 p-2 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total Excl. VAT</span>
          <span className="font-mono text-sm font-bold text-slate-200">
            Rs. {formatCurrency(invoiceData.totalAmountExclVat)}
          </span>
        </div>

        <div className="bg-slate-800/60 p-2 rounded-xl border border-brand-500/20">
          <span className="text-[11px] text-brand-300 block font-semibold">Total VAT @ 18%</span>
          <span className="font-mono text-sm font-bold text-brand-300">
            Rs. {formatCurrency(invoiceData.totalVatAmount)}
          </span>
        </div>

        <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30">
          <span className="text-[11px] text-emerald-400 block font-semibold">Grand Total</span>
          <span className="font-mono text-sm font-extrabold text-emerald-400">
            Rs. {formatCurrency(invoiceData.totalAmountIncludingVat)}
          </span>
        </div>
      </div>
    </div>
  );
};
