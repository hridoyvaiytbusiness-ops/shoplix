import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  ArrowDownRight,
  Package,
  Share2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Layers,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product, Order, Withdrawal, Transaction, Reseller } from '../../types';
import {
  fetchResellerOrders,
  fetchResellerWithdrawals,
  fetchResellerTransactions,
  getResellerByUserId,
} from '../../services/storeService';
import { WithdrawalModal } from './WithdrawalModal';

interface ResellerDashboardProps {
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onShareProduct: (product: Product) => void;
}

export const ResellerDashboard: React.FC<ResellerDashboardProps> = ({
  products,
  onClose,
  onSelectProduct,
  onShareProduct,
}) => {
  const { resellerProfile, currentUser, refreshProfiles } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'catalog' | 'orders' | 'wallet' | 'transactions'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // In case resellerProfile is still loading or using demo
  const reseller: Reseller = resellerProfile || {
    id: currentUser?.uid || 'demo-reseller',
    userId: currentUser?.uid || 'demo-reseller',
    resellerCode: 'SLX-DEMO',
    shopName: 'Shoplix Demo Store',
    fullName: currentUser?.displayName || 'Reseller Partner',
    email: currentUser?.email || 'reseller@shoplix.com.bd',
    phoneNumber: '01700-112233',
    status: 'approved',
    paymentMethod: 'bKash',
    payoutNumber: '01700-112233',
    address: 'Dhaka, Bangladesh',
    totalSales: 18450,
    totalOrders: 14,
    totalEarnings: 4200,
    availableBalance: 2450,
    pendingEarnings: 850,
    withdrawnBalance: 900,
    createdAt: new Date().toISOString(),
  };

  const loadData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [oList, wList, tList] = await Promise.all([
        fetchResellerOrders(currentUser.uid),
        fetchResellerWithdrawals(currentUser.uid),
        fetchResellerTransactions(currentUser.uid),
      ]);
      setOrders(oList);
      setWithdrawals(wList);
      setTransactions(tList);
    } catch (e) {
      console.warn('Dashboard data fetch note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const storeReferralUrl = `${window.location.origin}?ref=${reseller.resellerCode}`;

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(storeReferralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Mock weekly performance trend for analytics chart
  const weeklyTrend = [
    { day: 'শনি (Sat)', sales: 3200, profit: 850 },
    { day: 'রবি (Sun)', sales: 4500, profit: 1100 },
    { day: 'সোম (Mon)', sales: 2800, profit: 650 },
    { day: 'মঙ্গল (Tue)', sales: 5100, profit: 1250 },
    { day: 'বুধ (Wed)', sales: 3900, profit: 900 },
    { day: 'বৃহ (Thu)', sales: 6200, profit: 1450 },
    { day: 'শুক্র (Fri)', sales: 7400, profit: 1800 },
  ];

  const maxSale = Math.max(...weeklyTrend.map((t) => t.sales));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {reseller.shopName || 'রিসেলার ড্যাশবোর্ড'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  ID: {reseller.resellerCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {reseller.status === 'approved' ? '✓ Verified Partner' : reseller.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'উপার্জন ও কাস্টমার অর্ডার সরাসরি নিয়ন্ত্রণ করুন'
                  : 'Manage your dropship orders, earnings & bKash/Nagad payouts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unique Store Link Button */}
            <button
              onClick={handleCopyStoreLink}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'স্টোর লিংক কপি'}</span>
            </button>

            {/* Withdraw Button */}
            <button
              onClick={() => setWithdrawalModalOpen(true)}
              disabled={reseller.availableBalance < 500}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>{t('withdrawMoney')} (৳{reseller.availableBalance})</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 flex gap-2 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📊 {language === 'bn' ? 'ওভারভিউ ও অ্যানালিটিক্স' : 'Overview & Analytics'}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            🛍️ {t('resellerProducts')}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📦 {t('referredOrders')} ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'wallet'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            💳 {language === 'bn' ? 'ওয়ালেট ও পেমেন্ট হিস্টোরি' : 'Wallet & Withdrawals'}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📑 {t('transactionsLedger')}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 6 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('totalSales')}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ৳{reseller.totalSales.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                    ↑ {reseller.totalOrders} {language === 'bn' ? 'টি অর্ডার' : 'orders'}
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('totalEarnings')}</span>
                  <span className="text-xl font-black text-teal-600 dark:text-teal-400">
                    ৳{reseller.totalEarnings.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-teal-600 font-bold block mt-1">সর্বমোট অর্জিত</span>
                </div>

                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    {t('availableBalance')}
                  </span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    ৳{reseller.availableBalance.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setWithdrawalModalOpen(true)}
                    disabled={reseller.availableBalance < 500}
                    className="text-[10px] text-emerald-700 underline font-extrabold block mt-1 cursor-pointer"
                  >
                    টাকা তুলুন →
                  </button>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('pendingEarnings')}</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    ৳{reseller.pendingEarnings.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">ডেলিভারির পর যোগ হবে</span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('totalWithdrawn')}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    ৳{reseller.withdrawnBalance.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">বিকাশ / নগদ উত্তোলিত</span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('totalOrders')}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">
                    {reseller.totalOrders}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">সফল অর্ডার</span>
                </div>
              </div>

              {/* Interactive Performance Trend Chart */}
              <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? 'সাপ্তাহিক বিক্রয় ও প্রফিট চার্ট (BDT)' : 'Weekly Sales & Profit Graph'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      গত ৭ দিনের পারফরম্যান্স ও কমিশন ট্র্যাকিং
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span>বিক্রয় (Sales)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-teal-400"></span>
                      <span>প্রফিট (Profit)</span>
                    </div>
                  </div>
                </div>

                {/* SVG/Bar visual representation */}
                <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56">
                  {weeklyTrend.map((item, idx) => {
                    const heightPercent = Math.round((item.sales / maxSale) * 100);
                    const profitHeightPercent = Math.round((item.profit / maxSale) * 100);

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded shadow-lg mb-1 pointer-events-none whitespace-nowrap">
                          বিক্রয়: ৳{item.sales} | লাভ: ৳{item.profit}
                        </div>

                        <div className="w-full max-w-[40px] flex items-end justify-center gap-1">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-1/2 bg-emerald-500 group-hover:bg-emerald-600 rounded-t-lg transition-all"
                          ></div>
                          <div
                            style={{ height: `${profitHeightPercent * 2}%` }}
                            className="w-1/2 bg-teal-400 group-hover:bg-teal-500 rounded-t-lg transition-all"
                          ></div>
                        </div>

                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium truncate">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Referral Promotion Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white relative overflow-hidden shadow-lg">
                <div className="max-w-xl space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>আপনার পার্সোনাল স্টোর লিংক</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black">
                    স্টোর লিংক শেয়ার করুন, যেকোনো অর্ডারে প্রফিট পান
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    এই লিংকের মাধ্যমে কোনো কাস্টমার শপলিক্স ভিজিট করে অর্ডার সম্পন্ন করলে, স্বয়ংক্রিয়ভাবে আপনার রিসেলার একাউন্টে কমিশন যুক্ত হবে।
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      readOnly
                      value={storeReferralUrl}
                      className="px-3.5 py-2 bg-black/40 border border-white/20 rounded-xl text-xs font-mono text-emerald-200 flex-1 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyStoreLink}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESELLER WHOLESALE CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'রিসেলিং হোলসেল ক্যাটালগ' : 'Dropship Catalog with Base Margins'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    বেস প্রাইসে পণ্য কিনুন বা কাস্টমারের জন্য সরাসরি নিজের মূল্যে অর্ডার করুন
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex gap-3 mb-3">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            {product.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5">
                            {language === 'bn' ? product.nameBn : product.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            স্টক: {product.stock} টি এভেইলেবল
                          </span>
                        </div>
                      </div>

                      {/* Pricing grid */}
                      <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs mb-3">
                        <div>
                          <span className="text-[10px] text-slate-400 block">বেস মূল্য</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">৳{product.resellerBasePrice}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">খুচরা মূল্য</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">৳{product.salePrice}</span>
                        </div>
                        <div className="bg-teal-50 dark:bg-teal-950/60 rounded p-0.5">
                          <span className="text-[10px] text-teal-600 block">আপনার লাভ</span>
                          <span className="font-black text-teal-600 dark:text-teal-400">৳{product.resellerCommission}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => onShareProduct(product)}
                        className="py-2 px-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>লিংক শেয়ার</span>
                      </button>

                      <button
                        onClick={() => onSelectProduct(product)}
                        className="py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>কাস্টমার অর্ডার</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REFERRED ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'আপনার মাধ্যমে আসা অর্ডারসমূহ' : 'Referred Customer Orders'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'bn'
                    ? 'ডেলিভারি সম্পন্ন হলে সাথে সাথে কমিশন আপনার একাউন্টে যুক্ত হবে'
                    : 'Commission moves to your available balance upon confirmed delivery'}
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    এখনো কোনো অর্ডার আসেনি। প্রোডাক্ট শেয়ার করে বিক্রি শুরু করুন!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">অর্ডার আইডি</th>
                        <th className="p-3">তারিখ</th>
                        <th className="p-3">কাস্টমার</th>
                        <th className="p-3">আইটেম সংখ্যা</th>
                        <th className="p-3">মোট টাকা</th>
                        <th className="p-3">আপনার কমিশন</th>
                        <th className="p-3">অর্ডার স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                            #{o.orderNumber}
                          </td>
                          <td className="p-3 text-slate-500">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">
                            {o.customerName} ({o.shippingAddress?.district || 'BD'})
                          </td>
                          <td className="p-3">{o.items.length} টি</td>
                          <td className="p-3 font-bold">৳{o.totalAmount}</td>
                          <td className="p-3 font-black text-emerald-600">
                            +৳{o.resellerCommission || 0}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                o.orderStatus === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : o.orderStatus === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : o.orderStatus === 'cancelled'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {o.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WALLET & WITHDRAWALS */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-md space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-100">
                    <span>{t('availableBalance')}</span>
                    <Wallet className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div className="text-3xl font-black">৳{reseller.availableBalance.toLocaleString()}</div>
                  <button
                    onClick={() => setWithdrawalModalOpen(true)}
                    disabled={reseller.availableBalance < 500}
                    className="w-full py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    বিকাশ / নগদ উত্তোলন করুন
                  </button>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>পেন্ডিং কমিশন (Pending)</span>
                    <Clock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    ৳{reseller.pendingEarnings.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    অর্ডার সফলভাবে ডেলিভারি ও ভেরিফাই হওয়ার পর স্বয়ংক্রিয়ভাবে এভেলেবল হবে।
                  </p>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{t('totalWithdrawn')}</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    ৳{reseller.withdrawnBalance.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    পেমেন্ট মেথড: {reseller.paymentMethod} ({reseller.payoutNumber})
                  </p>
                </div>
              </div>

              {/* Withdrawals History */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('withdrawalHistory')}
                </h4>
                {withdrawals.length === 0 ? (
                  <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                    এখনো কোনো উত্তোলনের অনুরোধ নেই।
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">উত্তোলন আইডি</th>
                          <th className="p-3">তারিখ</th>
                          <th className="p-3">মাধ্যম</th>
                          <th className="p-3">একাউন্ট নম্বর</th>
                          <th className="p-3">পরিমাণ</th>
                          <th className="p-3">স্ট্যাটাস</th>
                          <th className="p-3">TrxID / রেফারেন্স</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                        {withdrawals.map((w) => (
                          <tr key={w.id}>
                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{w.id}</td>
                            <td className="p-3 text-slate-500">{new Date(w.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{w.paymentMethod}</td>
                            <td className="p-3">{w.accountNumber}</td>
                            <td className="p-3 font-extrabold text-emerald-600">৳{w.amount}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  w.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : w.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {w.status}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">
                              {w.transactionRef || w.rejectionReason || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: IMMUTABLE TRANSACTIONS LEDGER */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('transactionsLedger')}
                </h3>
                <p className="text-xs text-slate-500">
                  সকল ক্রেডিট, ডেবিট এবং উত্তোলনের অপরিবর্তনযোগ্য হিসাব খতিয়ান
                </p>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                  কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3">ট্রানজেকশন আইডি</th>
                        <th className="p-3">সময় ও তারিখ</th>
                        <th className="p-3">বিবরণ</th>
                        <th className="p-3">টাইপ</th>
                        <th className="p-3">পরিমাণ</th>
                        <th className="p-3">পূর্ববর্তী ব্যালেন্স</th>
                        <th className="p-3">বর্তমান ব্যালেন্স</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{tx.id}</td>
                          <td className="p-3 text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">{tx.description}</td>
                          <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{tx.type}</td>
                          <td className="p-3 font-extrabold text-emerald-600">
                            {tx.type.includes('credit') ? `+৳${tx.amount}` : `-৳${tx.amount}`}
                          </td>
                          <td className="p-3 text-slate-500">৳{tx.previousBalance}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">৳{tx.newBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {withdrawalModalOpen && (
        <WithdrawalModal
          isOpen={withdrawalModalOpen}
          onClose={() => setWithdrawalModalOpen(false)}
          reseller={reseller}
          onSuccess={() => {
            loadData();
            refreshProfiles();
          }}
        />
      )}
    </div>
  );
};
