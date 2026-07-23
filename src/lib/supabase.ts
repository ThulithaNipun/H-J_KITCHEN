import { createClient } from '@supabase/supabase-js';
import type { MenuItem, BusinessSettings, Order, OrderItem, Customer } from '../types/pos';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'H&J Kitchen',
  address: 'No. 45, Galle Road, Colombo 03',
  phone: '+94 77 123 4567',
  website: 'FB: H&J Kitchen',
  bank_name: 'Commercial Bank',
  bank_account: '8001234567',
  invoice_note: 'Thank you for your order! For enquiries, please contact us on the number above.',
  logo_url: '/logo.webp'
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Mr. Perera',
    address: 'No. 45, Galle Road, Colombo 03',
    phone: '0771234567',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Mrs. Silva',
    address: '12/A, Station Road, Dehiwala',
    phone: '0719876543',
    created_at: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Nimal Jayasinghe',
    address: '88, Kandy Road, Kiribathgoda',
    phone: '0754433221',
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Rice & Curry with Chicken (Regular)',
    category: 'Rice & Curry',
    price: 350,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm2',
    name: 'Rice & Curry with Chicken (Large)',
    category: 'Rice & Curry',
    price: 380,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm3',
    name: 'Rice & Curry with Fish',
    category: 'Rice & Curry',
    price: 400,
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm4',
    name: 'Rice & Curry with Vegetables',
    category: 'Rice & Curry',
    price: 340,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm5',
    name: 'Rice & Curry with Pork',
    category: 'Rice & Curry',
    price: 650,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm6',
    name: 'Chicken / Fish Special Menu',
    category: 'Specials',
    price: 500,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm7',
    name: 'Yellow Rice — Special Menu',
    category: 'Yellow Rice',
    price: 550,
    image_url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm8',
    name: 'Yellow Rice — Normal Menu',
    category: 'Yellow Rice',
    price: 500,
    image_url: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm9',
    name: 'Fried Rice',
    category: 'Fried Rice',
    price: 580,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80',
    is_active: true
  },
  {
    id: 'm10',
    name: 'Vegetable Rice',
    category: 'Fried Rice',
    price: 450,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80',
    is_active: true
  }
];

export const isSupabaseConfigured = () => {
  return !supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder');
};

// Phase B Supabase Async Helpers
export async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .single();

  if (error || !data) return null;
  return data as BusinessSettings;
}

export async function updateBusinessSettingsInSupabase(settings: BusinessSettings) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('business_settings')
    .upsert({
      id: settings.id || DEFAULT_BUSINESS_SETTINGS.id,
      name: settings.name,
      address: settings.address,
      phone: settings.phone,
      website: settings.website,
      bank_name: settings.bank_name,
      bank_account: settings.bank_account,
      invoice_note: settings.invoice_note,
      logo_url: settings.logo_url,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) console.error('Supabase settings update error:', error);
  return data;
}

export async function fetchMenuItems(): Promise<MenuItem[] | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data) return null;
  return data as MenuItem[];
}

export async function saveMenuItemToSupabase(item: MenuItem) {
  if (!isSupabaseConfigured()) return null;
  const payload: any = {
    name: item.name,
    category: item.category,
    price: item.price,
    image_url: item.image_url,
    is_active: item.is_active ?? true,
  };

  if (item.id && !item.id.startsWith('m-')) {
    payload.id = item.id;
  }

  const { data, error } = await supabase
    .from('menu_items')
    .upsert(payload)
    .select()
    .single();

  if (error) console.error('Supabase menu item save error:', error);
  return data;
}

export async function deleteMenuItemFromSupabase(itemId: string) {
  if (!isSupabaseConfigured() || itemId.startsWith('m-')) return null;
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId);

  if (error) console.error('Supabase menu item delete error:', error);
}

export async function fetchOrderHistoryFromSupabase(): Promise<Order[] | null> {
  if (!isSupabaseConfigured()) return null;
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (ordersErr || !orders) return null;

  return orders.map((o: any) => ({
    id: o.id,
    receipt_no: o.receipt_no,
    table_label: o.table_label,
    customer_name: o.customer_name,
    customer_address: o.customer_address,
    status: o.status,
    discount_pct: Number(o.discount_pct || 0),
    tax_pct: Number(o.tax_pct || 0),
    created_at: o.created_at,
    printed_at: o.printed_at,
    items: (o.order_items || []).map((oi: any) => ({
      id: oi.id,
      order_id: oi.order_id,
      menu_item_id: oi.menu_item_id,
      name: oi.name,
      qty: Number(oi.qty || 1),
      price: Number(oi.price || 0),
    })),
  }));
}

export async function saveOrderToSupabase(
  order: Omit<Order, 'id'> | Order,
  items: OrderItem[]
) {
  if (!isSupabaseConfigured()) return null;

  const { data: orderData, error: orderErr } = await supabase
    .from('orders')
    .insert({
      table_label: order.table_label,
      customer_name: order.customer_name,
      customer_address: order.customer_address,
      status: 'printed',
      discount_pct: order.discount_pct,
      tax_pct: order.tax_pct,
      receipt_no: order.receipt_no,
      printed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (orderErr || !orderData) {
    console.error('Supabase order save error:', orderErr);
    return null;
  }

  const orderItemsPayload = items.map((i) => ({
    order_id: orderData.id,
    menu_item_id: i.menu_item_id && !i.menu_item_id.startsWith('m') ? i.menu_item_id : null,
    name: i.name,
    qty: i.qty,
    price: i.price,
  }));

  await supabase.from('order_items').insert(orderItemsPayload);
  return orderData;
}

export async function deleteOrderFromSupabase(orderId: string, receiptNo?: number) {
  if (!isSupabaseConfigured()) return null;

  let query = supabase.from('orders').delete();
  if (receiptNo && orderId.startsWith('ord-')) {
    query = query.eq('receipt_no', receiptNo);
  } else {
    query = query.eq('id', orderId);
  }

  const { error } = await query;
  if (error) console.error('Supabase order delete error:', error);
}

export async function fetchCustomersFromSupabase(): Promise<Customer[] | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Supabase fetch customers error:', error);
    return null;
  }
  return data as Customer[];
}

export async function saveCustomerToSupabase(customer: Customer | Omit<Customer, 'id'>) {
  if (!isSupabaseConfigured()) return null;
  const payload: any = {
    name: customer.name,
    address: customer.address,
    phone: customer.phone || null,
  };

  if ('id' in customer && customer.id && !customer.id.startsWith('c_') && !customer.id.startsWith('c1') && !customer.id.startsWith('c2') && !customer.id.startsWith('c3')) {
    payload.id = customer.id;
  }

  const { data, error } = await supabase
    .from('customers')
    .upsert(payload)
    .select()
    .single();

  if (error) console.error('Supabase customer save error:', error);
  return data;
}

export async function deleteCustomerFromSupabase(id: string) {
  if (!isSupabaseConfigured() || id.startsWith('c_') || id.startsWith('c1') || id.startsWith('c2') || id.startsWith('c3')) return null;
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) console.error('Supabase customer delete error:', error);
}
