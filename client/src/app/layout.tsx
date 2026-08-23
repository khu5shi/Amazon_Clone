import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { PrivacyProvider } from '../context/PrivacyContext';
import { Navbar } from '../components/layout/Navbar';
import { SubNav } from '../components/layout/SubNav';
import { Footer } from '../components/layout/Footer';
import { PrivacyBanner } from '../components/layout/PrivacyBanner';
import { CartDrawerModal } from '../components/cart/CartDrawerModal';

export const metadata: Metadata = {
  title: 'Online Shopping site in India: Shop Online for Mobiles, Laptops, Fashion & more - Amazon.in',
  description:
    'Amazon Enterprise Platform - A fully functional e-commerce marketplace built with Next.js, Tailwind CSS, TypeScript, Node.js, Express, and MongoDB, compliant with DPDP Act 2023.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#eaeded] dark:bg-[#0b0f17] text-amazon-dark-text dark:text-gray-100 transition-colors duration-200 antialiased">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <PrivacyProvider>
                  <Navbar />
                  <SubNav />
                  <main className="flex-1 w-full">{children}</main>
                  <Footer />
                  <PrivacyBanner />
                  <CartDrawerModal />
                </PrivacyProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
