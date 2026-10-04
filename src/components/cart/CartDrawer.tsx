import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryCharge,
    discount,
    total,
    couponCode,
    applyCoupon,
    couponError,
    referralCode,
  } = useCart();
  const { language, t } = useLanguage();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon(inputCoupon);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {language === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'} ({cart.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Referral Banner if present */}
          {referralCode && (
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>
                {language === 'bn'
                  ? `রিসেলার রেফারাল প্রযোজ্য: ${referralCode}`
                  : `Attributed to Reseller Ref: ${referralCode}`}
              </span>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t('cartEmpty')}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  {t('startShoppingBtn')}
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const itemPrice = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.salePrice;
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl relative"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-white flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {language === 'bn' ? item.product.nameBn : item.product.name}
                      </h4>

                      {/* Variations */}
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          ৳{itemPrice.toLocaleString()}
                        </span>

                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedSize,
                                item.selectedColor
                              )
                            }
                            className="px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() =>
                        removeFromCart(item.product.id, item.selectedSize, item.selectedColor)
                      }
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Coupon & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="কুপন কোড (যেমন: SHOPLIX10)"
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  প্রয়োগ
                </button>
              </form>

              {couponError && <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>}
              {couponCode && (
                <p className="text-[11px] text-emerald-600 font-bold">
                  কুপন &apos;{couponCode}&apos; সফলভাবে সক্রিয় হয়েছে!
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('deliveryCharge')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">৳{deliveryCharge}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2">
                  <span>{t('total')}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('checkout')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
