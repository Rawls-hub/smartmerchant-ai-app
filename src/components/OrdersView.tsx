import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  PhoneCall,
  Search,
  Filter,
  MapPin,
  AlertCircle,
  ExternalLink,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useMerchant } from '../context/MerchantContext';
import { formatNaira, formatTimeAgo } from '../data/mockData';
import { OrderStatus, Order, PaymentStatus } from '../types';

export const OrdersView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    addOrder,
    products,
    settings,
    openPaymentModal,
  } = useMerchant();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cityArea, setCityArea] = useState('Lagos');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [newOrderPaymentStatus, setNewOrderPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [newOrderDeposit, setNewOrderDeposit] = useState<string>('');
  const [orderError, setOrderError] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const calculatedTotal = (selectedProduct?.sellingPrice || 0) * orderQuantity;
  const depositNum = parseFloat(newOrderDeposit) || 0;
  const calculatedPaid =
    newOrderPaymentStatus === 'paid'
      ? calculatedTotal
      : newOrderPaymentStatus === 'unpaid'
      ? 0
      : Math.min(calculatedTotal, Math.max(0, depositNum));
  const calculatedOutstanding = Math.max(0, calculatedTotal - calculatedPaid);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    const matchesPayment =
      paymentFilter === 'all' || order.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            Pending Dispatch
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400 border border-blue-500/20">
            <Truck className="h-3 w-3" />
            With Rider / Waybill
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Delivered & Closed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
    }
  };

  const getPaymentBadge = (order: Order) => {
    const status: PaymentStatus =
      order.paymentStatus ||
      ((order.outstandingBalance || 0) === 0
        ? 'paid'
        : (order.amountPaid || 0) === 0
        ? 'unpaid'
        : 'partial');

    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            PAID
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            PARTIALLY PAID
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-3 w-3" />
            UNPAID
          </span>
        );
    }
  };

  const getWhatsAppOrderUrl = (order: Order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const paid = order.amountPaid || 0;
    const bal = order.outstandingBalance !== undefined ? order.outstandingBalance : Math.max(0, order.totalAmount - paid);

    const message = encodeURIComponent(
      `Hello ${order.customerName}! 🛍️ This is an update on your order (${order.orderNo}) with ${settings.storeName}.\n\nItems: ${order.items
        .map((i) => `${i.quantity}x ${i.productName}`)
        .join(', ')}\nTotal: ${formatNaira(order.totalAmount)}\nPaid: ${formatNaira(paid)}\nOutstanding Balance: ${formatNaira(bal)}\nPayment Status: ${order.paymentStatus.toUpperCase()}\nOrder Status: ${order.status.toUpperCase()}\nDestination: ${order.deliveryAddress}, ${order.cityArea}.\n\nThank you for choosing ${settings.storeName}!`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      setOrderError('Please select a valid product.');
      return;
    }

    if (prod.stock <= 0) {
      setOrderError(`"${prod.name}" is out of stock (0 available).`);
      return;
    }

    if (orderQuantity > prod.stock) {
      setOrderError(`Requested quantity (${orderQuantity}) exceeds available stock (${prod.stock} ${prod.unit} available).`);
      return;
    }

    const total = prod.sellingPrice * orderQuantity;

    addOrder({
      customerName,
      customerPhone,
      deliveryAddress,
      cityArea,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: orderQuantity,
          unitPrice: prod.sellingPrice,
          total,
        },
      ],
      totalAmount: total,
      amountPaid: calculatedPaid,
      paymentStatus: newOrderPaymentStatus,
      status: 'pending',
      deliveryNote,
    });

    setIsNewOrderModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDeliveryNote('');
    setNewOrderPaymentStatus('unpaid');
    setNewOrderDeposit('');
    setOrderError(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Orders & Waybill Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Dispatch gadget orders across Lagos & Nigeria, manage partial deposits, and settle balances upon delivery.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNewOrderModalOpen(true);
            setOrderError(null);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create Customer Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, order # or destination..."
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Payment Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Payment:</span>
            {[
              { id: 'all', label: 'All Payments' },
              { id: 'paid', label: 'Paid in Full' },
              { id: 'partial', label: 'Partially Paid' },
              { id: 'unpaid', label: 'Unpaid' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPaymentFilter(p.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium shrink-0 transition-colors ${
                  paymentFilter === p.id
                    ? p.id === 'paid'
                      ? 'bg-emerald-600 text-white'
                      : p.id === 'partial'
                      ? 'bg-amber-600 text-white'
                      : p.id === 'unpaid'
                      ? 'bg-rose-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Fulfillment Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Fulfillment:</span>
            {['all', 'pending', 'processing', 'delivered', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2 py-1 text-xs font-medium capitalize shrink-0 transition-colors ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOrders.map((order) => {
          const paid = order.amountPaid || 0;
          const balance = order.outstandingBalance !== undefined ? order.outstandingBalance : Math.max(0, order.totalAmount - paid);

          return (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-800 bg-[#0A0F22] p-5 shadow-xl hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white mono-num text-sm sm:text-base">
                        {order.orderNo}
                      </span>
                      <span className="text-xs text-slate-400">
                        • {formatTimeAgo(order.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {order.customerName}
                    </h3>
                    <div className="text-xs text-cyan-400 flex items-center gap-1 mt-0.5">
                      <PhoneCall className="h-3 w-3" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white mono-num text-lg">
                      {formatNaira(order.totalAmount)}
                    </div>
                    <div className="mt-1">{getPaymentBadge(order)}</div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="mt-4 rounded-xl border border-slate-800/80 bg-[#070B16] p-3">
                  <div className="text-xs font-medium text-slate-400 mb-1">Ordered Items:</div>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-200">
                        <span>{item.quantity}x {item.productName}</span>
                        <span className="mono-num text-slate-400">{formatNaira(item.total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Breakdown Line */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold">
                      Paid: {formatNaira(paid)}
                    </span>
                    {balance > 0 ? (
                      <span className="text-rose-400 font-bold">
                        Outstanding: {formatNaira(balance)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Fully Cleared</span>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress}, <strong className="text-slate-300">{order.cityArea}</strong>
                  </span>
                </div>

                {order.deliveryNote && (
                  <div className="mt-2 text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded-lg">
                    Note: {order.deliveryNote}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div>{getStatusBadge(order.status)}</div>

                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppOrderUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {balance > 0 && (
                    <button
                      onClick={() =>
                        openPaymentModal({
                          type: 'order',
                          id: order.id,
                          referenceNo: order.orderNo,
                          customerName: order.customerName,
                          customerPhone: order.customerPhone,
                          totalAmount: order.totalAmount,
                          amountPaid: paid,
                          outstandingBalance: balance,
                        })
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold transition-colors"
                      title="Record Order Payment"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Record Payment</span>
                    </button>
                  )}

                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      Dispatch
                    </button>
                  )}

                  {order.status === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered', 'paid')}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-[#0A0F22] py-12 text-center text-slate-400 text-sm">
          No customer orders found matching your criteria.
        </div>
      )}

      {/* New Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B1124] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">Create New Customer Order</h3>
            <p className="text-xs text-slate-400 mt-1">
              Log a new order for dispatch or counter pickup with payment terms in Naira (₦).
            </p>

            <form onSubmit={handleCreateOrder} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Mrs. Funmi Adeleke"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer Phone / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +234 803 123 4567"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatNaira(p.sellingPrice)} ({p.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Payment Status Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Initial Payment Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOrderPaymentStatus('paid')}
                    className={`rounded-xl p-2 text-xs font-semibold border transition-all ${
                      newOrderPaymentStatus === 'paid'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-slate-800 bg-[#070B16] text-slate-400'
                    }`}
                  >
                    Paid in Full
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOrderPaymentStatus('partial');
                      if (!newOrderDeposit) {
                        setNewOrderDeposit(Math.round(calculatedTotal * 0.5).toString());
                      }
                    }}
                    className={`rounded-xl p-2 text-xs font-semibold border transition-all ${
                      newOrderPaymentStatus === 'partial'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-[#070B16] text-slate-400'
                    }`}
                  >
                    Partially Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOrderPaymentStatus('unpaid')}
                    className={`rounded-xl p-2 text-xs font-semibold border transition-all ${
                      newOrderPaymentStatus === 'unpaid'
                        ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                        : 'border-slate-800 bg-[#070B16] text-slate-400'
                    }`}
                  >
                    Unpaid (COD)
                  </button>
                </div>

                {newOrderPaymentStatus === 'partial' && (
                  <div className="mt-2.5 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5">
                    <label className="text-xs font-medium text-amber-300">
                      Deposit Amount Paid Today (₦):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        ₦
                      </span>
                      <input
                        type="number"
                        min="1"
                        max={calculatedTotal}
                        value={newOrderDeposit}
                        onChange={(e) => setNewOrderDeposit(e.target.value)}
                        placeholder="Enter deposit amount"
                        className="w-full rounded-lg border border-amber-500/40 bg-[#070B16] py-1.5 pl-8 pr-3 text-xs font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Calculation Summary */}
                <div className="mt-2.5 rounded-xl border border-slate-800 bg-[#070B16] p-2.5 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Order Total:</span>
                    <span className="font-bold mono-num text-white">{formatNaira(calculatedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Amount Paid:</span>
                    <span className="font-semibold mono-num">{formatNaira(calculatedPaid)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                    <span>Outstanding Balance:</span>
                    <span className="mono-num">{formatNaira(calculatedOutstanding)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. 15 Allen Avenue"
                    className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    City / State
                  </label>
                  <input
                    type="text"
                    value={cityArea}
                    onChange={(e) => setCityArea(e.target.value)}
                    placeholder="e.g. Ikeja, Lagos"
                    className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Waybill / Delivery Note (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g. Deliver before 4pm with Kwik dispatch"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {orderError && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {orderError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewOrderModalOpen(false);
                    setOrderError(null);
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-500 hover:to-cyan-400"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
