"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CircularProgress, IconButton,
  TextField, Button, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Alert, Chip, InputAdornment, Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useRouter } from "@/i18n/routing";
import { supabase, Product } from "@/lib/supabase";
import { differenceInDays, parseISO, format } from "date-fns";
import { th } from "date-fns/locale";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add/Edit Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "warning" }>({
    open: false,
    msg: "",
    severity: "success"
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");

    if (error) {
      setSnack({ open: true, msg: "โหลดสินค้าไม่สำเร็จ: " + error.message, severity: "error" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName("");
    setBarcode("");
    setCostPrice("");
    setSellingPrice("");
    setStockQty("");
    setExpiryDate("");
    setOpenDialog(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode || "");
    setCostPrice(p.cost_price.toString());
    setSellingPrice(p.selling_price.toString());
    setStockQty(p.stock_qty.toString());
    setExpiryDate(p.expiry_date || "");
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSnack({ open: true, msg: "กรุณากรอกชื่อสินค้า", severity: "error" });
      return;
    }
    if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
      setSnack({ open: true, msg: "กรุณากรอกราคาขายที่มากกว่า 0", severity: "error" });
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      barcode: barcode.trim() || null,
      cost_price: parseFloat(costPrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
      stock_qty: parseFloat(stockQty) || 0,
      expiry_date: expiryDate || null
    };

    let error;
    if (editingProduct) {
      const { error: err } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from("products")
        .insert(payload);
      error = err;
    }

    if (error) {
      setSnack({ open: true, msg: "บันทึกข้อมูลล้มเหลว: " + error.message, severity: "error" });
    } else {
      setSnack({ open: true, msg: "บันทึกข้อมูลสำเร็จ!", severity: "success" });
      setOpenDialog(false);
      loadProducts();
    }
    setSaving(false);
  };

  const checkExpiryStatus = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return { status: "normal", days: 999 };
    const days = differenceInDays(parseISO(expiryDateStr), new Date());
    if (days < 0) return { status: "expired", days };
    if (days <= 7) return { status: "critical", days };
    return { status: "normal", days };
  };

  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(s) ||
      (p.barcode && p.barcode.includes(s))
    );
  });

  // Statistics
  const expiringSoonCount = products.filter((p) => {
    const exp = checkExpiryStatus(p.expiry_date);
    return exp.status === "critical" || exp.status === "expired";
  }).length;

  const lowStockCount = products.filter((p) => p.stock_qty <= 5).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 5 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          color: "white",
          px: 3, pt: 4, pb: 3,
          borderRadius: "0 0 28px 28px",
          boxShadow: "0 4px 20px rgba(30,58,138,0.2)"
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => router.push("/")} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>📦 สต๊อกสินค้าโชห่วย</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
              จัดการคลังสินค้า, ทุน-ราคาขาย, และแจ้งเตือนวันหมดอายุ
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}
          >
            เพิ่มสินค้าใหม่
          </Button>
        </Box>

        {/* Quick summary chips */}
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <Chip label={`สินค้าทั้งหมด ${products.length} รายการ`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }} />
          {expiringSoonCount > 0 && (
            <Chip
              icon={<WarningAmberIcon style={{ color: "white" }} />}
              label={`หมดอายุ/ใกล้หมดใน 7 วัน: ${expiringSoonCount}`}
              sx={{ bgcolor: "#ef4444", color: "white", fontWeight: 800 }}
            />
          )}
          {lowStockCount > 0 && (
            <Chip label={`สินค้าเหลือน้อย (≤5): ${lowStockCount}`} sx={{ bgcolor: "#f59e0b", color: "white", fontWeight: 800 }} />
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: 3, mt: 3 }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="ค้นหาตามชื่อสินค้า หรือ รหัสบาร์โค้ด..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#3b82f6" }} />
              </InputAdornment>
            ),
            sx: { borderRadius: "16px", bgcolor: "white" }
          }}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress sx={{ color: "#3b82f6" }} />
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Card sx={{ p: 5, textAlign: "center", borderRadius: "20px", border: "2px dashed #cbd5e1" }}>
            <Typography sx={{ fontSize: "3rem", mb: 1 }}>📭</Typography>
            <Typography sx={{ color: "#64748b", fontWeight: 600 }}>ไม่พบรายการสินค้าที่ต้องการค้นหา</Typography>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {filteredProducts.map((p) => {
              const exp = checkExpiryStatus(p.expiry_date);
              const isLowStock = p.stock_qty <= 5;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
                  <Card
                    sx={{
                      p: 2.5,
                      borderRadius: "20px",
                      position: "relative",
                      borderLeft: "6px solid",
                      borderColor:
                        exp.status === "expired"
                          ? "#ef4444"
                          : exp.status === "critical"
                          ? "#f97316"
                          : isLowStock
                          ? "#f59e0b"
                          : "#3b82f6",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                      transition: "transform 0.15s",
                      "&:hover": { transform: "translateY(-3px)", boxShadow: "0 6px 20px rgba(0,0,0,0.06)" }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box>
                        <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b" }}>
                          {p.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          🏷️ บาร์โค้ด: {p.barcode || "ไม่มี"}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleOpenEdit(p)} sx={{ bgcolor: "#f1f5f9", color: "#3b82f6" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Stock status */}
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Chip
                        label={`สต๊อก: ${p.stock_qty} ชิ้น`}
                        size="small"
                        sx={{
                          bgcolor: isLowStock ? "#fee2e2" : "#dcfce7",
                          color: isLowStock ? "#ef4444" : "#16a34a",
                          fontWeight: 700
                        }}
                      />
                      {p.expiry_date && (
                        <Chip
                          label={
                            exp.status === "expired"
                              ? "หมดอายุแล้ว"
                              : exp.status === "critical"
                              ? `ใกล้หมดอายุใน ${exp.days} วัน`
                              : `หมดอายุ: ${p.expiry_date}`
                          }
                          size="small"
                          sx={{
                            bgcolor: exp.status === "expired" ? "#fee2e2" : exp.status === "critical" ? "#ffedd5" : "#f1f5f9",
                            color: exp.status === "expired" ? "#ef4444" : exp.status === "critical" ? "#ea580c" : "#475569",
                            fontWeight: 700
                          }}
                        />
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Cost & Sell price */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>ราคาทุน</Typography>
                        <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#475569" }}>
                          ฿{p.cost_price.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>ราคาขาย</Typography>
                        <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: "#16a34a" }}>
                          ฿{p.selling_price.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Dialog: Add/Edit Product */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.25rem" }}>
          {editingProduct ? "✏️ แก้ไขรายละเอียดสินค้า" : "📦 เพิ่มสินค้าใหม่"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="ชื่อสินค้า (เช่น น้ำตาลทราย, บะหมี่กึ่งสำเร็จรูป)"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
          <TextField
            label="รหัสบาร์โค้ดสินค้า (สแกนใส่ได้เลย)"
            fullWidth
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="ตัวอย่าง 8850029010123"
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="ราคาทุน (บาท)"
                fullWidth
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="ราคาขายปลีก (บาท)"
                fullWidth
                type="number"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                InputProps={{ sx: { borderRadius: "12px" } }}
              />
            </Grid>
          </Grid>
          <TextField
            label="จำนวนสินค้าคงคลัง (สต๊อกเริ่มต้น)"
            fullWidth
            type="number"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
          <TextField
            label="วันหมดอายุสินค้า (ถ้ามี)"
            fullWidth
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: "#3b82f6" }}>
            {saving ? "กำลังบันทึก..." : "บันทึกสินค้า"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ fontSize: "1.05rem", borderRadius: "12px", fontWeight: 700 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
