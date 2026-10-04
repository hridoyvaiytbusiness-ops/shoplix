import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Share2,
  TrendingUp,
  Sparkles,
  Check,
  Heart,
  Tag,
  Hash,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onShare: (product: Product) => void;
  onOpenResellerModal: () => void;
  onDirectOrder?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onShare,
  onDirectOrder,
}) => {
  if (!product) return null;

  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { language } = useLanguage();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<number>(product.salePrice);
  const [showAddedBanner, setShowAddedBanner] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setCustomPrice(product.salePrice || product.resellerBasePrice || 1000);
    }
  }, [product]);

  const isFavorited = isInWishlist(product.id);
  const basePrice = product.resellerBasePrice || product.salePrice;
  const maxPrice = product.maxSalePrice || product.regularPrice || product.salePrice;
  const skuCode = product.sku || product.id;
  const calculatedProfitPerPiece = Math.max(0, customPrice - basePrice);
  const totalProfit = calculatedProfitPerPiece * quantity;

  const handleOrderNow = () => {
    addToCart(
      product,
      quantity,
      selectedSize,
      selectedColor,
      customPrice
    );
    if (onDirectOrder) {
      onDirectOrder();
    } else {
      setShowAddedBanner(true);
      setTimeout(() => setShowAddedBanner(false), 2000);
      onClose();
    }
  };

  const handleAddToCartOnly = () => {
    addToCart(
      product,
      quantity,
      selectedSize,
      selectedColor,
      customPrice
    );
    setShowAddedBanner(true);
    setTimeout(() => setShowAddedBanner(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {showAddedBanner && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4">
            <Check className="w-4 h-4" />
            <span>অর্ডার তালিকায় সফলভাবে যোগ করা হয়েছে!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
            <div className="aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                  isFavorited
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 max-w-full">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                      selectedImage === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Exact Layout as Specified by User */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-emerald-600 uppercase tracking-wider">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {product.rating}
                  </span>
                  <span className="text-slate-400">({product.reviewsCount} রিভিউ)</span>
                </div>
              </div>

              {/* Product Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                {product.nameBn || product.name}
              </h2>

              {/* 1. প্রাইস (Price) */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                    প্রাইস
                  </span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    ৳{basePrice.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 rounded-md">
                  হোলসেল রেট
                </span>
              </div>

              {/* 2. প্রোডাক্টির বিক্রয় মূল্য সর্বোচ্চ (Max Selling Price) */}
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  প্রোডাক্টির বিক্রয় মূল্য সর্বোচ্চ:
                </span>
                <span className="font-black text-slate-900 dark:text-white text-sm">
                  ৳{maxPrice.toLocaleString()}
                </span>
              </div>

              {/* 3. SKU কোড */}
              <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  SKU কোড:
                </span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {skuCode}
                </span>
              </div>

              {/* 4. সাইজ (Size selection) */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    সাইজ:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color selection if available */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    কালার:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. পরিমান/পিস (Quantity / Pieces) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  পরিমান / পিস:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-black text-xs text-slate-800 dark:text-slate-100 min-w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold">
                    স্টকে আছে ({product.stock} পিস)
                  </span>
                </div>
              </div>

              {/* 6. বিক্রয়-মূল্য (Selling Price & Margin Calculation) */}
              <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-teal-900 dark:text-teal-200">
                    বিক্রয়-মূল্য (আপনি কত টাকায় বিক্রি করছেন):
                  </label>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    আপনার মোট লাভ: ৳{totalProfit.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">৳</span>
                  <input
                    type="number"
                    min={basePrice}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-xl text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500">
                  <span>বেস মূল্য: ৳{basePrice}</span>
                  <span>প্রতি পিসে লাভ: ৳{calculatedProfitPerPiece}</span>
                </div>
              </div>
            </div>

            {/* 7. অর্ডার করুন বাটন (Order Now Action) */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleOrderNow}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:opacity-95 text-white rounded-2xl text-sm sm:text-base font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>অর্ডার করুন (৳{(customPrice * quantity).toLocaleString()})</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddToCartOnly}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>কার্টে যোগ করুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => onShare(product)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>লিংক শেয়ার করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
