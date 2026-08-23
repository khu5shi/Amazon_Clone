'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, MapPin, Truck, CreditCard, CheckCircle2, Lock, Plus, ArrowRight, AlertCircle, Navigation } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Address, Order } from '../../types';
import { osmService } from '../../lib/osmService';
import { formatINR } from '../../lib/utils';
import { apiClient } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, addAddress } = useAuth();
  const { cart, clearCart, selectedCount } = useCart();

  // Multi-step state: 1 (Address) -> 2 (Delivery) -> 3 (Payment) -> 4 (Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses.find((a) => a.isDefault)?._id || user?.addresses[0]?._id || ''
  );
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, '_id'>>({
    fullName: user?.name || '',
    phone: user?.phone || '+919876543210',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: true,
    type: 'home',
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'prime_express' | 'standard'>('prime_express');
  const [paymentMethod, setPaymentMethod] = useState<'amazon_pay' | 'card' | 'upi' | 'cod'>('amazon_pay');

  // Card details
  const [cardNumber, setCardNumber] = useState('4532 8921 4829 4321');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('782');
  const [upiId, setUpiId] = useState('john.doe@okaxis');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAddress =
    user?.addresses.find((a) => a._id === selectedAddressId) || user?.addresses[0];

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || newAddress.postalCode.length !== 6) {
      setErrorMsg('Please fill in all required address fields with a valid 6-digit PIN code.');
      return;
    }
    setErrorMsg('');
    await addAddress(newAddress);
    setIsAddingNewAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setErrorMsg('Please select a delivery address to proceed.');
      setCurrentStep(1);
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Calculate totals
      const shippingPrice = deliveryMethod === 'prime_express' ? 0 : 40;
      const taxPrice = Math.round(cart.subtotal * 0.18);
      const totalPrice = cart.subtotal + shippingPrice + taxPrice;

      const randomSuffix = Math.floor(1000000 + Math.random() * 9000000);
      const orderNumber = `402-${randomSuffix}-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const trackingNumber = `AMZN-IN-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + (deliveryMethod === 'prime_express' ? 1 : 3));

      const newOrder: Order = {
        _id: `ord_${Date.now()}`,
        orderNumber,
        orderItems: cart.items.map((item) => ({
          product: item.product._id,
          title: item.product.title,
          thumbnail: item.product.thumbnail,
          price: item.price,
          quantity: item.quantity,
          variantName: item.variantName,
        })),
        shippingAddress: selectedAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        deliveryMethod,
        itemsPrice: cart.subtotal,
        shippingPrice,
        taxPrice,
        totalPrice,
        orderStatus: 'Placed',
        statusHistory: [
          {
            status: 'Placed',
            timestamp: new Date().toISOString(),
            location: `${selectedAddress.city} Fulfillment Center`,
            notes: 'Order placed and confirmed by Amazon Enterprise.',
          },
        ],
        trackingNumber,
        estimatedDeliveryDate: estimatedDate.toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Save order to LocalStorage
      const existingOrders = JSON.parse(localStorage.getItem('amzn_orders') || '[]');
      localStorage.setItem('amzn_orders', JSON.stringify([newOrder, ...existingOrders]));

      // Clear cart
      clearCart();

      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Forward to order details
      setTimeout(() => {
        router.push(`/orders/${newOrder._id}`);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-gray-800">
      {/* Checkout Mini Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-300">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight text-amazon-navy">
            amazon<span className="text-amazon-orange text-xs font-bold">.in</span>
          </span>
        </Link>
        <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
          Checkout ({selectedCount} items)
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Lock className="w-4 h-4 text-green-700" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Step Accordion (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amazon-orange text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-gray-900">Delivery address</h3>
              </div>
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-amazon-prime hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {currentStep === 1 && (
              <div className="p-6 space-y-4 animate-fade-in">
                {/* Saved addresses */}
                {user?.addresses && user.addresses.length > 0 && !isAddingNewAddress && (
                  <div className="space-y-3">
                    <span className="font-bold text-xs text-gray-700 uppercase tracking-wider block">
                      Select a delivery address
                    </span>
                    <div className="space-y-2.5">
                      {user.addresses.map((addr) => (
                        <label
                          key={addr._id}
                          onClick={() => setSelectedAddressId(addr._id || '')}
                          className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition ${
                            selectedAddressId === addr._id
                              ? 'border-amazon-orange bg-orange-50/50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="checkout_addr"
                            checked={selectedAddressId === addr._id}
                            onChange={() => setSelectedAddressId(addr._id || '')}
                            className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                          />
                          <div className="text-xs space-y-0.5">
                            <span className="font-bold text-gray-900">{addr.fullName}</span>
                            <p className="text-gray-600">{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                            <p className="text-gray-500">Phone: {addr.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(true)}
                      className="flex items-center gap-1.5 text-amazon-prime hover:underline font-semibold pt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add a new address</span>
                    </button>
                  </div>
                )}

                {/* Add new address form */}
                {isAddingNewAddress && (
                  <form onSubmit={handleSaveAddress} className="space-y-3 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase">Add a new address</h4>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const loc = await osmService.detectCurrentLocation();
                            setNewAddress({
                              ...newAddress,
                              street: loc.street,
                              city: loc.city,
                              state: loc.state,
                              postalCode: loc.postalCode,
                            });
                          } catch (e: any) {
                            alert(e.message);
                          }
                        }}
                        className="text-[11px] font-bold text-amazon-orange hover:underline flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Auto-detect via GPS (OpenStreetMap)</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">Full name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">10-digit mobile number</label>
                        <input
                          type="text"
                          required
                          maxLength={13}
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">Flat, House no., Building, Apartment</label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">6-digit PIN code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-gray-700 block mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded shadow-sm"
                      >
                        Use this address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded font-semibold text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {!isAddingNewAddress && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-lg shadow-sm transition"
                  >
                    Use this address
                  </button>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Delivery Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amazon-orange text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-gray-900">Choose delivery option</h3>
              </div>
              {currentStep > 2 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-semibold text-amazon-prime hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {currentStep === 2 && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="space-y-3">
                  <label
                    onClick={() => setDeliveryMethod('prime_express')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      deliveryMethod === 'prime_express'
                        ? 'border-amazon-orange bg-orange-50/50 shadow-sm'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_opt"
                      checked={deliveryMethod === 'prime_express'}
                      onChange={() => setDeliveryMethod('prime_express')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded font-black">
                          prime
                        </span>
                        <span>Tomorrow by 9 PM — FREE Delivery</span>
                      </div>
                      <p className="text-gray-600 text-[11px] mt-0.5">
                        Guaranteed 1-day expedited delivery with Prime.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setDeliveryMethod('standard')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      deliveryMethod === 'standard'
                        ? 'border-amazon-orange bg-orange-50/50 shadow-sm'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_opt"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">
                        Standard Delivery (2-3 business days) — ₹40
                      </span>
                      <p className="text-gray-600 text-[11px] mt-0.5">
                        Standard courier partner ground transit.
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-lg shadow-sm transition"
                >
                  Continue to Payment
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: Payment Method */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amazon-orange text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-sm text-gray-900">Select payment method</h3>
              </div>
              {currentStep > 3 && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-semibold text-amazon-prime hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            {currentStep === 3 && (
              <div className="p-6 space-y-4 animate-fade-in">
                <div className="space-y-3">
                  {/* Amazon Pay */}
                  <label
                    onClick={() => setPaymentMethod('amazon_pay')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      paymentMethod === 'amazon_pay' ? 'border-amazon-orange bg-orange-50/50 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'amazon_pay'}
                      onChange={() => setPaymentMethod('amazon_pay')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">Amazon Pay Balance (Instant 1-Click)</span>
                      <p className="text-gray-600 text-[11px]">Available Balance: ₹50,000.00</p>
                    </div>
                  </label>

                  {/* Credit/Debit Card */}
                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      paymentMethod === 'card' ? 'border-amazon-orange bg-orange-50/50 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div className="flex-1 space-y-2">
                      <span className="font-bold text-gray-900 block">Credit or Debit Card</span>
                      {paymentMethod === 'card' && (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number"
                            className="col-span-3 px-3 py-1.5 text-xs border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded"
                          />
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="CVV"
                            className="px-3 py-1.5 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* UPI */}
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      paymentMethod === 'upi' ? 'border-amazon-orange bg-orange-50/50 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">Other UPI Apps (Google Pay, PhonePe, Paytm)</span>
                      {paymentMethod === 'upi' && (
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi"
                          className="mt-2 w-full px-3 py-1.5 text-xs border border-gray-300 rounded"
                        />
                      )}
                    </div>
                  </label>

                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      paymentMethod === 'cod' ? 'border-amazon-orange bg-orange-50/50 shadow-sm' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div>
                      <span className="font-bold text-gray-900 block">Cash on Delivery (COD)</span>
                      <p className="text-gray-600 text-[11px]">Pay cash or scan QR at the time of delivery.</p>
                    </div>
                  </label>
                </div>

                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-lg shadow-sm transition"
                >
                  Review Order Details
                </button>
              </div>
            )}
          </div>

          {/* STEP 4: Review Items & Place Order */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amazon-orange text-white font-black text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-sm text-gray-900">Review items & place order</h3>
              </div>
            </div>

            {currentStep === 4 && (
              <div className="p-6 space-y-6 animate-fade-in">
                {/* Summary Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block mb-1">Delivering to:</span>
                    <p className="text-gray-700 font-medium">{selectedAddress?.fullName}</p>
                    <p className="text-gray-600">{selectedAddress?.street}, {selectedAddress?.city}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block mb-1">Payment & Delivery:</span>
                    <p className="text-gray-700 font-medium">Method: {paymentMethod.toUpperCase()}</p>
                    <p className="text-gray-600">Speed: {deliveryMethod === 'prime_express' ? 'Prime 1-Day (FREE)' : 'Standard (₹40)'}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-3">
                  <span className="font-bold text-xs text-gray-900 uppercase tracking-wider block">
                    Order items ({cart.items.length})
                  </span>
                  <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item._id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={item.product.thumbnail} alt={item.product.title} className="w-12 h-12 object-contain bg-white p-1 border rounded" />
                          <div>
                            <p className="font-bold text-xs text-gray-900 line-clamp-1">{item.product.title}</p>
                            <p className="text-[11px] text-gray-500">Qty: {item.quantity} {item.variantName ? `| ${item.variantName}` : ''}</p>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-gray-900">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order CTA */}
                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-gray-600">Total payable:</span>
                    <div className="text-2xl font-black text-amazon-deal-red">
                      {formatINR(cart.subtotal + (deliveryMethod === 'prime_express' ? 0 : 40) + Math.round(cart.subtotal * 0.18))}
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-8 py-3 bg-amazon-btn-orange hover:bg-amazon-btn-orange-hover text-amazon-dark-text font-black text-xs sm:text-sm rounded-lg shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <span>{isProcessing ? 'Processing Order...' : 'Place Your Order & Pay'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Sticky Order Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-gray-300 shadow-sm space-y-3 sticky top-20">
          <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-gray-200">
            Order Summary
          </h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Items ({selectedCount}):</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{deliveryMethod === 'prime_express' ? '₹0.00' : '₹40.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>{formatINR(Math.round(cart.subtotal * 0.18))}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold text-amazon-deal-red">
              <span>Order Total:</span>
              <span>{formatINR(cart.subtotal + (deliveryMethod === 'prime_express' ? 0 : 40) + Math.round(cart.subtotal * 0.18))}</span>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-gray-500 border-t border-gray-100 space-y-1">
            <p>By placing your order, you agree to Amazon&apos;s Conditions of Use & Sale and DPDP Notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
