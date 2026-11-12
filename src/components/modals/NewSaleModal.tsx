import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Zap,
  ShoppingBag,
  CreditCard,
  Building,
  Smartphone,
  Banknote,
  Receipt,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';
import { PaymentMethod, SaleItem, Product, PaymentStatus } from '../../types';

export const NewSaleModal: React.FC = () => {
  const {
    isNewSaleOpen,
    setIsNewSaleOpen,
    products,
    recordSale,
    setActiveReceipt,
  } = useMerchant();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('moniepoint');
  const [paymentStatusOption, setPaymentStatusOption] = useState<PaymentStatus>('paid');
  const [customAmountPaid, setCustomAmountPaid] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cart items state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Initialize or reset cart items when modal opens
  useEffect(() => {
    if (isNewSaleOpen) {
      const firstAvailable = products.find((p) => p.stock > 0) || products[0];
      if (firstAvailable) {
        setCartItems([
          {
            productId: firstAvailable.id,
            productName: firstAvailable.name,
            quantity: firstAvailable.stock > 0 ? 1 : 0,
            unitPrice: firstAvailable.sellingPrice,
            total: firstAvailable.sellingPrice * (firstAvailable.stock > 0 ? 1 : 0),
          },
        ]);
      }
      setPaymentStatusOption('paid');
      setCustomAmountPaid('');
      setErrorMessage(null);
    }
  }, [isNewSaleOpen, products]);

  if (!isNewSaleOpen) return null;

  const handleProductChange = (index: number, productId: string) => {
    const selected = products.find((p) => p.id === productId);
    if (!selected) return;

    setCartItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          // Default to 1 if available, otherwise 0
          const initialQty = selected.stock > 0 ? 1 : 0;
          return {
            ...item,
            productId: selected.id,
            productName: selected.name,
            quantity: initialQty,
            unitPrice: selected.sellingPrice,
            total: selected.sellingPrice * initialQty,
          };
        }
        return item;
      })
    );
    setErrorMessage(null);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const safeQty = Math.max(1, qty);
    setCartItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            quantity: safeQty,
            total: item.unitPrice * safeQty,
          };
        }
        return item;
      })
    );
    setErrorMessage(null);
  };

  const handleUnitPriceChange = (index: number, price: number) => {
    const safePrice = Math.max(0, price);
    setCartItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return {
            ...item,
            unitPrice: safePrice,
            total: safePrice * item.quantity,
          };
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    // Find an in-stock product not already in cart, or first available
    const existingIds = new Set(cartItems.map((c) => c.productId));
    const nextProd =
      products.find((p) => !existingIds.has(p.id) && p.stock > 0) ||
      products.find((p) => p.stock > 0) ||
      products[0];

    if (!nextProd) return;

    const initialQty = nextProd.stock > 0 ? 1 : 0;
    setCartItems((prev) => [
      ...prev,
      {
        productId: nextProd.id,
        productName: nextProd.name,
        quantity: initialQty,
        unitPrice: nextProd.sellingPrice,
        total: nextProd.sellingPrice * initialQty,
      },
    ]);
    setErrorMessage(null);
  };

  const handleRemoveItem = (index: number) => {
    if (cartItems.length <= 1) return;
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
    setErrorMessage(null);
  };

  // Cart Stock Validation
  const stockValidation = (() => {
    if (cartItems.length === 0) {
      return { valid: false, error: 'Please add at least one product to the sale.' };
    }

    // Tally total quantities for each product across all cart items
    const productTotals: Record<string, number> = {};
    for (const item of cartItems) {
      productTotals[item.productId] = (productTotals[item.productId] || 0) + item.quantity;
    }

    for (const item of cartItems) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { valid: false, error: 'One or more items in the cart are invalid.' };
      }
      if (prod.stock <= 0) {
        return {
          valid: false,
          error: `"${prod.name}" is completely Out of Stock (0 available).`,
        };
      }
      if (item.quantity <= 0) {
        return {
          valid: false,
          error: `Please enter a quantity of at least 1 for "${prod.name}".`,
        };
      }
      const totalRequested = productTotals[item.productId];
      if (totalRequested > prod.stock) {
        return {
          valid: false,
          error: `Cannot complete sale: Requested quantity (${totalRequested}) for "${prod.name}" exceeds available stock (${prod.stock} ${prod.unit} in stock).`,
        };
      }
    }

    return { valid: true, error: null };
  })();

  const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const effectiveAmountPaid = (() => {
    if (paymentStatusOption === 'paid') return grandTotal;
    if (paymentStatusOption === 'unpaid') return 0;
    const parsed = parseFloat(customAmountPaid) || 0;
    return Math.min(grandTotal, Math.max(0, parsed));
  })();

  const effectiveOutstanding = Math.max(0, grandTotal - effectiveAmountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockValidation.valid) {
      setErrorMessage(stockValidation.error);
      return;
    }

    // Call recordSale - this will atomically deduct inventory stock and record the sale
    const sale = recordSale({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: cartItems,
      subtotal,
      discount,
      totalAmount: grandTotal,
      amountPaid: effectiveAmountPaid,
      paymentMethod,
      paymentStatus: paymentStatusOption,
      status: paymentStatusOption === 'paid' ? 'paid' : 'partial',
      notes,
    });

    if (!sale) {
      setErrorMessage('Sale could not be processed due to stock availability.');
      return;
    }

    // Close modal on success
    setIsNewSaleOpen(false);

    // Reset form fields
    setCustomerName('');
    setCustomerPhone('');
    setPaymentStatusOption('paid');
    setCustomAmountPaid('');
    setDiscount(0);
    setNotes('');
    setErrorMessage(null);

    // Open receipt modal right after!
    setActiveReceipt(sale);
  };

  const handleClose = () => {
    // Cancelling or closing without submitting does NOT deduct any stock
    setIsNewSaleOpen(false);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0B1124] p-5 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Fast Sale (POS)</h3>
              <p className="text-xs text-slate-400">
                Instantly deduct inventory, generate receipts, and log payment in Naira (₦).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Customer details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Babatunde Fashola or Walk-in"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Customer WhatsApp / Phone (For Receipt)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. +234 802 000 0000"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Sale Items ({cartItems.length})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Another Item
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const isItemOverStock = prod ? item.quantity > prod.stock : false;
                const isOutOfStock = prod ? prod.stock <= 0 : false;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                      isItemOverStock || isOutOfStock
                        ? 'border-rose-500/50 bg-rose-500/5'
                        : 'border-slate-800/80 bg-[#070B16]'
                    }`}
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-[#0A0F22] px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                            {p.name} {p.stock <= 0 ? '[OUT OF STOCK]' : `(${p.stock} in stock)`} - {formatNaira(p.sellingPrice)}
                          </option>
                        ))}
                      </select>
                      {/* Product stock availability info badge */}
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          Available:{' '}
                          <strong
                            className={
                              isOutOfStock
                                ? 'text-rose-400'
                                : prod && prod.stock <= 3
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {prod ? `${prod.stock} ${prod.unit}` : '0'}
                          </strong>
                        </span>

                        {isItemOverStock && (
                          <span className="font-semibold text-rose-400">
                            Exceeds stock by {prod ? item.quantity - prod.stock : 0}!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max={prod ? prod.stock : undefined}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, parseInt(e.target.value, 10) || 1)
                          }
                          className={`w-16 rounded-lg border px-2 py-1.5 text-xs text-center font-bold mono-num focus:outline-none ${
                            isItemOverStock || isOutOfStock
                              ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                              : 'border-slate-800 bg-[#0A0F22] text-white focus:border-blue-500'
                          }`}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">₦:</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUnitPriceChange(idx, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 rounded-lg border border-slate-800 bg-[#0A0F22] px-2 py-1.5 text-xs text-white text-right mono-num focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      <div className="w-24 text-right font-bold text-white mono-num text-xs">
                        {formatNaira(item.total)}
                      </div>

                      <button
                        type="button"
                        disabled={cartItems.length <= 1}
                        onClick={() => handleRemoveItem(idx)}
                        className="rounded-lg p-1 text-slate-400 hover:text-rose-400 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Error Banner */}
          {(!stockValidation.valid || errorMessage) && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Inventory Warning:</strong> {errorMessage || stockValidation.error}
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'moniepoint', label: 'Moniepoint', icon: CreditCard },
                { id: 'opay', label: 'OPay', icon: Smartphone },
                { id: 'palmpay', label: 'PalmPay', icon: Smartphone },
                { id: 'bank_transfer', label: 'Bank Trf', icon: Building },
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'credit', label: 'Credit (Debt)', icon: ShoppingBag },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                      isSelected
                        ? m.id === 'credit'
                          ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                          : 'border-blue-500 bg-blue-500/20 text-cyan-300 shadow-sm shadow-blue-500/20'
                        : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
            {paymentMethod === 'credit' && (
              <p className="mt-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
                ⚠️ This sale will automatically be added to your <strong>Debtor Book</strong> for tracking & automated WhatsApp reminders.
              </p>
            )}
          </div>

          {/* Payment Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentStatusOption('paid');
                  if (paymentMethod === 'credit') setPaymentMethod('moniepoint');
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                  paymentStatusOption === 'paid'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/20'
                    : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-4 w-4 mb-1 text-emerald-400" />
                <span>Paid in Full</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentStatusOption('partial');
                  if (paymentMethod === 'credit') setPaymentMethod('moniepoint');
                  if (!customAmountPaid) {
                    setCustomAmountPaid(Math.round(grandTotal * 0.5).toString());
                  }
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                  paymentStatusOption === 'partial'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-500/20'
                    : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <CreditCard className="h-4 w-4 mb-1 text-amber-400" />
                <span>Partially Paid</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentStatusOption('unpaid');
                  setPaymentMethod('credit');
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                  paymentStatusOption === 'unpaid'
                    ? 'border-rose-500 bg-rose-500/20 text-rose-300 shadow-sm shadow-rose-500/20'
                    : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <ShoppingBag className="h-4 w-4 mb-1 text-rose-400" />
                <span>Unpaid / Credit</span>
              </button>
            </div>

            {/* If partially paid, allow merchant to specify amount paid */}
            {paymentStatusOption === 'partial' && (
              <div className="mt-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-300">
                    Amount Paid Today (₦):
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCustomAmountPaid(Math.round(grandTotal * 0.5).toString())}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-semibold text-amber-300"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomAmountPaid(Math.round(grandTotal * 0.75).toString())}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[10px] font-semibold text-amber-300"
                    >
                      75%
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    ₦
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={grandTotal}
                    value={customAmountPaid}
                    onChange={(e) => setCustomAmountPaid(e.target.value)}
                    placeholder="Enter deposit amount"
                    className="w-full rounded-lg border border-amber-500/40 bg-[#070B16] py-1.5 pl-8 pr-3 text-xs font-bold mono-num text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Discount & Totals Summary */}
          <div className="rounded-xl border border-slate-800 bg-[#070B16] p-3.5 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal:</span>
              <span className="mono-num text-slate-200">{formatNaira(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Discount (₦):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 rounded border border-slate-800 bg-[#0A0F22] px-2 py-0.5 text-right text-xs text-emerald-400 mono-num focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="font-bold text-white">Grand Total:</span>
              <span className="text-lg font-extrabold text-white mono-num">
                {formatNaira(grandTotal)}
              </span>
            </div>

            {/* Immediate payment calculations */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium">Amount Received Now:</span>
              <span className="font-bold text-emerald-400 mono-num text-sm">
                {formatNaira(effectiveAmountPaid)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-400 font-medium">Outstanding Balance:</span>
              <span className="font-extrabold text-rose-400 mono-num text-sm">
                {formatNaira(effectiveOutstanding)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stockValidation.valid || cartItems.length === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Receipt className="h-4 w-4" />
              <span>Complete Sale & Issue Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
