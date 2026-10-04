import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Product,
  Category,
  Order,
  Reseller,
  Wallet,
  Transaction,
  Withdrawal,
  NotificationItem,
  StoreSettings,
  Supplier,
  AuditLog,
  OrderStatus,
  WithdrawalStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_SUPPLIERS,
} from '../data/seedData';

// Seed database on first launch if empty
export async function seedInitialDataIfNeeded(): Promise<void> {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', 'platform'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'settings', 'platform'), INITIAL_SETTINGS);

      // Seed categories
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }

      // Seed products
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }

      // Seed suppliers
      for (const sup of INITIAL_SUPPLIERS) {
        await setDoc(doc(db, 'suppliers', sup.id), sup);
      }
    }
  } catch (error) {
    console.warn('Initial seeding note (ignorable if permissions locked to read-only initially):', error);
  }
}

// ---------------- PRODUCTS ----------------
const PRODUCTS_STORAGE_KEY = 'shoplix_admin_products';
const DELETED_PRODUCTS_KEY = 'shoplix_deleted_product_ids';

export async function fetchProducts(): Promise<Product[]> {
  let deletedSet = new Set<string>();
  try {
    const rawDeleted = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (rawDeleted) {
      const arr = JSON.parse(rawDeleted);
      if (Array.isArray(arr)) {
        deletedSet = new Set(arr.map((id) => String(id).trim()));
      }
    }
  } catch (e) {
    console.warn('Error reading deleted products set:', e);
  }

  // Load locally saved products
  let localProducts: Product[] = [];
  try {
    const rawLocal = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        localProducts = parsed.filter((p) => p && p.id && !deletedSet.has(String(p.id).trim()));
      }
    }
  } catch (e) {
    console.warn('Error reading local products:', e);
  }

  const productMap = new Map<string, Product>();

  // If local storage has items, seed the map with local versions first (or after)
  localProducts.forEach((lp) => {
    productMap.set(String(lp.id).trim(), lp);
  });

  try {
    const snap = await getDocs(collection(db, 'products'));

    if (!snap.empty) {
      snap.forEach((d) => {
        const id = String(d.id).trim();
        if (!deletedSet.has(id)) {
          const remoteProd = { ...(d.data() as Product), id };
          const existingLocal = productMap.get(id);

          if (!existingLocal) {
            productMap.set(id, remoteProd);
          } else {
            // Compare timestamps: keep whichever was updated more recently
            const localTime = new Date(existingLocal.updatedAt || 0).getTime();
            const remoteTime = new Date(remoteProd.updatedAt || 0).getTime();
            if (remoteTime > localTime) {
              productMap.set(id, remoteProd);
            }
          }
        }
      });
    }
  } catch (error) {
    console.warn('Firestore fetch products note (using local/seed data):', error);
  }

  // If empty, initialize with INITIAL_PRODUCTS
  if (productMap.size === 0) {
    INITIAL_PRODUCTS.forEach((p) => {
      const id = String(p.id).trim();
      if (!deletedSet.has(id)) {
        productMap.set(id, p);
      }
    });
  }

  const result = Array.from(productMap.values());
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.warn('Failed to cache products to localStorage:', e);
  }

  return result;
}

export async function saveProduct(product: Product): Promise<void> {
  const cleanId = String(product.id || `prod-${Date.now()}`).trim();
  const updatedProduct: Product = {
    ...product,
    id: cleanId,
    name: product.name?.trim() || product.nameBn?.trim() || 'Product',
    nameBn: product.nameBn?.trim() || product.name?.trim() || 'প্রোডাক্ট',
    resellerBasePrice: Number(product.resellerBasePrice) || 500,
    maxSalePrice: Number(product.maxSalePrice) || Number(product.regularPrice) || Math.round((Number(product.resellerBasePrice) || 500) * 1.5),
    salePrice: Number(product.salePrice) || Number(product.resellerBasePrice) || 500,
    regularPrice: Number(product.regularPrice) || Number(product.maxSalePrice) || 1000,
    stock: Number(product.stock) >= 0 ? Number(product.stock) : 50,
    sku: product.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`,
    images: Array.isArray(product.images) && product.images.length > 0 && product.images[0]
      ? product.images
      : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80'],
    updatedAt: new Date().toISOString(),
  };

  // 1. Immediately remove from deleted set if it was previously marked deleted
  try {
    const rawDeleted = localStorage.getItem(DELETED_PRODUCTS_KEY);
    if (rawDeleted) {
      const arr = JSON.parse(rawDeleted);
      if (Array.isArray(arr)) {
        const next = arr.filter((id) => String(id).trim() !== cleanId);
        localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(next));
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // 2. Immediately update local storage so UI updates instantly
  try {
    const rawLocal = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    let list: Product[] = [];
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) list = parsed;
    }

    const index = list.findIndex((p) => String(p.id).trim() === cleanId);
    if (index >= 0) {
      list[index] = updatedProduct;
    } else {
      list.unshift(updatedProduct);
    }
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Local storage save product note:', e);
  }

  // 3. Persist to Firestore
  try {
    await setDoc(doc(db, 'products', cleanId), updatedProduct, { merge: true });
  } catch (error) {
    console.warn('Firestore setDoc product note (stored locally):', error);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  const cleanId = String(productId).trim();

  // 1. Record in deleted list
  try {
    const rawDeleted = localStorage.getItem(DELETED_PRODUCTS_KEY);
    let list: string[] = [];
    if (rawDeleted) {
      const parsed = JSON.parse(rawDeleted);
      if (Array.isArray(parsed)) list = parsed.map((id) => String(id).trim());
    }
    if (!list.includes(cleanId)) {
      list.push(cleanId);
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Local storage delete product key note:', e);
  }

  // 2. Remove from local saved list
  try {
    const rawLocal = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (rawLocal) {
      const parsed: Product[] = JSON.parse(rawLocal);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((p) => String(p.id).trim() !== cleanId);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
      }
    }
  } catch (e) {
    console.warn('Local storage delete product note:', e);
  }

  // 3. Delete from Firestore
  try {
    await deleteDoc(doc(db, 'products', cleanId));
  } catch (error) {
    console.warn('Firestore deleteDoc note (deleted locally):', error);
  }
}

export async function resetProductsToInitial(): Promise<void> {
  try {
    localStorage.removeItem(DELETED_PRODUCTS_KEY);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  } catch (e) {
    console.warn(e);
  }
}

// ---------------- CATEGORIES ----------------
export async function fetchCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) return INITIAL_CATEGORIES;
    const cats: Category[] = [];
    snap.forEach((d) => cats.push({ ...(d.data() as Category), id: d.id }));
    return cats;
  } catch (error) {
    return INITIAL_CATEGORIES;
  }
}

// ---------------- ORDERS ----------------
const ORDERS_STORAGE_KEY = 'shoplix_admin_orders';

export async function createOrder(order: Order): Promise<void> {
  const cleanOrder: Order = {
    ...order,
    id: order.id || `ord-${Date.now()}`,
    orderNumber: order.orderNumber || `SLX-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: order.createdAt || new Date().toISOString(),
  };

  // 1. Immediately cache order locally so customer order NEVER fails or gets lost
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    let list: Order[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    }
    const idx = list.findIndex((o) => o.id === cleanOrder.id);
    if (idx >= 0) {
      list[idx] = cleanOrder;
    } else {
      list.unshift(cleanOrder);
    }
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Local storage order cache note:', e);
  }

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'orders', cleanOrder.id), cleanOrder);

    // If order is attributed to an approved reseller, update reseller's pending earnings & stats
    if (cleanOrder.resellerId && cleanOrder.resellerCommission && cleanOrder.resellerCommission > 0) {
      try {
        const resellerRef = doc(db, 'resellers', cleanOrder.resellerId);
        const resellerSnap = await getDoc(resellerRef);
        if (resellerSnap.exists()) {
          const resData = resellerSnap.data() as Reseller;
          const currentPending = resData.pendingEarnings || 0;
          const currentTotalSales = resData.totalSales || 0;
          const currentTotalOrders = resData.totalOrders || 0;

          await updateDoc(resellerRef, {
            pendingEarnings: currentPending + cleanOrder.resellerCommission,
            totalSales: currentTotalSales + cleanOrder.totalAmount,
            totalOrders: currentTotalOrders + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (resErr) {
        console.warn('Could not update reseller pending immediately:', resErr);
      }
    }

    // Create notification for customer or reseller
    if (cleanOrder.customerId) {
      await createNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: cleanOrder.customerId,
        title: 'Order Placed Successfully',
        message: `Your order #${cleanOrder.orderNumber} for ৳${cleanOrder.totalAmount} has been placed.`,
        type: 'order',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    if (cleanOrder.resellerId) {
      await createNotification({
        id: `notif-res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: cleanOrder.resellerId,
        title: 'New Customer Order Attributed',
        message: `New order #${cleanOrder.orderNumber} placed via your store! Potential profit: ৳${cleanOrder.resellerCommission}.`,
        type: 'order',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn('Firestore setDoc order note (order successfully saved locally):', error);
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  const orderMap = new Map<string, Order>();

  // 1. Read locally saved orders first
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((o) => {
          if (o && o.id) orderMap.set(o.id, o);
        });
      }
    }
  } catch (e) {
    console.warn('Local storage orders read note:', e);
  }

  // 2. Fetch Firestore orders and merge
  try {
    const snap = await getDocs(collection(db, 'orders'));
    if (!snap.empty) {
      snap.forEach((d) => {
        const remote = { ...(d.data() as Order), id: d.id };
        const local = orderMap.get(d.id);
        if (!local) {
          orderMap.set(d.id, remote);
        } else {
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime();
          const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime();
          if (remoteTime > localTime) {
            orderMap.set(d.id, remote);
          }
        }
      });
    }
  } catch (error) {
    console.warn('Firestore fetch orders note (using local cache):', error);
  }

  const list = Array.from(orderMap.values());
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignorable
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  const all = await fetchAllOrders();
  return all.filter((o) => o.customerId === customerId);
}

export async function fetchResellerOrders(resellerId: string): Promise<Order[]> {
  const all = await fetchAllOrders();
  return all.filter((o) => o.resellerId === resellerId);
}

// Crucial: When admin marks order as 'delivered', reseller's commission transitions from 'pending' to 'available'
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminEmail: string
): Promise<void> {
  // 1. Immediately update local storage
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const list: Order[] = JSON.parse(raw);
      const idx = list.findIndex((o) => o.id === orderId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], orderStatus: newStatus, updatedAt: new Date().toISOString() };
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn(e);
  }

  const orderRef = doc(db, 'orders', orderId);
  try {
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return;

    const order = snap.data() as Order;
    const oldStatus = order.orderStatus;
    const updates: Partial<Order> = {
      orderStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };

    // If status moved to delivered and commission was pending, unlock commission
    if (
      newStatus === 'delivered' &&
      oldStatus !== 'delivered' &&
      order.resellerId &&
      order.resellerCommission &&
      order.commissionStatus !== 'available' &&
      order.commissionStatus !== 'paid'
    ) {
      updates.commissionStatus = 'approved';
      updates.paymentStatus = 'verified';

      // Credit reseller wallet
      const commissionAmt = order.resellerCommission;
      await creditResellerCommission(order.resellerId, commissionAmt, order.orderNumber, orderId);
    }

    // If order was cancelled or returned after approval, reverse
    if (
      (newStatus === 'cancelled' || newStatus === 'returned' || newStatus === 'refunded') &&
      oldStatus === 'delivered' &&
      order.resellerId &&
      order.resellerCommission &&
      order.commissionStatus === 'approved'
    ) {
      updates.commissionStatus = 'reversed';
      await reverseResellerCommission(order.resellerId, order.resellerCommission, order.orderNumber, orderId);
    }

    await updateDoc(orderRef, updates);

    // Notify customer
    if (order.customerId) {
      await createNotification({
        id: `notif-stat-${Date.now()}`,
        userId: order.customerId,
        title: `Order Status Updated: ${newStatus.toUpperCase()}`,
        message: `Your order #${order.orderNumber} is now marked as ${newStatus}.`,
        type: 'order',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Create audit log
    await createAuditLog({
      id: `audit-${Date.now()}`,
      adminId: 'admin',
      adminEmail,
      action: 'UPDATE_ORDER_STATUS',
      details: `Changed order #${order.orderNumber} status from ${oldStatus} to ${newStatus}`,
      targetId: orderId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore updateOrderStatus note (updated locally):', error);
  }
}

// ---------------- RESELLERS & WALLET ----------------
export async function getResellerByUserId(userId: string): Promise<Reseller | null> {
  try {
    const snap = await getDoc(doc(db, 'resellers', userId));
    if (snap.exists()) {
      return snap.data() as Reseller;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getResellerByCode(code: string): Promise<Reseller | null> {
  try {
    const q = query(collection(db, 'resellers'), where('resellerCode', '==', code.toUpperCase()), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Reseller;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function getAllResellers(): Promise<Reseller[]> {
  try {
    const snap = await getDocs(collection(db, 'resellers'));
    const list: Reseller[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as Reseller), id: d.id }));
    return list;
  } catch (error) {
    console.warn('Could not fetch all resellers:', error);
    return [];
  }
}

export async function submitResellerApplication(reseller: Reseller): Promise<void> {
  const path = `resellers/${reseller.id}`;
  try {
    await setDoc(doc(db, 'resellers', reseller.id), reseller);
    // Also create initial wallet record
    await setDoc(doc(db, 'wallets', reseller.id), {
      id: reseller.id,
      resellerId: reseller.id,
      availableBalance: 0,
      pendingEarnings: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateResellerStatus(
  resellerId: string,
  newStatus: Reseller['status'],
  adminEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'resellers', resellerId), {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    await createNotification({
      id: `notif-res-status-${Date.now()}`,
      userId: resellerId,
      title: `Reseller Account Status: ${newStatus.toUpperCase()}`,
      message: `Your reseller account status has been updated to ${newStatus}.`,
      type: 'announcement',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    await createAuditLog({
      id: `audit-${Date.now()}`,
      adminId: 'admin',
      adminEmail,
      action: 'UPDATE_RESELLER_STATUS',
      details: `Updated reseller ${resellerId} status to ${newStatus}`,
      targetId: resellerId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update reseller status:', error);
    throw error;
  }
}

export async function creditResellerCommission(
  resellerId: string,
  amount: number,
  orderNumber: string,
  orderId: string
): Promise<void> {
  const resellerRef = doc(db, 'resellers', resellerId);
  const walletRef = doc(db, 'wallets', resellerId);

  try {
    await runTransaction(db, async (txn) => {
      const resSnap = await txn.get(resellerRef);
      const prevAvailable = resSnap.exists() ? (resSnap.data().availableBalance || 0) : 0;
      const prevPending = resSnap.exists() ? (resSnap.data().pendingEarnings || 0) : 0;
      const prevEarned = resSnap.exists() ? (resSnap.data().totalEarnings || 0) : 0;

      const newAvailable = prevAvailable + amount;
      const newPending = Math.max(0, prevPending - amount);
      const newEarned = prevEarned + amount;

      txn.update(resellerRef, {
        availableBalance: newAvailable,
        pendingEarnings: newPending,
        totalEarnings: newEarned,
        updatedAt: new Date().toISOString(),
      });

      txn.set(
        walletRef,
        {
          id: resellerId,
          resellerId,
          availableBalance: newAvailable,
          pendingEarnings: newPending,
          totalEarned: newEarned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Create ledger transaction
      const trxId = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const trxRef = doc(db, 'transactions', trxId);
      const txData: Transaction = {
        id: trxId,
        resellerId,
        type: 'commission_credit',
        amount,
        previousBalance: prevAvailable,
        newBalance: newAvailable,
        status: 'completed',
        description: `Delivered Order Commission #${orderNumber}`,
        orderId,
        createdAt: new Date().toISOString(),
      };
      txn.set(trxRef, txData);
    });

    await createNotification({
      id: `notif-com-${Date.now()}`,
      userId: resellerId,
      title: 'Commission Credited! ৳' + amount,
      message: `Order #${orderNumber} delivered successfully. ৳${amount} has been added to your available balance.`,
      type: 'commission',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Failed to credit reseller commission:', e);
  }
}

export async function reverseResellerCommission(
  resellerId: string,
  amount: number,
  orderNumber: string,
  orderId: string
): Promise<void> {
  const resellerRef = doc(db, 'resellers', resellerId);
  try {
    await runTransaction(db, async (txn) => {
      const resSnap = await txn.get(resellerRef);
      if (!resSnap.exists()) return;
      const prev = resSnap.data().availableBalance || 0;
      const next = Math.max(0, prev - amount);

      txn.update(resellerRef, {
        availableBalance: next,
        updatedAt: new Date().toISOString(),
      });

      const trxId = `TRX-${Date.now()}-REV`;
      const trxRef = doc(db, 'transactions', trxId);
      txn.set(trxRef, {
        id: trxId,
        resellerId,
        type: 'refund_reversal',
        amount,
        previousBalance: prev,
        newBalance: next,
        status: 'completed',
        description: `Reversal for returned/cancelled order #${orderNumber}`,
        orderId,
        createdAt: new Date().toISOString(),
      });
    });
  } catch (e) {
    console.error('Failed to reverse commission:', e);
  }
}

// ---------------- WITHDRAWALS ----------------
export async function submitWithdrawalRequest(
  reseller: Reseller,
  amount: number,
  paymentMethod: 'bKash' | 'Nagad',
  accountNumber: string
): Promise<string> {
  if (amount < 500) {
    throw new Error('Minimum withdrawal amount is ৳500.');
  }
  if (reseller.availableBalance < amount) {
    throw new Error('Insufficient available balance in your wallet.');
  }

  const withdrawalId = `WDR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const resellerRef = doc(db, 'resellers', reseller.id);

  await runTransaction(db, async (txn) => {
    const rSnap = await txn.get(resellerRef);
    if (!rSnap.exists()) throw new Error('Reseller record not found');
    const curBalance = rSnap.data().availableBalance || 0;
    if (curBalance < amount) throw new Error('Insufficient balance');

    const newBalance = curBalance - amount;

    // Deduct from available balance immediately so user cannot double-spend
    txn.update(resellerRef, {
      availableBalance: newBalance,
      updatedAt: new Date().toISOString(),
    });

    const withdrawal: Withdrawal = {
      id: withdrawalId,
      resellerId: reseller.id,
      resellerName: reseller.fullName,
      resellerPhone: reseller.phoneNumber,
      paymentMethod,
      accountNumber,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    txn.set(doc(db, 'withdrawals', withdrawalId), withdrawal);

    const trxId = `TRX-${Date.now()}-WDR`;
    txn.set(doc(db, 'transactions', trxId), {
      id: trxId,
      resellerId: reseller.id,
      type: 'withdrawal_request',
      amount,
      previousBalance: curBalance,
      newBalance,
      status: 'pending',
      description: `Withdrawal request to ${paymentMethod} (${accountNumber})`,
      withdrawalId,
      createdAt: new Date().toISOString(),
    });
  });

  return withdrawalId;
}

export async function fetchResellerWithdrawals(resellerId: string): Promise<Withdrawal[]> {
  try {
    const q = query(collection(db, 'withdrawals'), where('resellerId', '==', resellerId));
    const snap = await getDocs(q);
    const list: Withdrawal[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as Withdrawal), id: d.id }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Error fetching reseller withdrawals:', error);
    return [];
  }
}

export async function fetchAllWithdrawals(): Promise<Withdrawal[]> {
  try {
    const snap = await getDocs(collection(db, 'withdrawals'));
    const list: Withdrawal[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as Withdrawal), id: d.id }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Error fetching all withdrawals:', error);
    return [];
  }
}

export async function processWithdrawal(
  withdrawalId: string,
  newStatus: WithdrawalStatus,
  transactionRef: string,
  rejectionReason: string,
  adminEmail: string
): Promise<void> {
  const wRef = doc(db, 'withdrawals', withdrawalId);
  const snap = await getDoc(wRef);
  if (!snap.exists()) return;
  const w = snap.data() as Withdrawal;

  if (newStatus === 'paid') {
    await updateDoc(wRef, {
      status: 'paid',
      transactionRef: transactionRef || 'DIRECT_TRANSFER',
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update reseller's totalWithdrawn stat
    const rRef = doc(db, 'resellers', w.resellerId);
    const rSnap = await getDoc(rRef);
    if (rSnap.exists()) {
      const curWithdrawn = rSnap.data().withdrawnBalance || 0;
      await updateDoc(rRef, {
        withdrawnBalance: curWithdrawn + w.amount,
        updatedAt: new Date().toISOString(),
      });
    }

    await createNotification({
      id: `notif-paid-${Date.now()}`,
      userId: w.resellerId,
      title: 'Withdrawal Paid Successfully!',
      message: `৳${w.amount} has been sent to your ${w.paymentMethod} (${w.accountNumber}). Ref TrxID: ${transactionRef}`,
      type: 'withdrawal',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } else if (newStatus === 'rejected') {
    // If rejected, refund back to available balance!
    await updateDoc(wRef, {
      status: 'rejected',
      rejectionReason: rejectionReason || 'Information mismatch or rejected by admin',
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const rRef = doc(db, 'resellers', w.resellerId);
    const rSnap = await getDoc(rRef);
    if (rSnap.exists()) {
      const curBalance = rSnap.data().availableBalance || 0;
      await updateDoc(rRef, {
        availableBalance: curBalance + w.amount,
        updatedAt: new Date().toISOString(),
      });

      const trxId = `TRX-${Date.now()}-REJ`;
      await setDoc(doc(db, 'transactions', trxId), {
        id: trxId,
        resellerId: w.resellerId,
        type: 'admin_credit',
        amount: w.amount,
        previousBalance: curBalance,
        newBalance: curBalance + w.amount,
        status: 'completed',
        description: `Refund for rejected withdrawal #${w.id}. Reason: ${rejectionReason}`,
        withdrawalId,
        createdAt: new Date().toISOString(),
      });
    }

    await createNotification({
      id: `notif-rej-${Date.now()}`,
      userId: w.resellerId,
      title: 'Withdrawal Request Rejected',
      message: `Your request for ৳${w.amount} was rejected: ${rejectionReason}. The amount has been refunded back to your wallet.`,
      type: 'withdrawal',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    await updateDoc(wRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  await createAuditLog({
    id: `audit-${Date.now()}`,
    adminId: 'admin',
    adminEmail,
    action: 'PROCESS_WITHDRAWAL',
    details: `Processed withdrawal ${withdrawalId} as ${newStatus}. Ref: ${transactionRef}`,
    targetId: withdrawalId,
    createdAt: new Date().toISOString(),
  });
}

// ---------------- TRANSACTIONS ----------------
export async function fetchResellerTransactions(resellerId: string): Promise<Transaction[]> {
  try {
    const q = query(collection(db, 'transactions'), where('resellerId', '==', resellerId));
    const snap = await getDocs(q);
    const list: Transaction[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as Transaction), id: d.id }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Error fetching reseller transactions:', error);
    return [];
  }
}

export async function adminAdjustWallet(
  resellerId: string,
  amount: number,
  type: 'admin_credit' | 'admin_debit',
  reason: string,
  adminEmail: string
): Promise<void> {
  const resellerRef = doc(db, 'resellers', resellerId);
  await runTransaction(db, async (txn) => {
    const rSnap = await txn.get(resellerRef);
    if (!rSnap.exists()) throw new Error('Reseller not found');
    const curBalance = rSnap.data().availableBalance || 0;
    const newBalance = type === 'admin_credit' ? curBalance + amount : Math.max(0, curBalance - amount);

    txn.update(resellerRef, {
      availableBalance: newBalance,
      updatedAt: new Date().toISOString(),
    });

    const trxId = `TRX-ADJ-${Date.now()}`;
    txn.set(doc(db, 'transactions', trxId), {
      id: trxId,
      resellerId,
      type,
      amount,
      previousBalance: curBalance,
      newBalance,
      status: 'completed',
      description: `Admin manual adjustment: ${reason}`,
      createdAt: new Date().toISOString(),
    });
  });

  await createAuditLog({
    id: `audit-${Date.now()}`,
    adminId: 'admin',
    adminEmail,
    action: 'ADMIN_WALLET_ADJUST',
    details: `${type} of ৳${amount} for reseller ${resellerId}. Reason: ${reason}`,
    targetId: resellerId,
    createdAt: new Date().toISOString(),
  });
}

// ---------------- NOTIFICATIONS ----------------
export async function createNotification(notif: NotificationItem): Promise<void> {
  try {
    await setDoc(doc(db, 'notifications', notif.id), notif);
  } catch (e) {
    console.warn('Could not save notification:', e);
  }
}

export async function fetchUserNotifications(userId: string): Promise<NotificationItem[]> {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: NotificationItem[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as NotificationItem), id: d.id }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return [];
  }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
  } catch (e) {
    console.warn('Could not mark notif read:', e);
  }
}

// ---------------- AUDIT LOGS & SETTINGS ----------------
export async function createAuditLog(log: AuditLog): Promise<void> {
  try {
    await setDoc(doc(db, 'auditLogs', log.id), log);
  } catch (e) {
    console.warn('Could not record audit log:', e);
  }
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const list: AuditLog[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as AuditLog), id: d.id }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (e) {
    return [];
  }
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  try {
    const snap = await getDocs(collection(db, 'suppliers'));
    if (snap.empty) return INITIAL_SUPPLIERS;
    const list: Supplier[] = [];
    snap.forEach((d) => list.push({ ...(d.data() as Supplier), id: d.id }));
    return list;
  } catch (e) {
    return INITIAL_SUPPLIERS;
  }
}

export async function saveSupplier(supplier: Supplier): Promise<void> {
  try {
    await setDoc(doc(db, 'suppliers', supplier.id), supplier);
  } catch (e) {
    console.error('Could not save supplier:', e);
  }
}

export async function fetchSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'platform'));
    if (snap.exists()) return snap.data() as StoreSettings;
    return INITIAL_SETTINGS;
  } catch (e) {
    return INITIAL_SETTINGS;
  }
}

export async function saveSettings(settings: StoreSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'platform'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Could not save settings:', e);
  }
}
