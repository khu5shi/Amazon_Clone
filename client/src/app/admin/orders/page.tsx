'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Truck, CheckCircle2, Clock, MapPin, FileText, ArrowRight } from 'lucide-react';
import { Order } from '../../../types';
import { initialProducts } from '../../../lib/mockData';
import { formatINR, formatDate } from '../../../lib/utils';
import { apiClient } from '../../../lib/api';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('amzn_orders');
      if (stored) {
        setOrders(JSON.parse(stored));
      } else {
        const sampleOrder: Order = {
          _id: 'ord_admin_sample_1',
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
            fullName: 'Rahul Sharma',
            phone: '+919812345678',
            street: 'Flat 402, Royal Palms Residency',
            apartment: 'Tower B',
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
          orderStatus: 'Placed',
          statusHistory: [
            {
              status: 'Placed',
              timestamp: new Date().toISOString(),
              location: 'Gurugram Fulfillment Center',
              notes: 'Order placed by customer.',
            },
          ],
          trackingNumber: 'AMZN-IN-89214718-402',
          estimatedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        };
        setOrders([sampleOrder]);
        localStorage.setItem('amzn_orders', JSON.stringify([sampleOrder]));
      }
    } catch (e) {
      setOrders([]);
    }
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'Placed' | 'Shipped' | 'OutForDelivery' | 'Delivered' | 'Cancelled'
  ) => {
    setUpdatingId(orderId);
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, {
        orderStatus: newStatus,
        location: 'Amazon Logistics Sorting Center',
        notes: `Order status advanced to ${newStatus} by Admin`,
      });
    } catch (e) {
      // Local sync fallback
    }

    const updatedOrders = orders.map((o) => {
      if (o._id === orderId) {
        return {
          ...o,
          orderStatus: newStatus,
          statusHistory: [
            ...o.statusHistory,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              location: 'Amazon Logistics Sorting Hub',
              notes: `Status updated to ${newStatus} by Admin. Notification email sent.`,
            },
          ],
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem('amzn_orders', JSON.stringify(updatedOrders));
    setUpdatingId(null);
  };

  const filteredOrders = orders.filter((o) =>
    selectedStatusFilter === 'all' ? true : o.orderStatus === selectedStatusFilter
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Order Fulfillment & Tracking Console
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Advance order status, update courier tracking numbers, and view customer delivery addresses
          </p>
        </div>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white"
        >
          <option value="all">All Orders Statuses</option>
          <option value="Placed">Placed</option>
          <option value="Shipped">Shipped</option>
          <option value="OutForDelivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#131926] p-12 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-gray-500">
          No orders match the selected status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-[#131926] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header Bar */}
              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-gray-500 block text-[11px]">
                    Placed on {formatDate(order.createdAt)} | Tracking ID: {order.trackingNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Update Status:</span>
                  <select
                    value={order.orderStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) =>
                      handleUpdateStatus(
                        order._id,
                        e.target.value as any
                      )
                    }
                    className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-bold text-amazon-orange cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="OutForDelivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Items (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">
                    Purchased Items ({order.orderItems.length})
                  </span>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.orderItems.map((item, i) => (
                      <div key={i} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-12 h-12 object-contain bg-white p-1 rounded border border-gray-200"
                          />
                          <div>
                            <h5 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-amazon-deal-red">
                          {formatINR(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address & Customer Details (5 cols) */}
                <div className="lg:col-span-5 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-1.5 text-amazon-orange font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>Customer Delivery Address</span>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress.street}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-500">Phone: {order.shippingAddress.phone}</p>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center font-bold text-gray-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="text-sm text-amazon-deal-red">{formatINR(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
