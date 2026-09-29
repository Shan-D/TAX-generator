# Mobile-First Offline PWA Sri Lanka VAT Fuel Tax Invoice Generator

A Progressive Web Application (PWA) built with React, Vite, and Tailwind CSS designed for Sri Lankan fuel stations to calculate 18% VAT and generate Inland Revenue Department (IRD) compliant Tax Invoices directly on mobile and desktop devices with complete offline capability.

## 🌟 Key Features

- **IRD Sri Lanka Tax Invoice Compliance:** Recreates official Inland Revenue Department A4 Tax Invoice specifications (TIN boxes, Supplier/Purchaser layout, Delivery logistics, 18% VAT breakdown, and Amount in words).
- **Bi-Directional 18% VAT Calculator:** Instant live calculations when entering either Total Amount (Rs.) or Quantity in Litres ($Q$).
- **Offline-First PWA:** Full LocalStorage / IndexedDB fallback to save station profiles, pump rates, and past invoices without backend dependencies.
- **Client-Side A4 PDF Export:** Pure client-side PDF generation using `html2canvas` + `jspdf`.
- **Responsive Mobile UX & Dark Mode:** Touch-optimized UI with dark mode toggle.
- **Configurable Fuel Rates:** Support for 95 Octane Petrol, Super Diesel, 92 Petrol, and Auto Diesel.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production (PWA)
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

## 🛠️ Tech Stack

- **Framework:** React 18, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **PDF Engine:** jsPDF, html2canvas
- **PWA:** Vite PWA Plugin
