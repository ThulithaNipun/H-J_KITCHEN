export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
};

export type OrderItem = {
  id: string;
  order_id?: string;
  menu_item_id?: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
  created_at?: string;
};

export type Order = {
  id: string;
  table_label: string;
  customer_name?: string;
  customer_address?: string;
  status: 'open' | 'printed' | 'closed';
  discount_pct: number;
  tax_pct: number;
  receipt_no?: number;
  created_at: string;
  printed_at?: string;
  items: OrderItem[];
};

export type BusinessSettings = {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  bank_name: string;
  bank_account: string;
  bank_account_name?: string;
  invoice_note: string;
  logo_url?: string;
  updated_at?: string;
};

export type Customer = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  created_at?: string;
};
