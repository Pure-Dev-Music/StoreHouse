"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CircularProgress, IconButton,
  Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, MenuItem, Grid, Divider, Snackbar, Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DatabaseIcon from "@mui/icons-material/Storage";
import { useRouter } from "@/i18n/routing";
import { supabase, ParkingSlot } from "@/lib/supabase";

export default function ParkingPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Add/Edit state
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [slotNumber, setSlotNumber] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<'Occupied' | 'Vacant' | 'Payment Pending' | 'Paid'>('Vacant');
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success"
  });

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from("parking_slots")
        .select("*")
        .order("slot_number");

      if (error) {
        setDbError(error.message);
      } else {
        setSlots(data || []);
      }
    } catch (err: any) {
      setDbError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSlot({
      id: "",
      slot_number: "",
      vehicle_plate: null,
      owner_name: null,
      payment_status: 'Vacant',
      due_date: null,
      created_at: ""
    });
    setSlotNumber("");
    setVehiclePlate("");
    setOwnerName("");
    setPaymentStatus("Vacant");
    setDueDate("");
  };

  const handleOpenEdit = (slot: ParkingSlot) => {
    setEditingSlot(slot);
    setSlotNumber(slot.slot_number);
    setVehiclePlate(slot.vehicle_plate || "");
    setOwnerName(slot.owner_name || "");
    setPaymentStatus(slot.payment_status);
    setDueDate(slot.due_date || "");
  };

  const handleSave = async () => {
    if (!editingSlot) return;

    setSaving(true);
    const payload = {
      vehicle_plate: vehiclePlate.trim() || null,
      owner_name: ownerName.trim() || null,
      payment_status: paymentStatus,
      due_date: dueDate || null
    };

    let error;
    if (editingSlot.id) {
      // Edit
      const { error: err } = await supabase
        .from("parking_slots")
        .update(payload)
        .eq("id", editingSlot.id);
      error = err;
    } else {
      // Add
      if (!slotNumber.trim()) {
        setSnack({ open: true, msg: "กรุณาระบุเลขช่องจอด", severity: "error" });
        setSaving(false);
        return;
      }
      const { error: err } = await supabase
        .from("parking_slots")
        .insert({
          slot_number: slotNumber.trim(),
          ...payload
        });
      error = err;
    }

    if (error) {
      setSnack({ open: true, msg: "บันทึกผิดพลาด: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: editingSlot.id ? `อัปเดตช่องจอดรถสำเร็จ` : `เพิ่มช่องจอดรถ ${slotNumber} สำเร็จ`, severity: "success" });
      setEditingSlot(null);
      loadSlots();
    }
    setSaving(false);
  };

  const handleInitializeDefaultSlots = async () => {
    setSaving(true);
    const defaultSlots = Array.from({ length: 8 }, (_, i) => ({
      slot_number: `P${i + 1}`,
      payment_status: 'Vacant' as const
    }));

    const { error } = await supabase.from("parking_slots").insert(defaultSlots);
    if (error) {
      setSnack({ open: true, msg: "สร้างช่องจอดไม่สำเร็จ: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: "สร้างช่องจอดตั้งต้น 8 ช่องสำเร็จ!", severity: "success" });
      loadSlots();
    }
    setSaving(false);
  };

  const getSlotColor = (status: ParkingSlot["payment_status"]) => {
    switch (status) {
      case "Paid":
        return { color: "#16a34a", bg: "#dcfce7", label: "ชำระเงินแล้ว" };
      case "Payment Pending":
        return { color: "#ea580c", bg: "#ffedd5", label: "ค้างชำระ" };
      case "Occupied":
        return { color: "#0284c7", bg: "#e0f2fe", label: "จองแล้ว" };
      case "Vacant":
      default:
        return { color: "#94a3b8", bg: "#f1f5f9", label: "ช่องว่าง" };
    }
  };

  // Stats
  const occupiedCount = slots.filter((s) => s.payment_status !== "Vacant").length;
  const vacantCount = slots.length - occupiedCount;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 5 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
          color: "white",
          px: 3, pt: 4, pb: 3,
          borderRadius: "0 0 28px 28px",
          boxShadow: "0 4px 20px rgba(8,145,178,0.2)"
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
          <IconButton onClick={() => router.push("/")} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>🚗 จัดการที่จอดรถ ({slots.length} ช่อง)</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
              ตรวจสอบเลขทะเบียน, เจ้าของรถ, และสถานะการชำระเงินค่าเช่าช่องจอดรายเดือน
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="info"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={!!dbError}
            sx={{ bgcolor: "#22d3ee", "&:hover": { bgcolor: "#06b6d4" }, borderRadius: "12px", color: "#083344", px: 2, py: 1 }}
          >
            เพิ่มช่องจอดใหม่
          </Button>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Chip label={`ช่องจอดรถทั้งหมด ${slots.length} ช่อง`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }} />
          <Chip label={`มีรถจอดอยู่: ${occupiedCount} ช่อง`} sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 700 }} />
          <Chip label={`ว่าง: ${vacantCount} ช่อง`} sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontWeight: 700 }} />
        </Box>
      </Box>

      {/* Main Grid Workspace */}
      <Box sx={{ px: 3, mt: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#0891b2" }} />
          </Box>
        ) : dbError ? (
          <Card sx={{ p: 4, borderRadius: "24px", border: "2px solid #ef4444", bgcolor: "#fef2f2" }}>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <DatabaseIcon style={{ color: "#ef4444", fontSize: "2rem" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#991b1b" }}>ไม่พบตารางข้อมูลใน Supabase</Typography>
            </Box>
            <Typography sx={{ color: "#7f1d1d", mb: 2 }}>
              ระบบตรวจไม่พบตารางข้อมูลที่จอดรถ (`parking_slots`) กรุณาตรวจสอบว่าท่านได้คัดลอกคำสั่งในไฟล์ <strong>`database_v2.sql`</strong> ไปรันในระบบ Supabase SQL Editor เรียบร้อยแล้ว
            </Typography>
            <Box sx={{ p: 2, bgcolor: "#fee2e2", borderRadius: "12px", mb: 3 }}>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#991b1b" }}>
                รายละเอียดข้อผิดพลาด: {dbError}
              </Typography>
            </Box>
            <Button variant="contained" color="error" onClick={loadSlots} sx={{ borderRadius: "12px" }}>
              ลองโหลดข้อมูลใหม่อีกครั้ง
            </Button>
          </Card>
        ) : slots.length === 0 ? (
          <Card sx={{ p: 5, textAlign: "center", borderRadius: "24px", border: "2px dashed #cbd5e1" }}>
            <Typography sx={{ fontSize: "3rem", mb: 2 }}>📭</Typography>
            <Typography variant="h6" sx={{ color: "#475569", fontWeight: 800, mb: 1 }}>ไม่พบข้อมูลช่องจอดรถในระบบ</Typography>
            <Typography sx={{ color: "#94a3b8", mb: 3 }}>ระบบยังไม่มีรายการช่องจอดรถ คุณสามารถสร้างช่องจอดรถตั้งต้นหรือเพิ่มด้วยตนเองได้</Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleInitializeDefaultSlots}
                disabled={saving}
                sx={{ bgcolor: "#0891b2", "&:hover": { bgcolor: "#06b6d4" }, borderRadius: "12px" }}
              >
                สร้างช่องจอดตั้งต้น 8 ช่อง (P1 - P8)
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenAdd}
                sx={{ borderColor: "#0891b2", color: "#0891b2", borderRadius: "12px" }}
              >
                เพิ่มช่องจอดด้วยตนเอง
              </Button>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {slots.map((slot) => {
              const cfg = getSlotColor(slot.payment_status);
              const isVacant = slot.payment_status === "Vacant";

              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={slot.id}>
                  <Card
                    onClick={() => handleOpenEdit(slot)}
                    sx={{
                      p: 3.5,
                      borderRadius: "24px",
                      cursor: "pointer",
                      border: `3px solid ${isVacant ? "#cbd5e1" : cfg.color}`,
                      bgcolor: isVacant ? "#f8fafc" : "white",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: `0 8px 25px ${isVacant ? "rgba(0,0,0,0.05)" : cfg.color + "1a"}`
                      },
                      textAlign: "center"
                    }}
                  >
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        bgcolor: cfg.bg,
                        color: cfg.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.4rem",
                        mx: "auto",
                        mb: 2
                      }}
                    >
                      {isVacant ? "🅿️" : <DriveEtaIcon />}
                    </Box>

                    <Typography sx={{ fontSize: "1.6rem", fontWeight: 950, color: "#1e293b", mb: 0.5 }}>
                      ช่อง {slot.slot_number}
                    </Typography>

                    <Chip
                      label={cfg.label}
                      size="small"
                      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 800, mb: 2 }}
                    />

                    {isVacant ? (
                      <Typography sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.95rem", py: 1.5 }}>
                        ว่าง พร้อมให้บริการ
                      </Typography>
                    ) : (
                      <Box sx={{ textAlign: "left", bgcolor: "#f8fafc", p: 2, borderRadius: "16px" }}>
                        <Typography sx={{ fontSize: "1.05rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                          🚙 {slot.vehicle_plate || "ไม่ระบุทะเบียน"}
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccountCircleIcon fontSize="inherit" /> {slot.owner_name || "ไม่ระบุเจ้าของ"}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography sx={{ fontSize: "0.82rem", color: "#475569", fontWeight: 700 }}>
                          ค่าเช่ารายเดือน: ฿500
                        </Typography>
                        {slot.due_date && (
                          <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, display: "block", mt: 0.5 }}>
                            📅 กำหนดชำระ: {slot.due_date}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Dialog: Add/Edit Parking Slot Info */}
      <Dialog open={!!editingSlot} onClose={() => setEditingSlot(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingSlot?.id ? `✏️ จัดการช่องจอดรถ ${editingSlot.slot_number}` : "➕ เพิ่มช่องจอดรถใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          {!editingSlot?.id && (
            <TextField
              label="หมายเลขช่องจอดรถ (เช่น P1, P2)"
              fullWidth
              required
              value={slotNumber}
              onChange={(e) => setSlotNumber(e.target.value)}
              InputProps={{ sx: { borderRadius: "12px" } }}
            />
          )}

          <TextField
            select
            label="สถานะช่องจอดรถ"
            fullWidth
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
            InputProps={{ sx: { borderRadius: "12px" } }}
          >
            <MenuItem value="Vacant">ว่าง (Vacant)</MenuItem>
            <MenuItem value="Occupied">จองแล้ว (Occupied)</MenuItem>
            <MenuItem value="Payment Pending">ค้างชำระเงิน (Payment Pending)</MenuItem>
            <MenuItem value="Paid">ชำระเงินแล้ว (Paid)</MenuItem>
          </TextField>

          {paymentStatus !== "Vacant" && (
            <>
              <TextField
                label="ทะเบียนรถยนต์ (เช่น กข-1234 กทม.)"
                fullWidth
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="ชื่อเจ้าของรถ/ผู้จอง"
                fullWidth
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="กำหนดชำระเงินรอบถัดไป"
                fullWidth
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setEditingSlot(null)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: "#0891b2" }}>
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ fontSize: "1.05rem", borderRadius: "12px", fontWeight: 700 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
