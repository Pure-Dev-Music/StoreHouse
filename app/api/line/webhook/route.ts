import { NextRequest, NextResponse } from 'next/server';
import { verifyLineSignature, isLineAdmin, replyLineMessage } from '@/lib/line/client';
import {
  createDashboardFlex,
  createRentalCarouselFlex,
  createParkingCarouselFlex,
  createBillReceiptFlex,
  createDailySummaryFlex,
  createProductCatalogFlex,
  createProductAddedFlex,
  commonQuickReply,
} from '@/lib/line/flex-templates';
import { supabase, RentalUnit, ParkingSlot, RentalBill, Product } from '@/lib/supabase';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'StoreHouse LINE Webhook is running 🚀',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');

    // 1. Verify signature if LINE_CHANNEL_SECRET is provided
    if (process.env.LINE_CHANNEL_SECRET) {
      const isValid = verifyLineSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[LINE Webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];

    for (const event of events) {
      const replyToken = event.replyToken;
      const userId = event.source?.userId;

      // Handle Postback events (Button clicks on Flex Cards)
      if (event.type === 'postback' && replyToken) {
        await handlePostbackEvent(event, replyToken, userId);
        continue;
      }

      // Handle Text Message events
      if (event.type === 'message' && event.message?.type === 'text' && replyToken) {
        const text = (event.message.text || '').trim();

        // 2. Whitelist Access Control
        if (!isLineAdmin(userId)) {
          await replyLineMessage(replyToken, [
            {
              type: 'text',
              text: 'สวัสดีครับ 😊 ระบบ StoreHouse ขณะนี้เปิดใช้งานสำหรับแอดมินครอบครัวเท่านั้น หากต้องการสอบถามห้องพักหรือที่จอดรถ กรุณาติดต่อโทร 081-xxx-xxxx ครับ',
            },
          ]);
          continue;
        }

        // 3. Command Dispatcher
        await handleTextCommand(text, replyToken, userId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[LINE Webhook Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Handle incoming text commands
 */
async function handleTextCommand(text: string, replyToken: string, userId?: string) {
  const lower = text.toLowerCase();

  // A. Check Rental Units (11 Units: 10 Rooms + 1 House)
  if (['ห้องพัก', 'บ้านเช่า', 'เช็คห้อง', 'ห้อง', 'สรุปห้อง'].some((k) => lower === k)) {
    const { data: units } = await supabase
      .from('rental_units')
      .select('*')
      .order('unit_number');

    if (units && units.length > 0) {
      await replyLineMessage(replyToken, [createRentalCarouselFlex(units as RentalUnit[])]);
      return;
    }
  }

  // B. Record Electricity Meter: 'จดไฟ [ห้อง/บ้าน] [เลขมิเตอร์]' or 'จดมิเตอร์ [ห้อง/บ้าน] [เลขมิเตอร์]'
  const meterMatch = text.match(/^(?:จดไฟ|จดมิเตอร์)\s*([^\s]+)\s*(\d+(?:\.\d+)?)/i);
  if (meterMatch) {
    const unitInput = meterMatch[1].trim();
    const newMeter = parseFloat(meterMatch[2]);

    // Find unit
    const { data: units } = await supabase
      .from('rental_units')
      .select('*');

    const unit = units?.find(
      (u: RentalUnit) =>
        u.unit_number.toLowerCase() === unitInput.toLowerCase() ||
        u.unit_number.replace(/\s+/g, '') === unitInput.replace(/\s+/g, '')
    );

    if (!unit) {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `❌ ไม่พบห้องหรือบ้านเช่าหมายเลข '${unitInput}' กรุณาตรวจสอบเลขห้อง (เช่น 101-110 หรือ บ้านเช่า 1)`,
          quickReply: commonQuickReply,
        },
      ]);
      return;
    }

    const prevMeter = unit.last_meter_reading || 0;
    const unitsUsed = Math.max(0, newMeter - prevMeter);
    const elecRate = unit.electricity_rate || 8;
    const elecCost = unitsUsed * elecRate;
    const waterCost = unit.water_fee || 150;
    const rentCost = unit.base_rent || 3000;
    const totalAmount = rentCost + elecCost + waterCost;
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Create or update monthly bill
    const { data: bill, error: billErr } = await supabase
      .from('rental_bills')
      .insert({
        unit_id: unit.id,
        unit_number: unit.unit_number,
        billing_month: currentMonth,
        previous_meter: prevMeter,
        current_meter: newMeter,
        electricity_units: unitsUsed,
        electricity_cost: elecCost,
        water_cost: waterCost,
        rent_cost: rentCost,
        total_amount: totalAmount,
        payment_status: 'Pending',
        recorded_by: userId || 'LINE Chat',
      })
      .select()
      .single();

    // Update last meter reading on rental unit
    await supabase
      .from('rental_units')
      .update({
        last_meter_reading: newMeter,
        payment_status: 'Payment Pending',
      })
      .eq('id', unit.id);

    if (bill) {
      await replyLineMessage(replyToken, [
        createBillReceiptFlex(bill as RentalBill, unit.tenant_name || undefined),
      ]);
    } else {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `✅ บันทึกมิเตอร์ไฟ ${unit.unit_number} (${newMeter} หน่วย) เรียบร้อยแล้ว (ยอดรวม ฿${totalAmount.toLocaleString()})`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  // C. Check Parking Slots (P1 - P8)
  if (['ที่จอดรถ', 'จอดรถ', 'เช็คที่จอด', 'ลานจอดรถ'].some((k) => lower === k)) {
    const { data: slots } = await supabase
      .from('parking_slots')
      .select('*')
      .order('slot_number');

    if (slots && slots.length > 0) {
      await replyLineMessage(replyToken, [createParkingCarouselFlex(slots as ParkingSlot[])]);
      return;
    }
  }

  // D. Assign Parking Slot: 'จอดรถ [ช่อง P1-P8] [ทะเบียน] [ชื่อผู้เช่า]'
  const parkAssignMatch = text.match(/^จอดรถ\s+(p\d+)\s+([^\s]+)(?:\s+(.+))?/i);
  if (parkAssignMatch) {
    const slotInput = parkAssignMatch[1].toUpperCase();
    const plate = parkAssignMatch[2].trim();
    const owner = (parkAssignMatch[3] || '').trim();

    const { data: updated, error } = await supabase
      .from('parking_slots')
      .update({
        vehicle_plate: plate,
        owner_name: owner || 'ผู้เช่า',
        payment_status: 'Occupied',
      })
      .eq('slot_number', slotInput)
      .select()
      .single();

    if (updated) {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `✅ บันทึกรถเข้าจอดช่อง ${slotInput}\n🚗 ทะเบียน: ${plate}\n👤 ผู้เช่า: ${owner || '-'}\nสถานะ: เช่าอยู่ (รอรับค่าจอด)`,
          quickReply: commonQuickReply,
        },
      ]);
    } else {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `❌ ไม่สามารถอัปเดตช่องจอด ${slotInput} ได้ กรุณาตรวจสอบหมายเลขช่อง (P1 - P8)`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  // E1. Add/Restock Product: 'เพิ่มของ [ชื่อ] [ทุน] [ราคาขาย] [จำนวน]'
  const addProdMatch = text.match(/^(?:เพิ่มของ|เพิ่มสินค้า)\s+([^\s]+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);
  if (addProdMatch) {
    const prodName = addProdMatch[1].trim();
    const costPrice = parseFloat(addProdMatch[2]);
    const sellPrice = parseFloat(addProdMatch[3]);
    const addQty = parseFloat(addProdMatch[4]);

    // Check if product already exists
    const { data: existing } = await supabase
      .from('products')
      .select('*')
      .ilike('name', prodName)
      .limit(1);

    let savedProd: any = null;

    if (existing && existing.length > 0) {
      const p = existing[0];
      const newQty = (p.stock_qty || 0) + addQty;
      const { data } = await supabase
        .from('products')
        .update({
          cost_price: costPrice,
          selling_price: sellPrice,
          stock_qty: newQty,
        })
        .eq('id', p.id)
        .select()
        .single();
      savedProd = data;
    } else {
      const { data } = await supabase
        .from('products')
        .insert({
          name: prodName,
          cost_price: costPrice,
          selling_price: sellPrice,
          stock_qty: addQty,
        })
        .select()
        .single();
      savedProd = data;
    }

    if (savedProd) {
      await replyLineMessage(replyToken, [
        createProductAddedFlex({
          name: savedProd.name,
          cost_price: savedProd.cost_price,
          selling_price: savedProd.selling_price,
          stock_qty: savedProd.stock_qty,
          added_qty: addQty,
        }),
      ]);
    } else {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `❌ ไม่สามารถบันทึกสินค้า ${prodName} ได้ กรุณาลองใหม่อีกครั้ง`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  // E2. Help for Add Product: 'วิธีเพิ่มของ' or 'เพิ่มของ'
  if (['วิธีเพิ่มของ', 'เพิ่มของ', 'เพิ่มสินค้า'].some((k) => lower === k)) {
    await replyLineMessage(replyToken, [
      {
        type: 'text',
        text: `📦 วิธีเพิ่มของเข้าร้านโชห่วย:\n\nพิมพ์: เพิ่มของ [ชื่อสินค้า] [ต้นทุน] [ราคาขาย] [จำนวน]\n\nตัวอย่างเช่น:\n• เพิ่มของ โค้ก 10 15 24\n(โค้ก ทุน 10 บาท, ขาย 15 บาท, มี 24 ชิ้น)\n\n• เพิ่มของ น้ำดื่ม 4.5 7 50\n(น้ำดื่ม ทุน 4.5 บาท, ขาย 7 บาท, มี 50 ขวด)`,
        quickReply: commonQuickReply,
      },
    ]);
    return;
  }

  // E3. Select Product to Sell: 'ขาย', 'ขายของ', 'เลือกของ', 'สินค้า'
  if (['ขาย', 'ขายของ', 'เลือกของ', 'สินค้า', 'แคตตาล็อก'].some((k) => lower === k)) {
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (prods && prods.length > 0) {
      await replyLineMessage(replyToken, [createProductCatalogFlex(prods as Product[])]);
      return;
    } else {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: '🛒 ยังไม่มีรายการสินค้าในร้าน กรุณาพิมพ์เพิ่มสินค้าก่อน เช่น:\nเพิ่มของ โค้ก 10 15 24',
          quickReply: commonQuickReply,
        },
      ]);
      return;
    }
  }

  // E4. Record Sale with Custom Price: 'ขาย [ชื่อสินค้า/หมวด] [ราคา]'
  const saleMatch = text.match(/^ขาย\s+([^\s]+)\s*(\d+(?:\.\d+)?)/i);
  if (saleMatch) {
    const itemName = saleMatch[1].trim();
    const price = parseFloat(saleMatch[2]);

    // Check if item exists in products catalog to link and deduct stock
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .ilike('name', `%${itemName}%`)
      .limit(1);

    const matchedProd = prods?.[0];
    const unitCost = matchedProd ? matchedProd.cost_price : 0;
    const profit = Math.max(0, price - unitCost);

    // Insert into sales table
    const { data: sale } = await supabase
      .from('sales')
      .insert({
        total_amount: price,
        total_cost: unitCost,
        total_profit: profit,
      })
      .select()
      .single();

    if (sale) {
      await supabase.from('sale_items').insert({
        sale_id: sale.id,
        product_id: matchedProd ? matchedProd.id : null,
        quantity: 1,
        unit_price: price,
        unit_cost: unitCost,
      });

      // Deduct stock if matched
      let remainingStockStr = '';
      if (matchedProd && matchedProd.stock_qty > 0) {
        const remaining = Math.max(0, matchedProd.stock_qty - 1);
        await supabase
          .from('products')
          .update({ stock_qty: remaining })
          .eq('id', matchedProd.id);
        remainingStockStr = ` (สต็อกคงเหลือ ${remaining} ชิ้น)`;
      }

      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `🛒 บันทึกยอดขายสำเร็จ!\nสินค้า: ${matchedProd ? matchedProd.name : itemName}\nราคาขาย: ฿${price.toLocaleString()} (กำไร +฿${profit.toLocaleString()})${remainingStockStr}\nซิงค์กับระบบ POS หน้าร้านเรียบร้อยแล้ว ✅`,
          quickReply: commonQuickReply,
        },
      ]);
      return;
    }
  }

  // F. Record Quick Store Expense: 'จ่าย [รายการ] [ราคา]'
  const expenseMatch = text.match(/^จ่าย\s+([^\s]+)\s*(\d+(?:\.\d+)?)/i);
  if (expenseMatch) {
    const expenseTitle = expenseMatch[1].trim();
    const amount = parseFloat(expenseMatch[2]);

    await supabase.from('store_expenses').insert({
      title: expenseTitle,
      amount,
      recorded_by: userId || 'LINE Chat',
    });

    await replyLineMessage(replyToken, [
      {
        type: 'text',
        text: `💸 บันทึกรายจ่ายหน้าร้านเรียบร้อย!\nรายการ: ${expenseTitle}\nจำนวนเงิน: ฿${amount.toLocaleString()} บาท`,
        quickReply: commonQuickReply,
      },
    ]);
    return;
  }

  // G. Check Inventory: 'เช็คสต็อก [ชื่อสินค้า]' or 'สต็อก [ชื่อสินค้า]'
  const stockMatch = text.match(/^(?:เช็คสต็อก|สต็อก)\s*([^\s]+)?/i);
  if (stockMatch) {
    const keyword = stockMatch[1] ? stockMatch[1].trim() : '';
    let query = supabase.from('products').select('*');
    if (keyword) {
      query = query.ilike('name', `%${keyword}%`);
    }
    const { data: prods } = await query.order('name').limit(10);

    if (prods && prods.length > 0) {
      const itemsList = prods
        .map((p: any) => `• ${p.name}: คงเหลือ ${p.stock_qty} (ขาย ฿${p.selling_price})`)
        .join('\n');
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `📦 รายการสินค้าคงคลัง:\n\n${itemsList}`,
          quickReply: commonQuickReply,
        },
      ]);
    } else {
      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `❌ ไม่พบสินค้าที่ชื่อ '${keyword}' ในคลัง`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  // H. Daily Consolidated Summary: 'สรุปวันนี้' or 'ยอดขาย' or 'สรุปยอด'
  if (['สรุปวันนี้', 'ยอดขาย', 'สรุปยอด', 'รายงาน'].some((k) => lower === k)) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const startOfDay = `${today}T00:00:00.000Z`;
    const endOfDay = `${today}T23:59:59.999Z`;

    // POS sales today
    const { data: salesToday } = await supabase
      .from('sales')
      .select('total_amount, total_cost, total_profit')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    const posSales = salesToday?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
    const posCost = salesToday?.reduce((acc, s) => acc + Number(s.total_cost), 0) || 0;
    const posProfit = salesToday?.reduce((acc, s) => acc + Number(s.total_profit), 0) || 0;
    const posBillsCount = salesToday?.length || 0;

    // Expenses today
    const { data: expToday } = await supabase
      .from('store_expenses')
      .select('amount')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);
    const expenses = expToday?.reduce((acc, e) => acc + Number(e.amount), 0) || 0;

    // Rental bills paid today
    const { data: rentPaid } = await supabase
      .from('rental_bills')
      .select('total_amount')
      .eq('payment_status', 'Paid')
      .gte('paid_at', startOfDay)
      .lte('paid_at', endOfDay);
    const rentalIncome = rentPaid?.reduce((acc, r) => acc + Number(r.total_amount), 0) || 0;

    await replyLineMessage(replyToken, [
      createDailySummaryFlex({
        dateStr: format(new Date(), 'd MMMM yyyy', { locale: th }),
        posSales,
        posCost,
        posProfit,
        posBillsCount,
        expenses,
        rentalIncome,
        parkingIncome: 0,
      }),
    ]);
    return;
  }

  // Default / Overview Fallback: Show Main Dashboard Card
  const { data: units } = await supabase.from('rental_units').select('payment_status');
  const { data: slots } = await supabase.from('parking_slots').select('payment_status');
  const { data: sales } = await supabase
    .from('sales')
    .select('total_amount')
    .gte('created_at', `${format(new Date(), 'yyyy-MM-dd')}T00:00:00.000Z`);

  const totalUnits = units?.length || 11;
  const occupiedUnits = units?.filter((u) => u.payment_status !== 'Vacant').length || 0;
  const pendingUnits = units?.filter((u) => u.payment_status === 'Payment Pending').length || 0;

  const totalParking = slots?.length || 8;
  const occupiedParking = slots?.filter((s) => s.payment_status !== 'Vacant').length || 0;

  const todaySales = sales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

  await replyLineMessage(replyToken, [
    createDashboardFlex({
      occupiedUnits,
      totalUnits,
      pendingUnits,
      occupiedParking,
      totalParking,
      todaySales,
      todayExpenses: 0,
      todayRentIncome: 0,
    }),
  ]);
}

/**
 * Handle Postback events (Button clicks on cards)
 */
async function handlePostbackEvent(event: any, replyToken: string, userId?: string) {
  const data = event.postback?.data || '';
  const params = new URLSearchParams(data);
  const action = params.get('action');

  if (action === 'confirm_rental_payment') {
    const unitId = params.get('unit_id');
    const unitNumber = params.get('unit_number');

    if (unitId) {
      await supabase
        .from('rental_units')
        .update({ payment_status: 'Paid' })
        .eq('id', unitId);

      await supabase
        .from('rental_bills')
        .update({ payment_status: 'Paid', paid_at: new Date().toISOString() })
        .eq('unit_id', unitId)
        .eq('payment_status', 'Pending');

      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `🎉 ยืนยันรับเงินค่าเช่า ${unitNumber || ''} เรียบร้อยแล้ว!\nระบบบนหน้าเว็บอัปเดตเป็น 'ชำระแล้ว' ทันทีครับ`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  if (action === 'confirm_bill_payment') {
    const billId = params.get('bill_id');
    const unitNumber = params.get('unit_number');

    if (billId) {
      const { data: bill } = await supabase
        .from('rental_bills')
        .update({ payment_status: 'Paid', paid_at: new Date().toISOString() })
        .eq('id', billId)
        .select()
        .single();

      if (bill) {
        await supabase
          .from('rental_units')
          .update({ payment_status: 'Paid' })
          .eq('id', bill.unit_id);
      }

      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `🎉 ยืนยันรับเงินบิล ${unitNumber || ''} เรียบร้อยแล้ว!\nยอดเงินบันทึกเข้าสู่ระบบเรียบร้อยครับ`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  if (action === 'confirm_parking_payment') {
    const slotId = params.get('slot_id');
    const slotNumber = params.get('slot_number');

    if (slotId) {
      await supabase
        .from('parking_slots')
        .update({ payment_status: 'Paid' })
        .eq('id', slotId);

      await replyLineMessage(replyToken, [
        {
          type: 'text',
          text: `🎉 รับค่าจอดช่อง ${slotNumber || ''} เรียบร้อยแล้ว!\nระบบบนหน้าเว็บอัปเดตเป็น 'จ่ายแล้ว' ทันทีครับ`,
          quickReply: commonQuickReply,
        },
      ]);
    }
    return;
  }

  if (action === 'quick_sell_product') {
    const prodId = params.get('product_id');
    const price = parseFloat(params.get('price') || '0');
    const prodName = decodeURIComponent(params.get('name') || 'สินค้า');

    let costPrice = 0;
    let remainingStock = 0;
    let actualName = prodName;

    if (prodId) {
      const { data: prod } = await supabase
        .from('products')
        .select('*')
        .eq('id', prodId)
        .single();

      if (prod) {
        actualName = prod.name;
        costPrice = prod.cost_price || 0;
        remainingStock = Math.max(0, (prod.stock_qty || 0) - 1);

        await supabase
          .from('products')
          .update({ stock_qty: remainingStock })
          .eq('id', prod.id);
      }
    }

    const profit = Math.max(0, price - costPrice);

    const { data: sale } = await supabase
      .from('sales')
      .insert({
        total_amount: price,
        total_cost: costPrice,
        total_profit: profit,
      })
      .select()
      .single();

    if (sale) {
      await supabase.from('sale_items').insert({
        sale_id: sale.id,
        product_id: prodId || null,
        quantity: 1,
        unit_price: price,
        unit_cost: costPrice,
      });
    }

    await replyLineMessage(replyToken, [
      {
        type: 'text',
        text: `⚡ ขายตามป้ายสำเร็จ!\n\n📦 สินค้า: ${actualName}\n💵 ราคาขาย: ฿${price.toLocaleString()} บาท\n📈 กำไร: +฿${profit.toLocaleString()} บาท\n📊 สต็อกคงเหลือ: ${remainingStock} ชิ้น\n\nระบบบันทึกยอดขายและซิงค์ POS หน้าร้านเรียบร้อยแล้ว ✅`,
        quickReply: commonQuickReply,
      },
    ]);
    return;
  }
}
