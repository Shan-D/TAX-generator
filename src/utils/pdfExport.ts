import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportInvoiceToPDF(elementId: string, filename: string): Promise<void> {
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
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

export function printInvoice(): void {
  window.print();
}
