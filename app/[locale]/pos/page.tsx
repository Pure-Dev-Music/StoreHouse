"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Card, CircularProgress, IconButton,
  TextField, Button, Grid, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, Badge, InputAdornment
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalculateIcon from "@mui/icons-material/Calculate";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { useRouter } from "@/i18n/routing";
import { supabase, Product } from "@/lib/supabase";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

type CartItem = {
  product: Partial<Product>; // Can be partial for custom/quick items
  quantity: number;
  isCustom?: boolean;
};

export default function PosPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dialogs
  const [customItemOpen, setCustomItemOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customCost, setCustomCost] = useState("");

  const [checkoutSuccessOpen, setCheckoutSuccessOpen] = useState(false);
  const [lastChange, setLastChange] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);

  // Feedback
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" | "warning" }>({
    open: false,
    msg: "",
    severity: "success"
  });

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Focus barcode input on mount and keep it focused
  useEffect(() => {
    focusBarcodeInput();
  }, []);

  const focusBarcodeInput = () => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  // Listen for global barcode scanning
  useBarcodeScanner(async (barcode) => {
    await handleBarcodeScan(barcode);
  });

  const handleBarcodeScan = async (barcode: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("barcode", barcode)
      .single();

    if (error || !data) {
      setSnack({
        open: true,
        msg: `❌ ไม่พบสินค้าบาร์โค้ด: ${barcode}`,
        severity: "error"
      });
    } else {
      addToCart(data);
    }
    setLoading(false);
    setSearchInput("");
    focusBarcodeInput();
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Check if input is a barcode (only numbers and length > 5 is common for barcodes)
    if (/^\d{6,}$/.test(searchInput.trim())) {
      await handleBarcodeScan(searchInput.trim());
    } else {
      // Name search
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${searchInput.trim()}%`)
        .limit(5);

      if (error || !data || data.length === 0) {
        setSnack({
          open: true,
          msg: `❌ ไม่พบสินค้านี้: "${searchInput}"`,
          severity: "error"
        });
      } else if (data.length === 1) {
        addToCart(data[0]);
        setSearchInput("");
      } else {
        // Multi-matches: for simplicity add the first one, or show alert
        addToCart(data[0]);
        setSnack({
          open: true,
          msg: `🔍 พบหลายรายการ เพิ่ม "${data[0].name}" ลงตะกร้า`,
          severity: "warning"
        });
        setSearchInput("");
      }
      setLoading(false);
      focusBarcodeInput();
    }
  };

  const addToCart = (product: Partial<Product>, isCustom = false) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => {
        if (isCustom) return false; // Custom items are added separately
        return item.product.id === product.id;
      });

      if (existing) {
        // Check stock limit for products in db
        if (product.stock_qty !== undefined && existing.quantity >= product.stock_qty) {
          setSnack({
            open: true,
            msg: `⚠️ สินค้าในคลังไม่พอ (คงเหลือ ${product.stock_qty} ชิ้น)`,
            severity: "warning"
          });
          return prevCart;
        }

        setSnack({
          open: true,
          msg: `เพิ่มจำนวน ${product.name}`,
          severity: "success"
        });

        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      setSnack({
        open: true,
        msg: `🛒 เพิ่ม ${product.name} แล้ว`,
        severity: "success"
      });

      return [...prevCart, { product, quantity: 1, isCustom }];
    });
  };

  const updateQuantity = (index: number, change: number) => {
    setCart((prevCart) => {
      const item = prevCart[index];
      const newQty = item.quantity + change;
      if (newQty <= 0) {
        return prevCart.filter((_, i) => i !== index);
      }
      // Check stock limit
      if (!item.isCustom && item.product.stock_qty !== undefined && newQty > item.product.stock_qty) {
        setSnack({
          open: true,
          msg: `⚠️ สินค้าในคลังไม่พอ (คงเหลือ ${item.product.stock_qty} ชิ้น)`,
          severity: "warning"
        });
        return prevCart;
      }
      return prevCart.map((it, i) => (i === index ? { ...it, quantity: newQty } : it));
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const addCustomItem = () => {
    if (!customName.trim() || !customPrice) {
      setSnack({ open: true, msg: "กรุณากรอกชื่อและราคาขาย", severity: "error" });
      return;
    }
    const priceNum = parseFloat(customPrice) || 0;
    const costNum = parseFloat(customCost) || priceNum * 0.7; // default cost is 70% of retail if not specified

    const newItem: Partial<Product> = {
      name: customName.trim(),
      selling_price: priceNum,
      cost_price: costNum,
      stock_qty: 9999
    };

    addToCart(newItem, true);
    setCustomName("");
    setCustomPrice("");
    setCustomCost("");
    setCustomItemOpen(false);
    focusBarcodeInput();
  };

  const addQuickActionItem = (name: string, price: number, cost: number) => {
    const newItem: Partial<Product> = {
      name,
      selling_price: price,
      cost_price: cost,
      stock_qty: 9999
    };
    addToCart(newItem, true);
    focusBarcodeInput();
  };

  // Calculations
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.selling_price || 0) * item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.product.cost_price || 0) * item.quantity, 0);
  const totalProfit = totalPrice - totalCost;

  const cashNum = parseFloat(cashReceived) || 0;
  const changeDue = cashNum > 0 ? Math.max(0, cashNum - totalPrice) : 0;

  const handleCashInput = (val: string) => {
    if (val === "CLEAR") {
      setCashReceived("");
    } else if (val === "BACK") {
      setCashReceived((prev) => prev.slice(0, -1));
    } else {
      setCashReceived((prev) => prev + val);
    }
  };

  const handleQuickCash = (amt: number) => {
    setCashReceived(amt.toString());
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setSnack({ open: true, msg: "❌ ตะกร้าสินค้าว่างเปล่า", severity: "error" });
      return;
    }
    if (cashNum < totalPrice) {
      setSnack({ open: true, msg: "⚠️ ได้รับเงินสดไม่พอกับยอดซื้อ", severity: "warning" });
      return;
    }

    setSubmitting(true);

    try {
      // Map items for the database RPC function process_sale
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id || null, // null for custom items
        quantity: item.quantity,
        unit_price: item.product.selling_price || 0,
        unit_cost: item.product.cost_price || 0
      }));

      // Call the Supabase RPC function process_sale
      const { data, error } = await supabase.rpc("process_sale", {
        p_total_amount: totalPrice,
        p_total_cost: totalCost,
        p_total_profit: totalProfit,
        p_items: itemsPayload
      });

      if (error) throw error;

      // Show success modal
      setLastTotal(totalPrice);
      setLastChange(changeDue);
      setCheckoutSuccessOpen(true);

      // Reset state
      setCart([]);
      setCashReceived("");
    } catch (err: any) {
      setSnack({
        open: true,
        msg: `เกิดข้อผิดพลาด: ${err.message || err}`,
        severity: "error"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          color: "white",
          px: 3, py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: "0 4px 15px rgba(22,163,74,0.15)"
        }}
      >
        <IconButton onClick={() => router.push("/")} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>🛒 ร้านค้าโชห่วย (POS Checkout)</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
            ระบบเครื่องบันทึกการขายพร้อมสแกนบาร์โค้ด
          </Typography>
        </Box>
        {loading && <CircularProgress size={28} sx={{ color: "white" }} />}
      </Box>

      {/* Main Grid Workspace */}
      <Grid container spacing={3} sx={{ p: 3, flex: 1, overflow: "hidden" }}>
        {/* Left Side: Scanner & Cart List */}
        <Grid size={{ xs: 12, md: 7 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Scanner/Search Card */}
          <Card sx={{ p: 2.5, borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                placeholder="สแกนบาร์โค้ด หรือพิมพ์ชื่อค้นหา..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                inputRef={barcodeInputRef}
                inputProps={{
                  "data-barcode-capture": "true",
                  style: { fontSize: "1.2rem", fontWeight: 700 }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#16a34a", fontSize: "1.8rem" }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    bgcolor: "#f0fdf4"
                  }
                }}
              />
            </form>
          </Card>

          {/* Cart Card */}
          <Card sx={{ p: 3, borderRadius: "20px", flex: 1, display: "flex", flexDirection: "column", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", minHeight: "350px" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontSize: "1.3rem", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: 1 }}>
                <ShoppingCartIcon sx={{ color: "#16a34a" }} /> รายการสินค้าในตะกร้า
              </Typography>
              <Badge badgeContent={cart.reduce((sum, it) => sum + it.quantity, 0)} color="success" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Cart Items List */}
            <Box sx={{ flex: 1, overflowY: "auto", maxH: "400px", display: "flex", flexDirection: "column", gap: 1.5 }}>
              {cart.length === 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", py: 6 }}>
                  <Typography sx={{ fontSize: "4rem", mb: 1 }}>🛒</Typography>
                  <Typography sx={{ fontSize: "1.1rem", color: "#94a3b8", fontWeight: 600 }}>
                    ยังไม่มีสินค้าในตะกร้า สแกนบาร์โค้ดเพื่อเริ่มต้น
                  </Typography>
                </Box>
              ) : (
                cart.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      bgcolor: "#f8fafc",
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#16a34a", fontWeight: 700 }}>
                        ราคา ฿{item.product.selling_price} | ทุน ฿{item.product.cost_price}
                      </Typography>
                      {!item.isCustom && item.product.expiry_date && (
                        <Typography display="block" variant="caption" sx={{ color: "#ef4444", fontWeight: 600 }}>
                          📅 หมดอายุ: {item.product.expiry_date}
                        </Typography>
                      )}
                    </Box>

                    {/* Quantity Controls */}
                    <Box display="flex" alignItems="center" gap={1} sx={{ mr: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(idx, -1)}
                        sx={{ bgcolor: "#e2e8f0", color: "#475569", "&:hover": { bgcolor: "#cbd5e1" } }}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography sx={{ minWidth: 28, textAlign: "center", fontSize: "1.2rem", fontWeight: 900 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(idx, 1)}
                        sx={{ bgcolor: "#e2e8f0", color: "#475569", "&:hover": { bgcolor: "#cbd5e1" } }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Price and Delete */}
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e293b", minWidth: 70, textAlign: "right" }}>
                        ฿{((item.product.selling_price || 0) * item.quantity).toLocaleString()}
                      </Typography>
                      <IconButton onClick={() => removeFromCart(idx)} sx={{ color: "#ef4444" }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right Side: Quick Action buttons & Checkout Panel */}
        <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Quick Buttons Card */}
          <Card sx={{ p: 2.5, borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b", mb: 2 }}>⚡ ปุ่มลัดด่วน (คีย์สินค้าด่วน)</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="outlined" color="success" onClick={() => addQuickActionItem("อาหารกล่องปรุงสุก", 40, 30)} sx={{ height: 50 }}>
                  🍱 ข้าวกล่อง ฿40
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="outlined" color="success" onClick={() => addQuickActionItem("น้ำแข็งใสแก้ว/ถุง", 5, 2)} sx={{ height: 50 }}>
                  🧊 น้ำแข็ง ฿5
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button fullWidth variant="outlined" color="success" onClick={() => addQuickActionItem("ถ้วย/จาน/ช้อนซุป", 10, 6)} sx={{ height: 50 }}>
                  🍽️ ถ้วยชามช้อน ฿10
                </Button>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setCustomItemOpen(true)}
                  sx={{ height: 50, bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}
                >
                  ✏️ คีย์ราคาเอง
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Checkout Calculations Panel (Elderly Friendly) */}
          <Card sx={{ p: 3.5, borderRadius: "24px", bgcolor: "#1e293b", color: "white", boxShadow: "0 10px 30px rgba(15,23,42,0.15)" }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <CalculateIcon sx={{ color: "#22c55e", fontSize: "2rem" }} />
              <Typography sx={{ fontSize: "1.4rem", fontWeight: 900 }}>ชำระเงิน (Elderly Friendly)</Typography>
            </Box>

            {/* Total Price Display */}
            <Box sx={{ bgcolor: "#0f172a", p: 3, borderRadius: "18px", border: "2px solid #334155", mb: 3 }}>
              <Typography sx={{ color: "#94a3b8", fontSize: "1rem", fontWeight: 600 }}>ยอดรวมทั้งหมด</Typography>
              <Typography sx={{ color: "#22c55e", fontSize: "3rem", fontWeight: 900, lineHeight: 1.1 }}>
                ฿{totalPrice.toLocaleString()}
              </Typography>
              <Typography sx={{ color: "#475569", fontSize: "0.85rem", fontWeight: 600, mt: 0.5 }}>
                ยอดทุน ฿{totalCost.toLocaleString()} | กำไรสุทธิ ฿{totalProfit.toLocaleString()}
              </Typography>
            </Box>

            {/* Cash Received Field */}
            <Typography sx={{ color: "#94a3b8", fontSize: "0.95rem", fontWeight: 600, mb: 1 }}>รับเงินสดมา (บาท)</Typography>
            <Box sx={{ position: "relative", mb: 2.5 }}>
              <TextField
                fullWidth
                value={cashReceived}
                placeholder="0"
                onChange={(e) => setCashReceived(e.target.value)}
                inputProps={{
                  style: { fontSize: "2rem", fontWeight: 900, color: "#22c55e", textAlign: "right" }
                }}
                sx={{
                  bgcolor: "#0f172a",
                  borderRadius: "16px",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#334155" }
                }}
              />
            </Box>

            {/* Quick Bill Selectors */}
            <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
              {[20, 50, 100, 500, 1000].map((bill) => (
                <Button
                  key={bill}
                  size="small"
                  variant="outlined"
                  onClick={() => handleQuickCash(bill)}
                  sx={{
                    color: "white",
                    borderColor: "#475569",
                    bgcolor: "#334155",
                    fontSize: "0.9rem",
                    p: "6px 12px",
                    minWidth: "60px",
                    "&:hover": { bgcolor: "#475569" }
                  }}
                >
                  {bill}
                </Button>
              ))}
            </Box>

            {/* Numeric On-screen Keypad */}
            <Grid container spacing={1} mb={3}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00", "BACK", "CLEAR"].map((key) => {
                const isAction = key === "BACK" || key === "CLEAR";
                return (
                  <Grid size={{ xs: isAction ? 6 : 4 }} key={key}>
                    <Button
                      fullWidth
                      onClick={() => handleCashInput(key)}
                      sx={{
                        bgcolor: isAction ? "#ef444415" : "#33415550",
                        color: isAction ? "#f87171" : "#f1f5f9",
                        borderColor: isAction ? "#ef4444" : "#475569",
                        borderWidth: 1,
                        borderStyle: "solid",
                        fontSize: "1.2rem",
                        fontWeight: 900,
                        py: 1,
                        borderRadius: "12px",
                        "&:hover": { bgcolor: isAction ? "#ef444430" : "#33415590" }
                      }}
                    >
                      {key === "BACK" ? "← ลบ" : key === "CLEAR" ? "ล้าง" : key}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            {/* Change Due Display */}
            {cashNum >= totalPrice && totalPrice > 0 && (
              <Box sx={{ bgcolor: "#14532d", p: 2.5, borderRadius: "18px", border: "2px solid #22c55e", mb: 3 }}>
                <Typography sx={{ color: "#86efac", fontSize: "0.95rem", fontWeight: 700 }}>เงินทอนที่ต้องจ่าย</Typography>
                <Typography sx={{ color: "#a7f3d0", fontSize: "2.5rem", fontWeight: 900, lineHeight: 1.1 }}>
                  ฿{changeDue.toLocaleString()}
                </Typography>
              </Box>
            )}

            {/* Action Checkout button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleCheckout}
              disabled={submitting || cart.length === 0 || cashNum < totalPrice}
              sx={{
                py: 2.5,
                fontSize: "1.4rem",
                fontWeight: 900,
                borderRadius: "20px",
                bgcolor: "#22c55e",
                "&:hover": { bgcolor: "#16a34a" },
                "&:disabled": { bgcolor: "#475569", color: "#94a3b8" }
              }}
            >
              {submitting ? "กำลังทำรายการ..." : `💾 บันทึกการขาย (รวม ฿${totalPrice.toLocaleString()})`}
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog: Key Custom Price */}
      <Dialog open={customItemOpen} onClose={() => setCustomItemOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.2rem" }}>✏️ คีย์รายการสินค้าเอง</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <TextField
            label="ชื่อรายการสินค้า"
            fullWidth
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="เช่น ผักสดแปรรูป, ซอสปรุงพิเศษ"
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
          <TextField
            label="ราคาขาย (บาท)"
            fullWidth
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
          <TextField
            label="ราคาทุน (บาท - สำหรับคำนวณกำไร)"
            fullWidth
            type="number"
            value={customCost}
            onChange={(e) => setCustomCost(e.target.value)}
            placeholder="ถ้าว่างไว้ ระบบจะคำนวณ 70% ของราคาขาย"
            InputProps={{ sx: { borderRadius: "12px" } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCustomItemOpen(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={addCustomItem} sx={{ bgcolor: "#7c3aed" }}>
            ใส่ตะกร้า
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Checkout Success Screen (Elderly Friendly Modal) */}
      <Dialog
        open={checkoutSuccessOpen}
        onClose={() => {
          setCheckoutSuccessOpen(false);
          focusBarcodeInput();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "28px",
            p: 2,
            border: "5px solid #22c55e"
          }
        }}
      >
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#dcfce7",
              color: "#22c55e",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              mb: 3
            }}
          >
            ✓
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#16a34a", mb: 1 }}>
            ขายสินค้าเรียบร้อย!
          </Typography>
          <Typography sx={{ color: "#64748b", fontSize: "1.1rem", mb: 3 }}>
            ยอดซื้อทั้งหมด ฿{lastTotal.toLocaleString()}
          </Typography>

          <Box
            sx={{
              bgcolor: "#0f172a",
              color: "white",
              p: 3,
              borderRadius: "24px",
              width: "100%",
              boxShadow: "inset 0 4px 15px rgba(0,0,0,0.2)",
              mb: 3
            }}
          >
            <Typography sx={{ color: "#a7f3d0", fontSize: "1.5rem", fontWeight: 700, mb: 1 }}>
              💵 เงินทอนลูกค้า:
            </Typography>
            <Typography sx={{ color: "#22c55e", fontSize: "4.5rem", fontWeight: 950, lineHeight: 1 }}>
              ฿{lastChange.toLocaleString()}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="success"
            size="large"
            fullWidth
            onClick={() => {
              setCheckoutSuccessOpen(false);
              focusBarcodeInput();
            }}
            sx={{
              py: 2,
              fontSize: "1.3rem",
              borderRadius: "18px",
              boxShadow: "0 6px 20px rgba(34,197,94,0.3)"
            }}
          >
            เสร็จสิ้น (ทำรายการถัดไป)
          </Button>
        </DialogContent>
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
