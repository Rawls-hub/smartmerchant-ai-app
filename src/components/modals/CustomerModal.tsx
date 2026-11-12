import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, AlertTriangle, Building, Phone, Mail, MapPin, Tag } from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { CustomerTag } from '../../types';

export const CustomerModal: React.FC = () => {
  const {
    isCustomerModalOpen,
    setIsCustomerModalOpen,
    editingCustomer,
    setEditingCustomer,
    addCustomer,
    updateCustomer,
  } = useMerchant();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCityArea] = useState('Lagos');
  const [tag, setTag] = useState<CustomerTag>('Regular');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingCustomer) {
      setFullName(editingCustomer.fullName);
      setPhone(editingCustomer.phone);
      setEmail(editingCustomer.email || '');
      setAddress(editingCustomer.address || '');
      setCityArea(editingCustomer.city || 'Lagos');
      setTag(editingCustomer.tag || 'Regular');
      setNotes(editingCustomer.notes || '');
      setErrorMessage(null);
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCityArea('Lagos');
      setTag('Regular');
      setNotes('');
      setErrorMessage(null);
    }
  }, [editingCustomer, isCustomerModalOpen]);

  if (!isCustomerModalOpen && !editingCustomer) return null;

  const handleClose = () => {
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter the customer full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a valid phone / WhatsApp number.');
      return;
    }

    if (editingCustomer) {
      const res = updateCustomer(editingCustomer.id, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        tag,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update customer.');
        return;
      }
    } else {
      const res = addCustomer({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        tag,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to add customer.');
        return;
      }
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0A0F22] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              {editingCustomer ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingCustomer
                  ? 'Update contact details, delivery address, and notes.'
                  : 'Register a customer profile for Rawls & Hub gadget store.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Babatunde Fashola (Creative Studio)"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Phone / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +234 802 112 3456"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none mono-num"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@domain.ng"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Delivery / Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Toyin Street, Ikeja"
                  className="w-full rounded-xl border border-slate-800 bg-[#070B16] py-2 pl-9 pr-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                City / State
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCityArea(e.target.value)}
                placeholder="e.g. Ikeja, Lagos"
                className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Customer Classification Tag
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Regular', 'VIP', 'Corporate', 'Wholesale'] as CustomerTag[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(t)}
                  className={`rounded-xl py-2 px-2 text-xs font-semibold border transition-all ${
                    tag === t
                      ? t === 'VIP'
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                        : t === 'Corporate'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : t === 'Wholesale'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-slate-600 bg-slate-800 text-white'
                      : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Internal Notes (Preferences / Credit terms)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers iPhone flagship devices, pays via Moniepoint POS"
              className="w-full rounded-xl border border-slate-800 bg-[#070B16] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 active:scale-95 transition-all"
            >
              {editingCustomer ? 'Update Profile' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
