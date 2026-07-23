# AGENTS.md — H&J Kitchen POS (v2: React + Tailwind + Framer Motion + Supabase)

This file is written for an AI coding agent that has **Supabase MCP** access
and is picking up this project fresh. It replaces the old single-file HTML
prototype with a real, persisted, multi-device POS system.

---

## 0. How the agent should work through this file — READ FIRST

This is a multi-step build. **Do not run all steps silently in one go.**
Work through the phases in §2 in order, and **stop and ask the user for
confirmation before starting each phase**, especially anything that:

- creates or alters Supabase tables, storage buckets, or RLS policies
  (these are structural/destructive-adjacent and hard to undo cleanly)
- uploads the logo to Supabase Storage (ask where/how they want it organized
  if unclear)
- adds authentication (this changes how every other user of the app logs in)
- deploys or connects the project to a hosting provider

Concretely: after reading this file, tell the user which phase you're about
to do and what it involves, then wait for a go-ahead. Do not silently chain
"create tables" → "seed data" → "add auth" → "deploy" without checking in
between. If something in Supabase already exists (a table, a bucket) from a
previous session, tell the user what you found before deciding whether to
reuse, alter, or recreate it — don't assume.

Within a phase, small reversible steps (writing component code, styling,
wiring up already-approved tables) don't need step-by-step confirmation —
use judgment. The checkpoints are for structural/backend decisions, not for
every file you touch.

---

## 1. What this project is

A **Point-of-Sale / Billing system** for **H&J Kitchen**, a Sri Lankan
rice-and-curry restaurant. Staff can:

- Browse the menu by category, search
- Build an order for a table, adjust quantities, remove items
- Add new menu items on the fly (persisted, not just in-session)
- Preview an editable invoice (full item CRUD before printing — add/edit/
  delete lines, adjust discount/tax, set customer name) styled after the
  client's own green invoice template
- Print that invoice
- Edit business details (address, phone, website, bank info, invoice note,
  logo) from a Settings screen — no code changes needed to update these
- Have all of the above **persist** across sessions and be usable from
  multiple devices at once (kitchen tablet, counter tablet, etc.)

This replaces an earlier single-file HTML/React-via-CDN prototype. The
visual design (colors, layout, invoice template) is already finalized and
should be **carried over exactly** — see §4.

---

## 2. Build phases (work through in order, confirm before each)

### Phase A — Project scaffold
Set up a proper React project (Vite + React, TypeScript optional but
recommended), Tailwind CSS, and Framer Motion. Bring over the design tokens
from §4 as Tailwind theme extensions (`tailwind.config`) rather than raw CSS
variables. **Ask the user** whether they want TypeScript before scaffolding.

### Phase B — Supabase backend
**Ask the user to confirm the schema in §5 before creating anything.** Then,
using Supabase MCP:
1. Create the tables in §5.1 with the RLS policies in §5.2.
2. Create a `public-assets` (or similarly named) Storage bucket for the
   logo and any menu item photos, with a policy allowing public read.
3. Seed `business_settings` with one row (defaults in §5.3) and
   `menu_items` with the starting menu (§6).
Confirm with the user before seeding — they may want different starting
values than the placeholders below.

### Phase C — Logo upload
Upload the provided H&J Kitchen logo (PNG) to the Storage bucket from Phase
B, and store its public URL in `business_settings.logo_url`. Ask the user
if they want it under a specific path/folder convention.

### Phase D — Core screens
Build the menu grid, order rail, and invoice preview modal as React
components, matching the design in §4 and §7. Wire them to Supabase (read
menu, write orders, read/write business_settings) using React Query or
Supabase's client directly with local state for optimistic UI.

### Phase E — Auth (optional, ask first)
Only do this if the user asks for it. A single shared staff PIN/password is
probably enough for a small restaurant — don't over-engineer multi-role
auth unless requested.

### Phase F — Deployment
Ask the user where they want to host this (Vercel, Netlify, etc.) before
setting anything up.

---

## 3. Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18+ via Vite |
| Styling | Tailwind CSS (utility classes; theme tokens from §4 added to `tailwind.config`) |
| Motion | Framer Motion (`motion.div`, `AnimatePresence`) replacing the old hand-written CSS `@keyframes` |
| Backend | Supabase (Postgres + Storage + optional Auth), accessed via `@supabase/supabase-js` |
| Data fetching | React Query (or Supabase client + hooks) for caching/sync across devices |
| Icons | `lucide-react` (swap in for the old hand-drawn inline SVGs — same visual language, less code to maintain) |
| Fonts | Google Fonts: `Poppins` (headings/prices) + `Inter` (body/UI) — unchanged from v1 |

No code duplication: one source of truth for the Supabase client, one for
each data hook (`useMenu`, `useOrder`, `useBusinessSettings`), one set of
Tailwind theme tokens that every component reads from.

---

## 4. Design system (carry over exactly — do not redesign)

### 4.1 App color palette (dark POS dashboard)

| Token | Hex | Usage |
|---|---|---|
| `bg-app` | `#0F1116` | Outermost page background |
| `bg-sidebar` | `#1B1C24` | Left navigation rail |
| `bg-panel` | `#16171F` | Right order rail, header bar |
| `bg-card` | `#1F2029` | Menu item cards, modals |
| `bg-card-hover` | `#262733` | Card hover state |
| `border-subtle` | `#2A2B36` | Hairline dividers, card borders |
| `accent-red` | `#F0544F` | Primary brand accent — buttons, active tab, prices |
| `accent-red-dark` | `#D2413C` | Hover/active state of the accent |
| `text-primary` | `#FFFFFF` | Headings, item names |
| `text-secondary` | `#8B8D98` | Meta text, labels, placeholders |
| `success` | `#3BC17A` | "Added" confirmation, in-stock badge |

### 4.2 Invoice color palette (separate from the app theme — matches the
client's own green invoice template)

| Token | Hex | Usage |
|---|---|---|
| `inv-outer` | `#565B08` | Outer card background, footer band |
| `inv-band-start` / `inv-band-end` | `#9CA23C` → `#7C8420` | Header ribbon gradient |
| `inv-table-head` | `#767B4E` | Table header row |
| `inv-row-alt` | `#F2F4E1` | Alternating row tint |
| `inv-total-bg` | `#4B5510` | Grand Total highlight box |
| `inv-text` / `inv-text-soft` | `#2B2E12` / `#6B6F4A` | Primary / secondary invoice text |

### 4.3 Typography
- **Display/headings** → `Poppins` (600/700)
- **Body/UI** → `Inter` (400/500/600)
- Scale: 12px meta / 14px body / 16px item name / 20px section title / 26px totals

### 4.4 Layout
Three-column dashboard: fixed icon-only sidebar (≈88px) → main column
(header + category tabs + responsive menu grid) → sticky order rail
(scrollable items, pinned totals + print button footer).

### 4.5 Motion (Framer Motion equivalents of the old CSS keyframes)
| Interaction | Motion approach |
|---|---|
| Page load | Stagger children fade/slide in (`staggerChildren` on a parent `motion.div`) |
| Card hover | `whileHover={{ y: -3, scale: 1.02 }}` + image `whileHover={{ scale: 1.08 }}` |
| Add to order | Brief `animate` pulse on the card; `AnimatePresence` for the toast sliding in from top-right; new order line animates in with layout animation |
| Quantity change | Quick scale bounce on the number (`animate={{ scale: [1, 1.3, 1] }}`) |
| Category tab switch | Animated underline/pill using a shared layoutId |
| Modals (add item, settings, invoice preview) | `AnimatePresence` + backdrop fade + panel scale-in |
| Respect reduced motion | Use Framer Motion's `useReducedMotion()` hook to shorten/skip animations |

### 4.6 Invoice preview + item CRUD (behavior, not just visuals)
The "Preview & Print Bill" flow opens an editable invoice — not a direct
print. Before printing, staff can edit each line's description/qty/price,
delete lines, add ad-hoc rows, adjust discount % and tax %, and set a
customer name. What's shown in the preview is exactly what prints. This
behavior must be preserved in the rebuild.

---

## 5. Supabase schema

**Confirm this schema with the user before creating it.**

### 5.1 Tables

```sql
-- One row: the restaurant's own info, shown on every invoice
create table business_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'H&J Kitchen',
  address text default '',
  phone text default '',
  website text default '',
  bank_name text default '',
  bank_account text default '',
  invoice_note text default 'Thank you for your order!',
  logo_url text,
  updated_at timestamptz not null default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  table_label text not null default 'Table 1',
  customer_name text default '',
  status text not null default 'open', -- open | printed | closed
  discount_pct numeric(5,2) not null default 0,
  tax_pct numeric(5,2) not null default 0,
  receipt_no serial,
  created_at timestamptz not null default now(),
  printed_at timestamptz
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name text not null,       -- snapshotted at add-time, editable per-invoice
  qty numeric(10,2) not null default 1,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
```

### 5.2 Row Level Security

Enable RLS on all four tables. Minimum viable policy for a single-location
restaurant with no public-facing access:

```sql
alter table business_settings enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- If auth is added later (Phase E), replace "true" with an authenticated-role check.
create policy "staff full access" on business_settings for all using (true) with check (true);
create policy "staff full access" on menu_items for all using (true) with check (true);
create policy "staff full access" on orders for all using (true) with check (true);
create policy "staff full access" on order_items for all using (true) with check (true);
```

**Ask the user before applying `using (true)` broadly** — flag that this
means anyone with the anon key can read/write everything, and that Phase E
(auth) is how to lock it down properly if this app will ever be exposed
outside a private/trusted network.

### 5.3 `business_settings` seed defaults

```json
{
  "name": "H&J Kitchen",
  "address": "No. 45, Galle Road, Colombo 03",
  "phone": "+94 77 123 4567",
  "website": "www.hjkitchen.lk",
  "bank_name": "",
  "bank_account": "",
  "invoice_note": "Thank you for your order! For enquiries, please contact us on the number above."
}
```
Confirm these placeholder values with the user — replace with the real
business details before going live.

### 5.4 Storage

One public-read bucket (suggest `public-assets`) for:
- `logo/h-and-j-kitchen-logo.png` — the provided logo
- `menu/<slug>.jpg` — menu item photos, if/when real photography replaces
  the placeholder images

---

## 6. Starting menu data (seed into `menu_items`)

| Item | Category | Price (Rs.) |
|---|---|---|
| Rice & Curry with Chicken (Regular) | Rice & Curry | 350 |
| Rice & Curry with Chicken (Large) | Rice & Curry | 380 |
| Rice & Curry with Fish | Rice & Curry | 400 |
| Rice & Curry with Vegetables | Rice & Curry | 340 |
| Rice & Curry with Pork | Rice & Curry | 650 |
| Chicken / Fish Special Menu | Specials | 500 |
| Yellow Rice — Special Menu | Yellow Rice | 550 |
| Yellow Rice — Normal Menu | Yellow Rice | 500 |
| Fried Rice | Fried Rice | 580 |
| Vegetable Rice | Fried Rice | 450 |

> The client's original list had two "Rice & Curry with Chicken" entries at
> different prices — kept as **Regular**/**Large** since a menu can't have
> two identical names at two prices. Confirm with the user if the actual
> distinction is different.

Menu photos: until real photography is provided, placeholder images
(tag-based, e.g. from a free food-photo API) are acceptable — flag clearly
in the UI or commit message that these are placeholders, and store the
real URL once available.

---

## 7. Reference: original single-file prototype

A previous version of this app exists as a single self-contained
`index.html` (React via CDN + Babel Standalone, no backend, in-memory
state only). It's a useful **visual and behavioral reference** — the menu
grid, order rail, invoice preview, and settings modal all work exactly as
described in §4, just without persistence. Use it to cross-check the
rebuild's look and behavior, not as source code to copy wholesale (its
architecture — CDN React, no build step — is intentionally being replaced).

---

## 8. Non-goals for this rebuild (unless the user asks)

- Multi-location support
- Multiple staff roles/permissions
- Payment processing integration
- Offline-first support
- Thermal/ESC-POS printer integration (browser print dialog is enough for now)

Keep the scope to what's in §2's phases unless the user explicitly asks for
one of these.
