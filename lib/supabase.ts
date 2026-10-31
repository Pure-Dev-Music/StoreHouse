import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase credentials missing. Check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Item = {
  id: string;
  name: string;
  barcode?: string;
  current_stock: number;
  unit: string;
  category?: string;
  low_stock_threshold?: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  item_id: string;
  item_name: string;
  type: 'receive' | 'withdraw';
  quantity: number;
  notes?: string;
  line_user_id?: string;
  line_display_name?: string;
  line_picture_url?: string;
  created_at: string;
};

export type Product = {
  id: string;
  barcode: string | null;
  name: string;
  cost_price: number;
  selling_price: number;
  stock_qty: number;
  expiry_date: string | null;
  created_at: string;
};

export type Sale = {
  id: string;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  created_at: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
};

export type Room = {
  id: string;
  room_number: string;
  tenant_name: string | null;
  phone: string | null;
  base_rent: number;
  utility_fee: number;
  payment_status: 'Occupied' | 'Vacant' | 'Payment Pending' | 'Paid';
  due_date: string | null;
  created_at: string;
};

export type ParkingSlot = {
  id: string;
  slot_number: string;
  vehicle_plate: string | null;
  owner_name: string | null;
  phone?: string | null;
  monthly_fee?: number;
  payment_status: 'Occupied' | 'Vacant' | 'Payment Pending' | 'Paid';
  due_date: string | null;
  created_at: string;
};

export type RentalUnit = {
  id: string;
  unit_number: string;
  unit_type: 'room' | 'house';
  tenant_name: string | null;
  phone: string | null;
  base_rent: number;
  water_fee: number;
  electricity_rate: number;
  last_meter_reading: number;
  payment_status: 'Occupied' | 'Vacant' | 'Payment Pending' | 'Paid';
  due_date: string | null;
  created_at: string;
};

export type RentalBill = {
  id: string;
  unit_id: string;
  unit_number: string;
  billing_month: string;
  previous_meter: number;
  current_meter: number;
  electricity_units: number;
  electricity_cost: number;
  water_cost: number;
  rent_cost: number;
  total_amount: number;
  payment_status: 'Pending' | 'Paid';
  paid_at: string | null;
  recorded_by: string | null;
  created_at: string;
};

export type StoreExpense = {
  id: string;
  title: string;
  amount: number;
  recorded_by: string | null;
  created_at: string;
};

