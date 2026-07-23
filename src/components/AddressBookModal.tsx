import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, UserCheck, Trash2, Edit2, Phone, MapPin, User, BookUser } from 'lucide-react';
import type { Customer } from '../types/pos';

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id'>) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  theme?: 'dark' | 'light';
}

export const AddressBookModal: React.FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  customers,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onSelectCustomer,
  theme = 'dark',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
  );

  const resetForm = () => {
    setName('');
    setAddress('');
    setPhone('');
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (c: Customer) => {
    setEditingId(c.id);
    setName(c.name);
    setAddress(c.address);
    setPhone(c.phone || '');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert('Please fill in Customer Name and Address.');
      return;
    }

    if (editingId) {
      onEditCustomer({
        id: editingId,
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
      });
    } else {
      onAddCustomer({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
      });
    }

    resetForm();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-3xl max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl border flex flex-col ${
            isDark ? 'bg-[#181924] border-[#282937] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b flex items-center justify-between shrink-0 ${
              isDark ? 'bg-[#1F202C] border-[#282937]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5A5F]/15 flex items-center justify-center text-[#FF5A5F]">
                <BookUser className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-poppins">Customer Address Book</h2>
                <p className={`text-xs ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                  Manage saved customer directory and select for active orders
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isDark ? 'border-[#282937] hover:bg-white/10 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar: Search Input & Add New Customer Button */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
            <div className="relative w-full sm:w-80">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#848796]' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, address, phone..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:border-[#FF5A5F] font-medium transition-all ${
                  isDark
                    ? 'bg-[#1F202C] text-white border-[#282937] placeholder-[#848796]/50'
                    : 'bg-slate-100 text-slate-800 border-slate-200 placeholder-slate-400'
                }`}
              />
            </div>

            {!isFormOpen && (
              <button
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="w-full sm:w-auto bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Customer</span>
              </button>
            )}
          </div>

          {/* Content Area: Form OR Customer List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isFormOpen ? (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto bg-white/5 p-5 sm:p-6 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-[#FF5A5F]">
                    {editingId ? 'Edit Customer Details' : 'Add New Customer'}
                  </h3>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-[#848796] hover:text-white underline"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
                    Customer Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848796]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mr. Perera"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:border-[#FF5A5F] font-semibold ${
                        isDark ? 'bg-[#1F202C] text-white border-[#282937]' : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
                    Delivery / Billing Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#848796]" />
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. No. 45, Galle Road, Colombo 03"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:border-[#FF5A5F] font-semibold ${
                        isDark ? 'bg-[#1F202C] text-white border-[#282937]' : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848796]" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0771234567"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:border-[#FF5A5F] font-semibold ${
                        isDark ? 'bg-[#1F202C] text-white border-[#282937]' : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#FF5A5F] hover:bg-[#FF5A5F]/90 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md active:scale-95"
                  >
                    {editingId ? 'Update Customer' : 'Save Customer'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-4 py-3 rounded-2xl text-xs font-semibold border ${
                      isDark ? 'border-[#282937] hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-[#848796]">
                  <BookUser className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-sm">No Customers Found</h3>
                <p className={`text-xs max-w-xs mx-auto ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                  {searchQuery ? 'Try adjusting your search criteria.' : 'Add your first customer to build your address book directory.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all group hover:border-[#FF5A5F]/40 ${
                      isDark ? 'bg-[#1F202C] border-[#282937]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#FF5A5F]/20 text-[#FF5A5F] flex items-center justify-center font-bold text-xs shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm leading-snug">{c.name}</h4>
                            {c.phone && (
                              <p className={`text-[11px] font-mono flex items-center gap-1 ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                                <Phone className="w-3 h-3 text-[#FF5A5F]" /> {c.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit customer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete ${c.name} from Address Book?`)) {
                                onDeleteCustomer(c.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="Delete customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-xs line-clamp-2 font-medium flex items-start gap-1.5 ${isDark ? 'text-[#848796]' : 'text-slate-600'}`}>
                        <MapPin className="w-3.5 h-3.5 text-[#FF5A5F] shrink-0 mt-0.5" />
                        <span>{c.address}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectCustomer(c);
                        onClose();
                      }}
                      className="w-full bg-[#FF5A5F]/15 hover:bg-[#FF5A5F] text-[#FF5A5F] hover:text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Select for Current Order</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
