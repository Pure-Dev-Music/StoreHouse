-- ===================================================
-- StoreHouse - Database Schema V2
-- รันใน Supabase SQL Editor
-- ===================================================

-- 1. ตาราง products (สินค้า)
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

-- 2. ตาราง sales (รายการขายสินค้า)
create table if not exists sales (
  id uuid default gen_random_uuid() primary key,
  total_amount numeric not null default 0,
  total_cost numeric not null default 0,
  total_profit numeric not null default 0,
  created_at timestamptz default now() not null
);

-- 3. ตาราง sale_items (รายละเอียดสินค้าในแต่ละยอดขาย)
create table if not exists sale_items (
  id uuid default gen_random_uuid() primary key,
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  unit_cost numeric not null default 0
);

-- 4. ตาราง rooms (ห้องเช่า 10 ห้อง)
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  room_number text not null unique,
  tenant_name text,
  phone text,
  base_rent numeric not null default 0,
  utility_fee numeric not null default 200, -- ค่าส่วนกลาง/น้ำไฟเหมาจ่าย 200 บาท
  payment_status text check (payment_status in ('Occupied', 'Vacant', 'Payment Pending', 'Paid')) default 'Vacant' not null,
  due_date date,
  created_at timestamptz default now() not null
);

-- 5. ตาราง parking_slots (ที่จอดรถ 8 ช่อง)
create table if not exists parking_slots (
  id uuid default gen_random_uuid() primary key,
  slot_number text not null unique,
  vehicle_plate text,
  owner_name text,
  payment_status text check (payment_status in ('Occupied', 'Vacant', 'Payment Pending', 'Paid')) default 'Vacant' not null,
  due_date date,
  created_at timestamptz default now() not null
);

-- ===================================================
-- ฟังก์ชันสำหรับประมวลผลการขายและลดสต๊อกสินค้า (RPC)
-- ===================================================
create or replace function process_sale(
  p_total_amount numeric,
  p_total_cost numeric,
  p_total_profit numeric,
  p_items jsonb -- อาร์เรย์ของ {product_id, quantity, unit_price, unit_cost}
) returns uuid language plpgsql as $$
declare
  v_sale_id uuid;
  v_item jsonb;
  v_prod_id uuid;
begin
  -- 1. บันทึกยอดขายรวม
  insert into sales (total_amount, total_cost, total_profit)
  values (p_total_amount, p_total_cost, p_total_profit)
  returning id into v_sale_id;

  -- 2. บันทึกรายละเอียดสินค้าและตัดสต๊อก
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_prod_id := (v_item->>'product_id')::uuid;

    insert into sale_items (sale_id, product_id, quantity, unit_price, unit_cost)
    values (
      v_sale_id,
      v_prod_id,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_price')::numeric,
      (v_item->>'unit_cost')::numeric
    );

    -- ลดสต๊อกเฉพาะเมื่อสินค้ามีอยู่ในตาราง products
    if v_prod_id is not null then
      update products
      set stock_qty = greatest(0, stock_qty - (v_item->>'quantity')::numeric)
      where id = v_prod_id;
    end if;
  end loop;

  return v_sale_id;
end;
$$;

-- ===================================================
-- เปิดใช้งาน Row Level Security (RLS)
-- ===================================================
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table rooms enable row level security;
alter table parking_slots enable row level security;

-- Drop existing policies if they exist to avoid duplication errors
drop policy if exists "Allow all" on products;
drop policy if exists "Allow all" on sales;
drop policy if exists "Allow all" on sale_items;
drop policy if exists "Allow all" on rooms;
drop policy if exists "Allow all" on parking_slots;

-- สร้างนโยบาย Allow all สำหรับแอปพลิเคชันภายในบ้าน
create policy "Allow all" on products for all using (true) with check (true);
create policy "Allow all" on sales for all using (true) with check (true);
create policy "Allow all" on sale_items for all using (true) with check (true);
create policy "Allow all" on rooms for all using (true) with check (true);
create policy "Allow all" on parking_slots for all using (true) with check (true);

-- ===================================================
-- ข้อมูลจำลองและตั้งต้น (Seed Data)
-- ===================================================

-- ข้อมูลห้องเช่า 10 ห้อง (ห้อง 101 - 110)
insert into rooms (room_number, base_rent, utility_fee, payment_status) values
  ('101', 3000, 200, 'Vacant'),
  ('102', 3000, 200, 'Vacant'),
  ('103', 3000, 200, 'Vacant'),
  ('104', 3000, 200, 'Vacant'),
  ('105', 3000, 200, 'Vacant'),
  ('106', 3000, 200, 'Vacant'),
  ('107', 3000, 200, 'Vacant'),
  ('108', 3000, 200, 'Vacant'),
  ('109', 3000, 200, 'Vacant'),
  ('110', 3000, 200, 'Vacant')
on conflict (room_number) do nothing;

-- ข้อมูลที่จอดรถ 8 ช่อง (P1 - P8)
insert into parking_slots (slot_number, payment_status) values
  ('P1', 'Vacant'),
  ('P2', 'Vacant'),
  ('P3', 'Vacant'),
  ('P4', 'Vacant'),
  ('P5', 'Vacant'),
  ('P6', 'Vacant'),
  ('P7', 'Vacant'),
  ('P8', 'Vacant')
on conflict (slot_number) do nothing;

-- ข้อมูลสินค้าตัวอย่าง
insert into products (barcode, name, cost_price, selling_price, stock_qty, expiry_date) values
  ('8850029010123', 'น้ำดื่ม 600 มล.', 4.5, 7, 50, null),
  ('8851012345678', 'บะหมี่กึ่งสำเร็จรูป รสต้มยำกุ้ง', 5, 8, 30, current_date + interval '5 days'),
  ('8852034567890', 'นมสดรสจืด 200 มล.', 10, 13, 20, current_date + interval '3 days'),
  ('8853045678901', 'ขนมปังแผ่น', 15, 20, 10, current_date + interval '6 days'),
  ('8854056789012', 'ไข่ไก่ แพ็ค 10 ฟอง', 35, 45, 15, current_date + interval '12 days'),
  ('8855067890123', 'น้ำตาลทราย 1 กก.', 22, 28, 25, null)
on conflict (barcode) do nothing;
