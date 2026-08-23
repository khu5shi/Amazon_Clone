# Project Memory & Technical Context Log
## Amazon Full-Stack Web Platform

---

## 1. Project Context & Objectives
* **Context**: Technical portfolio project built for recruiter and hiring panel evaluation (prepared for submission to **Anjali**).
* **Primary Scope**: Build an enterprise-grade, fully functional **Amazon E-Commerce Platform** that demonstrates industrial standards, genuine verification, clean code, responsive UX, and robust security.
* **Non-Negotiables**:
  * **Zero cheat codes or dummy auto-logins**: All authentication is real and interactive.
  * **Mandatory Email Verification**: Users cannot log in until their email is verified via a 6-digit OTP code.
  * **60-Second OTP Window**: Cryptographically generated OTP expires in exactly 60 seconds with live countdown and a resend button locked until expiry.
  * **Branded HTML Emails via Gmail / SMTP**: Amazon-styled HTML emails sent for OTP verification, profile/address security updates, and order confirmations.
  * **Light & Dark Theme**: Default Light Mode (Classic Amazon) with a functional Dark Mode toggle.
  * **Continuous Documentation**: `MEMORY.md` updated with every architectural change.

---

## 2. Key Architectural Decisions (ADRs)

### ADR 01: Full-Stack Tech Stack
* **Frontend**: Next.js 14/15 App Router + TypeScript + Tailwind CSS + Lucide Icons + Framer Motion.
* **Backend**: Node.js + Express.js + TypeScript (Controller-Service-Model Architecture).
* **Database**: MongoDB + Mongoose ODM (with automatic TTL indexes on OTPs).

### ADR 02: 60-Second Email OTP Verification Engine
* Implemented `server/src/models/OTP.ts` with `{ expireAfterSeconds: 0 }` on `expiresAt` (60s TTL).
* Implemented `server/src/services/emailService.ts` using Nodemailer supporting Gmail SMTP (App Password) and automated Ethereal fallback with live browser preview URLs.
* HTML email templates with Amazon header, large monospace OTP box, 60s warning badge, order receipts with thumbnails, and security alerts.

### ADR 03: Theme Architecture (Light Mode Default)
* Built `ThemeContext.tsx` syncing with HTML `class="dark"` and `localStorage`.
* Default theme: `light`. Top Navbar includes interactive Sun ☀️ / Moon 🌙 toggle.

### ADR 04: DPDP Act 2023 Compliance & Security Pipeline
* Data Protection Notice, Consent Ledger, Right to Access (JSON export), Right to Erasure (anonymization), Helmet CSP, Mongo-Sanitize, and HPP parameter pollution protection.

---

## 3. Milestones & Progress Tracker

| Milestone | Status | Details |
| :--- | :---: | :--- |
| **01. Planning & Docs** | ✅ Completed | Created `PRD.md`, `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, `SECURITY_AND_COMPLIANCE.md`, `MEMORY.md`, and root `README.md`. |
| **02. Backend Setup & Security Pipeline** | ✅ Completed | Configured Express + TypeScript, Helmet CSP, CORS, Mongo-Sanitize, HPP, Global & Auth Rate Limiters, and MongoDB Mongoose connection. |
| **03. Schemas, REST APIs & Seeder** | ✅ Completed | Implemented `User`, `OTP`, `Product`, `Category`, `Cart`, `Order`, `Review`, `ConsentLog` models, Zod validators, controllers, and services. |
| **04. SMTP Mailer & 60s OTP Verification** | ✅ Completed | Built `EmailService` with Gmail SMTP, 60s OTP expiration, branded HTML email templates for OTP, Orders, and Security Alerts. |
| **05. Interactive 6-Box OTP UI** | ✅ Completed | Built `OTPInput.tsx` with auto-focus, paste support, 60-second live countdown timer, and locked resend button. |
| **06. Genuine Authentication Pages** | ✅ Completed | Removed dummy logins. Real sign-up with email OTP verification and password/OTP sign-in in `client/src/app/auth/`. |
| **07. Light / Dark Mode Toggle** | ✅ Completed | Created `ThemeContext.tsx`, configured Tailwind `darkMode: 'class'`, and added Navbar toggle with Light mode as default. |
| **08. Catalog & Faceted Search** | ✅ Completed | Text search, multi-faceted sidebar filters (Brand, Price slider, 4★+ rating, Prime checkbox), sorting dropdown, and product grids. |
| **09. Interactive PDP & Variants** | ✅ Completed | Zoom gallery with hover magnifier, dynamic variant selector (RAM/Storage/Color), stock status, Buy Box, and verified customer reviews. |
| **10. Cart & Multi-Step Checkout** | ✅ Completed | Full cart management with Save for Later, address form with PIN code validator, Prime speed options, payment options, and confetti order placement. |
| **09. Profile & HR Dossier Generator** | ✅ Completed | Address Book manager, 1-click personal data JSON export, account erasure, and pre-formatted recruiter submission dossier for Anjali. |
| **10. Admin Management Suite** | ✅ Completed | Built `/admin` dashboard overview, `/admin/products` SKU & stock inventory manager, `/admin/orders` fulfillment console, and `DeliveryZone` model. |
| **11. OpenStreetMap (OSM) Live Geolocation** | ✅ Completed | Built `osmService.ts` with HTML5 GPS reverse geocoding and live address search autocomplete in `LocationModal.tsx`, checkout, and profile. |
| **12. Zero Dummy Customer Mandate** | ✅ Completed | Wiped dummy customer accounts and fake orders. Seeded **only** the Root Admin (`admin@amazon.com` / `admin123`) and department categories. |
| **13. Glassmorphic Toast Notifications** | ✅ Completed | Built site-wide `ToastContext.tsx` providing floating interactive toast alerts for login, logout, OTP verification, cart operations, GPS detection, and address changes. |

---

## 4. Active Configuration Summary
* **Client Port**: `3000` (Next.js)
* **Server Port**: `5000` (Express API)
* **API Base URL**: `http://localhost:5000/api/v1`
* **Default Theme**: `light` (Toggleable to `dark`)
* **OTP Expiration**: `60 seconds`
* **Type-Check Status**: Clean build on both client and server (`0 errors`).
* **Root Admin Credentials**: `admin@amazon.com` / `admin123`
* **Cart State**: Initial cart completely empty (`0 items`, `₹0`).
* **Location State**: 100% dynamic from OpenStreetMap GPS or user address (`Select location` by default).
* **Toast Alerts**: Active across all auth, cart, location, and order actions.
* **Documentation**: Rewritten `README.md` in clean, human-written, plain-text professional format without link clutter or badge walls.
* **Last Updated**: Codebase sanitized; 0 TypeScript errors across client and server.
