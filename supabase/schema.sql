-- H&J Kitchen POS Database Schema & Seed Data

-- 1. Business Settings Table
create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'H&J Kitchen',
  address text default 'No. 45, Galle Road, Colombo 03',
  phone text default '+94 77 123 4567',
  website text default 'www.hjkitchen.lk',
  bank_name text default 'Commercial Bank',
  bank_account text default '8001234567',
  invoice_note text default 'Thank you for your order! For enquiries, please contact us on the number above.',
  logo_url text,
  updated_at timestamptz not null default now()
);

-- 2. Menu Items Table
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_label text not null default 'Table 1',
  customer_name text default '',
  customer_address text default '',
  status text not null default 'open', -- open | printed | closed
  discount_pct numeric(5,2) not null default 0,
  tax_pct numeric(5,2) not null default 0,
  receipt_no serial,
  created_at timestamptz not null default now(),
  printed_at timestamptz
);

-- 4. Order Items Table
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name text not null,
  qty numeric(10,2) not null default 1,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table business_settings enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Open Access policies for staff POS usage
create policy "staff full access" on business_settings for all using (true) with check (true);
create policy "staff full access" on menu_items for all using (true) with check (true);
create policy "staff full access" on orders for all using (true) with check (true);
create policy "staff full access" on order_items for all using (true) with check (true);

-- Seed Business Settings
insert into business_settings (id, name, address, phone, website, bank_name, bank_account, invoice_note)
values (
  '00000000-0000-0000-0000-000000000001',
  'H&J Kitchen',
  'No. 45, Galle Road, Colombo 03',
  '+94 77 123 4567',
  'www.hjkitchen.lk',
  'Commercial Bank',
  '8001234567',
  'Thank you for your order! For enquiries, please contact us on the number above.'
) on conflict (id) do nothing;

-- Seed Menu Items
insert into menu_items (name, category, price, image_url) values
  ('Rice & Curry with Chicken (Regular)', 'Rice & Curry', 350.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'),
  ('Rice & Curry with Chicken (Large)', 'Rice & Curry', 380.00, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'),
  ('Rice & Curry with Fish', 'Rice & Curry', 400.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80'),
  ('Rice & Curry with Vegetables', 'Rice & Curry', 340.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80'),
  ('Rice & Curry with Pork', 'Rice & Curry', 650.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80'),
  ('Chicken / Fish Special Menu', 'Specials', 500.00, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80'),
  ('Yellow Rice — Special Menu', 'Yellow Rice', 550.00, 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80'),
  ('Yellow Rice — Normal Menu', 'Yellow Rice', 500.00, 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80'),
  ('Fried Rice', 'Fried Rice', 580.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80'),
  ('Vegetable Rice', 'Fried Rice', 450.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80')
on conflict do nothing;
