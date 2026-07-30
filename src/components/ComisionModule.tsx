import React, { useState } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Calculator,
  TrendingUp,
  User,
  Calendar,
  FileCheck2,
  PackageCheck,
  FileText,
  Percent,
  Sparkles,
  Download,
  Loader2,
  CreditCard,
  Layers,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { GodiOfficialLogo } from "./GodiLogo";

interface ItemComision {
  id: string;
  categoria: "plan" | "firma" | "adicional";
  subcategoria?: "facturacion" | "erp" | "contador";
  nombre: string;
  vigencia?: string;
  costoBase: number; // Costo base para firmas
  precioVenta: number; // Precio al que se vende
  cantidad: number;
  porcentajeComision: number; // 30% para planes, 0 para firmas, 10% para adicionales
  comisionUnitaria: number; // $ por unidad
  comisionTotal: number; // $ total para el item
}

export const FIRMA_BASE_COSTS: Record<string, { costoBase: number; sugerido: number }> = {
  "15 Días": { costoBase: 3.16, sugerido: 6.0 },
  "1 Año": { costoBase: 8.99, sugerido: 18.0 },
  "2 Años": { costoBase: 14.5, sugerido: 28.0 },
  "3 Años": { costoBase: 19.1, sugerido: 38.0 },
  "4 Años": { costoBase: 23.8, sugerido: 48.0 },
  "5 Años": { costoBase: 28.17, sugerido: 58.0 },
};

export const ADICIONALES_PRESETS = [
  { id: "tesoreria", nombre: "TESORERIA", precio: 75.0 },
  { id: "nomina", nombre: "NOMINA", precio: 75.0 },
  { id: "activos_fijos", nombre: "ACTIVOS FIJOS", precio: 75.0 },
  { id: "restaurantes", nombre: "RESTAURANTES", precio: 75.0 },
  { id: "contabilidad", nombre: "CONTABILIDAD", precio: 75.0 },
  { id: "produccion", nombre: "PRODUCCIÓN", precio: 75.0 },
];

export const PLAN_PRESETS = [
  // Facturación Electrónica
  { id: "fac_up_light", categoria: "facturacion", nombre: "Facturación UP LIGHT", precio: 10.0 },
  { id: "fac_up_base", categoria: "facturacion", nombre: "Facturación UP BASE", precio: 25.0 },
  { id: "fac_up_power", categoria: "facturacion", nombre: "Facturación UP POWER", precio: 55.0 },
  { id: "fac_up_inicial", categoria: "facturacion", nombre: "Facturación UP INICIAL", precio: 10.0 },
  { id: "fac_up_intermedio", categoria: "facturacion", nombre: "Facturación UP INTERMEDIO", precio: 15.0 },
  { id: "fac_up_ideal_plus", categoria: "facturacion", nombre: "Facturación UP IDEAL PLUS", precio: 25.0 },
  { id: "fac_up_profesional_plus", categoria: "facturacion", nombre: "Facturación UP PROFESIONAL PLUS", precio: 80.0 },
  { id: "fac_up_ultra", categoria: "facturacion", nombre: "Facturación UP ULTRA", precio: 150.0 },

  // ERP Administrativo
  { id: "erp_start", categoria: "erp", nombre: "ERP START", precio: 411.76 },
  { id: "erp_plus", categoria: "erp", nombre: "ERP PLUS", precio: 600.0 },
  { id: "erp_premium", categoria: "erp", nombre: "ERP PREMIUN", precio: 958.82 },

  // Contadores Multi-RUC
  { id: "cont_1_emp", categoria: "contador", nombre: "CONTADOR 1 EMPRESA", precio: 50.0 },
  { id: "cont_3_emp", categoria: "contador", nombre: "CONTADOR 3 EMPRESA", precio: 100.0 },
  { id: "cont_6_emp", categoria: "contador", nombre: "CONTADOR 6 EMPRESA", precio: 150.0 },
  { id: "cont_10_emp", categoria: "contador", nombre: "CONTADOR 10 EMPRESA", precio: 200.0 },
  { id: "cont_tax_ilim", categoria: "contador", nombre: "TAX ILIMITADOS", precio: 100.0 },
  { id: "cont_ilimitado", categoria: "contador", nombre: "CONTADOR ILIMITADO", precio: 300.0 },
];

export function ComisionModule() {
  const currentYear = new Date().getFullYear();
  const MONTHS = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Distribuidor state - default empty
  const [nombreDistribuidor, setNombreDistribuidor] = useState("");
  const [cedulaDistribuidor, setCedulaDistribuidor] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [fechaReporte, setFechaReporte] = useState("");
  
  // Mes de observaciones
  const currentMonthName = MONTHS[new Date().getMonth()];
  const [mesSeleccionado, setMesSeleccionado] = useState(currentMonthName);
  const [observaciones, setObservaciones] = useState(`Comisiones ${currentMonthName} ${currentYear}`);

  // Items List - default empty
  const [items, setItems] = useState<ItemComision[]>([]);

  // Form State: Plan
  const [selectedPlanPreset, setSelectedPlanPreset] = useState(PLAN_PRESETS[1].id);
  const [planNombreCustom, setPlanNombreCustom] = useState(PLAN_PRESETS[1].nombre);
  const [planPrecioVenta, setPlanPrecioVenta] = useState<number>(PLAN_PRESETS[1].precio);
  const [planCantidad, setPlanCantidad] = useState<number>(1);
  const [planSubcategoria, setPlanSubcategoria] = useState<"facturacion" | "erp" | "contador">("facturacion");

  // Form State: Firma (Solo Archivo .p12)
  const [firmaVigencia, setFirmaVigencia] = useState<string>("1 Año");
  const firmaTipo = "Archivo .p12";
  const [firmaPrecioVenta, setFirmaPrecioVenta] = useState<number>(FIRMA_BASE_COSTS["1 Año"].sugerido);
  const [firmaCantidad, setFirmaCantidad] = useState<number>(1);

  // Form State: Adicional
  const [selectedAdicional, setSelectedAdicional] = useState(ADICIONALES_PRESETS[0].id);
  const [adicionalPrecioVenta, setAdicionalPrecioVenta] = useState<number>(ADICIONALES_PRESETS[0].precio);
  const [adicionalCantidad, setAdicionalCantidad] = useState<number>(1);

  // Handle plan preset selection change
  const handlePlanPresetChange = (presetId: string) => {
    setSelectedPlanPreset(presetId);
    if (presetId === "custom") {
      setPlanNombreCustom("Plan Personalizado");
      setPlanPrecioVenta(50);
    } else {
      const found = PLAN_PRESETS.find((p) => p.id === presetId);
      if (found) {
        setPlanNombreCustom(found.nombre);
        setPlanPrecioVenta(found.precio);
        setPlanSubcategoria(found.categoria as any);
      }
    }
  };

  // Handle firma vigencia change
  const handleFirmaVigenciaChange = (vigencia: string) => {
    setFirmaVigencia(vigencia);
    const config = FIRMA_BASE_COSTS[vigencia];
    if (config) {
      setFirmaPrecioVenta(config.sugerido);
    }
  };

  // Handle adicional preset selection change
  const handleAdicionalPresetChange = (presetId: string) => {
    setSelectedAdicional(presetId);
    const found = ADICIONALES_PRESETS.find((a) => a.id === presetId);
    if (found) {
      setAdicionalPrecioVenta(found.precio);
    }
  };

  // Add Plan to list
  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (planPrecioVenta <= 0 || planCantidad <= 0) return;

    const comisionUnitaria = planPrecioVenta * 0.3;
    const comisionTotal = comisionUnitaria * planCantidad;

    const newItem: ItemComision = {
      id: `plan-${Date.now()}`,
      categoria: "plan",
      subcategoria: planSubcategoria,
      nombre: planNombreCustom || "Plan de Sistema",
      costoBase: 0,
      precioVenta: Number(planPrecioVenta),
      cantidad: Number(planCantidad),
      porcentajeComision: 30,
      comisionUnitaria,
      comisionTotal,
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Add Firma to list
  const handleAddFirma = (e: React.FormEvent) => {
    e.preventDefault();
    if (firmaPrecioVenta <= 0 || firmaCantidad <= 0) return;

    const config = FIRMA_BASE_COSTS[firmaVigencia] || { costoBase: 8.99, sugerido: 18.0 };
    const costoBase = config.costoBase;
    const comisionUnitaria = firmaPrecioVenta - costoBase;
    const comisionTotal = comisionUnitaria * firmaCantidad;

    const newItem: ItemComision = {
      id: `firma-${Date.now()}`,
      categoria: "firma",
      nombre: `Firma Electrónica (${firmaTipo})`,
      vigencia: firmaVigencia,
      costoBase,
      precioVenta: Number(firmaPrecioVenta),
      cantidad: Number(firmaCantidad),
      porcentajeComision: 0,
      comisionUnitaria,
      comisionTotal,
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Add Adicional to list
  const handleAddAdicional = (e: React.FormEvent) => {
    e.preventDefault();
    if (adicionalPrecioVenta <= 0 || adicionalCantidad <= 0) return;

    const found = ADICIONALES_PRESETS.find((a) => a.id === selectedAdicional);
    const nombreAdicional = found ? `Módulo Adicional: ${found.nombre}` : "Módulo Adicional";

    const comisionUnitaria = adicionalPrecioVenta * 0.10; // 10% de comisión
    const comisionTotal = comisionUnitaria * adicionalCantidad;

    const newItem: ItemComision = {
      id: `adicional-${Date.now()}`,
      categoria: "adicional",
      nombre: nombreAdicional,
      costoBase: 0,
      precioVenta: Number(adicionalPrecioVenta),
      cantidad: Number(adicionalCantidad),
      porcentajeComision: 10,
      comisionUnitaria,
      comisionTotal,
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Update item field directly
  const handleUpdateItem = (id: string, field: "precioVenta" | "cantidad", value: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newQty = field === "cantidad" ? Math.max(1, value) : item.cantidad;
        const newPrecio = field === "precioVenta" ? Math.max(0, value) : item.precioVenta;

        let comisionUnitaria = 0;
        if (item.categoria === "plan") {
          comisionUnitaria = newPrecio * 0.3;
        } else if (item.categoria === "adicional") {
          comisionUnitaria = newPrecio * 0.1;
        } else {
          comisionUnitaria = newPrecio - item.costoBase;
        }

        return {
          ...item,
          cantidad: newQty,
          precioVenta: newPrecio,
          comisionUnitaria,
          comisionTotal: comisionUnitaria * newQty,
        };
      })
    );
  };

  // Delete Item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm("¿Deseas vaciar todos los elementos de la lista de comisiones?")) {
      setItems([]);
    }
  };

  // Totals calculations
  const totalCantPlanes = items
    .filter((i) => i.categoria === "plan")
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const totalCantFirmas = items
    .filter((i) => i.categoria === "firma")
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const totalCantAdicionales = items
    .filter((i) => i.categoria === "adicional")
    .reduce((acc, curr) => acc + curr.cantidad, 0);

  const totalVentaBruta = items.reduce((acc, curr) => acc + curr.precioVenta * curr.cantidad, 0);

  const totalComisionPlanes = items
    .filter((i) => i.categoria === "plan")
    .reduce((acc, curr) => acc + curr.comisionTotal, 0);

  const totalComisionFirmas = items
    .filter((i) => i.categoria === "firma")
    .reduce((acc, curr) => acc + curr.comisionTotal, 0);

  const totalComisionAdicionales = items
    .filter((i) => i.categoria === "adicional")
    .reduce((acc, curr) => acc + curr.comisionTotal, 0);

  const totalComisionFinal = totalComisionPlanes + totalComisionFirmas + totalComisionAdicionales;

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Direct PDF Download Handler via html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    // 1. Mandatory Cédula / RUC Validation (min 10, max 13 chars)
    const cedulaTrim = cedulaDistribuidor.trim();
    if (!cedulaTrim) {
      setCedulaError("La Cédula / RUC es obligatoria.");
      alert("⚠️ La Cédula / RUC del distribuidor es obligatoria para generar el reporte (mínimo 10 y máximo 13 caracteres).");
      return;
    }
    if (cedulaTrim.length < 10 || cedulaTrim.length > 13) {
      setCedulaError(`Debe tener entre 10 y 13 caracteres (Ingresados: ${cedulaTrim.length})`);
      alert(`⚠️ La Cédula / RUC debe tener entre 10 y 13 caracteres.\nActualmente ingresaste: ${cedulaTrim.length} caracteres.`);
      return;
    }
    setCedulaError("");

    // 2. Nombre Distribuidor Validation
    if (!nombreDistribuidor.trim()) {
      alert("⚠️ Por favor ingrese el Nombre del distribuidor antes de generar el reporte.");
      return;
    }

    const reportElement = document.getElementById("printable-commission-report");
    if (!reportElement) return;

    try {
      setIsGeneratingPdf(true);

      // Render report element to canvas with high DPI scale
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const reportInClone = clonedDoc.getElementById("printable-commission-report");
          if (!reportInClone) return;

          // 1. Make sure parent container is visible and positioned properly in the clone
          const parent = reportInClone.parentElement;
          if (parent) {
            parent.style.position = "static";
            parent.style.left = "0";
            parent.style.top = "0";
            parent.style.opacity = "1";
            parent.style.visibility = "visible";
            parent.style.pointerEvents = "auto";
          }
          reportInClone.style.visibility = "visible";
          reportInClone.style.opacity = "1";

          // 2. Canvas context helper to convert oklch(...) to valid rgb/hex
          const tempCanvas = clonedDoc.createElement("canvas");
          const ctx = tempCanvas.getContext("2d");

          const convertOklch = (colorStr: string): string => {
            if (!colorStr || typeof colorStr !== "string" || !colorStr.includes("oklch")) {
              return colorStr;
            }
            return colorStr.replace(/oklch\([^)]+\)/gi, (match) => {
              if (ctx) {
                const initial = "#123456";
                ctx.fillStyle = initial;
                ctx.fillStyle = match;
                if (ctx.fillStyle && ctx.fillStyle !== initial && !ctx.fillStyle.includes("oklch")) {
                  return ctx.fillStyle;
                }
              }
              // Fallback
              return "rgb(15, 23, 42)";
            });
          };

          // 3. Convert oklch in all <style> tags
          const styleTags = Array.from(clonedDoc.querySelectorAll("style"));
          styleTags.forEach((styleTag) => {
            if (styleTag.textContent && styleTag.textContent.includes("oklch")) {
              styleTag.textContent = convertOklch(styleTag.textContent);
            }
          });

          // 4. Compute inline styles for all elements in the report template and replace oklch
          const allReportElements = [
            reportInClone,
            ...Array.from(reportInClone.querySelectorAll<HTMLElement>("*")),
          ];

          const colorProperties = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderRightColor",
            "borderBottomColor",
            "borderLeftColor",
            "fill",
            "stroke",
          ];

          allReportElements.forEach((el) => {
            const computed = window.getComputedStyle(el);
            colorProperties.forEach((prop) => {
              const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
              const val = computed.getPropertyValue(cssProp);
              if (val && val.includes("oklch")) {
                const converted = convertOklch(val);
                el.style.setProperty(cssProp, converted, "important");
              }
            });

            // Handle inline style attribute if present
            const styleAttr = el.getAttribute("style");
            if (styleAttr && styleAttr.includes("oklch")) {
              el.setAttribute("style", convertOklch(styleAttr));
            }
          });

          // 5. Remove any remaining <style> tags that still contain oklch to avoid html2canvas parser crash
          clonedDoc.querySelectorAll("style").forEach((s) => {
            if (s.textContent && s.textContent.includes("oklch")) {
              s.remove();
            }
          });
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);

      const safeName = (nombreDistribuidor || "Distribuidor").trim().replace(/[^a-zA-Z0-9_\-]/g, "_");
      const safeFecha = (fechaReporte || new Date().toISOString().split("T")[0]).replace(/[^a-zA-Z0-9_\-]/g, "_");
      const filename = `Reporte_Comisiones_${safeName}_${safeFecha}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error("Error al generar PDF con jsPDF:", error);
      // Fallback
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print handler - primary PDF download or window print fallback
  const handlePrint = () => {
    handleDownloadPDF();
  };

  return (
    <div className="space-[#0B2545] space-y-8 animate-fade-in">
      {/* Distribuidor & General Info Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Datos del Distribuidor</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Nombre del Distribuidor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={nombreDistribuidor}
                onChange={(e) => setNombreDistribuidor(e.target.value)}
                placeholder="Nombre del distribuidor..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Cédula / RUC <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cedulaDistribuidor}
                maxLength={13}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                  setCedulaDistribuidor(cleaned);
                  if (cleaned.length >= 10 && cleaned.length <= 13) {
                    setCedulaError("");
                  }
                }}
                placeholder="10 a 13 dígitos..."
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border ${
                  cedulaError
                    ? "border-red-500 bg-red-50/40"
                    : cedulaDistribuidor && (cedulaDistribuidor.length < 10 || cedulaDistribuidor.length > 13)
                    ? "border-amber-400"
                    : "border-slate-200"
                } rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none`}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              {cedulaError ? (
                <span className="text-[10px] text-red-600 font-bold">{cedulaError}</span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">
                  Mín. 10 - Máx. 13 caracteres
                </span>
              )}
              <span className={`text-[10px] font-bold ${
                cedulaDistribuidor.length >= 10 && cedulaDistribuidor.length <= 13
                  ? "text-emerald-600"
                  : "text-slate-400"
              }`}>
                {cedulaDistribuidor.length}/13
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Fecha de Liquidación
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={fechaReporte}
                onChange={(e) => setFechaReporte(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
              Mes / Período ({currentYear})
            </label>
            <select
              value={mesSeleccionado}
              onChange={(e) => {
                const newMonth = e.target.value;
                setMesSeleccionado(newMonth);
                setObservaciones(`Comisiones ${newMonth} ${currentYear}`);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} {currentYear}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Three Entry Forms: Planes (30%), Firmas (Margen) & Adicionales (10%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* FORM 1: PLANES DE SISTEMA (30% COMISION - AGRUPADOS) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">1. Agregar Plan de Sistema</h3>
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>30% de comisión directa por cada plan vendido</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg uppercase">
                30% Comisión
              </span>
            </div>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Seleccionar Plan
                </label>
                <select
                  value={selectedPlanPreset}
                  onChange={(e) => handlePlanPresetChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <optgroup label="Planes Facturación">
                    {PLAN_PRESETS.filter((p) => p.categoria === "facturacion").map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${p.precio.toFixed(2)}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Planes ERP">
                    {PLAN_PRESETS.filter((p) => p.categoria === "erp").map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${p.precio.toFixed(2)}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Planes Contadores">
                    {PLAN_PRESETS.filter((p) => p.categoria === "contador").map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — ${p.precio.toFixed(2)}
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="Personalizado">
                    <option value="custom">-- Otro / Plan Personalizado --</option>
                  </optgroup>
                </select>
              </div>

              {selectedPlanPreset === "custom" && (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre del Plan
                  </label>
                  <input
                    type="text"
                    value={planNombreCustom}
                    onChange={(e) => setPlanNombreCustom(e.target.value)}
                    placeholder="Ej. Plan Especial Corporativo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Precio Venta ($)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={planPrecioVenta}
                      onChange={(e) => setPlanPrecioVenta(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={planCantidad}
                    onChange={(e) => setPlanCantidad(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Commission calculation preview */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between">
                <div className="text-[11px] font-bold text-emerald-900">
                  <span>Comisión (30% de ${planPrecioVenta.toFixed(2)}):</span>
                </div>
                <div className="text-sm font-black text-emerald-700">
                  +${((planPrecioVenta * 0.3) * planCantidad).toFixed(2)} USD
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0B2545] hover:bg-[#133E72] text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Agregar Plan a Lista</span>
              </button>
            </form>
          </div>
        </div>

        {/* FORM 2: FIRMAS ELECTRONICAS (SOLO ARCHIVO .P12 & SOLO GANANCIA/COMISION) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">2. Agregar Firma Electrónica</h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Comisión = Precio Venta registrado − Costo Base
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-black rounded-lg uppercase">
                Margen Directo
              </span>
            </div>

            <form onSubmit={handleAddFirma} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Vigencia
                  </label>
                  <select
                    value={firmaVigencia}
                    onChange={(e) => handleFirmaVigenciaChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(FIRMA_BASE_COSTS).map(([v, config]) => (
                      <option key={v} value={v}>
                        {v} — ${config.costoBase.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Archivo
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Archivo .p12</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Precio Venta ($)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={firmaPrecioVenta}
                      onChange={(e) => setFirmaPrecioVenta(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={firmaCantidad}
                    onChange={(e) => setFirmaCantidad(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Ganancia / Comisión por Firma (Solo esta línea) */}
              <div className="bg-slate-900 text-white rounded-xl p-3 text-xs">
                <div className="flex justify-between items-center font-black text-emerald-400 text-sm">
                  <span>Ganancia / Comisión por Firma:</span>
                  <span>
                    +$
                    {((firmaPrecioVenta - (FIRMA_BASE_COSTS[firmaVigencia]?.costoBase || 0)) * firmaCantidad).toFixed(
                      2
                    )}{" "}
                    USD
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Agregar Firma a Lista</span>
              </button>
            </form>
          </div>
        </div>

        {/* FORM 3: MODULOS ADICIONALES (10% COMISION) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">3. Selección Adicionales</h3>
                  <p className="text-[11px] font-semibold text-purple-600 flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    <span>10% de comisión sobre el valor ($75 USD)</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-black rounded-lg uppercase">
                10% Comisión
              </span>
            </div>

            <form onSubmit={handleAddAdicional} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Módulo Adicional
                </label>
                <select
                  value={selectedAdicional}
                  onChange={(e) => handleAdicionalPresetChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  {ADICIONALES_PRESETS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} — ${a.precio.toFixed(2)} USD
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Precio Venta ($)
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold text-xs absolute left-3 top-1/2 -translate-y-1/2">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={adicionalPrecioVenta}
                      onChange={(e) => setAdicionalPrecioVenta(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adicionalCantidad}
                    onChange={(e) => setAdicionalCantidad(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Commission calculation preview */}
              <div className="bg-purple-50 border border-purple-200/80 rounded-xl p-3 flex items-center justify-between">
                <div className="text-[11px] font-bold text-purple-900">
                  <span>Comisión (10% de ${adicionalPrecioVenta.toFixed(2)}):</span>
                </div>
                <div className="text-sm font-black text-purple-700">
                  +${((adicionalPrecioVenta * 0.10) * adicionalCantidad).toFixed(2)} USD
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-purple-200" />
                <span>Agregar Adicional a Lista</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main List & Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table of Added Sales */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Detalle de Ventas a Comisionar ({items.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Puedes modificar la cantidad o el precio de venta directamente en la tabla</p>
            </div>

            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Lista</span>
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-3">
              <Calculator className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-600">No hay elementos agregados a la comisión aún.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Utiliza los formularios de arriba para agregar planes de sistema o firmas electrónicas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="p-3 rounded-l-lg">Item / Descripción</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">Precio Venta</th>
                    <th className="p-3 text-right">Comisión Total</th>
                    <th className="p-3 text-center rounded-r-lg">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">
                        <div>{item.nombre}</div>
                        {item.vigencia && (
                          <div className="text-[10px] text-amber-700 font-semibold">
                            Vigencia: {item.vigencia}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {item.categoria === "plan" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 font-black text-[10px] rounded-md uppercase">
                            Plan 30%
                          </span>
                        ) : item.categoria === "adicional" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 font-black text-[10px] rounded-md uppercase">
                            Adicional 10%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded-md uppercase">
                            Firma Margen
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => handleUpdateItem(item.id, "cantidad", parseInt(e.target.value) || 1)}
                          className="w-14 text-center py-1 bg-slate-100 border border-slate-200 rounded-lg font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                        />
                      </td>

                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.precioVenta}
                            onChange={(e) => handleUpdateItem(item.id, "precioVenta", parseFloat(e.target.value) || 0)}
                            className="w-20 text-right py-1 px-1.5 bg-slate-100 border border-slate-200 rounded-lg font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </td>

                      <td className="p-3 text-right font-black text-emerald-600 text-sm">
                        +${item.comisionTotal.toFixed(2)}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Col: Total Commission Summary Box (Con único botón de reporte PDF) */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base">Resumen de Comisión</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                <span>Planes Vendidos:</span>
                <span className="font-bold text-white text-sm">{totalCantPlanes} unidades</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                <span>Firmas Vendidas:</span>
                <span className="font-bold text-white text-sm">{totalCantFirmas} unidades</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                <span>Adicionales Vendidos:</span>
                <span className="font-bold text-white text-sm">{totalCantAdicionales} unidades</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-300">
                <span>Venta Total Bruta:</span>
                <span className="font-bold text-white text-sm">${totalVentaBruta.toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-blue-300">
                <span>Comisión por Planes (30%):</span>
                <span className="font-extrabold text-blue-400 text-sm">+${totalComisionPlanes.toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-purple-300">
                <span>Comisión por Adicionales (10%):</span>
                <span className="font-extrabold text-purple-400 text-sm">+${totalComisionAdicionales.toFixed(2)} USD</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-amber-300">
                <span>Ganancia por Firmas:</span>
                <span className="font-extrabold text-amber-400 text-sm">+${totalComisionFirmas.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Total Highlight Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-5 rounded-2xl text-white shadow-lg text-center space-y-1">
              <span className="text-[11px] uppercase font-black tracking-widest text-emerald-100">
                VALOR TOTAL A COMISIONAR
              </span>
              <div className="text-3xl font-black text-white drop-shadow-xs">
                ${totalComisionFinal.toFixed(2)} USD
              </div>
              <p className="text-[10px] text-emerald-100 font-medium pt-1">
                Aprobado para pago
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generar Reporte PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* HIDDEN PRINTABLE REPORT TEMPLATE FOR DIRECT PDF GENERATION */}
      <div className="fixed -left-[9999px] -top-[9999px] w-[800px] bg-white text-slate-900 pointer-events-none opacity-0">
        <div id="printable-commission-report" style={{ backgroundColor: "#ffffff", padding: "28px" }} className="space-y-6">
          {/* Brand Logo Header - Clean Company Name & Slogan only */}
          <div style={{ textAlign: "center", borderBottom: "2px solid #0B2545", paddingBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "6px" }}>
              <GodiOfficialLogo size="md" />
            </div>
            <p style={{ fontSize: "11px", fontWeight: "bold", color: "#0B2545", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
              Plataforma Empresarial GoDi
            </p>
          </div>

          {/* Title - REPORTE DE COMISIONES */}
          <div style={{ textAlign: "center", paddingTop: "2px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0B2545", textTransform: "uppercase", margin: 0 }}>
              Reporte de Comisiones
            </h2>
          </div>

          {/* Distribuidor Details - Cleanly Justified with Single Date */}
          <div style={{ backgroundColor: "#f8fafc", padding: "16px 20px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: "11px", fontWeight: "800", color: "#0B2545", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px" }}>
              Datos del Distribuidor
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ color: "#64748b", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", display: "block", marginBottom: "2px" }}>
                  Distribuidor:
                </span>
                <span style={{ color: "#0f172a", fontWeight: "900", fontSize: "14px" }}>
                  {nombreDistribuidor || "No especificado"}
                </span>
              </div>

              <div style={{ textAlign: "left" }}>
                <span style={{ color: "#64748b", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", display: "block", marginBottom: "2px" }}>
                  Cédula / RUC:
                </span>
                <span style={{ color: "#0f172a", fontWeight: "900", fontSize: "14px" }}>
                  {cedulaDistribuidor || "No especificado"}
                </span>
              </div>

              <div style={{ textAlign: "left" }}>
                <span style={{ color: "#64748b", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", display: "block", marginBottom: "2px" }}>
                  Observaciones / Período:
                </span>
                <span style={{ color: "#1e293b", fontWeight: "600", fontSize: "13px" }}>
                  {observaciones || "Sin observaciones"}
                </span>
              </div>

              <div style={{ textAlign: "left" }}>
                <span style={{ color: "#64748b", fontWeight: "bold", textTransform: "uppercase", fontSize: "10px", display: "block", marginBottom: "2px" }}>
                  Fecha de Liquidación:
                </span>
                <span style={{ color: "#1e293b", fontWeight: "700", fontSize: "13px" }}>
                  {fechaReporte}
                </span>
              </div>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div style={{ spaceY: "8px" }}>
            <h4 style={{ fontWeight: "800", color: "#0f172a", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #cbd5e1", paddingBottom: "4px", marginBottom: "8px" }}>
              Detalle de Ventas Registradas
            </h4>

            <table style={{ width: "100%", textAlign: "left", fontSize: "12px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#0B2545", color: "#ffffff", fontWeight: "bold", fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "8px", border: "1px solid #1e3a8a", color: "#ffffff" }}>Descripción</th>
                  <th style={{ padding: "8px", border: "1px solid #1e3a8a", color: "#ffffff" }}>Tipo</th>
                  <th style={{ padding: "8px", border: "1px solid #1e3a8a", textAlign: "center", color: "#ffffff" }}>Cant.</th>
                  <th style={{ padding: "8px", border: "1px solid #1e3a8a", textAlign: "right", color: "#ffffff" }}>Precio Venta</th>
                  <th style={{ padding: "8px", border: "1px solid #1e3a8a", textAlign: "right", color: "#ffffff" }}>Comisión Total</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "16px", textAlign: "center", color: "#64748b", fontStyle: "italic", border: "1px solid #e2e8f0" }}>
                      Sin registros de venta en el período.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", fontWeight: "bold", color: "#0f172a" }}>
                        {item.nombre} {item.vigencia ? `(${item.vigencia})` : ""}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", color: "#475569", fontWeight: "600", fontSize: "10px", textTransform: "uppercase" }}>
                        {item.categoria === "plan" ? "Plan (30%)" : item.categoria === "adicional" ? "Adicional (10%)" : "Firma (Margen)"}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "center", fontWeight: "bold", color: "#0f172a" }}>{item.cantidad}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", color: "#0f172a" }}>${item.precioVenta.toFixed(2)}</td>
                      <td style={{ padding: "8px", border: "1px solid #e2e8f0", textAlign: "right", fontWeight: "900", color: "#047857" }}>
                        ${item.comisionTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Box - Clean, Spacious & Single Line Layout without dark box frame */}
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "12px" }}>
            <div style={{ width: "400px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "8px", marginBottom: "8px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Total Planes Vendidos:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>{totalCantPlanes}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "8px", marginBottom: "8px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Total Firmas Vendidas:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>{totalCantFirmas}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "8px", marginBottom: "8px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Total Adicionales Vendidos:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>{totalCantAdicionales}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #cbd5e1", paddingBottom: "8px", marginBottom: "8px", whiteSpace: "nowrap" }}>
                <span style={{ color: "#475569", fontWeight: "700" }}>Monto Total Vendido:</span>
                <span style={{ fontWeight: "800", color: "#0f172a", fontSize: "14px" }}>${totalVentaBruta.toFixed(2)} USD</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", marginTop: "4px", fontSize: "15px", fontWeight: "900", color: "#047857", borderTop: "2px solid #0B2545", whiteSpace: "nowrap" }}>
                <span>A COMISIONAR:</span>
                <span style={{ fontSize: "18px", color: "#047857" }}>${totalComisionFinal.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Signatures Spot - Solo Firma del Distribuidor */}
          <div style={{ paddingTop: "40px", display: "flex", justifyContent: "center", textAlign: "center", fontSize: "12px" }}>
            <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "8px", width: "260px" }}>
              <p style={{ fontWeight: "900", color: "#0f172a", margin: 0, fontSize: "14px" }}>{nombreDistribuidor || "Distribuidor"}</p>
              {cedulaDistribuidor && (
                <p style={{ fontSize: "11px", color: "#475569", margin: "2px 0 0 0", fontWeight: "600" }}>C.I. / RUC: {cedulaDistribuidor}</p>
              )}
              <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0 0", textTransform: "uppercase" }}>Firma del Distribuidor</p>
            </div>
          </div>

          {/* Legal Disclaimer / Nota Importante */}
          <div
            style={{
              marginTop: "24px",
              padding: "14px 18px",
              backgroundColor: "#f8fafc",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#1e293b",
              lineHeight: "1.45",
              textAlign: "justify",
            }}
          >
            <p style={{ fontWeight: "900", color: "#0f172a", margin: "0 0 6px 0", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Importante:
            </p>
            <p style={{ margin: "0 0 6px 0" }}>
              Este documento es únicamente de carácter informativo y referencial. No constituye un documento con validez legal, contractual o tributaria, ni representa un compromiso de pago. Asimismo, no tiene relación oficial con UpConta, ANF ni con ninguna de las empresas aliadas.
            </p>
            <p style={{ margin: "0 0 6px 0" }}>
              Su único propósito es servir como herramienta de consulta para que el distribuidor lleve un control interno y referencial de sus comisiones.
            </p>
            <p style={{ margin: 0 }}>
              Queda estrictamente prohibido utilizar o presentar este documento como respaldo para solicitar, exigir o gestionar el cobro de comisiones ante UpConta, ANF o cualquier empresa aliada, con el fin de evitar confusiones, interpretaciones erróneas o inconvenientes administrativos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
