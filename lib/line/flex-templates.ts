import { RentalUnit, RentalBill, ParkingSlot, Product } from '@/lib/supabase';

const WEB_URL = 'https://store-house-amber.vercel.app';

/**
 * Standard Quick Reply items for elderly/family friendly chat navigation
 */
export const commonQuickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🛒 ขายของ',
        text: 'ขายของ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📦 เพิ่มของ',
        text: 'เพิ่มของ',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📊 สรุปยอดวันนี้',
        text: 'สรุปวันนี้',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🏠 ห้องพัก 11 หลัง',
        text: 'ห้องพัก',
      },
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🚗 ที่จอดรถ 8 คัน',
        text: 'ที่จอดรถ',
      },
    },
  ],
};

/**
 * 1. Overall Dashboard Card (Apple Design aesthetics)
 */
export function createDashboardFlex(data: {
  occupiedUnits: number;
  totalUnits: number;
  pendingUnits: number;
  occupiedParking: number;
  totalParking: number;
  todaySales: number;
  todayExpenses: number;
  todayRentIncome: number;
}) {
  return {
    type: 'flex',
    altText: '📊 ภาพรวมระบบ StoreHouse ประจำวันนี้',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#007AFF',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: 'STOREHOUSE DASHBOARD',
            color: '#FFFFFFCC',
            size: 'xs',
            weight: 'bold',
            letterSpacing: '1px',
          },
          {
            type: 'text',
            text: 'ภาพรวม 3 ธุรกิจครอบครัว',
            color: '#FFFFFF',
            size: 'xl',
            weight: 'bold',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'lg',
        paddingAll: '20px',
        backgroundColor: '#F8F9FA',
        contents: [
          // Rental Summary Section
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            cornerRadius: 'md',
            paddingAll: '15px',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '🏠 ห้องพัก & บ้านเช่า',
                    weight: 'bold',
                    size: 'sm',
                    color: '#1C1C1E',
                  },
                  {
                    type: 'text',
                    text: `${data.occupiedUnits}/${data.totalUnits} หลัง`,
                    align: 'end',
                    weight: 'bold',
                    size: 'sm',
                    color: '#007AFF',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'md',
                color: '#E5E5EA',
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  {
                    type: 'text',
                    text: 'สถานะการจ่ายเงิน:',
                    size: 'xs',
                    color: '#8E8E93',
                  },
                  {
                    type: 'text',
                    text: data.pendingUnits > 0 ? `ค้างชำระ ${data.pendingUnits} หลัง` : 'ชำระครบแล้ว 🎉',
                    size: 'xs',
                    align: 'end',
                    weight: 'bold',
                    color: data.pendingUnits > 0 ? '#FF9500' : '#34C759',
                  },
                ],
              },
            ],
          },

          // Parking Summary Section
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            cornerRadius: 'md',
            paddingAll: '15px',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '🚗 ที่จอดรถให้เช่า',
                    weight: 'bold',
                    size: 'sm',
                    color: '#1C1C1E',
                  },
                  {
                    type: 'text',
                    text: `${data.occupiedParking}/${data.totalParking} คัน`,
                    align: 'end',
                    weight: 'bold',
                    size: 'sm',
                    color: '#5856D6',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'md',
                color: '#E5E5EA',
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  {
                    type: 'text',
                    text: 'ช่องว่างคงเหลือ:',
                    size: 'xs',
                    color: '#8E8E93',
                  },
                  {
                    type: 'text',
                    text: `${data.totalParking - data.occupiedParking} ช่องว่าง`,
                    size: 'xs',
                    align: 'end',
                    weight: 'bold',
                    color: '#34C759',
                  },
                ],
              },
            ],
          },

          // Grocery Store Summary Section
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#FFFFFF',
            cornerRadius: 'md',
            paddingAll: '15px',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '🛒 ยอดขายโชห่วยวันนี้',
                    weight: 'bold',
                    size: 'sm',
                    color: '#1C1C1E',
                  },
                  {
                    type: 'text',
                    text: `฿${data.todaySales.toLocaleString()}`,
                    align: 'end',
                    weight: 'bold',
                    size: 'sm',
                    color: '#34C759',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'md',
                color: '#E5E5EA',
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  {
                    type: 'text',
                    text: 'รายจ่ายหน้าร้าน:',
                    size: 'xs',
                    color: '#8E8E93',
                  },
                  {
                    type: 'text',
                    text: `฿${data.todayExpenses.toLocaleString()}`,
                    size: 'xs',
                    align: 'end',
                    color: '#FF3B30',
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#007AFF',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🌐 เปิดดูระบบเต็มบนเว็บไซต์',
              uri: WEB_URL,
            },
          },
        ],
      },
    },
    quickReply: commonQuickReply,
  };
}

/**
 * 2. Rental Units Carousel (11 Units: 10 Rooms + 1 House)
 */
export function createRentalCarouselFlex(units: RentalUnit[]) {
  const bubbles = units.slice(0, 12).map((unit) => {
    const isOccupied = unit.payment_status !== 'Vacant';
    const isPaid = unit.payment_status === 'Paid';
    const isPending = unit.payment_status === 'Payment Pending' || (isOccupied && !isPaid);

    const statusBadgeColor = !isOccupied
      ? '#8E8E93' // Gray (Vacant)
      : isPaid
      ? '#34C759' // Green (Paid)
      : '#FF9500'; // Orange (Pending)

    const statusText = !isOccupied
      ? 'ห้องว่าง'
      : isPaid
      ? 'ชำระแล้ว'
      : 'รอชำระเงิน';

    return {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'horizontal',
        backgroundColor: unit.unit_type === 'house' ? '#5856D6' : '#007AFF',
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: unit.unit_number,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: statusBadgeColor,
            cornerRadius: 'sm',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: statusText,
                color: '#FFFFFF',
                size: 'xxs',
                weight: 'bold',
              },
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '15px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ผู้เช่า:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: unit.tenant_name || '-', size: 'xs', weight: 'bold', color: '#1C1C1E', flex: 4 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ค่าเช่า:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: `฿${unit.base_rent.toLocaleString()}`, size: 'xs', color: '#1C1C1E', flex: 4 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ค่าน้ำ (เหมา):', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: `฿${unit.water_fee}`, size: 'xs', color: '#1C1C1E', flex: 4 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'มิเตอร์ไฟล่าสุด:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: `${unit.last_meter_reading} หน่วย`, size: 'xs', color: '#007AFF', weight: 'bold', flex: 4 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '10px',
        contents: [
          isPending && isOccupied
            ? {
                type: 'button',
                style: 'primary',
                color: '#34C759',
                height: 'sm',
                action: {
                  type: 'postback',
                  label: '✅ ยืนยันรับเงิน',
                  data: `action=confirm_rental_payment&unit_id=${unit.id}&unit_number=${unit.unit_number}`,
                  displayText: `ยืนยันรับเงิน ${unit.unit_number}`,
                },
              }
            : null,
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '📝 จดมิเตอร์ไฟ',
              text: `จดไฟ ${unit.unit_number} `,
            },
          },
        ].filter(Boolean),
      },
    };
  });

  return {
    type: 'flex',
    altText: '🏠 รายชื่อห้องพักและบ้านเช่า 11 หลัง',
    contents: {
      type: 'carousel',
      contents: bubbles,
    },
    quickReply: commonQuickReply,
  };
}

/**
 * 3. Parking Slots Carousel (P1 - P8)
 */
export function createParkingCarouselFlex(slots: ParkingSlot[]) {
  const bubbles = slots.slice(0, 10).map((slot) => {
    const isOccupied = slot.payment_status !== 'Vacant';
    const isPaid = slot.payment_status === 'Paid';

    const statusBadgeColor = !isOccupied
      ? '#8E8E93'
      : isPaid
      ? '#34C759'
      : '#FF9500';

    const statusText = !isOccupied ? 'ช่องว่าง' : isPaid ? 'จ่ายแล้ว' : 'รอรับค่าจอด';

    return {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'horizontal',
        backgroundColor: '#5856D6',
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: `ช่อง ${slot.slot_number}`,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'md',
          },
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: statusBadgeColor,
            cornerRadius: 'sm',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: statusText,
                color: '#FFFFFF',
                size: 'xxs',
                weight: 'bold',
              },
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '15px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ทะเบียน:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: slot.vehicle_plate || 'ไม่มี', size: 'xs', weight: 'bold', color: '#1C1C1E', flex: 4 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'เจ้าของ:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: slot.owner_name || '-', size: 'xs', color: '#1C1C1E', flex: 4 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ค่าจอด/เดือน:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: `฿${(slot.monthly_fee || 1000).toLocaleString()}`, size: 'xs', color: '#1C1C1E', flex: 4 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '10px',
        contents: [
          isOccupied && !isPaid
            ? {
                type: 'button',
                style: 'primary',
                color: '#34C759',
                height: 'sm',
                action: {
                  type: 'postback',
                  label: '🚗 รับค่าจอด',
                  data: `action=confirm_parking_payment&slot_id=${slot.id}&slot_number=${slot.slot_number}`,
                  displayText: `รับค่าจอดช่อง ${slot.slot_number}`,
                },
              }
            : null,
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '✏️ บันทึกรถเข้าจอด',
              text: `จอดรถ ${slot.slot_number} [ทะเบียน] [ชื่อ]`,
            },
          },
        ].filter(Boolean),
      },
    };
  });

  return {
    type: 'flex',
    altText: '🚗 ตารางสถานะที่จอดรถ 8 ช่อง',
    contents: {
      type: 'carousel',
      contents: bubbles,
    },
    quickReply: commonQuickReply,
  };
}

/**
 * 4. Calculated Bill Card (Sent after recording meter reading)
 */
export function createBillReceiptFlex(bill: RentalBill, tenantName?: string) {
  return {
    type: 'flex',
    altText: `🧾 ใบแจ้งค่าเช่า ${bill.unit_number} เดือน ${bill.billing_month}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#007AFF',
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: 'ใบคำนวณบิลรายเดือน',
            color: '#FFFFFFCC',
            size: 'xs',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `${bill.unit_number} (เดือน ${bill.billing_month})`,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'xl',
            margin: 'xs',
          },
          tenantName
            ? {
                type: 'text',
                text: `ผู้เช่า: ${tenantName}`,
                color: '#FFFFFFE6',
                size: 'xs',
                margin: 'xs',
              }
            : null,
        ].filter(Boolean),
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '20px',
        backgroundColor: '#F8F9FA',
        contents: [
          // Meter details
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'เลขมิเตอร์ไฟเดิม:', size: 'xs', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `${bill.previous_meter} หน่วย`, size: 'xs', align: 'end', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'เลขมิเตอร์ไฟใหม่:', size: 'xs', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `${bill.current_meter} หน่วย`, size: 'xs', align: 'end', weight: 'bold', color: '#007AFF', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'หน่วยไฟที่ใช้:', size: 'xs', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `${bill.electricity_units} หน่วย`, size: 'xs', align: 'end', weight: 'bold', flex: 2 },
            ],
          },
          { type: 'separator', margin: 'md', color: '#E5E5EA' },

          // Cost Breakdown
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: '1. ค่าเช่าห้อง:', size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `฿${bill.rent_cost.toLocaleString()}`, size: 'sm', align: 'end', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: `2. ค่าไฟ (${bill.electricity_units} หน่วย x 8฿):`, size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `฿${bill.electricity_cost.toLocaleString()}`, size: 'sm', align: 'end', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '3. ค่าน้ำ (เหมาจ่าย):', size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `฿${bill.water_cost.toLocaleString()}`, size: 'sm', align: 'end', flex: 2 },
            ],
          },
          { type: 'separator', margin: 'md', color: '#E5E5EA' },

          // Total
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: 'ยอดรวมทั้งสิ้น:', size: 'md', weight: 'bold', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `฿${bill.total_amount.toLocaleString()}`, size: 'lg', weight: 'bold', align: 'end', color: '#007AFF', flex: 2 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#34C759',
            action: {
              type: 'postback',
              label: `✅ ยืนยันรับเงิน (฿${bill.total_amount.toLocaleString()})`,
              data: `action=confirm_bill_payment&bill_id=${bill.id}&unit_number=${bill.unit_number}`,
              displayText: `ยืนยันรับเงินบิล ${bill.unit_number}`,
            },
          },
        ],
      },
    },
    quickReply: commonQuickReply,
  };
}

/**
 * 5. Grocery & Daily Revenue Summary Card
 */
export function createDailySummaryFlex(data: {
  dateStr: string;
  posSales: number;
  posCost: number;
  posProfit: number;
  posBillsCount: number;
  expenses: number;
  rentalIncome: number;
  parkingIncome: number;
}) {
  const totalNet = data.posProfit - data.expenses + data.rentalIncome + data.parkingIncome;

  return {
    type: 'flex',
    altText: `📈 สรุปยอดธุรกิจประจำวันที่ ${data.dateStr}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#34C759',
        paddingAll: '18px',
        contents: [
          {
            type: 'text',
            text: 'DAILY BUSINESS REPORT',
            color: '#FFFFFFCC',
            size: 'xs',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `สรุปยอดวันที่ ${data.dateStr}`,
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        backgroundColor: '#FFFFFF',
        contents: [
          // POS Breakdown
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: `🛒 ยอดขายโชห่วย (${data.posBillsCount} บิล):`, size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `+฿${data.posSales.toLocaleString()}`, size: 'sm', weight: 'bold', align: 'end', color: '#34C759', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'กำไรขั้นต้นโชห่วย:', size: 'xs', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `฿${data.posProfit.toLocaleString()}`, size: 'xs', align: 'end', color: '#007AFF', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '💸 รายจ่ายหน้าร้าน:', size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `-฿${data.expenses.toLocaleString()}`, size: 'sm', align: 'end', color: '#FF3B30', flex: 2 },
            ],
          },
          { type: 'separator', margin: 'md', color: '#E5E5EA' },

          // Rentals Breakdown
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: '🏠 ค่าเช่าห้องพัก/บ้าน:', size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `+฿${data.rentalIncome.toLocaleString()}`, size: 'sm', weight: 'bold', align: 'end', color: '#34C759', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: '🚗 ค่าเช่าที่จอดรถ:', size: 'sm', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `+฿${data.parkingIncome.toLocaleString()}`, size: 'sm', weight: 'bold', align: 'end', color: '#34C759', flex: 2 },
            ],
          },
          { type: 'separator', margin: 'md', color: '#E5E5EA' },

          // Grand Total
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: '💰 กำไรสุทธิรวมวันนี้:', size: 'md', weight: 'bold', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `฿${totalNet.toLocaleString()}`, size: 'xl', weight: 'bold', align: 'end', color: '#34C759', flex: 2 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '15px',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📊 ดูรายงานการขายแบบละเอียดบนเว็บ',
              uri: `${WEB_URL}/th/sales`,
            },
          },
        ],
      },
    },
    quickReply: commonQuickReply,
  };
}

/**
 * 6. Product Catalog Carousel for Easy Selection & Selling
 */
export function createProductCatalogFlex(products: Product[]) {
  const bubbles = products.slice(0, 10).map((prod) => {
    const isOutOfStock = prod.stock_qty <= 0;
    const profit = Math.max(0, prod.selling_price - prod.cost_price);
    const headerBg = isOutOfStock ? '#64748B' : (prod.stock_qty <= 5 ? '#D97706' : '#16A34A');

    return {
      type: 'bubble',
      size: 'kilo',
      header: {
        type: 'box',
        layout: 'horizontal',
        backgroundColor: headerBg,
        paddingAll: '12px',
        contents: [
          {
            type: 'text',
            text: prod.name,
            color: '#FFFFFF',
            weight: 'bold',
            size: 'md',
            wrap: true,
            maxLines: 2,
            flex: 3,
          },
          {
            type: 'box',
            layout: 'horizontal',
            backgroundColor: '#FFFFFF',
            cornerRadius: 'sm',
            paddingStart: '6px',
            paddingEnd: '6px',
            paddingTop: '2px',
            paddingBottom: '2px',
            contents: [
              {
                type: 'text',
                text: isOutOfStock ? 'หมด' : `เหลือ ${prod.stock_qty}`,
                color: isOutOfStock ? '#EF4444' : '#16A34A',
                size: 'xxs',
                weight: 'bold',
              },
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '14px',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ราคาขาย:', size: 'xs', color: '#8E8E93', flex: 2, gravity: 'center' },
              { type: 'text', text: `฿${prod.selling_price.toLocaleString()}`, size: 'xl', weight: 'bold', color: '#16A34A', align: 'end', flex: 3 },
            ],
          },
          {
            type: 'separator',
            margin: 'sm',
            color: '#E5E5EA',
          },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'sm',
            contents: [
              { type: 'text', text: 'ทุนชิ้นละ:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: `฿${prod.cost_price.toLocaleString()}`, size: 'xs', color: '#1C1C1E', align: 'end', flex: 3 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'กำไร/ชิ้น:', size: 'xs', color: '#8E8E93', flex: 2 },
              { type: 'text', text: `+฿${profit.toLocaleString()}`, size: 'xs', color: '#007AFF', weight: 'bold', align: 'end', flex: 3 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '10px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: isOutOfStock ? '#64748B' : '#16A34A',
            height: 'sm',
            action: {
              type: 'postback',
              label: `⚡ ขาย ฿${prod.selling_price}`,
              data: `action=sell&id=${prod.id}&p=${prod.selling_price}`,
              displayText: `ขาย ${prod.name} ฿${prod.selling_price}`,
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '✏️ ระบุราคาเอง',
              text: `ขาย ${prod.name} `,
            },
          },
        ],
      },
    };
  });

  return {
    type: 'flex',
    altText: '🛒 รายการสินค้าในร้านโชห่วย (เลือกขายได้ทันที)',
    contents: {
      type: 'carousel',
      contents: bubbles,
    },
    quickReply: commonQuickReply,
  };
}

/**
 * Interactive Help Card for Adding / Restocking Products
 */
export function createProductHelpFlex() {
  return {
    type: 'flex',
    altText: '📦 วิธีเพิ่มของเข้าร้านโชห่วย',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16A34A',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'ระบบร้านค้าโชห่วย',
            color: '#FFFFFFCC',
            size: 'xs',
            weight: 'bold',
          },
          {
            type: 'text',
            text: '📦 วิธีเพิ่มสินค้า / เติมของ',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        backgroundColor: '#FFFFFF',
        contents: [
          {
            type: 'text',
            text: 'พิมพ์ 4 อย่างตามลำดับนี้ในแชตได้เลยครับ:',
            size: 'sm',
            weight: 'bold',
            color: '#1C1C1E',
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            backgroundColor: '#F0FDF4',
            cornerRadius: 'md',
            paddingAll: '12px',
            borderColor: '#BBF7D0',
            borderWidth: '1px',
            contents: [
              {
                type: 'text',
                text: 'เพิ่มของ [ชื่อสินค้า] [ทุน] [ราคาขาย] [จำนวน]',
                size: 'xs',
                weight: 'bold',
                color: '#15803D',
                wrap: true,
              },
            ],
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '💡 ตัวอย่างคำสั่งที่พิมพ์ส่งได้ทันที:',
                size: 'xs',
                weight: 'bold',
                color: '#8E8E93',
              },
              {
                type: 'box',
                layout: 'vertical',
                spacing: 'xs',
                backgroundColor: '#F8F9FA',
                cornerRadius: 'md',
                paddingAll: '10px',
                contents: [
                  {
                    type: 'text',
                    text: '• เพิ่มของ โค้ก 10 15 24',
                    size: 'xs',
                    weight: 'bold',
                    color: '#1C1C1E',
                  },
                  {
                    type: 'text',
                    text: '  (โค้ก ทุน 10.- / ขาย 15.- / มี 24 ชิ้น)',
                    size: 'xxs',
                    color: '#8E8E93',
                  },
                  {
                    type: 'text',
                    text: '• เพิ่มของ น้ำดื่ม 600 มล. 4.5 7 50',
                    size: 'xs',
                    weight: 'bold',
                    color: '#1C1C1E',
                    margin: 'xs',
                  },
                  {
                    type: 'text',
                    text: '  (น้ำดื่ม ทุน 4.5.- / ขาย 7.- / มี 50 ขวด)',
                    size: 'xxs',
                    color: '#8E8E93',
                  },
                  {
                    type: 'text',
                    text: '• เพิ่มของ ขนมปัง 15 20 10',
                    size: 'xs',
                    weight: 'bold',
                    color: '#1C1C1E',
                    margin: 'xs',
                  },
                  {
                    type: 'text',
                    text: '  (ขนมปัง ทุน 15.- / ขาย 20.- / มี 10 ห่อ)',
                    size: 'xxs',
                    color: '#8E8E93',
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#16A34A',
            height: 'sm',
            action: {
              type: 'message',
              label: '✏️ กดเพื่อเริ่มพิมพ์เพิ่มของ',
              text: 'เพิ่มของ ',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: '🛒 ดูสินค้าที่มีในร้าน',
              text: 'ขายของ',
            },
          },
        ],
      },
    },
    quickReply: commonQuickReply,
  };
}

/**
 * 7. Confirmation Card after adding/restocking a product
 */
export function createProductAddedFlex(prod: {
  name: string;
  cost_price: number;
  selling_price: number;
  stock_qty: number;
  added_qty: number;
}) {
  const profitPerItem = Math.max(0, prod.selling_price - prod.cost_price);
  const marginPercent = prod.selling_price > 0 ? Math.round((profitPerItem / prod.selling_price) * 100) : 0;

  return {
    type: 'flex',
    altText: `📦 บันทึกสินค้า ${prod.name} เรียบร้อยแล้ว`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#16a34a',
        paddingAll: '15px',
        contents: [
          {
            type: 'text',
            text: 'บันทึกสินค้าเข้าร้านสำเร็จ',
            color: '#FFFFFFCC',
            size: 'xs',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `📦 ${prod.name}`,
            color: '#FFFFFF',
            size: 'xl',
            weight: 'bold',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '20px',
        backgroundColor: '#F8F9FA',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ต้นทุนต่อชิ้น:', size: 'sm', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `฿${prod.cost_price.toLocaleString()}`, size: 'sm', weight: 'bold', align: 'end', color: '#1C1C1E', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'ราคาขายหน้าร้าน:', size: 'sm', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `฿${prod.selling_price.toLocaleString()}`, size: 'sm', weight: 'bold', align: 'end', color: '#16a34a', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'กำไรต่อชิ้น (Margin):', size: 'sm', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `+฿${profitPerItem.toLocaleString()} (${marginPercent}%)`, size: 'sm', weight: 'bold', align: 'end', color: '#007AFF', flex: 2 },
            ],
          },
          { type: 'separator', margin: 'md', color: '#E5E5EA' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: 'จำนวนที่เพิ่มรอบนี้:', size: 'sm', color: '#8E8E93', flex: 3 },
              { type: 'text', text: `+${prod.added_qty} ชิ้น`, size: 'sm', weight: 'bold', align: 'end', color: '#1C1C1E', flex: 2 },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              { type: 'text', text: 'สต็อกคงเหลือรวมทั้งหมด:', size: 'md', weight: 'bold', color: '#1C1C1E', flex: 3 },
              { type: 'text', text: `${prod.stock_qty} ชิ้น`, size: 'lg', weight: 'bold', align: 'end', color: '#007AFF', flex: 2 },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'message',
              label: `🛒 ขาย ${prod.name}`,
              text: `ขาย ${prod.name} `,
            },
          },
        ],
      },
    },
    quickReply: commonQuickReply,
  };
}
