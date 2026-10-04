import React from 'react';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface HeroBannerProps {
  onStartShopping: () => void;
  onOpenResellerModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartShopping,
  onOpenResellerModal,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-950 text-white py-12 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Headlines & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'bn'
                ? 'বাংলাদেশের #১ বিশ্বস্ত রিসেলিং ও ড্রপশিপিং প্ল্যাটফর্ম'
                : 'Bangladesh’s #1 Trusted Reselling & Dropshipping Hub'}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            {language === 'bn' ? (
              <>
                ঘরে বসে পণ্য <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">রিসেল</span> করুন, নিশ্চিত লাভ বুঝে নিন
              </>
            ) : (
              <>
                Resell Products Online & <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Earn</span> from Home
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
            {language === 'bn'
              ? 'জিরো ইনভেস্টমেন্টে শুরু করুন আপনার নিজস্ব অনলাইন ব্যবসা। পণ্য সোর্সিং, কোয়ালিটি চেক ও সারাদেশে ক্যাশ অন ডেলিভারি আমাদের দায়িত্বে—আপনি শুধু বিক্রি করে বিকাশ বা নগদে কমিশন গ্রহণ করুন।'
              : 'Launch your risk-free online business today. We supply high demand products, handle warehouse fulfillment & collect cash on delivery across Bangladesh.'}
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={onOpenResellerModal}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('startResellingBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartShopping}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md font-bold rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>{t('startShoppingBtn')}</span>
            </button>
          </div>

          {/* Quick Value Metrics */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0 text-left">
            <div>
              <span className="text-2xl font-black text-emerald-400">৳০</span>
              <span className="block text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'কোনো অগ্রিম পুঁজি লাগে না' : 'Zero Investment'}
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-teal-300">৬৪</span>
              <span className="block text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'জেলায় হোম ডেলিভারি' : 'Districts Covered'}
              </span>
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-400">২৪/৭</span>
              <span className="block text-[11px] text-slate-400 font-medium">
                {language === 'bn' ? 'বিকাশ ও নগদ উইথড্র' : 'Fast Payouts'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Visual Showcase */}
        <div className="lg:col-span-5 relative mt-6 lg:mt-0">
          <div className="relative mx-auto max-w-sm sm:max-w-md">
            {/* Main Featured Mockup Image */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-800">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=80"
                alt="Shopping on Shoplix"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Card 1: Reseller Margin badge */}
            <div className="absolute -top-4 -left-4 sm:-left-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-left-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  {language === 'bn' ? 'গ্যারান্টেড প্রফিট' : 'Reseller Profit'}
                </span>
                <span className="text-sm font-black text-emerald-600">
                  ৳১৫০ – ৳৮০০ / পণ্য
                </span>
              </div>
            </div>

            {/* Floating Card 2: Cash Payout badge */}
            <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-right-4">
              <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  {language === 'bn' ? 'কমিশন উত্তোলন' : 'Instant Payout'}
                </span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  বিকাশ ও নগদ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
