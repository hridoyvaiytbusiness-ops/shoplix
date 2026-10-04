import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Truck,
  Settings,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  X,
  Save,
  Clock,
  Sparkles,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Product,
  Order,
  Reseller,
  Withdrawal,
  Supplier,
  AuditLog,
  StoreSettings,
  OrderStatus,
} from '../../types';
import {
  fetchAllOrders,
  fetchProducts,
  saveProduct,
  deleteProduct,
  resetProductsToInitial,
  getAllResellers,
  updateResellerStatus,
  fetchAllWithdrawals,
  processWithdrawal,
  fetchSuppliers,
  saveSupplier,
  fetchAuditLogs,
  fetchSettings,
  saveSettings,
  updateOrderStatus,
  adminAdjustWallet,
} from '../../services/storeService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshProducts: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, onRefreshProducts }) => {
  const { currentUser, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  // STRICT SECURITY GUARD: Only designated admin mridoyfb@gmail.com can view Admin Panel
  if (!isAdmin || currentUser?.email?.toLowerCase() !== 'mridoyfb@gmail.com') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 p-6 rounded-3xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">অননুমোদিত প্রবেশাধিকার</h3>
          <p className="text-xs text-slate-500">শুধুমাত্র প্রধান অ্যাডমিনের জন্য এই প্যানেলটি সংরক্ষিত।</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    );
  }

  const [activeModule, setActiveModule] = useState<
    'dashboard' | 'products' | 'orders' | 'resellers' | 'withdrawals' | 'suppliers' | 'settings' | 'logs'
  >('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & product actions inside Admin
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [payoutRefInput, setPayoutRefInput] = useState<{ [id: string]: string }>({});
  const [rejectionReasonInput, setRejectionReasonInput] = useState<{ [id: string]: string }>({});
  const [adjustmentReseller, setAdjustmentReseller] = useState<Reseller | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>('Performance bonus');
  const [adjustType, setAdjustType] = useState<'admin_credit' | 'admin_debit'>('admin_credit');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'payments' | 'general'>('payments');
  const [productActionSuccessMsg, setProductActionSuccessMsg] = useState<string | null>(null);
  const [productViewMode, setProductViewMode] = useState<'cards' | 'table'>('cards');
  const [productSearch, setProductSearch] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const adminEmail = currentUser?.email || 'admin@shoplix.com.bd';

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [pList, oList, rList, wList, sList, lList, setDoc] = await Promise.all([
        fetchProducts(),
        fetchAllOrders(),
        getAllResellers(),
        fetchAllWithdrawals(),
        fetchSuppliers(),
        fetchAuditLogs(),
        fetchSettings(),
      ]);
      setProducts(pList);
      setOrders(oList);
      setResellers(rList);
      setWithdrawals(wList);
      setSuppliers(sList);
      setAuditLogs(lList);
      setSettings(setDoc);
    } catch (e) {
      console.warn('Admin load note:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'cancelled' ? o.totalAmount : 0), 0);
  const totalCommissionsPaid = withdrawals.filter((w) => w.status === 'paid').reduce((sum, w) => sum + w.amount, 0);
  const pendingWithdrawalAmount = withdrawals.filter((w) => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);
  const estimatedProfit = Math.round(totalRevenue * 0.15); // rough store margin

  // Quick Open Add Product
  const handleOpenAddProduct = () => {
    setIsNewProduct(true);
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      nameBn: '',
      description: 'উচ্চমানের সেরা কোয়ালিটির আকর্ষণীয় প্রোডাক্ট। ১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি।',
      descriptionBn: 'উচ্চমানের সেরা কোয়ালিটির আকর্ষণীয় প্রোডাক্ট। ১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি।',
      category: 'electronics',
      subCategory: 'Gadgets',
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'],
      regularPrice: 1500,
      salePrice: 1200,
      resellerBasePrice: 850,
      resellerCommission: 350,
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      maxSalePrice: 1600,
      stock: 50,
      sizes: ['Free Size'],
      colors: ['Black'],
      rating: 5.0,
      reviewsCount: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    setActiveModule('products');
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setEditingProduct({
          ...editingProduct,
          images: [dataUrl, ...(editingProduct.images?.slice(1) || [])],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Product save handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSavingProduct(true);
    try {
      const titleBn = editingProduct.nameBn?.trim() || editingProduct.name?.trim() || 'নতুন প্রোডাক্ট';
      const titleEn = editingProduct.name?.trim() || titleBn;
      const base = Number(editingProduct.resellerBasePrice) || 500;
      const maxP = Number(editingProduct.maxSalePrice) || Number(editingProduct.regularPrice) || Math.round(base * 1.5);
      const saleP = Number(editingProduct.salePrice) || base;
      const skuVal = editingProduct.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;

      const finalizedProduct: Product = {
        ...editingProduct,
        id: editingProduct.id || `prod-${Date.now()}`,
        name: titleEn,
        nameBn: titleBn,
        resellerBasePrice: base,
        maxSalePrice: maxP,
        salePrice: saleP,
        regularPrice: maxP,
        resellerCommission: Math.max(0, saleP - base),
        sku: skuVal,
        images: editingProduct.images && editingProduct.images.length > 0 && editingProduct.images[0]
          ? editingProduct.images
          : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'],
      };

      // Optimistically update local state so changes appear instantly
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === finalizedProduct.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = finalizedProduct;
          return next;
        }
        return [finalizedProduct, ...prev];
      });

      await saveProduct(finalizedProduct);
      setEditingProduct(null);
      setIsNewProduct(false);
      await loadAllAdminData();
      onRefreshProducts();
      setProductActionSuccessMsg(
        isNewProduct
          ? `"${finalizedProduct.nameBn}" নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!`
          : `"${finalizedProduct.nameBn}" প্রোডাক্ট তথ্য সফলভাবে আপডেট হয়েছে!`
      );
      setTimeout(() => setProductActionSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Save product error:', e);
      setProductActionSuccessMsg('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: ' + (e?.message || 'Error'));
    } finally {
      setSavingProduct(false);
    }
  };

  // Safe In-App Delete (No window.confirm, handles state optimistically)
  const confirmDeleteProduct = async (product: Product) => {
    setDeletingProductId(product.id);
    try {
      // Optimistically remove from state immediately
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      await deleteProduct(product.id);
      await loadAllAdminData();
      onRefreshProducts();
      setProductActionSuccessMsg(`"${product.nameBn || product.name}" প্রোডাক্টটি সফলভাবে কেটে ফেলা (ডিলিট) হয়েছে!`);
      setTimeout(() => setProductActionSuccessMsg(null), 4000);
    } catch (e: any) {
      console.error('Delete product error:', e);
      setProductActionSuccessMsg('প্রোডাক্ট ডিলিট করতে সমস্যা হয়েছে: ' + (e?.message || 'Error'));
    } finally {
      setDeletingProductId(null);
      setProductToDelete(null);
    }
  };

  // Order status update handler
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status, adminEmail);
      await loadAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Reseller status update
  const handleUpdateResellerStatus = async (resellerId: string, status: Reseller['status']) => {
    try {
      await updateResellerStatus(resellerId, status, adminEmail);
      await loadAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Withdrawal processing
  const handleProcessWithdrawal = async (
    wId: string,
    status: 'paid' | 'rejected',
    ref: string = '',
    reason: string = ''
  ) => {
    try {
      await processWithdrawal(wId, status, ref, reason, adminEmail);
      await loadAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  // Admin wallet adjust
  const handleAdminWalletAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentReseller) return;
    try {
      await adminAdjustWallet(adjustmentReseller.id, adjustAmount, adjustType, adjustReason, adminEmail);
      setAdjustmentReseller(null);
      await loadAllAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-7xl h-[94vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Admin Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  SHOPLIX ADMIN CONSOLE
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as: {adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/shoplix-ecommerce-source-code.zip"
              download="shoplix-ecommerce-source-code.zip"
              className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              title="Download Full Project Source Code (ZIP)"
            >
              <FileText className="w-4 h-4" />
              <span>কোড ডাউনলোড (ZIP)</span>
            </a>

            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>নতুন প্রোডাক্ট যুক্ত করুন</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modules Navigation Bar */}
        <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 flex gap-1 overflow-x-auto text-xs font-bold no-scrollbar">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'dashboard'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📊 {t('adminDashboard')}
          </button>
          <button
            onClick={() => setActiveModule('orders')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'orders'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📦 {t('manageOrders')} ({orders.length})
          </button>
          <button
            onClick={() => setActiveModule('products')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'products'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🛍️ {t('manageProducts')} ({products.length})
          </button>
          <button
            onClick={() => setActiveModule('resellers')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'resellers'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            👥 {t('manageResellers')} ({resellers.length})
          </button>
          <button
            onClick={() => setActiveModule('withdrawals')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'withdrawals'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💳 {t('manageWithdrawals')} ({withdrawals.filter((w) => w.status === 'pending').length} New)
          </button>
          <button
            onClick={() => setActiveModule('suppliers')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'suppliers'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🏭 {t('manageSuppliers')}
          </button>
          <button
            onClick={() => setActiveModule('settings')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'settings'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ⚙️ {t('websiteSettings')}
          </button>
          <button
            onClick={() => setActiveModule('logs')}
            className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeModule === 'logs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📜 {t('auditLogs')}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50">
          {/* DASHBOARD OVERVIEW */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block mb-1">মোট বিক্রয় (Total Revenue)</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ৳{totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                    {orders.length} টি মোট অর্ডার
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block mb-1">রিসেলার কমিশন প্রদান</span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    ৳{totalCommissionsPaid.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-teal-600 font-bold block mt-1">
                    বিকাশ ও নগদে সফল পেইড
                  </span>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-xs">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1">
                    পেন্ডিং উত্তোলন (Pending Payouts)
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    ৳{pendingWithdrawalAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-1">
                    {withdrawals.filter((w) => w.status === 'pending').length} টি আবেদন বাকি
                  </span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block mb-1">প্ল্যাটফর্ম আনুমানিক প্রফিট</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ৳{estimatedProfit.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    নেট মার্জিন
                  </span>
                </div>
              </div>

              {/* Product Actions & Source Code Download Banner */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl border border-emerald-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
                      কুইক প্রোডাক্ট ও কোড কন্ট্রোল
                    </span>
                    <span className="text-xs text-emerald-300 font-bold">
                      বর্তমানে {products.length} টি প্রোডাক্ট লাইভ রয়েছে
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    নতুন প্রোডাক্ট যুক্ত করুন অথবা আগের যেকোনো প্রোডাক্ট কেটে ফেলুন (ডিলিট করুন)
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    নিচের বাটন দিয়ে সরাসরি নতুন প্রোডাক্ট যুক্ত করতে পারবেন এবং আগের যেকোনো পণ্য কেটে দিতে পারবেন। অন্য Google AI Studio তে ব্যবহারের জন্য সম্পূর্ণ সোর্স কোডও ডাউনলোড করতে পারেন।
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>নতুন প্রোডাক্ট যোগ করুন</span>
                  </button>
                  <button
                    onClick={() => setActiveModule('products')}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span>প্রোডাক্ট দেখুন ও কেটে দিন ({products.length})</span>
                  </button>
                  <a
                    href="/shoplix-ecommerce-source-code.zip"
                    download="shoplix-ecommerce-source-code.zip"
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                    title="Download Source Code ZIP"
                  >
                    <FileText className="w-4 h-4" />
                    <span>কোড ডাউনলোড (ZIP)</span>
                  </a>
                </div>
              </div>

              {/* Quick Summary Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      সাম্প্রতিক অর্ডারসমূহ
                    </h4>
                    <button
                      onClick={() => setActiveModule('orders')}
                      className="text-xs text-emerald-600 hover:underline font-bold cursor-pointer"
                    >
                      সব দেখুন ({orders.length}) →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            #{o.orderNumber} - {o.customerName}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {o.shippingAddress?.district || 'BD'} • ৳{o.totalAmount}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.orderStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.orderStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Reseller Applications */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      রিসেলার আবেদন তালিকা
                    </h4>
                    <button
                      onClick={() => setActiveModule('resellers')}
                      className="text-xs text-emerald-600 hover:underline font-bold cursor-pointer"
                    >
                      সব দেখুন ({resellers.length}) →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
                    {resellers.slice(0, 5).map((r) => (
                      <div key={r.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {r.shopName || r.fullName}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {r.phoneNumber} • {r.paymentMethod} ({r.payoutNumber})
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            r.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS MANAGEMENT */}
          {activeModule === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('manageOrders')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    অর্ডার স্ট্যাটাস পরিবর্তন করুন। Delivered মার্ক করলে স্বয়ংক্রিয়ভাবে রিসেলার কমিশন আনলক হবে!
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">অর্ডার নং</th>
                      <th className="p-3">কাস্টমার ও ঠিকানা</th>
                      <th className="p-3">পণ্য তালিকা</th>
                      <th className="p-3">টোটাল</th>
                      <th className="p-3">রিসেলার অ্যাট্রিবিউশন</th>
                      <th className="p-3">পেমেন্ট</th>
                      <th className="p-3">অর্ডার স্ট্যাটাস</th>
                      <th className="p-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          #{o.orderNumber}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</p>
                          <p className="text-[11px] text-slate-500">{o.customerPhone}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">
                            {o.shippingAddress?.fullAddress}, {o.shippingAddress?.district}
                          </p>
                        </td>
                        <td className="p-3">
                          <span className="font-bold">{o.items.length} টি আইটেম</span>
                          <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                            {o.items.map((i) => i.name).join(', ')}
                          </div>
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                          ৳{o.totalAmount}
                        </td>
                        <td className="p-3">
                          {o.resellerCode ? (
                            <div>
                              <span className="font-bold text-teal-600 block">{o.resellerCode}</span>
                              <span className="text-[10px] text-emerald-600 font-bold">
                                কমিশন: ৳{o.resellerCommission}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">ডাইরেক্ট কাস্টমার</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="uppercase text-[10px] font-bold block">{o.paymentMethod}</span>
                          <span className="text-[10px] text-slate-400">{o.paymentStatus}</span>
                          {o.bKashTrxId && (
                            <span className="font-mono text-[10px] text-pink-600 block">
                              Trx: {o.bKashTrxId}
                            </span>
                          )}
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
                        <td className="p-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered (Credit Comm.)</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS MANAGEMENT */}
          {activeModule === 'products' && (
            <div className="space-y-5">
              {/* Product Header & Top Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {t('manageProducts')}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold">
                      {products.length} টি প্রোডাক্ট রয়েছে
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    নতুন প্রোডাক্ট যুক্ত করুন, যেকোনো প্রোডাক্টের দাম ও স্টক এডিট করুন বা আগের প্রোডাক্ট কেটে ফেলুন (ডিলিট করুন)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setProductViewMode('cards')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        productViewMode === 'cards'
                          ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      কার্ড ভিউ
                    </button>
                    <button
                      onClick={() => setProductViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        productViewMode === 'table'
                          ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      টেবিল ভিউ
                    </button>
                  </div>

                  {/* Big Add Product Button */}
                  <button
                    onClick={() => {
                      setIsNewProduct(true);
                      setEditingProduct({
                        id: `prod-${Date.now()}`,
                        name: '',
                        nameBn: '',
                        description: 'উচ্চমানের সেরা কোয়ালিটির প্রোডাক্ট।',
                        descriptionBn: 'উচ্চমানের সেরা কোয়ালিটির আকর্ষণীয় প্রোডাক্ট।',
                        category: 'electronics',
                        subCategory: 'Gadgets',
                        images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'],
                        regularPrice: 1500,
                        salePrice: 1200,
                        resellerBasePrice: 850,
                        resellerCommission: 350,
                        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
                        maxSalePrice: 1600,
                        stock: 50,
                        sizes: ['Free Size'],
                        colors: ['Black'],
                        rating: 5.0,
                        reviewsCount: 1,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                      });
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন প্রোডাক্ট যুক্ত করুন</span>
                  </button>
                </div>
              </div>

              {/* Action Feedback Banner */}
              {productActionSuccessMsg && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl font-bold flex items-center gap-2.5 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{productActionSuccessMsg}</span>
                </div>
              )}

              {/* Search filter */}
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="নাম অথবা SKU দিয়ে প্রোডাক্ট খুঁজুন..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                {productSearch && (
                  <button
                    onClick={() => setProductSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    ক্লিয়ার
                  </button>
                )}
              </div>

              {/* Product Form Modal */}
              {editingProduct && (
                <div className="p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-3xl border-2 border-emerald-500/50 dark:border-emerald-500/30 shadow-xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        {isNewProduct ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      </div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {isNewProduct ? 'নতুন প্রোডাক্ট যুক্ত করুন (Add New Product)' : 'প্রোডাক্ট এডিট করুন (Edit Product)'}
                      </h4>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Quick Preset Selector for Easy Product Creation */}
                  {isNewProduct && (
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">
                        💡 দ্রুত প্রোডাক্ট টেমপ্লেট নির্বাচন করুন (১-ক্লিকে ছবি ও তথ্য যুক্ত হবে):
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              name: 'Smart Watch T900 Ultra 2',
                              nameBn: 'টি৯০০ আল্ট্রা ২ ব্লুটুথ কলিং স্মার্ট ওয়াচ',
                              category: 'watches',
                              resellerBasePrice: 850,
                              maxSalePrice: 1550,
                              salePrice: 1190,
                              sku: `SKU-WTC-${Date.now().toString().slice(-4)}`,
                              images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
                              sizes: ['Free Size'],
                            });
                          }}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 rounded-lg font-bold hover:bg-emerald-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          ⌚ স্মার্ট ওয়াচ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              name: 'Premium Cotton Drop Shoulder T-Shirt',
                              nameBn: 'প্রিমিয়াম কটন ড্রপ শোল্ডার টি-শার্ট',
                              category: 'fashion-men',
                              resellerBasePrice: 320,
                              maxSalePrice: 650,
                              salePrice: 490,
                              sku: `SKU-TSH-${Date.now().toString().slice(-4)}`,
                              images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
                              sizes: ['M', 'L', 'XL', 'XXL'],
                            });
                          }}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 rounded-lg font-bold hover:bg-emerald-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          👕 টি-শার্ট
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              name: 'Wireless Bluetooth Noise Cancelling Earbuds',
                              nameBn: 'ওয়্যারলেস ব্লুটুথ নয়েজ ক্যানসেলিং ইয়ারবাডস',
                              category: 'electronics',
                              resellerBasePrice: 580,
                              maxSalePrice: 1200,
                              salePrice: 890,
                              sku: `SKU-EBD-${Date.now().toString().slice(-4)}`,
                              images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'],
                              sizes: ['Free Size'],
                            });
                          }}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 rounded-lg font-bold hover:bg-emerald-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          🎧 হেডফোন / ইয়ারবাড
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              name: 'Portable Rechargeable Fresh Juice Blender',
                              nameBn: 'ইউএসবি রিচার্জেবল পোর্টেবল ফ্রুট জুসার',
                              category: 'home-kitchen',
                              resellerBasePrice: 620,
                              maxSalePrice: 1350,
                              salePrice: 890,
                              sku: `SKU-BLN-${Date.now().toString().slice(-4)}`,
                              images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80'],
                              sizes: ['380ml'],
                            });
                          }}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-300 rounded-lg font-bold hover:bg-emerald-100 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          🥤 পোর্টেবল জুসার
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    <div>
                      <label className="font-bold block mb-1">প্রোডাক্টের নাম (বাংলা) *</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.nameBn}
                        onChange={(e) => setEditingProduct({ ...editingProduct, nameBn: e.target.value })}
                        placeholder="যেমন: স্মার্ট ওয়্যারলেস হেডফোন"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">Product Name (English - Optional)</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        placeholder="e.g. Wireless Bluetooth Earphones"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">ক্যাটাগরি (Category) *</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold"
                      >
                        <option value="electronics">Electronics & Gadgets</option>
                        <option value="fashion-men">Men&apos;s Fashion</option>
                        <option value="fashion-women">Women&apos;s Fashion</option>
                        <option value="watches">Smart Watches</option>
                        <option value="bags-accessories">Bags & Luggage</option>
                        <option value="home-kitchen">Home & Kitchen</option>
                      </select>
                    </div>

                    {/* Pricing */}
                    <div>
                      <label className="font-bold block mb-1 text-emerald-700 dark:text-emerald-300">
                        প্রাইস / বেস প্রাইস (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={editingProduct.resellerBasePrice}
                        onChange={(e) => {
                          const base = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            resellerBasePrice: base,
                            resellerCommission: Math.max(0, (editingProduct.salePrice || 0) - base),
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-black text-sm"
                      />
                      <span className="text-[10px] text-slate-500">আপনার হোলসেল রেট যা পণ্য পেজে প্রাইস হিসেবে দেখাবে</span>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-slate-800 dark:text-slate-200">
                        প্রোডাক্টির বিক্রয় মূল্য সর্বোচ্চ (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={editingProduct.maxSalePrice || editingProduct.regularPrice}
                        onChange={(e) => {
                          const maxP = Number(e.target.value);
                          setEditingProduct({
                            ...editingProduct,
                            maxSalePrice: maxP,
                            regularPrice: maxP,
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-black text-sm"
                      />
                      <span className="text-[10px] text-slate-500">কাস্টমার এর চেয়ে বেশি দামে বিক্রি করতে পারবে না</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold">SKU কোড *</label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
                            });
                          }}
                          className="text-[10px] font-bold text-teal-600 hover:underline cursor-pointer"
                        >
                          অটো SKU তৈরি
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        placeholder="যেমন: SKU-T900-U2"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono font-bold text-teal-600 dark:text-teal-400"
                      />
                    </div>

                    {/* Stock, Size, Default Sale */}
                    <div>
                      <label className="font-bold block mb-1">স্টক পরিমাণ (Available Stock) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold">সাইজসমূহ</label>
                        <div className="flex gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, sizes: ['Free Size'] })}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            Free Size
                          </button>
                          <span>|</span>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, sizes: ['M', 'L', 'XL'] })}
                            className="text-emerald-600 hover:underline cursor-pointer"
                          >
                            M,L,XL
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editingProduct.sizes?.join(', ') || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder="কমা দিয়ে লিখুন: M, L, XL, XXL"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">ডিফল্ট বিক্রয়মূল্য (৳)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.salePrice}
                        onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-bold"
                      />
                    </div>

                    {/* Image URL, File Upload & Preview */}
                    <div className="sm:col-span-3 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="font-bold block">প্রোডাক্টের ছবি (Image)</label>
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          <span className="text-slate-400">স্যাম্পল ছবি:</span>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'] })}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            ⌚ ঘড়ি
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'] })}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            👕 পোশাক
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'] })}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            🎧 ইয়ারবাড
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80'] })}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            🥤 জুসার
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                        <label className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>ডিভাইস থেকে আপলোড</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>

                        <input
                          type="text"
                          value={editingProduct.images[0] || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                          placeholder="অথবা সরাসরি ছবির লিঙ্ক (URL) দিন..."
                          className="flex-1 min-w-[200px] px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs"
                        />

                        {editingProduct.images[0] && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 flex-shrink-0 bg-slate-100">
                            <img
                              src={editingProduct.images[0]}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex items-center justify-between flex-wrap gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-700">
                      {!isNewProduct ? (
                        <button
                          type="button"
                          onClick={() => setProductToDelete(editingProduct)}
                          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white border border-rose-300 dark:border-rose-800 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>এই প্রোডাক্টটি কেটে দিন (Delete)</span>
                        </button>
                      ) : <div />}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-colors"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          disabled={savingProduct}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>{savingProduct ? 'সংরক্ষণ হচ্ছে...' : 'প্রোডাক্ট সংরক্ষণ করুন'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* PRODUCTS DISPLAY LIST: CARDS OR TABLE */}
              {(() => {
                const filtered = products.filter((p) => {
                  if (!productSearch.trim()) return true;
                  const q = productSearch.toLowerCase();
                  return (
                    p.name.toLowerCase().includes(q) ||
                    (p.nameBn && p.nameBn.toLowerCase().includes(q)) ||
                    (p.sku && p.sku.toLowerCase().includes(q))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <Package className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-500">কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি।</p>
                    </div>
                  );
                }

                if (productViewMode === 'cards') {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filtered.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                          <div className="flex gap-3 items-start">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-20 h-20 rounded-2xl object-cover bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block">
                                {p.category}
                              </span>
                              <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                                {p.nameBn || p.name}
                              </h4>
                              <span className="text-[11px] font-mono text-teal-600 font-bold block mt-0.5">
                                SKU: {p.sku || p.id}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                স্টক: <span className="font-bold text-slate-700 dark:text-slate-300">{p.stock} পিস</span>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">বেস প্রাইস</span>
                              <span className="font-black text-emerald-600 text-sm">৳{p.resellerBasePrice}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">সর্বোচ্চ বিক্রয়</span>
                              <span className="font-black text-slate-800 dark:text-slate-200 text-sm">৳{p.maxSalePrice || p.regularPrice}</span>
                            </div>
                          </div>

                          {/* PROMINENT ACTION BUTTONS */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                            <button
                              onClick={() => {
                                setIsNewProduct(false);
                                setEditingProduct(p);
                              }}
                              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-emerald-600" />
                              <span>এডিট করুন</span>
                            </button>

                            <button
                              onClick={() => setProductToDelete(p)}
                              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>কেটে দিন (ডিলিট)</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3">প্রোডাক্ট ও SKU</th>
                          <th className="p-3">ক্যাটাগরি</th>
                          <th className="p-3">প্রাইস (বেস)</th>
                          <th className="p-3">সর্বোচ্চ বিক্রয় মূল্য</th>
                          <th className="p-3">স্টক</th>
                          <th className="p-3">স্ট্যাটাস</th>
                          <th className="p-3 text-center">অ্যাকশন (এডিট / ডিলিট)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                        {filtered.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                            <td className="p-3 flex items-center gap-2.5">
                              <img src={p.images[0]} alt="" className="w-11 h-11 rounded-xl object-cover bg-slate-100 flex-shrink-0" />
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{p.nameBn || p.name}</p>
                                <span className="text-[10px] text-teal-600 font-mono font-bold block">
                                  SKU: {p.sku || p.id}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{p.category}</td>
                            <td className="p-3 font-black text-emerald-600">৳{p.resellerBasePrice}</td>
                            <td className="p-3 font-black text-slate-900 dark:text-white">৳{p.maxSalePrice || p.regularPrice}</td>
                            <td className="p-3 font-bold">{p.stock} টি</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                {p.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setIsNewProduct(false);
                                    setEditingProduct(p);
                                  }}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>এডিট</span>
                                </button>
                                <button
                                  onClick={() => setProductToDelete(p)}
                                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs active:scale-95"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>কেটে দিন</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* RESELLERS MANAGEMENT */}
          {activeModule === 'resellers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('manageResellers')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    রিসেলার আবেদন অনুমোদন, স্থগিত ও তাদের ব্যালেন্স পর্যবেক্ষণ করুন
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">রিসেলার ও শপ নাম</th>
                      <th className="p-3">যোগাযোগ</th>
                      <th className="p-3">পেআউট মাধ্যম</th>
                      <th className="p-3">এভেলেবল ব্যালেন্স</th>
                      <th className="p-3">মোট বিক্রয়</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {resellers.map((r) => (
                      <tr key={r.id}>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{r.shopName || r.fullName}</p>
                          <span className="text-[10px] text-teal-600 font-mono font-bold">Code: {r.resellerCode}</span>
                        </td>
                        <td className="p-3">
                          <p>{r.phoneNumber}</p>
                          <p className="text-[11px] text-slate-400">{r.email}</p>
                        </td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                          {r.paymentMethod} ({r.payoutNumber})
                        </td>
                        <td className="p-3 font-extrabold text-emerald-600">
                          ৳{r.availableBalance?.toLocaleString() || 0}
                        </td>
                        <td className="p-3 font-bold">৳{r.totalSales?.toLocaleString() || 0}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {r.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateResellerStatus(r.id, 'approved')}
                                className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                অনুমোদন
                              </button>
                            )}
                            {r.status === 'approved' ? (
                              <button
                                onClick={() => handleUpdateResellerStatus(r.id, 'suspended')}
                                className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold hover:bg-rose-200 cursor-pointer"
                              >
                                স্থগিত
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateResellerStatus(r.id, 'approved')}
                                className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-200 cursor-pointer"
                              >
                                সক্রিয়
                              </button>
                            )}
                            <button
                              onClick={() => setAdjustmentReseller(r)}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200 cursor-pointer"
                            >
                              অ্যাডজাস্ট
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Admin Wallet Adjust Modal */}
              {adjustmentReseller && (
                <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg space-y-3 max-w-md">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">
                      রিসেলার ওয়ালেট সমন্বয়: {adjustmentReseller.shopName}
                    </h4>
                    <button onClick={() => setAdjustmentReseller(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAdminWalletAdjustment} className="space-y-3 text-xs">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAdjustType('admin_credit')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border ${
                          adjustType === 'admin_credit' ? 'bg-emerald-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        + টাকা যোগ করুন (Credit)
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustType('admin_debit')}
                        className={`flex-1 py-1.5 rounded-lg font-bold border ${
                          adjustType === 'admin_debit' ? 'bg-rose-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        - টাকা কর্তন করুন (Debit)
                      </button>
                    </div>
                    <div>
                      <label className="font-bold block mb-1">পরিমাণ (৳)</label>
                      <input
                        type="number"
                        required
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">সমন্বয়ের কারণ (Audit Reason)</label>
                      <input
                        type="text"
                        required
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        placeholder="যেমন: মাসিক স্পেশাল সেলস বোনাস"
                        className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border rounded-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer"
                    >
                      নিশ্চিত করুন
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* WITHDRAWALS MANAGEMENT */}
          {activeModule === 'withdrawals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t('manageWithdrawals')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    বিকাশ ও নগদ উত্তোলনের অনুরোধ যাচাই করুন এবং TrxID দিয়ে পেইড কনফার্ম করুন
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-3">উত্তোলন আইডি</th>
                      <th className="p-3">রিসেলার তথ্য</th>
                      <th className="p-3">মাধ্যম ও একাউন্ট</th>
                      <th className="p-3">পরিমাণ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                      <th className="p-3">পেমেন্ট ট্রানজেকশন আইডি (TrxID)</th>
                      <th className="p-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {w.id}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{w.resellerName}</p>
                          <span className="text-[11px] text-slate-500">{w.resellerPhone}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                          {w.paymentMethod}: {w.accountNumber}
                        </td>
                        <td className="p-3 font-extrabold text-emerald-600 text-sm">৳{w.amount}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              w.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : w.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {w.status === 'paid' ? (
                            <span className="font-mono font-bold text-emerald-600">{w.transactionRef}</span>
                          ) : w.status === 'rejected' ? (
                            <span className="text-rose-500 text-[11px]">{w.rejectionReason}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="e.g. BKASH98273"
                              value={payoutRefInput[w.id] || ''}
                              onChange={(e) => setPayoutRefInput({ ...payoutRefInput, [w.id]: e.target.value })}
                              className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border rounded-lg font-mono text-xs w-36 uppercase"
                            />
                          )}
                        </td>
                        <td className="p-3">
                          {w.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleProcessWithdrawal(w.id, 'paid', payoutRefInput[w.id] || 'BKASH_MANUAL')}
                                className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                              >
                                পেইড মার্ক
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter rejection reason (funds will refund to reseller):');
                                  if (reason) handleProcessWithdrawal(w.id, 'rejected', '', reason);
                                }}
                                className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold hover:bg-rose-200 cursor-pointer"
                              >
                                রিজেক্ট
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUPPLIERS & DROPSHIPPING */}
          {activeModule === 'suppliers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ড্রপশিপিং সাপ্লায়ার পার্টনার ম্যানেজমেন্ট
                  </h3>
                  <p className="text-xs text-slate-500">
                    সাপ্লায়ারদের সাথে যোগাযোগ ও পণ্য সোর্সিং তালিকা
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.map((s) => (
                  <div key={s.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-slate-500">কন্টাক্ট পারসন: {s.contactPerson}</p>
                    <p className="text-slate-500">ফোন: {s.phone}</p>
                    <p className="text-slate-500">ঠিকানা: {s.address}</p>
                    <div className="pt-2 border-t flex justify-between font-bold text-slate-700 dark:text-slate-300">
                      <span>ম্যাপড প্রোডাক্টস: {s.productsCount} টি</span>
                      <span>রেটিং: ★ {s.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS & PAYMENT METHODS */}
          {activeModule === 'settings' && settings && (
            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5 max-w-3xl text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    <span>পেমেন্ট মেথড ও ওয়েবসাইট সেটিংস</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    অর্ডার করার সময় কাস্টমাররা কোন কোন মাধ্যমে টাকা পরিশোধ করতে পারবে তা নিয়ন্ত্রণ করুন
                  </p>
                </div>

                {/* Sub Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl font-bold">
                  <button
                    onClick={() => setSettingsTab('payments')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      settingsTab === 'payments'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    পেমেন্ট মেথড (বিকাশ/নগদ/রকেট/ক্যাশ)
                  </button>
                  <button
                    onClick={() => setSettingsTab('general')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      settingsTab === 'general'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    ডেলিভারি চার্জ ও সাধারণ
                  </button>
                </div>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              {/* 1. PAYMENT METHODS SUB-TAB */}
              {settingsTab === 'payments' && (
                <div className="space-y-4">
                  {/* Cash on Delivery (COD) */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">ক্যাশ অন ডেলিভারি (COD)</h4>
                          <span className="text-[11px] text-slate-500">পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.codEnabled ?? true}
                          onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="font-bold block mb-1">কাস্টমার নির্দেশিকা (COD Note)</label>
                      <input
                        type="text"
                        value={settings.codInstructions ?? 'পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন।'}
                        onChange={(e) => setSettings({ ...settings, codInstructions: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl"
                      />
                    </div>
                  </div>

                  {/* bKash Payment Gateway */}
                  <div className="p-4 rounded-2xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/40 dark:bg-pink-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-pink-600 text-white font-black flex items-center justify-center text-xs">
                          বি
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-pink-900 dark:text-pink-300">bKash (বিকাশ পেমেন্ট)</h4>
                          <span className="text-[11px] text-slate-500">বিকাশ মোবাইল ব্যাংকিং</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.bkashEnabled ?? true}
                          onChange={(e) => setSettings({ ...settings, bkashEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-pink-950 dark:text-pink-200">বিকাশ নম্বর *</label>
                        <input
                          type="text"
                          value={settings.bkashNumber ?? '01700-000000'}
                          onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                          placeholder="০১৭০০-০০০০০০"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-pink-300 dark:border-pink-800 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-pink-950 dark:text-pink-200">একাউন্ট ধরন</label>
                        <select
                          value={settings.bkashAccountType ?? 'Personal'}
                          onChange={(e) => setSettings({ ...settings, bkashAccountType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-pink-300 dark:border-pink-800 rounded-xl font-bold"
                        >
                          <option value="Personal">পার্সোনাল (Send Money)</option>
                          <option value="Merchant">মার্চেন্ট (Payment)</option>
                          <option value="Agent">এজেন্ট (Cash In)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-pink-950 dark:text-pink-200">কাস্টমারদের জন্য পেমেন্ট নির্দেশনা</label>
                      <textarea
                        rows={2}
                        value={settings.bkashInstructions ?? 'বিকাশ পার্সোনাল নম্বরে Send Money করুন। সফল পেমেন্টের পর প্রাপ্ত TrxID নিচে লিখুন।'}
                        onChange={(e) => setSettings({ ...settings, bkashInstructions: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-pink-300 dark:border-pink-800 rounded-xl resize-none"
                      />
                    </div>
                  </div>

                  {/* Nagad Payment Gateway */}
                  <div className="p-4 rounded-2xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-600 text-white font-black flex items-center justify-center text-xs">
                          ন
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-orange-900 dark:text-orange-300">Nagad (নগদ পেমেন্ট)</h4>
                          <span className="text-[11px] text-slate-500">নগদ মোবাইল ফাইন্যান্সিয়াল পেমেন্ট</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.nagadEnabled ?? true}
                          onChange={(e) => setSettings({ ...settings, nagadEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-orange-950 dark:text-orange-200">নগদ নম্বর *</label>
                        <input
                          type="text"
                          value={settings.nagadNumber ?? '01800-000000'}
                          onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                          placeholder="০১৮০০-০০০০০০"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-orange-950 dark:text-orange-200">একাউন্ট ধরন</label>
                        <select
                          value={settings.nagadAccountType ?? 'Personal'}
                          onChange={(e) => setSettings({ ...settings, nagadAccountType: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl font-bold"
                        >
                          <option value="Personal">পার্সোনাল (Send Money)</option>
                          <option value="Merchant">মার্চেন্ট (Payment)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold block mb-1 text-orange-950 dark:text-orange-200">কাস্টমারদের জন্য পেমেন্ট নির্দেশনা</label>
                      <textarea
                        rows={2}
                        value={settings.nagadInstructions ?? 'নগদ পার্সোনাল নম্বরে Send Money করুন এবং TrxID নিচে লিখুন।'}
                        onChange={(e) => setSettings({ ...settings, nagadInstructions: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-orange-300 dark:border-orange-800 rounded-xl resize-none"
                      />
                    </div>
                  </div>

                  {/* Rocket Payment Gateway */}
                  <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-xs">
                          র
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-purple-900 dark:text-purple-300">Rocket (রকেট পেমেন্ট)</h4>
                          <span className="text-[11px] text-slate-500">ডাচ-বাংলা রকেট মোবাইল ব্যাংকিং</span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.rocketEnabled ?? false}
                          onChange={(e) => setSettings({ ...settings, rocketEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1 text-purple-950 dark:text-purple-200">রকেট নম্বর (১২ ডিজিট)</label>
                        <input
                          type="text"
                          value={settings.rocketNumber ?? ''}
                          onChange={(e) => setSettings({ ...settings, rocketNumber: e.target.value })}
                          placeholder="০১৯০০-০০০০০০-৮"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded-xl font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1 text-purple-950 dark:text-purple-200">পেমেন্ট নির্দেশনা</label>
                        <input
                          type="text"
                          value={settings.rocketInstructions ?? 'রকেট নম্বরে Send Money করুন এবং TrxID নিচে লিখুন।'}
                          onChange={(e) => setSettings({ ...settings, rocketInstructions: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. GENERAL SUB-TAB */}
              {settingsTab === 'general' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold block mb-1">ওয়েবসাইট নাম</label>
                    <input
                      type="text"
                      value={settings.websiteName}
                      onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold block mb-1">ট্যাগলাইন (বাংলা)</label>
                    <input
                      type="text"
                      value={settings.taglineBn}
                      onChange={(e) => setSettings({ ...settings, taglineBn: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1">ঢাকার ভিতরে ডেলিভারি চার্জ (৳)</label>
                      <input
                        type="number"
                        value={settings.deliveryChargeInsideDhaka}
                        onChange={(e) => setSettings({ ...settings, deliveryChargeInsideDhaka: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</label>
                      <input
                        type="number"
                        value={settings.deliveryChargeOutsideDhaka}
                        onChange={(e) => setSettings({ ...settings, deliveryChargeOutsideDhaka: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold block mb-1">সর্বনিম্ন উত্তোলনের পরিমাণ (৳)</label>
                    <input
                      type="number"
                      value={settings.minWithdrawalAmount}
                      onChange={(e) => setSettings({ ...settings, minWithdrawalAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl"
                    />
                  </div>

                  {/* Google AI Studio Code Export */}
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-bold text-sm text-purple-950 dark:text-purple-200">
                        গুগল এআই স্টুডিও সোর্স কোড ডাউনলোড (ZIP)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      অন্য কোনো Google AI Studio প্রজেক্টে বা লোকাল কম্পিউটারে এই সম্পূর্ণ ওয়েবসাইটটি চালাতে পুরো সোর্স কোড জিপ (ZIP) আকারে ডাউনলোড করে নিন।
                    </p>
                    <a
                      href="/shoplix-ecommerce-source-code.zip"
                      download="shoplix-ecommerce-source-code.zip"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <FileText className="w-4 h-4" />
                      <span>সম্পূর্ণ প্রজেক্ট ডাউনলোড করুন (ZIP)</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  disabled={savingSettings}
                  onClick={async () => {
                    setSavingSettings(true);
                    try {
                      await saveSettings(settings);
                      setSettingsSuccessMsg('পেমেন্ট মেথড ও সেটিংস সফলভাবে আপডেট হয়েছে!');
                      setTimeout(() => setSettingsSuccessMsg(null), 3500);
                    } catch (e) {
                      alert('Failed to save settings');
                    } finally {
                      setSavingSettings(false);
                    }
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer shadow-md flex items-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'সংরক্ষণ করা হচ্ছে...' : 'পেমেন্ট মেথড ও সেটিংস সেভ করুন'}</span>
                </button>
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeModule === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('auditLogs')}
              </h3>
              <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold border-b">
                    <tr>
                      <th className="p-3">সময়</th>
                      <th className="p-3">এডমিন ইমেইল</th>
                      <th className="p-3">অ্যাকশন</th>
                      <th className="p-3">বিস্তারিত বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{log.adminEmail}</td>
                        <td className="p-3 uppercase font-bold text-emerald-600">{log.action}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SAFE PRODUCT DELETE CONFIRMATION MODAL */}
        {productToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  প্রোডাক্টটি কি নিশ্চিত কেটে দিতে (ডিলিট করতে) চান?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  কেটে দিলে এটি আপনার ওয়েবসাইট ও ক্যাটালগ থেকে সাথে সাথে মুছে যাবে।
                </p>
              </div>

              {/* Product preview card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                <img
                  src={productToDelete.images[0]}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 flex-shrink-0"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {productToDelete.nameBn || productToDelete.name}
                  </p>
                  <span className="text-[11px] text-teal-600 font-mono font-bold block mt-0.5">
                    SKU: {productToDelete.sku || productToDelete.id}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-black text-emerald-600">
                      বেস: ৳{productToDelete.resellerBasePrice}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      স্টক: {productToDelete.stock} পিস
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={deletingProductId !== null}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  না, বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => confirmDeleteProduct(productToDelete)}
                  disabled={deletingProductId !== null}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deletingProductId ? 'কেটে ফেলা হচ্ছে...' : 'হ্যাঁ, কেটে দিন (Delete)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
