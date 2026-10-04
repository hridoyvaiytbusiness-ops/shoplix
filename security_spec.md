# SHOPLIX Firestore Security Specification

## 1. Data Invariants

1. **Identity & Role Invariant**: Users can never elevate their own role to `admin` or modify their `role` field directly. Admin access is reserved for verified admin accounts (bootstrapped admin: `hridoyvaiytbusiness@gmail.com`).
2. **Financial Wallet Invariant**: Resellers cannot update their `availableBalance`, `withdrawnBalance`, or `pendingEarnings` directly from the client. Wallet balance adjustments only occur via validated atomic transactions or admin actions with complete audit trails.
3. **Reseller Application Invariant**: Resellers create applications with `status == 'pending'`. Only an administrator can update the status to `approved`, `rejected`, or `suspended`.
4. **Order Integrity Invariant**: Order creation must include valid customer details and item lists. Price calculations and reseller attribution must be retained immutably once placed. Only admins can transition order status to `delivered`, `cancelled`, or `refunded`.
5. **Withdrawal Invariant**: Resellers can request withdrawals only for an amount greater than or equal to the minimum withdrawal threshold (৳500), and only when the reseller is `approved`. Withdrawals are created in `pending` status. Status cannot be modified by the reseller once submitted.
6. **Immutable Ledger Invariant**: `transactions` records are immutable once written; they cannot be updated or deleted by normal users.
7. **PII Isolation Invariant**: Users can only read and write their own profile information (`users/{userId}` where `request.auth.uid == userId`) unless they are an admin.

## 2. The "Dirty Dozen" Payloads

1. **Self-Role-Escalation**: Unprivileged user sends `update` on `users/{userId}` with `{ role: 'admin' }`.
   - *Result*: DENIED.
2. **Ghost Field Injection**: Reseller submits application with `{ isVerified: true, status: 'approved' }`.
   - *Result*: DENIED.
3. **Wallet Direct Mutation**: Reseller attempts `update` on `wallets/{walletId}` with `{ availableBalance: 999999 }`.
   - *Result*: DENIED.
4. **Forged Ledger Transaction**: Attacker attempts to insert a record into `transactions` with `{ type: 'admin_credit', amount: 50000 }`.
   - *Result*: DENIED.
5. **Withdrawal Self-Approval**: Reseller sends `update` on `withdrawals/{id}` setting `{ status: 'paid', transactionRef: 'BKASH123456' }`.
   - *Result*: DENIED.
6. **Order Tampering After Delivery**: Customer attempts to edit `orders/{id}` to change `{ orderStatus: 'cancelled' }` when already marked `delivered`.
   - *Result*: DENIED.
7. **Cross-User Profile Peeking**: User A attempts to read `users/{userB}`'s private address and phone number.
   - *Result*: DENIED.
8. **Catalog Price Poisoning**: Non-admin attempts to create or update `products/{productId}` with reduced prices.
   - *Result*: DENIED.
9. **Fake Email Admin Spoof**: Unverified email attempts admin operations without verification token.
   - *Result*: DENIED.
10. **Huge Junk ID Injection**: Client attempts write to `products/{1.5KB_long_string}` to trigger resource exhaustion.
    - *Result*: DENIED.
11. **Negative Withdrawal Attack**: User attempts withdrawal with negative amount `{ amount: -5000 }` to artificially manipulate balances.
    - *Result*: DENIED.
12. **Settings Overwrite**: Unauthenticated user or customer writes to `settings/platform`.
    - *Result*: DENIED.
