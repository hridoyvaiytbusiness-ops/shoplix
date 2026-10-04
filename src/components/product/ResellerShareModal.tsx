import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface ResellerShareModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenResellerModal: () => void;
}

export const ResellerShareModal: React.FC<ResellerShareModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenResellerModal,
}) => {
  if (!isOpen || !product) return null;

  const { resellerProfile, currentUser, isApprovedReseller } = useAuth();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Generate unique code: use reseller profile code or fallback
  const resellerCode = resellerProfile?.resellerCode || (currentUser ? `REF-${currentUser.uid.substring(0, 5).toUpperCase()}` : 'SHOPLIX');

  // Build the referral URL
  const baseUrl = window.location.origin;
  const referralUrl = `${baseUrl}?ref=${resellerCode}&product=${product.id}`;

  const promoCopy = language === 'bn'
    ? `🔥 প্রিমিয়াম কালেকশন: ${product.nameBn}\n\n✅ রেগুলার প্রাইস: ৳${product.regularPrice}\n✅ ডিসকাউন্ট অফার: মাত্র ৳${product.salePrice}!\n✅ সারাদেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)।\n\n👉 অর্ডার করতে এখনই লিংকে ক্লিক করুন:\n${referralUrl}`
    : `🔥 Premium Quality: ${product.name}\n\n✅ Regular Price: ৳${product.regularPrice}\n✅ Special Offer: ৳${product.salePrice} Only!\n✅ Cash on Delivery Available Nationwide.\n\n👉 Order online directly here:\n${referralUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPromo = () => {
    navigator.clipboard.writeText(promoCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(promoCopy);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(referralUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {language === 'bn' ? 'প্রোডাক্ট শেয়ার করুন ও লাভ করুন' : 'Share & Earn Commission'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'bn' ? `প্রতিটি বিক্রয়ে নিশ্চিত প্রফিট: ৳${product.resellerCommission}` : `Guaranteed Profit Per Sale: ৳${product.resellerCommission}`}
            </p>
          </div>
        </div>

        {/* Reseller Status Note */}
        {!isApprovedReseller && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start justify-between gap-2">
            <div>
              <p className="font-bold">
                {language === 'bn' ? 'আপনি এখনো অনুমোদিত রিসেলার নন!' : 'You are not an approved reseller yet.'}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {language === 'bn' ? 'কমিশন বিকাশ/নগদে তুলতে আজই ফ্রি রিসেলার আবেদন করুন।' : 'Apply for free to withdraw earnings to bKash/Nagad.'}
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenResellerModal();
              }}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px] whitespace-nowrap cursor-pointer"
            >
              {t('becomeReseller')}
            </button>
          </div>
        )}

        {/* Referral Link Box */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {language === 'bn' ? 'আপনার ইউনিক রেফারাল লিংক:' : 'Your Unique Referral Link:'}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Instant Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('shareOnWhatsapp')}</span>
          </button>
          <button
            onClick={handleFacebookShare}
            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{t('shareOnFacebook')}</span>
          </button>
        </div>

        {/* Pre-made Marketing Copy */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {language === 'bn' ? 'পোস্ট করার রেডিমেড ক্যাপশন:' : 'Ready-made Promo Caption:'}
            </label>
            <button
              onClick={handleCopyPromo}
              className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{language === 'bn' ? 'সম্পূর্ণ ক্যাপশন কপি করুন' : 'Copy Full Caption'}</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={5}
            value={promoCopy}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-sans focus:outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};
