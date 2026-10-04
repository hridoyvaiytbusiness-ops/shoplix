import React, { useState } from 'react';
import {
  ChevronDown,
  Star,
  Quote,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TestimonialsAndFaq: React.FC = () => {
  const { language, t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const testimonials = [
    {
      name: 'সাদিয়া আক্তার',
      role: 'অনলাইন উদ্যোক্তা, চট্টগ্রাম',
      text: 'শপলিক্সের মাধ্যমে আমার কোনো পুঁজি ছাড়াই নিজের পেজ শুরু করেছি। পণ্য প্যাকেজিং বা ডেলিভারির ঝামেলা আমাকে নিতে হয় না। প্রতি সপ্তাহে বিকাশ একাউন্টে টাকা পাই!',
      rating: 5,
    },
    {
      name: 'তানভীর আহমেদ',
      role: 'স্টুডেন্ট ও রিসেলার, ঢাকা',
      text: 'কলেজের পড়াশোনার পাশাপাশি পার্ট-টাইম রিসেলিং করি। গত মাসে শপলিক্স থেকে আমার প্রায় ১৮,৫০০ টাকা কমিশন এসেছে। বিশেষ করে ওয়াচ ও গ্যাজেট আইটেমগুলো সবচেয়ে ভালো বিক্রি হয়।',
      rating: 5,
    },
    {
      name: 'মাহমুদুল হাসান',
      role: 'ড্রপশিপার, সিলেট',
      text: 'কাস্টমারের ঠিকানায় সরাসরি ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা থাকায় কাস্টমারদের কোনো অবিশ্বাস থাকে না। তাদের কাস্টমার সাপোর্ট টিম যেকোনো সমস্যায় খুব দ্রুত সাহায্য করে।',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'রিসেলিং শুরু করতে কি কোনো টাকা বা অগ্রিম ইনভেস্টমেন্ট প্রয়োজন?',
      a: 'একদমই না! শপলিক্সে রিসেলার হিসেবে রেজিস্ট্রেশন সম্পূর্ণ ফ্রি। পণ্য স্টক বা অগ্রিম কেনা ছাড়াই আপনি সরাসরি নিজের নির্ধারিত লাভ রেখে বিক্রি শুরু করতে পারেন।',
    },
    {
      q: 'কাস্টমারদের কাছে পণ্য কীভাবে ডেলিভারি হয়?',
      a: 'আপনি শুধু আমাদের ওয়েবসাইটে কাস্টমারের নাম, ফোন ও ঠিকানা দিয়ে অর্ডারটি প্লেস করবেন। বাকি প্যাকেজিং ও সারাদেশে হোম ডেলিভারি ক্যাশ অন ডেলিভারি (COD) মাধ্যমে আমরা সম্পন্ন করব।',
    },
    {
      q: 'রিসেলিং কমিশন কখন এবং কীভাবে তোলা যায়?',
      a: 'কাস্টমার পণ্যটি গ্রহণ করে টাকা পরিশোধ করার সাথে সাথে আপনার কমিশন ব্যালেন্সে যুক্ত হবে। নূন্যতম ৫০০ টাকা হলে আপনি সরাসরি বিকাশ বা নগদ একাউন্টে ক্যাশ-আউট রিকোয়েস্ট দিতে পারবেন।',
    },
    {
      q: 'ডেলিভারি চার্জ কত এবং কারা বহন করবে?',
      a: 'ঢাকার ভেতরে ডেলিভারি চার্জ ৭০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা। এটি অর্ডারের সময় কাস্টমারের টোটাল ইনভয়েসে যুক্ত হয়।',
    },
    {
      q: 'কাস্টমার যদি পণ্য ফেরত (Return) দিতে চায়?',
      a: 'পণ্য কোনো ত্রুটি বা সমস্যার কারণে ফেরত এলে ৭ দিনের মধ্যে সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি প্রযোজ্য।',
    },
  ];

  return (
    <section id="faq" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Testimonials */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            {language === 'bn' ? 'বাস্তব অভিজ্ঞতা' : 'Success Stories'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('reviewsTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  &ldquo;{test.text}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                  {test.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{test.name}</h4>
                  <span className="text-[11px] text-slate-400 block">{test.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('faqTitle')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
