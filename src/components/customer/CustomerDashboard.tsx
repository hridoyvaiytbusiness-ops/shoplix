import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Phone,
  Mail,
  X,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  Wallet,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { Order, Product } from '../../types';
import { fetchCustomerOrders } from '../../services/storeService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface CustomerDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenResellerModal?: () => void;
  onOpenResellerDashboard?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onOpenResellerModal,
  onOpenResellerDashboard,
}) => {
  if (!isOpen) return null;

  const { currentUser, userProfile, resellerProfile, isApprovedReseller, refreshProfiles } = useAuth();
  const { wishlist, addToCart } = useCart();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'settings'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile edit states
  const [displayName, setDisplayName] = useState(userProfile?.displayName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phoneNumber || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [district, setDistrict] = useState(userProfile?.district || 'ঢাকা');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLoadingOrders(true);
      fetchCustomerOrders(currentUser.uid)
        .then((res) => setOrders(res))
        .catch((e) => console.warn(e))
        .finally(() => setLoadingOrders(false));
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        phoneNumber: phone,
        address,
        district,
        updatedAt: new Date().toISOString(),
      });
      await refreshProfiles();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const walletBalance = userProfile?.walletBalance ?? 0;
  const rewardPoints = userProfile?.rewardPoints ?? 50;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              {(userProfile?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {userProfile?.displayName || currentUser?.displayName || 'কাস্টমার প্রোফাইল'}
                </h2>
                {isApprovedReseller ? (
                  <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 rounded-full text-[10px] font-bold border border-teal-300 dark:border-teal-800 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>অনুমোদিত রিসেলার</span>
                  </span>
                ) : resellerProfile?.status === 'pending' ? (
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full text-[10px] font-bold border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>রিসেলার আবেদন প্রক্রিয়াধীন</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    সাধারণ গ্রাহক
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.email} {phone ? `• ${phone}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
          {/* Card 1: Balance */}
          <div className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">ওয়ালেট ব্যালেন্স</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              ৳{(isApprovedReseller ? resellerProfile?.availableBalance ?? walletBalance : walletBalance).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">
              {isApprovedReseller ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'শপিং ক্রেডিট ব্যালেন্স'}
            </span>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">মোট অর্ডার</span>
              <Package className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {orders.length} টি
            </div>
            <span className="text-[10px] text-slate-400">আপনার ক্রয়কৃত অর্ডার</span>
          </div>

          {/* Card 3: Wishlist */}
          <div className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">পছন্দের তালিকা</span>
              <Heart className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {wishlist.length} টি
            </div>
            <span className="text-[10px] text-slate-400">উইশলিস্টে সংরক্ষিত</span>
          </div>

          {/* Card 4: Reward Points */}
          <div className="bg-white dark:bg-slate-800/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span className="font-semibold">রিওয়ার্ড পয়েন্ট</span>
              <Award className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
              {rewardPoints} পয়েন্ট
            </div>
            <span className="text-[10px] text-slate-400">ডিসকাউন্ট ভ্যালু ৳{Math.floor(rewardPoints / 2)}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex gap-2 sm:gap-6 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>প্রোফাইল ও ওয়ালেট</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('myOrders')} ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('wishlist')} ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>ঠিকানা ও তথ্য পরিবর্তন</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
          {/* TAB 1: OVERVIEW & WALLET */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Wallet Showcase Card */}
              <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-emerald-200" />
                    <span className="font-bold text-sm tracking-wide text-emerald-100 uppercase">
                      SHOPLIX একাউন্ট ব্যালেন্স
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                    সক্রিয় একাউন্ট
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight">
                    ৳{(isApprovedReseller ? resellerProfile?.availableBalance ?? walletBalance : walletBalance).toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-100 mt-1">
                    {isApprovedReseller
                      ? 'রিসেলিং কমিশনের মাধ্যমে অর্জিত উত্তোলনযোগ্য ব্যালেন্স।'
                      : 'আপনার শপিং ক্যাশব্যাক ও জমা ব্যালেন্স যা পরবর্তী কেনাকাটায় ব্যবহার করা যাবে।'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/20 flex-wrap">
                  {isApprovedReseller ? (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenResellerDashboard) onOpenResellerDashboard();
                      }}
                      className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-black shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>রিসেলার ড্যাশবোর্ড ও টাকা উত্তোলন</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenResellerModal) onOpenResellerModal();
                      }}
                      className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-black shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>রিসেলার একাউন্ট খুলুন ও আয় শুরু করুন</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    ডেলিভারি ঠিকানা যুক্ত করুন
                  </button>
                </div>
              </div>

              {/* Individual Profile Information Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>ব্যক্তিগত বিবরণ</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">নাম:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {userProfile?.displayName || currentUser?.displayName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">ইমেইল:</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {currentUser?.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">মোবাইল নম্বর:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {userProfile?.phoneNumber || 'যুক্ত করা হয়নি'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500">ডেলিভারি ঠিকানা:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
                        {userProfile?.address || 'যুক্ত করা হয়নি'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>রিসেলিং স্ট্যাটাস ও সুযোগ</span>
                  </h3>
                  {isApprovedReseller ? (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl">
                        <p className="font-bold text-teal-800 dark:text-teal-300">
                          দোকানের নাম: {resellerProfile?.shopName}
                        </p>
                        <p className="text-[11px] text-teal-600 mt-0.5">
                          রিসেলার কোড: <span className="font-mono font-bold">{resellerProfile?.resellerCode}</span>
                        </p>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">মোট আয়:</span>
                        <span className="font-bold text-emerald-600">৳{resellerProfile?.totalEarnings?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-500">মোট বিক্রয়:</span>
                        <span className="font-bold">৳{resellerProfile?.totalSales?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      <p className="text-slate-600 dark:text-slate-300">
                        আপনি কি জিরো পুঁজিতে অনলাইনে বিজনেস করতে চান? শপলিক্স রিসেলার প্রোগ্রামে যোগ দিয়ে পণ্যের লিংক শেয়ার করে প্রতি অর্ডারে ১০০ থেকে ৫০০ টাকা পর্যন্ত মুনাফা অর্জন করুন!
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenResellerModal) onOpenResellerModal();
                        }}
                        className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold hover:opacity-95 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>এখনই রিসেলার একাউন্টের আবেদন করুন</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {loadingOrders ? (
                <p className="text-center py-10 text-xs text-slate-400">অর্ডার লোড হচ্ছে...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">আপনার কোনো সক্রিয় অর্ডার নেই।</p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-sm"
                  >
                    {t('startShoppingBtn')}
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                      <div>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          অর্ডারের তারিখ: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-600 block">
                          ৳{order.totalAmount.toLocaleString()}
                        </span>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : order.orderStatus === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-100" />
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {item.name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {item.selectedSize ? `সাইজ: ${item.selectedSize} | ` : ''}পরিমান: {item.quantity} পিস
                              </span>
                            </div>
                          </div>
                          <span className="font-bold">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Timeline Tracker */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span className={order.orderStatus ? 'text-emerald-600' : ''}>✓ অর্ডার গৃহিত</span>
                        <span className={['confirmed', 'processing', 'shipped', 'delivered'].includes(order.orderStatus) ? 'text-emerald-600' : ''}>
                          ✓ প্রসেসিং
                        </span>
                        <span className={['shipped', 'delivered'].includes(order.orderStatus) ? 'text-emerald-600' : ''}>
                          ✓ কুরিয়ারে হস্তান্তর
                        </span>
                        <span className={order.orderStatus === 'delivered' ? 'text-emerald-600' : ''}>
                          ✓ ডেলিভার্ড
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-500">আপনার পছন্দের তালিকা বর্তমানে খালি।</p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-sm"
                  >
                    শপিং করুন
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-3 items-center shadow-xs"
                    >
                      <img src={prod.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs truncate text-slate-800 dark:text-slate-200">{prod.nameBn || prod.name}</h4>
                        <span className="font-black text-sm text-emerald-600">৳{prod.salePrice}</span>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            কার্টে যোগ
                          </button>
                          <button
                            onClick={() => onSelectProduct(prod)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            বিস্তারিত দেখুন
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 text-xs shadow-xs">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>প্রোফাইল ও ডেলিভারি তথ্য</span>
              </h3>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>তথ্য সফলভাবে সংরক্ষিত হয়েছে!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="font-bold block mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">ইমেইল (অপরিবর্তনযোগ্য)</label>
                  <input
                    type="text"
                    readOnly
                    value={currentUser?.email || ''}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700-000000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">জেলা</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="ঢাকা, চট্টগ্রাম, রাজশাহী..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">সংরক্ষিত ডেলিভারি ঠিকানা</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="রোড নম্বর, বাড়ি নম্বর, এলাকা..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md"
                >
                  {savingProfile ? 'সংরক্ষণ করা হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
