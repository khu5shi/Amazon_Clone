# Security, Privacy & DPDP Compliance Guide
## Enterprise Data Governance & OWASP Defense Matrix

---

## 1. Compliance: Digital Personal Data Protection (DPDP) Act 2023

India's **DPDP Act 2023** sets rigorous requirements for data fiduciaries. This platform implements end-to-end data governance controls:

### 1.1. Explicit, Notice-Backed Consent Management
* **Categorized Consent**:
  * **Essential**: Required for authentication, cart state, and order fulfillment.
  * **Analytics & Performance**: Tracking usage patterns to optimize performance.
  * **Personalized Marketing**: Tailored product recommendations and deal alerts.
* **Consent Ledger**: Every consent action (acceptance, partial toggle, withdrawal) is recorded with timestamp and version in the `ConsentLog` collection.

### 1.2. Self-Service Privacy Center (User Data Rights)
* **Right to Access & Portability**:
  * Users can download their complete profile, address book, order history, reviews, and consent ledger in a single structured JSON export.
* **Right to Correction**:
  * Real-time self-service profile and address editing.
* **Right to Erasure ("Forget Me")**:
  * Allows users to request account deletion.
  * PII (name, email, phone, physical address) is cryptographically anonymized to random non-identifiable hashes.
  * Financial transaction records are retained in compliance with statutory audit obligations without linking back to personal identity.
* **Right to Grievance Redressal**:
  * Clear DPDP privacy notice with designated Grievance Officer contact information.

### 1.3. PII Masking & Data Minimization
* User phone numbers are masked in UI and logs as `+91 98*** **321`.
* Payment instruments are masked as `**** **** **** 4321`.

---

## 2. Web Security & OWASP Top 10 Safeguards

### 2.1. XSS (Cross-Site Scripting) Defense
* **Content Security Policy (CSP)**: Configured via `helmet` headers preventing inline script execution from unapproved domains.
* **Input Sanitization**: All user-generated text (reviews, search keywords, shipping notes) is cleaned with `sanitize-html` on the server and `DOMPurify` on the client.
* **Template Escaping**: React/Next.js default escaping ensures zero unescaped HTML injection.

### 2.2. CSRF (Cross-Site Request Forgery) Defense
* **SameSite Strict Cookies**: Authentication cookies are marked `HttpOnly`, `Secure` (production), and `SameSite=Strict`.
* **Custom Header Verification**: Mutation requests validate the presence of the `X-Requested-With` or `X-CSRF-Token` header.

### 2.3. NoSQL Injection & Parameter Pollution
* **`mongo-sanitize`**: Automatically strips any `$`, `{`, or `.` MongoDB operator characters from request bodies, parameters, and query strings.
* **`hpp` (HTTP Parameter Pollution)**: Blocks duplicate query parameters used in injection or bypass attacks.
* **Zod Schema Validation**: All incoming requests are strictly validated and stripped of extraneous properties before hitting controllers.

### 2.4. Rate Limiting & Brute Force Prevention
* **Global Rate Limiter**: 100 requests per 15-minute window per IP.
* **Auth Rate Limiter**: Maximum 5 failed login/register attempts per 15-minute window to block password spraying and brute-force attacks.

### 2.5. Cryptography & Password Security
* Passwords salted and hashed with `bcryptjs` (12 rounds).
* JWT tokens signed with SHA-256 with short expiry windows and secure rotation.
