'use client';

import React from 'react';
import { Check, Truck, Package, Clock, Home, XCircle } from 'lucide-react';
import { Order } from '../../types';
import { formatDate } from '../../lib/utils';

interface TrackingStepperProps {
  order: Order;
}

const steps = [
  { key: 'Placed', label: 'Ordered', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: Check },
  { key: 'Shipped', label: 'Shipped', icon: Package },
  { key: 'OutForDelivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Home },
];

export const TrackingStepper: React.FC<TrackingStepperProps> = ({ order }) => {
  const currentStatus = order.orderStatus;
  const isCancelled = order.orderStatus === 'Cancelled';

  const getStepIndex = (status: string) => {
    return steps.findIndex((s) => s.key === status);
  };

  const currentIndex = isCancelled ? -1 : getStepIndex(currentStatus);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs text-gray-500 font-medium">
            Order #{order.orderNumber}
          </span>
          <h3 className="text-base font-bold text-gray-900">
            {isCancelled ? (
              <span className="text-red-600 flex items-center gap-1.5 mt-0.5">
                <XCircle className="w-5 h-5" />
                <span>Order Cancelled</span>
              </span>
            ) : currentStatus === 'Delivered' ? (
              <span className="text-green-700">Delivered</span>
            ) : (
              <span>Arriving by {formatDate(order.estimatedDeliveryDate)}</span>
            )}
          </h3>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-gray-500 block">Tracking ID</span>
          <span className="text-xs font-mono font-bold text-amazon-navy">
            {order.trackingNumber}
          </span>
        </div>
      </div>

      {/* Stepper Progress */}
      {!isCancelled && (
        <div className="relative py-4">
          <div className="flex items-center justify-between relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentIndex;
              const isCurrent = idx === currentIndex;

              return (
                <div key={step.key} className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-600 text-white shadow-md ring-4 ring-green-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span
                    className={`text-[11px] sm:text-xs font-semibold mt-2 ${
                      isCurrent
                        ? 'text-amazon-navy font-bold'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Background Connecting Bar */}
          <div className="absolute top-8 sm:top-9 left-12 right-12 h-1 bg-gray-200 -z-0">
            <div
              className="bg-green-600 h-1 transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Status History Notes */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Tracking Activity
        </h4>
        <div className="space-y-2 text-xs">
          {order.statusHistory?.map((hist, i) => (
            <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-amazon-orange mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{hist.status}</span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {hist.location && <p className="text-gray-600 font-medium">{hist.location}</p>}
                {hist.notes && <p className="text-gray-500">{hist.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
