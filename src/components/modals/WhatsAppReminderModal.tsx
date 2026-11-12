import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { formatNaira } from '../../data/mockData';

export const WhatsAppReminderModal: React.FC = () => {
  const {
    activeWhatsAppModalDebtor,
    setActiveWhatsAppModalDebtor,
    markDebtorReminderSent,
    settings,
  } = useMerchant();

  const [selectedTone, setSelectedTone] = useState<'polite' | 'firm' | 'pidgin'>('polite');
  const [customMessage, setCustomMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!activeWhatsAppModalDebtor) return;
    const d = activeWhatsAppModalDebtor;

    if (selectedTone === 'polite') {
      setCustomMessage(
        `Good day ${d.customerName}! 🙏 Hope you and family are doing well.\n\n` +
        `This is a gentle reminder regarding the outstanding balance of ${formatNaira(d.amountOwed)} for your order (${d.itemDescription}) from ${settings.storeName}.\n\n` +
        `You can kindly make the transfer to:\n` +
        `Bank: ${settings.bankDetails.bankName}\n` +
        `Account: ${settings.bankDetails.accountNumber}\n` +
        `Name: ${settings.bankDetails.accountName}\n\n` +
        `Thank you so much for your continuous patronage and support! ✨`
      );
    } else if (selectedTone === 'firm') {
      setCustomMessage(
        `Dear ${d.customerName},\n\n` +
        `We are currently balancing our weekly accounts at ${settings.storeName} and noticed that your outstanding invoice of ${formatNaira(d.amountOwed)} for (${d.itemDescription}) is now ${d.daysOverdue > 0 ? `${d.daysOverdue} days past due` : 'due for payment'}.\n\n` +
        `Kindly settle this balance today to ensure your credit account remains active:\n` +
        `Bank: ${settings.bankDetails.bankName}\n` +
        `Account: ${settings.bankDetails.accountNumber}\n` +
        `Name: ${settings.bankDetails.accountName}\n\n` +
        `Please share the transfer receipt once completed. Thank you.`
      );
    } else {
      setCustomMessage(
        `Hello ${d.customerName}! 🇳🇬 Hope market dey move fine for your side.\n\n` +
        `Abeg, we dey balance our store book today for ${settings.storeName}, and we notice the small balance of ${formatNaira(d.amountOwed)} for the goods (${d.itemDescription}) you collect.\n\n` +
        `Kindly help us transfer am today so we fit restock new goods:\n` +
        `Bank: ${settings.bankDetails.bankName}\n` +
        `Acc No: ${settings.bankDetails.accountNumber}\n` +
        `Name: ${settings.bankDetails.accountName}\n\n` +
        `God bless your business! Once you pay, just send receipt here. 🤝`
      );
    }
  }, [activeWhatsAppModalDebtor, selectedTone, settings]);

  if (!activeWhatsAppModalDebtor) return null;

  const cleanPhone = activeWhatsAppModalDebtor.phone.replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(customMessage);
  const whatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;

  const handleSendClick = () => {
    markDebtorReminderSent(activeWhatsAppModalDebtor.id);
    setActiveWhatsAppModalDebtor(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B1124] p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI WhatsApp Debt Recovery</h3>
              <p className="text-[11px] text-slate-400">
                Culturally-tailored message drafter to recover money respectfully.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveWhatsAppModalDebtor(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Debtor summary card */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-[#070B16] p-3.5 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">
              {activeWhatsAppModalDebtor.customerName}
            </div>
            <div className="text-xs text-slate-400">{activeWhatsAppModalDebtor.phone}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Goods: {activeWhatsAppModalDebtor.itemDescription}
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-extrabold text-rose-400 mono-num">
              {formatNaira(activeWhatsAppModalDebtor.amountOwed)}
            </div>
            <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded">
              {activeWhatsAppModalDebtor.daysOverdue > 0
                ? `${activeWhatsAppModalDebtor.daysOverdue}d Overdue`
                : 'Due Today'}
            </span>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Message Tone & Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'polite', label: '1. Polite & Gentle', desc: 'Preserves relationship' },
              { id: 'firm', label: '2. Firm & Official', desc: 'Overdue audit tone' },
              { id: 'pidgin', label: '3. Friendly Pidgin', desc: 'Warm market vibe' },
            ].map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setSelectedTone(tone.id as any)}
                className={`rounded-xl p-2.5 text-left border transition-all ${
                  selectedTone === tone.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                    : 'border-slate-800 bg-[#070B16] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white">{tone.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{tone.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Editor */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Message Preview (Editable)
            </label>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={7}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#070B16] p-3 text-xs leading-relaxed text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveWhatsAppModalDebtor(null)}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleSendClick}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Open & Send via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
