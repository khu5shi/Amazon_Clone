# Amazon Enterprise E-Commerce Platform

A production-grade, full-stack Amazon marketplace and admin management console built with Next.js 14, TypeScript, Tailwind CSS, Node.js, Express, and MongoDB.

This project was built to demonstrate a real, working e-commerce application with zero fake data, working email verification, live geolocation, real-time cart and order workflows, and an administrative control suite.

---

## What Makes This Project Different

* **Zero Fake Data or Hardcoded Shortcuts**: There are no pre-seeded dummy customers or fake orders. Real users sign up with their email and verify via a 60-second OTP.
* **Live Email OTP Verification**: Real 6-digit one-time passwords sent directly to the user's email via Gmail SMTP using Nodemailer, with a live countdown timer and 60-second expiration.
* **OpenStreetMap (OSM) Live Geolocation**: Real GPS detection and address lookup using the OpenStreetMap Nominatim API, rather than static mock city lists.
* **Complete Admin Console**: A dedicated management area at `/admin` for product creation, price and stock updates, and order fulfillment.
* **DPDP Act 2023 Compliance**: Includes a working Privacy Center where users can download their complete personal data as a JSON file, update cookie consents, or request account anonymization.
* **Clean Dark & Light Themes**: Default light mode matching Amazon's clean aesthetic, with an instant dark mode toggle and animated toast alerts.

---

## Core Features

### 1. Customer Experience
* **Live Search & Filters**: Search products by keyword, brand, price slider, 4-star ratings, and Prime delivery.
* **Product Detail Pages**: High-resolution image zoom, interactive variant selector (RAM, Storage, Color), and verified customer reviews that recalculate star averages in real time.
* **Cart & Checkout**: Real-time quantity updates, Save for Later, and a 4-step checkout flow supporting Amazon Pay, UPI, Cards, and Cash on Delivery.
* **Order Tracking & Invoices**: Step-by-step delivery progress (`Placed` -> `Shipped` -> `Out for Delivery` -> `Delivered`) and printable tax invoices.

### 2. Admin & Fulfillment Console (`/admin`)
* **Dashboard Overview**: Live revenue metrics, order pipeline status breakdown, and low-stock alerts.
* **Product Catalog Manager**: Add new products, adjust pricing, edit inventory counts, and toggle Prime/Best Seller badges.
* **Order Fulfillment**: Advance order tracking stages and assign courier tracking numbers.

### 3. Security & Data Protection
* **Authentication**: Bcrypt password hashing, JWT session tokens, and input validation with Zod schemas.
* **API Protection**: Helmet headers, Mongo-Sanitize against NoSQL injection, and Express rate limiting.
* **Privacy Rights**: 1-click JSON data export (Section 11) and cryptographic PII anonymization (Section 12).

---

## Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
* **Backend**: Node.js, Express.js, TypeScript (Controller-Service pattern)
* **Database**: MongoDB with Mongoose
* **Email Service**: Nodemailer with Gmail SMTP
* **Geolocation**: OpenStreetMap (Nominatim API)

---

## Getting Started

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm run install:all
```

### 2. Environment Setup
Create a `.env` file in the `server/` directory (or copy from `server/.env.example`):
```ini
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/amazon_enterprise
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Root Admin Credentials
ADMIN_EMAIL=admin@amazon.com
ADMIN_PASSWORD=admin123

# Gmail SMTP Configuration (For 60s Email OTP)
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_google_app_password
SMTP_FROM=Amazon Enterprise <no-reply@amazon-enterprise.dev>

# OTP Expiration Window
OTP_EXPIRES_SECONDS=60
```

### 3. Seed Database
Wipes temporary data and sets up the root admin and product categories:
```bash
npm run seed
```

### 4. Run the Project

You can run the project using either of these two methods:

#### Method A: 1-Click Launch (Recommended)
Starts both the frontend and backend together:
```bash
npm run dev
```

#### Method B: Separate Terminals
* **Backend API (`:5000`)**:
  ```bash
  cd server
  npm run dev
  ```
* **Frontend Storefront (`:3000`)**:
  ```bash
  cd client
  npm run dev
  ```

---

## Application URLs

* **Storefront**: http://localhost:3000
* **Admin Portal**: http://localhost:3000/admin
* **Backend API**: http://localhost:5000/api/v1

---

## Default Admin Credentials

| Email | Password | Role |
| :--- | :--- | :--- |
| `admin@amazon.com` | `admin123` | Root Administrator (Full access to `/admin`) |

*Note: You can change the admin email and password anytime directly in `server/.env`.*

---

## Project Structure

```
amazon-enterprise-platform/
├── README.md                      # Project documentation
├── package.json                   # Root workspace scripts
├── docs/                          # Architecture & PRD documentation
│   ├── PRD.md                     # Product Requirements Document
│   ├── ARCHITECTURE.md            # System Design & Data Flow
│   ├── DESIGN_SYSTEM.md           # Color tokens & typography
│   ├── SECURITY_AND_COMPLIANCE.md # DPDP Act & Security Controls
│   └── MEMORY.md                  # Development log & status
├── client/                        # Next.js 14 Frontend Application
│   └── src/
│       ├── app/                   # App Router pages (Home, Search, PDP, Cart, Checkout, Admin)
│       ├── components/            # Reusable UI components
│       ├── context/               # Auth, Cart, Theme, Toast, and Privacy state
│       ├── lib/                   # API client, OpenStreetMap service, utilities
│       └── types/                 # TypeScript interfaces
└── server/                        # Express + Node.js Backend
    ├── src/
    │   ├── config/                # Environment variables & DB connection
    │   ├── controllers/           # Auth, Admin, Product, Order controllers
    │   ├── middlewares/           # JWT, Error handlers, Rate limiters
    │   ├── models/                # User, Product, Order, OTP, Category schemas
    │   ├── routes/                # API routes
    │   └── services/              # Email service (Nodemailer)
    └── .env                       # Backend environment variables
```

---

## Verification

To verify that the code compiles cleanly with zero TypeScript errors:

```bash
# Check Backend
cd server && npx tsc --noEmit

# Check Frontend
cd client && npx tsc --noEmit
```
