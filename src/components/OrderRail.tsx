import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, Printer, PlusCircle, ShoppingBag } from 'lucide-react';
import type { OrderItem } from '../types/pos';

interface OrderRailProps {
  orderItems: OrderItem[];
  tableLabel: string;
  setTableLabel: (label: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerAddress: string;
  setCustomerAddress: (address: string) => void;
  discountPct: number;
  setDiscountPct: (pct: number) => void;
  taxPct: number;
  setTaxPct: (pct: number) => void;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItemNotes: (itemId: string, notes: string) => void;
  onOpenAddCustomItem: () => void;
  onOpenInvoiceModal: () => void;
}

export const OrderRail: React.FC<OrderRailProps> = ({
  orderItems,
  tableLabel,
  setTableLabel,
  customerName,
  setCustomerName,
  customerAddress,
  setCustomerAddress,
  discountPct,
  setDiscountPct,
  taxPct,
  setTaxPct,
  onUpdateQty,
  onRemoveItem,
  onUpdateItemNotes,
  onOpenAddCustomItem,
  onOpenInvoiceModal,
}) => {
  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = (subtotal * discountPct) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxPct) / 100;
  const grandTotal = subtotal - discountAmount + taxAmount;

  return (
    <aside className="w-96 bg-[#191A25] border-l border-[#242533] flex flex-col h-screen select-none shrink-0">
      {/* Order Rail Header */}
      <div className="p-5 border-b border-[#242533] bg-[#191A25]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-white font-poppins">Order</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#848796] font-medium">{tableLabel}</span>
            </div>
          </div>

          <button
            onClick={onOpenAddCustomItem}
            className="flex items-center gap-1.5 bg-[#262737] hover:bg-[#2F3045] border border-[#282937] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-[#FF5A5F]" />
            <span>Add-On</span>
          </button>
        </div>

        {/* Customer Details Inputs: Customer Name & Customer Address */}
        <div className="space-y-2 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#848796] tracking-wider block mb-1">
                Table / Order
              </label>
              <select
                value={tableLabel}
                onChange={(e) => setTableLabel(e.target.value)}
                className="w-full bg-[#1F202C] text-white text-xs px-2.5 py-1.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-medium"
              >
                <option value="Table 1" className="bg-[#191A25] text-white py-2">Table 1</option>
                <option value="Table 2" className="bg-[#191A25] text-white py-2">Table 2</option>
                <option value="Table 3" className="bg-[#191A25] text-white py-2">Table 3</option>
                <option value="Table 4" className="bg-[#191A25] text-white py-2">Table 4</option>
                <option value="Table 5" className="bg-[#191A25] text-white py-2">Table 5</option>
                <option value="Takeaway" className="bg-[#191A25] text-white py-2">Takeaway</option>
                <option value="Parcel" className="bg-[#191A25] text-white py-2">Parcel</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#848796] tracking-wider block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Mr. Client"
                className="w-full bg-[#1F202C] text-white text-xs px-2.5 py-1.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-medium placeholder-[#848796]/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#848796] tracking-wider block mb-1">
              Customer Address
            </label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. No. 12, Galle Road, Colombo 03"
              className="w-full bg-[#1F202C] text-white text-xs px-2.5 py-1.5 rounded-xl border border-[#282937] focus:outline-none focus:border-[#FF5A5F] font-medium placeholder-[#848796]/50"
            />
          </div>
        </div>
      </div>

      {/* Order Items Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {orderItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#848796]/50">
            <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium">No items in current order</p>
            <p className="text-xs mt-1 text-[#848796]/40">Select dishes from the menu grid to add</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {orderItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="bg-[#1F202C] border border-[#282937] p-3.5 rounded-2xl flex flex-col gap-2 relative group shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {item.name} <span className="text-[#848796] font-mono">({item.qty}x)</span>
                    </h4>
                    <span className="text-xs font-bold text-[#FF5A5F] font-poppins block mt-0.5">
                      Rs. {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-[#848796] hover:text-[#FF5A5F] p-1 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Customization Note */}
                <input
                  type="text"
                  value={item.notes || ''}
                  onChange={(e) => onUpdateItemNotes(item.id, e.target.value)}
                  placeholder="Note (e.g. Extra spicy, No onion)..."
                  className="w-full bg-[#181924] text-[11px] text-[#848796] placeholder-[#848796]/40 px-2 py-1 rounded-lg border border-[#282937] focus:outline-none focus:border-[#FF5A5F]/50"
                />

                {/* Quantity Modifiers */}
                <div className="flex items-center justify-between pt-1 border-t border-[#282937]">
                  <span className="text-[10px] text-[#848796] font-mono">
                    Rs. {item.price.toFixed(2)} each
                  </span>

                  <div className="flex items-center gap-2 bg-[#181924] px-2 py-1 rounded-xl border border-[#282937]">
                    <button
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="text-[#848796] hover:text-white transition-colors active:scale-75"
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <motion.span
                      key={item.qty}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-bold text-white min-w-4 text-center font-mono block"
                    >
                      {item.qty}
                    </motion.span>

                    <button
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="text-[#848796] hover:text-white transition-colors active:scale-75"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pinned Order Summary & Big Print Button Footer */}
      <div className="p-5 border-t border-[#242533] bg-[#191A25] flex flex-col gap-3">
        <div className="space-y-2 text-xs bg-[#1F202C] p-4 rounded-2xl border border-[#282937]">
          <div className="flex items-center justify-between text-[#848796]">
            <span>Sub Total</span>
            <span className="font-mono font-bold text-white">Rs. {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[#848796]">
            <span className="flex items-center gap-1">
              Discount
              <input
                type="number"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-10 bg-[#181924] text-center text-xs text-white rounded border border-[#282937] py-0.5 focus:outline-none focus:border-[#FF5A5F]"
              />
              %
            </span>
            <span className="font-mono text-[#FF5A5F]">- Rs. {discountAmount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-[#848796]">
            <span className="flex items-center gap-1">
              Tax
              <input
                type="number"
                min="0"
                max="100"
                value={taxPct}
                onChange={(e) => setTaxPct(Number(e.target.value))}
                className="w-10 bg-[#181924] text-center text-xs text-white rounded border border-[#282937] py-0.5 focus:outline-none focus:border-[#FF5A5F]"
              />
              %
            </span>
            <span className="font-mono text-white">+ Rs. {taxAmount.toFixed(2)}</span>
          </div>

          <div className="border-t border-dashed border-[#282937] pt-2 flex items-center justify-between text-sm font-bold text-white">
            <span className="font-poppins">Total</span>
            <span className="font-poppins text-lg text-white font-black">Rs. {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={orderItems.length === 0}
          onClick={onOpenInvoiceModal}
          className="w-full bg-[#FF5A5F] hover:bg-[#E04C51] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#FF5A5F]/20 active:scale-[0.98] cursor-pointer"
        >
          <Printer className="w-5 h-5" />
          <span className="font-poppins text-sm tracking-wide">Print Invoice</span>
        </button>
      </div>
    </aside>
  );
};
