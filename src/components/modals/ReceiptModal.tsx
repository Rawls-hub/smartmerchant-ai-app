import React from 'react';
import {
  X,
  Printer,
  PhoneCall,
  CheckCircle2,
  Store,
  ShieldCheck,
  Download,
  Share2,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, settings } = useMerchant();

  if (!activeReceipt) return null;

  const cleanPhone = (activeReceipt.customerPhone || '').replace(/[^0-9]/g, '');
  const paid = activeReceipt.amountPaid !== undefined ? activeReceipt.amountPaid : (activeReceipt.paymentMethod === 'credit' ? 0 : activeReceipt.totalAmount);
  const balance = activeReceipt.outstandingBalance !== undefined ? activeReceipt.outstandingBalance : Math.max(0, activeReceipt.totalAmount - paid);
  const statusLabel = balance === 0 ? 'PAID IN FULL' : paid === 0 ? 'UNPAID (CREDIT)' : 'PARTIALLY PAID';

  const itemsList = activeReceipt.items
    .map((i) => `• ${i.quantity}x ${i.productName} = ${formatNaira(i.total)}`)
    .join('\n');

  const receiptMessage = encodeURIComponent(
    `🧾 *OFFICIAL SALES RECEIPT*\n*${settings.storeName.toUpperCase()}*\n${settings.address}\nTel: ${settings.phone}\n\n` +
    `Receipt No: *${activeReceipt.receiptNo}*\n` +
    `Date: ${new Date(activeReceipt.timestamp).toLocaleString('en-NG')}\n` +
    `Customer: ${activeReceipt.customerName}\n` +
    `Payment Status: *${statusLabel}*\n` +
    `Channel: ${activeReceipt.paymentMethod.toUpperCase()}\n\n` +
    `*ITEMS PURCHASED:*\n${itemsList}\n\n` +
    (activeReceipt.discount > 0 ? `Discount: -${formatNaira(activeReceipt.discount)}\n` : '') +
    `*TOTAL BILL: ${formatNaira(activeReceipt.totalAmount)}*\n` +
    `*AMOUNT PAID: ${formatNaira(paid)}*\n` +
    (balance > 0 ? `*OUTSTANDING BALANCE: ${formatNaira(balance)}*\n\n` : '\n') +
    `_Thank you for your valued patronage! Goods sold in good condition cannot be returned after 48 hours._`
  );

  const whatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${receiptMessage}`
    : `https://wa.me/?text=${receiptMessage}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0B1124] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Verified Transaction Receipt
          </span>
          <button
            onClick={() => setActiveReceipt(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Digital Paper Receipt Container */}
        <div id="printable-receipt" className="mt-4 rounded-xl border border-slate-700/80 bg-white text-slate-900 p-5 shadow-lg">
          {/* Store Branding */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-base font-extrabold tracking-tight text-slate-950">
              {settings.storeName.toUpperCase()}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              {settings.address}
            </p>
            <p className="text-[11px] text-slate-600">
              Tel: {settings.phone} • {settings.city}
            </p>
          </div>

          {/* Receipt Info */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt No:</span>
              <span className="font-bold font-mono text-slate-900">{activeReceipt.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{new Date(activeReceipt.timestamp).toLocaleString('en-NG')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-900">{activeReceipt.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Channel:</span>
              <span className="font-semibold uppercase text-blue-700">
                {activeReceipt.paymentMethod.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status:</span>
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  balance === 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : paid === 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 font-semibold border-b border-slate-200">
                  <th className="text-left pb-1">Item</th>
                  <th className="text-center pb-1">Qty</th>
                  <th className="text-right pb-1">Total (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeReceipt.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 pr-1 font-medium text-slate-800">{item.productName}</td>
                    <td className="py-1 text-center font-mono text-slate-600">{item.quantity}</td>
                    <td className="py-1 text-right font-bold font-mono text-slate-900">
                      {formatNaira(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-2.5 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono">{formatNaira(activeReceipt.subtotal)}</span>
            </div>
            {activeReceipt.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">-{formatNaira(activeReceipt.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-300 text-sm font-extrabold text-slate-950">
              <span>GRAND TOTAL:</span>
              <span className="text-base font-mono">{formatNaira(activeReceipt.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-emerald-800">
              <span>AMOUNT PAID:</span>
              <span className="font-mono">{formatNaira(paid)}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between items-center text-xs font-bold text-rose-700 pt-1 border-t border-dashed border-slate-200">
                <span>OUTSTANDING BALANCE:</span>
                <span className="font-mono">{formatNaira(balance)}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Thank You For Your Patronage!
            </p>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Powered by SmartMerchant AI Fintech Engine
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-colors"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Send to WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
          >
            <Printer className="h-4 w-4 text-cyan-400" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
