'use client';

import React from 'react';
import { X, Printer, Download, ShieldCheck } from 'lucide-react';
import { Order } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';

interface InvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-gray-300">
        {/* Modal Top Bar */}
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex items-center justify-between no-print">
          <span className="text-sm font-bold text-gray-800">
            Tax Invoice / Bill of Supply
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-semibold text-gray-800 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-900 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document */}
        <div className="p-8 space-y-6 text-xs text-gray-800 font-sans">
          {/* Header & Logo */}
          <div className="flex items-start justify-between border-b border-gray-300 pb-4">
            <div>
              <span className="text-2xl font-black tracking-tight text-amazon-navy">
                amazon<span className="text-amazon-orange text-sm font-bold">.in</span>
              </span>
              <p className="text-[11px] text-gray-500 mt-1">
                Amazon Enterprise Platform Private Limited<br />
                GSTIN: 07AABCA1234F1Z5 | PAN: AABCA1234F<br />
                Cyber Hub, Gurugram, Haryana - 122002
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold text-gray-900 uppercase">Tax Invoice</h2>
              <p className="font-mono text-gray-600 mt-1">Invoice #{order.orderNumber}</p>
              <p className="text-gray-500">Date: {formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Billing & Shipping Addresses */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-1">
                Shipping Address:
              </h4>
              <p className="font-bold">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress.street}</p>
              {order.shippingAddress.apartment && <p className="text-gray-600">{order.shippingAddress.apartment}</p>}
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-1">
                Order & Payment Info:
              </h4>
              <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
              <p><strong>Payment Status:</strong> {order.paymentStatus.toUpperCase()}</p>
              <p><strong>Tracking Number:</strong> <span className="font-mono">{order.trackingNumber}</span></p>
              <p><strong>Delivery Method:</strong> {order.deliveryMethod === 'prime_express' ? 'Prime 1-Day Express' : 'Standard'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="p-2.5 font-bold">Item Description</th>
                <th className="p-2.5 font-bold text-center">Qty</th>
                <th className="p-2.5 font-bold text-right">Unit Price</th>
                <th className="p-2.5 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.orderItems.map((item, i) => (
                <tr key={i}>
                  <td className="p-2.5">
                    <span className="font-bold text-gray-900 block">{item.title}</span>
                    {item.variantName && (
                      <span className="text-[11px] text-gray-500">{item.variantName}</span>
                    )}
                  </td>
                  <td className="p-2.5 text-center font-semibold">{item.quantity}</td>
                  <td className="p-2.5 text-right">{formatINR(item.price)}</td>
                  <td className="p-2.5 text-right font-bold">{formatINR(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-right border-t border-gray-200 pt-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatINR(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping & Handling:</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : formatINR(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18% included):</span>
                <span>{formatINR(order.taxPrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-300 pt-2">
                <span>Total Amount:</span>
                <span className="text-amazon-deal-red">{formatINR(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-500 text-center space-y-1">
            <p>This is a computer-generated tax invoice and requires no physical signature.</p>
            <p>DPDP Act 2023 Compliant. Data processed under Section 11 of Digital Personal Data Protection Act.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
