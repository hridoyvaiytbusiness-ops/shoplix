import React from 'react';
import { CheckCircle2, Package, ArrowRight, PhoneCall, Copy, Check } from 'lucide-react';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  if (!isOpen || !order) return null;
  const { language, t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
          {t('orderSuccessTitle')}
        </h3>

        <p className="text-xs text-slate-500 mb-6">
          {language === 'bn'
            ? 'আমাদের ডেলিভারি টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে এবং পার্সেল প্রেরণ করা হবে।'
            : 'We have received your order and our dispatch team will contact you shortly.'}
        </p>

        {/* Order Number Box */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{t('orderNumber')}:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {order.orderNumber}
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-emerald-600 p-0.5 cursor-pointer"
                title="Copy order number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">কাস্টমার নাম:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{order.customerName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">সর্বমোট মূল্য:</span>
            <span className="font-extrabold text-emerald-600 text-sm">৳{order.totalAmount}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">পেমেন্ট মেথড:</span>
            <span className="font-semibold uppercase text-[11px] text-slate-700 dark:text-slate-300">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>{t('trackOrderBtn')}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
};
