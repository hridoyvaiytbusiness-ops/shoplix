import React from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onOpenResellerModal: () => void;
  onOpenOrderTracker: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenResellerModal, onOpenOrderTracker }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* 4 Feature Value Pillars */}
      <div className="border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'সারাদেশে ক্যাশ অন ডেলিভারি' : 'Nationwide COD'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ' : 'Pay when you receive package'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/70 border border-teal-800 text-teal-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'জিরো ইনভেস্টে রিসেলিং' : 'Zero Capital Reselling'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'বিকাশ ও নগদে সরাসরি প্রফিট' : 'Weekly bKash/Nagad payouts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? 'সহজ রিটার্ন পলিসি' : 'Easy 7 Days Return'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'ত্রুটিপূর্ণ পণ্য ফেরত সুবিধা' : 'Hassle-free replacement'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-950/70 border border-teal-800 text-teal-400 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'bn' ? '২৪/৭ কাস্টমার সাপোর্ট' : '24/7 Dedicated Support'}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'কল অথবা হোয়াটসঅ্যাপে সাহায্য' : 'Always ready to help you'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                SHOPLIX
              </span>
              <span className="bg-emerald-900/60 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-700">
                BANGLADESH
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'শপলিক্স বাংলাদেশের অন্যতম শীর্ষস্থানীয় ড্রপশিপিং ও ই-কমার্স প্ল্যাটফর্ম। কাস্টমারদের জন্য মানসম্মত পণ্য আর উদ্যোক্তা ও রিসেলারদের জন্য ঘরে বসে নিশ্চিত উপার্জনের সেরা মাধ্যম।'
                : 'Shoplix is Bangladesh’s premier dropshipping and e-commerce reselling ecosystem. Empowering thousands of digital entrepreneurs to earn without inventory.'}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={onOpenResellerModal}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {t('becomeReseller')}
              </button>
              <button
                onClick={onOpenOrderTracker}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {t('trackOrder')}
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">
                  {t('home')}
                </button>
              </li>
              <li>
                <button onClick={onOpenResellerModal} className="hover:text-emerald-400 transition-colors">
                  {language === 'bn' ? 'রিসেলার রেজিস্ট্রেশন গাইড' : 'Reseller Registration Guide'}
                </button>
              </li>
              <li>
                <button onClick={onOpenOrderTracker} className="hover:text-emerald-400 transition-colors">
                  {t('trackOrder')}
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  {language === 'bn' ? 'কীভাবে আয় করবেন?' : 'How to Earn Money?'}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  {t('faqTitle')}
                </a>
              </li>
            </ul>
          </div>

          {/* Policies & Payouts */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === 'bn' ? 'পেমেন্ট ও পলিসি' : 'Payments & Policies'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>{language === 'bn' ? 'বিকাশ ও নগদ পেমেন্ট গেটওয়ে' : 'bKash & Nagad Direct Settlement'}</li>
              <li>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি (সারাদেশ)' : 'Nationwide Cash on Delivery (COD)'}</li>
              <li>{language === 'bn' ? 'উত্তোলন পলিসি (নূন্যতম ৫০০ টাকা)' : 'Withdrawal Policy (Min ৳500)'}</li>
              <li>{language === 'bn' ? 'প্রাইভেসি পলিসি ও শর্তাবলী' : 'Terms & Conditions'}</li>
              <li>{language === 'bn' ? 'সাপ্লায়ার পার্টনারশিপ' : 'Supplier Dropship Enrollment'}</li>
            </ul>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-1 bg-pink-950 text-pink-400 rounded border border-pink-800">
                bKash
              </span>
              <span className="text-[10px] font-bold px-2 py-1 bg-orange-950 text-orange-400 rounded border border-orange-800">
                Nagad
              </span>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                COD
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('contactUs')}
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{t('officeAddress')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('phone')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{t('email')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SHOPLIX. {t('allRightsReserved')}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/shoplix-ecommerce-source-code.zip"
              download="shoplix-ecommerce-source-code.zip"
              className="text-purple-400 hover:text-purple-300 font-bold underline flex items-center gap-1 cursor-pointer"
              title="Download Entire Project Source Code ZIP"
            >
              📦 প্রজেক্ট কোড ডাউনলোড (ZIP)
            </a>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span>Bangladesh’s Reselling & Dropshipping Hub</span>
            <span className="text-emerald-500">v1.0 (Live Firebase Backend)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
