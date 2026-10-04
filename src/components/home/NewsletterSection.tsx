import React, { useState } from 'react';
import { Mail, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const NewsletterSection: React.FC = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>{language === 'bn' ? 'স্পেশাল ডিসকাউন্ট ও হোলসেল অফার' : 'Wholesale Offers & Discounts'}</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-black">
          {language === 'bn'
            ? 'নতুন প্রোডাক্ট ও স্পেশাল অফারের আপডেট পেতে যুক্ত থাকুন'
            : 'Subscribe for New Drops & Highest Margin Alerts'}
        </h3>

        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
          {language === 'bn'
            ? 'আমাদের ইমেইল নিউজলেটারে সাবস্ক্রাইব করুন এবং প্রতি সপ্তাহে ট্রেন্ডিং হোলসেল আইটেমের তালিকা পান।'
            : 'Get exclusive access to high-margin wholesale deals directly in your inbox.'}
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-2xl font-bold text-xs shadow-lg animate-in zoom-in-50">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল অ্যাড্রেস লিখুন"
              className="flex-1 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-xs focus:outline-none shadow-md font-medium"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
            >
              সাবস্ক্রাইব
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
