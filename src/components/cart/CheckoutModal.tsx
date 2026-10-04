import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createOrder, getResellerByCode, fetchSettings } from '../../services/storeService';
import { Order, PaymentMethod, StoreSettings } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const BD_DISTRICTS = [
  'Dhaka',
  'Chattogram',
  'Gazipur',
  'Narayanganj',
  'Cumilla',
  'Sylhet',
  'Rajshahi',
  'Bogura',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cox’s Bazar',
  'Feni',
  'Tangail',
  'Jessore',
  'Dinajpur',
  'Kushtia',
  'Noakhali',
  'Brahmanbaria',
  'Pabna',
  'Faridpur',
  'Other District',
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const {
    cart,
    subtotal,
    deliveryCharge,
    discount,
    total,
    clearCart,
    selectedDistrict,
    setSelectedDistrict,
    referralCode,
  } = useCart();
  const { currentUser, userProfile, resellerProfile } = useAuth();
  const { language, t } = useLanguage();

  const [fullName, setFullName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phoneNumber || '');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [fullAddress, setFullAddress] = useState(userProfile?.address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [bKashTrxId, setBKashTrxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setStoreSettings(s);
        // Default to active method
        if (s.codEnabled ?? true) {
          setPaymentMethod('cod');
        } else if (s.bkashEnabled ?? true) {
          setPaymentMethod('bkash');
        } else if (s.nagadEnabled ?? true) {
          setPaymentMethod('nagad');
        } else if (s.rocketEnabled) {
          setPaymentMethod('rocket');
        }
      })
      .catch((e) => console.warn('Settings load note:', e));
  }, []);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError('কার্ট খালি রয়েছে। অনুগ্রহ করে পণ্য যোগ করুন।');
      return;
    }

    if (!fullName.trim()) {
      setError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    if (!phone.trim() || phone.length < 11) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }

    if (!fullAddress.trim()) {
      setError('অনুগ্রহ করে আপনার পূর্ণাঙ্গ ডেলিভারি ঠিকানা প্রদান করুন।');
      return;
    }

    if (
      (paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'rocket') &&
      !bKashTrxId.trim()
    ) {
      setError(`অনুগ্রহ করে ${paymentMethod.toUpperCase()} ট্রানজেকশন আইডি (TrxID) প্রদান করুন।`);
      return;
    }

    setLoading(true);

    try {
      // Check reseller attribution
      let verifiedResellerId: string | undefined = resellerProfile?.id;
      let verifiedResellerCode: string | undefined = resellerProfile?.resellerCode;

      if (!verifiedResellerCode && referralCode) {
        const found = await getResellerByCode(referralCode);
        if (found) {
          verifiedResellerId = found.id;
          verifiedResellerCode = found.resellerCode;
        }
      }

      // Calculate reseller commission
      const totalCommission = cart.reduce((sum, item) => {
        const itemSelling = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.salePrice;
        const itemMargin = Math.max(0, itemSelling - item.product.resellerBasePrice);
        return sum + itemMargin * item.quantity;
      }, 0);

      const orderNumber = `SLX-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderId = `ord-${Date.now()}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        customerId: currentUser?.uid,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: currentUser?.email || undefined,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          alternatePhone: alternatePhone.trim() || undefined,
          district: selectedDistrict,
          fullAddress: fullAddress.trim(),
          notes: notes.trim() || undefined,
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          nameBn: item.product.nameBn,
          image: item.product.images[0],
          price: item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.salePrice,
          resellerBasePrice: item.product.resellerBasePrice,
          commission: Math.max(0, (item.customSellingPrice || item.product.salePrice) - item.product.resellerBasePrice),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        })),
        subtotal,
        deliveryCharge,
        discount,
        totalAmount: total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'verified',
        orderStatus: 'pending',
        resellerId: verifiedResellerId,
        resellerCode: verifiedResellerCode,
        resellerCommission: totalCommission,
        commissionStatus: verifiedResellerId ? 'pending' : undefined,
        bKashTrxId: bKashTrxId.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await createOrder(newOrder);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err?.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const getActiveNumber = () => {
    if (paymentMethod === 'bkash') return storeSettings?.bkashNumber || '01700-000000';
    if (paymentMethod === 'nagad') return storeSettings?.nagadNumber || '01800-000000';
    if (paymentMethod === 'rocket') return storeSettings?.rocketNumber || '01900-000000-8';
    return '';
  };

  const getActiveType = () => {
    if (paymentMethod === 'bkash') return storeSettings?.bkashAccountType || 'Personal';
    if (paymentMethod === 'nagad') return storeSettings?.nagadAccountType || 'Personal';
    if (paymentMethod === 'rocket') return 'Personal';
    return '';
  };

  const getActiveInstruction = () => {
    if (paymentMethod === 'bkash') {
      return storeSettings?.bkashInstructions || 'বিকাশ পার্সোনাল নম্বরে Send Money করুন। সফল পেমেন্টের পর প্রাপ্ত TrxID প্রদান করুন।';
    }
    if (paymentMethod === 'nagad') {
      return storeSettings?.nagadInstructions || 'নগদ পার্সোনাল নম্বরে Send Money করুন এবং TrxID প্রদান করুন।';
    }
    if (paymentMethod === 'rocket') {
      return storeSettings?.rocketInstructions || 'রকেট নম্বরে Send Money করুন এবং TrxID প্রদান করুন।';
    }
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>নিরাপদ চেকআউট</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            ডেলিভারি তথ্য ও পেমেন্ট
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            সঠিক তথ্য প্রদান করে অর্ডার কনফার্ম করুন।
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('mobileNumber')} *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01700-000000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('selectDistrict')} *
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                {BD_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} {d.toLowerCase().includes('dhaka') ? '(ঢাকার ভিতরে ৳৭০)' : '(ঢাকার বাইরে ৳১৩০)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                বিকল্প ফোন নম্বর (ঐচ্ছিক)
              </label>
              <input
                type="tel"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                placeholder="01800-000000"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('deliveryAddress')} (থানা, এলাকা, বাড়ি ও রোড নম্বর) *
            </label>
            <div className="relative">
              <textarea
                required
                rows={2}
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="যেমন: হাউজ #১২, রোড #০৫, সেক্টর #৩, উত্তরা, ঢাকা"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Payment Method Selector (Dynamically configured by Admin) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('paymentMethod')} *
              </label>
              <span className="text-[10px] text-slate-400 font-medium">অ্যাডমিন দ্বারা অনুমোদিত পেমেন্ট অপশন</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* COD */}
              {(storeSettings?.codEnabled ?? true) && (
                <label
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="block font-bold">ক্যাশ অন ডেলিভারি</span>
                    <span className="text-[10px] text-slate-500 font-normal">COD</span>
                  </div>
                </label>
              )}

              {/* bKash */}
              {(storeSettings?.bkashEnabled ?? true) && (
                <label
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-pink-500 bg-pink-50/80 dark:bg-pink-950/40 text-pink-900 dark:text-pink-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <div className="text-xs">
                    <span className="block font-bold text-pink-700 dark:text-pink-300">bKash বিকাশ</span>
                    <span className="text-[10px] text-slate-500 font-normal">{storeSettings?.bkashAccountType || 'Personal'}</span>
                  </div>
                </label>
              )}

              {/* Nagad */}
              {(storeSettings?.nagadEnabled ?? true) && (
                <label
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <div className="text-xs">
                    <span className="block font-bold text-orange-700 dark:text-orange-300">Nagad নগদ</span>
                    <span className="text-[10px] text-slate-500 font-normal">{storeSettings?.nagadAccountType || 'Personal'}</span>
                  </div>
                </label>
              )}

              {/* Rocket */}
              {storeSettings?.rocketEnabled && (
                <label
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                    paymentMethod === 'rocket'
                      ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'rocket'}
                    onChange={() => setPaymentMethod('rocket')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="text-xs">
                    <span className="block font-bold text-purple-700 dark:text-purple-300">Rocket রকেট</span>
                    <span className="text-[10px] text-slate-500 font-normal">মোবাইল ব্যাংকিং</span>
                  </div>
                </label>
              )}
            </div>

            {/* Instruction & TrxID Card for bKash / Nagad / Rocket */}
            {paymentMethod !== 'cod' && (
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                      {paymentMethod === 'bkash' ? 'বিকাশ নম্বর:' : paymentMethod === 'nagad' ? 'নগদ নম্বর:' : 'রকেট নম্বর:'}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                        {getActiveNumber()}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">
                        {getActiveType()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const num = getActiveNumber();
                      navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
                      setCopiedNumber(true);
                      setTimeout(() => setCopiedNumber(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedNumber ? 'নম্বর কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
                  </button>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                  {getActiveInstruction()}
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                    ট্রানজেকশন আইডি (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={bKashTrxId}
                    onChange={(e) => setBKashTrxId(e.target.value)}
                    placeholder="যেমন: 9J7K3X90L"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="mt-2.5 p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{storeSettings?.codInstructions || 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।'}</span>
              </div>
            )}
          </div>

          {/* Order Summary Pill */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">মোট পরিশোধযোগ্য টাকা:</span>
              <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
                ৳{total.toLocaleString()}
              </span>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <p>পণ্য মূল্য: ৳{subtotal.toLocaleString()}</p>
              <p>ডেলিভারি চার্জ: ৳{deliveryCharge}</p>
              {discount > 0 && <p className="text-rose-500 font-bold">ছাড়: -৳{discount}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>অর্ডার সম্পন্ন হচ্ছে...</span>
            ) : (
              <>
                <Truck className="w-4 h-4" />
                <span>অর্ডার কনফার্ম করুন (৳{total.toLocaleString()})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
