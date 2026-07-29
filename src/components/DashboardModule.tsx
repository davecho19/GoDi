import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Award,
  Search,
  Sparkles,
  Layers,
  Table,
  Zap,
  Clock,
  Building2,
  ShieldCheck,
  Calculator,
  FileCheck,
  Flame
} from "lucide-react";

// Types
export interface SaleTransaction {
  asesor: string;
  fecha: string; // YYYY-MM-DD
  ruc: string;
  nombre: string;
  tipo: string;
  producto: string;
  plan: string;
  adicionales: string;
  valorPlan: number;
  valorAdicional: number;
  descuento: number;
  total: number;
  totalSinIva: number;
  mes: string;
}

// Initial offline fallback transactions if Google Sheets is offline or loading
const INITIAL_OFFLINE_SALES: SaleTransaction[] = [
  // UpConta Sales
  { asesor: "Evelyn Narváez", fecha: "2026-07-28", ruc: "1792345678001", nombre: "CORPORACION TEXTIL ECUADOR", tipo: "EMP", producto: "Planes ERP Contable", plan: "ERP PLUS", adicionales: "", valorPlan: 600, valorAdicional: 0, descuento: 0, total: 690.00, totalSinIva: 600.00, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-24", ruc: "1712345678001", nombre: "COMERCIALIZADORA LOS ANDES", tipo: "EMP", producto: "Planes ERP Contable", plan: "ERP START", adicionales: "", valorPlan: 411.76, valorAdicional: 0, descuento: 0, total: 473.52, totalSinIva: 411.76, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-21", ruc: "1723456789001", nombre: "DISTRIBUIDORA FARMACEUTICA", tipo: "EMP", producto: "Planes ERP Contable", plan: "ERP PREMIUN", adicionales: "", valorPlan: 958.82, valorAdicional: 0, descuento: 0, total: 1102.64, totalSinIva: 958.82, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-16", ruc: "1734567890001", nombre: "IMPORTADORA GLOBAL PACIFICO", tipo: "EMP", producto: "Planes Facturación", plan: "UP POWER", adicionales: "", valorPlan: 362.00, valorAdicional: 0, descuento: 0, total: 416.30, totalSinIva: 362.00, mes: "July 2026" },
  
  { asesor: "Salomé Estrella", fecha: "2026-07-27", ruc: "1745678901001", nombre: "CONSULTORA CONTABLE ESTRELLA", tipo: "NAT", producto: "Plan Contador", plan: "CONTADOR 6 EMPRESA", adicionales: "", valorPlan: 150, valorAdicional: 0, descuento: 0, total: 172.50, totalSinIva: 150.00, mes: "July 2026" },
  { asesor: "Salomé Estrella", fecha: "2026-07-18", ruc: "1756789012001", nombre: "AUDITORES Y ASESORES TAX", tipo: "NAT", producto: "Plan Contador", plan: "TAX ILIMITADOS", adicionales: "", valorPlan: 100, valorAdicional: 0, descuento: 0, total: 115.00, totalSinIva: 100.00, mes: "July 2026" },
  { asesor: "Salomé Estrella", fecha: "2026-07-11", ruc: "1767890123001", nombre: "ESTUDIO CONTABLE INTEGRAL", tipo: "NAT", producto: "Plan Contador", plan: "CONTADOR ILIMITADO", adicionales: "", valorPlan: 300, valorAdicional: 0, descuento: 0, total: 345.00, totalSinIva: 300.00, mes: "July 2026" },
  { asesor: "Salomé Estrella", fecha: "2026-07-08", ruc: "1778901234001", nombre: "FERRETERIA LA CENTRAL", tipo: "EMP", producto: "Planes Facturación", plan: "UP POWER", adicionales: "", valorPlan: 571.72, valorAdicional: 0, descuento: 0, total: 657.48, totalSinIva: 571.72, mes: "July 2026" },

  { asesor: "Ismenia Escalona", fecha: "2026-07-25", ruc: "1789012345001", nombre: "CLINICA DENTAL ZAMBRANO", tipo: "EMP", producto: "Planes Facturación", plan: "UP BASE", adicionales: "", valorPlan: 290.74, valorAdicional: 0, descuento: 0, total: 334.35, totalSinIva: 290.74, mes: "July 2026" },
  { asesor: "Ismenia Escalona", fecha: "2026-07-15", ruc: "1790123456001", nombre: "LOGISTICA EXPRESS EC", tipo: "EMP", producto: "Planes ERP Contable", plan: "ERP START", adicionales: "", valorPlan: 233.78, valorAdicional: 0, descuento: 0, total: 268.85, totalSinIva: 233.78, mes: "July 2026" },
  { asesor: "Ismenia Escalona", fecha: "2026-07-05", ruc: "1701234567001", nombre: "ESTUDIO JURIDICO ESCALONA", tipo: "NAT", producto: "Plan Contador", plan: "CONTADOR 3 EMPRESA", adicionales: "", valorPlan: 200, valorAdicional: 0, descuento: 0, total: 230.00, totalSinIva: 200.00, mes: "July 2026" },

  { asesor: "Karla Haro", fecha: "2026-07-26", ruc: "1711223344001", nombre: "SUPERMERCADO VECINO", tipo: "EMP", producto: "Planes ERP Contable", plan: "ERP PLUS", adicionales: "", valorPlan: 776.61, valorAdicional: 0, descuento: 0, total: 893.10, totalSinIva: 776.61, mes: "July 2026" },
  { asesor: "Karla Haro", fecha: "2026-07-14", ruc: "1722334455001", nombre: "INGENIERIA Y CONSTRUCCION", tipo: "EMP", producto: "Planes Facturación", plan: "UP BASE", adicionales: "", valorPlan: 186.00, valorAdicional: 0, descuento: 0, total: 213.90, totalSinIva: 186.00, mes: "July 2026" },
  { asesor: "Karla Haro", fecha: "2026-07-06", ruc: "1733445566001", nombre: "DESPACHO CONTABLE HARO", tipo: "NAT", producto: "Plan Contador", plan: "CONTADOR 1 EMPRESA", adicionales: "", valorPlan: 75.00, valorAdicional: 0, descuento: 0, total: 86.25, totalSinIva: 75.00, mes: "July 2026" },

  { asesor: "David Santander", fecha: "2026-07-22", ruc: "1744556677001", nombre: "SANTANDER ASESORES CONTABLES", tipo: "NAT", producto: "Plan Contador", plan: "CONTADOR 10 EMPRESA", adicionales: "", valorPlan: 465.00, valorAdicional: 0, descuento: 0, total: 534.75, totalSinIva: 465.00, mes: "July 2026" },
  { asesor: "David Santander", fecha: "2026-07-12", ruc: "1755667788001", nombre: "MECANICA INDUSTRIAL QUITO", tipo: "EMP", producto: "Planes Facturación", plan: "UP LIGHT", adicionales: "", valorPlan: 240.00, valorAdicional: 0, descuento: 0, total: 276.00, totalSinIva: 240.00, mes: "July 2026" },

  // Firmas Sales
  { asesor: "Evelyn Narváez", fecha: "2026-07-28", ruc: "1719876543", nombre: "MARIA ELENA CHAVEZ", tipo: "NAT", producto: "Firma Natural", plan: "5 AÑOS", adicionales: "", valorPlan: 55.41, valorAdicional: 0, descuento: 0, total: 55.41, totalSinIva: 55.41, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-27", ruc: "1718765432", nombre: "CARLOS ALBERTO PAEZ", tipo: "NAT", producto: "Firma Natural", plan: "3 AÑOS", adicionales: "", valorPlan: 33.28, valorAdicional: 0, descuento: 0, total: 33.28, totalSinIva: 33.28, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-23", ruc: "1717654321001", nombre: "INMOBILIARIA DEL VALLE SA", tipo: "JUR", producto: "Firma Jurídica", plan: "2 AÑOS", adicionales: "", valorPlan: 288.64, valorAdicional: 0, descuento: 0, total: 288.64, totalSinIva: 288.64, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-19", ruc: "1716543210", nombre: "GABRIELA ANDRADE RUC", tipo: "RUC", producto: "Firma Natural con RUC", plan: "4 AÑOS", adicionales: "", valorPlan: 111.23, valorAdicional: 0, descuento: 0, total: 111.23, totalSinIva: 111.23, mes: "July 2026" },
  { asesor: "Evelyn Narváez", fecha: "2026-07-09", ruc: "1715432109", nombre: "PROMO EMPRENDE DANIEL", tipo: "PROMO", producto: "Promo Emprende", plan: "2 AÑOS", adicionales: "", valorPlan: 78.27, valorAdicional: 0, descuento: 0, total: 78.27, totalSinIva: 78.27, mes: "July 2026" },

  { asesor: "Ismenia Escalona", fecha: "2026-07-26", ruc: "1729876543", nombre: "PATRICIA MENDOZA", tipo: "NAT", producto: "Firma Natural", plan: "5 AÑOS", adicionales: "", valorPlan: 1919.94, valorAdicional: 0, descuento: 0, total: 1919.94, totalSinIva: 1919.94, mes: "July 2026" },
  { asesor: "Ismenia Escalona", fecha: "2026-07-20", ruc: "1728765432", nombre: "LUIS GONZALEZ RUC", tipo: "RUC", producto: "Firma Natural con RUC", plan: "3 AÑOS", adicionales: "", valorPlan: 1232.68, valorAdicional: 0, descuento: 0, total: 1232.68, totalSinIva: 1232.68, mes: "July 2026" },
  { asesor: "Ismenia Escalona", fecha: "2026-07-13", ruc: "1727654321001", nombre: "CONSTRUCTORA PACIFICO CIA", tipo: "JUR", producto: "Firma Jurídica", plan: "1 AÑO", adicionales: "", valorPlan: 149.52, valorAdicional: 0, descuento: 0, total: 149.52, totalSinIva: 149.52, mes: "July 2026" },

  { asesor: "Salomé Estrella", fecha: "2026-07-24", ruc: "1739876543", nombre: "ROBERTO VITERI", tipo: "NAT", producto: "Firma Natural", plan: "2 AÑOS", adicionales: "", valorPlan: 1100.23, valorAdicional: 0, descuento: 0, total: 1100.23, totalSinIva: 1100.23, mes: "July 2026" },
  { asesor: "Salomé Estrella", fecha: "2026-07-17", ruc: "1738765432", nombre: "ANDRES VILLACIS RUC", tipo: "RUC", producto: "Firma Natural con RUC", plan: "1 AÑO", adicionales: "", valorPlan: 467.89, valorAdicional: 0, descuento: 0, total: 467.89, totalSinIva: 467.89, mes: "July 2026" },
  { asesor: "Salomé Estrella", fecha: "2026-07-10", ruc: "1737654321", nombre: "PROMO EMPRENDE SOFIA", tipo: "PROMO", producto: "Promo Emprende", plan: "3 AÑOS", adicionales: "", valorPlan: 120.01, valorAdicional: 0, descuento: 0, total: 120.01, totalSinIva: 120.01, mes: "July 2026" },
  { asesor: "Salomé Estrella", fecha: "2026-07-04", ruc: "1736543210001", nombre: "AGENCIA DE SEGUROS ESTRELLA", tipo: "JUR", producto: "Firma Jurídica", plan: "1 AÑO", adicionales: "", valorPlan: 87.26, valorAdicional: 0, descuento: 0, total: 87.26, totalSinIva: 87.26, mes: "July 2026" },

  { asesor: "Karla Haro", fecha: "2026-07-25", ruc: "1749876543", nombre: "VERONICA SUAREZ", tipo: "NAT", producto: "Firma Natural", plan: "3 AÑOS", adicionales: "", valorPlan: 1449.24, valorAdicional: 0, descuento: 0, total: 1449.24, totalSinIva: 1449.24, mes: "July 2026" },
  { asesor: "Karla Haro", fecha: "2026-07-16", ruc: "1748765432", nombre: "DIEGO TORRES RUC", tipo: "RUC", producto: "Firma Natural con RUC", plan: "2 AÑOS", adicionales: "", valorPlan: 497.88, valorAdicional: 0, descuento: 0, total: 497.88, totalSinIva: 497.88, mes: "July 2026" },
  { asesor: "Karla Haro", fecha: "2026-07-07", ruc: "1747654321", nombre: "PROMO EMPRENDE HARO", tipo: "PROMO", producto: "Promo Emprende", plan: "1 AÑO", adicionales: "", valorPlan: 99.14, valorAdicional: 0, descuento: 0, total: 99.14, totalSinIva: 99.14, mes: "July 2026" },
  { asesor: "Karla Haro", fecha: "2026-07-02", ruc: "1746543210001", nombre: "TRANSPORTES HARO CIA", tipo: "JUR", producto: "Firma Jurídica", plan: "1 AÑO", adicionales: "", valorPlan: 40.00, valorAdicional: 0, descuento: 0, total: 40.00, totalSinIva: 40.00, mes: "July 2026" },

  { asesor: "David Santander", fecha: "2026-07-14", ruc: "1759876543", nombre: "GEOVANNY MORENO RUC", tipo: "RUC", producto: "Firma Natural con RUC", plan: "1 AÑO", adicionales: "", valorPlan: 28.94, valorAdicional: 0, descuento: 0, total: 28.94, totalSinIva: 28.94, mes: "July 2026" }
];

const COLORS = ["#0B2545", "#F97316", "#10B981", "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6"];

function normalizeDateString(dateStr: string): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  if (/^\d{4}[\/\.]\d{1,2}[\/\.]\d{1,2}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\.]/);
    return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  }

  if (/^\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\.-]/);
    const d = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }

  return trimmed;
}

// Helper function to calculate month-isolated Friday-to-Thursday week info
function getFridayToThursdayWeek(dateStr: string) {
  if (!dateStr) return { weekNumber: 1, label: "Semana 1", isoStart: "", isoEnd: "" };
  
  const norm = normalizeDateString(dateStr);
  const parts = norm.split("-");
  if (parts.length !== 3) return { weekNumber: 1, label: "Semana 1", isoStart: "", isoEnd: "" };

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { weekNumber: 1, label: "Semana 1", isoStart: "", isoEnd: "" };
  }

  const firstOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstOfMonth.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  let firstFridayDay = 1;
  if (firstDayOfWeek === 5) {
    firstFridayDay = 1;
  } else if (firstDayOfWeek < 5) {
    firstFridayDay = 1 + (5 - firstDayOfWeek);
  } else {
    firstFridayDay = 1 + (5 + 7 - firstDayOfWeek);
  }

  let weekNum = 1;
  if (firstFridayDay === 1) {
    weekNum = 1 + Math.floor((day - 1) / 7);
  } else {
    if (day < firstFridayDay) {
      weekNum = 1;
    } else {
      const daysFromFirstFriday = day - firstFridayDay;
      weekNum = 2 + Math.floor(daysFromFirstFriday / 7);
    }
  }

  if (weekNum > 5) weekNum = 5;

  return {
    weekNumber: weekNum,
    label: `Semana ${weekNum}`,
    isoStart: norm,
    isoEnd: norm
  };
}

function getWeekRangesForMonth(selectedMonthStr: string) {
  let year = 2026;
  let month = 7;

  const mLower = (selectedMonthStr || "").toLowerCase();
  if (mLower.includes("june") || mLower.includes("junio")) month = 6;
  else if (mLower.includes("may") || mLower.includes("mayo")) month = 5;
  else if (mLower.includes("april") || mLower.includes("abril")) month = 4;
  else if (mLower.includes("march") || mLower.includes("marzo")) month = 3;
  else if (mLower.includes("february") || mLower.includes("febrero")) month = 2;
  else if (mLower.includes("january") || mLower.includes("enero")) month = 1;
  else if (mLower.includes("august") || mLower.includes("agosto")) month = 8;
  else if (mLower.includes("september") || mLower.includes("septiembre")) month = 9;
  else if (mLower.includes("october") || mLower.includes("octubre")) month = 10;
  else if (mLower.includes("november") || mLower.includes("noviembre")) month = 11;
  else if (mLower.includes("december") || mLower.includes("diciembre")) month = 12;

  const yrMatch = selectedMonthStr.match(/\d{4}/);
  if (yrMatch) year = parseInt(yrMatch[0], 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstOfMonth.getDay();

  let firstFridayDay = 1;
  if (firstDayOfWeek === 5) {
    firstFridayDay = 1;
  } else if (firstDayOfWeek < 5) {
    firstFridayDay = 1 + (5 - firstDayOfWeek);
  } else {
    firstFridayDay = 1 + (5 + 7 - firstDayOfWeek);
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  const mPad = pad(month);

  const ranges: { weekNum: number; label: string }[] = [];

  if (firstFridayDay === 1) {
    for (let w = 1; w <= 5; w++) {
      const start = 1 + (w - 1) * 7;
      if (start > daysInMonth) break;
      const end = Math.min(start + 6, daysInMonth);
      ranges.push({
        weekNum: w,
        label: `Semana ${w} (${pad(start)}/${mPad} al ${pad(end)}/${mPad})`
      });
    }
  } else {
    ranges.push({
      weekNum: 1,
      label: `Semana 1 (01/${mPad} al ${pad(firstFridayDay - 1)}/${mPad})`
    });

    for (let w = 2; w <= 5; w++) {
      const start = firstFridayDay + (w - 2) * 7;
      if (start > daysInMonth) break;
      const end = w === 5 ? daysInMonth : Math.min(start + 6, daysInMonth);
      ranges.push({
        weekNum: w,
        label: `Semana ${w} (${pad(start)}/${mPad} al ${pad(end)}/${mPad})`
      });
    }
  }

  return ranges;
}

const CustomBarTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0B2545] text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl space-y-2 text-xs font-sans z-50">
        <p className="font-black text-sm text-white border-b border-slate-700/80 pb-1.5 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] bg-orange-500/30 text-orange-300 font-extrabold px-2 py-0.5 rounded-full">
            Asesor
          </span>
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            let labelColor = "#38BDF8"; // Bright Sky Blue for UpConta
            if (entry.dataKey === "firmas") labelColor = "#FACC15"; // Bright Yellow for Firmas
            if (entry.dataKey === "cantidad") labelColor = "#FB923C"; // Bright Orange for Cantidad

            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-6 font-bold py-0.5">
                <span className="flex items-center gap-1.5" style={{ color: labelColor }}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: labelColor }}></span>
                  {entry.name}:
                </span>
                <span className="text-white font-black text-xs">
                  {entry.dataKey === "cantidad" ? `${entry.value} ventas` : formatCurrency ? formatCurrency(Number(entry.value)) : `$${entry.value}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardModule() {
  const [sales, setSales] = useState<SaleTransaction[]>(INITIAL_OFFLINE_SALES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("En vivo");
  const [syncStatus, setSyncStatus] = useState<"success" | "error" | "loading">("success");

  // Filters State
  const [timeFilter, setTimeFilter] = useState<"total" | "mes" | "mes_anterior" | "ano" | "semana" | "rango">("mes");
  const [selectedMonth, setSelectedMonth] = useState<string>("July 2026");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedAdviser, setSelectedAdviser] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all"); // "all" | "upconta" | "firmas"
  const [startDate, setStartDate] = useState<string>("2026-07-01");
  const [endDate, setEndDate] = useState<string>("2026-07-31");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sub tab view inside dashboard
  const [activeViewTab, setActiveViewTab] = useState<"overview" | "producto" | "comisiones" | "detalle">("overview");

  // Dynamic week ranges for selected month
  const dynamicWeekRanges = useMemo(() => {
    return getWeekRangesForMonth(selectedMonth);
  }, [selectedMonth]);

  // Fetch Google Sheets Data
  const fetchGoogleSheetData = async () => {
    setIsLoading(true);
    setSyncStatus("loading");
    try {
      // Primary export requesting up to row 1000 explicitly
      const primaryUrl = "https://docs.google.com/spreadsheets/d/1TGbabvY1HWd4kmNCQYRPWE75z-50rn7D5JQxZfyZEHA/export?format=csv&gid=0&range=A1:Z1000";
      let res0 = await fetch(primaryUrl);
      if (!res0.ok) {
        res0 = await fetch("https://docs.google.com/spreadsheets/d/1TGbabvY1HWd4kmNCQYRPWE75z-50rn7D5JQxZfyZEHA/export?format=csv&gid=0");
      }
      if (!res0.ok) throw new Error("Error al descargar transacciones de Google Sheets");
      const text0 = await res0.text();
      
      const parsedSales = parseSalesCSV(text0);
      if (parsedSales.length > 0) {
        setSales(parsedSales.slice(0, 1000));
        setSyncStatus("success");
      } else {
        throw new Error("Formato de CSV no reconocido");
      }
    } catch (error) {
      console.warn("Using offline dataset due to Google Sheets sync error:", error);
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }
  };

  useEffect(() => {
    fetchGoogleSheetData();
  }, []);

  // CSV Parser (up to 1000 records)
  const parseSalesCSV = (csvText: string): SaleTransaction[] => {
    const lines = csvText.split("\n");
    const result: SaleTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (result.length >= 1000) break;
      const line = lines[i].trim();
      if (!line) continue;

      const cols: string[] = [];
      let inQuotes = false;
      let current = "";

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim().replace(/^"/, "").replace(/"$/, ""));
          current = "";
        } else {
          current += char;
        }
      }
      cols.push(current.trim().replace(/^"/, "").replace(/"$/, ""));

      if (cols.length >= 12 && cols[0] && cols[0].toUpperCase() !== "ASESOR") {
        const asesor = cols[0];
        const fecha = normalizeDateString(cols[1] || "");
        const ruc = cols[2] || "";
        const nombre = cols[3] || "";
        const tipo = cols[4] || "";
        const producto = cols[5] || "";
        const plan = cols[6] || "";
        const adicionales = cols[7] || "";
        const valorPlan = parseFloat((cols[8] || "0").replace(/\$/g, "").replace(/,/g, "")) || 0;
        const valorAdicional = parseFloat((cols[9] || "0").replace(/\$/g, "").replace(/,/g, "")) || 0;
        const descuento = parseFloat((cols[10] || "0").replace(/\$/g, "").replace(/,/g, "")) || 0;
        const total = parseFloat((cols[11] || "0").replace(/\$/g, "").replace(/,/g, "")) || 0;
        const totalSinIva = parseFloat((cols[12] || "0").replace(/\$/g, "").replace(/,/g, "")) || (total > 0 ? total / 1.15 : 0);
        const mes = cols[13] || getMonthFromDate(fecha);

        result.push({
          asesor,
          fecha,
          ruc,
          nombre,
          tipo,
          producto,
          plan,
          adicionales,
          valorPlan,
          valorAdicional,
          descuento,
          total,
          totalSinIva,
          mes
        });
      }
    }
    return result;
  };

  const getMonthFromDate = (dateStr: string) => {
    const norm = normalizeDateString(dateStr);
    if (!norm) return "Desconocido";
    const parts = norm.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      if (monthNum >= 1 && monthNum <= 12) {
        return `${months[monthNum - 1]} ${year}`;
      }
    }
    return "Desconocido";
  };

  // Helper check for UpConta vs Firmas sale line
  const isUpContaSale = (item: SaleTransaction) => {
    const prod = (item.producto || "").toLowerCase();
    const plan = (item.plan || "").toLowerCase();
    return prod.includes("plan") || prod.includes("facturaci") || prod.includes("erp") || prod.includes("contador") || prod.includes("upconta") || plan.includes("erp") || plan.includes("contador");
  };

  // Available unique advisers and months
  const allAdvisers = useMemo(() => {
    const set = new Set<string>();
    sales.forEach(s => { if (s.asesor) set.add(s.asesor); });
    if (set.size === 0) {
      return ["Karla Haro", "Ismenia Escalona", "Salomé Estrella", "Evelyn Narváez", "David Santander"];
    }
    return Array.from(set);
  }, [sales]);

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    sales.forEach(s => { if (s.mes) set.add(s.mes); });
    return Array.from(set).sort();
  }, [sales]);

  // Month matching helper
  const matchMonthFilter = (item: SaleTransaction, monthFilterValue: string) => {
    if (monthFilterValue === "all" || monthFilterValue === "all_year") return true;
    
    const mLower = monthFilterValue.toLowerCase();
    const itemMesLower = (item.mes || "").toLowerCase();
    const dateStr = item.fecha || "";

    if (itemMesLower === mLower) return true;

    if (mLower.includes("july") || mLower.includes("julio")) {
      return itemMesLower.includes("july") || itemMesLower.includes("julio") || dateStr.startsWith("2026-07");
    }
    if (mLower.includes("june") || mLower.includes("junio")) {
      return itemMesLower.includes("june") || itemMesLower.includes("junio") || dateStr.startsWith("2026-06");
    }
    if (mLower.includes("may") || mLower.includes("mayo")) {
      return itemMesLower.includes("may") || itemMesLower.includes("mayo") || dateStr.startsWith("2026-05");
    }
    if (mLower.includes("april") || mLower.includes("abril")) {
      return itemMesLower.includes("april") || itemMesLower.includes("abril") || dateStr.startsWith("2026-04");
    }
    if (mLower.includes("march") || mLower.includes("marzo")) {
      return itemMesLower.includes("march") || itemMesLower.includes("marzo") || dateStr.startsWith("2026-03");
    }
    if (mLower.includes("february") || mLower.includes("febrero")) {
      return itemMesLower.includes("february") || itemMesLower.includes("febrero") || dateStr.startsWith("2026-02");
    }
    if (mLower.includes("january") || mLower.includes("enero")) {
      return itemMesLower.includes("january") || itemMesLower.includes("enero") || dateStr.startsWith("2026-01");
    }
    if (mLower.includes("august") || mLower.includes("agosto")) {
      return itemMesLower.includes("august") || itemMesLower.includes("agosto") || dateStr.startsWith("2026-08");
    }
    if (mLower.includes("september") || mLower.includes("septiembre")) {
      return itemMesLower.includes("september") || itemMesLower.includes("septiembre") || dateStr.startsWith("2026-09");
    }
    if (mLower.includes("october") || mLower.includes("octubre")) {
      return itemMesLower.includes("october") || itemMesLower.includes("octubre") || dateStr.startsWith("2026-10");
    }
    if (mLower.includes("november") || mLower.includes("noviembre")) {
      return itemMesLower.includes("november") || itemMesLower.includes("noviembre") || dateStr.startsWith("2026-11");
    }
    if (mLower.includes("december") || mLower.includes("diciembre")) {
      return itemMesLower.includes("december") || itemMesLower.includes("diciembre") || dateStr.startsWith("2026-12");
    }

    return itemMesLower.includes(mLower);
  };

  // State for 4th Comparative Month module
  const [compMonthA, setCompMonthA] = useState<string>("June 2026");
  const [compMonthB, setCompMonthB] = useState<string>("July 2026");
  const [compWeek, setCompWeek] = useState<string>("all");
  const [compCategory, setCompCategory] = useState<string>("all");

  // 1. Sales dataset strictly for CHARTS and REPORTE COMISIONES (Only affected by MES filter)
  const salesForChartsAndCommissions = useMemo(() => {
    return sales.filter(item => {
      // Adviser filter
      if (selectedAdviser !== "all" && item.asesor.toLowerCase() !== selectedAdviser.toLowerCase()) {
        return false;
      }

      // Product Line filter (UpConta vs Firmas)
      if (selectedCategory !== "all") {
        const isUp = isUpContaSale(item);
        if (selectedCategory === "upconta" && !isUp) return false;
        if (selectedCategory === "firmas" && isUp) return false;
      }

      // Must match selected Month
      if (!matchMonthFilter(item, selectedMonth)) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.nombre.toLowerCase().includes(q) ||
          item.ruc.toLowerCase().includes(q) ||
          item.asesor.toLowerCase().includes(q) ||
          item.producto.toLowerCase().includes(q) ||
          item.plan.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [sales, selectedMonth, selectedAdviser, selectedCategory, searchQuery]);

  // 2. Main Filtered Sales Logic for Scorecards, Detailed Table & Product Table
  const filteredSales = useMemo(() => {
    return salesForChartsAndCommissions.filter(item => {
      // Time Period Filter (semana or rango)
      if (timeFilter === "semana") {
        if (selectedWeek !== "all") {
          const weekNum = parseInt(selectedWeek, 10);
          const weekInfo = getFridayToThursdayWeek(item.fecha);
          if (weekInfo.weekNumber !== weekNum) return false;
        }
      } else if (timeFilter === "rango") {
        if (startDate && item.fecha < startDate) return false;
        if (endDate && item.fecha > endDate) return false;
      }

      return true;
    });
  }, [salesForChartsAndCommissions, timeFilter, selectedWeek, startDate, endDate]);

  // Sorted Sales for Detalle view & Latest Sale Callout
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => (b.fecha > a.fecha ? 1 : b.fecha < a.fecha ? -1 : 0));
  }, [filteredSales]);

  const latestSale = sortedSales.length > 0 ? sortedSales[0] : null;

  // Breakdown metrics for KPI cards (3 rows of 3 matching brand guidelines)
  const totalVentasMonto = useMemo(() => filteredSales.reduce((acc, curr) => acc + curr.totalSinIva, 0), [filteredSales]);
  const totalVentasSinIva = totalVentasMonto;
  const cantidadVentas = filteredSales.length;
  const ticketPromedio = cantidadVentas > 0 ? totalVentasMonto / cantidadVentas : 0;

  const salesUpConta = useMemo(() => filteredSales.filter(isUpContaSale), [filteredSales]);
  const salesFirmas = useMemo(() => filteredSales.filter(s => !isUpContaSale(s)), [filteredSales]);

  const totalVentasUpConta = useMemo(() => salesUpConta.reduce((acc, curr) => acc + curr.totalSinIva, 0), [salesUpConta]);
  const cantidadUpConta = salesUpConta.length;
  const ticketPromedioUpConta = cantidadUpConta > 0 ? totalVentasUpConta / cantidadUpConta : 0;

  const totalVentasFirmas = useMemo(() => salesFirmas.reduce((acc, curr) => acc + curr.totalSinIva, 0), [salesFirmas]);
  const cantidadFirmas = salesFirmas.length;
  const ticketPromedioFirmas = cantidadFirmas > 0 ? totalVentasFirmas / cantidadFirmas : 0;

  // Dynamic Commission Pool
  const valorComisionTotal = useMemo(() => {
    let totalCom = 0;
    const adviserTotals: Record<string, { upconta: number; firmas: number; total: number }> = {};

    filteredSales.forEach(s => {
      if (!adviserTotals[s.asesor]) adviserTotals[s.asesor] = { upconta: 0, firmas: 0, total: 0 };
      if (isUpContaSale(s)) {
        adviserTotals[s.asesor].upconta += s.totalSinIva;
      } else {
        adviserTotals[s.asesor].firmas += s.totalSinIva;
      }
      adviserTotals[s.asesor].total += s.totalSinIva;
    });

    Object.values(adviserTotals).forEach(adv => {
      let comm = 0;
      if (adv.total >= 5000) comm = adv.total * 0.047;
      else if (adv.total >= 4000) comm = adv.total * 0.0345;
      else if (adv.total >= 3000) comm = adv.total * 0.0035;
      totalCom += comm;
    });

    return totalCom;
  }, [filteredSales]);

  // Dynamic Chart 1: Adviser Chart (Uses salesForChartsAndCommissions)
  const adviserChartData = useMemo(() => {
    const map: Record<string, { name: string; ventas: number; cantidad: number; upconta: number; firmas: number }> = {};
    
    allAdvisers.forEach(name => {
      map[name] = { name, ventas: 0, cantidad: 0, upconta: 0, firmas: 0 };
    });

    salesForChartsAndCommissions.forEach(s => {
      if (!map[s.asesor]) {
        map[s.asesor] = { name: s.asesor, ventas: 0, cantidad: 0, upconta: 0, firmas: 0 };
      }
      map[s.asesor].ventas += s.totalSinIva;
      map[s.asesor].cantidad += 1;
      if (isUpContaSale(s)) {
        map[s.asesor].upconta += s.totalSinIva;
      } else {
        map[s.asesor].firmas += s.totalSinIva;
      }
    });

    return Object.values(map).sort((a, b) => b.ventas - a.ventas);
  }, [salesForChartsAndCommissions, allAdvisers]);

  // Dynamic Chart 2: Product Chart (Uses salesForChartsAndCommissions)
  const productChartData = useMemo(() => {
    const map: Record<string, { producto: string; linea: string; monto: number; cantidad: number }> = {};

    salesForChartsAndCommissions.forEach(s => {
      const prodName = s.producto || "Otros";
      if (!map[prodName]) {
        const isUp = isUpContaSale(s);
        map[prodName] = { producto: prodName, linea: isUp ? "UpConta" : "Firmas", monto: 0, cantidad: 0 };
      }
      map[prodName].monto += s.totalSinIva;
      map[prodName].cantidad += 1;
    });

    return Object.values(map).sort((a, b) => b.monto - a.monto);
  }, [salesForChartsAndCommissions]);

  // 3 NEW WEEKLY QUANTITY CHARTS (General, UpConta, Firmas)
  const weeklyDataGeneral = useMemo(() => {
    const weeks = [1, 2, 3, 4, 5].map(w => ({
      semana: `Semana ${w}`,
      weekNum: w,
      cantidadVentas: 0,
      cantidadProductos: 0
    }));

    salesForChartsAndCommissions.forEach(s => {
      const wInfo = getFridayToThursdayWeek(s.fecha);
      const idx = wInfo.weekNumber - 1;
      if (weeks[idx]) {
        weeks[idx].cantidadVentas += 1;
        weeks[idx].cantidadProductos += 1;
      }
    });

    return weeks;
  }, [salesForChartsAndCommissions]);

  const weeklyDataUpConta = useMemo(() => {
    const weeks = [1, 2, 3, 4, 5].map(w => ({
      semana: `Semana ${w}`,
      weekNum: w,
      cantidadVentas: 0,
      cantidadProductos: 0
    }));

    salesForChartsAndCommissions.filter(isUpContaSale).forEach(s => {
      const wInfo = getFridayToThursdayWeek(s.fecha);
      const idx = wInfo.weekNumber - 1;
      if (weeks[idx]) {
        weeks[idx].cantidadVentas += 1;
        weeks[idx].cantidadProductos += 1;
      }
    });

    return weeks;
  }, [salesForChartsAndCommissions]);

  const weeklyDataFirmas = useMemo(() => {
    const weeks = [1, 2, 3, 4, 5].map(w => ({
      semana: `Semana ${w}`,
      weekNum: w,
      cantidadVentas: 0,
      cantidadProductos: 0
    }));

    salesForChartsAndCommissions.filter(s => !isUpContaSale(s)).forEach(s => {
      const wInfo = getFridayToThursdayWeek(s.fecha);
      const idx = wInfo.weekNumber - 1;
      if (weeks[idx]) {
        weeks[idx].cantidadVentas += 1;
        weeks[idx].cantidadProductos += 1;
      }
    });

    return weeks;
  }, [salesForChartsAndCommissions]);

  // 4th COMPARATIVE MODULE BETWEEN MONTHS
  const comparativeMetrics = useMemo(() => {
    const filterFn = (item: SaleTransaction, targetMonth: string) => {
      if (!matchMonthFilter(item, targetMonth)) return false;
      if (compWeek !== "all") {
        const wInfo = getFridayToThursdayWeek(item.fecha);
        if (wInfo.weekNumber !== parseInt(compWeek, 10)) return false;
      }
      if (compCategory !== "all") {
        const isUp = isUpContaSale(item);
        if (compCategory === "upconta" && !isUp) return false;
        if (compCategory === "firmas" && isUp) return false;
      }
      return true;
    };

    const salesA = sales.filter(s => filterFn(s, compMonthA));
    const salesB = sales.filter(s => filterFn(s, compMonthB));

    const getStats = (salesList: SaleTransaction[]) => {
      const up = salesList.filter(isUpContaSale);
      const fir = salesList.filter(s => !isUpContaSale(s));
      const totalMonto = salesList.reduce((acc, curr) => acc + curr.totalSinIva, 0);
      const totalUpMonto = up.reduce((acc, curr) => acc + curr.totalSinIva, 0);
      const totalFirMonto = fir.reduce((acc, curr) => acc + curr.totalSinIva, 0);
      const qtyTotal = salesList.length;
      const qtyUp = up.length;
      const qtyFir = fir.length;
      const ticket = qtyTotal > 0 ? totalMonto / qtyTotal : 0;

      return {
        totalMonto,
        totalUpMonto,
        totalFirMonto,
        qtyTotal,
        qtyUp,
        qtyFir,
        ticket
      };
    };

    const statsA = getStats(salesA);
    const statsB = getStats(salesB);

    return {
      statsA,
      statsB,
      chartData: [
        {
          metric: "UpConta ($)",
          [compMonthA]: statsA.totalUpMonto,
          [compMonthB]: statsB.totalUpMonto
        },
        {
          metric: "Firmas.ec ($)",
          [compMonthA]: statsA.totalFirMonto,
          [compMonthB]: statsB.totalFirMonto
        },
        {
          metric: "Ventas Totales ($)",
          [compMonthA]: statsA.totalMonto,
          [compMonthB]: statsB.totalMonto
        }
      ]
    };
  }, [sales, compMonthA, compMonthB, compWeek, compCategory]);

  // Dynamic Table 1: Reporte por Producto Table (Sorted FIRMAS first, UPCONTA second)
  const dynamicReportProduct = useMemo(() => {
    const map: Record<string, { linea: "UPCONTA" | "FIRMAS"; producto: string; karlaHaro: number; ismeniaEscalona: number; salomeEstrella: number; evelynNarvaez: number; davidSantander: number; total: number }> = {};

    filteredSales.forEach(s => {
      const prodName = s.producto || "Otros";
      const isUp = isUpContaSale(s);
      const lineaStr: "UPCONTA" | "FIRMAS" = isUp ? "UPCONTA" : "FIRMAS";
      const key = `${lineaStr}_${prodName}`;

      if (!map[key]) {
        map[key] = {
          linea: lineaStr,
          producto: prodName,
          karlaHaro: 0,
          ismeniaEscalona: 0,
          salomeEstrella: 0,
          evelynNarvaez: 0,
          davidSantander: 0,
          total: 0
        };
      }

      const advClean = s.asesor.toLowerCase();
      if (advClean.includes("karla")) map[key].karlaHaro += s.totalSinIva;
      else if (advClean.includes("ismenia")) map[key].ismeniaEscalona += s.totalSinIva;
      else if (advClean.includes("salom")) map[key].salomeEstrella += s.totalSinIva;
      else if (advClean.includes("evelyn")) map[key].evelynNarvaez += s.totalSinIva;
      else if (advClean.includes("david")) map[key].davidSantander += s.totalSinIva;

      map[key].total += s.totalSinIva;
    });

    // Sort: FIRMAS products FIRST, UPCONTA products SECOND
    return Object.values(map).sort((a, b) => {
      if (a.linea !== b.linea) {
        return a.linea === "FIRMAS" ? -1 : 1;
      }
      return b.total - a.total;
    });
  }, [filteredSales]);

  // Dynamic Table 2: Reporte de Comisiones Table (Uses salesForChartsAndCommissions)
  const dynamicCommissionsReport = useMemo(() => {
    const advMap: Record<string, { upconta: number; firmas: number; total: number; comision: number }> = {
      "Karla Haro": { upconta: 0, firmas: 0, total: 0, comision: 0 },
      "Ismenia Escalona": { upconta: 0, firmas: 0, total: 0, comision: 0 },
      "Salomé Estrella": { upconta: 0, firmas: 0, total: 0, comision: 0 },
      "Evelyn Narváez": { upconta: 0, firmas: 0, total: 0, comision: 0 },
      "David Santander": { upconta: 0, firmas: 0, total: 0, comision: 0 }
    };

    salesForChartsAndCommissions.forEach(s => {
      let matchedKey = "";
      const advClean = s.asesor.toLowerCase();
      if (advClean.includes("karla")) matchedKey = "Karla Haro";
      else if (advClean.includes("ismenia")) matchedKey = "Ismenia Escalona";
      else if (advClean.includes("salom")) matchedKey = "Salomé Estrella";
      else if (advClean.includes("evelyn")) matchedKey = "Evelyn Narváez";
      else if (advClean.includes("david")) matchedKey = "David Santander";

      if (matchedKey) {
        if (isUpContaSale(s)) {
          advMap[matchedKey].upconta += s.totalSinIva;
        } else {
          advMap[matchedKey].firmas += s.totalSinIva;
        }
        advMap[matchedKey].total += s.totalSinIva;
      }
    });

    let totalComPool = 0;
    Object.keys(advMap).forEach(key => {
      const tot = advMap[key].total;
      let comm = 0;
      if (tot >= 5000) comm = tot * 0.047;
      else if (tot >= 4000) comm = tot * 0.0345;
      else if (tot >= 3000) comm = tot * 0.0035;

      advMap[key].comision = comm;
      totalComPool += comm;
    });

    const totalUpconta = Object.values(advMap).reduce((a, b) => a + b.upconta, 0);
    const totalFirmas = Object.values(advMap).reduce((a, b) => a + b.firmas, 0);
    const grandTotalSales = Object.values(advMap).reduce((a, b) => a + b.total, 0);

    return {
      advisers: advMap,
      totalUpconta,
      totalFirmas,
      grandTotalSales,
      totalComPool
    };
  }, [salesForChartsAndCommissions]);

  // Formatters
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* ================= TOP SYNC BAR ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Sincronizado Google Sheets
          </span>
          {lastSyncTime && (
            <span className="text-slate-500 text-xs flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Última sinc: {lastSyncTime}
            </span>
          )}
        </div>

        <button
          onClick={fetchGoogleSheetData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Actualizando..." : "Refrescar Google Sheets"}</span>
        </button>
      </div>

      {/* ================= CONTROLS & FILTERS BAR ================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 font-black text-slate-800 text-sm uppercase tracking-wider">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>Filtros Integrados de Análisis</span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mostrando <strong className="text-slate-900">{filteredSales.length}</strong> ventas registradas
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Filter 1: Filtro MES */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              <span>Mes</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="July 2026">Julio 2026 (Actual)</option>
              <option value="June 2026">Junio 2026</option>
              <option value="May 2026">Mayo 2026</option>
              <option value="April 2026">Abril 2026</option>
              <option value="March 2026">Marzo 2026</option>
              <option value="February 2026">Febrero 2026</option>
              <option value="January 2026">Enero 2026</option>
              <option value="August 2026">Agosto 2026</option>
              <option value="September 2026">Septiembre 2026</option>
              <option value="October 2026">Octubre 2026</option>
              <option value="November 2026">Noviembre 2026</option>
              <option value="December 2026">Diciembre 2026</option>
              <option value="all_year">Todo el Año (2026)</option>
            </select>
          </div>

          {/* Filter 2: Período de Tiempo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Período de Tiempo</span>
            </label>
            <select
              value={timeFilter}
              onChange={(e) => {
                setTimeFilter(e.target.value as any);
                if (e.target.value === "semana") setSelectedWeek("all");
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="mes">Mes Completo</option>
              <option value="semana">Por Semana (Viernes a Jueves)</option>
              <option value="rango">Rango Personalizado</option>
            </select>
          </div>

          {/* Filter 3: Conditional Week / Date Range */}
          {timeFilter === "semana" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Semana (Viernes a Jueves)</span>
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full bg-amber-50/80 border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="all">Todas las Semanas del Mes</option>
                {dynamicWeekRanges.map((wr) => (
                  <option key={wr.weekNum} value={String(wr.weekNum)}>
                    {wr.label}
                  </option>
                ))}
              </select>
            </div>
          ) : timeFilter === "rango" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rango Desde - Hasta</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Búsqueda Rápida</span>
              </label>
              <input
                type="text"
                placeholder="Cliente, RUC, Asesor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
          )}

          {/* Filter 4: Línea de Producto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-500" />
              <span>Línea de Producto</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="all">Todas las Líneas (UpConta &amp; Firmas)</option>
              <option value="upconta">Línea UpConta (Sistemas &amp; ERP)</option>
              <option value="firmas">Línea Firmas Electrónicas.ec</option>
            </select>
          </div>

          {/* Filter 5: Asesor Comercial */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Asesor Comercial</span>
            </label>
            <select
              value={selectedAdviser}
              onChange={(e) => setSelectedAdviser(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="all">Todos los Asesores (Equipo Completo)</option>
              {allAdvisers.map((adv) => (
                <option key={adv} value={adv}>
                  {adv}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= 9 EXECUTIVE KPI SCORECARDS (3 ROWS OF 3 MATCHING BRAND COLORS) ================= */}
      <div className="space-y-4">
        {/* ROW 1: TOTAL GENERAL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Ventas */}
          <div className="bg-gradient-to-br from-slate-900 via-[#0B2545] to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden group hover:border-orange-500/50 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  Total Ventas (Sin IVA)
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatCurrency(totalVentasMonto)}
                </div>
              </div>
              <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 2: Cantidad de Ventas */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-md border border-slate-200 relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Cantidad de Ventas
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {cantidadVentas} <span className="text-xs font-extrabold text-slate-500">transacciones</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 3: Ticket Promedio General */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-md border border-slate-200 relative overflow-hidden group hover:border-purple-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ticket Promedio General
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(ticketPromedio)}
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
                <Calculator className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: LÍNEA UPCONTA (NARANJA Y AZUL) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 4: Total Ventas UpConta */}
          <div className="bg-gradient-to-br from-[#0B2545] via-[#003566] to-[#0B2545] text-white rounded-2xl p-5 shadow-md border border-blue-500/40 relative overflow-hidden group hover:border-orange-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  Total Ventas UpConta
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formatCurrency(totalVentasUpConta)}
                </div>
              </div>
              <div className="p-2.5 bg-orange-500/20 border border-orange-400/30 rounded-xl text-orange-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 5: Cantidad Ventas UpConta */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-sm border border-orange-200 relative overflow-hidden group hover:border-orange-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-orange-500" />
                  Cantidad Ventas UpConta
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {cantidadUpConta} <span className="text-xs font-extrabold text-slate-500">transacciones</span>
                </div>
              </div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-100">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 6: Ticket Promedio UpConta */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-sm border border-blue-200 relative overflow-hidden group hover:border-blue-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  Ticket Prom. UpConta
                </span>
                <div className="text-2xl font-black text-blue-950 tracking-tight">
                  {formatCurrency(ticketPromedioUpConta)}
                </div>
              </div>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: LÍNEA FIRMAS ELECTRÓNICAS.EC (AZUL Y AMARILLO) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 7: Total Ventas Firmas */}
          <div className="bg-gradient-to-br from-[#003366] via-[#002244] to-[#003366] text-white rounded-2xl p-5 shadow-md border border-amber-400/40 relative overflow-hidden group hover:border-amber-300 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  Total Ventas Firmas
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-100 tracking-tight">
                  {formatCurrency(totalVentasFirmas)}
                </div>
              </div>
              <div className="p-2.5 bg-amber-400/20 border border-amber-300/30 rounded-xl text-amber-300">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 8: Cantidad Ventas Firmas */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-sm border border-amber-200 relative overflow-hidden group hover:border-amber-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Cantidad Ventas Firmas
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {cantidadFirmas} <span className="text-xs font-extrabold text-slate-500">firmas</span>
                </div>
              </div>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Card 9: Ticket Promedio Firmas */}
          <div className="bg-white text-slate-800 rounded-2xl p-5 shadow-sm border border-amber-200 relative overflow-hidden group hover:border-amber-400 transition-all">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Calculator className="w-3.5 h-3.5 text-amber-600" />
                  Ticket Prom. Firmas
                </span>
                <div className="text-2xl font-black text-amber-950 tracking-tight">
                  {formatCurrency(ticketPromedioFirmas)}
                </div>
              </div>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SUB-NAVIGATION TABS FOR DASHBOARD VIEWS ================= */}
      <div className="flex items-center bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/80 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveViewTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === "overview"
              ? "bg-[#0B2545] text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-orange-400" />
          <span>Vista General (Gráficos)</span>
        </button>

        <button
          onClick={() => setActiveViewTab("producto")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === "producto"
              ? "bg-[#0B2545] text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
          }`}
        >
          <PieChartIcon className="w-4 h-4 text-emerald-400" />
          <span>Reporte por Producto ($ y #)</span>
        </button>

        <button
          onClick={() => setActiveViewTab("comisiones")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === "comisiones"
              ? "bg-[#0B2545] text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Reporte Comisiones ($)</span>
        </button>

        <button
          onClick={() => setActiveViewTab("detalle")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeViewTab === "detalle"
              ? "bg-[#0B2545] text-white shadow-md"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-300/60"
          }`}
        >
          <Table className="w-4 h-4 text-blue-400" />
          <span>Detalle de Ventas ({filteredSales.length})</span>
        </button>
      </div>

      {/* ================= VIEW 1: OVERVIEW CHARTS ================= */}
      {activeViewTab === "overview" && (
        <div className="space-y-8">
          {/* Chart 1: Ventas por Asesor */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                  Ventas por Asesor Comercial ($ USD y Cantidad)
                </h3>
                <p className="text-xs text-slate-500">
                  Comparativa directa de facturación lograda por cada integrante del equipo.
                </p>
              </div>
              <span className="bg-orange-50 text-orange-700 font-extrabold text-xs px-3 py-1 rounded-full border border-orange-200">
                Top Asesor: {adviserChartData[0]?.name || "Evelyn Narváez"}
              </span>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adviserChartData} margin={{ top: 10, right: 30, left: 20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: "bold", fill: "#334155" }} interval={0} />
                  <YAxis yAxisId="left" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip content={<CustomBarTooltip formatCurrency={formatCurrency} />} />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", fontWeight: "bold" }} />
                  <Bar yAxisId="left" dataKey="upconta" name="Línea UpConta ($)" fill="#0B2545" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="left" dataKey="firmas" name="Línea Firmas ($)" fill="#EAB308" radius={[6, 6, 0, 0]} />
                  <Bar yAxisId="right" dataKey="cantidad" name="Cantidad Ventas (#)" fill="#F97316" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid of 2 Charts: Product Distribution & Commission Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 2: Distribución por Producto */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-emerald-500" />
                  Participación por Producto ($)
                </h3>
                <p className="text-xs text-slate-500">Monto acumulado por tipo de servicio ofrecido.</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productChartData}
                      dataKey="monto"
                      nameKey="producto"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {productChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "600" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Valor a Comisionar por Asesor */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Comisiones Ganadas por Asesor ($ USD)
                </h3>
                <p className="text-xs text-slate-500">Valor a comisionar derivado del volumen de ventas.</p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(dynamicCommissionsReport.advisers).map(([name, data]) => ({ name, comision: (data as { comision: number }).comision }))} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: "bold" }} />
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    <Bar dataKey="comision" name="Valor a Comisionar ($)" fill="#10B981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ================= 3 NUEVOS GRÁFICOS: CANTIDAD DE VENTAS Y PRODUCTOS VENDIDOS POR SEMANA ================= */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-black text-slate-900">Análisis Semanal de Cantidades (# Ventas y # Productos)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chart A: Semanal General */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-slate-700" />
                    1. Cantidad Semanal - General
                  </h4>
                  <p className="text-[11px] text-slate-500">UpConta &amp; Firmas combinados</p>
                </div>
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyDataGeneral} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="semana" tick={{ fontSize: 10, fontWeight: "bold" }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Bar dataKey="cantidadVentas" name="Ventas (#)" fill="#0B2545" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cantidadProductos" name="Productos (#)" fill="#F97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: Semanal UpConta */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    2. Cantidad Semanal - UpConta
                  </h4>
                  <p className="text-[11px] text-slate-500">Sistemas &amp; Planes ERP</p>
                </div>
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyDataUpConta} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="semana" tick={{ fontSize: 10, fontWeight: "bold" }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Bar dataKey="cantidadVentas" name="Ventas UpConta" fill="#0B2545" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cantidadProductos" name="Productos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart C: Semanal Firmas */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    3. Cantidad Semanal - Firmas.ec
                  </h4>
                  <p className="text-[11px] text-slate-500">Certificados SRI e Imprenta</p>
                </div>
                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyDataFirmas} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="semana" tick={{ fontSize: 10, fontWeight: "bold" }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                      <Bar dataKey="cantidadVentas" name="Firmas Emitidas" fill="#EAB308" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cantidadProductos" name="Productos" fill="#003366" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ================= 4TO GRÁFICO / MÓDULO: COMPARATIVO ENTRE MESES Y SEMANAS ================= */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6 pt-6 border-t-2 border-t-orange-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  4. Módulo Comparativo entre Meses y Semanas
                </h3>
                <p className="text-xs text-slate-500">
                  Selecciona dos meses distintos y filtra por semana o línea de producto para comparar rendimiento directo.
                </p>
              </div>
              <span className="bg-blue-50 text-blue-900 font-extrabold text-xs px-3 py-1 rounded-full border border-blue-200">
                Comparativa Dinámica
              </span>
            </div>

            {/* Controls for 4th Comparative Module */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Mes A (Base)</label>
                <select
                  value={compMonthA}
                  onChange={(e) => setCompMonthA(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="June 2026">Junio 2026</option>
                  <option value="July 2026">Julio 2026</option>
                  <option value="May 2026">Mayo 2026</option>
                  <option value="April 2026">Abril 2026</option>
                  <option value="March 2026">Marzo 2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Mes B (Comparar)</label>
                <select
                  value={compMonthB}
                  onChange={(e) => setCompMonthB(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="July 2026">Julio 2026</option>
                  <option value="June 2026">Junio 2026</option>
                  <option value="May 2026">Mayo 2026</option>
                  <option value="April 2026">Abril 2026</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Filtrar por Semana</label>
                <select
                  value={compWeek}
                  onChange={(e) => setCompWeek(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="all">Todas las Semanas</option>
                  <option value="1">Semana 1</option>
                  <option value="2">Semana 2</option>
                  <option value="3">Semana 3</option>
                  <option value="4">Semana 4</option>
                  <option value="5">Semana 5</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Línea de Producto</label>
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="all">Ambas Líneas</option>
                  <option value="upconta">Solo UpConta</option>
                  <option value="firmas">Solo Firmas.ec</option>
                </select>
              </div>
            </div>

            {/* Visual Bar Chart Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeMetrics.chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fontWeight: "bold" }} />
                    <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    <Legend wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }} />
                    <Bar dataKey={compMonthA} name={compMonthA} fill="#0B2545" radius={[6, 6, 0, 0]} />
                    <Bar dataKey={compMonthB} name={compMonthB} fill="#F97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table Summary for Comparative */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white font-black uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Métrica</th>
                      <th className="p-2.5 text-right">{compMonthA}</th>
                      <th className="p-2.5 text-right bg-orange-600">{compMonthB}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                    <tr>
                      <td className="p-2.5">Total Ventas ($)</td>
                      <td className="p-2.5 text-right">{formatCurrency(comparativeMetrics.statsA.totalMonto)}</td>
                      <td className="p-2.5 text-right text-orange-600">{formatCurrency(comparativeMetrics.statsB.totalMonto)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5">UpConta ($)</td>
                      <td className="p-2.5 text-right">{formatCurrency(comparativeMetrics.statsA.totalUpMonto)}</td>
                      <td className="p-2.5 text-right text-orange-600">{formatCurrency(comparativeMetrics.statsB.totalUpMonto)}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Firmas.ec ($)</td>
                      <td className="p-2.5 text-right">{formatCurrency(comparativeMetrics.statsA.totalFirMonto)}</td>
                      <td className="p-2.5 text-right text-orange-600">{formatCurrency(comparativeMetrics.statsB.totalFirMonto)}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="p-2.5">Cantidad (#)</td>
                      <td className="p-2.5 text-right">{comparativeMetrics.statsA.qtyTotal} ventas</td>
                      <td className="p-2.5 text-right text-orange-600">{comparativeMetrics.statsB.qtyTotal} ventas</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Ticket Prom. ($)</td>
                      <td className="p-2.5 text-right">{formatCurrency(comparativeMetrics.statsA.ticket)}</td>
                      <td className="p-2.5 text-right text-orange-600">{formatCurrency(comparativeMetrics.statsB.ticket)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: REPORTE POR PRODUCTO TABLE ================= */}
      {activeViewTab === "producto" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                Reporte por Producto ($ USD) - Dinámico
              </h3>
              <p className="text-xs text-slate-500">
                Resumen reactivo que se ajusta automáticamente según la línea de producto, semana y período filtrado.
              </p>
            </div>
            <span className="bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              Total Filtrado: {formatCurrency(totalVentasMonto)}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0B2545] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-3">Línea</th>
                  <th className="p-3">Producto / Plan</th>
                  <th className="p-3 text-right">Karla Haro</th>
                  <th className="p-3 text-right">Ismenia Escalona</th>
                  <th className="p-3 text-right">Salomé Estrella</th>
                  <th className="p-3 text-right">Evelyn Narváez</th>
                  <th className="p-3 text-right">David Santander</th>
                  <th className="p-3 text-right bg-orange-600">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {dynamicReportProduct.length > 0 ? (
                  dynamicReportProduct.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/60 hover:bg-slate-100"}>
                      <td className="p-3 font-bold text-slate-900">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          row.linea === "UPCONTA" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-900"
                        }`}>
                          {row.linea}
                        </span>
                      </td>
                      <td className="p-3 font-extrabold text-slate-900">{row.producto}</td>
                      <td className="p-3 text-right">{formatCurrency(row.karlaHaro)}</td>
                      <td className="p-3 text-right">{formatCurrency(row.ismeniaEscalona)}</td>
                      <td className="p-3 text-right">{formatCurrency(row.salomeEstrella)}</td>
                      <td className="p-3 text-right">{formatCurrency(row.evelynNarvaez)}</td>
                      <td className="p-3 text-right">{formatCurrency(row.davidSantander)}</td>
                      <td className="p-3 text-right font-black text-slate-900 bg-orange-50">{formatCurrency(row.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                      No hay registros de productos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black text-xs">
                <tr>
                  <td colSpan={2} className="p-3 text-right uppercase tracking-wider">TOTAL GENERAL FILTRADO</td>
                  <td className="p-3 text-right text-amber-300">{formatCurrency(dynamicReportProduct.reduce((a, b) => a + b.karlaHaro, 0))}</td>
                  <td className="p-3 text-right text-amber-300">{formatCurrency(dynamicReportProduct.reduce((a, b) => a + b.ismeniaEscalona, 0))}</td>
                  <td className="p-3 text-right text-amber-300">{formatCurrency(dynamicReportProduct.reduce((a, b) => a + b.salomeEstrella, 0))}</td>
                  <td className="p-3 text-right text-amber-300">{formatCurrency(dynamicReportProduct.reduce((a, b) => a + b.evelynNarvaez, 0))}</td>
                  <td className="p-3 text-right text-amber-300">{formatCurrency(dynamicReportProduct.reduce((a, b) => a + b.davidSantander, 0))}</td>
                  <td className="p-3 text-right bg-orange-500 text-white font-black">{formatCurrency(totalVentasMonto)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: REPORTE COMISIONES TABLE ================= */}
      {activeViewTab === "comisiones" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                Reporte de Comisiones Equipo Comercial ($) - Dinámico
              </h3>
              <p className="text-xs text-slate-500">
                Resumen consolidado reactivo que se recalcula dinámicamente según la línea y el período seleccionado.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-300 px-4 py-1.5 rounded-2xl text-emerald-900 text-xs font-black flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Fondo a Comisionar: <strong>{formatCurrency(dynamicCommissionsReport.totalComPool)} USD</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#003366] text-white uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-3">Línea de Negocio</th>
                  <th className="p-3 text-right">Karla Haro</th>
                  <th className="p-3 text-right">Ismenia Escalona</th>
                  <th className="p-3 text-right">Salomé Estrella</th>
                  <th className="p-3 text-right">Evelyn Narváez</th>
                  <th className="p-3 text-right">David Santander</th>
                  <th className="p-3 text-right bg-emerald-700">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                <tr className="bg-white hover:bg-slate-50">
                  <td className="p-3 font-extrabold text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>UpConta</span>
                  </td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Karla Haro"].upconta)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Ismenia Escalona"].upconta)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Salomé Estrella"].upconta)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Evelyn Narváez"].upconta)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["David Santander"].upconta)}</td>
                  <td className="p-3 text-right font-black bg-blue-50">{formatCurrency(dynamicCommissionsReport.totalUpconta)}</td>
                </tr>
                <tr className="bg-slate-50 hover:bg-slate-100">
                  <td className="p-3 font-extrabold text-orange-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                    <span>Firmas Electrónicas.ec</span>
                  </td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Karla Haro"].firmas)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Ismenia Escalona"].firmas)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Salomé Estrella"].firmas)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Evelyn Narváez"].firmas)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["David Santander"].firmas)}</td>
                  <td className="p-3 text-right font-black bg-orange-50">{formatCurrency(dynamicCommissionsReport.totalFirmas)}</td>
                </tr>
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td className="p-3 uppercase">TOTAL VENTAS</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Karla Haro"].total)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Ismenia Escalona"].total)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Salomé Estrella"].total)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Evelyn Narváez"].total)}</td>
                  <td className="p-3 text-right">{formatCurrency(dynamicCommissionsReport.advisers["David Santander"].total)}</td>
                  <td className="p-3 text-right bg-slate-200">{formatCurrency(dynamicCommissionsReport.grandTotalSales)}</td>
                </tr>
                <tr className="bg-emerald-600 text-white font-black text-sm">
                  <td className="p-3.5 uppercase flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>VALOR A COMISIONAR</span>
                  </td>
                  <td className="p-3.5 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Karla Haro"].comision)}</td>
                  <td className="p-3.5 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Ismenia Escalona"].comision)}</td>
                  <td className="p-3.5 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Salomé Estrella"].comision)}</td>
                  <td className="p-3.5 text-right">{formatCurrency(dynamicCommissionsReport.advisers["Evelyn Narváez"].comision)}</td>
                  <td className="p-3.5 text-right">{formatCurrency(dynamicCommissionsReport.advisers["David Santander"].comision)}</td>
                  <td className="p-3.5 text-right bg-emerald-800 text-amber-300">{formatCurrency(dynamicCommissionsReport.totalComPool)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 4: GRANULAR DETALLE DE VENTAS TABLE ================= */}
      {activeViewTab === "detalle" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Table className="w-5 h-5 text-blue-600" />
                Registro Granular de Ventas ({filteredSales.length} resultados)
              </h3>
              <p className="text-xs text-slate-500">
                Listado de transacciones individuales ordenadas con la última venta destacada.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-600">
              Total Filtrado: <strong className="text-emerald-600 text-sm">{formatCurrency(totalVentasMonto)}</strong>
            </div>
          </div>

          {/* DESTACADO: ÚLTIMA VENTA REGISTRADA */}
          {latestSale && (
            <div className="bg-gradient-to-r from-[#0B2545] via-[#003566] to-[#0B2545] text-white rounded-2xl p-4 sm:p-5 shadow-md border border-orange-500/40 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>ÚLTIMA VENTA REGISTRADA</span>
                </span>
                <span className="text-xs font-mono text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Fecha de Cierre: {latestSale.fecha}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Asesor Comercial</span>
                  <span className="text-sm font-extrabold text-white">{latestSale.asesor}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cliente / RUC</span>
                  <span className="text-sm font-bold text-slate-200 truncate block">{latestSale.nombre} ({latestSale.ruc})</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Producto / Plan</span>
                  <span className="text-sm font-bold text-orange-300 truncate block">{latestSale.producto} {latestSale.plan ? `- ${latestSale.plan}` : ''}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Monto Total (Sin IVA)</span>
                  <span className="text-lg font-black text-emerald-400">{formatCurrency(latestSale.totalSinIva)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Asesor</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">RUC</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3 text-right">Total Sin IVA ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {sortedSales.slice(0, 1000).map((row, idx) => (
                  <tr key={idx} className={idx === 0 ? "bg-amber-50/80 hover:bg-amber-100/80 border-l-4 border-l-orange-500 font-bold" : idx % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50 hover:bg-slate-100"}>
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-600">{row.fecha}</td>
                    <td className="p-3 font-bold text-slate-900">{row.asesor}</td>
                    <td className="p-3 max-w-xs truncate font-semibold">{row.nombre}</td>
                    <td className="p-3 font-mono text-slate-600">{row.ruc}</td>
                    <td className="p-3 font-bold text-blue-900">{row.producto}</td>
                    <td className="p-3">{row.plan}</td>
                    <td className="p-3 text-right font-black text-emerald-600">{formatCurrency(row.totalSinIva)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedSales.length > 1000 && (
            <div className="text-center text-xs text-slate-500 pt-2">
              Mostrando las primeras 1000 de {sortedSales.length} transacciones filtradas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
