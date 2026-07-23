import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, Printer, Calendar, User, MapPin, Trash2 } from 'lucide-react';
import type { Order } from '../types/pos';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onReprintOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onReprintOrder,
  onDeleteOrder,
}) => {
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#191A25] border border-[#282937] text-white w-full max-w-3xl max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#242533] bg-[#181924]">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#FF5A5F]" />
              <h2 className="text-lg font-bold font-poppins text-white">Order History & Receipts</h2>
            </div>

            <button
              onClick={onClose}
              className="text-[#848796] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Orders Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {orders.length === 0 ? (
              <div className="py-16 text-center text-[#848796]">
                <History className="w-12 h-12 mx-auto mb-3 text-[#848796]/40 stroke-[1.5]" />
                <p className="text-sm font-semibold text-white">No printed orders yet</p>
                <p className="text-xs mt-1 text-[#848796]/70">
                  Completed bills and invoices will appear here for reprint
                </p>
              </div>
            ) : (
              orders.map((order) => {
                const subtotal = order.items.reduce((acc, i) => acc + i.price * i.qty, 0);
                const discountAmt = (subtotal * order.discount_pct) / 100;
                const taxAmt = ((subtotal - discountAmt) * order.tax_pct) / 100;
                const total = subtotal - discountAmt + taxAmt;

                const formattedTime = new Date(order.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={order.id}
                    className="bg-[#1F202C] border border-[#282937] p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#262737] transition-all shadow-md group relative"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#FF5A5F] font-mono">
                          #{order.receipt_no || order.id.slice(-6)}
                        </span>
                        <span className="bg-[#181924] text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-[#282937]">
                          {order.table_label}
                        </span>
                        <span className="text-xs text-[#848796] flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          {formattedTime}
                        </span>
                      </div>

                      {/* Customer Name & Customer Address */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white pt-1">
                        {order.customer_name && (
                          <span className="flex items-center gap-1 font-semibold text-white">
                            <User className="w-3.5 h-3.5 text-[#FF5A5F]" />
                            {order.customer_name}
                          </span>
                        )}

                        {order.customer_address && (
                          <span className="flex items-center gap-1 text-[#848796]">
                            <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                            {order.customer_address}
                          </span>
                        )}
                      </div>

                      {/* Items Summary */}
                      <p className="text-xs text-[#848796] line-clamp-1 pt-0.5">
                        {order.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-[#282937] pt-3 md:pt-0 md:pl-5">
                      <div className="text-right">
                        <span className="text-[10px] text-[#848796] uppercase font-bold tracking-wider block">
                          Total Paid
                        </span>
                        <span className="text-base font-bold text-white font-poppins">
                          Rs. {total.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => onReprintOrder(order)}
                        className="bg-[#FF5A5F] hover:bg-[#E04C51] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Reprint Bill"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Reprint</span>
                      </button>

                      {/* Delete Receipt Trigger Button */}
                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl border border-red-500/20 transition-colors cursor-pointer"
                        title="Delete receipt from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Custom Sleek Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={!!deletingOrder}
          title="Delete Receipt?"
          message={`Are you sure you want to delete receipt #${deletingOrder?.receipt_no || deletingOrder?.id.slice(-6)}? This action cannot be undone.`}
          onConfirm={() => {
            if (deletingOrder) {
              onDeleteOrder(deletingOrder.id);
              setDeletingOrder(null);
            }
          }}
          onCancel={() => setDeletingOrder(null)}
        />
      </div>
    </AnimatePresence>
  );
};
