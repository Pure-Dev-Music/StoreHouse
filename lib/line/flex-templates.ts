import { RentalUnit, RentalBill, ParkingSlot } from '@/lib/supabase';

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
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🛒 สรุปยอดโชห่วย',
        text: 'สรุปวันนี้',
      },
    },
    {
      type: 'action',
      action: {
        type: 'uri',
        label: '💻 เปิดเว็บ',
        uri: WEB_URL,
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
