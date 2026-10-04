import React from 'react';
import { Category } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Smartphone, Shirt, ShoppingBag, Watch, Briefcase, Home } from 'lucide-react';

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Smartphone':
      return <Smartphone className="w-6 h-6" />;
    case 'Shirt':
      return <Shirt className="w-6 h-6" />;
    case 'ShoppingBag':
      return <ShoppingBag className="w-6 h-6" />;
    case 'Watch':
      return <Watch className="w-6 h-6" />;
    case 'Briefcase':
      return <Briefcase className="w-6 h-6" />;
    default:
      return <Home className="w-6 h-6" />;
  }
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
            {language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Browse by Department'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('categoriesTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('categoriesSubtitle')}
          </p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
          >
            {language === 'bn' ? 'সকল ক্যাটাগরি দেখুন' : 'Show All Categories'} →
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`group p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500 hover:shadow-md'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
              </div>
              <span className="text-xs font-bold leading-tight">
                {language === 'bn' ? cat.nameBn : cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
