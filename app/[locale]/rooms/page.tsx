"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CircularProgress, IconButton,
  Chip, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, MenuItem, Grid, Divider, Snackbar, Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DatabaseIcon from "@mui/icons-material/Storage"; // representation for db
import { useRouter } from "@/i18n/routing";
import { supabase, Room } from "@/lib/supabase";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Add/Edit State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [baseRent, setBaseRent] = useState("3000");
  const [utilityFee, setUtilityFee] = useState("200"); // flat rate default
  const [paymentStatus, setPaymentStatus] = useState<'Occupied' | 'Vacant' | 'Payment Pending' | 'Paid'>('Vacant');
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Invoice Receipt Modal State
  const [invoiceRoom, setInvoiceRoom] = useState<Room | null>(null);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success"
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");

      if (error) {
        setDbError(error.message);
      } else {
        setRooms(data || []);
      }
    } catch (err: any) {
      setDbError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingRoom({
      id: "",
      room_number: "",
      tenant_name: null,
      phone: null,
      base_rent: 3000,
      utility_fee: 200,
      payment_status: 'Vacant',
      due_date: null,
      created_at: ""
    });
    setRoomNumber("");
    setTenantName("");
    setPhone("");
    setBaseRent("3000");
    setUtilityFee("200");
    setPaymentStatus("Vacant");
    setDueDate("");
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.room_number);
    setTenantName(room.tenant_name || "");
    setPhone(room.phone || "");
    setBaseRent(room.base_rent.toString());
    setUtilityFee(room.utility_fee.toString());
    setPaymentStatus(room.payment_status);
    setDueDate(room.due_date || "");
  };

  const handleSave = async () => {
    if (!editingRoom) return;

    setSaving(true);
    const payload = {
      tenant_name: tenantName.trim() || null,
      phone: phone.trim() || null,
      base_rent: parseFloat(baseRent) || 0,
      utility_fee: parseFloat(utilityFee) || 0,
      payment_status: paymentStatus,
      due_date: dueDate || null
    };

    let error;
    if (editingRoom.id) {
      // Edit
      const { error: err } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", editingRoom.id);
      error = err;
    } else {
      // Add
      if (!roomNumber.trim()) {
        setSnack({ open: true, msg: "กรุณาระบุหมายเลขห้อง", severity: "error" });
        setSaving(false);
        return;
      }
      const { error: err } = await supabase
        .from("rooms")
        .insert({
          room_number: roomNumber.trim(),
          ...payload
        });
      error = err;
    }

    if (error) {
      setSnack({ open: true, msg: "บันทึกผิดพลาด: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: editingRoom.id ? `อัปเดตห้องสำเร็จ` : `เพิ่มห้อง ${roomNumber} สำเร็จ`, severity: "success" });
      setEditingRoom(null);
      loadRooms();
    }
    setSaving(false);
  };

  const handleInitializeDefaultRooms = async () => {
    setSaving(true);
    const defaultRooms = Array.from({ length: 10 }, (_, i) => ({
      room_number: (101 + i).toString(),
      base_rent: 3000,
      utility_fee: 200,
      payment_status: 'Vacant' as const
    }));

    const { error } = await supabase.from("rooms").insert(defaultRooms);
    if (error) {
      setSnack({ open: true, msg: "สร้างห้องไม่สำเร็จ: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: "สร้างห้องเริ่มต้น 10 ห้องสำเร็จ!", severity: "success" });
      loadRooms();
    }
    setSaving(false);
  };

  const getStatusColor = (status: Room["payment_status"]) => {
    switch (status) {
      case "Paid":
        return { bg: "#dcfce7", color: "#16a34a", label: "จ่ายแล้ว" };
      case "Payment Pending":
        return { bg: "#ffedd5", color: "#ea580c", label: "ค้างจ่าย" };
      case "Occupied":
        return { bg: "#e0f2fe", color: "#0284c7", label: "มีผู้เช่า" };
      case "Vacant":
      default:
        return { bg: "#f1f5f9", color: "#64748b", label: "ห้องว่าง" };
    }
  };

  // Summaries
  const occupiedCount = rooms.filter((r) => r.payment_status !== "Vacant").length;
  const paidCount = rooms.filter((r) => r.payment_status === "Paid").length;
  const pendingCount = rooms.filter((r) => r.payment_status === "Payment Pending").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 5 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
          color: "white",
          px: 3, pt: 4, pb: 3,
          borderRadius: "0 0 28px 28px",
          boxShadow: "0 4px 20px rgba(124,58,237,0.2)"
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
          <IconButton onClick={() => router.push("/")} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>🏠 จัดการห้องพัก ({rooms.length} ห้อง)</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
              ดูสถานะผู้เช่า, ค้างชำระเงิน, และออกใบแจ้งหนี้ค่าเช่าเหมาจ่ายรายเดือน
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            disabled={!!dbError}
            sx={{ bgcolor: "#a78bfa", "&:hover": { bgcolor: "#8b5cf6" }, borderRadius: "12px", px: 2, py: 1 }}
          >
            เพิ่มห้องพักใหม่
          </Button>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Chip label={`ห้องพักทั้งหมด ${rooms.length} ห้อง`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }} />
          <Chip label={`มีผู้เช่าแล้ว: ${occupiedCount} ห้อง`} sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 700 }} />
          <Chip label={`จ่ายแล้ว: ${paidCount} ห้อง`} sx={{ bgcolor: "#e0f2fe", color: "#0284c7", fontWeight: 700 }} />
          {pendingCount > 0 && (
            <Chip label={`ค้างจ่ายเงิน: ${pendingCount} ห้อง`} sx={{ bgcolor: "#fee2e2", color: "#ef4444", fontWeight: 800 }} />
          )}
        </Box>
      </Box>

      {/* Main Area */}
      <Box sx={{ px: 3, mt: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#7c3aed" }} />
          </Box>
        ) : dbError ? (
          <Card sx={{ p: 4, borderRadius: "24px", border: "2px solid #ef4444", bgcolor: "#fef2f2" }}>
            <Box display="flex" gap={2} alignItems="center" mb={2}>
              <DatabaseIcon style={{ color: "#ef4444", fontSize: "2rem" }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#991b1b" }}>ไม่พบตารางข้อมูลใน Supabase</Typography>
            </Box>
            <Typography sx={{ color: "#7f1d1d", mb: 2 }}>
              ระบบตรวจไม่พบตารางข้อมูลห้องพัก (`rooms`) กรุณาตรวจสอบว่าท่านได้คัดลอกคำสั่งในไฟล์ <strong>`database_v2.sql`</strong> ไปรันในระบบ Supabase SQL Editor เรียบร้อยแล้ว
            </Typography>
            <Box sx={{ p: 2, bgcolor: "#fee2e2", borderRadius: "12px", mb: 3 }}>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#991b1b" }}>
                รายละเอียดข้อผิดพลาด: {dbError}
              </Typography>
            </Box>
            <Button variant="contained" color="error" onClick={loadRooms} sx={{ borderRadius: "12px" }}>
              ลองโหลดข้อมูลใหม่อีกครั้ง
            </Button>
          </Card>
        ) : rooms.length === 0 ? (
          <Card sx={{ p: 5, textAlign: "center", borderRadius: "24px", border: "2px dashed #cbd5e1" }}>
            <Typography sx={{ fontSize: "3rem", mb: 2 }}>📭</Typography>
            <Typography variant="h6" sx={{ color: "#475569", fontWeight: 800, mb: 1 }}>ไม่พบข้อมูลห้องพักในระบบ</Typography>
            <Typography sx={{ color: "#94a3b8", mb: 3 }}>ระบบยังไม่มีรายการห้องพัก คุณสามารถสร้างห้องพักตั้งต้นหรือเพิ่มด้วยตนเองได้</Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                onClick={handleInitializeDefaultRooms}
                disabled={saving}
                sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" }, borderRadius: "12px" }}
              >
                สร้างห้องตั้งต้น 10 ห้อง (101 - 110)
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenAdd}
                sx={{ borderColor: "#7c3aed", color: "#7c3aed", borderRadius: "12px" }}
              >
                เพิ่มห้องด้วยตนเอง
              </Button>
            </Box>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {rooms.map((room) => {
              const statusCfg = getStatusColor(room.payment_status);
              const invoiceTotal = room.base_rent + room.utility_fee;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: "20px",
                      borderTop: `6px solid ${statusCfg.color}`,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                      transition: "transform 0.15s, box-shadow 0.15s",
                      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 25px rgba(124,58,237,0.1)" }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#1e293b" }}>
                        ห้อง {room.room_number}
                      </Typography>
                      <Chip
                        label={statusCfg.label}
                        size="small"
                        sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 800 }}
                      />
                    </Box>

                    {room.payment_status === "Vacant" ? (
                      <Box py={1.5} mb={2}>
                        <Typography sx={{ color: "#94a3b8", fontStyle: "italic" }}>ว่าง ไม่มีผู้เช่า</Typography>
                      </Box>
                    ) : (
                      <Box mb={2}>
                        <Typography sx={{ fontWeight: 700, color: "#475569", fontSize: "1.05rem" }}>
                          👤 ผู้เช่า: {room.tenant_name || "ไม่ระบุชื่อ"}
                        </Typography>
                        {room.phone && (
                          <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>
                            📞 เบอร์โทร: {room.phone}
                          </Typography>
                        )}
                        <Box sx={{ mt: 1, p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px" }}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>ค่าเช่าห้อง:</Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>฿{room.base_rent}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>ค่าน้ำไฟเหมาจ่าย:</Typography>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>฿{room.utility_fee}</Typography>
                          </Box>
                          <Divider sx={{ my: 0.75 }} />
                          <Box display="flex" justifyContent="space-between">
                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: "#475569" }}>ยอดชำระต่อเดือน:</Typography>
                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 900, color: "#7c3aed" }}>฿{invoiceTotal}</Typography>
                          </Box>
                        </Box>
                        {room.due_date && (
                          <Typography variant="caption" sx={{ color: "#ef4444", fontWeight: 700, display: "block", mt: 1 }}>
                            📅 กำหนดชำระ: {room.due_date}
                          </Typography>
                        )}
                      </Box>
                    )}

                    <Box display="flex" gap={1} mt={1}>
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<InfoIcon />}
                        onClick={() => handleOpenEdit(room)}
                        sx={{ fontSize: "0.85rem", borderRadius: "10px", py: 1 }}
                      >
                        แก้ไขข้อมูล
                      </Button>
                      {room.payment_status !== "Vacant" && (
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          color="secondary"
                          startIcon={<ReceiptIcon />}
                          onClick={() => setInvoiceRoom(room)}
                          sx={{ fontSize: "0.85rem", borderRadius: "10px", py: 1, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
                        >
                          ใบแจ้งหนี้
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Dialog: Add/Edit Room Info */}
      <Dialog open={!!editingRoom} onClose={() => setEditingRoom(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 900 }}>
          {editingRoom?.id ? `✏️ จัดการผู้เช่าห้อง ${editingRoom.room_number}` : "➕ เพิ่มห้องพักใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          {!editingRoom?.id && (
            <TextField
              label="หมายเลขห้องพัก (เช่น 101, 102)"
              fullWidth
              required
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              InputProps={{ sx: { borderRadius: "12px" } }}
            />
          )}

          <TextField
            select
            label="สถานะของห้องพัก"
            fullWidth
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
            InputProps={{ sx: { borderRadius: "12px" } }}
          >
            <MenuItem value="Vacant">ว่าง (Vacant)</MenuItem>
            <MenuItem value="Occupied">มีผู้เช่า (Occupied)</MenuItem>
            <MenuItem value="Payment Pending">ค้างชำระ (Payment Pending)</MenuItem>
            <MenuItem value="Paid">จ่ายแล้ว (Paid)</MenuItem>
          </TextField>

          {paymentStatus !== "Vacant" && (
            <>
              <TextField
                label="ชื่อผู้เช่าห้องพัก"
                fullWidth
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="เบอร์โทรศัพท์ผู้เช่า"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="ค่าเช่าต่อเดือน (บาท)"
                fullWidth
                type="number"
                value={baseRent}
                onChange={(e) => setBaseRent(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="ค่าเหมาจ่ายน้ำไฟส่วนกลาง (บาท)"
                fullWidth
                type="number"
                value={utilityFee}
                onChange={(e) => setUtilityFee(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
              <TextField
                label="กำหนดชำระรายเดือน"
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
          <Button onClick={() => setEditingRoom(null)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: "#7c3aed" }}>
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Invoice & Receipt Generator */}
      <Dialog open={!!invoiceRoom} onClose={() => setInvoiceRoom(null)} fullWidth maxWidth="sm">
        {invoiceRoom && (
          <Box sx={{ p: 4, bgcolor: "white" }}>
            {/* Invoice Design */}
            <Box sx={{ border: "2px solid #e2e8f0", p: 3, borderRadius: "16px", mb: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: "#7c3aed" }}>
                    ใบแจ้งหนี้ / ใบเสร็จรับเงินค่าเช่า
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    ห้องพัก StoreHouse Room Rental
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography sx={{ fontWeight: 800 }}>ห้องพักหมายเลข {invoiceRoom.room_number}</Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    วันที่แจ้ง: {format(new Date(), "d MMMM yyyy", { locale: th })}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <Typography sx={{ fontWeight: 700, color: "#475569" }}>
                  ผู้เช่า: {invoiceRoom.tenant_name || "ไม่ระบุ"}
                </Typography>
                {invoiceRoom.phone && (
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    เบอร์โทรติดต่อ: {invoiceRoom.phone}
                  </Typography>
                )}
              </Box>

              <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: "12px", mb: 3 }}>
                <Box display="flex" justifyContent="space-between" py={0.75}>
                  <Typography sx={{ color: "#475569" }}>1. ค่าเช่าห้องพักประจำเดือน</Typography>
                  <Typography sx={{ fontWeight: 700 }}>฿{invoiceRoom.base_rent.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.75}>
                  <Typography sx={{ color: "#475569" }}>2. ค่าเหมาจ่ายสาธารณูปโภค (น้ำ-ไฟ)</Typography>
                  <Typography sx={{ fontWeight: 700 }}>฿{invoiceRoom.utility_fee.toLocaleString()}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography sx={{ fontWeight: 900 }}>รวมทั้งสิ้น</Typography>
                  <Typography sx={{ fontWeight: 950, color: "#7c3aed", fontSize: "1.2rem" }}>
                    ฿{(invoiceRoom.base_rent + invoiceRoom.utility_fee).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  * กรุณาชำระเงินตรงเวลา ขอบคุณที่ใช้บริการครับ/ค่ะ
                </Typography>
                <Chip
                  label={invoiceRoom.payment_status === "Paid" ? "ชำระเงินเรียบร้อย" : "รอการชำระเงิน"}
                  color={invoiceRoom.payment_status === "Paid" ? "success" : "warning"}
                  sx={{ fontWeight: 800 }}
                />
              </Box>
            </Box>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button onClick={() => setInvoiceRoom(null)} variant="outlined">
                ปิดหน้าต่าง
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  window.print();
                }}
                sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
              >
                พิมพ์เอกสาร (Print)
              </Button>
            </Box>
          </Box>
        )}
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
