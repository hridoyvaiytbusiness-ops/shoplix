import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  TrendingUp,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  LogOut,
  Package,
  Layers,
  CheckCircle,
  HelpCircle,
  SlidersHorizontal,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Product } from '../../types';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenResellerModal: () => void;
  onOpenAdminPanel: () => void;
  onOpenResellerDashboard: () => void;
  onOpenCustomerAccount: () => void;
  onOpenOrderTracker: () => void;
  onSelectCategory: (categoryId: string | null) => void;
  selectedCategory: string | null;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenCart,
  onOpenResellerModal,
  onOpenAdminPanel,
  onOpenResellerDashboard,
  onOpenCustomerAccount,
  onOpenOrderTracker,
  onSelectCategory,
  selectedCategory,
  products,
  onSelectProduct,
}) => {
  const { currentUser, userProfile, resellerProfile, isAdmin, isReseller, isApprovedReseller, logout } = useAuth();
  const { cartCount, wishlist, referralCode } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Search filtering
  const searchResults = searchQuery.trim().length > 1
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
      {/* Top Notification Bar */}
      <div className="bg-emerald-600 dark:bg-emerald-700 text-white text-xs py-1.5 px-4 font-medium transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              {language === 'bn' ? 'অফার' : 'Hot'}
            </span>
            <span>
              {language === 'bn'
                ? '🚚 সারাদেশে ক্যাশ অন ডেলিভারি | জিরো ইনভেস্টে রিসেলিং করুন ও আয় করুন!'
                : '🚚 Cash on Delivery Nationwide | Resell with Zero Capital & Earn!'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenOrderTracker}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t('trackOrder')}</span>
            </button>
            <span className="hidden md:inline">|</span>
            <div className="hidden md:flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>+৮৮০ ১৭০০-০০০০০০</span>
            </div>
            <span>|</span>
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 hover:text-emerald-100 font-semibold cursor-pointer"
              title="Toggle Bangla / English"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'English (EN)' : 'বাংলা (BN)'}</span>
            </button>
            <span>|</span>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 hover:text-emerald-100 cursor-pointer"
              title="Toggle Dark / Light Mode"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              onClick={() => onSelectCategory(null)}
              className="flex flex-col text-left group cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent group-hover:opacity-90">
                  SHOPLIX
                </span>
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  BD
                </span>
              </div>
              <span className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'স্মার্ট কেনাকাটা ও রিসেলিং' : 'Smart Shopping & Dropshipping'}
              </span>
            </button>
          </div>

          {/* Search Bar with Autocomplete */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/60 animate-in fade-in duration-150">
                <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {language === 'bn' ? 'পণ্য সাজেশন' : 'Suggested Products'}
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      setSearchQuery('');
                    }}
                    className="w-full p-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors cursor-pointer"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {language === 'bn' ? product.nameBn : product.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ৳{product.salePrice}
                        </span>
                        <span className="text-slate-400 line-through text-[11px]">
                          ৳{product.regularPrice}
                        </span>
                        <span className="text-teal-600 dark:text-teal-400 font-medium text-[11px] bg-teal-50 dark:bg-teal-950/60 px-1 rounded">
                          {language === 'bn' ? `লাভ ৳${product.resellerCommission}` : `Margin ৳${product.resellerCommission}`}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Referral badge if visitor arrived via reseller link */}
            {referralCode && (
              <div
                title="Referred by reseller"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full border border-amber-300 text-xs font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Ref: {referralCode}</span>
              </div>
            )}

            {/* Reseller Button / Status */}
            {isApprovedReseller ? (
              <button
                onClick={onOpenResellerDashboard}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full text-xs font-semibold shadow hover:shadow-md transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{t('resellerDashboard')}</span>
              </button>
            ) : resellerProfile?.status === 'pending' ? (
              <button
                onClick={onOpenResellerDashboard}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full text-xs font-medium border border-amber-300 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{language === 'bn' ? 'রিসেলার পেন্ডিং' : 'Reseller Pending'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenResellerModal}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-500 rounded-full text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{t('becomeReseller')}</span>
              </button>
            )}

            {/* Admin Panel button strictly for mridoyfb@gmail.com */}
            {isAdmin && currentUser?.email?.toLowerCase() === 'mridoyfb@gmail.com' && (
              <button
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full text-xs font-bold hover:opacity-90 shadow-sm cursor-pointer"
                title="Admin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span className="hidden sm:inline">{t('adminPanel')}</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={onOpenCustomerAccount}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('wishlist')}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all flex items-center gap-1.5 cursor-pointer"
              title={t('cart')}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-colors cursor-pointer"
                  >
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {language === 'bn' ? 'সাইন-ইন একাউন্ট' : 'Signed in as'}
                        </p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {currentUser.displayName || currentUser.email}
                        </p>
                      </div>

                      <div className="py-1 text-sm">
                        <button
                          onClick={() => {
                            onOpenCustomerAccount();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>{t('myAccount')}</span>
                        </button>

                        <button
                          onClick={() => {
                            onOpenCustomerAccount();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          <span>{t('myOrders')}</span>
                        </button>

                        {isApprovedReseller && (
                          <button
                            onClick={() => {
                              onOpenResellerDashboard();
                              setUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-2 cursor-pointer"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>{t('resellerDashboard')}</span>
                          </button>
                        )}

                        {isAdmin && currentUser?.email?.toLowerCase() === 'mridoyfb@gmail.com' && (
                          <button
                            onClick={() => {
                              onOpenAdminPanel();
                              setUserMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2 cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t('adminPanel')}</span>
                          </button>
                        )}

                        <a
                          href="/shoplix-ecommerce-source-code.zip"
                          download="shoplix-ecommerce-source-code.zip"
                          className="w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2 cursor-pointer text-xs"
                          onClick={() => setUserMenuOpen(false)}
                          title="Download Source Code ZIP"
                        >
                          <FileText className="w-4 h-4" />
                          <span>কোড ডাউনলোড (ZIP)</span>
                        </a>

                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                        <button
                          onClick={async () => {
                            await logout();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('login')}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
          {/* Mobile search suggestions */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
              {searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    setSearchQuery('');
                  }}
                  className="w-full p-2 flex items-center gap-2 text-left"
                >
                  <img src={product.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {language === 'bn' ? product.nameBn : product.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Categories Nav Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => onSelectCategory(null)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? '🔥 সকল পণ্য' : '🔥 All Catalog'}
            </button>
            <button
              onClick={() => onSelectCategory('electronics')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'electronics'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'স্মার্ট গ্যাজেট' : 'Gadgets & Tech'}
            </button>
            <button
              onClick={() => onSelectCategory('watches')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'watches'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'স্মার্ট ওয়াচ' : 'Smart Watches'}
            </button>
            <button
              onClick={() => onSelectCategory('fashion-men')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'fashion-men'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'ছেলেদের ফ্যাশন' : "Men's Fashion"}
            </button>
            <button
              onClick={() => onSelectCategory('fashion-women')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'fashion-women'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'মেয়েদের পোশাক' : "Women's Collection"}
            </button>
            <button
              onClick={() => onSelectCategory('bags-accessories')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'bags-accessories'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'ব্যাগ ও লাগেজ' : 'Bags & Travel'}
            </button>
            <button
              onClick={() => onSelectCategory('home-kitchen')}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'home-kitchen'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'হোম ও কিচেন' : 'Home & Living'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3">
          <div className="flex flex-col gap-2 font-medium text-sm">
            <button
              onClick={() => {
                onSelectCategory(null);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('home')}
            </button>
            <button
              onClick={() => {
                if (isApprovedReseller) onOpenResellerDashboard();
                else onOpenResellerModal();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/40"
            >
              {isApprovedReseller ? t('resellerDashboard') : t('becomeReseller')}
            </button>
            <button
              onClick={() => {
                onOpenCustomerAccount();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('myOrders')}
            </button>
            <button
              onClick={() => {
                onOpenOrderTracker();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('trackOrder')}
            </button>
            {isAdmin && currentUser?.email?.toLowerCase() === 'mridoyfb@gmail.com' && (
              <button
                onClick={() => {
                  onOpenAdminPanel();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-3 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40"
              >
                {t('adminPanel')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
