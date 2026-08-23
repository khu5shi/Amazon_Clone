# Product Requirements Document (PRD)
## Amazon Full-Stack Web App & Developer Portfolio

---

## 1. Executive Summary
This document defines the product requirements for building an enterprise-grade, fully functional **Amazon E-Commerce Platform**, alongside an interactive **Developer Showcase & Portfolio Hub**.

The project is designed to demonstrate full-stack engineering proficiency (Next.js, Tailwind CSS, TypeScript, Node.js, Express, and MongoDB), adherence to modern UI/UX standards, and compliance with the **Digital Personal Data Protection (DPDP) Act 2023** and **OWASP Top 10** security practices.

---

## 2. Product Objectives & Target Audience
* **Recruiter & Engineering Lead Evaluation**: Showcase scalable code organization, secure API design, responsive UX, and real data workflows.
* **End-User Shopping Experience**: Provide a realistic, fluid marketplace experience with product discovery, faceted search, variant selection, multi-step checkout, and order tracking.
* **Security & Privacy Excellence**: Embed DPDP compliance (Consent Ledger, Right to Access/Download, Right to Erasure/Anonymization) and security safeguards (XSS, CSRF, NoSQL Injection protection).

---

## 3. Key User Personas
1. **Shopper / Customer**:
   - Searches for products using keywords and category filters.
   - Compares product variants (colors, storage, sizes).
   - Manages Cart and proceeds through a multi-step checkout with delivery & payment options.
   - Tracks placed orders and downloads invoices.
   - Manages privacy preferences and exercises DPDP data rights.
2. **Administrator / Vendor**:
   - Manages catalog items, deals, and stock levels.
   - Views orders and updates shipping/delivery statuses.
3. **Recruiter / Technical Evaluator**:
   - Reviews live interactive demo, inspects architecture, reviews documentation, and evaluates source code.

---

## 4. Functional Requirements

### 4.1. Navigation & Discovery
* **Header Bar**:
  * Deliver-to PIN code & Location modal.
  * Search bar with category dropdown and real-time auto-suggestions.
  * Account & Lists menu, Returns & Orders, and Cart counter badge.
* **Sub-Navigation & Mega Menu**:
  * Department categories (Electronics, Mobiles, Fashion, Home, Deals, Prime).

### 4.2. Homepage & Promotions
* Auto-sliding promotional Hero banner with CTA links.
* Responsive Category Card Grid (Deals by category).
* "Today's Lightning Deals" horizontal slider with countdown timers and claim progress bars.

### 4.3. Search & Faceted Catalog
* Text search with fuzzy match and keyword highlight.
* Faceted filters:
  * Brands (multi-select)
  * Price range slider with min/max manual inputs
  * Customer ratings (4★ & up, 3★ & up)
  * Prime Delivery toggle
  * Discount % threshold
* Sorting: Featured, Price (Low to High), Price (High to Low), Customer Rating, Newest.

### 4.4. Product Detail Page (PDP)
* High-definition multi-angle image gallery with interactive thumbnail switcher and zoom.
* Dynamic Variant Switcher (Colors, RAM/Storage, Sizes) with real-time price, stock, and image updates.
* Stock availability badge (e.g. "Only 2 left in stock - order soon").
* "Frequently Bought Together" bundle with 1-click add-to-cart.
* Verified Customer Reviews and 5-star rating distribution breakdown bars.

### 4.5. Cart & Multi-Step Checkout
* **Cart**: Real-time quantity steppers, item deletion, Save for Later, and Free Delivery progress bar.
* **Checkout Pipeline**:
  1. **Address Selection / Creation**: Strict validation (Name, 10-digit phone, 6-digit PIN code, City, State).
  2. **Delivery Speed**: FREE Prime Delivery (Tomorrow) vs Standard Delivery.
  3. **Payment Method**: Amazon Pay Balance, Credit/Debit Cards (with CVV & validation), UPI (VPA format check), and Cash on Delivery (COD).
  4. **Order Summary**: Applied discounts, tax calculation, and Place Order action.

### 4.6. Order Lifecycle & Tracking
* Placed orders history dashboard.
* Visual status stepper (`Placed` -> `Shipped` -> `Out for Delivery` -> `Delivered`).
* Printable Amazon tax invoice simulator.

### 4.7. DPDP Act 2023 Compliance & Privacy Center
* Granular Consent Banner (Essential, Analytics, Marketing) with immutable consent timestamping.
* Self-Service Privacy Center in User Profile:
  * **Right to Access**: Export personal data as a structured JSON file.
  * **Right to Erasure ("Forget Me")**: Cryptographic anonymization of PII while preserving legal order history.
  * **Right to Correction**: Self-service profile updates.
  * **DPDP Notice & Grievance Policy**: Dedicated notice with Grievance Officer details.

---

## 5. Non-Functional Requirements
* **Performance**: Sub-1.5s initial page load time, optimistic UI updates for cart interactions.
* **Responsiveness**: Fully responsive across mobile (375px+), tablet (768px+), and desktop (1280px+).
* **Security**: OWASP Top 10 compliance, XSS protection, CSRF prevention, NoSQL injection defense, Rate limiting.
* **Reliability**: Graceful error handling, loading skeletons, and fallback states.
* **Code Quality**: Strict TypeScript types, modular component hierarchy, clear separation of concerns.

---

## 6. Success Metrics
* 100% of core customer workflows (Search -> Cart -> Checkout -> Tracking) functional with zero mock shortcuts.
* Zero unhandled runtime exceptions.
* Complete data persistence across browser sessions.
