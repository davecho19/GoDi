import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Layers, 
  HelpCircle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Globe, 
  Bookmark, 
  Briefcase, 
  Check,
  Copy,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  User,
  Users,
  FileSpreadsheet,
  Building2,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Percent,
  Mail,
  Phone,
  Calculator,
  Download,
  Image,
  Share2,
  Send,
  Sliders,
  Shield,
  FileCheck,
  Palette,
  Key,
  Smartphone,
  Cloud,
  Award,
  Lock,
  ShieldCheck,
  Zap,
  Flame,
  BarChart3,
  Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PLANES_DATA, 
  MODULOS_POR_TIER, 
  DETALLE_SUBMODULOS, 
  NICHOS_DATA, 
  ASESORES_DATA, 
  ADICIONALES_ESTANDAR, 
  ADICIONALES_CONTADOR, 
  COMPROBANTES_ADICIONALES_CONTADOR,
  Plan,
  AsesorInfo,
  FIRMAS_DATA,
  FirmaElectronica
} from "./data";
import { jsPDF } from "jspdf";
import { AdminModuleMockups } from "./components/AdminModuleMockups";
import { ColorPickerDialog } from "./components/ColorPickerDialog";
import { DynamicBrandLogo, UpContaLogo, AnfLogo, CoBrandLogo } from "./components/GodiLogo";
import { VentasModule } from "./components/VentasModule";
import { ContadorModule } from "./components/ContadorModule";
import { ComisionModule } from "./components/ComisionModule";
import { DashboardModule } from "./components/DashboardModule";
import { UpContaMascot } from "./components/UpContaMascot";

export default function App() {
  // Main Tab State: "plan", "explorador", "simulador", "firmas", "contador", "comision"
  const [activeTab, setActiveTab] = useState<"plan" | "explorador" | "simulador" | "firmas" | "contador" | "comision">("plan");

  // Category tab state
  const [tipoPlan, setTipoPlan] = useState<"facturacion" | "erp" | "contador">("facturacion");
  
  // Selected plan inside active category
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");

  // Selected electronic signatures in quoter
  const [selectedSignatures, setSelectedSignatures] = useState<Array<{
    tipo: string;
    vigencia: string;
    precio: number;
    cantidad: number;
  }>>([]);

  // Billing Cycle: monthly or annual (annual gets a 10% discount)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Selected administrative module in showcase list
  const [selectedAdminModule, setSelectedAdminModule] = useState<string>("Punto de venta");

  // Active module for deep technical breakdown (drill-down list)
  const [activeModule, setActiveModule] = useState<string>("ADMINISTRATIVO");

  // Search filter for modules or features
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>("");

  // Default proposal notes requested by user
  const DEFAULT_CLIENT_NOTES = "Nuestra solución se adapta a las necesidades de su empresa, integrando únicamente los módulos que aportan valor a su operación. De esta manera, podrá administrar todos sus procesos desde una única plataforma, optimizando tiempo, recursos y productividad.";

  // Live Calculator States
  const [clientName, setClientName] = useState<string>("");
  const [clientRuc, setClientRuc] = useState<string>("");
  const [clientNotes, setClientNotes] = useState<string>(DEFAULT_CLIENT_NOTES);
  const [calcQuantity, setCalcQuantity] = useState<number>(1);
  
  // Manual Advisor States (editable)
  const [advisorName, setAdvisorName] = useState<string>("");
  const [advisorEmail, setAdvisorEmail] = useState<string>("");
  const [advisorPhone, setAdvisorPhone] = useState<string>("");

  // Selected electronic signature type tab state
  const [selectedSigType, setSelectedSigType] = useState<"PERSONA NATURAL" | "PERSONA NATURAL RUC" | "PERSONA JURIDICA" | "PROMO EMPRENDE">("PERSONA NATURAL");

  // Custom Client Logo
  const [customLogo, setCustomLogo] = useState<string>("");
  const [customLogoName, setCustomLogoName] = useState<string>("");
  const [customPlanPrice, setCustomPlanPrice] = useState<number | null>(null);
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);

  // Custom PDF Background Image (Watermark)
  const [pdfBgImage, setPdfBgImage] = useState<string>("");
  const [pdfBgImageName, setPdfBgImageName] = useState<string>("");
  const [pdfBgOpacity, setPdfBgOpacity] = useState<number>(0.15); // Default 15% watermark opacity

  // Customizable PDF Colors & Titles
  const [pdfBgColor, setPdfBgColor] = useState<string>("#0b2545");
  const [pdfTitleColor, setPdfTitleColor] = useState<string>("#0b2545");
  const [pdfSubtitleColor, setPdfSubtitleColor] = useState<string>("#475569");

  // State for Color Picker Dialog ("Abanico de Colores")
  const [colorPickerTarget, setColorPickerTarget] = useState<"bg" | "title" | "sub" | null>(null);

  // State for Firmas Electrónicas Tab Widget
  const [firmaTypeSelect, setFirmaTypeSelect] = useState<string>("PERSONA NATURAL");
  const [selectedVigencias, setSelectedVigencias] = useState<string[]>(["2 AÑOS"]);
  const firmaVigenciaSelect = selectedVigencias[0] || "1 AÑO";
  const [firmaQtySelect, setFirmaQtySelect] = useState<number>(1);

  const handleToggleVigencia = (v: string) => {
    if (selectedVigencias.includes(v)) {
      if (selectedVigencias.length > 1) {
        setSelectedVigencias(selectedVigencias.filter(item => item !== v));
      } else {
        setSelectedVigencias([v]);
      }
    } else {
      if (selectedVigencias.length === 1) {
        setSelectedVigencias([...selectedVigencias, v]);
      } else {
        setSelectedVigencias([selectedVigencias[1] || selectedVigencias[0], v]);
      }
    }
  };
  const [copiedRequirements, setCopiedRequirements] = useState<boolean>(false);
  const [copiedBankText, setCopiedBankText] = useState<boolean>(false);
  const [copiedBankImage, setCopiedBankImage] = useState<boolean>(false);
  const [copiedUpContaBankText, setCopiedUpContaBankText] = useState<boolean>(false);
  const [copiedUpContaBankImage, setCopiedUpContaBankImage] = useState<boolean>(false);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  const handleCopyRequirements = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRequirements(true);
    setTimeout(() => setCopiedRequirements(false), 2500);
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2500);
  };

  const handleCopyBankText = () => {
    const bankText = `🏦 *DATOS BANCARIOS OFICIALES PARA TRANSFERENCIA* 🏦\n\n• *Razón Social:* ANFAC AUTORIDAD DE CERTIFICACIÓN ECUADOR C.A.\n• *RUC:* 1792601215001\n• *Banco:* Banco Internacional\n• *Tipo de Cuenta:* Cuenta Corriente\n• *Número de Cuenta:* 0700626089\n• *Correo:* info@anf.ac\n• *Teléfono:* 02 3826877\n• *Dirección:* Av. 12 de Octubre N24-739 y av. Colón. Edif. Torre Boreal, Torre A, Piso 6 Of. 603\n\n📌 *Por favor envíanos el comprobante de transferencia a este chat para procesar tu firma de inmediato.*`;
    navigator.clipboard.writeText(bankText);
    setCopiedBankText(true);
    setTimeout(() => setCopiedBankText(false), 2500);
  };

  const handleCopyBankImage = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 850;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        handleCopyBankText();
        return;
      }

      // Card Background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(0, 0, 850, 420, 16);
      ctx.fill();

      // Border (Yellow/Gold)
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#eab308";
      ctx.stroke();

      // Header Banner (Dark Blue)
      ctx.fillStyle = "#0B2545";
      ctx.beginPath();
      ctx.roundRect(0, 0, 850, 70, [16, 16, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("DATOS PARA PAGO - DEPÓSITO O TRANSFERENCIA", 35, 42);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("ANF AC", 815, 42);

      // Details (Full width layout starting at X=45)
      ctx.textAlign = "left";
      const startX = 45;
      let currY = 110;

      ctx.fillStyle = "#ca8a04";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("▶ Razón Social:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("ANFAC AUTORIDAD DE CERTIFICACIÓN ECUADOR C.A.", startX + 155, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("▶ RUC:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("1792601215001", startX + 80, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.fillText("▶ Banco:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("Banco Internacional", startX + 100, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.fillText("▶ Tipo de cuenta:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("Cuenta Corriente", startX + 175, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.fillText("▶ Número de Cuenta:", startX, currY);
      ctx.fillStyle = "#0284c7";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("0700626089", startX + 200, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("▶ Correo electrónico:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("info@anf.ac", startX + 200, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.fillText("▶ Teléfono:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("02 3826877", startX + 110, currY);

      currY += 38;
      ctx.fillStyle = "#ca8a04";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("▶ Dirección:", startX, currY);
      ctx.fillStyle = "#334155";
      ctx.font = "14px sans-serif";
      ctx.fillText("Av. 12 de Octubre N24-739 y av. Colón. Edif. Torre Boreal, Torre A, Piso 6 Of. 603", startX + 110, currY);

      // Bottom Bar (Dark Blue with Yellow text)
      ctx.fillStyle = "#0B2545";
      ctx.fillRect(0, 380, 850, 40);
      ctx.fillStyle = "#f59e0b";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ANFAC AUTORIDAD DE CERTIFICACIÓN ECUADOR C.A. • www.anf.ac", 425, 405);

      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            setCopiedBankImage(true);
            setTimeout(() => setCopiedBankImage(false), 2500);
          } catch {
            handleCopyBankText();
          }
        } else {
          handleCopyBankText();
        }
      });
    } catch {
      handleCopyBankText();
    }
  };

  const handleCopyUpContaBankText = () => {
    const bankText = `🏦 *DATOS BANCARIOS OFICIALES UPCONTA S.A.S.* 🏦\n\n• *Razón Social:* UPCONTA S.A.S.\n• *RUC:* 1793221216001\n• *Banco:* Banco Pichincha\n• *Tipo de Cuenta:* Ahorros\n• *Número de Cuenta:* 2212935613\n• *Correo:* tesoreria@upconta.com\n• *Teléfono:* 02 382 6772\n• *Sitio Web:* www.upconta.com\n\n📌 *Por favor envíanos el comprobante de pago a este chat para procesar tu activación de inmediato.*`;
    navigator.clipboard.writeText(bankText);
    setCopiedUpContaBankText(true);
    setTimeout(() => setCopiedUpContaBankText(false), 2500);
  };

  const handleCopyUpContaBankImage = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 850;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        handleCopyUpContaBankText();
        return;
      }

      // Card Background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(0, 0, 850, 420, 16);
      ctx.fill();

      // Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#f97316";
      ctx.stroke();

      // Header Banner
      ctx.fillStyle = "#0B2545";
      ctx.beginPath();
      ctx.roundRect(0, 0, 850, 70, [16, 16, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "#f97316";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("DATOS PARA PAGO - DEPÓSITO O TRANSFERENCIA", 35, 42);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("UPCONTA S.A.S.", 815, 42);

      // Details (Full width layout starting at X=45)
      ctx.textAlign = "left";
      const startX = 45;
      let currY = 115;

      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("▶ Razón Social:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("UPCONTA S.A.S.", startX + 155, currY);

      currY += 40;
      ctx.fillStyle = "#ea580c";
      ctx.fillText("▶ RUC:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("1793221216001", startX + 80, currY);

      currY += 40;
      ctx.fillStyle = "#ea580c";
      ctx.fillText("▶ Banco:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("Banco Pichincha", startX + 100, currY);

      currY += 40;
      ctx.fillStyle = "#ea580c";
      ctx.fillText("▶ Tipo de cuenta:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("Ahorros", startX + 175, currY);

      currY += 40;
      ctx.fillStyle = "#ea580c";
      ctx.fillText("▶ Número de Cuenta:", startX, currY);
      ctx.fillStyle = "#0284c7";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("2212935613", startX + 200, currY);

      currY += 40;
      ctx.fillStyle = "#ea580c";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText("▶ Correo electrónico:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("tesoreria@upconta.com", startX + 200, currY);

      currY += 40;
      ctx.fillStyle = "#ea580c";
      ctx.fillText("▶ Teléfono:", startX, currY);
      ctx.fillStyle = "#0B2545";
      ctx.fillText("02 382 6772", startX + 110, currY);

      // Bottom Bar
      ctx.fillStyle = "#0B2545";
      ctx.fillRect(0, 380, 850, 40);
      ctx.fillStyle = "#f97316";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("UPCONTA S.A.S. • www.upconta.com", 425, 405);

      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            setCopiedUpContaBankImage(true);
            setTimeout(() => setCopiedUpContaBankImage(false), 2500);
          } catch {
            handleCopyUpContaBankText();
          }
        } else {
          handleCopyUpContaBankText();
        }
      });
    } catch {
      handleCopyUpContaBankText();
    }
  };

  const handleAddSignatureDirect = (tipo: string, vigencia: string, precio: number, qty: number = 1) => {
    const existingIndex = selectedSignatures.findIndex(s => s.tipo === tipo && s.vigencia === vigencia);
    if (existingIndex > -1) {
      const updated = [...selectedSignatures];
      updated[existingIndex].cantidad += qty;
      setSelectedSignatures(updated);
    } else {
      setSelectedSignatures([...selectedSignatures, { tipo, vigencia, precio, cantidad: qty }]);
    }
  };

  // Extra modules / Add-ons added to quotation
  const [selectedAddons, setSelectedAddons] = useState<Array<{
    nombre: string;
    precio: number;
    cantidad: number;
  }>>([]);

  const [selectedProposalPlans, setSelectedProposalPlans] = useState<Array<{
    id: string;
    tipoPlan: "facturacion" | "erp" | "contador" | "cloud";
    nombre: string;
    precioBase: number;
    precioPersonalizado: number | null;
    cantidad: number;
    billingCycle: "monthly" | "annual";
    cycleLabel: string;
  }>>([]);

  const [planDiscountPct, setPlanDiscountPct] = useState<number>(0);
  const [quoteCopied, setQuoteCopied] = useState<boolean>(false);
  const [quoteShared, setQuoteShared] = useState<boolean>(false);
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);

  // Auto-select first plan when category changes - disabled by user request so no plan is selected by default
  useEffect(() => {
    if (tipoPlan !== "erp") {
      setBillingCycle("annual");
    }
  }, [tipoPlan]);

  // Reset custom plan price whenever plan selection or cycle changes
  useEffect(() => {
    setCustomPlanPrice(null);
  }, [selectedPlanName, billingCycle, tipoPlan]);

  const activePlanList = PLANES_DATA[tipoPlan] || [];
  const viewedPlanObj = (selectedPlanName && activePlanList.find(p => p.nombre === selectedPlanName)) || activePlanList[0] || null;

  // Sync active module when plan changes based on its tier modules
  useEffect(() => {
    if (viewedPlanObj) {
      const tierModules = MODULOS_POR_TIER[viewedPlanObj.tier] || [];
      if (tierModules.length > 0 && !tierModules.includes(activeModule)) {
        setActiveModule(tierModules[0]);
      }
    }
  }, [viewedPlanObj]);

  // Extract components like Users count and Vouchers count from the modulos list
  const extractQuickMetrics = (modulosList: string[]) => {
    const userItem = modulosList.find(m => /usuario/i.test(m)) || "Usuarios Ilimitados";
    let voucherItem = modulosList.find(m => /comprobante/i.test(m));
    if (!voucherItem) {
      voucherItem = tipoPlan === "contador" ? "No incluye comprobantes" : "Comprobantes Ilimitados";
    }
    const companyItem = modulosList.find(m => /empresa/i.test(m)) || "";
    
    return {
      usuarios: userItem,
      comprobantes: voucherItem,
      empresas: companyItem
    };
  };

  // Default base price calculation for currently selected dropdown plan
  let defaultBasePrice = 0;
  let cycleLabel = "/mes";
  if (viewedPlanObj) {
    if (tipoPlan === "erp") {
      if (billingCycle === "annual") {
        defaultBasePrice = viewedPlanObj.precioAnual || (viewedPlanObj.precio * 12);
        cycleLabel = "/año";
      } else {
        defaultBasePrice = viewedPlanObj.precio;
        cycleLabel = "/mes";
      }
    } else {
      defaultBasePrice = viewedPlanObj.precio;
      cycleLabel = "/mes";
    }
  }

  // Handle Proposal Plans Management
  const handleAddProposalPlan = (overridePlanObj?: typeof viewedPlanObj) => {
    const planToUse = overridePlanObj || viewedPlanObj;
    if (!planToUse) return;

    let defaultPrice = planToUse.precio;
    let cycleLbl = "/mes";
    if (tipoPlan === "erp") {
      if (billingCycle === "annual") {
        defaultPrice = planToUse.precioAnual || (planToUse.precio * 12);
        cycleLbl = "/año";
      } else {
        defaultPrice = planToUse.precio;
        cycleLbl = "/mes";
      }
    }

    const priceToUse = customPlanPrice !== null ? customPlanPrice : defaultPrice;
    const qtyToUse = calcQuantity || 1;

    const existingIndex = selectedProposalPlans.findIndex(
      p => p.tipoPlan === tipoPlan && p.nombre === planToUse.nombre && p.billingCycle === billingCycle
    );

    if (existingIndex >= 0) {
      setSelectedProposalPlans(prev => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, cantidad: item.cantidad + qtyToUse } : item
      ));
    } else {
      setSelectedProposalPlans(prev => [
        ...prev,
        {
          id: `${tipoPlan}-${planToUse.nombre}-${billingCycle}-${Date.now()}`,
          tipoPlan,
          nombre: planToUse.nombre,
          precioBase: defaultPrice,
          precioPersonalizado: customPlanPrice !== null ? customPlanPrice : null,
          cantidad: qtyToUse,
          billingCycle,
          cycleLabel: cycleLbl
        }
      ]);
    }
  };

  const handleRemoveProposalPlan = (id: string) => {
    setSelectedProposalPlans(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProposalPlanQty = (id: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveProposalPlan(id);
    } else {
      setSelectedProposalPlans(prev => prev.map(p => p.id === id ? { ...p, cantidad: qty } : p));
    }
  };

  const handleUpdateProposalPlanPrice = (id: string, newPrice: number) => {
    setSelectedProposalPlans(prev => prev.map(p => p.id === id ? { ...p, precioPersonalizado: newPrice } : p));
  };

  // Financial calculations
  const planSubtotal = selectedProposalPlans.reduce((sum, item) => {
    const unitPrice = item.precioPersonalizado !== null ? item.precioPersonalizado : item.precioBase;
    return sum + (unitPrice * item.cantidad);
  }, 0);

  const planDiscountAmount = planSubtotal * (planDiscountPct / 100);
  const planNetTotal = planSubtotal - planDiscountAmount;

  // Addons subtotal fixed price
  const isErpAnnual = tipoPlan === "erp" && billingCycle === "annual";
  const addonsSubtotal = selectedAddons.reduce((acc, addon) => acc + (addon.precio * addon.cantidad), 0);
  const addonsNetTotal = addonsSubtotal;

  const signaturesSubtotal = selectedSignatures.reduce((acc, sig) => acc + (sig.precio * sig.cantidad), 0);

  // Calculate 15% IVA on all plans & add-ons
  const planTaxable = planNetTotal;
  const addonsTaxable = addonsNetTotal;
  const signaturesTaxable = 0; // Firmas electrónicas exentas de IVA 15%

  const preTaxTotal = planNetTotal + addonsNetTotal + signaturesSubtotal;
  const taxableBase = planTaxable + addonsTaxable;
  const taxAmount = taxableBase * 0.15; // 15% VAT
  const grandTotal = preTaxTotal + taxAmount;

  // Handle Addon Management
  const handleAddAddon = (addonName: string, price: number) => {
    const existing = selectedAddons.find(a => a.nombre === addonName);
    if (existing) {
      setSelectedAddons(selectedAddons.map(a => 
        a.nombre === addonName ? { ...a, cantidad: a.cantidad + 1 } : a
      ));
    } else {
      setSelectedAddons([...selectedAddons, { nombre: addonName, precio: price, cantidad: 1 }]);
    }
  };

  const handleRemoveAddon = (addonName: string) => {
    setSelectedAddons(selectedAddons.filter(a => a.nombre !== addonName));
  };

  const handleUpdateAddonQty = (addonName: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveAddon(addonName);
    } else {
      setSelectedAddons(selectedAddons.map(a => 
        a.nombre === addonName ? { ...a, cantidad: qty } : a
      ));
    }
  };

  const handleUpdateAddonPrice = (addonName: string, price: number) => {
    setSelectedAddons(selectedAddons.map(a => 
      a.nombre === addonName ? { ...a, precio: price } : a
    ));
  };

  // Handle Electronic Signatures Management
  const handleAddSignature = (tipo: string, vigencia: string, precio: number) => {
    const existing = selectedSignatures.find(s => s.tipo === tipo && s.vigencia === vigencia);
    if (existing) {
      setSelectedSignatures(selectedSignatures.map(s => 
        (s.tipo === tipo && s.vigencia === vigencia) ? { ...s, cantidad: s.cantidad + 1 } : s
      ));
    } else {
      setSelectedSignatures([...selectedSignatures, { tipo, vigencia, precio, cantidad: 1 }]);
    }
  };

  const handleRemoveSignature = (tipo: string, vigencia: string) => {
    setSelectedSignatures(selectedSignatures.filter(s => !(s.tipo === tipo && s.vigencia === vigencia)));
  };

  const handleUpdateSignatureQty = (tipo: string, vigencia: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveSignature(tipo, vigencia);
    } else {
      setSelectedSignatures(selectedSignatures.map(s => 
        (s.tipo === tipo && s.vigencia === vigencia) ? { ...s, cantidad: qty } : s
      ));
    }
  };

  const handleUpdateSignaturePrice = (tipo: string, vigencia: string, price: number) => {
    setSelectedSignatures(selectedSignatures.map(s => 
      (s.tipo === tipo && s.vigencia === vigencia) ? { ...s, precio: price } : s
    ));
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [11, 60, 93];
  };

  // Generate clean textual proposal for clipboard
  const generateProposalText = () => {
    let text = `PROPUESTA COMERCIAL\n\n`;
    text += `CLIENTE: ${clientName ? clientName.toUpperCase() : "ESTIMADO CLIENTE"}\n`;
    if (clientRuc) text += `RUC / C.I: ${clientRuc}\n`;
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    text += `FECHA DE EMISIÓN: ${dateStr}\n`;
    text += `MODALIDAD DE COBRO: ${billingCycle === "annual" ? "Anual" : "Mensual"}\n\n`;
    
    if (selectedProposalPlans.length > 0) {
      text += `DETALLE DE PLANES SELECCIONADOS:\n`;
      selectedProposalPlans.forEach(plan => {
        text += `* Plan: ${plan.nombre.toUpperCase()} (${plan.tipoPlan.toUpperCase()})\n`;
      });
    } else if (viewedPlanObj) {
      text += `DETALLE DE PLANES SELECCIONADOS:\n`;
      text += `* Plan: ${viewedPlanObj.nombre.toUpperCase()} (${tipoPlan.toUpperCase()})\n`;
    }

    if (selectedAddons.length > 0) {
      text += `MÓDULOS ADICIONALES :\n`;
      selectedAddons.forEach(addon => {
        const addonTotal = addon.precio * addon.cantidad;
        const cleanName = addon.nombre.replace(/^ADD-ON:\s*/i, '').toUpperCase();
        text += `* ${cleanName} x${addon.cantidad}: $${addonTotal.toFixed(2)}\n`;
      });
    }

    if (selectedSignatures.length > 0) {
      text += `FIRMAS ELECTRÓNICAS (SRI):\n`;
      selectedSignatures.forEach(sig => {
        const sigTotal = sig.precio * sig.cantidad;
        const sigName = `${sig.tipo} (${sig.vigencia})`.toUpperCase();
        text += `* Firma: ${sigName} x${sig.cantidad}: $${sigTotal.toFixed(2)}\n`;
      });
    }

    text += `\nRESUMEN FINANCIERO:\n`;
    text += `* Valor a cancelar con impuestos: $${grandTotal.toFixed(2)} USD\n`;
    text += `Quedamos a su entera disposición para cualquier inquietud.`;
    
    return text;
  };

  const copyToClipboard = () => {
    const text = generateProposalText();
    navigator.clipboard.writeText(text);
    setQuoteCopied(true);
    setTimeout(() => setQuoteCopied(false), 3000);
  };

  const shareOnWhatsApp = () => {
    const text = generateProposalText();
    const cleanPhone = advisorPhone.replace(/[\s+]/g, "");
    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, "_blank");
    setQuoteShared(true);
    setTimeout(() => setQuoteShared(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setCustomLogo(base64Str);
        setCustomLogoName(file.name);
        
        const img = new window.Image();
        img.onload = () => {
          setLogoDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = base64Str;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        setPdfBgImage(base64Str);
        setPdfBgImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // HIGH-FIDELITY PDF PROPOSAL GENERATION (jsPDF)
  const handleGenerarPDF = () => {
    if (!clientName.trim()) {
      alert("Por favor ingrese el Nombre o Empresa del cliente.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const PAGE_W = 210;
    const PAGE_H = 297;
    const MX = 14;

    // Retrieve customized colors or fallback to UpConta theme
    const C_PRIMARY: [number, number, number] = hexToRgb(pdfBgColor);
    const C_SECONDARY: [number, number, number] = hexToRgb(pdfTitleColor);
    const C_TEXT_DIM: [number, number, number] = hexToRgb(pdfSubtitleColor);
    const C_LIGHT_BG: [number, number, number] = [240, 246, 250];
    const C_WHITE: [number, number, number] = [255, 255, 255];
    const C_BORDER: [number, number, number] = [180, 198, 211];

    // Compute contrast for dark vs light header fills to guarantee 100% legibility
    const primaryLuma = 0.299 * C_PRIMARY[0] + 0.587 * C_PRIMARY[1] + 0.114 * C_PRIMARY[2];
    const C_HEADER_TEXT: [number, number, number] = primaryLuma < 165 ? [255, 255, 255] : [15, 23, 42];
    const C_BANNER_PRICE: [number, number, number] = primaryLuma < 165 ? [255, 255, 255] : [11, 37, 69];

    // Frame/Border & Background Drawing helper
    const drawPageStructure = () => {
      // Clean background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, PAGE_W, PAGE_H, "F");

      // Custom Background Watermark Image covering both pages if configured
      if (pdfBgImage) {
        try {
          (pdf as any).setGState(new (pdf as any).GState({ opacity: pdfBgOpacity }));
          pdf.addImage(pdfBgImage, "JPEG", 0, 0, PAGE_W, PAGE_H);
          (pdf as any).setGState(new (pdf as any).GState({ opacity: 1.0 }));
        } catch (err) {
          console.error("Error drawing background image watermark:", err);
          try {
            (pdf as any).setGState(new (pdf as any).GState({ opacity: 1.0 }));
          } catch (e) {}
        }
      }

      // Draw elegant subtle border frame
      pdf.setDrawColor(...C_BORDER);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(6, 6, PAGE_W - 12, PAGE_H - 12, 4, 4, "S");

      // Corner accent highlight boxes (Premium UpConta editorial look)
      pdf.setDrawColor(...C_SECONDARY);
      pdf.setLineWidth(1.4);
      const s = 12;
      // Top-right corner highlight
      pdf.line(PAGE_W - 10 - s, 10, PAGE_W - 10, 10);
      pdf.line(PAGE_W - 10, 10, PAGE_W - 10, 10 + s);
      // Bottom-left corner highlight
      pdf.line(10, PAGE_H - 10, 10 + s, PAGE_H - 10);
      pdf.line(10, PAGE_H - 10 - s, 10, PAGE_H - 10);
    };

    // Helper: Draw list key-values in summary
    const drawMetaItem = (lbl: string, val: string, x: number, y: number) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(...C_PRIMARY);
      pdf.text(lbl, x, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...C_TEXT_DIM);
      pdf.text(val, x + pdf.getTextWidth(lbl) + 1.5, y);
    };

    // ----------------- PAGE 1 -----------------
    drawPageStructure();

    // 1. Brand Logo Header Area (Larger size on Page 1)
    let logoH = 0;
    if (customLogo) {
      try {
        let logoW = 65; // enlarged default (was 45)
        logoH = 32; // enlarged default (was 22)
        if (logoDimensions) {
          const aspect = logoDimensions.width / logoDimensions.height;
          // Bound within max-width 78mm and max-height 38mm (was 55 / 26)
          if (aspect > 78 / 38) {
            logoW = 78;
            logoH = 78 / aspect;
          } else {
            logoH = 38;
            logoW = 38 * aspect;
          }
        }
        // Embed the base64 custom client logo keeping its aspect ratio
        pdf.addImage(customLogo, "JPEG", MX, 8, logoW, logoH);
      } catch (e) {
        logoH = 16;
      }
    } else {
      logoH = 16;
    }

    // Right-aligned Proposal Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);
    pdf.setTextColor(...C_PRIMARY);
    pdf.text("PROPUESTA COMERCIAL", PAGE_W - MX, 22, { align: "right" });

    // Dynamic Header divider line ALWAYS positioned strictly below the logo
    const logoBottomY = customLogo ? (8 + logoH) : 22;
    const lineY = Math.max(30, logoBottomY + 4);

    pdf.setDrawColor(...C_PRIMARY);
    pdf.setLineWidth(0.8);
    pdf.line(MX, lineY, PAGE_W - MX, lineY);

    // 2. Client Identity Header Block
    const clientText = clientRuc ? `${clientName.toUpperCase()} - RUC ${clientRuc}` : clientName.toUpperCase();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11.5);
    pdf.setTextColor(...C_PRIMARY);
    pdf.text(clientText, PAGE_W / 2, lineY + 8, { align: "center" });

    // Secondary spacer line
    pdf.setDrawColor(...C_BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(MX, lineY + 12, PAGE_W - MX, lineY + 12);

    // 3. Technical Metadata Column Left
    let dy = lineY + 19;
    const colLeftX = MX;

    const formattedDate = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

    const hasPromoEmprendeSig = selectedSignatures.some(s => s.tipo.toUpperCase().includes("PROMO EMPRENDE"));

    const planNameText = selectedProposalPlans.length > 0 
      ? selectedProposalPlans.map(p => `${p.nombre} (${p.tipoPlan.toUpperCase()})`).join(", ")
      : hasPromoEmprendeSig
      ? "PROMO EMPRENDE (PLAN UP LIGHT + FIRMA ELECTRÓNICA)"
      : viewedPlanObj ? `${viewedPlanObj.nombre} (${tipoPlan.toUpperCase()})` : "COTIZACIÓN BASE";
    drawMetaItem("Planes Seleccionados: ", planNameText, colLeftX, dy);
    dy += 7;

    let metrics = viewedPlanObj ? extractQuickMetrics(viewedPlanObj.modulos) : { comprobantes: "Ilimitados", usuarios: "Ilimitados", empresas: "" };
    if (hasPromoEmprendeSig && selectedProposalPlans.length === 0) {
      metrics = { comprobantes: "70 Comprobantes al año", usuarios: "1 Usuario", empresas: "" };
    }

    drawMetaItem("Comprobantes: ", metrics.comprobantes, colLeftX, dy);
    dy += 7;
    drawMetaItem("Usuarios: ", metrics.usuarios, colLeftX, dy);
    dy += 7;

    if (metrics.empresas) {
      drawMetaItem("Límite de Empresas: ", metrics.empresas, colLeftX, dy);
      dy += 7;
    }

    drawMetaItem("Fecha Emisión: ", formattedDate, colLeftX, dy);
    dy += 7;

    // 4. Detailed Line Items Table
    let tableY = dy + 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(...C_PRIMARY);
    pdf.text("DETALLE DE LA PROPUESTA ECONÓMICA", MX, tableY);
    tableY += 4.5;

    // Columns: DESCRIPTION (60), QUANTITY (18), PRICE (20), TOTAL (20)
    const colWidths = [60, 18, 20, 20];
    const colTitles = ["DESCRIPCIÓN", "CANTIDAD", "PRECIO UNIT.", "VALOR TOTAL"];
    let colX = MX;

    // Draw header row
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    colWidths.forEach((w, idx) => {
      pdf.setFillColor(...C_PRIMARY);
      pdf.setDrawColor(...C_PRIMARY);
      pdf.rect(colX, tableY, w, 7, "FD");
      pdf.setTextColor(...C_HEADER_TEXT);
      pdf.text(colTitles[idx], colX + w / 2, tableY + 4.5, { align: "center" });
      colX += w;
    });
    tableY += 7;

    // Print active proposal plans
    if (selectedProposalPlans.length > 0) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...C_PRIMARY);

      selectedProposalPlans.forEach((p, idx) => {
        let cellX = MX;
        const unitPrice = p.precioPersonalizado !== null ? p.precioPersonalizado : p.precioBase;
        const itemSubtotal = unitPrice * p.cantidad;
        const cells = [
          { text: `PLAN ${p.nombre.toUpperCase()} (${p.tipoPlan.toUpperCase()})`, align: "left" },
          { text: String(p.cantidad), align: "center" },
          { text: `$${unitPrice.toFixed(2)}`, align: "center" },
          { text: `$${itemSubtotal.toFixed(2)}`, align: "right" }
        ];

        cells.forEach((cell, cellIdx) => {
          pdf.setFillColor(...C_LIGHT_BG);
          pdf.setDrawColor(...C_PRIMARY);
          pdf.setLineWidth(0.2);
          const cw = colWidths[cellIdx];
          pdf.rect(cellX, tableY, cw, 7.5, "FD");

          pdf.setTextColor(...C_PRIMARY);
          pdf.setFont("helvetica", cellIdx === 0 ? "bold" : "normal");
          const tX = cell.align === "right" ? cellX + cw - 2.5 : cell.align === "center" ? cellX + cw / 2 : cellX + 3;
          pdf.text(cell.text, tX, tableY + 4.8, { align: cell.align as "left" | "center" | "right" });
          cellX += cw;
        });
        tableY += 7.5;
      });

      // Plan discount row if applicable
      if (planDiscountPct > 0) {
        let cellX = MX;
        const discountCells = [
          `DESCUENTO ESPECIAL PLAN BASE (${planDiscountPct}%)`,
          "",
          "",
          `-$${planDiscountAmount.toFixed(2)}`
        ];
        discountCells.forEach((text, cellIdx) => {
          pdf.setFillColor(254, 242, 242); // soft red bg
          pdf.setDrawColor(...C_PRIMARY);
          pdf.setLineWidth(0.2);
          const cw = colWidths[cellIdx];
          pdf.rect(cellX, tableY, cw, 7, "FD");

          pdf.setTextColor(185, 28, 28); // deep red text
          pdf.setFont("helvetica", cellIdx === 0 ? "bolditalic" : "bold");
          const tX = cellIdx === 3 ? cellX + cw - 2.5 : cellIdx === 0 ? cellX + 3 : cellX + cw / 2;
          pdf.text(text, tX, tableY + 4.5, { align: cellIdx === 3 ? "right" : cellIdx === 0 ? "left" : "center" });
          cellX += cw;
        });
        tableY += 7;
      }
    }

    // Addons table rows (without "ADD-ON:" label)
    if (selectedAddons.length > 0) {
      selectedAddons.forEach((addon, idx) => {
        let cellX = MX;
        const addonTotal = addon.precio * addon.cantidad;
        const cleanAddonName = addon.nombre.replace(/^ADD-ON:\s*/i, '').toUpperCase();
        const cells = [
          { text: cleanAddonName, align: "left" },
          { text: String(addon.cantidad), align: "center" },
          { text: `$${addon.precio.toFixed(2)}`, align: "center" },
          { text: `$${addonTotal.toFixed(2)}`, align: "right" }
        ];

        cells.forEach((cell, cellIdx) => {
          const isOdd = idx % 2 === 1;
          pdf.setFillColor(...(isOdd ? C_LIGHT_BG : [255, 255, 255] as [number, number, number]));
          pdf.setDrawColor(...C_PRIMARY);
          pdf.setLineWidth(0.2);
          const cw = colWidths[cellIdx];
          pdf.rect(cellX, tableY, cw, 7.5, "FD");

          pdf.setTextColor(...C_PRIMARY);
          pdf.setFont("helvetica", cellIdx === 0 ? "bold" : "normal");
          const tX = cell.align === "right" ? cellX + cw - 2.5 : cell.align === "center" ? cellX + cw / 2 : cellX + 3;
          pdf.text(cell.text, tX, tableY + 4.8, { align: cell.align as "left" | "center" | "right" });
          cellX += cw;
        });
        tableY += 7.5;
      });

    }

    // Signatures table rows (without "FIRMA:" label)
    if (selectedSignatures.length > 0) {
      selectedSignatures.forEach((sig, idx) => {
        let cellX = MX;
        const sigTotal = sig.precio * sig.cantidad;
        const isPromo = sig.tipo.toUpperCase().includes("PROMO EMPRENDE");
        const cleanSigName = isPromo 
          ? `PROMO EMPRENDE (${sig.vigencia} - FIRMA ELECTRÓNICA + PLAN LIGHT)`
          : `${sig.tipo} (${sig.vigencia})`.replace(/^FIRMA:\s*/i, '').toUpperCase();
        const cells = [
          { text: cleanSigName, align: "left" },
          { text: String(sig.cantidad), align: "center" },
          { text: `$${sig.precio.toFixed(2)}`, align: "center" },
          { text: `$${sigTotal.toFixed(2)}`, align: "right" }
        ];

        cells.forEach((cell, cellIdx) => {
          const isOdd = idx % 2 === 1;
          pdf.setFillColor(...(isOdd ? C_LIGHT_BG : [255, 255, 255] as [number, number, number]));
          pdf.setDrawColor(...C_PRIMARY);
          pdf.setLineWidth(0.2);
          const cw = colWidths[cellIdx];
          pdf.rect(cellX, tableY, cw, 7.5, "FD");

          pdf.setTextColor(...C_PRIMARY);
          pdf.setFont("helvetica", cellIdx === 0 ? "bold" : "normal");
          const tX = cell.align === "right" ? cellX + cw - 2.5 : cell.align === "center" ? cellX + cw / 2 : cellX + 3;
          pdf.text(cell.text, tX, tableY + 4.8, { align: cell.align as "left" | "center" | "right" });
          cellX += cw;
        });
        tableY += 7.5;
      });
    }

    // 5. Side-by-Side Financial Summary Card (Right column on Page 1)
    const boxX = MX + 118 + 5;
    const boxW = PAGE_W - MX - boxX;
    const boxY = Math.max(54, lineY + 14);
    const boxH = Math.max(tableY - boxY, 40);

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...C_PRIMARY);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(boxX, boxY, boxW, boxH, 2, 2, "FD");

    // Title inside box
    pdf.setFillColor(...C_PRIMARY);
    pdf.rect(boxX + 0.2, boxY + 0.2, boxW - 0.4, 7.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...C_HEADER_TEXT);
    pdf.text("RESUMEN DE INVERSIÓN", boxX + boxW / 2, boxY + 5.2, { align: "center" });

    // Financial line items inside box
    let boxLineY = boxY + 14;
    const drawBoxLine = (label: string, value: string, isTotal = false) => {
      pdf.setFont("helvetica", isTotal ? "bold" : "normal");
      pdf.setFontSize(isTotal ? 9.5 : 8);
      pdf.setTextColor(isTotal ? C_SECONDARY[0] : C_PRIMARY[0], isTotal ? C_SECONDARY[1] : C_PRIMARY[1], isTotal ? C_SECONDARY[2] : C_PRIMARY[2]);
      pdf.text(label, boxX + 3, boxLineY);
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(isTotal ? 10.5 : 8);
      pdf.text(value, boxX + boxW - 3, boxLineY, { align: "right" });
      boxLineY += 5.5;
    };

    if (planSubtotal > 0) {
      drawBoxLine("Subtotal Plan:", `$${planSubtotal.toFixed(2)}`);
      if (planDiscountPct > 0) drawBoxLine(`Desc. Plan (${planDiscountPct}%):`, `-$${planDiscountAmount.toFixed(2)}`);
    }
    
    if (selectedAddons.length > 0) {
      drawBoxLine("Subtotal Adicionales:", `$${addonsSubtotal.toFixed(2)}`);
    }

    if (selectedSignatures.length > 0) {
      drawBoxLine("Subtotal Firmas SRI:", `$${signaturesSubtotal.toFixed(2)}`);
    }

    pdf.setDrawColor(...C_BORDER);
    pdf.setLineWidth(0.2);
    pdf.line(boxX + 2, boxLineY - 2, boxX + boxW - 2, boxLineY - 2);
    boxLineY += 1.5;

    drawBoxLine("Subtotal Neto:", `$${preTaxTotal.toFixed(2)}`);
    drawBoxLine("IVA (15%):", `$${taxAmount.toFixed(2)}`);
    
    pdf.setDrawColor(...C_PRIMARY);
    pdf.setLineWidth(0.4);
    pdf.line(boxX + 1.5, boxLineY - 2.5, boxX + boxW - 1.5, boxLineY - 2.5);
    boxLineY += 2;

    // Large banner total at the bottom of the card
    pdf.setFillColor(...C_PRIMARY);
    pdf.rect(boxX + 0.2, tableY - 10, boxW - 0.4, 9.8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...C_HEADER_TEXT);
    pdf.text("TOTAL ESTIMADO USD", boxX + 4, tableY - 4);
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...C_BANNER_PRICE);
    pdf.text(`$${grandTotal.toFixed(2)}`, boxX + boxW - 4, tableY - 4, { align: "right" });

    // 6. Client Notes block if present (rendered as full width framed box with cyan border & cream background matching layout)
    let nextY = tableY + 11;
    if (clientNotes.trim()) {
      const noteText = clientNotes.trim();
      const noteMaxWidth = PAGE_W - 2 * MX - 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const noteLines = pdf.splitTextToSize(noteText, noteMaxWidth);
      const lineHeight = 4.2;
      const boxHeight = 11 + (noteLines.length * lineHeight);

      pdf.setFillColor(254, 252, 232); // light cream background
      pdf.setDrawColor(56, 189, 248); // sky cyan border matching image
      pdf.setLineWidth(0.4);

      pdf.roundedRect(MX, nextY, PAGE_W - 2 * MX, boxHeight, 2, 2, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(15, 23, 42); // dark navy/black
      pdf.text("NOTA:", MX + 5, nextY + 5.5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(noteText, MX + 5, nextY + 10.5, { maxWidth: noteMaxWidth, align: "justify" });

      nextY += boxHeight + 8;
    }

    // 7. Signature Footer Executive Section (Aligned at the very bottom of Page 1)
    const footerY = PAGE_H - 28;
    pdf.setDrawColor(...C_PRIMARY);
    pdf.setLineWidth(0.5);
    pdf.line(MX, footerY - 5, PAGE_W - MX, footerY - 5);

    // Left Column: Advisor name and title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...C_SECONDARY);
    pdf.text(advisorName.toUpperCase(), MX + 3, footerY + 2);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...C_TEXT_DIM);
    pdf.text("Comercial Corporativo", MX + 3, footerY + 7);

    // Vertical Divider
    pdf.setDrawColor(...C_PRIMARY);
    pdf.setLineWidth(0.5);
    pdf.line(PAGE_W / 2, footerY - 2, PAGE_W / 2, footerY + 12);

    // Right Column: Phone and email
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11.5);
    pdf.setTextColor(...C_PRIMARY);
    pdf.text(advisorPhone || "Contacto Corporativo", PAGE_W / 2 + 10, footerY + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...C_TEXT_DIM);
    pdf.text(advisorEmail || "", PAGE_W / 2 + 10, footerY + 7);


    // ----------------- PAGE 2: TECHNICAL DETAILS -----------------
    pdf.addPage();
    drawPageStructure();

    // Logo on secondary page (checks for customLogo) - enlarged size
    let p2LogoH = 0;
    if (customLogo) {
      try {
        let logoW = 55; // enlarged default (was 38)
        p2LogoH = 25; // enlarged default (was 18)
        if (logoDimensions) {
          const aspect = logoDimensions.width / logoDimensions.height;
          // Bound within max-width 65mm and max-height 30mm (was 45 / 22)
          if (aspect > 65 / 30) {
            logoW = 65;
            p2LogoH = 65 / aspect;
          } else {
            p2LogoH = 30;
            logoW = 30 * aspect;
          }
        }
        pdf.addImage(customLogo, "JPEG", MX, 8, logoW, p2LogoH);
      } catch (e) {
        p2LogoH = 16;
      }
    } else {
      p2LogoH = 16;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(...C_PRIMARY);
    pdf.text("FICHA TÉCNICA Y COBERTURA DE MÓDULOS", PAGE_W - MX, 17, { align: "right" });

    // Dynamic Header divider line ALWAYS positioned strictly below the logo on Page 2
    const p2LogoBottomY = customLogo ? (8 + p2LogoH) : 18;
    const p2LineY = Math.max(25, p2LogoBottomY + 4);

    pdf.setDrawColor(...C_PRIMARY);
    pdf.setLineWidth(0.5);
    pdf.line(MX, p2LineY, PAGE_W - MX, p2LineY);

    // Grid layout for 3 columns on Page 2
    const numCols = 3;
    const colW = (PAGE_W - 2 * MX - 8) / numCols;
    const colGap = 4;
    let cardY = p2LineY + 7;

    // Collect unique modules to display technical cards on Page 2
    const moduleSet = new Set<string>();

    // 1. From selected proposal plans (or viewed plan if none selected)
    if (selectedProposalPlans.length > 0) {
      selectedProposalPlans.forEach(p => {
        let planObj: Plan | undefined;
        Object.values(PLANES_DATA).forEach(planList => {
          const found = planList.find(item => item.nombre.toLowerCase() === p.nombre.toLowerCase());
          if (found) planObj = found;
        });
        const tier = planObj?.tier || (p.tipoPlan === "erp" ? "erp_start" : "basico");
        const mods = MODULOS_POR_TIER[tier] || [];
        mods.forEach(m => moduleSet.add(m));
      });
    } else if (hasPromoEmprendeSig) {
      // Include Plan Light modules (70 comprobantes, 1 usuario) + Impuestos
      const mods = MODULOS_POR_TIER["basico_sin_impuestos"] || [];
      mods.forEach(m => moduleSet.add(m));
      moduleSet.add("IMPUESTOS");
    } else if (viewedPlanObj) {
      const mods = MODULOS_POR_TIER[viewedPlanObj.tier] || [];
      mods.forEach(m => moduleSet.add(m));
    } else {
      (MODULOS_POR_TIER["basico"] || []).forEach(m => moduleSet.add(m));
    }

    if (hasPromoEmprendeSig) {
      const mods = MODULOS_POR_TIER["basico_sin_impuestos"] || [];
      mods.forEach(m => moduleSet.add(m));
      moduleSet.add("IMPUESTOS");
    }

    // 2. From selected add-ons (Módulos Adicionales)
    selectedAddons.forEach(addon => {
      const cleanName = addon.nombre.replace(/^ADD-ON:\s*/i, '').trim().toUpperCase();
      
      if (DETALLE_SUBMODULOS[cleanName]) {
        moduleSet.add(cleanName);
      } else {
        const matchedKey = Object.keys(DETALLE_SUBMODULOS).find(
          k => k.toUpperCase() === cleanName || cleanName.includes(k.toUpperCase())
        );
        if (matchedKey) {
          moduleSet.add(matchedKey);
        } else if (cleanName.includes("LIGHT") || cleanName.includes("BASE") || cleanName.includes("POWER")) {
          const mods = MODULOS_POR_TIER["basico_sin_impuestos"] || [];
          mods.forEach(m => moduleSet.add(m));
        }
      }
    });

    const tierModules = Array.from(moduleSet);

    tierModules.forEach((modName, mIdx) => {
      const colIdx = mIdx % numCols;
      if (mIdx > 0 && colIdx === 0) {
        cardY += 66; // advance to next row height
      }

      // Check if row exceeds page height and needs a new page
      if (cardY + 60 > PAGE_H - 10) {
        pdf.addPage();
        drawPageStructure();

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(...C_PRIMARY);
        pdf.text("FICHA TÉCNICA Y COBERTURA DE MÓDULOS", PAGE_W - MX, 17, { align: "right" });

        const newP2LineY = 25;
        pdf.setDrawColor(...C_PRIMARY);
        pdf.setLineWidth(0.5);
        pdf.line(MX, newP2LineY, PAGE_W - MX, newP2LineY);

        cardY = newP2LineY + 7;
      }

      const x = MX + colIdx * (colW + colGap);

      // Draw single module card
      pdf.setDrawColor(...C_PRIMARY);
      pdf.setLineWidth(0.25);
      pdf.setFillColor(...C_LIGHT_BG);
      pdf.roundedRect(x, cardY, colW, 60, 1.5, 1.5, "FD");

      // Module header
      pdf.setFillColor(...C_PRIMARY);
      pdf.rect(x + 0.2, cardY + 0.2, colW - 0.4, 6.5, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...C_HEADER_TEXT);
      pdf.text(`MÓDULO ${modName}`, x + colW / 2, cardY + 4.5, { align: "center" });

      // Submodules list inside card
      pdf.setTextColor(...C_PRIMARY);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.8);

      const subList = DETALLE_SUBMODULOS[modName] || [];
      let itemY = cardY + 11;

      subList.slice(0, 11).forEach((itemText) => {
        if (itemText.startsWith("##")) {
          // Section header inside card
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(...C_SECONDARY);
          pdf.text(itemText.replace("##", "").toUpperCase(), x + 3, itemY);
          pdf.setFont("helvetica", "normal");
        } else {
          // Bullet point
          pdf.setFillColor(...C_SECONDARY);
          pdf.circle(x + 3.5, itemY - 1, 0.45, "F");
          pdf.setTextColor(...C_PRIMARY);
          pdf.text(itemText, x + 5.5, itemY);
        }
        itemY += 4.1;
      });
    });

    // Page 2 bottom footer block removed (does not say anything about upconta)

    // Save PDF
    const safeClientName = clientName.trim().toUpperCase().replace(/\s+/g, "-") || "CLIENTE";
    pdf.save(`Propuesta-UpConta-${safeClientName}.pdf`);
    setPdfSuccess(true);
    setTimeout(() => setPdfSuccess(false), 5000);
  };

  // Helper to filter submodules or features based on user search
  const getFilteredSubmodules = (moduleName: string) => {
    const rawList = DETALLE_SUBMODULOS[moduleName] || [];
    if (!moduleSearchQuery.trim()) return rawList;
    return rawList.filter(item => 
      item.toLowerCase().includes(moduleSearchQuery.toLowerCase())
    );
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#f4f6f9] text-slate-800 font-sans selection:bg-[#0B2545]/20 antialiased pb-20">
      
      {/* Top Header Navigation */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-2.5">
          
          {/* Top Row: Centered GoDi Logo & Platform Name in a Single Line */}
          <div className="flex flex-col items-center justify-center text-center gap-2 py-1 relative">
            
            {/* Centered GoDi Logo */}
            <div className="flex items-center justify-center">
              <DynamicBrandLogo activeTab={activeTab} size="xl" className="mx-auto drop-shadow-xs" />
            </div>

            {/* Single Line Header Description */}
            <div className="flex items-center justify-center flex-wrap gap-2 text-center text-[#0B2545] py-0.5">
              <span className="flex items-center gap-1.5 font-black text-xs sm:text-sm uppercase tracking-wider text-[#0B2545]">
                <span className={`h-2 w-2 rounded-full animate-pulse ${
                  activeTab === "firmas" ? "bg-amber-500" : "bg-orange-500"
                }`}></span>
                Plataforma Empresarial GoDi
              </span>
              <span className="text-slate-300 font-bold hidden sm:inline">•</span>
              <span className="font-semibold text-xs text-slate-600">
                {activeTab === "firmas"
                  ? "Certificación Digital & Firmas SRI"
                  : activeTab === "simulador"
                  ? "Simulador Interactivo de Precios"
                  : activeTab === "contador"
                  ? "Calculadora Entorno GoDi"
                  : activeTab === "comision"
                  ? "Gestión de Comisiones Comercial"
                  : "Fichas Técnicas & Cotizador"}
              </span>
            </div>

            {/* Quick billing cycle toggle - absolute positioned on right for wide screens */}
            {activeTab === "plan" && tipoPlan === "erp" && (
              <div className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0 mt-2 sm:mt-0">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === "monthly" 
                      ? "bg-[#0B2545] text-white shadow" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Pago Mensual
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    billingCycle === "annual" 
                      ? "bg-[#0B2545] text-white shadow" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Pago Anual</span>
                  <span className="bg-blue-100 text-[#0B2545] border border-blue-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Anual
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Promociones Fixed Banner - Directly under Logo */}
          <div className="w-full bg-gradient-to-r from-[#0B2545] via-[#003566] to-[#0B2545] text-white py-2.5 px-4 rounded-xl border border-amber-400/40 shadow-md flex items-center justify-center gap-3">
            <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Flame className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>PROMOCIÓN</span>
            </span>
            <span className="text-sm sm:text-base font-black tracking-wide text-white drop-shadow-xs text-center">
              Aprovecha nuestras promociones en firmas y facturación
            </span>
          </div>

          {/* Underneath Logo & Banner: INFO group on Left, COMERCIAL group on Right */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            
            {/* GROUP 1: INFO */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs gap-1">
              <div className="px-2.5 py-1 bg-blue-500/10 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-200/50 flex items-center gap-1 shrink-0 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>INFO</span>
              </div>

              <button
                onClick={() => setActiveTab("plan")}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "plan"
                    ? "bg-[#0B2545] text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Plan</span>
              </button>

              <button
                onClick={() => setActiveTab("firmas")}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "firmas"
                    ? "bg-[#0B2545] text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-orange-400" />
                <span>Firmas</span>
              </button>

              <button
                onClick={() => setActiveTab("explorador")}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "explorador"
                    ? "bg-[#0B2545] text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>Explorador</span>
              </button>
            </div>

            {/* GROUP 2: COMERCIAL */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 shadow-2xs gap-1">
              <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-200/50 flex items-center gap-1 shrink-0 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>COMERCIAL</span>
              </div>

              <button
                onClick={() => setActiveTab("simulador")}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "simulador"
                    ? "bg-[#0B2545] text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulador</span>
              </button>

              <button
                onClick={() => setActiveTab("contador")}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "contador"
                    ? "bg-[#0B2545] text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>Contador</span>
              </button>

              <button
                onClick={() => setActiveTab("comision")}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "comision"
                    ? "bg-[#0B2545] text-white shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Comisión</span>
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* ==================================== TABS: PLAN (CATALOGUE & DETAILS) ==================================== */}
        {activeTab === "plan" && (
          <div className="space-y-8 animate-fade-in">
            {/* Step-by-Step Category Picker */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0B2545]" />
                1. Selecciona el Tipo de Plan Contable / Software
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Explora las capacidades analíticas de cada categoría de software para tus clientes o empresa.
              </p>
            </div>
            
            {/* Quick stats indicators */}
            <div className="flex gap-4 text-xs font-medium text-slate-500 flex-wrap">
              <div>Facturación: <span className="text-[#0B2545] font-bold">8 planes</span></div>
              <div className="border-l border-slate-200 pl-4">ERP: <span className="text-[#0B2545] font-bold">3 planes</span></div>
              <div className="border-l border-slate-200 pl-4">Contador: <span className="text-[#0B2545] font-bold">6 planes</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            
            {/* Facturacion Tab */}
            <button
              onClick={() => setTipoPlan("facturacion")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                tipoPlan === "facturacion"
                  ? "bg-blue-50/60 border-[#0B2545] shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-[#0B2545]/10 border border-[#0B2545]/20 text-[#0B2545] rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">Anual</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                Facturación Electrónica
                {tipoPlan === "facturacion" && <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545] animate-ping"></span>}
              </h3>
            </button>

            {/* ERP Tab */}
            <button
              onClick={() => setTipoPlan("erp")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                tipoPlan === "erp"
                  ? "bg-blue-50/60 border-[#0B2545] shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-[#0B2545]/10 border border-[#0B2545]/20 text-[#0B2545] rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">Full Control</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                ERP Administrativo Completo
                {tipoPlan === "erp" && <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545] animate-ping"></span>}
              </h3>
            </button>

            {/* Contador Tab */}
            <button
              onClick={() => setTipoPlan("contador")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                tipoPlan === "contador"
                  ? "bg-blue-50/60 border-[#0B2545] shadow-sm"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-[#0B2545]/10 border border-[#0B2545]/20 text-[#0B2545] rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">Anual Multi-RUC</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                Planes para Contadores
                {tipoPlan === "contador" && <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545] animate-ping"></span>}
              </h3>
            </button>

          </div>
        </section>

        {/* Catalog & Explorer Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Plan Grid (5/12 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Catálogo de Planes Disponibles
              </h3>
              <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                {activePlanList.length} Modelos
              </span>
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {activePlanList.map((p) => {
                  const isSelected = selectedPlanName === p.nombre;
                  
                  let cyclePrice = p.precio;
                  let itemCycleLabel = "/mes";
                  if (tipoPlan === "erp") {
                    if (billingCycle === "annual") {
                      cyclePrice = p.precioAnual || (p.precio * 12);
                      itemCycleLabel = "/año";
                    } else {
                      cyclePrice = p.precio;
                      itemCycleLabel = "/mes";
                    }
                  } else {
                    cyclePrice = p.precio;
                    itemCycleLabel = "/año (Anual)";
                  }

                  return (
                    <motion.div
                      key={p.nombre}
                      layoutId={`plan-card-${p.nombre}`}
                      onClick={() => setSelectedPlanName(p.nombre)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "bg-white border-[#0B2545] shadow-md ring-1 ring-[#0B2545]"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {/* Left color bar for active status */}
                      {isSelected && (
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#0B2545]" />
                      )}

                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold tracking-tight flex items-center gap-2 text-slate-800">
                            {p.nombre}
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0B2545]" />}
                          </h4>
                          {(tipoPlan === "facturacion" || tipoPlan === "contador") && (
                            <span className="inline-block text-[9px] bg-blue-50 text-blue-900 font-extrabold px-1.5 py-0.5 rounded mt-1 border border-blue-200">
                              Pago Anual
                            </span>
                          )}
                        </div>
                        <div className="text-right flex items-baseline gap-1 shrink-0">
                          <span className="text-sm font-extrabold text-slate-900">
                            ${cyclePrice.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {itemCycleLabel}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Selected Plan Ficha Técnica & Interactive Tree (7/12 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {viewedPlanObj ? (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
                
                {/* Banner Header */}
                <div className="p-6 border-b relative bg-slate-50 border-slate-200 text-slate-800">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B2545]/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase border bg-blue-100 text-[#0B2545] border-blue-200">
                        {tipoPlan}
                      </span>
                      <h3 className="text-xl font-black mt-2 tracking-tight text-slate-850">
                        Ficha Técnica: {viewedPlanObj.nombre}
                      </h3>
                      <p className="text-xs mt-1 text-slate-500">
                        Estructura modular del plan y catálogo de submódulos normativos habilitados.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-[#0B2545]">
                        ${(() => {
                          let displayPrice = viewedPlanObj.precio;
                          if (tipoPlan === "erp") {
                            if (billingCycle === "annual") {
                              displayPrice = viewedPlanObj.precioAnual || (viewedPlanObj.precio * 12);
                            }
                          }
                          return displayPrice.toFixed(2);
                        })()}
                      </div>
                      <span className="text-xs font-bold block mt-0.5 text-slate-500">
                        {(() => {
                          if (tipoPlan === "erp") {
                            return billingCycle === "annual" ? "/año (Pago Anual)" : "/mes";
                          }
                          return "/año (Pago Anual)";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cloud Specific Detailed Specifications Badge Card */}
                {tipoPlan === "cloud" && (
                  <div className="p-5 bg-gradient-to-br from-purple-950/20 via-slate-900/10 to-indigo-950/20 border-b border-purple-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-wider text-purple-950">
                        Especificaciones Preferenciales Multiempresa (Cloud IaaS)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-purple-200 shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Empresas / RUCs</span>
                        <span className="text-xs font-black text-purple-950 block mt-0.5">3 Incluidos</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-purple-200 shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase block">IaaS Dedicado</span>
                        <span className="text-xs font-black text-emerald-700 block mt-0.5">SI (VPS Exclusivo)</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-purple-200 shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Perfil Comercial</span>
                        <span className="text-xs font-black text-purple-950 block mt-0.5">Mayor a $1M USD</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-purple-200 shadow-2xs">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase block">Capacitación</span>
                        <span className="text-xs font-black text-purple-950 block mt-0.5">Personalizada 1 a 1</span>
                      </div>
                    </div>

                    <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-300/60 text-[11px] text-purple-950 leading-relaxed font-medium">
                      ✨ <strong>Adicionales Incluidos:</strong> Base de Datos Dedicada + App Móvil + Plugin WooCommerce + Soporte Personalizado Prioritario.
                    </div>
                  </div>
                )}

                {/* Technical stats blocks */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 border-b border-slate-200">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block">Comprobantes</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">
                      {extractQuickMetrics(viewedPlanObj.modulos).comprobantes}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block">Usuarios</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">
                      {extractQuickMetrics(viewedPlanObj.modulos).usuarios}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 col-span-2 md:col-span-1">
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block">Límite Empresas</span>
                    <span className="text-xs font-bold text-[#0B2545] block mt-1">
                      {extractQuickMetrics(viewedPlanObj.modulos).empresas || "1 Empresa"}
                    </span>
                  </div>
                </div>

                {/* Submodule drilldown layout */}
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#0B2545]" />
                      Estructura Analítica de Módulos Activos
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Este plan habilita {MODULOS_POR_TIER[viewedPlanObj.tier]?.length || 0} módulos troncales. Haz clic en cualquiera para desglosar su catálogo de procesos específicos.
                    </p>
                  </div>

                  {/* Modules Pills Tab List */}
                  <div className="flex flex-wrap gap-2">
                    {(MODULOS_POR_TIER[viewedPlanObj.tier] || []).map((mName) => {
                      const isModuleActive = activeModule === mName;
                      return (
                        <button
                          key={mName}
                          onClick={() => setActiveModule(mName)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isModuleActive
                              ? "bg-[#0B2545] text-white shadow-md shadow-blue-950/10"
                              : "bg-slate-50 text-slate-600 hover:text-slate-950 border border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {mName}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feature Checklist Breakdown */}
                  <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-[#0B2545]" />
                        Catálogo de Procesos de {activeModule}
                      </span>

                      {/* Micro search input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar procesos..."
                          value={moduleSearchQuery}
                          onChange={(e) => setModuleSearchQuery(e.target.value)}
                          className="bg-white border border-slate-200 text-[10px] rounded px-2.5 py-1 text-slate-750 focus:outline-none focus:border-[#0B2545]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                      {getFilteredSubmodules(activeModule).map((item, idx) => {
                        const isHeader = item.startsWith("##");
                        const cleanItem = isHeader ? item.substring(2) : item;

                        if (isHeader) {
                          return (
                            <div key={idx} className="col-span-2 pt-3 pb-1 border-b border-slate-100 first:pt-0">
                              <span className="text-[9px] font-extrabold tracking-widest text-[#0B2545] uppercase">
                                {cleanItem}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                            <Check className="w-3.5 h-3.5 text-[#0B2545] shrink-0" />
                            <span className="font-light">{cleanItem}</span>
                          </div>
                        );
                      })}

                      {getFilteredSubmodules(activeModule).length === 0 && (
                        <div className="col-span-2 text-center py-4 text-xs text-slate-500">
                          Ningún proceso coincide con la búsqueda.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
                Selecciona un plan del menú izquierdo para explorar su ficha técnica detallada.
              </div>
            )}
          </div>

        </div>

        {/* Pricing Comparison Matrix */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
              Tabla Comparativa de Planes ({tipoPlan.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Visualiza en paralelo los precios y capacidades para tomar una decisión comercial óptima.
            </p>
          </div>

          <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-slate-600 font-bold">Plan</th>
                  <th className="p-3 text-slate-600 font-bold">Precio Unitario</th>
                  <th className="p-3 text-slate-600 font-bold">Comprobantes</th>
                  <th className="p-3 text-slate-600 font-bold">Usuarios</th>
                  <th className="p-3 text-slate-600 font-bold">Módulos Troncales</th>
                  <th className="p-3 text-slate-600 font-bold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {activePlanList.map((p, index) => {
                  const metrics = extractQuickMetrics(p.modulos);
                  const isSelected = selectedPlanName === p.nombre;
                  
                  let cyclePrice = p.precio;
                  let itemCycleLabel = "/mes";
                  if (tipoPlan === "erp") {
                    if (billingCycle === "annual") {
                      cyclePrice = p.precioAnual || (p.precio * 12);
                      itemCycleLabel = "/año";
                    } else {
                      cyclePrice = p.precio;
                      itemCycleLabel = "/mes";
                    }
                  } else {
                    cyclePrice = p.precio;
                    itemCycleLabel = "/mes";
                  }

                  return (
                    <tr 
                      key={p.nombre} 
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="p-3 font-bold text-slate-800">{p.nombre}</td>
                      <td className="p-3 font-extrabold text-slate-900">
                        ${cyclePrice.toFixed(2)}{itemCycleLabel}
                      </td>
                      <td className="p-3 text-slate-600">{metrics.comprobantes}</td>
                      <td className="p-3 text-slate-600">{metrics.usuarios}</td>
                      <td className="p-3 text-slate-500">
                        {MODULOS_POR_TIER[p.tier]?.join(", ") || "Estándar"}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setSelectedPlanName(p.nombre)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-[#0B2545] text-white" 
                              : "bg-slate-100 text-slate-600 hover:text-slate-950"
                          }`}
                        >
                          {isSelected ? "Activo" : "Explorar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ==================================== TABS: PLAN END ==================================== */}
          </div>
        )}

        {/* ==================================== TABS: EXPLORAR MÓDULOS ==================================== */}
        {activeTab === "explorador" && (
          <div className="space-y-8 animate-fade-in">
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
              {/* Directly render the Acceso al Sistema Real mockup full-width */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <AdminModuleMockups moduleName="Acceso al Sistema Real" />
              </div>
            </section>
          </div>
        )}

        {/* ==================================== TABS: SIMULADOR ==================================== */}
        {activeTab === "simulador" && (
          <div className="space-y-8 animate-fade-in">

        {/* Interactive Pricing Calculator / Cotizador (The main feature of Davecho's project) */}
        <section id="cotizador-seccion" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
          <div className="border-b border-slate-200 pb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#0B2545]" />
              2. Simulador Contable de Cotizaciones Express
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Modela cotizaciones comerciales completas, aplica descuentos personalizados, agrega add-ons y comparte con tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            
            {/* Calculator Settings (7/12 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Form client info */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                  Datos del Prospecto / Empresa
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Razón Social / Nombre del Cliente
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Constructora El Cóndor S.A."
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      RUC o Cédula de Identidad
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 1792434938001 (10 a 13 digitos)"
                      minLength={10}
                      maxLength={13}
                      value={clientRuc}
                      onChange={(e) => setClientRuc(e.target.value.replace(/\D/g, '').slice(0, 13))}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B2545]"
                    />
                    <span className="text-[9px] text-slate-400 font-medium">Mínimo 10, máximo 13 caracteres</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Notas o Condiciones Especiales
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Escribe comentarios, vigencia de la oferta o acuerdos previos de pago..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B2545] resize-none"
                  />
                </div>
              </div>

              {/* Base Plan Selection controls in quoter */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    Selección de Planes
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddProposalPlan()}
                    className="px-3.5 py-2 bg-[#0B2545] text-white hover:bg-[#061830] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Plan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Categoría de Plan
                    </label>
                    <select
                      value={tipoPlan}
                      onChange={(e) => {
                        const newCat = e.target.value as "facturacion" | "erp" | "contador";
                        setTipoPlan(newCat);
                        setSelectedPlanName("");
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545] cursor-pointer shadow-sm h-9"
                    >
                      <option value="facturacion">Facturación</option>
                      <option value="erp">ERP</option>
                      <option value="contador">Contadores</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Plan Seleccionado
                    </label>
                    <select
                      value={selectedPlanName}
                      onChange={(e) => {
                        setSelectedPlanName(e.target.value);
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545] cursor-pointer shadow-sm h-9"
                    >
                      <option value="">-- Sin Plan Base (Ninguno) --</option>
                      {PLANES_DATA[tipoPlan].map((p) => (
                        <option key={p.nombre} value={p.nombre}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Cantidad de Licencias
                    </label>
                    <div className="flex items-center gap-2 h-9 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setCalcQuantity(Math.max(1, calcQuantity - 1))}
                        className="w-8 h-8 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center justify-center cursor-pointer shadow-sm"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-800">{calcQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setCalcQuantity(calcQuantity + 1)}
                        className="w-8 h-8 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center justify-center cursor-pointer shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Valor Descuento (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Ej: 10"
                        value={planDiscountPct === 0 ? "" : planDiscountPct}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setPlanDiscountPct(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#0B2545] h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Add-ons picker section */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    Módulos Adicionales
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {(tipoPlan === "contador" ? [...ADICIONALES_ESTANDAR, ...ADICIONALES_CONTADOR] : ADICIONALES_ESTANDAR).map((opt) => {
                    const isAdded = selectedAddons.some(a => a.nombre === opt.valor);
                    return (
                      <button
                        key={opt.valor}
                        onClick={() => handleAddAddon(opt.valor, opt.precio)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex justify-between items-center cursor-pointer ${
                          isAdded
                            ? "bg-blue-50 border-[#0B2545] text-slate-800 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div>
                          <span className="font-bold block text-slate-800 text-[11px]">{opt.valor}</span>
                          <span className="text-[10px] text-slate-500">${opt.precio.toFixed(2)}</span>
                        </div>
                        <Plus className="w-4 h-4 text-[#0B2545]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Adicional Firmas Section */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0B2545]" />
                    Adicional Firmas Electrónicas
                  </h4>
                  
                  {/* Tab Selector for persona type */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm flex-wrap gap-1">
                    {(["PERSONA NATURAL", "PERSONA NATURAL RUC", "PERSONA JURIDICA", "PROMO EMPRENDE"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedSigType(t)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          selectedSigType === t
                            ? "bg-[#0B2545] text-white shadow"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {t === "PERSONA NATURAL" ? "Natural" : t === "PERSONA NATURAL RUC" ? "Natural RUC" : t === "PERSONA JURIDICA" ? "Jurídica" : "Promo Emprende"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid layout of available vigencias */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {FIRMAS_DATA.filter(f => f.tipo === selectedSigType).map((f) => {
                    const isAdded = selectedSignatures.some(s => s.tipo === f.tipo && s.vigencia === f.vigencia);
                    return (
                      <button
                        key={f.vigencia}
                        type="button"
                        onClick={() => handleAddSignature(f.tipo, f.vigencia, f.precio)}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isAdded
                            ? "bg-blue-50 border-[#0B2545] text-slate-800 shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span className="font-extrabold text-[10px] text-slate-800">{f.vigencia}</span>
                        <span className="text-[11px] text-[#0B2545] font-bold mt-1">${f.precio.toFixed(2)}</span>
                        <span className="text-[8px] text-slate-400 mt-1 block font-bold uppercase tracking-wider">Agregar</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Commercial Advisor assignment (Manual fields) */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-750 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0B2545]" />
                  Información del Asesor Comercial
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Nombre del Asesor
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={advisorName}
                      onChange={(e) => setAdvisorName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={advisorEmail}
                      onChange={(e) => setAdvisorEmail(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B2545]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                      <span>Teléfono / WhatsApp</span>
                      <span className="text-[9px] font-normal lowercase text-slate-400">(10 dígitos)</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="0991234567"
                      value={advisorPhone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setAdvisorPhone(digits);
                      }}
                      className={`bg-white border rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-colors ${
                        advisorPhone.length > 0 && advisorPhone.length < 10
                          ? "border-red-400 focus:border-red-500"
                          : advisorPhone.length === 10
                          ? "border-emerald-500 focus:border-emerald-600 ring-1 ring-emerald-500/20"
                          : "border-slate-200 focus:border-[#0B2545]"
                      }`}
                    />
                    {advisorPhone.length > 0 && advisorPhone.length < 10 && (
                      <span className="text-[9.5px] font-semibold text-red-500">
                        Ingresa exactamente 10 dígitos ({advisorPhone.length}/10)
                      </span>
                    )}
                    {advisorPhone.length === 10 && (
                      <span className="text-[9.5px] font-semibold text-emerald-600">
                        ✓ Número de 10 dígitos válido
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom PDF styling & branding panel */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-705 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0B2545]" />
                  Personalización Estética del PDF Oficial
                </h4>

                {/* Logo Upload Dropzone */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Logotipo Corporativo (Impreso en el PDF)
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8">
                      <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white hover:border-[#0B2545]/50 transition-all flex flex-col items-center justify-center text-center relative cursor-pointer group shadow-sm">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Image className="w-6 h-6 text-slate-400 mb-1 group-hover:text-[#0B2545] transition-colors" />
                        <span className="text-xs font-semibold text-slate-700">
                          {customLogoName ? "Cambiar Imagen de Logotipo" : "Subir Logotipo de Empresa"}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">
                          Formatos admitidos: PNG, JPG, JPEG (Se escala automáticamente)
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-200 h-24 shadow-sm">
                      {customLogo ? (
                        <div className="flex flex-col items-center gap-1.5 w-full">
                          <img
                            src={customLogo}
                            alt="Logo personalizado"
                            className="max-h-12 max-w-full object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomLogo("");
                              setCustomLogoName("");
                            }}
                            className="text-[9px] font-bold text-red-600 hover:text-red-750 transition-colors bg-red-50 px-2 py-0.5 rounded cursor-pointer border border-red-200"
                          >
                            Quitar Logo
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-slate-500 italic">
                          Sin logotipo cargado
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Background Watermark Image Upload Dropzone (Directly below logo upload) */}
                <div className="space-y-2 pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Imagen de Fondo / Marca de Agua (Cubre las 2 Hojas)
                    </span>
                    {pdfBgImage && (
                      <span className="text-[10px] font-black text-[#0B2545] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Opacidad: {Math.round(pdfBgOpacity * 100)}%
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-8">
                      <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white hover:border-[#0B2545]/50 transition-all flex flex-col items-center justify-center text-center relative cursor-pointer group shadow-sm">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBgImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Image className="w-6 h-6 text-slate-400 mb-1 group-hover:text-[#0B2545] transition-colors" />
                        <span className="text-xs font-semibold text-slate-700">
                          {pdfBgImageName ? "Cambiar Imagen de Fondo / Marca de Agua" : "Subir Imagen de Fondo para el PDF"}
                        </span>
                        <span className="text-[9px] text-slate-500 mt-0.5">
                          Formatos admitidos: PNG, JPG, JPEG (Cubre las 2 páginas del PDF)
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-3 rounded-xl border border-slate-200 h-24 shadow-sm">
                      {pdfBgImage ? (
                        <div className="flex flex-col items-center gap-1.5 w-full">
                          <img
                            src={pdfBgImage}
                            alt="Fondo de agua"
                            className="max-h-10 max-w-full object-contain rounded border border-slate-200"
                            style={{ opacity: pdfBgOpacity }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPdfBgImage("");
                              setPdfBgImageName("");
                            }}
                            className="text-[9px] font-bold text-red-600 hover:text-red-750 transition-colors bg-red-50 px-2 py-0.5 rounded cursor-pointer border border-red-200"
                          >
                            Quitar Fondo
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-[10px] text-slate-500 italic">
                          Sin marca de agua
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Watermark opacity control */}
                  {pdfBgImage && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <label className="font-bold text-slate-700">Intensidad de Transparencia (Marca de Agua):</label>
                        <span className="font-mono text-[#0B2545] font-bold">{Math.round(pdfBgOpacity * 100)}% opacidad</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.50"
                        step="0.01"
                        value={pdfBgOpacity}
                        onChange={(e) => setPdfBgOpacity(parseFloat(e.target.value))}
                        className="w-full accent-[#0B2545] cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                      />
                      <div className="flex justify-between text-[8.5px] text-slate-400 font-medium">
                        <span>Sutil (5%)</span>
                        <span>Recomendado (15%)</span>
                        <span>Intenso (50%)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pre-made Palette Options */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Paletas de Colores de Antemano (10 Temas Oficiales)
                    </span>
                    <button
                      type="button"
                      onClick={() => setColorPickerTarget("bg")}
                      className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#0B2545] hover:text-[#061830] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Palette className="w-3.5 h-3.5 text-[#0B2545]" />
                      <span>Abrir Abanico de Colores</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { nombre: "Azul UpConta Oficial", bg: "#0b2545", title: "#0b2545", sub: "#475569" },
                      { nombre: "Azul Profesional", bg: "#0b3c5d", title: "#0b3c5d", sub: "#46505a" },
                      { nombre: "Esmeralda", bg: "#065f46", title: "#065f46", sub: "#475569" },
                      { nombre: "Gris Oscuro Premium", bg: "#1e293b", title: "#1e293b", sub: "#64748b" },
                      { nombre: "Azul Noche", bg: "#0a1128", title: "#0a1128", sub: "#94a3b8" },
                      { nombre: "Púrpura Elegante", bg: "#5b21b6", title: "#5b21b6", sub: "#4b5563" },
                      { nombre: "Cobre Corporativo", bg: "#7c2d12", title: "#7c2d12", sub: "#64748b" },
                      { nombre: "Granate Ejecutivo", bg: "#881337", title: "#881337", sub: "#475569" },
                      { nombre: "Zafiro Clásico", bg: "#1e3a8a", title: "#1e3a8a", sub: "#64748b" },
                      { nombre: "Obsidiana Dorada", bg: "#0f172a", title: "#0f172a", sub: "#94a3b8" }
                    ].map((paleta) => {
                      const isSelected = pdfBgColor === paleta.bg && pdfTitleColor === paleta.title && pdfSubtitleColor === paleta.sub;
                      return (
                        <button
                          key={paleta.nombre}
                          type="button"
                          onClick={() => {
                            setPdfBgColor(paleta.bg);
                            setPdfTitleColor(paleta.title);
                            setPdfSubtitleColor(paleta.sub);
                          }}
                          className={`p-1.5 rounded-lg border text-left flex flex-col justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-slate-100 border-[#0B2545] shadow-sm ring-1 ring-[#0B2545]"
                              : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[9px] font-extrabold text-slate-700 truncate block w-full">{paleta.nombre}</span>
                          <div className="flex gap-1 mt-1">
                            <span className="w-3.5 h-3.5 rounded border border-slate-100 block" style={{ backgroundColor: paleta.bg }} title="Fondo" />
                            <span className="w-3.5 h-3.5 rounded border border-slate-100 block" style={{ backgroundColor: paleta.title }} title="Título" />
                            <span className="w-3.5 h-3.5 rounded border border-slate-100 block" style={{ backgroundColor: paleta.sub }} title="Subtítulo" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PDF Colors Selection (Grid layout) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                  
                  {/* PDF Bg color setting */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Fondo de Encabezados
                      </label>
                      <button
                        type="button"
                        onClick={() => setColorPickerTarget("bg")}
                        className="text-[9px] font-bold text-[#0B2545] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Abrir abanico de colores"
                      >
                        <Palette className="w-3 h-3 text-[#0B2545]" />
                        <span>Abanico</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pdfBgColor}
                        onChange={(e) => {
                          const newBg = e.target.value;
                          setPdfBgColor(newBg);
                          setPdfTitleColor(newBg);
                          setPdfSubtitleColor("#475569");
                        }}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-slate-600 uppercase">{pdfBgColor}</span>
                    </div>
                  </div>

                  {/* PDF Title color setting */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Color de Título
                      </label>
                      <button
                        type="button"
                        onClick={() => setColorPickerTarget("title")}
                        className="text-[9px] font-bold text-[#0B2545] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Abrir abanico de colores"
                      >
                        <Palette className="w-3 h-3 text-[#0B2545]" />
                        <span>Abanico</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pdfTitleColor}
                        onChange={(e) => setPdfTitleColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-slate-600 uppercase">{pdfTitleColor}</span>
                    </div>
                  </div>

                  {/* PDF Subtitle color setting */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Color de Subtítulos
                      </label>
                      <button
                        type="button"
                        onClick={() => setColorPickerTarget("sub")}
                        className="text-[9px] font-bold text-[#0B2545] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Abrir abanico de colores"
                      >
                        <Palette className="w-3 h-3 text-[#0B2545]" />
                        <span>Abanico</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pdfSubtitleColor}
                        onChange={(e) => setPdfSubtitleColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-mono text-slate-600 uppercase">{pdfSubtitleColor}</span>
                    </div>
                  </div>

                </div>

                {/* Auto-recommendation Notice & Button */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 flex items-start gap-3 mt-3 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-extrabold text-blue-950">Garantía de Legibilidad Impresa</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfTitleColor(pdfBgColor);
                          setPdfSubtitleColor("#475569");
                        }}
                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100/50 px-2 py-0.5 rounded-md border border-blue-200 transition-colors cursor-pointer"
                      >
                        ✨ Sincronizar Títulos
                      </button>
                    </div>
                    <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                      Al cambiar el fondo de encabezados, el sistema recomienda títulos y subtítulos armónicos. Además, los textos dentro de cajas oscuras y la barra de <strong>TOTAL ESTIMADO</strong> se imprimirán automáticamente con máximo contraste (blanco/dorado) para garantizar nitidez impecable.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* LIVE INVOICE PREVIEW (5/12 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-6 space-y-6 relative sticky top-24 shadow-sm">
                
                {/* Stamp overlay */}
                <div className="absolute top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Simulación Activa
                </div>

                <div className="border-b border-slate-200 pb-4">
                  <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block">Resumen de Propuesta</span>
                  <h4 className="text-sm font-extrabold text-[#0B2545]">COTIZADOR UPCONTA & ANF</h4>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Emisión: {new Date().toLocaleDateString("es-ES")} • ECUADOR
                  </div>
                </div>

                {/* Proposal Line items details */}
                <div className="space-y-4 text-xs">
                  {/* Customer Block */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cliente</div>
                    <div className="font-bold text-slate-800 text-[11px] mt-0.5">{clientName || "Propuesta Estimada"}</div>
                    {clientRuc && <div className="text-slate-500 text-[10px]">RUC: {clientRuc}</div>}
                  </div>

                  {/* Selected Proposal Plans */}
                  {selectedProposalPlans.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Planes Incluidos</span>
                      {selectedProposalPlans.map((plan) => {
                        const unitPrice = plan.precioPersonalizado !== null ? plan.precioPersonalizado : plan.precioBase;
                        const itemSubtotal = unitPrice * plan.cantidad;
                        return (
                          <div key={plan.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-800 text-xs">PLAN {plan.nombre}</span>
                                  <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                    {plan.tipoPlan}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  {plan.billingCycle === "annual" ? "Facturación Anual" : "Facturación Mensual"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-xs">
                                  Subtotal: ${itemSubtotal.toFixed(2)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProposalPlan(plan.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Borrar plan de la propuesta"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cant:</span>
                                <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateProposalPlanQty(plan.id, plan.cantidad - 1)}
                                    className="text-[10px] font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                                    title="Disminuir licencias"
                                  >
                                    -
                                  </button>
                                  <span className="text-[10px] font-bold text-slate-800">{plan.cantidad}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateProposalPlanQty(plan.id, plan.cantidad + 1)}
                                    className="text-[10px] font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                                    title="Aumentar licencias"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1 transition-all">
                                <span className="text-[9.5px] text-slate-400 font-bold">Precio Unit: $</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={unitPrice}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    handleUpdateProposalPlanPrice(plan.id, isNaN(val) ? 0 : val);
                                  }}
                                  className="w-16 bg-transparent text-right font-black text-xs text-slate-850 focus:outline-none p-0 border-none"
                                  title="Establecer precio personalizado para el plan"
                                />
                                <span className="text-[9.5px] text-slate-400 font-bold">{plan.cycleLabel}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Base Plan Discount if applicable */}
                  {selectedProposalPlans.length > 0 && planDiscountPct > 0 && (
                    <div className="flex justify-between items-center text-xs text-red-600 font-medium bg-red-50 p-2 border border-red-100 rounded">
                      <span>Descuento de Plan ({planDiscountPct}%)</span>
                      <span>-${planDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Addons summary listing */}
                  {selectedAddons.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Módulos Extra (Add-ons)</span>
                      
                      <div className="space-y-2">
                        {selectedAddons.map((addon) => {
                          const addonTotal = addon.precio * addon.cantidad;
                          return (
                            <div key={addon.nombre} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-bold text-slate-700">• {addon.nombre}</span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateAddonQty(addon.nombre, addon.cantidad - 1)}
                                      className="text-[10px] font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                                      title="Disminuir cantidad"
                                    >
                                      -
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-800">{addon.cantidad}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateAddonQty(addon.nombre, addon.cantidad + 1)}
                                      className="text-[10px] font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                                      title="Aumentar cantidad"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="font-extrabold text-slate-800">${addonTotal.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Modificar Precio:</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                                    <span className="text-slate-400 text-[10px] font-bold">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={addon.precio}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        handleUpdateAddonPrice(addon.nombre, isNaN(val) ? 0 : val);
                                      }}
                                      className="w-12 bg-transparent text-right font-bold text-[11px] text-slate-750 focus:outline-none p-0 border-none"
                                      title="Modificar precio unitario del Add-on"
                                    />
                                    <span className="text-[9px] text-slate-400 font-bold">{cycleLabel}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAddon(addon.nombre)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Eliminar de la propuesta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Selected Signatures listing */}
                  {selectedSignatures.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Firmas Electrónicas</span>
                      
                      <div className="space-y-2">
                        {selectedSignatures.map((sig) => {
                          const sigTotal = sig.precio * sig.cantidad;
                          return (
                            <div key={`${sig.tipo}-${sig.vigencia}`} className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
                              <div className="flex justify-between items-center text-[11px]">
                                <span className="font-bold text-slate-700">
                                  • {sig.tipo === "PERSONA NATURAL" ? "P. Natural" : sig.tipo === "PERSONA NATURAL RUC" ? "P. Natural RUC" : sig.tipo === "PERSONA JURIDICA" ? "P. Jurídica" : "Promo Emprende"} ({sig.vigencia})
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSignatureQty(sig.tipo, sig.vigencia, sig.cantidad - 1)}
                                      className="text-[10px] font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                                      title="Disminuir cantidad"
                                    >
                                      -
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-800">{sig.cantidad}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSignatureQty(sig.tipo, sig.vigencia, sig.cantidad + 1)}
                                      className="text-[10px] font-black text-slate-600 hover:text-slate-900 px-1 cursor-pointer"
                                      title="Aumentar cantidad"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span className="font-extrabold text-slate-800">${sigTotal.toFixed(2)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-1.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Modificar Precio:</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                                    <span className="text-slate-400 text-[10px] font-bold">$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={sig.precio}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        handleUpdateSignaturePrice(sig.tipo, sig.vigencia, isNaN(val) ? 0 : val);
                                      }}
                                      className="w-12 bg-transparent text-right font-bold text-[11px] text-slate-750 focus:outline-none p-0 border-none"
                                      title="Modificar precio unitario de la Firma"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSignature(sig.tipo, sig.vigencia)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Eliminar de la propuesta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Financial calculation block */}
                  <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Neto</span>
                      <span className="font-semibold text-slate-800">${preTaxTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>IVA (15%) Ecuador</span>
                      <span className="font-semibold text-slate-800">${taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-slate-800 text-sm font-black pt-2 border-t border-dashed border-slate-300">
                      <span>Total Estimado</span>
                      <span className="text-[#0B2545] font-extrabold text-base">${grandTotal.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Copy / Share / Download Action Trigger Grid */}
                <div className="space-y-2">
                  <button
                    onClick={handleGenerarPDF}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0B2545] hover:bg-[#061830] text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer shadow-md border border-[#0B2545]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Propuesta Oficial PDF</span>
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-4 h-4 text-[#0B2545]" />
                    <span>Copiar Propuesta al Portapapeles</span>
                  </button>

                  <button
                    onClick={shareOnWhatsApp}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4 text-emerald-600" />
                    <span>Enviar por WhatsApp</span>
                  </button>
                </div>

                {/* Copied / Shared / PDF Success Toast Alerts */}
                <AnimatePresence>
                  {pdfSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-blue-50 border border-blue-200 text-[#0B2545] text-xs p-3 rounded-lg text-center font-semibold"
                    >
                      ¡Documento PDF de Propuesta generado y descargado con éxito!
                    </motion.div>
                  )}

                  {quoteCopied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-blue-50 border border-blue-200 text-[#0B2545] text-xs p-3 rounded-lg text-center font-semibold"
                    >
                      ¡Propuesta copiada correctamente al portapapeles para enviar por Email o Chat!
                    </motion.div>
                  )}

                  {quoteShared && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-lg text-center font-semibold"
                    >
                      Abriendo canal de WhatsApp para enviar la cotización...
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </section>
          </div>
        )}

        {/* ==================================== TABS: FIRMAS ELECTRÓNICAS VIGENTES ==================================== */}
        {activeTab === "firmas" && (
          <div className="space-y-6 animate-fade-in">
            {/* Step 1: Select Type of Signature (4 Category Selector Cards) */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-amber-500" />
                    <span>1. Elije 1: Selecciona el Tipo de Firma Electrónica</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecciona la modalidad acorde al perfil fiscal y tributario de tu cliente.
                  </p>
                </div>
                <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                  Emisión Inmediata ANF AC
                </span>
              </div>

              {/* 4 Category Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Persona Natural */}
                <button
                  type="button"
                  onClick={() => {
                    setFirmaTypeSelect("PERSONA NATURAL");
                    if (!FIRMAS_DATA.some(f => f.tipo === "PERSONA NATURAL" && selectedVigencias.includes(f.vigencia))) {
                      setSelectedVigencias(["1 AÑO"]);
                    }
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    firmaTypeSelect === "PERSONA NATURAL"
                      ? "bg-blue-50/90 border-[#0B2545] ring-2 ring-[#0B2545] shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${firmaTypeSelect === "PERSONA NATURAL" ? "bg-[#0B2545] text-white" : "bg-blue-100 text-[#0B2545]"}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Persona Natural</h3>
                      <span className="text-[11px] text-slate-500 font-medium block">Sin RUC / Uso Personal</span>
                    </div>
                  </div>
                </button>

                {/* 2. Persona Natural con RUC */}
                <button
                  type="button"
                  onClick={() => {
                    setFirmaTypeSelect("PERSONA NATURAL RUC");
                    if (!FIRMAS_DATA.some(f => f.tipo === "PERSONA NATURAL RUC" && selectedVigencias.includes(f.vigencia))) {
                      setSelectedVigencias(["1 AÑO"]);
                    }
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    firmaTypeSelect === "PERSONA NATURAL RUC"
                      ? "bg-orange-50/90 border-orange-500 ring-2 ring-orange-500 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${firmaTypeSelect === "PERSONA NATURAL RUC" ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"}`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Con RUC</h3>
                      <span className="text-[11px] text-slate-500 font-medium block">Profesionales &amp; Comerciantes</span>
                    </div>
                  </div>
                </button>

                {/* 3. Persona Jurídica */}
                <button
                  type="button"
                  onClick={() => {
                    setFirmaTypeSelect("PERSONA JURIDICA");
                    if (!FIRMAS_DATA.some(f => f.tipo === "PERSONA JURIDICA" && selectedVigencias.includes(f.vigencia))) {
                      setSelectedVigencias(["1 AÑO"]);
                    }
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    firmaTypeSelect === "PERSONA JURIDICA"
                      ? "bg-purple-50/90 border-purple-600 ring-2 ring-purple-600 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${firmaTypeSelect === "PERSONA JURIDICA" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"}`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Persona Jurídica</h3>
                      <span className="text-[11px] text-slate-500 font-medium block">Empresas &amp; Reps. Legales</span>
                    </div>
                  </div>
                </button>

                {/* 4. Promo Emprende */}
                <button
                  type="button"
                  onClick={() => {
                    setFirmaTypeSelect("PROMO EMPRENDE");
                    if (!FIRMAS_DATA.some(f => f.tipo === "PROMO EMPRENDE" && selectedVigencias.includes(f.vigencia))) {
                      setSelectedVigencias(["1 AÑO"]);
                    }
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                    firmaTypeSelect === "PROMO EMPRENDE"
                      ? "bg-amber-50/90 border-amber-500 ring-2 ring-amber-500 shadow-sm"
                      : "bg-gradient-to-r from-amber-50/60 to-orange-50/60 border-amber-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${firmaTypeSelect === "PROMO EMPRENDE" ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-800"}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Promo Emprende</h3>
                      <span className="text-[11px] text-amber-900 font-semibold block">Firma + Facturación UpConta</span>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* Step 2: Vigencias y Precios de la Firma Seleccionada */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>2. Vigencia y Precios: {firmaTypeSelect === "PERSONA NATURAL" ? "Persona Natural" : firmaTypeSelect === "PERSONA NATURAL RUC" ? "Persona Natural con RUC" : firmaTypeSelect === "PERSONA JURIDICA" ? "Persona Jurídica" : "Promo Emprende"}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selecciona 1 o 2 vigencias para comparar sus costos y generar el argumento de ventas paso a paso.
                  </p>
                </div>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Valores finales con IVA 15% incluido
                </span>
              </div>

              {/* Vigencia Cards Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1 flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-slate-800 font-extrabold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Haz clic en las tarjetas para seleccionar las vigencias a comparar (máx. 2):</span>
                  </span>
                  {selectedVigencias.length === 1 && (
                    <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                      💡 Comparación activa: {selectedVigencias[0]} vs {selectedVigencias[0] === "1 AÑO" ? "2 AÑOS" : "1 AÑO"} (predeterminada)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {FIRMAS_DATA.filter(f => f.tipo === firmaTypeSelect).map((item) => {
                    const isSelected = selectedVigencias.includes(item.vigencia);
                    const indexInSelection = selectedVigencias.indexOf(item.vigencia);

                    return (
                      <button
                        key={item.vigencia}
                        type="button"
                        onClick={() => handleToggleVigencia(item.vigencia)}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col justify-between space-y-2 group ${
                          isSelected
                            ? indexInSelection === 0
                              ? "bg-slate-900 text-white border-slate-900 ring-2 ring-amber-400 shadow-md"
                              : "bg-[#0B2545] text-white border-[#0B2545] ring-2 ring-emerald-400 shadow-md"
                            : "bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {item.vigencia !== "1 AÑO" && item.vigencia !== "15 DIAS" && !isSelected && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            Mayor Ahorro
                          </span>
                        )}

                        {isSelected && (
                          <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                            indexInSelection === 0
                              ? "bg-amber-400 text-slate-950"
                              : "bg-emerald-500 text-white"
                          }`}>
                            <Check className="w-2.5 h-2.5" />
                            <span>Opción {indexInSelection + 1}</span>
                          </span>
                        )}

                        <div>
                          <span className={`text-xs font-extrabold uppercase tracking-wider block ${
                            isSelected ? "text-amber-300" : "text-slate-500"
                          }`}>
                            {item.vigencia}
                          </span>
                          <div className="text-xl font-black mt-1">
                            ${item.precio.toFixed(2)}
                          </div>
                          <span className={`text-[10px] block font-semibold ${
                            isSelected ? "text-slate-300" : "text-emerald-600"
                          }`}>
                            IVA 15% Incluido
                          </span>
                        </div>

                        {/* Comparison selection indicator */}
                        <div className="pt-2 border-t border-slate-200/20">
                          <span 
                            className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                              isSelected 
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                                : "text-slate-400 group-hover:text-slate-600"
                            }`}
                          >
                            <span>{isSelected ? "✓ Comparación Activa" : "Clic para Comparar"}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* CONTENEDOR DE ARGUMENTO DE VENTA Y REQUISITOS (LADO A LADO CON IGUAL DISTANCIA AL MARCO) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Columna Izquierda: Mensaje & Argumento Comercial */}
              {(() => {
                const list = FIRMAS_DATA.filter(f => f.tipo === firmaTypeSelect);

                const getYearsFromVigencia = (v: string): number => {
                  if (v === "15 DIAS") return 15 / 365;
                  if (v.includes("1")) return 1;
                  if (v.includes("2")) return 2;
                  if (v.includes("3")) return 3;
                  if (v.includes("4")) return 4;
                  if (v.includes("5")) return 5;
                  return 1;
                };

                let v1_str = selectedVigencias[0] || "1 AÑO";
                let v2_str = selectedVigencias[1];

                if (!v2_str || selectedVigencias.length === 1) {
                  if (v1_str === "1 AÑO") {
                    v2_str = "2 AÑOS";
                  } else {
                    v2_str = "1 AÑO";
                  }
                }

                let item1 = list.find(f => f.vigencia === v1_str) || list[0];
                let item2 = list.find(f => f.vigencia === v2_str) || list.find(f => f.vigencia === "2 AÑOS") || list[0];

                const years1 = getYearsFromVigencia(item1.vigencia);
                const years2 = getYearsFromVigencia(item2.vigencia);

                let vShorter = years1 <= years2 ? item1 : item2;
                let vLonger = years1 <= years2 ? item2 : item1;

                if (vShorter.vigencia === vLonger.vigencia) {
                  const altLonger = list.find(f => f.vigencia === "2 AÑOS") || list[list.length - 1];
                  if (altLonger && altLonger.vigencia !== vShorter.vigencia) {
                    vLonger = altLonger;
                  }
                }

                const yearsShorter = getYearsFromVigencia(vShorter.vigencia);
                const yearsLonger = getYearsFromVigencia(vLonger.vigencia);

                const priceShorter = vShorter.precio;
                const priceLonger = vLonger.precio;

                const diffPrice = Math.max(0, priceLonger - priceShorter);
                const diffYearsNum = Math.round(Math.max(1, yearsLonger - yearsShorter));
                const diffYearsText = diffYearsNum === 1 ? "1 año más" : `${diffYearsNum} años más`;

                const annualLonger = priceLonger / (yearsLonger || 1);

                const item1Year = list.find(f => f.vigencia === "1 AÑO") || list[0];
                const cost1YearRenewal = item1Year.precio * (yearsLonger || 1);
                const ahorroTotal = Math.max(0, cost1YearRenewal - priceLonger);
                const pctAhorro = cost1YearRenewal > 0 ? ((ahorroTotal / cost1YearRenewal) * 100).toFixed(0) : "0";

                const isPromoEmprende = firmaTypeSelect === "PROMO EMPRENDE";

                const pitchMsg = isPromoEmprende ? `🔥 *OFERTA RECOMENDADA PROMO EMPRENDE - ANF AC* 📜\n\n• *Opción por ${vShorter.vigencia}:* *$${priceShorter.toFixed(2)} USD*\n\n💡 *OPCIÓN RECOMENDADA por ${vLonger.vigencia}:* *$${priceLonger.toFixed(2)} USD*\n👉 Por solo *$${diffPrice.toFixed(2)} USD adicionales*, obtiene *${diffYearsText}* de vigencia.\n👉 Firma + Facturador a solo *$${annualLonger.toFixed(2)} USD por año*.\n👉 Ahorro total: *$${ahorroTotal.toFixed(2)} USD* (${pctAhorro}% de descuento).\n🎁 *INCLUYE GRATIS:* Facturador Electrónico + Firmador PC + App Celular.\n\n¿Desea emitir su factura con la opción recomendada de *${vLonger.vigencia}*?`
                : `🔥 *OFERTA RECOMENDADA FIRMA ELECTRÓNICA - ANF AC* 📜\n\n• *Opción por ${vShorter.vigencia}:* *$${priceShorter.toFixed(2)} USD*\n\n💡 *OPCIÓN RECOMENDADA por ${vLonger.vigencia}:* *$${priceLonger.toFixed(2)} USD*\n👉 Por solo *$${diffPrice.toFixed(2)} USD adicionales*, obtiene *${diffYearsText}* de vigencia.\n👉 Su firma le sale a solo *$${annualLonger.toFixed(2)} USD por año*.\n👉 Ahorro total: *$${ahorroTotal.toFixed(2)} USD* (${pctAhorro}% de descuento).\n🎁 *INCLUYE GRATIS:* Firmador PC + App Celular por los ${vLonger.vigencia}.\n\n¿Desea emitir su factura con la opción recomendada de *${vLonger.vigencia}*?`;

                return (
                  <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 border border-amber-300 rounded-2xl p-6 space-y-4 shadow-sm h-full flex flex-col justify-between">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-amber-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span>💡 Argumento de Venta Comparativo</span>
                            <span className="bg-amber-200 text-amber-950 text-xs px-2 py-0.5 rounded-md font-extrabold border border-amber-300">
                              {vShorter.vigencia} vs {vLonger.vigencia}
                            </span>
                          </h4>
                          <p className="text-xs text-amber-900 font-medium mt-0.5">
                            {isPromoEmprende 
                              ? `Por solo +$${diffPrice.toFixed(2)} USD obtiene ${diffYearsText} de Firma + Facturador.`
                              : `Por solo +$${diffPrice.toFixed(2)} USD obtiene ${diffYearsText} de vigencia.`
                            }
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyPitch(pitchMsg)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                      >
                        {copiedPitch ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copiar Argumento</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Comparative Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          1️⃣ Opción {vShorter.vigencia}
                        </span>
                        <div className="text-base font-black text-slate-900">
                          ${priceShorter.toFixed(2)} USD
                        </div>
                        <span className="text-[10px] text-slate-500 block font-medium">
                          Inversión base
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1">
                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                          2️⃣ Opción {vLonger.vigencia}
                        </span>
                        <div className="text-base font-black text-emerald-900">
                          ${priceLonger.toFixed(2)} USD
                        </div>
                        <span className="text-[10px] text-emerald-800 block font-bold">
                          +$${diffPrice.toFixed(2)} ({annualLonger.toFixed(2)}/año)
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-3 rounded-xl border border-emerald-800 shadow-sm space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider block text-emerald-200">
                          💰 Ahorro Total
                        </span>
                        <div className="text-base font-black text-white">
                          ${ahorroTotal.toFixed(2)} USD
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-100 block truncate">
                          {isPromoEmprende ? "🎁 Facturador gratis" : "🎁 Firmador gratis"}
                        </span>
                      </div>
                    </div>

                    {/* Text Preview Box for Advisor */}
                    <div className="space-y-1.5 pt-1 flex-1 flex flex-col justify-end">
                      <span className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider block">
                        📋 Vista previa del mensaje directo para el cliente:
                      </span>
                      <div className="bg-slate-950 text-amber-200 p-3.5 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 h-44 overflow-y-auto select-all shadow-inner">
                        {pitchMsg}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Columna Derecha: Requisitos de Solicitud */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4 h-full flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Requisitos de Solicitud ({firmaTypeSelect === "PERSONA JURIDICA" ? "Persona Jurídica" : "Persona Natural / RUC / Promo"})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Envía estos requisitos para la emisión inmediata de la firma electrónica.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyRequirements(
                      firmaTypeSelect === "PERSONA JURIDICA"
                        ? `Formatos de archivos: Imagen o Pdf. 📂\n\n✅ Cédula o pasaporte ambos lados a color, legible y vigente.\n\n✅ Fotografía sosteniendo la cédula o pasaporte por la parte frontal a la altura de su cuello.\n\n✅ Certificado de Ruc.\n✅ Nombramiento \n✅ Constitución\n✅ Comprobante de pago.\n \nDATOS DEL TITULAR DE LA FIRMA: 📧📲\n\n✅ Correo electrónico personal:\n✅ Correo electrónico de la empresa:\n✅ Celular:\n✅ Dirección de domicilio:\n✅ Provincia de residencia: \n✅ Ciudad de residencia:`
                        : `Formatos de archivos: Imagen o Pdf. 📂\n\n✅ Cédula o pasaporte, ambos lados, a color, legible y vigente.\n\n✅ Fotografía sosteniendo la cédula o pasaporte por la parte frontal a la altura de su cuello.\n\n✅ Comprobante de pago.\n\n✅ Certificado Ruc.\n \nDatos del titular de la firma electrónica: 📧📲\n\n✅ Correo electrónico personal:\n✅ Celular:\n✅ Dirección de domicilio:\n✅ Provincia de residencia: \n✅ Ciudad de residencia:`
                    )}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                  >
                    {copiedRequirements ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>¡Copiados!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Requisitos</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed space-y-3 flex-1 overflow-y-auto max-h-[340px]">
                  {firmaTypeSelect === "PERSONA JURIDICA" ? (
                    <>
                      <p className="font-bold text-amber-300">Formatos de archivos: Imagen o Pdf. 📂</p>
                      <ul className="space-y-1.5 pl-1">
                        <li>✅ Cédula o pasaporte ambos lados a color, legible y vigente.</li>
                        <li>✅ Fotografía sosteniendo la cédula o pasaporte por la parte frontal a la altura de su cuello.</li>
                        <li>✅ Certificado de Ruc.</li>
                        <li>✅ Nombramiento</li>
                        <li>✅ Constitución</li>
                        <li>✅ Comprobante de pago.</li>
                      </ul>
                      <p className="font-bold text-amber-300 pt-2 border-t border-slate-800">DATOS DEL TITULAR DE LA FIRMA: 📧📲</p>
                      <ul className="space-y-1 pl-1 text-slate-300">
                        <li>✅ Correo electrónico personal:</li>
                        <li>✅ Correo electrónico de la empresa:</li>
                        <li>✅ Celular:</li>
                        <li>✅ Dirección de domicilio:</li>
                        <li>✅ Provincia de residencia:</li>
                        <li>✅ Ciudad de residencia:</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-amber-300">Formatos de archivos: Imagen o Pdf. 📂</p>
                      <ul className="space-y-1.5 pl-1">
                        <li>✅ Cédula o pasaporte, ambos lados, a color, legible y vigente.</li>
                        <li>✅ Fotografía sosteniendo la cédula o pasaporte por la parte frontal a la altura de su cuello.</li>
                        <li>✅ Comprobante de pago.</li>
                        <li>✅ Certificado Ruc.</li>
                      </ul>
                      <p className="font-bold text-amber-300 pt-2 border-t border-slate-800">Datos del titular de la firma electrónica: 📧📲</p>
                      <ul className="space-y-1 pl-1 text-slate-300">
                        <li>✅ Correo electrónico personal:</li>
                        <li>✅ Celular:</li>
                        <li>✅ Dirección de domicilio:</li>
                        <li>✅ Provincia de residencia:</li>
                        <li>✅ Ciudad de residencia:</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* TABLA COMPARATIVA DE TIPOS DE FIRMA AT THE BOTTOM */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0B2545]" />
                  <span>Tabla Comparativa de Modalidades de Firma Electrónica</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Precios finales incluyen el 15% de IVA</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0B2545] text-white font-bold uppercase text-[10px] tracking-wider">
                      <th className="p-3 border-b border-slate-800 text-left">Tipo de Firma</th>
                      <th className="p-3 border-b border-slate-800 text-left">Dirigido a</th>
                      <th className="p-3 border-b border-slate-800 text-center">1 Año</th>
                      <th className="p-3 border-b border-slate-800 text-center">2 Años</th>
                      <th className="p-3 border-b border-slate-800 text-center">3 Años</th>
                      <th className="p-3 border-b border-slate-800 text-center">4 Años</th>
                      <th className="p-3 border-b border-slate-800 text-center">5 Años</th>
                      <th className="p-3 border-b border-slate-800 text-center">Validez SRI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {/* Persona Natural */}
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                        <User className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Persona Natural</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium min-w-[220px]">Ciudadanos sin RUC para trámites públicos o contratos</td>
                      <td className="p-3 text-center font-bold text-slate-900">$18.20</td>
                      <td className="p-3 text-center font-bold text-slate-900">$22.20</td>
                      <td className="p-3 text-center font-bold text-slate-900">$33.28</td>
                      <td className="p-3 text-center font-bold text-slate-900">$44.36</td>
                      <td className="p-3 text-center font-black text-emerald-700 bg-emerald-50/50">$55.41</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Incluido
                        </span>
                      </td>
                    </tr>

                    {/* Persona Natural RUC */}
                    <tr className="hover:bg-slate-50 transition-colors bg-slate-50/30">
                      <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                        <Briefcase className="w-4 h-4 text-orange-500 shrink-0" />
                        <span>Persona Natural RUC</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium min-w-[220px]">Profesionales independientes, comerciantes y artesanos con RUC</td>
                      <td className="p-3 text-center font-bold text-slate-900">$18.20</td>
                      <td className="p-3 text-center font-bold text-slate-900">$22.20</td>
                      <td className="p-3 text-center font-bold text-slate-900">$33.28</td>
                      <td className="p-3 text-center font-bold text-slate-900">$44.36</td>
                      <td className="p-3 text-center font-black text-emerald-700 bg-emerald-50/50">$55.41</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Incluido
                        </span>
                      </td>
                    </tr>

                    {/* Persona Jurídica */}
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                        <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Persona Jurídica</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium min-w-[220px]">Representantes Legales de empresas (S.A.S., Cía Ltda, S.A.)</td>
                      <td className="p-3 text-center font-bold text-slate-900">$21.84</td>
                      <td className="p-3 text-center font-bold text-slate-900">$25.84</td>
                      <td className="p-3 text-center font-bold text-slate-900">$38.22</td>
                      <td className="p-3 text-center font-bold text-slate-900">$50.93</td>
                      <td className="p-3 text-center font-black text-purple-700 bg-purple-50/50">$63.12</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Incluido
                        </span>
                      </td>
                    </tr>

                    {/* Promo Emprende */}
                    <tr className="hover:bg-amber-50/50 transition-colors bg-amber-50/20">
                      <td className="p-3 font-extrabold text-slate-900 flex items-center gap-1.5 whitespace-nowrap">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Promo Emprende</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium min-w-[220px]">Pymes y emprendedores (Firma + Sistema de Facturación UpConta)</td>
                      <td className="p-3 text-center font-bold text-slate-900">$24.00</td>
                      <td className="p-3 text-center font-bold text-slate-900">$30.00</td>
                      <td className="p-3 text-center font-bold text-slate-900">$38.00</td>
                      <td className="p-3 text-center text-slate-400 font-semibold">—</td>
                      <td className="p-3 text-center text-slate-400 font-semibold">—</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-black text-[10px]">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Incluye Facturación
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA: CUENTAS BANCARIAS (ANF AC & UPCONTA S.A.S.) */}
        {/* ========================================================================= */}
        {activeTab === "cuentas" && (
          <div className="space-y-6">
            
            {/* Header Banner for Cuentas Bancarias */}
            <div className="bg-gradient-to-r from-[#0B2545] via-[#003566] to-[#0B2545] text-white p-6 rounded-2xl shadow-md border border-slate-700 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-sm">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <span>Cuentas Bancarias Oficiales para Depósito o Transferencia</span>
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    Utiliza cualquiera de estas cuentas para realizar el pago de Firmas Electrónicas o Planes UpConta. Copia los datos o la imagen para enviar al cliente por WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid with 2 Cards: ANF AC and UPCONTA S.A.S. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              
              {/* CARD 1: ANFAC AUTORIDAD DE CERTIFICACIÓN ECUADOR C.A. */}
              <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  {/* Card Header with Yellow & Blue theme */}
                  <div className="bg-[#0B2545] text-white p-4 rounded-xl flex items-center justify-between border border-amber-500/30">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                        <span>Datos para pago</span>
                      </h3>
                      <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block mt-0.5">
                        DEPÓSITO O TRANSFERENCIA
                      </span>
                    </div>
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg uppercase shadow-2xs">
                      ANF AC
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200/60 space-y-2.5 text-xs text-slate-800 font-semibold">
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Razón Social:</span>
                        <span className="font-extrabold text-slate-900 text-sm">ANFAC AUTORIDAD DE CERTIFICACIÓN ECUADOR C.A.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">RUC:</span>
                        <span className="font-extrabold text-slate-800">1792601215001</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Banco:</span>
                        <span className="font-extrabold text-slate-800">Banco Internacional</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Tipo de cuenta:</span>
                        <span className="font-extrabold text-slate-800">Cuenta Corriente</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Número de Cuenta:</span>
                        <span className="font-black text-blue-700 text-base">0700626089</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Correo electrónico:</span>
                        <span className="font-bold text-slate-800">info@anf.ac</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Teléfono:</span>
                        <span className="font-bold text-slate-800">02 3826877</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-amber-200/40">
                      <span className="text-amber-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Dirección:</span>
                        <span className="font-medium text-slate-700 text-xs block leading-tight">
                          Av. 12 de Octubre N24-739 y av. Colón. Edif. Torre Boreal, Torre A, Piso 6 Of. 603
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Web Footer Pill */}
                  <div className="bg-[#0B2545] text-amber-400 text-center py-2 px-4 rounded-xl text-xs font-black tracking-wider">
                    ANFAC AUTORIDAD DE CERTIFICACIÓN ECUADOR C.A. • www.anf.ac
                  </div>
                </div>

                {/* Copy Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCopyBankImage}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-400"
                  >
                    {copiedBankImage ? (
                      <>
                        <Check className="w-4 h-4 text-slate-950" />
                        <span>¡Imagen Copiada al Portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-950" />
                        <span>Copiar Imagen para Pegar en WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyBankText}
                    className="w-full py-2 px-4 bg-white hover:bg-slate-100 active:scale-98 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {copiedBankText ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Texto de Cuenta Copiado!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>Copiar Texto de Cuenta Bancaria</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* CARD 2: UPCONTA S.A.S. */}
              <div className="bg-white border-2 border-orange-200 rounded-2xl p-6 shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  {/* Card Header with Orange theme */}
                  <div className="bg-[#0B2545] text-white p-4 rounded-xl flex items-center justify-between border border-orange-500/30">
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
                        <span>Datos para pago</span>
                      </h3>
                      <span className="text-[11px] font-extrabold text-orange-400 uppercase tracking-wider block mt-0.5">
                        DEPÓSITO O TRANSFERENCIA
                      </span>
                    </div>
                    <span className="bg-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-lg uppercase shadow-2xs">
                      UPCONTA S.A.S.
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-200/60 space-y-2.5 text-xs text-slate-800 font-semibold">
                    <div className="flex items-start gap-1.5">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Razón Social:</span>
                        <span className="font-extrabold text-slate-900 text-sm">UPCONTA S.A.S.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-orange-200/40">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">RUC:</span>
                        <span className="font-extrabold text-slate-800">1793221216001</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-orange-200/40">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Banco:</span>
                        <span className="font-extrabold text-slate-800">Banco Pichincha</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-orange-200/40">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Tipo de cuenta:</span>
                        <span className="font-extrabold text-slate-800">Ahorros</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-orange-200/40">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Número de Cuenta:</span>
                        <span className="font-black text-sky-700 text-base">2212935613</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-orange-200/40">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Correo electrónico:</span>
                        <span className="font-bold text-slate-800">tesoreria@upconta.com</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5 pt-1.5 border-t border-orange-200/40">
                      <span className="text-orange-500 font-black">▶</span>
                      <div>
                        <span className="text-[11px] text-slate-500 font-bold block">Teléfono:</span>
                        <span className="font-bold text-slate-800">02 382 6772</span>
                      </div>
                    </div>
                  </div>

                  {/* Web Footer Pill */}
                  <div className="bg-[#0B2545] text-orange-400 text-center py-2 px-4 rounded-xl text-xs font-black tracking-wider">
                    UPCONTA S.A.S. • www.upconta.com
                  </div>
                </div>

                {/* Copy Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCopyUpContaBankImage}
                    className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 border border-orange-400"
                  >
                    {copiedUpContaBankImage ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>¡Imagen Copiada al Portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white" />
                        <span>Copiar Imagen para Pegar en WhatsApp</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyUpContaBankText}
                    className="w-full py-2 px-4 bg-white hover:bg-slate-100 active:scale-98 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {copiedUpContaBankText ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>¡Texto de Cuenta Copiado!</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 text-slate-600" />
                        <span>Copiar Texto de Cuenta Bancaria</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== TABS: PLAN CONTADOR ==================================== */}
        {activeTab === "contador" && <ContadorModule />}

        {/* ==================================== TABS: COMISIONES COMERCIAL ==================================== */}
        {activeTab === "comision" && <ComisionModule />}

        {/* ==================================== TABS: REGISTRO DE VENTAS ==================================== */}
        {activeTab === "ventas" && <VentasModule />}

        {/* ==================================== TABS: DASHBOARD METRICAS ==================================== */}
        {activeTab === "dashboard" && <DashboardModule />}

      </main>

      {/* Color Picker Dialog Modal ("Abanico de Colores") */}
      <ColorPickerDialog
        isOpen={colorPickerTarget !== null}
        onClose={() => setColorPickerTarget(null)}
        initialColor={
          colorPickerTarget === "bg"
            ? pdfBgColor
            : colorPickerTarget === "title"
            ? pdfTitleColor
            : colorPickerTarget === "sub"
            ? pdfSubtitleColor
            : "#0b2545"
        }
        onSelectColor={(newColor) => {
          if (colorPickerTarget === "bg") {
            setPdfBgColor(newColor);
            setPdfTitleColor(newColor);
            setPdfSubtitleColor("#475569");
          }
          if (colorPickerTarget === "title") setPdfTitleColor(newColor);
          if (colorPickerTarget === "sub") setPdfSubtitleColor(newColor);
        }}
        titleName={
          colorPickerTarget === "bg"
            ? "Fondo de Encabezados"
            : colorPickerTarget === "title"
            ? "Color de Título"
            : "Color de Subtítulos"
        }
      />

      {/* Footer Branding section */}
      <footer className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-900 text-center text-slate-500 text-xs">
        <p className="font-light leading-relaxed">
          GoDi — Plataforma Empresarial © 2026. Todos los derechos reservados.
        </p>
        <p className="text-[10px] text-slate-600 mt-1">
          Las tarifas mostradas incluyen el 15% de IVA aplicable para Ecuador. Los descuentos anuales corresponden al 10% del plan base.
        </p>
      </footer>

    </div>
  );
}
