import React, { useState } from 'react';
import { X, Download, Eye } from 'lucide-react';
import { InvoiceData, StationProfile } from '../types/invoice';
import { InvoiceDocument } from './InvoiceDocument';
import { exportInvoiceToPDF } from '../utils/pdfExport';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  supplierProfile: StationProfile;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  supplierProfile
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await exportInvoiceToPDF(
        'a4-tax-invoice-document',
        `Tax_Invoice_${invoice.taxInvoiceNumber}.pdf`
      );
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Failed to compile PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-400" />
            <h2 className="font-bold text-sm sm:text-base">Standard A4 Tax Invoice Preview</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Compiling...' : 'Download A4 PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/80 dark:bg-slate-950">
          <InvoiceDocument
            id="a4-tax-invoice-document"
            invoice={invoice}
            supplierProfile={supplierProfile}
          />
        </div>
      </div>
    </div>
  );
};
