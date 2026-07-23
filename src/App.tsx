import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { CategoryTabs } from './components/CategoryTabs';
import { MenuItemCard } from './components/MenuItemCard';
import { OrderRail } from './components/OrderRail';
import { InvoiceModal } from './components/InvoiceModal';
import { SettingsModal } from './components/SettingsModal';
import { AddMenuItemModal } from './components/AddMenuItemModal';
import { EditMenuItemModal } from './components/EditMenuItemModal';
import { AddCustomItemModal } from './components/AddCustomItemModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Edit3, Trash2, UtensilsCrossed, CheckCircle2, ShoppingCart } from 'lucide-react';

import type { MenuItem, OrderItem, BusinessSettings, Order, Customer } from './types/pos';
import { AddressBookModal } from './components/AddressBookModal';
import {
  DEFAULT_BUSINESS_SETTINGS,
  INITIAL_MENU_ITEMS,
  INITIAL_CUSTOMERS,
  fetchMenuItems,
  fetchBusinessSettings,
  saveOrderToSupabase,
  updateBusinessSettingsInSupabase,
  saveMenuItemToSupabase,
  deleteMenuItemFromSupabase,
  fetchOrderHistoryFromSupabase,
  deleteOrderFromSupabase,
  fetchCustomersFromSupabase,
  saveCustomerToSupabase,
  deleteCustomerFromSupabase,
  isSupabaseConfigured,
} from './lib/supabase';

export function App() {
  // Theme State: 'dark' or 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('hj_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    localStorage.setItem('hj_theme', theme);
  }, [theme]);

  // Business Settings State
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('hj_business_settings');
    return saved ? JSON.parse(saved) : DEFAULT_BUSINESS_SETTINGS;
  });

  // Menu Items State
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('hj_menu_items');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // Order Rail State
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('hj_current_order');
    return saved ? JSON.parse(saved) : [];
  });
  const [tableLabel, setTableLabel] = useState('Table 1');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);

  // Mobile Drawer State
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);

  // Navigation & Filtering State
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Control State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isEditMenuItemModalOpen, setIsEditMenuItemModalOpen] = useState(false);
  const [isAddCustomItemModalOpen, setIsAddCustomItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItem | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAddressBookModalOpen, setIsAddressBookModalOpen] = useState(false);

  // Saved Customers Directory State
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('hj_saved_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  useEffect(() => {
    localStorage.setItem('hj_saved_customers', JSON.stringify(customers));
  }, [customers]);

  const handleAddCustomer = (c: Omit<Customer, 'id'>) => {
    const tempId = `c_${Date.now()}`;
    const newCustomer: Customer = {
      ...c,
      id: tempId,
      created_at: new Date().toISOString(),
    };

    // 1. Instantly update local state and localStorage
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Saved "${newCustomer.name}" to directory!`);

    // 2. Sync to Supabase in background
    saveCustomerToSupabase(c)
      .then((savedRemote) => {
        if (savedRemote && savedRemote.id) {
          setCustomers((prev) =>
            prev.map((item) =>
              item.id === tempId ? { ...item, id: savedRemote.id } : item
            )
          );
        }
      })
      .catch((err) => {
        console.error('Background customer sync error:', err);
      });
  };

  const handleEditCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast(`Updated "${updated.name}"!`);
    saveCustomerToSupabase(updated).catch(() => {});
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast('Customer deleted from directory!');
    deleteCustomerFromSupabase(id).catch(() => {});
  };

  const handleSelectCustomerForOrder = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerAddress(customer.address);
    showToast(`Applied ${customer.name}'s details!`);
  };

  // Order History State
  const [orderHistory, setOrderHistory] = useState<Order[]>(() => {
    const saved = localStorage.getItem('hj_order_history');
    return saved ? JSON.parse(saved) : [];
  });

  const isDark = theme === 'dark';

  // Derived Totals for Mobile Floating Cart Button
  const totalItemCount = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.qty, 0);
  }, [orderItems]);

  const orderTotalAmount = useMemo(() => {
    const sub = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const disc = (sub * discountPct) / 100;
    const tax = ((sub - disc) * taxPct) / 100;
    return sub - disc + tax;
  }, [orderItems, discountPct, taxPct]);

  // Supabase Backend Sync on Load
  useEffect(() => {
    async function syncSupabaseBackend() {
      if (!isSupabaseConfigured()) return;
      try {
        const remoteSettings = await fetchBusinessSettings();
        if (remoteSettings) {
          setBusinessSettings(remoteSettings);
        }
        const remoteMenu = await fetchMenuItems();
        if (remoteMenu && remoteMenu.length > 0) {
          setMenuItems(remoteMenu);
        }
        const remoteOrders = await fetchOrderHistoryFromSupabase();
        if (remoteOrders && remoteOrders.length > 0) {
          setOrderHistory(remoteOrders);
        }
        const remoteCustomers = await fetchCustomersFromSupabase();
        if (remoteCustomers && remoteCustomers.length > 0) {
          setCustomers((prev) => {
            const merged = [...remoteCustomers];
            prev.forEach((localItem) => {
              if (!merged.some((r) => r.id === localItem.id || r.name.toLowerCase() === localItem.name.toLowerCase())) {
                merged.push(localItem);
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.log('Supabase sync using local fallback data:', err);
      }
    }
    syncSupabaseBackend();
  }, []);

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem('hj_business_settings', JSON.stringify(businessSettings));
  }, [businessSettings]);

  useEffect(() => {
    localStorage.setItem('hj_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('hj_current_order', JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    localStorage.setItem('hj_order_history', JSON.stringify(orderHistory));
  }, [orderHistory]);

  // Toast notification helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Derived Categories
  const categories = useMemo(() => {
    const set = new Set(menuItems.map((item) => item.category));
    return Array.from(set);
  }, [menuItems]);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Items' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.is_active;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Order Rail Handlers
  const handleAddToCart = (menuItem: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItem.id || i.name === menuItem.name);
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          menu_item_id: menuItem.id,
          name: menuItem.name,
          qty: 1,
          price: menuItem.price,
        },
      ];
    });

    showToast(`Added "${menuItem.name}" to order!`);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearAllOrderItems = () => {
    setOrderItems([]);
    setCustomerName('');
    setCustomerAddress('');
    setTableLabel('Table 1');
    showToast('Current order and customer details cleared!');
  };

  const handleUpdateItemNotes = (itemId: string, notes: string) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handleAddCustomItem = (customItem: OrderItem) => {
    setOrderItems((prev) => [...prev, customItem]);
    showToast(`Added "${customItem.name}" to order!`);
  };

  // Immediate Order History Save when "Print Invoice" button is clicked
  const handlePrintBillsAndOpenInvoice = async () => {
    if (orderItems.length === 0) return;

    const receiptNo = Math.floor(100000 + Math.random() * 900000);
    const newRecord: Order = {
      id: 'ord-' + Date.now(),
      receipt_no: receiptNo,
      table_label: tableLabel,
      customer_name: customerName || 'Mr. Client',
      customer_address: customerAddress,
      status: 'printed',
      discount_pct: discountPct,
      tax_pct: taxPct,
      created_at: new Date().toISOString(),
      items: [...orderItems],
    };

    // Save to Supabase and get the actual created database UUID
    const supabaseOrder = await saveOrderToSupabase(newRecord, orderItems);
    if (supabaseOrder && supabaseOrder.id) {
      newRecord.id = supabaseOrder.id;
    }

    setOrderHistory((prev) => [newRecord, ...prev]);
    showToast(`Order #${receiptNo} saved to history!`);

    setIsInvoiceModalOpen(true);
  };

  const handleDeleteOrderHistoryItem = (orderId: string) => {
    const targetOrder = orderHistory.find((o) => o.id === orderId);
    setOrderHistory((prev) => prev.filter((o) => o.id !== orderId));
    deleteOrderFromSupabase(orderId, targetOrder?.receipt_no).catch(() => {});
    showToast('Receipt deleted from history!');
  };

  const handleAddMenuItem = async (newItem: MenuItem) => {
    const created = await saveMenuItemToSupabase(newItem);
    if (created && created.id) {
      newItem.id = created.id;
    }
    setMenuItems((prev) => [newItem, ...prev]);
    showToast(`Added "${newItem.name}" to menu!`);
  };

  const handleOpenEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setIsEditMenuItemModalOpen(true);
  };

  const handleSaveMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    saveMenuItemToSupabase(updatedItem).catch(() => {});
    showToast(`Updated "${updatedItem.name}"!`);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    deleteMenuItemFromSupabase(itemId).catch(() => {});
    showToast('Item deleted from menu!');
  };

  const handleSaveSettings = (updated: BusinessSettings) => {
    setBusinessSettings(updated);
    updateBusinessSettingsInSupabase(updated).catch(() => {});
    showToast('Business settings saved!');
  };

  const handleReprintOrder = (pastOrder: Order) => {
    setOrderItems(pastOrder.items);
    setTableLabel(pastOrder.table_label);
    setCustomerName(pastOrder.customer_name || '');
    setCustomerAddress(pastOrder.customer_address || '');
    setDiscountPct(pastOrder.discount_pct);
    setTaxPct(pastOrder.tax_pct);
    setIsHistoryModalOpen(false);
    setIsInvoiceModalOpen(true);
  };

  // Framer Motion Container Stagger Variant
  const gridContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <div
      className={`flex h-screen overflow-hidden font-inter relative transition-colors duration-300 ${
        isDark ? 'bg-[#14151D] text-white' : 'bg-[#F4F5F9] text-slate-800'
      }`}
    >
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-semibold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400/20 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Left Sidebar / Mobile Bottom Nav */}
      <Sidebar
        activeTab={activeNavTab}
        setActiveTab={setActiveNavTab}
        openSettings={() => setIsSettingsModalOpen(true)}
        openHistory={() => setIsHistoryModalOpen(true)}
        openAddressBook={() => setIsAddressBookModalOpen(true)}
        theme={theme}
      />

      {/* 2. Main Workspace */}
      <main
        className={`flex-1 flex flex-col p-4 sm:p-6 pb-24 lg:pb-6 overflow-y-auto min-w-0 transition-colors ${
          isDark ? 'bg-[#14151D]' : 'bg-[#F4F5F9]'
        }`}
      >
        <HeaderBar
          businessSettings={businessSettings}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openAddMenuItemModal={() => setIsAddMenuItemModalOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* View Switcher based on Sidebar Navigation */}
        {activeNavTab === 'menu' ? (
          /* Dedicated Menu Management View */
          <div className="flex-1 flex flex-col">
            <div
              className={`mb-5 sm:mb-6 pb-4 border-b ${
                isDark ? 'border-[#242533]' : 'border-slate-200'
              }`}
            >
              <h2
                className={`text-lg sm:text-xl font-bold font-poppins flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5A5F]" />
                <span>Menu Management</span>
              </h2>
              <p className={`text-xs mt-0.5 font-medium ${isDark ? 'text-[#848796]' : 'text-slate-500'}`}>
                Add, edit prices, update categories, or delete dishes from your POS menu
              </p>
            </div>

            {/* Category Filter */}
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              theme={theme}
            />

            {/* Menu Items Grid */}
            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8"
            >
              {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 border ${
                    isDark
                      ? 'bg-[#1F202C] hover:bg-[#262737] border-[#282937] shadow-lg shadow-black/20 text-white'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-md shadow-slate-200/50 text-slate-800'
                  }`}
                >
                  <div
                    className={`relative w-full h-32 rounded-xl overflow-hidden mb-3 ${
                      isDark ? 'bg-[#181924]' : 'bg-slate-100'
                    }`}
                  >
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/10">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h3 className={`font-semibold text-sm line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.name}
                    </h3>
                    <span className="text-base font-bold text-[#FF5A5F] font-poppins block mt-1">
                      Rs. {item.price.toFixed(2)}
                    </span>
                  </div>

                  <div className={`flex gap-2 mt-4 pt-3 border-t ${isDark ? 'border-[#282937]' : 'border-slate-200'}`}>
                    <button
                      onClick={() => handleOpenEditMenuItem(item)}
                      className={`flex-1 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isDark ? 'bg-[#181924] hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#FF5A5F]" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingMenuItem(item)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-colors cursor-pointer"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Standard POS Home Dashboard View */
          <>
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              theme={theme}
            />

            <div className="flex-1">
              {filteredMenuItems.length === 0 ? (
                <div
                  className={`flex flex-col items-center justify-center py-20 text-center ${
                    isDark ? 'text-[#848796]' : 'text-slate-400'
                  }`}
                >
                  <span className="text-4xl mb-3">🔍</span>
                  <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    No dishes found
                  </h3>
                  <p className="text-xs mt-1 opacity-70">
                    Try searching for something else or pick another category
                  </p>
                </div>
              ) : (
                <motion.div
                  variants={gridContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-8"
                >
                  {filteredMenuItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={handleAddToCart}
                      onEditItem={handleOpenEditMenuItem}
                      theme={theme}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 3. Mobile Floating View Order Trigger Button (Screens under lg) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setIsMobileOrderOpen(true)}
          className="bg-[#FF5A5F] hover:bg-[#E04C51] text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 font-bold font-poppins text-xs active:scale-95 cursor-pointer border border-white/20"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>
            Order {totalItemCount > 0 ? `(${totalItemCount})` : ''} • Rs. {orderTotalAmount.toFixed(0)}
          </span>
        </button>
      </div>

      {/* 4. Order Rail Panel (Desktop pinned & Mobile Drawer) */}
      <OrderRail
        orderItems={orderItems}
        tableLabel={tableLabel}
        setTableLabel={setTableLabel}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
        discountPct={discountPct}
        setDiscountPct={setDiscountPct}
        taxPct={taxPct}
        setTaxPct={setTaxPct}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearAllItems={handleClearAllOrderItems}
        onUpdateItemNotes={handleUpdateItemNotes}
        onOpenAddCustomItem={() => setIsAddCustomItemModalOpen(true)}
        onOpenInvoiceModal={handlePrintBillsAndOpenInvoice}
        savedCustomers={customers}
        onOpenAddressBook={() => setIsAddressBookModalOpen(true)}
        onSaveCustomerToDirectory={handleAddCustomer}
        theme={theme}
        isMobileOpen={isMobileOrderOpen}
        onCloseMobile={() => setIsMobileOrderOpen(false)}
      />

      {/* 5. Modals */}
      <AddressBookModal
        isOpen={isAddressBookModalOpen}
        onClose={() => setIsAddressBookModalOpen(false)}
        customers={customers}
        onAddCustomer={handleAddCustomer}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onSelectCustomer={handleSelectCustomerForOrder}
        theme={theme}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        businessSettings={businessSettings}
        orderItems={orderItems}
        tableLabel={tableLabel}
        customerName={customerName}
        customerAddress={customerAddress}
        initialDiscountPct={discountPct}
        initialTaxPct={taxPct}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={businessSettings}
        onSave={handleSaveSettings}
      />

      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={() => setIsAddMenuItemModalOpen(false)}
        onAddMenuItem={handleAddMenuItem}
        categories={categories}
      />

      <EditMenuItemModal
        isOpen={isEditMenuItemModalOpen}
        onClose={() => {
          setIsEditMenuItemModalOpen(false);
          setEditingMenuItem(null);
        }}
        item={editingMenuItem}
        onSaveItem={handleSaveMenuItem}
        onDeleteItem={handleDeleteMenuItem}
        categories={categories}
      />

      <AddCustomItemModal
        isOpen={isAddCustomItemModalOpen}
        onClose={() => setIsAddCustomItemModalOpen(false)}
        onAddCustomItem={handleAddCustomItem}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        orders={orderHistory}
        onReprintOrder={handleReprintOrder}
        onDeleteOrder={handleDeleteOrderHistoryItem}
      />

      {/* Custom Delete Confirmation Modal for Menu Dishes */}
      <DeleteConfirmationModal
        isOpen={!!deletingMenuItem}
        title="Delete Dish?"
        message={`Are you sure you want to delete "${deletingMenuItem?.name}" from your POS menu?`}
        onConfirm={() => {
          if (deletingMenuItem) {
            handleDeleteMenuItem(deletingMenuItem.id);
            setDeletingMenuItem(null);
          }
        }}
        onCancel={() => setDeletingMenuItem(null)}
      />
    </div>
  );
}

export default App;
