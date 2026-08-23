# Design System & UI/UX Guidelines
## Modern Amazon Design Tokens & Component Standards

---

## 1. Design Philosophy & Aesthetic
The UI balances **Amazon's iconic identity** (Navy, Gold, Prime Teal) with **modern enterprise aesthetics**:
* Clean typography with high legibility.
* Subtle glassmorphism and card overlays.
* Purposeful micro-animations for feedback (cart increments, button hover states, accordion transitions).
* Crisp dark and light contrast ratios meeting WCAG 2.1 AA accessibility standards.

---

## 2. Color Palette & Tokens

### 2.1. Primary Amazon Identity
* **Amazon Dark Navy**: `#131921` (Main header background, high-contrast text)
* **Amazon Navy Light**: `#232f3e` (Sub-navbar, footer background)
* **Amazon Gold / Amber**: `#febd69` (Active search highlights, rating stars, accent badges)
* **Amazon Orange (CTA)**: `#f08804` (Primary Add to Cart & Buy Now buttons, active indicators)
* **Amazon Orange Hover**: `#e07a00`
* **Amazon Prime Blue / Teal**: `#007185` (Prime badges, hyperlinks, interactive text)
* **Prime Blue Hover**: `#c7511f`

### 2.2. Functional & Neutral Colors
* **Background Light**: `#f3f4f6` (Subtle off-white background)
* **Surface White**: `#ffffff` (Card containers, dropdowns, modals)
* **Text Dark (Body)**: `#0f1111` (Standard body copy)
* **Text Muted**: `#565959` (Secondary labels, review counts, timestamps)
* **Success Green**: `#067d62` (In-stock badge, free delivery badges)
* **Alert Red**: `#b12704` (Deal price tag, discount badges, error states)
* **Border Color**: `#d5d9d9` (Input borders, card dividers)

---

## 3. Typography Hierarchy
* **Font Family**: Modern sans-serif stack (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
* **Scale**:
  * **H1 / Hero Headings**: `text-2xl` to `text-3xl` (`24px - 30px`), `font-bold`
  * **H2 / Section Titles**: `text-xl` (`20px`), `font-bold`
  * **H3 / Card Titles**: `text-base` to `text-lg` (`16px - 18px`), `font-semibold`
  * **Body Regular**: `text-sm` (`14px`), `font-normal`
  * **Captions & Secondary**: `text-xs` (`12px`), `font-medium`

---

## 4. UI Components & Patterns

### 4.1. Buttons
* **Primary CTA (Add to Cart / Place Order)**:
  * Background: `#ffd814`, Border: `#fcd200`, Text: `#0f1111`, Rounded: `rounded-full` or `rounded-lg`, Hover: `#f7ca00`.
* **Secondary CTA (Buy Now)**:
  * Background: `#ffa41c`, Border: `#ff8f00`, Text: `#0f1111`, Rounded: `rounded-full` or `rounded-lg`, Hover: `#fa8900`.
* **Outline / Filter Buttons**:
  * Background: `#ffffff`, Border: `#d5d9d9`, Text: `#0f1111`, Hover: `#f7fafa`.

### 4.2. Cards & Containers
* Standard shadow: `shadow-sm` or `shadow-md` on hover.
* Rounded corners: `rounded-lg` (`8px`) for cards; `rounded-md` for inputs.
* Padding: `p-4` to `p-6` for content cards.

### 4.3. Badges & Indicators
* **Prime Badge**: Distinctive Prime checkmark in `#007185` or `#00a8e1`.
* **Deal of the Day**: Red pill tag (`bg-[#cc0c39] text-white text-xs font-bold px-2 py-1 rounded-sm`).
* **Rating Stars**: Filled gold stars (`#ffa41c`) with numeric count.

### 4.4. Form Elements
* Floating focus rings: `focus:ring-2 focus:ring-[#e77600] focus:border-[#e77600]`.
* Error states: Red border `#b12704` with descriptive error text below.

---

## 5. Responsive Breakpoints
* **Mobile (`< 640px`)**: Compact header, bottom navigation drawer, single-column product feed.
* **Tablet (`640px - 1024px`)**: 2 to 3 column product grid, collapsible filter sheet.
* **Desktop (`1024px+`)**: Full persistent navigation bar, left faceted filter sidebar, 4+ column product grid.
