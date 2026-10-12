import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceData } from '../types/invoice';

export async function createInvoicePDF(elementId: string): Promise<jsPDF> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Create a temporary off-screen container with fixed A4 pixel dimensions (794px x 1123px at 96 DPI)
  // This guarantees that regardless of mobile screen width, the PDF is rendered at exact 100% desktop scale!
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '794px';
  container.style.minHeight = '1123px';
  container.style.backgroundColor = '#ffffff';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = '794px';
  clone.style.minHeight = '1123px';
  clone.style.maxWidth = 'none';
  clone.style.margin = '0';
  clone.style.padding = '32px';
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = '#ffffff';
  clone.style.color = '#000000';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.opacity = '1';
  clone.classList.remove('hidden');
  
  // Remove dark mode classes from clone to ensure crisp light PDF
  clone.classList.remove('dark');
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    el.classList.remove('dark');
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(clone, {
      scale: 3, // High 300 DPI retina clarity
      useCORS: true,
      logging: false,
      width: 794,
      height: clone.offsetHeight || 1123,
      windowWidth: 794,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    return pdf;
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportInvoiceToPDF(elementId: string, filename: string): Promise<void> {
  const pdf = await createInvoicePDF(elementId);
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export async function generateInvoicePDFBlob(elementId: string): Promise<Blob> {
  const pdf = await createInvoicePDF(elementId);
  return pdf.output('blob');
}

export function formatInvoiceShareText(invoice: InvoiceData, supplierName: string): string {
  const itemsText = (invoice.items || [])
    .map(
      (it) =>
        `• ${it.fuelName}: ${it.quantityLitres.toFixed(2)}L @ Rs. ${it.unitPrice.toFixed(2)} = Rs. ${it.amountIncludingVat.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    )
    .join('\n');

  return `*TAX INVOICE*
*Station:* ${supplierName || 'PLC ALWIS ENTERPRICES'}
*Invoice No:* ${invoice.taxInvoiceNumber}
*Date:* ${invoice.invoiceDate}
*Purchaser:* ${invoice.purchaserName || 'Cash Customer'}
${invoice.purchaserTin ? `*TIN:* ${invoice.purchaserTin}\n` : ''}${invoice.purchaserPhone ? `*Tel:* ${invoice.purchaserPhone}\n` : ''}
*Items:*
${itemsText || '• Fuel Items'}

*Total Excl. VAT:* Rs. ${invoice.totalAmountExclVat.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
*18% VAT:* Rs. ${invoice.totalVatAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
*Grand Total:* Rs. ${invoice.totalAmountIncludingVat.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
*Payment Mode:* ${invoice.paymentMode}

_Sri Lanka IRD VAT Compliant Tax Invoice_`;
}

/**
 * Share PDF file directly to WhatsApp:
 * 1. Generates PDF file
 * 2. On Mobile (Android/iOS) and supporting browsers, invokes native Web Share API with files: [pdfFile] so WhatsApp receives the actual PDF document attachment!
 * 3. On Desktop WhatsApp Web (which cannot receive files via URL protocol), downloads the PDF automatically and opens WhatsApp Web to the customer's chat.
 */
export async function shareInvoicePDFToWhatsApp(
  elementId: string,
  invoice: InvoiceData,
  supplierName: string
): Promise<{ success: boolean; mode: 'native_pdf' | 'download_and_whatsapp' }> {
  const filename = `Tax_Invoice_${invoice.taxInvoiceNumber}.pdf`;

  // 1. Generate the PDF
  const blob = await generateInvoicePDFBlob(elementId);
  const file = new File([blob], filename, {
    type: 'application/pdf',
    lastModified: Date.now()
  });

  // 2. Check if device supports Web Share API with files (Mobile devices / modern browsers)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `Tax Invoice - ${invoice.taxInvoiceNumber}`,
        text: `Tax Invoice ${invoice.taxInvoiceNumber} from ${supplierName || 'PLC ALWIS ENTERPRICES'}`
      });
      return { success: true, mode: 'native_pdf' };
    } catch (e: any) {
      if (e && e.name === 'AbortError') {
        return { success: true, mode: 'native_pdf' }; // User dismissed share dialog
      }
      console.warn('Native file share failed, falling back:', e);
    }
  }

  // 3. Desktop fallback:
  // Desktop WhatsApp Web does not accept local file attachments via URL schemes.
  // We automatically download the PDF file and open WhatsApp Web with customer's chat.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  let cleanPhone = (invoice.purchaserPhone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.slice(1);
  }

  const shareText = `*TAX INVOICE ${invoice.taxInvoiceNumber}*\nStation: ${supplierName || 'PLC ALWIS ENTERPRICES'}\nCustomer: ${invoice.purchaserName || 'Cash Customer'}\nTotal: Rs. ${invoice.totalAmountIncludingVat.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n(📄 PDF invoice downloaded to device - attach here to send)`;
  const encodedText = encodeURIComponent(shareText);

  let waUrl: string;
  if (cleanPhone.length >= 9) {
    waUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  } else {
    waUrl = `https://web.whatsapp.com/send?text=${encodedText}`;
  }

  window.open(waUrl, '_blank');
  return { success: true, mode: 'download_and_whatsapp' };
}

export async function shareInvoicePDF(
  elementId: string,
  invoice: InvoiceData,
  supplierName: string
): Promise<boolean> {
  const filename = `Tax_Invoice_${invoice.taxInvoiceNumber}.pdf`;
  const shareText = `Tax Invoice ${invoice.taxInvoiceNumber} - ${supplierName || 'PLC ALWIS ENTERPRICES'}`;

  if (navigator.share) {
    try {
      const blob = await generateInvoicePDFBlob(elementId);
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Tax Invoice ${invoice.taxInvoiceNumber}`,
          text: shareText,
          files: [file]
        });
        return true;
      } else {
        await navigator.share({
          title: `Tax Invoice ${invoice.taxInvoiceNumber}`,
          text: shareText
        });
        return true;
      }
    } catch (e: any) {
      if (e && e.name === 'AbortError') {
        return true;
      }
      console.warn('Native Web Share failed:', e);
    }
  }

  // Fallback
  await shareInvoicePDFToWhatsApp(elementId, invoice, supplierName);
  return true;
}

export function printInvoice(): void {
  window.print();
}
