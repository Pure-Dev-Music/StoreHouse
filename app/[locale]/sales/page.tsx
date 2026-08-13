"use client";

import { useState, useEffect } from "react";
import {
  Box, Typography, Card, CircularProgress, IconButton,
  Divider, Grid, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TimelineIcon from "@mui/icons-material/Timeline";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { useRouter } from "@/i18n/routing";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type SaleWithItems = {
  id: string;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  created_at: string;
  sale_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    unit_cost: number;
    products: {
      name: string;
    } | null;
  }>;
};

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    // Fetch sales and join with sale_items and products
    const { data, error } = await supabase
      .from("sales")
      .select(`
        id, total_amount, total_cost, total_profit, created_at,
        sale_items(
          id, quantity, unit_price, unit_cost,
          products(name)
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSales(data as any[]);
    }
    setLoading(false);
  };

  // Aggregated calculations
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalSalesCost = sales.reduce((sum, s) => sum + s.total_cost, 0);
  const totalSalesProfit = sales.reduce((sum, s) => sum + s.total_profit, 0);
  const averageProfitMargin = totalSalesRevenue > 0 ? (totalSalesProfit / totalSalesRevenue) * 100 : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 5 }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "white",
          px: 3, pt: 4, pb: 3,
          borderRadius: "0 0 28px 28px",
          boxShadow: "0 4px 20px rgba(15,23,42,0.15)"
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => router.push("/")} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>📊 สรุปยอดขาย & กำไร</Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
              ตรวจสอบกำไรสุทธิ และยอดขายของร้านค้าโชห่วย
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Container */}
      <Box sx={{ px: 3, mt: 3 }}>
        {/* KPI Summaries */}
        <Grid container spacing={2.5} mb={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3, borderRadius: "20px", display: "flex", alignItems: "center", gap: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justify: "center", fontSize: "1.5rem", flexShrink: 0, justifyContent: "center" }}>
                <LocalAtmIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>ยอดขายสะสม</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#1e293b" }}>
                  ฿{totalSalesRevenue.toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3, borderRadius: "20px", display: "flex", alignItems: "center", gap: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#fee2e2", color: "#ef4444", display: "flex", alignItems: "center", justify: "center", fontSize: "1.5rem", flexShrink: 0, justifyContent: "center" }}>
                <TrendingUpIcon style={{ transform: "rotate(180deg)" }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>ต้นทุนสินค้า</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#1e293b" }}>
                  ฿{totalSalesCost.toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3, borderRadius: "20px", display: "flex", alignItems: "center", gap: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justify: "center", fontSize: "1.5rem", flexShrink: 0, justifyContent: "center" }}>
                <TrendingUpIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>กำไรสุทธิ</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0284c7" }}>
                  ฿{totalSalesProfit.toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3, borderRadius: "20px", display: "flex", alignItems: "center", gap: 2, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <Box sx={{ width: 48, height: 48, borderRadius: "14px", bgcolor: "#ffedd5", color: "#f97316", display: "flex", alignItems: "center", justify: "center", fontSize: "1.5rem", flexShrink: 0, justifyContent: "center" }}>
                <TimelineIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>อัตรากำไรเฉลี่ย</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#f97316" }}>
                  {averageProfitMargin.toFixed(1)}%
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Sales List */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#334155", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <DateRangeIcon sx={{ color: "#3b82f6" }} /> รายการบิลขายล่าสุด
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress />
          </Box>
        ) : sales.length === 0 ? (
          <Card sx={{ p: 5, textAlign: "center", borderRadius: "20px", border: "2px dashed #cbd5e1" }}>
            <Typography sx={{ fontSize: "3rem", mb: 1 }}>💵</Typography>
            <Typography sx={{ color: "#64748b", fontWeight: 600 }}>ยังไม่มีบันทึกยอดขายในประวัติ</Typography>
          </Card>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {sales.map((sale) => (
              <Accordion
                key={sale.id}
                sx={{
                  borderRadius: "16px !important",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
                  border: "1px solid #e2e8f0",
                  "&:before": { display: "none" }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" pr={2} flexWrap="wrap" gap={2}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1.05rem" }}>
                        บิลขาย #{sale.id.slice(0, 8).toUpperCase()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        🕒 {format(new Date(sale.created_at), "d MMMM yyyy HH:mm น.", { locale: th })}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={3} alignItems="center">
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>ยอดซื้อรวม</Typography>
                        <Typography sx={{ fontWeight: 900, color: "#16a34a", fontSize: "1.15rem" }}>
                          ฿{sale.total_amount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "#94a3b8", display: "block" }}>กำไร</Typography>
                        <Typography sx={{ fontWeight: 900, color: "#0284c7", fontSize: "1.15rem" }}>
                          ฿{sale.total_profit.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ bgcolor: "#f8fafc", borderRadius: "0 0 16px 16px", p: 3 }}>
                  <Typography sx={{ fontWeight: 700, color: "#475569", mb: 1.5 }}>รายละเอียดสินค้าที่ขาย:</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {sale.sale_items.map((item) => (
                      <Box
                        key={item.id}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ py: 1, borderBottom: "1px dashed #cbd5e1" }}
                      >
                        <Typography sx={{ fontWeight: 600, color: "#334155" }}>
                          {item.products?.name || "สินค้าคีย์ราคาด่วน"} (x{item.quantity})
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#1e293b" }}>
                          ฿{((item.unit_price || 0) * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
