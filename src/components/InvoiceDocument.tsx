import React from 'react';
import { InvoiceData } from '../types/invoice';
import { formatCurrency } from '../utils/vatCalculator';
import { StationProfile } from '../types/invoice';

interface InvoiceDocumentProps {
  invoice: InvoiceData;
  supplierProfile: StationProfile;
  id?: string;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  supplierProfile,
  id = 'a4-tax-invoice-document'
}) => {
  return (
    <div
      id={id}
      className="bg-white text-slate-900 mx-auto p-8 font-sans border border-slate-300 shadow-md w-full max-w-[210mm] min-h-[297mm] flex flex-col justify-between print:shadow-none print:border-none print:m-0 print:p-6 print:w-full print:max-w-none text-xs leading-normal select-none"
      style={{ boxSizing: 'border-box' }}
    >
      <div>
        {/* Top Header Box Title */}
        <div className="flex justify-center mb-4">
          <div className="border-2 border-slate-900 px-8 py-1.5 text-center bg-slate-50">
            <h1 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
              Tax Invoice
            </h1>
          </div>
        </div>

        {/* Row 1: Invoice Date & Invoice Number */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border border-slate-900 p-2 font-medium">
            <span className="font-bold text-slate-900">Date of Invoice:</span>{' '}
            <span className="font-mono text-slate-900">{invoice.invoiceDate}</span>
          </div>
          <div className="border border-slate-900 p-2 font-medium">
            <span className="font-bold text-slate-900">Tax Invoice No.:</span>{' '}
            <span className="font-mono font-bold text-slate-900">{invoice.taxInvoiceNumber}</span>
          </div>
        </div>

        {/* Row 2: Supplier vs Purchaser Boxes */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Supplier Box */}
          <div className="border border-slate-900 p-3 space-y-1">
            <div>
              <span className="font-bold text-slate-900">Supplier's TIN:</span>{' '}
              <span className="font-mono font-bold text-slate-900">{supplierProfile.supplierTin || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Supplier's Name:</span>{' '}
              <span className="font-semibold text-slate-900">{supplierProfile.supplierName}</span>
            </div>
            <div className="align-top">
              <span className="font-bold text-slate-900">Address:</span>{' '}
              <span className="text-slate-800">{supplierProfile.supplierAddress}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Telephone No:</span>{' '}
              <span className="text-slate-800">{supplierProfile.supplierPhone}</span>
            </div>
          </div>

          {/* Purchaser Box */}
          <div className="border border-slate-900 p-3 space-y-1">
            <div>
              <span className="font-bold text-slate-900">Purchaser's TIN:</span>{' '}
              <span className="font-mono font-bold text-slate-900">{invoice.purchaserTin || 'Unregistered'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Purchaser's Name:</span>{' '}
              <span className="font-semibold text-slate-900">{invoice.purchaserName || 'Cash Customer'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Address:</span>{' '}
              <span className="text-slate-800">{invoice.purchaserAddress || 'N/A'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">Telephone No:</span>{' '}
              <span className="text-slate-800">{invoice.purchaserPhone || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Row 3: Delivery Date & Place of Supply */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="border border-slate-900 p-2">
            <span className="font-bold text-slate-900">Date of Delivery:</span>{' '}
            <span className="font-mono">{invoice.dateOfSupply || invoice.invoiceDate}</span>
          </div>
          <div className="border border-slate-900 p-2">
            <span className="font-bold text-slate-900">Place of Supply:</span>{' '}
            <span className="font-semibold">{invoice.placeOfSupply || supplierProfile.defaultPlaceOfSupply}</span>
          </div>
        </div>

        {/* Row 4: Additional Information */}
        <div className="border border-slate-900 p-2 mb-4">
          <span className="font-bold text-slate-900">Additional Information if any:</span>{' '}
          <span className="font-medium text-slate-800">
            {[
              invoice.vehicleNumber ? `Vehicle No: ${invoice.vehicleNumber}` : null,
              invoice.orderNumber ? `PO Ref: ${invoice.orderNumber}` : null,
              invoice.additionalInfo ? invoice.additionalInfo : null
            ]
              .filter(Boolean)
              .join(' | ') || 'None'}
          </span>
        </div>

        {/* Main Itemized Table (Fixed IRD Layout) */}
        <div className="border border-slate-900 mb-4 overflow-hidden">
          <table className="w-full text-left border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="border-b border-slate-900 bg-slate-100 font-bold text-slate-900 text-[11px]">
                <th className="p-2 border-r border-slate-900 text-center" style={{ width: '12%' }}>
                  Reference
                </th>
                <th className="p-2 border-r border-slate-900" style={{ width: '42%' }}>
                  Description of Goods or Services
                </th>
                <th className="p-2 border-r border-slate-900 text-right" style={{ width: '14%' }}>
                  Quantity
                </th>
                <th className="p-2 border-r border-slate-900 text-right" style={{ width: '14%' }}>
                  Unit Price
                </th>
                <th className="p-2 text-right" style={{ width: '18%' }}>
                  Amount Excluding VAT <br />
                  <span className="text-[9px] font-normal">(Rs.)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Item Row 1 */}
              <tr className="border-b border-slate-900 align-top">
                <td className="p-2 border-r border-slate-900 text-center font-mono font-bold">1</td>
                <td className="p-2 border-r border-slate-900 font-medium">
                  <div className="font-bold text-slate-900">{invoice.fuelName}</div>
                  <div className="text-[10px] text-slate-500">Fuel Supply (VAT 18% Included in Pump Price)</div>
                </td>
                <td className="p-2 border-r border-slate-900 text-right font-mono font-semibold">
                  {invoice.quantityLitres.toFixed(2)} L
                </td>
                <td className="p-2 border-r border-slate-900 text-right font-mono">
                  {formatCurrency(invoice.unitPrice)}
                </td>
                <td className="p-2 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(invoice.amountExclVat)}
                </td>
              </tr>

              {/* Blank filler rows for standard height formatting */}
              <tr className="border-b border-slate-300">
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3"></td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3 border-r border-slate-900"></td>
                <td className="p-3"></td>
              </tr>

              {/* Summary Row 1: Total Value of Supply */}
              <tr className="border-b border-slate-900 font-bold">
                <td colSpan={4} className="p-2 border-r border-slate-900 text-right text-slate-900">
                  Total Value of Supply:
                </td>
                <td className="p-2 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(invoice.amountExclVat)}
                </td>
              </tr>

              {/* Summary Row 2: VAT Amount @ 18% */}
              <tr className="border-b border-slate-900 font-bold bg-slate-50">
                <td colSpan={4} className="p-2 border-r border-slate-900 text-right text-slate-900">
                  VAT Amount (Total Value of Supply @ 18%):
                </td>
                <td className="p-2 text-right font-mono font-bold text-slate-900">
                  {formatCurrency(invoice.vatAmount)}
                </td>
              </tr>

              {/* Summary Row 3: Total Amount including VAT */}
              <tr className="font-extrabold bg-slate-100 text-slate-900">
                <td colSpan={4} className="p-2.5 border-r border-slate-900 text-right text-sm">
                  Total Amount including VAT:
                </td>
                <td className="p-2.5 text-right font-mono text-base text-slate-900">
                  {formatCurrency(invoice.amountIncludingVat)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Row 5: Total Amount in words */}
        <div className="border border-slate-900 p-2.5 mb-3 bg-slate-50">
          <span className="font-bold text-slate-900">Total Amount in words:</span>{' '}
          <span className="font-semibold italic text-slate-900">{invoice.amountInWords}</span>
        </div>

        {/* Row 6: Mode of Payment */}
        <div className="border border-slate-900 p-2.5 mb-6">
          <span className="font-bold text-slate-900">Mode of Payment:</span>{' '}
          <span className="font-bold text-slate-900">{invoice.paymentMode || 'Cash'}</span>
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-4 border-t border-slate-300">
        <div className="flex justify-between items-end mb-4">
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <p className="font-semibold text-slate-700">Official Inland Revenue Department Compliant Tax Invoice</p>
            <p>This is a computer-generated tax invoice. No signature required if verified.</p>
            <p>Generated on: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()}</p>
          </div>

          <div className="text-center w-48">
            <div className="border-b border-slate-900 mb-1 h-10"></div>
            <p className="font-bold text-[11px] text-slate-900">Authorized Signature & Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
