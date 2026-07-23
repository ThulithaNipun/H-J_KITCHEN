import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, Printer, PlusCircle, ShoppingBag, X, BookUser, UserCheck, BookmarkPlus } from 'lucide-react';
import type { OrderItem, Customer } from '../types/pos';

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
  onClearAllItems?: () => void;
  onUpdateItemNotes: (itemId: string, notes: string) => void;
  onOpenAddCustomItem: () => void;
  onOpenInvoiceModal: () => void;
  savedCustomers?: Customer[];
  onOpenAddressBook?: () => void;
  onSaveCustomerToDirectory?: (c: { name: string; address: string }) => void;
  theme?: 'dark' | 'light';
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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
  onClearAllItems,
  onUpdateItemNotes,
  onOpenAddCustomItem,
  onOpenInvoiceModal,
  savedCustomers = [],
  onOpenAddressBook,
  onSaveCustomerToDirectory,
  theme = 'dark',
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isDark = theme === 'dark';

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = (subtotal * discountPct) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxPct) / 100;
  const grandTotal = subtotal - discountAmount + taxAmount;

  const content = (
    <div className="flex flex-col h-full select-none">
      {/* Order Rail Header */}
      <div
        className={`p-5 border-b shrink-0 ${
          isDark ? 'border-[#242533] bg-[#191A25]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div>
              <h2
                className={`text-xl font-bold font-poppins ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Current Order
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-medium ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                  {tableLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(orderItems.length > 0 || customerName.trim().length > 0 || customerAddress.trim().length > 0) && onClearAllItems && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear current order items and customer details?')) {
                    onClearAllItems();
                  }
                }}
                className={`flex items-center gap-1 border text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm ${
                  isDark
                    ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                }`}
                title="Clear all order items and customer details"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={onOpenAddCustomItem}
              className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-[#262737] hover:bg-[#2F3045] border-[#282937] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#FF5A5F]" />
              <span>Add-On</span>
            </button>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className={`lg:hidden p-1.5 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-[#282937] bg-[#1F202C] text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Customer Details Inputs: Customer Name & Customer Address */}
        <div className="space-y-2 mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                  isDark ? 'text-[#848796]' : 'text-slate-500'
                }`}
              >
                Table / Order
              </label>
              <select
                value={tableLabel}
                onChange={(e) => setTableLabel(e.target.value)}
                className={`w-full text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-[#FF5A5F] font-medium ${
                  isDark
                    ? 'bg-[#1F202C] text-white border-[#282937]'
                    : 'bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <option value="Table 1" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Table 1
                </option>
                <option value="Table 2" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Table 2
                </option>
                <option value="Table 3" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Table 3
                </option>
                <option value="Table 4" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Table 4
                </option>
                <option value="Table 5" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Table 5
                </option>
                <option value="Takeaway" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Takeaway
                </option>
                <option value="Parcel" className={isDark ? 'bg-[#191A25] text-white py-2' : 'bg-white text-slate-900'}>
                  Parcel
                </option>
              </select>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isDark ? 'text-[#848796]' : 'text-slate-500'
                  }`}
                >
                  Customer Name
                </label>
                {onOpenAddressBook && (
                  <button
                    type="button"
                    onClick={onOpenAddressBook}
                    className="flex items-center gap-1 text-[10px] text-[#FF5A5F] hover:underline font-bold"
                    title="Open Address Book Directory"
                  >
                    <BookUser className="w-3 h-3" />
                    <span>Directory</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="e.g. Mr. Client"
                className={`w-full text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-[#FF5A5F] font-medium ${
                  isDark
                    ? 'bg-[#1F202C] text-white border-[#282937] placeholder-[#848796]/50'
                    : 'bg-slate-50 text-slate-800 border-slate-200 placeholder-slate-400'
                }`}
              />

              {/* Auto-Suggest Dropdown List */}
              {showSuggestions && savedCustomers.length > 0 && customerName.trim().length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-2xl shadow-xl border p-1 font-sans ${
                    isDark ? 'bg-[#1F202C] border-[#282937] text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {savedCustomers
                    .filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .slice(0, 5)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCustomerName(c.name);
                          setCustomerAddress(c.address);
                          setShowSuggestions(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                          isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold text-[#FF5A5F]">{c.name}</span>
                        <span className={`text-[10px] truncate ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                          {c.address}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  isDark ? 'text-[#848796]' : 'text-slate-500'
                }`}
              >
                Customer Address
              </label>
              {onSaveCustomerToDirectory &&
                customerName.trim().length > 1 &&
                customerAddress.trim().length > 3 &&
                !savedCustomers.some((c) => c.name.toLowerCase() === customerName.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={() =>
                      onSaveCustomerToDirectory({
                        name: customerName.trim(),
                        address: customerAddress.trim(),
                      })
                    }
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline font-bold"
                    title="Save current customer to directory"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>Save to Directory</span>
                  </button>
                )}
            </div>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="e.g. No. 12, Galle Road, Colombo 03"
              className={`w-full text-xs px-2.5 py-1.5 rounded-xl border focus:outline-none focus:border-[#FF5A5F] font-medium ${
                isDark
                  ? 'bg-[#1F202C] text-white border-[#282937] placeholder-[#848796]/50'
                  : 'bg-slate-50 text-slate-800 border-slate-200 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Order Items Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {orderItems.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-center p-6 ${isDark ? 'text-[#848796]/50' : 'text-slate-400'}`}>
            <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.5]" />
            <p className="text-sm font-medium">No items in current order</p>
            <p className="text-xs mt-1 opacity-70">Select dishes from the menu grid to add</p>
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
                className={`border p-3.5 rounded-2xl flex flex-col gap-2 relative group shadow-sm ${
                  isDark
                    ? 'bg-[#1F202C] border-[#282937]'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.name} <span className={`font-mono ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>({item.qty}x)</span>
                    </h4>
                    <span className="text-xs font-bold text-[#FF5A5F] font-poppins block mt-0.5">
                      Rs. {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'text-[#848796] hover:text-[#FF5A5F] hover:bg-white/5' : 'text-slate-400 hover:text-red-500 hover:bg-slate-200/50'
                    }`}
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
                  className={`w-full text-[11px] px-2 py-1 rounded-lg border focus:outline-none focus:border-[#FF5A5F]/50 ${
                    isDark
                      ? 'bg-[#181924] text-[#848796] placeholder-[#848796]/40 border-[#282937]'
                      : 'bg-white text-slate-700 placeholder-slate-400 border-slate-200'
                  }`}
                />

                {/* Quantity Modifiers */}
                <div className={`flex items-center justify-between pt-1 border-t ${isDark ? 'border-[#282937]' : 'border-slate-200'}`}>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                    Rs. {item.price.toFixed(2)} each
                  </span>

                  <div className={`flex items-center gap-2 px-2 py-1 rounded-xl border ${isDark ? 'bg-[#181924] border-[#282937]' : 'bg-white border-slate-200'}`}>
                    <button
                      onClick={() => onUpdateQty(item.id, -1)}
                      className={`transition-colors active:scale-75 cursor-pointer ${isDark ? 'text-[#848796] hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>

                    <motion.span
                      key={item.qty}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className={`text-xs font-bold min-w-4 text-center font-mono block ${isDark ? 'text-white' : 'text-slate-900'}`}
                    >
                      {item.qty}
                    </motion.span>

                    <button
                      onClick={() => onUpdateQty(item.id, 1)}
                      className={`transition-colors active:scale-75 cursor-pointer ${isDark ? 'text-[#848796] hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
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
      <div className={`p-5 border-t shrink-0 flex flex-col gap-3 ${isDark ? 'border-[#242533] bg-[#191A25]' : 'border-slate-200 bg-white'}`}>
        <div className={`space-y-2 text-xs p-4 rounded-2xl border ${isDark ? 'bg-[#1F202C] border-[#282937]' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`flex items-center justify-between ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
            <span>Sub Total</span>
            <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Rs. {subtotal.toFixed(2)}</span>
          </div>

          <div className={`flex items-center justify-between ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
            <span className="flex items-center gap-1">
              Discount
              <input
                type="number"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className={`w-10 text-center text-xs rounded border py-0.5 focus:outline-none focus:border-[#FF5A5F] ${
                  isDark ? 'bg-[#181924] text-white border-[#282937]' : 'bg-white text-slate-900 border-slate-300'
                }`}
              />
              %
            </span>
            <span className="font-mono text-[#FF5A5F]">- Rs. {discountAmount.toFixed(2)}</span>
          </div>

          <div className={`flex items-center justify-between ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
            <span className="flex items-center gap-1">
              Tax
              <input
                type="number"
                min="0"
                max="100"
                value={taxPct}
                onChange={(e) => setTaxPct(Number(e.target.value))}
                className={`w-10 text-center text-xs rounded border py-0.5 focus:outline-none focus:border-[#FF5A5F] ${
                  isDark ? 'bg-[#181924] text-white border-[#282937]' : 'bg-white text-slate-900 border-slate-300'
                }`}
              />
              %
            </span>
            <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>+ Rs. {taxAmount.toFixed(2)}</span>
          </div>

          <div className={`border-t border-dashed pt-2 flex items-center justify-between text-sm font-bold ${isDark ? 'border-[#282937] text-white' : 'border-slate-300 text-slate-900'}`}>
            <span className="font-poppins">Total</span>
            <span className="font-poppins text-lg font-black">Rs. {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={orderItems.length === 0}
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            onOpenInvoiceModal();
          }}
          className="w-full bg-[#FF5A5F] hover:bg-[#E04C51] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#FF5A5F]/20 active:scale-[0.98] cursor-pointer"
        >
          <Printer className="w-5 h-5" />
          <span className="font-poppins text-sm tracking-wide">Print Invoice</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Pinned Order Rail (lg screens and up) */}
      <aside
        className={`hidden lg:flex w-96 border-l flex-col h-screen select-none shrink-0 transition-colors ${
          isDark
            ? 'bg-[#191A25] border-[#242533]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {content}
      </aside>

      {/* 2. Mobile Slide-Over Drawer Modal (< lg screens) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-full h-[90vh] rounded-t-3xl overflow-hidden shadow-2xl ${
                isDark ? 'bg-[#191A25]' : 'bg-white'
              }`}
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
