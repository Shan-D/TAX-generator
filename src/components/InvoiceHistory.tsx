import React, { useState } from 'react';
import { Search, Download, Trash2, FileText, Fuel, Phone, Eye } from 'lucide-react';
import { InvoiceRecord, StationProfile } from '../types/invoice';
import { exportInvoiceToPDF } from '../utils/pdfExport';
import { formatCurrency } from '../utils/vatCalculator';
import { InvoiceDocument } from './InvoiceDocument';
import { PreviewModal } from './PreviewModal';

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
  const [activeDocInvoice, setActiveDocInvoice] = useState<InvoiceRecord | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const itemMatch = (inv.items || []).some(
      (it) => it.fuelName && it.fuelName.toLowerCase().includes(term)
    );
    return (
      inv.taxInvoiceNumber.toLowerCase().includes(term) ||
      inv.purchaserName.toLowerCase().includes(term) ||
      (inv.purchaserTin && inv.purchaserTin.toLowerCase().includes(term)) ||
      (inv.purchaserPhone && inv.purchaserPhone.toLowerCase().includes(term)) ||
      (inv.additionalInfo && inv.additionalInfo.toLowerCase().includes(term)) ||
      itemMatch
    );
  });

  const handleDownloadSingle = async (inv: InvoiceRecord) => {
    setActiveDocInvoice(inv);
    setDownloadingId(inv.id);
    setTimeout(async () => {
      try {
        await exportInvoiceToPDF(
          `history-doc-${inv.id}`,
          `Tax_Invoice_${inv.taxInvoiceNumber}.pdf`
        );
      } catch (e) {
        console.error('Download error:', e);
        alert('Failed to generate PDF for download.');
      } finally {
        setDownloadingId(null);
      }
    }, 150);
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
            placeholder="Search by Invoice #, Purchaser Name, TIN, or Phone..."
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
          {filtered.map((inv) => {
            const grandTotal = inv.totalAmountIncludingVat || 0;
            const vatTotal = inv.totalVatAmount || 0;
            const itemsList = inv.items && inv.items.length > 0 ? inv.items : [];

            return (
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {inv.purchaserTin && <span>TIN: {inv.purchaserTin}</span>}
                      {inv.purchaserPhone && (
                        <span className="flex items-center gap-0.5 text-slate-600 dark:text-slate-300">
                          <Phone className="w-3 h-3" /> {inv.purchaserPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-base text-slate-900 dark:text-white block">
                      Rs. {formatCurrency(grandTotal)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      VAT: Rs. {formatCurrency(vatTotal)}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <Fuel className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span className="truncate">
                      {itemsList.length > 0
                        ? itemsList.map((it) => `${it.fuelName} (${it.quantityLitres.toFixed(2)}L)`).join(', ')
                        : 'Fuel Item'}
                    </span>
                  </div>

                  {inv.additionalInfo && (
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {inv.additionalInfo}
                    </span>
                  )}
                </div>

                {/* Card Action Bar - Preview, Download PDF & Delete */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* 1. Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewInvoice(inv)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                    title="View and preview invoice document"
                  >
                    <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Preview</span>
                  </button>

                  {/* 2. Download PDF Button */}
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(inv)}
                    disabled={downloadingId === inv.id}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 active:scale-95"
                    title="Download A4 PDF document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{downloadingId === inv.id ? 'Saving...' : 'Download PDF'}</span>
                  </button>

                  {/* 3. Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete invoice ${inv.taxInvoiceNumber}?`)) {
                        onDeleteInvoice(inv.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ml-0.5"
                    title="Delete invoice record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Off-screen rendered document for HTML2Canvas & jsPDF compilation */}
      {activeDocInvoice && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: 0,
            width: '794px',
            minHeight: '1123px',
            pointerEvents: 'none',
            opacity: 0,
            zIndex: -100
          }}
        >
          <InvoiceDocument
            id={`history-doc-${activeDocInvoice.id}`}
            invoice={activeDocInvoice}
            supplierProfile={supplierProfile}
          />
        </div>
      )}

      {/* Invoice Document Preview Modal */}
      {previewInvoice && (
        <PreviewModal
          isOpen={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          invoice={previewInvoice}
          supplierProfile={supplierProfile}
        />
      )}
    </div>
  );
};
