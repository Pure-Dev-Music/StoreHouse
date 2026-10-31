"use client";

import { useState } from "react";
import { Box, Typography, Card, Avatar, Grid, Button } from "@mui/material";
import { useRouter } from "@/i18n/routing";
import { useLiff } from "@/contexts/LiffContext";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import InsightsIcon from "@mui/icons-material/Insights";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";

export default function HomePage() {
  const router = useRouter();
  const { profile } = useLiff();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc", pb: 6 }}>
      {/* Top Banner Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          px: 3, pt: 6, pb: 4,
          borderRadius: "0 0 32px 32px",
          boxShadow: "0 8px 30px rgba(15,23,42,0.15)",
          color: "white"
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {profile?.pictureUrl ? (
            <Avatar src={profile.pictureUrl} alt={profile.displayName} sx={{ width: 56, height: 56, border: "3px solid rgba(255,255,255,0.8)" }} />
          ) : (
            <Avatar sx={{ width: 56, height: 56, bgcolor: "rgba(255,255,255,0.2)", fontSize: "1.4rem" }}>👤</Avatar>
          )}
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>ยินดีต้อนรับ</Typography>
            <Typography sx={{ fontSize: "1.35rem", fontWeight: 900 }}>
              {profile?.displayName || "คุณแม่ / ทีมงานครอบครัว"}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: "-0.5px" }}>
          🏢 StoreHouse
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
          ระบบจัดการ 3 ธุรกิจครอบครัวแบบครบวงจร
        </Typography>
      </Box>

      {/* 3 Business Modules Container */}
      <Box sx={{ px: 3, mt: 4, display: "flex", flexDirection: "column", gap: 4 }}>
        
        {/* Stream 1: Grocery & Retail */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <StorefrontIcon sx={{ color: "#16a34a" }} /> 1. ร้านค้าโชห่วย (Grocery Shop)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ActionCard
                emoji="🛒"
                icon={<PointOfSaleIcon sx={{ fontSize: 36 }} />}
                title="POS ขายของ"
                subtitle="สแกนบาร์โค้ด & คิดเงินทอนด่วน"
                color1="#16a34a"
                color2="#22c55e"
                shadow="rgba(22,163,74,0.15)"
                onClick={() => router.push("/pos")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ActionCard
                emoji="📦"
                icon={<InventoryIcon sx={{ fontSize: 36 }} />}
                title="คลังสินค้าสต๊อก"
                subtitle="ต้นทุน-กำไร & แจ้งเตือนหมดอายุ"
                color1="#1d4ed8"
                color2="#3b82f6"
                shadow="rgba(29,78,216,0.15)"
                onClick={() => router.push("/products")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <ActionCard
                emoji="📊"
                icon={<InsightsIcon sx={{ fontSize: 36 }} />}
                title="สรุปยอดขาย & กำไร"
                subtitle="ดูประวัติบิลและกำไรสุทธิ"
                color1="#0f172a"
                color2="#334155"
                shadow="rgba(15,23,42,0.15)"
                onClick={() => router.push("/sales")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Stream 2: Room Rental */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <MeetingRoomIcon sx={{ color: "#7c3aed" }} /> 2. บ้านเช่า/ห้องเช่า (11 ยูนิต)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ActionCard
                emoji="🏠"
                icon={<MeetingRoomIcon sx={{ fontSize: 36 }} />}
                title="จัดการห้องพัก & บ้านเช่า (11 ยูนิต)"
                subtitle="10 ห้องพัก + 1 บ้านเช่า | จดมิเตอร์ไฟ, ค่าน้ำเหมาจ่าย & ซิงค์กับ LINE OA"
                color1="#7c3aed"
                color2="#8b5cf6"
                shadow="rgba(124,58,237,0.15)"
                onClick={() => router.push("/rooms")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Stream 3: Parking Rental */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#1e293b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <DirectionsCarIcon sx={{ color: "#0891b2" }} /> 3. ที่จอดรถให้เช่า (Parking Slots)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <ActionCard
                emoji="🚗"
                icon={<DirectionsCarIcon sx={{ fontSize: 36 }} />}
                title="ตารางกริดที่จอดรถ (8 ช่อง)"
                subtitle="บันทึกเลขทะเบียนรถ, ชื่อเจ้าของ และเก็บเงินค่าเช่าช่องจอดรายเดือน"
                color1="#0891b2"
                color2="#06b6d4"
                shadow="rgba(8,145,178,0.15)"
                onClick={() => router.push("/parking")}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Section: Classic Tools Fallback */}
        <Box sx={{ mt: 2, pt: 3, borderTop: "1px dashed #cbd5e1" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#64748b", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsSuggestIcon fontSize="small" /> 🛠️ เครื่องมือคลังสินค้า/จดมิตเตอร์เดิม (Classic System)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push("/receive")}
                sx={{ py: 1.5, fontSize: "0.9rem", color: "#64748b", borderColor: "#cbd5e1" }}
              >
                📥 รับของเข้า (เดิม)
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push("/withdraw")}
                sx={{ py: 1.5, fontSize: "0.9rem", color: "#64748b", borderColor: "#cbd5e1" }}
              >
                📤 เบิกของออก (เดิม)
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push("/stock")}
                sx={{ py: 1.5, fontSize: "0.9rem", color: "#64748b", borderColor: "#cbd5e1" }}
              >
                📦 ดูสต๊อกเดิม
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => router.push("/rental/electricity")}
                sx={{ py: 1.5, fontSize: "0.9rem", color: "#64748b", borderColor: "#cbd5e1" }}
              >
                ⚡ จดมิตเตอร์ไฟ (เดิม)
              </Button>
            </Grid>
          </Grid>
        </Box>

      </Box>
    </Box>
  );
}

function ActionCard({
  emoji,
  icon,
  title,
  subtitle,
  color1,
  color2,
  shadow,
  onClick
}: {
  emoji: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color1: string;
  color2: string;
  shadow: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        borderRadius: "22px",
        p: 3,
        cursor: "pointer",
        boxShadow: `0 8px 24px ${shadow}`,
        color: "white",
        transition: "transform 0.15s, box-shadow 0.15s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 12px 30px ${shadow}`
        },
        "&:active": {
          transform: "scale(0.98)"
        },
        display: "flex",
        alignItems: "center",
        gap: 2.5
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          bgcolor: "rgba(255,255,255,0.2)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", mt: 0.5, fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </Box>
    </Card>
  );
}
