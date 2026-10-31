Act as a Full-Stack Software Engineer. Help me build a web application for a family-owned business management system using React (Vite / Next.js) and Supabase as the database backend.

### Project Context & Purpose:
The system is for a household managing 3 small business streams:
1. Grocery & Retail Shop (Run by mother): Needs a POS-like interface with barcode scanner support, cost-profit tracking, stock management, and expiry date alerts.
2. Room Rental (10 rooms): Track tenants, monthly rent + fixed utilities ($200 flat rate for water/electricity), payment status, and receipts.
3. Parking Space Rental (8 slots): Track vehicle plate numbers, tenant info, slot status (Occupied/Vacant), and monthly fee collection.

### Key Requirements & Features:

1. Retail & POS Module:
- Barcode Scanner Integration: Auto-focus search input that listens for barcode scanner inputs (USB scanner acts as keyboard input ending with 'Enter').
- Quick Action Buttons: Customizable buttons for non-barcoded items (e.g., homemade food, utensils).
- Inventory & Expiry Tracking: Store item name, barcode, cost price, selling price, stock quantity, and expiration date.
- Expiry Alert System: Visual indicators/notifications for products expiring within 7 days.
- Profit & Loss Calculation: Real-time calculation of daily sales, total cost, net profit, and profit margin.
- Simple Checkout UI: Large, easy-to-read text showing Total Price, Cash Received, and Change Due (specifically optimized for elderly ease of use).

2. Room Rental Module (10 Rooms):
- Dashboard showing 10 room cards with status (Occupied, Vacant, Payment Pending, Paid).
- Auto-generate monthly invoice: Base Rent + Flat Utility Fee (200 THB).
- Payment history and unpaid balance tracker.

3. Parking Space Module (8 Slots):
- Visual grid layout representing 8 parking slots.
- Display vehicle license plate, owner name, and monthly payment status for each slot.

### Supabase Database Schema Guidelines:
Please design the PostgreSQL schema with tables:
- `products` (id, barcode, name, cost_price, selling_price, stock_qty, expiry_date, created_at)
- `sales` (id, total_amount, total_cost, total_profit, created_at)
- `sale_items` (id, sale_id, product_id, quantity, unit_price, unit_cost)
- `rooms` (id, room_number, tenant_name, phone, base_rent, utility_fee, payment_status, due_date)
- `parking_slots` (id, slot_number, vehicle_plate, owner_name, payment_status, due_date)

### Tech Stack & Design:
- Framework: React (TypeScript preferred) + Tailwind CSS + Lucide Icons
- Database: Supabase (Provide Database Migration SQL script)
- UI/UX: High contrast, large typography, touch/keyboard friendly for POS checkout.

Please provide:
1. Complete Supabase SQL Migration Script (including RLS policies if needed).
2. The core React components structure.
3. A dedicated React hook/component for Barcode Scanner input handling.
4. The main POS Checkout interface component.