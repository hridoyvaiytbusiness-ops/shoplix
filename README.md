# Shoplix E-Commerce & Reseller Platform

A full-featured Bangladeshi e-commerce and dropshipping/reseller platform built with React 19, TypeScript, Tailwind CSS, and Firebase.

## Features
- **Modern E-Commerce Storefront**: Product catalog, category filtering, search, sorting, wishlist, and cart drawer.
- **Reseller / Dropshipping System**: Custom selling prices, profit margins, referral links, and wallet balance with withdrawal requests.
- **Bangladeshi Payment Gateways**: bKash, Nagad, Rocket, and Cash on Delivery (COD) configurable from Admin Panel.
- **Super Admin Console**: Manage products (Add, Edit, Delete), manage orders, approve resellers, process payouts, and configure store settings.
- **Bengali & English Support**: Full localization across all components.

## How to Run in Google AI Studio or Locally

### 1. In Another Google AI Studio:
- Push these project files to your **GitHub** repository.
- In Google AI Studio Build, select **"Import from GitHub"** and provide your repository link.
- Google AI Studio will automatically set up and run the live store on port 3000!

### 2. On Your PC (One-Click Launch):
- **Windows**: Simply double-click **`RUN_PROJECT_WINDOWS.bat`**! It will check Node.js, install packages, and automatically open `http://localhost:3000` in your browser.
- **Mac / Linux**: Run `./RUN_PROJECT_MAC_LINUX.sh` in your terminal.

### 3. Manual Terminal Launch:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

## Offline / Direct File Notice
If you open `index.html` directly in a browser (file:// protocol), React cannot load ES modules. Please use `RUN_PROJECT_WINDOWS.bat` or `npm run dev` to start the local web server, or view **`নির্দেশনা_README_BANGLA.html`** for detailed instructions.

## Default Admin Credentials
- **Admin Email**: `mridoyfb@gmail.com`
- **Admin Password**: `HRidoy013166764`
