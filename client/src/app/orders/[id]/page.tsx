'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, Printer, ShieldCheck } from 'lucide-react';
import { Order } from '../../../types';
import { TrackingStepper } from '../../../components/order/TrackingStepper';
import { InvoiceModal } from '../../../components/order/InvoiceModal';
import { formatINR } from '../../../lib/utils';
import { initialProducts } from '../../../lib/mockData';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    try {
      const storedOrders = JSON.parse(localStorage.getItem('amzn_orders') || '[]');
      const found = storedOrders.find(
        (o: Order) => o._id === params.id || o.orderNumber === params.id
      );

      if (found) {
        setOrder(found);
      } else if (storedOrders.length > 0) {
        setOrder(storedOrders[0]);
      } else {
        // Fallback demo order
        const demoOrder: Order = {
          _id: params.id,
          orderNumber: '402-8921471-9281742',
          orderItems: [
            {
              product: initialProducts[0]._id,
              title: initialProducts[0].title,
              thumbnail: initialProducts[0].thumbnail,
              price: initialProducts[0].price,
              quantity: 1,
              variantName: 'Natural Titanium | 128 GB',
            },
          ],
          shippingAddress: {
            fullName: 'John Doe',
            phone: '+919876543210',
            street: 'Flat 402, Royal Palms Residency, Golf Course Road',
            apartment: 'Tower B, 4th Floor',
            city: 'Gurugram',
            state: 'Haryana',
            postalCode: '122002',
            country: 'India',
            isDefault: true,
            type: 'home',
          },
          paymentMethod: 'amazon_pay',
          paymentStatus: 'completed',
          deliveryMethod: 'prime_express',
          itemsPrice: initialProducts[0].price,
          shippingPrice: 0,
          taxPrice: Math.round(initialProducts[0].price * 0.18),
          totalPrice: initialProducts[0].price + Math.round(initialProducts[0].price * 0.18),
          orderStatus: 'Shipped',
          statusHistory: [
            {
              status: 'Placed',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              location: 'Gurugram Fulfillment Hub',
              notes: 'Order placed and confirmed.',
            },
            {
              status: 'Shipped',
              timestamp: new Date(Date.now() - 36000000).toISOString(),
              location: 'Delhi Sorting Facility',
              notes: 'Package in transit with BlueDart Express.',
            },
          ],
          trackingNumber: 'AMZN-IN-89214718-402',
          estimatedDeliveryDate: new Date(Date.now() + 43200000).toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        };
        setOrder(demoOrder);
      }
    } catch (e) {
      // Ignored
    }
  }, [params.id]);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-xs text-gray-500">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-gray-800 animate-fade-in">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/orders"
          className="flex items-center gap-1 text-xs font-semibold text-amazon-prime hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Your Orders</span>
        </Link>

        <button
          onClick={() => setIsInvoiceOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-md font-semibold text-gray-800 shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-amazon-orange" />
          <span>Download Invoice</span>
        </button>
      </div>

      {/* 1. Live Tracking Stepper */}
      <TrackingStepper order={order} />

      {/* 2. Order Summary Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Shipping Address
          </h4>
          <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
          <p className="text-gray-600">{order.shippingAddress.street}</p>
          {order.shippingAddress.apartment && (
            <p className="text-gray-600">{order.shippingAddress.apartment}</p>
          )}
          <p className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
          </p>
          <p className="text-gray-500">Phone: {order.shippingAddress.phone}</p>
        </div>

        {/* Payment Method */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Payment Method
          </h4>
          <p className="font-bold text-gray-900 capitalize">
            {order.paymentMethod.replace('_', ' ')}
          </p>
          <p className="text-green-700 font-semibold">Payment Completed</p>
          <p className="text-[11px] text-gray-500">
            Encrypted & Verified under RBI regulations.
          </p>
        </div>

        {/* Order Pricing Breakdown */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-2">
          <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
            Order Summary
          </h4>
          <div className="space-y-1 text-gray-600">
            <div className="flex justify-between">
              <span>Item(s) Subtotal:</span>
              <span>{formatINR(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{order.shippingPrice === 0 ? 'FREE' : formatINR(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span>{formatINR(order.taxPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="text-amazon-deal-red">{formatINR(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Items in this delivery */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
          Items in this package
        </h4>

        <div className="divide-y divide-gray-100">
          {order.orderItems.map((item, i) => (
            <div key={i} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 bg-white p-1 rounded border border-gray-200 flex-shrink-0">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-contain p-0.5" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="font-bold text-xs text-gray-900">{item.title}</h5>
                  {item.variantName && (
                    <p className="text-[11px] text-gray-500">{item.variantName}</p>
                  )}
                  <p className="text-xs text-gray-600">
                    Quantity: <span className="font-bold text-gray-900">{item.quantity}</span>
                  </p>
                </div>
              </div>
              <span className="font-bold text-sm text-gray-900">
                {formatINR(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
}
