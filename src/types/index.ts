export type UserRole = 'customer' | 'reseller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  address?: string;
  district?: string;
  walletBalance?: number;
  rewardPoints?: number;
  createdAt: string;
  updatedAt?: string;
}

export type ResellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Reseller {
  id: string; // usually matching auth.uid or custom ID
  userId: string;
  resellerCode: string; // e.g. SLX-7821
  shopName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: ResellerStatus;
  paymentMethod: 'bKash' | 'Nagad';
  payoutNumber: string;
  address: string;
  district?: string;
  totalSales: number;
  totalOrders: number;
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
  withdrawnBalance: number;
  commissionRate?: number; // optional custom percentage
  createdAt: string;
  updatedAt?: string;
}

export interface ProductVariation {
  sizes?: string[];
  colors?: string[];
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  subCategory?: string;
  images: string[];
  regularPrice: number;
  salePrice: number;
  resellerBasePrice: number;
  resellerCommission: number; // default estimated commission
  sku?: string;
  maxSalePrice?: number;
  stock: number;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  status: 'active' | 'draft' | 'out_of_stock';
  supplierId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  iconName: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customSellingPrice?: number; // for reseller placed orders
}

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type CommissionStatus = 'pending' | 'approved' | 'available' | 'reversed' | 'paid';

export interface Wallet {
  id: string;
  resellerId: string;
  availableBalance: number;
  pendingEarnings: number;
  totalEarned: number;
  totalWithdrawn: number;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  nameBn?: string;
  image: string;
  price: number;
  resellerBasePrice: number;
  commission: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  district: string;
  fullAddress: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: OrderShippingAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  resellerId?: string;
  resellerCode?: string;
  resellerCommission?: number;
  commissionStatus?: CommissionStatus;
  supplierId?: string;
  supplierAssignedName?: string;
  notes?: string;
  bKashTrxId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type TransactionType =
  | 'commission_credit'
  | 'withdrawal_request'
  | 'withdrawal_payment'
  | 'refund_reversal'
  | 'admin_credit'
  | 'admin_debit';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'reversed';

export interface Transaction {
  id: string;
  resellerId: string;
  type: TransactionType;
  amount: number;
  previousBalance: number;
  newBalance: number;
  status: TransactionStatus;
  description: string;
  orderId?: string;
  withdrawalId?: string;
  createdAt: string;
}

export type WithdrawalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'processing'
  | 'paid'
  | 'rejected';

export interface Withdrawal {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerPhone: string;
  paymentMethod: 'bKash' | 'Nagad';
  accountNumber: string;
  amount: number;
  status: WithdrawalStatus;
  transactionRef?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'commission' | 'withdrawal' | 'announcement';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface StoreSettings {
  id: string;
  websiteName: string;
  tagline: string;
  taglineBn: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  minWithdrawalAmount: number;
  defaultCommissionPercent: number;
  heroBannerTitle: string;
  heroBannerTitleBn: string;
  heroBannerSubtitle: string;
  heroBannerSubtitleBn: string;
  heroBannerImage: string;
  facebookUrl?: string;
  whatsappNumber?: string;
  // Payment methods editable by Admin
  codEnabled?: boolean;
  codInstructions?: string;
  bkashEnabled?: boolean;
  bkashNumber?: string;
  bkashAccountType?: 'Personal' | 'Merchant' | 'Agent';
  bkashInstructions?: string;
  nagadEnabled?: boolean;
  nagadNumber?: string;
  nagadAccountType?: 'Personal' | 'Merchant';
  nagadInstructions?: string;
  rocketEnabled?: boolean;
  rocketNumber?: string;
  rocketInstructions?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productsCount: number;
  rating: number;
  active: boolean;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: string;
  targetId?: string;
  createdAt: string;
}
