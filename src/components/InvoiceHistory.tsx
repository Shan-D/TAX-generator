import React, { useState } from 'react';
import { Search, Download, Trash2, FileText, Fuel } from 'lucide-react';
import { InvoiceRecord, StationProfile } from '../types/invoice';
import { exportInvoiceToPDF } from '../utils/pdfExport';
import { formatCurrency } from '../utils/vatCalculator';
import { InvoiceDocument } from './InvoiceDocument';

interface InvoiceHistoryProps {
  invoices: InvoiceRecord[];
  supplierProfile: StationProfile;
  onDeleteInvoice: (id: string) => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  supplierProfile,
  onDeleteInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    return (
      inv.taxInvoiceNumber.toLowerCase().includes(term) ||
      inv.purchaserName.toLowerCase().includes(term) ||
      inv.purchaserTin.toLowerCase().includes(term) ||
      inv.vehicleNumber.toLowerCase().includes(term) ||
      inv.fuelName.toLowerCase().includes(term)
    );
  });

  const handleDownloadSingle = async (inv: InvoiceRecord) => {
    setSelectedInvoice(inv);
    setTimeout(async () => {
      try {
        await exportInvoiceToPDF(
          `history-doc-${inv.id}`,
          `Tax_Invoice_${inv.taxInvoiceNumber}.pdf`
        );
      } catch (e) {
        console.error('Download error:', e);
      }
    }, 100);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Search Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Saved Tax Invoices</h2>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full font-bold">
            {invoices.length} Saved
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Invoice #, Purchaser Name, TIN, or Vehicle #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Saved Invoices Found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm ? 'Try a different search query' : 'Create and save your first VAT Tax Invoice!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-700 dark:text-brand-400 text-sm">
                      {inv.taxInvoiceNumber}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono">
                      {inv.invoiceDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {inv.purchaserName || 'Cash Customer'}
                  </h4>
                  {inv.purchaserTin && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">TIN: {inv.purchaserTin}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white block">
                    Rs. {formatCurrency(inv.amountIncludingVat)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    VAT: Rs. {formatCurrency(inv.vatAmount)}
                  </span>
                </div>
              </div>

              {/* Fuel & Logistics info */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <Fuel className="w-3.5 h-3.5 text-brand-500" />
                  <span>{inv.fuelName} ({inv.quantityLitres.toFixed(2)} L)</span>
                </div>

                {inv.vehicleNumber && (
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-700 dark:text-slate-300">
                    {inv.vehicleNumber}
                  </span>
                )}
              </div>

              {/* Card Action Bar - Save / Download PDF & Delete */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleDownloadSingle(inv)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete invoice ${inv.taxInvoiceNumber}?`)) {
                      onDeleteInvoice(inv.id);
                    }
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden element for single record download */}
              {selectedInvoice && selectedInvoice.id === inv.id && (
                <div className="hidden">
                  <InvoiceDocument
                    id={`history-doc-${inv.id}`}
                    invoice={inv}
                    supplierProfile={supplierProfile}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
