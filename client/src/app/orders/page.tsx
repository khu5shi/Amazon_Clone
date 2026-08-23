'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, FileText, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { Order } from '../../types';
import { InvoiceModal } from '../../components/order/InvoiceModal';
import { formatINR, formatDate } from '../../lib/utils';
import { initialProducts } from '../../lib/mockData';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('amzn_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        // Create initial sample order
        const sampleOrder: Order = {
          _id: 'ord_sample_1',
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

        setOrders([sampleOrder]);
        localStorage.setItem('amzn_orders', JSON.stringify([sampleOrder]));
      }
    } catch (e) {
      setOrders([]);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-gray-800 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Your Orders
          </h1>
          <p className="text-xs text-gray-500">
            Track packages, view tax invoices, and manage past purchases
          </p>
        </div>

        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full w-fit">
          {orders.length} order{orders.length === 1 ? '' : 's'} placed
        </span>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No orders placed yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Looking for something? Explore our wide selection of mobiles, laptops, and electronics!
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-lg shadow-sm transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              {/* Order Meta Bar */}
              <div className="bg-[#f0f2f2] px-6 py-3 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold">Order Placed</span>
                  <span className="font-semibold text-gray-900">{formatDate(order.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold">Total</span>
                  <span className="font-bold text-gray-900">{formatINR(order.totalPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-bold">Ship to</span>
                  <span className="font-semibold text-amazon-prime hover:underline cursor-pointer">
                    {order.shippingAddress.fullName}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-gray-500 block uppercase text-[10px] font-bold">Order # {order.orderNumber}</span>
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="text-xs font-semibold text-amazon-prime hover:underline inline-flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>

              {/* Order Items & Actions */}
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-700" />
                    <span className="font-bold text-sm text-gray-900">
                      {order.orderStatus === 'Delivered'
                        ? 'Delivered'
                        : order.orderStatus === 'Cancelled'
                        ? 'Cancelled'
                        : `Arriving by ${formatDate(order.estimatedDeliveryDate)}`}
                    </span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-white p-1 rounded border border-gray-200 flex-shrink-0">
                          <Image src={item.thumbnail} alt={item.title} fill className="object-contain p-0.5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{item.title}</h4>
                          {item.variantName && (
                            <p className="text-[11px] text-gray-500">{item.variantName}</p>
                          )}
                          <p className="text-xs font-bold text-amazon-deal-red">
                            {formatINR(item.price)} <span className="text-gray-500 font-normal">x {item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="w-full md:w-56 space-y-2 flex-shrink-0">
                  <Link
                    href={`/orders/${order._id}`}
                    className="w-full py-2 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Package</span>
                  </Link>

                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition text-center"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Tax Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Modal Preview */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
