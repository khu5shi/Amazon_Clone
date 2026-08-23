import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { OTP } from '../models/OTP';
import { ENV } from '../config/env';
import { logger } from './logger';

export const seedCategories = [
  {
    name: 'Mobiles & Tablets',
    slug: 'mobiles-tablets',
    description: 'Latest flagship smartphones, 5G devices, and tablets with prime delivery.',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    order: 1,
  },
  {
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    description: 'High performance gaming rigs, ultrabooks, monitors, and accessories.',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
    order: 2,
  },
  {
    name: 'Audio & Headphones',
    slug: 'audio-headphones',
    description: 'Noise cancelling headphones, true wireless earbuds, and home soundbars.',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    order: 3,
  },
  {
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    description: 'Trending styles, casual wear, shoes, and luxury timepieces.',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
    order: 4,
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Smart kitchen appliances, coffee makers, cookware, and modern furniture.',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    order: 5,
  },
  {
    name: 'Smart Watches',
    slug: 'smart-watches',
    description: 'Fitness trackers, AMOLED smartwatches, and health monitors.',
    icon: 'Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    order: 6,
  },
];

export const getSeedProducts = (categoryMap: Record<string, string>) => [
  {
    title: 'Apple iPhone 15 Pro (128 GB) - Natural Titanium',
    slug: 'apple-iphone-15-pro-128gb-natural-titanium',
    description:
      'iPhone 15 Pro. Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever.',
    brand: 'Apple',
    category: categoryMap['mobiles-tablets'],
    categorySlug: 'mobiles-tablets',
    price: 127990,
    originalPrice: 134900,
    discountPercentage: 5,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80',
    rating: 4.8,
    numReviews: 124,
    isPrimeEligible: true,
    isBestSeller: true,
    isAmazonChoice: true,
    isLightningDeal: false,
    variants: [
      { variantId: '128GB-NAT', name: 'Natural Titanium | 128 GB', priceDelta: 0, stock: 15, isAvailable: true },
      { variantId: '256GB-NAT', name: 'Natural Titanium | 256 GB', priceDelta: 10000, stock: 10, isAvailable: true },
    ],
    features: [
      'FORGED IN TITANIUM — Strong and light design with textured matte-glass back',
      'A17 PRO CHIP — Monster GPU for next-level mobile gaming',
      'POWERFUL CAMERA SYSTEM — 7 pro lenses with 48MP main camera',
    ],
    specifications: {
      Display: '6.1-inch Super Retina XDR ProMotion',
      Chip: 'A17 Pro chip with 6-core GPU',
      Camera: '48MP Main | 12MP Ultra Wide | 12MP Telephoto',
      Battery: 'Up to 23 hours video playback',
    },
    tags: ['iphone', 'apple', 'mobile', 'smartphone', 'flagship'],
  },
  {
    title: 'Apple 2024 MacBook Air Laptop M3 chip (15.3-inch, 16GB RAM, 512GB SSD) - Starlight',
    slug: 'macbook-air-m3-15-inch-starlight',
    description:
      'Lean. Mean. M3 machine. MacBook Air with M3 chip leverages incredible performance and portability to power through work and play.',
    brand: 'Apple',
    category: categoryMap['laptops-computers'],
    categorySlug: 'laptops-computers',
    price: 154900,
    originalPrice: 174900,
    discountPercentage: 11,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
    rating: 4.9,
    numReviews: 89,
    isPrimeEligible: true,
    isBestSeller: true,
    isAmazonChoice: false,
    isLightningDeal: false,
    variants: [
      { variantId: '16GB-512GB', name: '16GB RAM | 512GB SSD', priceDelta: 0, stock: 8, isAvailable: true },
      { variantId: '16GB-1TB', name: '16GB RAM | 1TB SSD', priceDelta: 20000, stock: 4, isAvailable: true },
    ],
    features: [
      'SUPERCHARGED BY M3 — 8-core CPU and 10-core GPU',
      'UP TO 18 HOURS BATTERY LIFE — All day battery efficiency',
      '15.3-INCH LIQUID RETINA DISPLAY — Supports 1 billion colors',
    ],
    specifications: {
      Display: '15.3-inch Liquid Retina Display',
      Processor: 'Apple M3 Chip 8-Core CPU',
      RAM: '16GB Unified Memory',
      Storage: '512GB High Speed SSD',
    },
    tags: ['macbook', 'apple', 'laptop', 'm3'],
  },
  {
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones - Silver',
    slug: 'sony-wh-1000xm5-wireless-headphones-silver',
    description:
      'Industry leading noise canceling headphones with two processors and 8 microphones for unprecedented sound purity.',
    brand: 'Sony',
    category: categoryMap['audio-headphones'],
    categorySlug: 'audio-headphones',
    price: 29990,
    originalPrice: 34990,
    discountPercentage: 14,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    rating: 4.7,
    numReviews: 230,
    isPrimeEligible: true,
    isBestSeller: true,
    isAmazonChoice: true,
    isLightningDeal: true,
    variants: [
      { variantId: 'XM5-SLV', name: 'Silver', priceDelta: 0, stock: 18, isAvailable: true },
      { variantId: 'XM5-BLK', name: 'Black', priceDelta: 0, stock: 12, isAvailable: true },
    ],
    features: [
      'INDUSTRY LEADING NOISE CANCELLATION — 8 microphones & Auto NC Optimizer',
      'MAGNIFICENT SOUND — Engineered with V1 Integrated Processor',
      'CRYSTAL CLEAR CALLS — Precise Voice Pickup technology',
    ],
    specifications: {
      Driver: '30mm Driver Unit',
      Battery: 'Up to 30 hours with ANC ON',
      Weight: '250g Ultra Light',
    },
    tags: ['sony', 'headphones', 'anc', 'wireless'],
  },
];

export const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Starting Root Admin & Catalog seed...');

    // Wipe all collections so zero dummy users or fake orders exist
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      OTP.deleteMany({}),
    ]);

    logger.info('Cleared existing collections & dummy users.');

    // 1. Seed Root Admin User ONLY
    const adminUser = await User.create({
      name: 'Amazon Root Administrator',
      email: ENV.ADMIN_EMAIL,
      password: ENV.ADMIN_PASSWORD,
      role: 'admin',
      phone: '+919800000001',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      addresses: [],
      consentSettings: {
        essential: true,
        analytics: true,
        marketing: true,
        updatedAt: new Date(),
      },
    });

    logger.info(`Root Admin created: ${adminUser.email} (Password: ${ENV.ADMIN_PASSWORD})`);

    // 2. Seed Core Categories
    const createdCategories = await Category.insertMany(seedCategories);
    logger.info(`Seeded ${createdCategories.length} Categories.`);

    const categoryMap: Record<string, string> = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.slug] = (cat._id as any).toString();
    });

    // 3. Seed Base Products
    const productsData = getSeedProducts(categoryMap);
    const createdProducts = await Product.insertMany(productsData);
    logger.info(`Seeded ${createdProducts.length} Initial Base Products.`);

    logger.info('✅ Database Seed Complete! Zero dummy customers present. Store is ready for real users & Admin management.');
    process.exit(0);
  } catch (error: any) {
    logger.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
