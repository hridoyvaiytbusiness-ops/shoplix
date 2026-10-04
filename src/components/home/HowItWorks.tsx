import React from 'react';
import { UserCheck, Share2, ShoppingCart, ArrowDownRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface HowItWorksProps {
  onOpenResellerModal: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onOpenResellerModal }) => {
  const { language, t } = useLanguage();

  const steps = [
    {
      num: '১',
      enNum: '1',
      title: t('step1Title'),
      desc: t('step1Desc'),
      icon: <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      num: '২',
      enNum: '2',
      title: t('step2Title'),
      desc: t('step2Desc'),
      icon: <Share2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      color: 'bg-teal-50 dark:bg-teal-950/60',
    },
    {
      num: '৩',
      enNum: '3',
      title: t('step3Title'),
      desc: t('step3Desc'),
      icon: <ShoppingCart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      num: '৪',
      enNum: '4',
      title: t('step4Title'),
      desc: t('step4Desc'),
      icon: <ArrowDownRight className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      color: 'bg-pink-50 dark:bg-pink-950/60',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            {language === 'bn' ? 'সহজ কাজের পদ্ধতি' : 'Zero Risk Business'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {t('howItWorksSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs relative flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${step.color}`}>
                    {step.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-700">
                    {language === 'bn' ? step.num : step.enNum}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onOpenResellerModal}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t('startResellingBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
