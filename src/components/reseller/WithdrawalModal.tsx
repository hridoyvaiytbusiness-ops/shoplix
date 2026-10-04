import React, { useState } from 'react';
import { X, ArrowDownRight, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { Reseller } from '../../types';
import { submitWithdrawalRequest } from '../../services/storeService';
import { useLanguage } from '../../context/LanguageContext';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  reseller: Reseller;
  onSuccess: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  reseller,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const { language, t } = useLanguage();
  const [method, setMethod] = useState<'bKash' | 'Nagad'>(reseller.paymentMethod || 'bKash');
  const [accountNumber, setAccountNumber] = useState(reseller.payoutNumber || '');
  const [amount, setAmount] = useState<number>(Math.min(reseller.availableBalance, 1000) || 500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < 500) {
      setError(t('minWithdrawAmountWarning'));
      return;
    }

    if (amount > reseller.availableBalance) {
      setError(t('insufficientBalance'));
      return;
    }

    if (!accountNumber.trim() || accountNumber.length < 11) {
      setError('Please enter a valid 11-digit mobile wallet number.');
      return;
    }

    setLoading(true);

    try {
      await submitWithdrawalRequest(reseller, amount, method, accountNumber.trim());
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Withdrawal submission error:', err);
      setError(err?.message || 'Failed to submit withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t('requestWithdrawal')}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? 'বিকাশ ও নগদ উত্তোলনের অনুরোধ' : 'Cash payout to bKash / Nagad'}
            </p>
          </div>
        </div>

        {/* Current Available Balance */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 mb-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">{t('availableBalance')}</span>
            <span className="text-2xl font-black text-emerald-600">
              ৳{reseller.availableBalance.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg">
            নূন্যতম ৳৫০০
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('selectPaymentMethod')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('bKash')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  method === 'bKash'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950 text-pink-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                bKash বিকাশ
              </button>
              <button
                type="button"
                onClick={() => setMethod('Nagad')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  method === 'Nagad'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Nagad নগদ
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {method} {language === 'bn' ? 'একাউন্ট নম্বর' : 'Account Number'}
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="01700-000000"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('withdrawAmount')}
            </label>
            <input
              type="number"
              min={500}
              max={reseller.availableBalance}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
            />
            <div className="flex gap-2 mt-2">
              {[500, 1000, 2000, 5000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(Math.min(reseller.availableBalance, preset))}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  ৳{preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(reseller.availableBalance)}
                className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                সব ব্যালেন্স
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || reseller.availableBalance < 500}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'আবেদন পাঠানো হচ্ছে...' : t('submitWithdrawal')}
          </button>
        </form>
      </div>
    </div>
  );
};
