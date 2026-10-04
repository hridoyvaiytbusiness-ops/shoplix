import React, { useState } from 'react';
import { Search, Package, CheckCircle2, Clock, Truck, X, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrder?: Order | null;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrder,
}) => {
  if (!isOpen) return null;

  const { language, t } = useLanguage();
  const [queryInput, setQueryInput] = useState(initialOrder?.orderNumber || '');
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const trimmed = queryInput.trim().toUpperCase().replace('#', '');

      // Search by orderNumber
      const q = query(collection(db, 'orders'), where('orderNumber', '==', trimmed));
      let snap = await getDocs(q);

      if (snap.empty) {
        // Search by phone
        const qPhone = query(collection(db, 'orders'), where('customerPhone', '==', queryInput.trim()));
        snap = await getDocs(qPhone);
      }

      if (!snap.empty) {
        const found = snap.docs[0].data() as Order;
        setOrder(found);
      } else {
        setError('No order found with this Order Number or Phone. Please verify and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error searching for order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {t('trackOrder')}
            </h3>
            <p className="text-xs text-slate-500">
              অর্ডার নম্বর (যেমন: SLX-123456) অথবা মোবাইল নম্বর দিয়ে সার্চ করুন
            </p>
          </div>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="SLX-123456 অথবা 01700-000000"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {loading ? 'অনুসন্ধান...' : 'খুঁজুন'}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Found Order Card */}
        {order && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  #{order.orderNumber}
                </span>
                <span className="block text-[11px] text-slate-400">
                  তারিখ: {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  order.orderStatus === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.orderStatus === 'shipped'
                    ? 'bg-blue-100 text-blue-800'
                    : order.orderStatus === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">কাস্টমার:</span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">মোট মূল্য:</span>
                <span className="font-bold text-emerald-600">৳{order.totalAmount} (COD)</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">ডেলিভারি ঠিকানা:</span>
                <span className="font-medium">{order.shippingAddress?.fullAddress}, {order.shippingAddress?.district}</span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-2">
                ডেলিভারি স্ট্যাটাস ট্র্যাকিং
              </span>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-600">১. অর্ডার গ্রহণ</span>
                <span className={['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'text-emerald-600' : 'text-slate-400'}>
                  ২. প্রসেসিং
                </span>
                <span className={['shipped', 'delivered'].includes(order.orderStatus) ? 'text-emerald-600' : 'text-slate-400'}>
                  ৩. কুরিয়ারে
                </span>
                <span className={order.orderStatus === 'delivered' ? 'text-emerald-600' : 'text-slate-400'}>
                  ৪. ডেলিভার্ড
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
