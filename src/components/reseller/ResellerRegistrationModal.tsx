import React, { useState } from 'react';
import { X, TrendingUp, ShieldCheck, CheckCircle2, AlertCircle, Phone, Store, User, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { submitResellerApplication } from '../../services/storeService';
import { Reseller } from '../../types';

interface ResellerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ResellerRegistrationModal: React.FC<ResellerRegistrationModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const { currentUser, userProfile, resellerProfile, refreshProfiles } = useAuth();
  const { language, t } = useLanguage();

  const [shopName, setShopName] = useState('');
  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [payoutNumber, setPayoutNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    if (!shopName.trim() || !fullName.trim() || !phone.trim() || !payoutNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resellerCode = `SLX-${Math.floor(1000 + Math.random() * 9000)}`;
      const resellerData: Reseller = {
        id: currentUser.uid,
        userId: currentUser.uid,
        resellerCode,
        shopName: shopName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
        status: 'pending',
        paymentMethod,
        payoutNumber: payoutNumber.trim(),
        address: address.trim(),
        totalSales: 0,
        totalOrders: 0,
        totalEarnings: 0,
        availableBalance: 0,
        pendingEarnings: 0,
        withdrawnBalance: 0,
        createdAt: new Date().toISOString(),
      };

      await submitResellerApplication(resellerData);
      await refreshProfiles();
      setSubmitted(true);
    } catch (err: any) {
      console.error('Reseller application error:', err);
      setError(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application Submitted!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {language === 'bn'
                ? 'আপনার রিসেলার আবেদন আমাদের অ্যাডমিন টিমের কাছে পৌঁছেছে। অতি শীঘ্রই যাচাই শেষে অ্যাকাউন্ট অনুমোদন করা হবে। অনুমোদনের পর আপনি সম্পূর্ণ রিসেলার ড্যাশবোর্ড ব্যবহার করতে পারবেন।'
                : 'Your reseller application has been submitted and is under administrative review. Once approved, your full Reseller Dashboard and wallet will be activated.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
            >
              {language === 'bn' ? 'ঠিক আছে' : 'Got it'}
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-full text-xs font-bold mb-2 border border-teal-200 dark:border-teal-800">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'শপলিক্স রিসেলার প্রোগ্রাম' : 'Shoplix Reseller Program'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'ফ্রি রিসেলার একাউন্টের জন্য আবেদন করুন' : 'Become a Certified Reseller'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'bn'
                  ? 'বিনা পুঁজিতে ই-কমার্স ব্যবসা শুরু করুন। কাস্টমারের কাছে পণ্য বিক্রি করে নিজের নির্ধারিত কমিশন বিকাশ বা নগদে তুলে নিন।'
                  : 'Start your risk-free online business. Earn high profit margins and cash-out straight to bKash or Nagad.'}
              </p>
            </div>

            {!currentUser && (
              <div className="mb-5 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-semibold">
                  {language === 'bn' ? 'আবেদন করার পূর্বে অনুগ্রহ করে লগইন করুন।' : 'Please sign in or create an account first.'}
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700 cursor-pointer whitespace-nowrap"
                >
                  {t('login')}
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  আপনার অনলাইন পেজ বা শপের নাম *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="যেমন: Dhaka Fashion Mart / তানভির গ্যাজেটস"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    আপনার পূর্ণ নাম *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="মোঃ তানভীর ইসলাম"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01700-000000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Payment Method for Payouts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    উত্তোলন মাধ্যম (Payout Method) *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentMethod === 'bKash'
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-950 text-pink-600'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      bKash বিকাশ
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        paymentMethod === 'Nagad'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950 text-orange-600'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Nagad নগদ
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {paymentMethod} একাউন্ট নম্বর *
                  </label>
                  <input
                    type="tel"
                    required
                    value={payoutNumber}
                    onChange={(e) => setPayoutNumber(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  আপনার সম্পূর্ণ ঠিকানা ও জেলা *
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="থানা, জেলা ও বিস্তারিত ঠিকানা"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !currentUser}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading
                  ? (language === 'bn' ? 'আবেদন পাঠানো হচ্ছে...' : 'Submitting Application...')
                  : (language === 'bn' ? 'রিসেলার আবেদন জমা দিন' : 'Submit Reseller Application')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
