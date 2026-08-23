export interface Variant {
  _id?: string;
  type: 'color' | 'storage' | 'size' | 'style';
  name: string;
  priceDelta: number;
  stock: number;
  image?: string;
  sku: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: Category | string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  numReviews: number;
  stock: number;
  images: string[];
  thumbnail: string;
  variants: Variant[];
  isPrimeEligible: boolean;
  isBestSeller: boolean;
  isAmazonChoice: boolean;
  isLightningDeal: boolean;
  lightningDealEndsAt?: string;
  lightningDealClaimedPercentage?: number;
  features: string[];
  specifications: Record<string, string>;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface ConsentSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: Address[];
  isAnonymized: boolean;
  consentSettings: ConsentSettings;
}

export interface CartItem {
  _id?: string;
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  selected: boolean;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  savedForLater: CartItem[];
  subtotal: number;
  totalDiscount: number;
  deliveryFee: number;
  estimatedTax: number;
  total: number;
}

export interface OrderItem {
  product: string | Product;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
  variantName?: string;
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'amazon_pay' | 'card' | 'upi' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  deliveryMethod: 'prime_express' | 'standard';
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  orderStatus: 'Placed' | 'Confirmed' | 'Shipped' | 'OutForDelivery' | 'Delivered' | 'Cancelled';
  statusHistory: StatusHistory[];
  trackingNumber: string;
  estimatedDeliveryDate: string;
  createdAt: string;
  isCancelled?: boolean;
}

export interface Review {
  _id: string;
  user: string;
  userName: string;
  product: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  variantInfo?: string;
  createdAt: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FacetsData {
  availableBrands: string[];
  categories: Category[];
}
