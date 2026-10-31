-- ===================================================
-- StoreHouse - Database Schema V3 (LINE OA Integration)
-- รันใน Supabase SQL Editor
-- ===================================================

-- 1. ตาราง rental_units (ทรัพย์สินให้เช่า 11 ยูนิต: ห้องพัก 10 ห้อง + บ้านเช่า 1 หลัง)
create table if not exists rental_units (
  id uuid default gen_random_uuid() primary key,
  unit_number text not null unique,               -- เช่น '101' - '110', 'บ้านเช่า 1'
  unit_type text check (unit_type in ('room', 'house')) not null default 'room',
  tenant_name text,
  phone text,
  base_rent numeric not null default 3000,        -- ค่าเช่าห้อง 3,000 / บ้านเช่า 8,000
  water_fee numeric not null default 150,         -- ค่าน้ำเหมาจ่ายรายเดือน (ห้อง 150, บ้าน 300)
  electricity_rate numeric not null default 8,    -- ค่าไฟ 8 บาท/หน่วย
  last_meter_reading numeric not null default 0,  -- เลขมิเตอร์ไฟล่าสุด
  payment_status text check (payment_status in ('Occupied', 'Vacant', 'Payment Pending', 'Paid')) default 'Vacant' not null,
  due_date date,
  created_at timestamptz default now() not null
);

-- 2. ตาราง rental_bills (ประวัติบิลรายเดือนและการจดมิเตอร์)
create table if not exists rental_bills (
  id uuid default gen_random_uuid() primary key,
  unit_id uuid references rental_units(id) on delete cascade not null,
  unit_number text not null,
  billing_month text not null,                    -- เช่น '2026-11'
  previous_meter numeric not null default 0,      -- มิเตอร์เดิม
  current_meter numeric not null default 0,       -- มิเตอร์ใหม่ที่จด
  electricity_units numeric not null default 0,   -- หน่วยไฟที่ใช้ = current - previous
  electricity_cost numeric not null default 0,    -- ค่าไฟ = units * rate
  water_cost numeric not null default 0,          -- ค่าน้ำเหมาจ่าย
  rent_cost numeric not null default 0,           -- ค่าเช่าพื้นฐาน
  total_amount numeric not null default 0,        -- ยอดรวมทั้งหมด
  payment_status text check (payment_status in ('Pending', 'Paid')) default 'Pending' not null,
  paid_at timestamptz,
  recorded_by text,                               -- ชื่อหรือ LINE user id ผู้บันทึก
  created_at timestamptz default now() not null
);

-- 3. ตาราง parking_slots (ที่จอดรถ 8 ช่อง)
create table if not exists parking_slots (
  id uuid default gen_random_uuid() primary key,
  slot_number text not null unique,               -- P1 - P8
  vehicle_plate text,
  owner_name text,
  phone text,
  monthly_fee numeric not null default 1000,
  payment_status text check (payment_status in ('Occupied', 'Vacant', 'Payment Pending', 'Paid')) default 'Vacant' not null,
  due_date date,
  created_at timestamptz default now() not null
);

-- 4. ตาราง store_expenses (บันทึกรายจ่ายหน้าร้านโชห่วยจากคำสั่ง 'จ่าย ...')
create table if not exists store_expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  amount numeric not null default 0,
  recorded_by text,
  created_at timestamptz default now() not null
);

-- 5. ตาราง products, sales, sale_items (คงตารางเดิมไว้สำหรับ POS)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  barcode text unique,
  name text not null,
  cost_price numeric not null default 0,
  selling_price numeric not null default 0,
  stock_qty numeric not null default 0,
  expiry_date date,
  created_at timestamptz default now() not null
);

create table if not exists sales (
  id uuid default gen_random_uuid() primary key,
  total_amount numeric not null default 0,
  total_cost numeric not null default 0,
  total_profit numeric not null default 0,
  created_at timestamptz default now() not null
);

create table if not exists sale_items (
  id uuid default gen_random_uuid() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  unit_cost numeric not null default 0
);

-- ===================================================
-- เปิดใช้งาน Row Level Security (RLS)
-- ===================================================
alter table rental_units enable row level security;
alter table rental_bills enable row level security;
alter table parking_slots enable row level security;
alter table store_expenses enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;

-- Drop policies if exist
drop policy if exists "Allow all" on rental_units;
drop policy if exists "Allow all" on rental_bills;
drop policy if exists "Allow all" on parking_slots;
drop policy if exists "Allow all" on store_expenses;
drop policy if exists "Allow all" on products;
drop policy if exists "Allow all" on sales;
drop policy if exists "Allow all" on sale_items;

create policy "Allow all" on rental_units for all using (true) with check (true);
create policy "Allow all" on rental_bills for all using (true) with check (true);
create policy "Allow all" on parking_slots for all using (true) with check (true);
create policy "Allow all" on store_expenses for all using (true) with check (true);
create policy "Allow all" on products for all using (true) with check (true);
create policy "Allow all" on sales for all using (true) with check (true);
create policy "Allow all" on sale_items for all using (true) with check (true);

-- ===================================================
-- Seed Data (11 ยูนิต, 8 ที่จอดรถ)
-- ===================================================

-- ห้องพัก 10 ห้อง (101 - 110)
insert into rental_units (unit_number, unit_type, base_rent, water_fee, electricity_rate, payment_status) values
  ('101', 'room', 3000, 150, 8, 'Vacant'),
  ('102', 'room', 3000, 150, 8, 'Vacant'),
  ('103', 'room', 3000, 150, 8, 'Vacant'),
  ('104', 'room', 3000, 150, 8, 'Vacant'),
  ('105', 'room', 3000, 150, 8, 'Vacant'),
  ('106', 'room', 3000, 150, 8, 'Vacant'),
  ('107', 'room', 3000, 150, 8, 'Vacant'),
  ('108', 'room', 3000, 150, 8, 'Vacant'),
  ('109', 'room', 3000, 150, 8, 'Vacant'),
  ('110', 'room', 3000, 150, 8, 'Vacant')
on conflict (unit_number) do nothing;

-- บ้านเช่า 1 หลัง ('บ้านเช่า 1')
insert into rental_units (unit_number, unit_type, base_rent, water_fee, electricity_rate, payment_status) values
  ('บ้านเช่า 1', 'house', 8000, 300, 8, 'Vacant')
on conflict (unit_number) do nothing;

-- ที่จอดรถ 8 ช่อง (P1 - P8)
insert into parking_slots (slot_number, monthly_fee, payment_status) values
  ('P1', 1000, 'Vacant'),
  ('P2', 1000, 'Vacant'),
  ('P3', 1000, 'Vacant'),
  ('P4', 1000, 'Vacant'),
  ('P5', 1000, 'Vacant'),
  ('P6', 1000, 'Vacant'),
  ('P7', 1000, 'Vacant'),
  ('P8', 1000, 'Vacant')
on conflict (slot_number) do nothing;
