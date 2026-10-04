import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { OrderTrackerModal } from './components/common/OrderTrackerModal';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryGrid } from './components/home/CategoryGrid';
import { HowItWorks } from './components/home/HowItWorks';
import { ResellerPitch } from './components/home/ResellerPitch';
import { TestimonialsAndFaq } from './components/home/TestimonialsAndFaq';
import { NewsletterSection } from './components/home/NewsletterSection';
import { ProductCard } from './components/product/ProductCard';
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { ResellerShareModal } from './components/product/ResellerShareModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { OrderSuccessModal } from './components/cart/OrderSuccessModal';
import { ResellerRegistrationModal } from './components/reseller/ResellerRegistrationModal';
import { ResellerDashboard } from './components/reseller/ResellerDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { Product, Category, Order } from './types';
import { fetchProducts, fetchCategories, seedInitialDataIfNeeded } from './services/storeService';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data/seedData';

function MainShop() {
  const { language, t } = useLanguage();
  const { currentUser, isApprovedReseller, isAdmin, resellerProfile } = useAuth();
  const { referralCode } = useCart();

  // Data states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Filters & sorting
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'margin'>('featured');

  // Modal triggers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);
  const [resellerModalOpen, setResellerModalOpen] = useState(false);
  const [resellerDashboardOpen, setResellerDashboardOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [customerAccountOpen, setCustomerAccountOpen] = useState(false);
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);

  const loadCatalog = async () => {
    try {
      await seedInitialDataIfNeeded();
      const [prodList, catList] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(prodList);
      setCategories(catList);
    } catch (e) {
      console.warn('Catalog load note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Filtered & Sorted products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.salePrice - b.salePrice;
    if (sortBy === 'price-high') return b.salePrice - a.salePrice;
    if (sortBy === 'margin') return b.resellerCommission - a.resellerCommission;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const featuredProducts = products.filter((p) => p.isFeatured || p.isBestSeller).slice(0, 8);
  const trendingProducts = products.filter((p) => p.isTrending).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        onOpenResellerModal={() => setResellerModalOpen(true)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
        onOpenResellerDashboard={() => setResellerDashboardOpen(true)}
        onOpenCustomerAccount={() => {
          if (!currentUser) setAuthModalOpen(true);
          else setCustomerAccountOpen(true);
        }}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <main className="flex-1">
        {/* If no specific category is selected, display complete vibrant Homepage */}
        {!selectedCategory ? (
          <>
            {/* Hero Banner */}
            <HeroBanner
              onStartShopping={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenResellerModal={() => {
                if (isApprovedReseller) setResellerDashboardOpen(true);
                else setResellerModalOpen(true);
              }}
            />

            {/* Product Categories */}
            <CategoryGrid
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Featured Collection Section */}
            <section id="catalog-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    {language === 'bn' ? 'টপ কোয়ালিটি' : 'Curated Picks'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {t('featuredTitle')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('featuredSubtitle')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onShare={(p) => setShareProduct(p)}
                  />
                ))}
              </div>
            </section>

            {/* High Reseller Margin Spotlight Banner */}
            <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-800">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-400/20 rounded-full text-xs font-bold text-teal-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'সর্বোচ্চ রিসেলিং প্রফিট' : 'Top Commission Items'}</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black">
                    {language === 'bn'
                      ? 'প্রতি অর্ডারে সর্বোচ্চ ৳৮০০ পর্যন্ত নিশ্চিত লাভ!'
                      : 'Earn up to ৳800 per delivery without stocking inventory'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    {language === 'bn'
                      ? 'শপলিক্স রিসেলার ক্যাটালগের সেরা পণ্যগুলো বিক্রি করে বিকাশ ও নগদে সরাসরি টাকা বুঝে নিন।'
                      : 'Share products with friends, Facebook groups or TikTok and receive automated weekly payouts.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (isApprovedReseller) setResellerDashboardOpen(true);
                    else setResellerModalOpen(true);
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black rounded-2xl text-xs sm:text-sm hover:opacity-95 shadow-lg transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{isApprovedReseller ? t('resellerDashboard') : t('startResellingBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Trending & Best Selling Items */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
                <div>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
                    {language === 'bn' ? 'বেস্ট সেলিং' : 'High Conversion'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {t('trendingTitle')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('trendingSubtitle')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onShare={(p) => setShareProduct(p)}
                  />
                ))}
              </div>
            </section>

            {/* How It Works */}
            <HowItWorks
              onOpenResellerModal={() => {
                if (isApprovedReseller) setResellerDashboardOpen(true);
                else setResellerModalOpen(true);
              }}
            />

            {/* Reseller Pitch */}
            <ResellerPitch
              onOpenResellerModal={() => {
                if (isApprovedReseller) setResellerDashboardOpen(true);
                else setResellerModalOpen(true);
              }}
            />

            {/* Social Proof & FAQs */}
            <TestimonialsAndFaq />

            {/* Newsletter */}
            <NewsletterSection />
          </>
        ) : (
          /* Category Filtered View */
          <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Breadcrumb & Filter header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="hover:text-emerald-600"
                  >
                    হোম
                  </button>
                  <span>/</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                    {selectedCategory}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
                  {categories.find((c) => c.id === selectedCategory)?.nameBn || selectedCategory}
                </h1>
                <span className="text-xs text-slate-500">
                  {filteredProducts.length} টি পণ্য পাওয়া গেছে
                </span>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>সাজান:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">জনপ্রিয় (Featured)</option>
                  <option value="margin">সর্বোচ্চ লাভ (Highest Margin)</option>
                  <option value="price-low">মূল্য: কম থেকে বেশি</option>
                  <option value="price-high">মূল্য: বেশি থেকে কম</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {sortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Package className="w-12 h-12 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">
                  এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই।
                </p>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                >
                  সকল পণ্য দেখুন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                    onShare={(p) => setShareProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenResellerModal={() => {
          if (isApprovedReseller) setResellerDashboardOpen(true);
          else setResellerModalOpen(true);
        }}
        onOpenOrderTracker={() => setOrderTrackerOpen(true)}
      />

      {/* MODALS */}
      {/* 1. Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onCheckout={() => setCheckoutModalOpen(true)}
      />

      {/* 3. Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={(order) => {
          setCompletedOrder(order);
          setOrderSuccessModalOpen(true);
        }}
      />

      {/* 4. Order Success Modal */}
      <OrderSuccessModal
        isOpen={orderSuccessModalOpen}
        order={completedOrder}
        onClose={() => setOrderSuccessModalOpen(false)}
        onTrackOrder={(ord) => {
          setOrderTrackerOpen(true);
        }}
      />

      {/* 5. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onShare={(p) => setShareProduct(p)}
        onOpenResellerModal={() => setResellerModalOpen(true)}
        onDirectOrder={() => {
          setSelectedProduct(null);
          setCheckoutModalOpen(true);
        }}
      />

      {/* 6. Reseller Share Modal */}
      <ResellerShareModal
        product={shareProduct}
        isOpen={!!shareProduct}
        onClose={() => setShareProduct(null)}
        onOpenResellerModal={() => setResellerModalOpen(true)}
      />

      {/* 7. Reseller Registration Modal */}
      <ResellerRegistrationModal
        isOpen={resellerModalOpen}
        onClose={() => setResellerModalOpen(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* 8. Reseller Dashboard */}
      {resellerDashboardOpen && (
        <ResellerDashboard
          products={products}
          onClose={() => setResellerDashboardOpen(false)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onShareProduct={(p) => setShareProduct(p)}
        />
      )}

      {/* 9. Admin Panel (Strictly guarded for mridoyfb@gmail.com only) */}
      {adminPanelOpen && isAdmin && currentUser?.email?.toLowerCase() === 'mridoyfb@gmail.com' && (
        <AdminPanel
          isOpen={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          onRefreshProducts={loadCatalog}
        />
      )}

      {/* 10. Customer Dashboard */}
      <CustomerDashboard
        isOpen={customerAccountOpen}
        onClose={() => setCustomerAccountOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenResellerModal={() => {
          setCustomerAccountOpen(false);
          setResellerModalOpen(true);
        }}
        onOpenResellerDashboard={() => {
          setCustomerAccountOpen(false);
          setResellerDashboardOpen(true);
        }}
      />

      {/* 11. Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={orderTrackerOpen}
        onClose={() => setOrderTrackerOpen(false)}
        initialOrder={completedOrder}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <MainShop />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
