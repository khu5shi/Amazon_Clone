# System Architecture Document
## Amazon Full-Stack Web Platform

---

## 1. High-Level Architecture Overview

The system follows a modern, decoupled **Full-Stack Monorepo Architecture**:
* **Frontend**: Next.js 14 App Router with React, TypeScript, and Tailwind CSS.
* **Backend**: Node.js + Express.js with TypeScript following the Controller-Service-Repository pattern.
* **Database Layer**: MongoDB with Mongoose ODM (Schemas, indexes, and transactions).
* **Security & Compliance Layer**: Multi-tier security pipeline (Helmet, Mongo-Sanitize, Rate-Limiting, DPDP Privacy Engine).

```
                      +---------------------------------------+
                      |       Next.js Frontend (Client)       |
                      |   App Router + Tailwind + TypeScript  |
                      +---------------------------------------+
                                          |
                                   HTTPS / REST API
                                 (JWT + CSRF Headers)
                                          |
                                          v
                      +---------------------------------------+
                      |      Express.js Backend (Server)      |
                      |   Middlewares -> Routes -> Services   |
                      +---------------------------------------+
                             |           |            |
                +------------+     +-----+-----+      +------------+
                |                  |           |                   |
                v                  v           v                   v
     +-------------------+   +-----------+  +----------+   +---------------+
     | Security Pipeline |   | Auth/User |  | Products |   | Orders/Cart   |
     | Helmet, Sanitize, |   | Service   |  | Service  |   | Service       |
     | Rate Limiters     |   +-----------+  +----------+   +---------------+
     +-------------------+         \             /                 /
                |                   \           /                 /
                v                    v         v                 v
     +-------------------+     +-----------------------------------+
     | DPDP Privacy Hub  |     |            MongoDB                |
     | Consent & Erasure | --> |  Collections: Users, Products,    |
     +-------------------+     |  Orders, Carts, Reviews, Logs     |
                               +-----------------------------------+
```

---

## 2. Layered Component Responsibilities

### 2.1. Client-Side Layer (`client/src/`)
1. **App Router (`app/`)**: Handles page routing, layouts, and server/client boundary composition.
2. **Components (`components/`)**:
   - `layout/`: Global navigation, headers, footer, DPDP consent banner.
   - `home/`: Hero carousel, category cards, lightning deals.
   - `product/`: Product detail view, gallery zoom, variant pickers, reviews.
   - `filter/`: Faceted search sidebar with price slider and multi-selects.
   - `cart/` & `checkout/`: Cart management and 4-step secure checkout.
   - `privacy/`: DPDP consent modal, data export card, account erasure modal.
3. **State & Data Layer (`hooks/`, `lib/`)**:
   - Custom hooks for Cart, Authentication, Products, and Privacy.
   - Axios client with automatic CSRF header injection and token interceptors.

### 2.2. Server-Side Layer (`server/src/`)
1. **Middlewares (`middlewares/`)**:
   - `security.ts`: Helmet headers (CSP, HSTS), CORS origin control, Mongo-Sanitize, and HPP.
   - `rateLimiter.ts`: General API and strict authentication brute-force limiters.
   - `validateRequest.ts`: Zod schema validation for all request payloads.
   - `authMiddleware.ts`: JWT verification, user context hydration, and role checking.
   - `errorHandler.ts`: Centralized error catching with sanitized error responses.
2. **Controllers (`controllers/`)**: Handle HTTP requests/responses and input extraction.
3. **Services (`services/`)**: Encapsulate pure business logic, calculations, and data transactions.
4. **Models (`models/`)**: Mongoose schema definitions, field validation, and compound indexes.

---

## 3. Data Flow & Sequence

### 3.1. Faceted Search & Filtering Flow
1. User interacts with search bar or sidebar filters (Price, Brand, Rating, Prime).
2. Client debounces filter inputs and dispatches request to `GET /api/v1/products?...`.
3. Server validates query params against Zod schema.
4. Product Service constructs MongoDB query with indexed fields and text search.
5. Paginated results and dynamic facet counts are returned to client.

### 3.2. Multi-Step Checkout Flow
1. User navigates to checkout; Cart snapshot and user addresses are retrieved.
2. Step 1: Address selection or validated creation.
3. Step 2: Delivery method selection (Prime vs Standard).
4. Step 3: Payment method verification (Card/UPI/COD).
5. Step 4: `POST /api/v1/orders` submitted with address, items, and payment info.
6. Server verifies stock availability in database, creates order record, updates inventory, and clears user cart.
7. Order confirmation screen rendered with tracking timeline.

---

## 4. Key Architectural Decisions
* **TypeScript Everywhere**: Full type safety from MongoDB schemas and backend services to frontend components.
* **Separation of Concerns**: Controllers do not talk directly to database models; all operations pass through dedicated Services.
* **Stateless Authentication**: Signed JWT tokens with client-side secure storage and refresh mechanisms.
* **Resilient Offline/Mock Fallbacks**: In case MongoDB is offline or in local demo mode, the client includes an integrated fallback store ensuring 100% demo availability.
