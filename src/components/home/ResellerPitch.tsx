import React from 'react';
import { CheckCircle2, TrendingUp, ShieldCheck, ArrowRight, Zap, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ResellerPitchProps {
  onOpenResellerModal: () => void;
}

export const ResellerPitch: React.FC<ResellerPitchProps> = ({ onOpenResellerModal }) => {
  const { language, t } = useLanguage();

  const benefits = [
    {
      title: t('pitchPoint1'),
      desc: language === 'bn' ? 'কোনো গোডাউন ভাড়া বা ইনভেন্টরি কিনতে হবে না। আমরা সব পণ্য সরাসরি সরবরাহ করব।' : 'Zero warehouse rental or pre-purchased stock required.',
    },
    {
      title: t('pitchPoint2'),
      desc: language === 'bn' ? 'ঢাকা ও ঢাকার বাইরে ৬৪ জেলায় দ্রুততম কুরিয়ার হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সাপোর্ট।' : 'Nationwide 24-72 hours cash on delivery fulfillment.',
    },
    {
      title: t('pitchPoint3'),
      desc: language === 'bn' ? 'নূন্যতম ৫০০ টাকা হলেই সরাসরি পার্সোনাল বিকাশ বা নগদ ওয়ালেটে কমিশন ট্রান্সফার।' : 'Withdraw balance anytime directly to personal bKash/Nagad.',
    },
    {
      title: t('pitchPoint4'),
      desc: language === 'bn' ? 'পণ্যমূল্য আপনি নির্ধারণ করবেন—বেস প্রাইসের উপরে নিজের ইচ্ছামতো লাভ রেখে বিক্রি করুন।' : 'Full freedom to mark up selling prices and maximize earnings.',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-bold border border-teal-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'উদ্যোক্তাদের সেরা সুযোগ' : 'Built for Resellers'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black leading-tight">
            {t('resellerPitchTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'শপলিক্স আপনাকে দেয় সরাসরি পাইকারি মূল্যে পণ্য রিসেল করার দুর্দান্ত সুযোগ। কোনো পণ্য কেনার প্রয়োজন নেই—ছবি ও বিবরণ নিয়ে ফেসবুকে বা বন্ধুদের মাঝে শেয়ার করুন এবং অর্ডার পেলে লাভ বুঝে নিন।'
              : 'Empower your sales with certified manufacturers and verified inventory. You make the sale, we ship and collect the cash.'}
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenResellerModal}
              className="px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-lg hover:shadow-emerald-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('startResellingBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3.5"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white mb-0.5">{b.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
