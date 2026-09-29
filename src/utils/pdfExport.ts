import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportInvoiceToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Clone element or temporarily optimize styles for standard A4
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution output
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  });

  const imgData = canvas.toDataURL('image/png');
  
  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Calculate scaled height based on image aspect ratio
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

export function printInvoice(): void {
  window.print();
}
