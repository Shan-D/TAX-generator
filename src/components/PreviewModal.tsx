import React, { useState } from 'react';
import { X, Download, Eye, MessageCircle, Share2, CheckCircle2 } from 'lucide-react';
import { InvoiceData, StationProfile } from '../types/invoice';
import { InvoiceDocument } from './InvoiceDocument';
import { exportInvoiceToPDF, shareInvoicePDFToWhatsApp, shareInvoicePDF } from '../utils/pdfExport';

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
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);
  const [desktopNotice, setDesktopNotice] = useState<string | null>(null);

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

  const handleShareWhatsApp = async () => {
    setIsSharingWhatsApp(true);
    setDesktopNotice(null);
    try {
      const res = await shareInvoicePDFToWhatsApp(
        'a4-tax-invoice-document',
        invoice,
        supplierProfile.supplierName
      );
      if (res.mode === 'download_and_whatsapp') {
        setDesktopNotice('PDF document downloaded! Drag or attach it into WhatsApp Web.');
        setTimeout(() => setDesktopNotice(null), 6000);
      }
    } catch (e) {
      console.error('WhatsApp share error:', e);
      alert('Could not share PDF to WhatsApp.');
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleNativeShare = async () => {
    setIsSharingNative(true);
    try {
      await shareInvoicePDF('a4-tax-invoice-document', invoice, supplierProfile.supplierName);
    } catch (e) {
      console.error('Share error:', e);
    } finally {
      setIsSharingNative(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 text-white shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-5 h-5 text-brand-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-base truncate">Standard A4 Tax Invoice Preview</h2>
              <span className="text-[10px] sm:text-xs text-slate-400 font-mono truncate block">{invoice.taxInvoiceNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* WhatsApp (PDF) Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              disabled={isSharingWhatsApp}
              className="px-2.5 sm:px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Send PDF document to WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isSharingWhatsApp ? 'Preparing PDF...' : 'WhatsApp (PDF)'}</span>
            </button>

            {/* Native Share Button */}
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={isSharingNative}
              className="px-2.5 sm:px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95"
              title="Share PDF via device apps"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSharingNative ? 'Sharing...' : 'Share PDF'}</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-2.5 sm:px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 active:scale-95"
              title="Download A4 PDF document"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{isDownloading ? 'Compiling...' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-0.5"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop notification banner if opened on desktop */}
        {desktopNotice && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{desktopNotice}</span>
            </div>
            <button
              onClick={() => setDesktopNotice(null)}
              className="text-white hover:text-emerald-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Document Container */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/80 dark:bg-slate-950">
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
