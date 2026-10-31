"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CircularProgress, IconButton,
  Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, MenuItem, Grid, Divider, Snackbar, Alert, Tabs, Tab
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import EditIcon from "@mui/icons-material/Edit";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import DatabaseIcon from "@mui/icons-material/Storage";
import { useRouter } from "@/i18n/routing";
import { supabase, RentalUnit, RentalBill } from "@/lib/supabase";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function RoomsPage() {
  const router = useRouter();
  const [units, setUnits] = useState<RentalUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [tabFilter, setTabFilter] = useState<'all' | 'room' | 'house'>('all');

  // Add / Edit Unit State
  const [editingUnit, setEditingUnit] = useState<RentalUnit | null>(null);
  const [unitNumber, setUnitNumber] = useState("");
  const [unitType, setUnitType] = useState<'room' | 'house'>('room');
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [baseRent, setBaseRent] = useState("3000");
  const [waterFee, setWaterFee] = useState("150");
  const [electricityRate, setElectricityRate] = useState("8");
  const [paymentStatus, setPaymentStatus] = useState<'Occupied' | 'Vacant' | 'Payment Pending' | 'Paid'>('Vacant');
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Meter Recording Modal State
  const [meterUnit, setMeterUnit] = useState<RentalUnit | null>(null);
  const [newMeterReading, setNewMeterReading] = useState("");
  const [meterSaving, setMeterSaving] = useState(false);

  // Receipt / Bill Modal State
  const [receiptBill, setReceiptBill] = useState<{
    unit: RentalUnit;
    bill?: RentalBill | null;
  } | null>(null);

  // Notification Toast
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    setDbError(null);
    try {
      // First attempt querying rental_units (Schema V3)
      const { data: rentalData, error: rentalError } = await supabase
        .from("rental_units")
        .select("*")
        .order("unit_number");

      if (!rentalError && rentalData) {
        setUnits(rentalData as RentalUnit[]);
      } else {
        // Fallback to rooms table (Schema V2)
        const { data: roomsData, error: roomsError } = await supabase
          .from("rooms")
          .select("*")
          .order("room_number");

        if (roomsError) {
          setDbError(rentalError?.message || roomsError.message);
        } else {
          // Adapt rooms data to RentalUnit shape
          const adapted: RentalUnit[] = (roomsData || []).map((r: any) => ({
            id: r.id,
            unit_number: r.room_number,
            unit_type: 'room',
            tenant_name: r.tenant_name,
            phone: r.phone,
            base_rent: r.base_rent,
            water_fee: r.utility_fee || 150,
            electricity_rate: 8,
            last_meter_reading: 0,
            payment_status: r.payment_status,
            due_date: r.due_date,
            created_at: r.created_at,
          }));
          setUnits(adapted);
        }
      }
    } catch (err: any) {
      setDbError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUnit({
      id: "",
      unit_number: "",
      unit_type: "room",
      tenant_name: null,
      phone: null,
      base_rent: 3000,
      water_fee: 150,
      electricity_rate: 8,
      last_meter_reading: 0,
      payment_status: "Vacant",
      due_date: null,
      created_at: "",
    });
    setUnitNumber("");
    setUnitType("room");
    setTenantName("");
    setPhone("");
    setBaseRent("3000");
    setWaterFee("150");
    setElectricityRate("8");
    setPaymentStatus("Vacant");
    setDueDate("");
  };

  const handleOpenEdit = (unit: RentalUnit) => {
    setEditingUnit(unit);
    setUnitNumber(unit.unit_number);
    setUnitType(unit.unit_type || "room");
    setTenantName(unit.tenant_name || "");
    setPhone(unit.phone || "");
    setBaseRent((unit.base_rent || 3000).toString());
    setWaterFee((unit.water_fee || 150).toString());
    setElectricityRate((unit.electricity_rate || 8).toString());
    setPaymentStatus(unit.payment_status);
    setDueDate(unit.due_date || "");
  };

  const handleSaveUnit = async () => {
    if (!editingUnit) return;
    if (!unitNumber.trim()) {
      setSnack({ open: true, msg: "กรุณาระบุหมายเลขห้องหรือชื่อยูนิต", severity: "error" });
      return;
    }

    setSaving(true);
    const payload = {
      unit_number: unitNumber.trim(),
      unit_type: unitType,
      tenant_name: tenantName.trim() || null,
      phone: phone.trim() || null,
      base_rent: parseFloat(baseRent) || 0,
      water_fee: parseFloat(waterFee) || 0,
      electricity_rate: parseFloat(electricityRate) || 8,
      payment_status: paymentStatus,
      due_date: dueDate || null,
    };

    let error;
    if (editingUnit.id) {
      const { error: err } = await supabase
        .from("rental_units")
        .update(payload)
        .eq("id", editingUnit.id);
      error = err;
    } else {
      const { error: err } = await supabase.from("rental_units").insert(payload);
      error = err;
    }

    if (error) {
      setSnack({ open: true, msg: "บันทึกผิดพลาด: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: "บันทึกข้อมูลยูนิตสำเร็จ", severity: "success" });
      setEditingUnit(null);
      loadUnits();
    }
    setSaving(false);
  };

  // Record Meter Reading
  const handleSaveMeter = async () => {
    if (!meterUnit || !newMeterReading.trim()) return;
    const currentMeter = parseFloat(newMeterReading);
    if (isNaN(currentMeter) || currentMeter < 0) {
      setSnack({ open: true, msg: "กรุณาระบุเลขมิเตอร์ให้ถูกต้อง", severity: "error" });
      return;
    }

    setMeterSaving(true);
    const prevMeter = meterUnit.last_meter_reading || 0;
    const unitsUsed = Math.max(0, currentMeter - prevMeter);
    const elecCost = unitsUsed * (meterUnit.electricity_rate || 8);
    const waterCost = meterUnit.water_fee || 150;
    const rentCost = meterUnit.base_rent || 3000;
    const totalAmount = rentCost + elecCost + waterCost;
    const currentMonth = format(new Date(), "yyyy-MM");

    // Insert into rental_bills
    const { data: bill, error: billErr } = await supabase
      .from("rental_bills")
      .insert({
        unit_id: meterUnit.id,
        unit_number: meterUnit.unit_number,
        billing_month: currentMonth,
        previous_meter: prevMeter,
        current_meter: currentMeter,
        electricity_units: unitsUsed,
        electricity_cost: elecCost,
        water_cost: waterCost,
        rent_cost: rentCost,
        total_amount: totalAmount,
        payment_status: "Pending",
        recorded_by: "Web Admin",
      })
      .select()
      .single();

    // Update rental_unit last reading and status
    await supabase
      .from("rental_units")
      .update({
        last_meter_reading: currentMeter,
        payment_status: "Payment Pending",
      })
      .eq("id", meterUnit.id);

    setMeterSaving(false);
    setMeterUnit(null);
    setNewMeterReading("");
    setSnack({ open: true, msg: `จดมิเตอร์ ${meterUnit.unit_number} เรียบร้อย (รวม ฿${totalAmount.toLocaleString()})`, severity: "success" });
    loadUnits();

    // Open receipt modal automatically
    if (bill) {
      setReceiptBill({ unit: meterUnit, bill: bill as RentalBill });
    }
  };

  // Confirm Payment
  const handleConfirmPayment = async (unit: RentalUnit) => {
    const { error } = await supabase
      .from("rental_units")
      .update({ payment_status: "Paid" })
      .eq("id", unit.id);

    await supabase
      .from("rental_bills")
      .update({ payment_status: "Paid", paid_at: new Date().toISOString() })
      .eq("unit_id", unit.id)
      .eq("payment_status", "Pending");

    if (error) {
      setSnack({ open: true, msg: "อัปเดตผิดพลาด: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: `ยืนยันรับเงิน ${unit.unit_number} เรียบร้อยแล้ว 🎉`, severity: "success" });
      loadUnits();
    }
  };

  const getStatusBadge = (status: RentalUnit["payment_status"]) => {
    switch (status) {
      case "Paid":
        return { bg: "#34C759", color: "#FFFFFF", label: "ชำระแล้ว" };
      case "Payment Pending":
        return { bg: "#FF9500", color: "#FFFFFF", label: "รอชำระเงิน" };
      case "Occupied":
        return { bg: "#007AFF", color: "#FFFFFF", label: "มีผู้เช่า" };
      case "Vacant":
      default:
        return { bg: "#8E8E93", color: "#FFFFFF", label: "ห้องว่าง" };
    }
  };

  // Filtered units
  const filteredUnits = units.filter((u) => {
    if (tabFilter === "room") return u.unit_type === "room";
    if (tabFilter === "house") return u.unit_type === "house";
    return true;
  });

  const totalCount = units.length;
  const occupiedCount = units.filter((u) => u.payment_status !== "Vacant").length;
  const paidCount = units.filter((u) => u.payment_status === "Paid").length;
  const pendingCount = units.filter((u) => u.payment_status === "Payment Pending").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F2F2F7", pb: 6 }}>
      {/* Apple-inspired Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #007AFF 0%, #5856D6 100%)",
          color: "white",
          px: { xs: 2.5, md: 4 },
          pt: 4,
          pb: 3,
          borderRadius: "0 0 32px 32px",
          boxShadow: "0 8px 24px rgba(0,122,255,0.2)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
          <IconButton
            onClick={() => router.push("/")}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}>
              🏠 จัดการห้องพัก & บ้านเช่า (11 ยูนิต)
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem" }}>
              ห้องพัก 10 ห้อง + บ้านเช่า 1 หลัง | เชื่อมต่อข้อมูล Real-time กับ LINE OA
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
              color: "white",
              fontWeight: 700,
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.35)" },
              px: 2.5,
              py: 1,
            }}
          >
            เพิ่มยูนิตใหม่
          </Button>
        </Box>

        {/* Status Chips */}
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Chip
            label={`ทั้งหมด ${totalCount} หลัง`}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
          />
          <Chip
            label={`มีผู้เช่าแล้ว: ${occupiedCount} หลัง`}
            sx={{ bgcolor: "rgba(52,199,89,0.3)", color: "white", fontWeight: 700 }}
          />
          <Chip
            label={`ชำระแล้ว: ${paidCount} หลัง`}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
          />
          {pendingCount > 0 && (
            <Chip
              label={`รอชำระ: ${pendingCount} หลัง`}
              sx={{ bgcolor: "#FF9500", color: "white", fontWeight: 800 }}
            />
          )}
        </Box>
      </Box>

      {/* Main Container */}
      <Box sx={{ px: { xs: 2.5, md: 4 }, mt: 3 }}>
        {/* Filter Tabs */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
          <Tabs
            value={tabFilter}
            onChange={(_, val) => setTabFilter(val)}
            sx={{
              bgcolor: "white",
              borderRadius: "20px",
              p: 0.5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              "& .MuiTabs-indicator": {
                bgcolor: "#007AFF",
                height: "100%",
                borderRadius: "16px",
                zIndex: 0,
              },
              "& .MuiTab-root": {
                zIndex: 1,
                minHeight: 40,
                borderRadius: "16px",
                fontWeight: 700,
                color: "#8E8E93",
                "&.Mui-selected": { color: "white" },
              },
            }}
          >
            <Tab value="all" label={`ทั้งหมด (${units.length})`} />
            <Tab value="room" label={`ห้องพัก 10 ห้อง`} />
            <Tab value="house" label={`บ้านเช่า 1 หลัง`} />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress sx={{ color: "#007AFF" }} />
          </Box>
        ) : dbError ? (
          <Card sx={{ p: 4, borderRadius: "24px", border: "2px solid #FF3B30", bgcolor: "#FFF5F5" }}>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <DatabaseIcon style={{ color: "#FF3B30", fontSize: "2rem" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#D70015" }}>
                ระบบกำลังเชื่อมต่อตารางข้อมูล Supabase
              </Typography>
            </Box>
            <Typography sx={{ color: "#660000", mb: 2 }}>
              กรุณานำคำสั่งในไฟล์ <strong>`database_line_v3.sql`</strong> ไปรันใน Supabase SQL Editor เพื่อสร้างตาราง <strong>rental_units</strong> และ <strong>rental_bills</strong> ให้สมบูรณ์ครับ
            </Typography>
            <Button variant="contained" onClick={loadUnits} sx={{ bgcolor: "#007AFF", borderRadius: "12px" }}>
              ลองโหลดข้อมูลใหม่อีกครั้ง
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {filteredUnits.map((unit) => {
              const badge = getStatusBadge(unit.payment_status);
              const isOccupied = unit.payment_status !== "Vacant";
              const isPending = unit.payment_status === "Payment Pending" || (isOccupied && unit.payment_status !== "Paid");

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={unit.id || unit.unit_number}>
                  <Card
                    sx={{
                      borderRadius: "24px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                      border: isPending ? "2px solid #FF9500" : "1px solid rgba(0,0,0,0.06)",
                      bgcolor: "white",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    {/* Card Header */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: unit.unit_type === "house" ? "#5856D6" : "#007AFF",
                        color: "white",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <HomeWorkIcon fontSize="small" />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {unit.unit_number}
                        </Typography>
                        <Chip
                          label={unit.unit_type === "house" ? "บ้านเช่า" : "ห้องพัก"}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.25)",
                            color: "white",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            height: 22,
                          }}
                        />
                      </Box>
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          bgcolor: badge.bg,
                          color: badge.color,
                          fontWeight: 800,
                          fontSize: "0.75rem",
                        }}
                      />
                    </Box>

                    {/* Card Body */}
                    <Box sx={{ p: 2.5, flex: 1 }}>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: "#8E8E93" }}>ผู้เช่า:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1C1C1E" }}>
                          {unit.tenant_name || "-"}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: "#8E8E93" }}>เบอร์โทร:</Typography>
                        <Typography variant="body2" sx={{ color: "#1C1C1E" }}>
                          {unit.phone || "-"}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1.5, borderColor: "#F2F2F7" }} />
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: "#8E8E93" }}>ค่าเช่าพื้นฐาน:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1C1C1E" }}>
                          ฿{(unit.base_rent || 3000).toLocaleString()}/เดือน
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: "#8E8E93" }}>ค่าน้ำ (เหมาจ่าย):</Typography>
                        <Typography variant="body2" sx={{ color: "#1C1C1E" }}>
                          ฿{unit.water_fee || 150}/เดือน
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ color: "#8E8E93" }}>มิเตอร์ไฟล่าสุด:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: "#007AFF" }}>
                          {unit.last_meter_reading || 0} หน่วย (8฿/หน่วย)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Card Actions */}
                    <Box sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                      {isPending && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => handleConfirmPayment(unit)}
                          sx={{
                            bgcolor: "#34C759",
                            color: "white",
                            fontWeight: 800,
                            borderRadius: "14px",
                            "&:hover": { bgcolor: "#28A745" },
                          }}
                        >
                          ✅ ยืนยันรับเงิน
                        </Button>
                      )}
                      <Box display="flex" gap={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<ElectricBoltIcon />}
                          onClick={() => {
                            setMeterUnit(unit);
                            setNewMeterReading("");
                          }}
                          sx={{
                            borderColor: "#007AFF",
                            color: "#007AFF",
                            borderRadius: "14px",
                            fontWeight: 700,
                            "&:hover": { borderColor: "#0056B3", bgcolor: "rgba(0,122,255,0.04)" },
                          }}
                        >
                          จดไฟ
                        </Button>
                        <IconButton
                          onClick={() => handleOpenEdit(unit)}
                          sx={{ bgcolor: "#F2F2F7", borderRadius: "14px" }}
                        >
                          <EditIcon fontSize="small" sx={{ color: "#8E8E93" }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Meter Recording Dialog */}
      <Dialog
        open={!!meterUnit}
        onClose={() => setMeterUnit(null)}
        PaperProps={{ sx: { borderRadius: "28px", p: 1, maxWidth: 420 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: "center", pb: 1 }}>
          ⚡ จดมิเตอร์ไฟฟ้า {meterUnit?.unit_number}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: "#F2F2F7", borderRadius: "16px", mb: 2.5 }}>
            <Typography variant="body2" sx={{ color: "#8E8E93" }}>
              เลขมิเตอร์เดิม: <strong>{meterUnit?.last_meter_reading || 0} หน่วย</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: "#8E8E93" }}>
              อัตราค่าไฟ: <strong>{meterUnit?.electricity_rate || 8} บาท / หน่วย</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: "#8E8E93" }}>
              ค่าน้ำเหมาจ่าย: <strong>฿{meterUnit?.water_fee || 150}</strong> | ค่าเช่า: <strong>฿{(meterUnit?.base_rent || 3000).toLocaleString()}</strong>
            </Typography>
          </Box>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="เลขมิเตอร์ล่าสุดที่จดได้"
            placeholder="เช่น 2450"
            value={newMeterReading}
            onChange={(e) => setNewMeterReading(e.target.value)}
            slotProps={{
              input: {
                sx: { borderRadius: "16px", fontSize: "1.2rem", fontWeight: 700 },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setMeterUnit(null)} sx={{ borderRadius: "12px", color: "#8E8E93" }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveMeter}
            disabled={meterSaving || !newMeterReading}
            sx={{ bgcolor: "#007AFF", borderRadius: "14px", fontWeight: 800, px: 3 }}
          >
            {meterSaving ? "กำลังคำนวณ..." : "บันทึกและคำนวณบิล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Receipt Dialog */}
      <Dialog
        open={!!receiptBill}
        onClose={() => setReceiptBill(null)}
        PaperProps={{ sx: { borderRadius: "28px", p: 1, maxWidth: 450 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textAlign: "center", pb: 0 }}>
          🧾 ใบแจ้งค่าเช่าประจำเดือน
        </DialogTitle>
        <DialogContent>
          {receiptBill && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, textAlign: "center", color: "#007AFF" }}>
                {receiptBill.unit.unit_number} ({receiptBill.unit.tenant_name || "ผู้เช่า"})
              </Typography>
              <Box sx={{ p: 2, bgcolor: "#F8F9FA", borderRadius: "18px", mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">ค่าเช่าพื้นฐาน:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ฿{(receiptBill.bill?.rent_cost || receiptBill.unit.base_rent).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    ค่าไฟ ({receiptBill.bill?.electricity_units || 0} หน่วย x 8฿):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ฿{(receiptBill.bill?.electricity_cost || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">ค่าน้ำ (เหมาจ่าย):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    ฿{(receiptBill.bill?.water_cost || receiptBill.unit.water_fee).toLocaleString()}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>ยอดรวมทั้งสิ้น:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#007AFF" }}>
                    ฿{(receiptBill.bill?.total_amount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setReceiptBill(null)}
            sx={{ bgcolor: "#007AFF", borderRadius: "14px", fontWeight: 800 }}
          >
            ปิดหน้าต่าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Unit Modal */}
      <Dialog
        open={!!editingUnit}
        onClose={() => setEditingUnit(null)}
        PaperProps={{ sx: { borderRadius: "28px", p: 1, maxWidth: 440 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingUnit?.id ? "✏️ แก้ไขข้อมูลยูนิต" : "➕ เพิ่มยูนิตใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="หมายเลขห้อง / ชื่อยูนิต *"
            placeholder="เช่น 101 หรือ บ้านเช่า 1"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="ประเภทยูนิต"
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as any)}
          >
            <MenuItem value="room">ห้องพัก (Room)</MenuItem>
            <MenuItem value="house">บ้านเช่า (House)</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="ชื่อผู้เช่า"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
          <TextField
            fullWidth
            label="เบอร์โทรศัพท์"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            fullWidth
            type="number"
            label="ค่าเช่าพื้นฐาน (บาท/เดือน)"
            value={baseRent}
            onChange={(e) => setBaseRent(e.target.value)}
          />
          <TextField
            fullWidth
            type="number"
            label="ค่าน้ำเหมาจ่าย (บาท/เดือน)"
            value={waterFee}
            onChange={(e) => setWaterFee(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="สถานะการชำระเงิน"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
          >
            <MenuItem value="Vacant">ห้องว่าง (Vacant)</MenuItem>
            <MenuItem value="Occupied">มีผู้เช่า (Occupied)</MenuItem>
            <MenuItem value="Payment Pending">รอชำระเงิน (Pending)</MenuItem>
            <MenuItem value="Paid">ชำระแล้ว (Paid)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingUnit(null)} sx={{ borderRadius: "12px", color: "#8E8E93" }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUnit}
            disabled={saving}
            sx={{ bgcolor: "#007AFF", borderRadius: "14px", fontWeight: 800, px: 3 }}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: "14px", fontWeight: 700 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
