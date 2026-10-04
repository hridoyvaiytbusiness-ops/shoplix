import React from 'react';
import { Heart, ShoppingBag, Share2, Star, TrendingUp, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onShare: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onShare }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { language, t } = useLanguage();
  const { isReseller, isApprovedReseller } = useAuth();

  const isFavorited = isInWishlist(product.id);
  const discountAmount = product.regularPrice - product.salePrice;
  const discountPercent = Math.round((discountAmount / product.regularPrice) * 100);

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {discountPercent}% {t('off')}
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              {t('bestSellerBadge')}
            </span>
          )}
        </div>

        {/* Wishlist & Share buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isFavorited
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-rose-600'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(product);
            }}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all shadow-sm cursor-pointer"
            title="Share & Earn Profit"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Stock warning */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2 text-center bg-amber-500/90 text-white text-[10px] font-bold py-0.5 rounded backdrop-blur-sm">
            {language === 'bn' ? `মাত্র ${product.stock} টি স্টকে অবশিষ্ট!` : `Only ${product.stock} items left!`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="capitalize text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {product.subCategory || product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                {product.rating}
              </span>
              <span className="text-slate-400 text-[10px]">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer mb-2"
          >
            {language === 'bn' ? product.nameBn : product.name}
          </h3>

          {/* Pricing */}
          <div className="space-y-1 mb-2">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-slate-500">প্রাইস:</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  ৳{(product.resellerBasePrice || product.salePrice).toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded font-bold">
                {product.sku || 'SKU'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>সর্বোচ্চ বিক্রয় মূল্য:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                ৳{(product.maxSalePrice || product.regularPrice).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => addToCart(product, 1)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('addToCart')}</span>
          </button>

          <button
            onClick={() => onSelect(product)}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{t('buyNow')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
