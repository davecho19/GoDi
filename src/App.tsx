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
  Zap
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
import { GodiLogo } from "./components/GodiLogo";

export default function App() {
  // Main Tab State: "plan", "explorador", "simulador", "firmas"
  const [activeTab, setActiveTab] = useState<"plan" | "explorador" | "simulador" | "firmas">("plan");

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
  const [firmaVigenciaSelect, setFirmaVigenciaSelect] = useState<string>("1 AÑO");
  const [firmaQtySelect, setFirmaQtySelect] = useState<number>(1);

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
    tipoPlan: "facturacion" | "erp" | "contador";
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
      pdf.setTextColor(...C_WHITE);
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
    pdf.setTextColor(...C_WHITE);
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
    pdf.setTextColor(...C_WHITE);
    pdf.text("TOTAL ESTIMADO USD", boxX + 4, tableY - 4);
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(...C_SECONDARY);
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
      pdf.setTextColor(...C_WHITE);
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
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap lg:flex-nowrap justify-between items-center gap-4 lg:gap-6">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-4 shrink-0">
            <GodiLogo size="lg" className="shrink-0" />
            <div className="hidden sm:block h-9 w-[1px] bg-slate-200"></div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0B2545] animate-pulse"></span>
                <span className="uppercase tracking-widest text-[9.5px] font-black text-[#0B2545]">
                  Plataforma Empresarial GoDi
                </span>
              </div>
              <h1 className="text-xs font-bold tracking-tight text-slate-600 mt-0.5">
                Fichas Técnicas & Cotizador de Planes
              </h1>
            </div>
          </div>

          {/* Main static navigation tabs inside header */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex-wrap sm:flex-nowrap justify-center">
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "plan"
                  ? "bg-[#0B2545] text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Plan</span>
            </button>
            <button
              onClick={() => setActiveTab("firmas")}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "firmas"
                  ? "bg-[#0B2545] text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileCheck className="w-4 h-4 text-orange-400" />
              <span>Firmas Electrónicas</span>
            </button>
            <button
              onClick={() => setActiveTab("explorador")}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "explorador"
                  ? "bg-[#0B2545] text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Explorar Módulos</span>
            </button>
            <button
              onClick={() => setActiveTab("simulador")}
              className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "simulador"
                  ? "bg-[#0B2545] text-white shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Simulador</span>
            </button>
          </div>

          {/* Quick billing cycle toggle */}
          {tipoPlan === "erp" ? (
            <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === "monthly" 
                    ? "bg-[#0B2545] text-white shadow" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pago Mensual
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
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
          ) : (
            <div className="flex items-center bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold text-[#0B2545] shadow-2xs shrink-0">
              <span>Suscripción Anual</span>
            </div>
          )}
        </div>

        {/* Garantías ribbon underneath the tabs row inside the header */}
        <div className="bg-[#0B2545] text-white py-2.5 px-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2 flex-wrap justify-center text-center md:text-left">
              <span className="bg-slate-700 text-white border border-slate-500 text-[9.5px] font-black px-2 py-0.5 rounded tracking-wide uppercase shrink-0">
                Garantía GODi
              </span>
              <span className="text-white font-extrabold shrink-0">Cumplimiento Tributario SRI:</span>
              <span className="text-slate-200 text-[11px] leading-snug">Facturación electrónica autorizada, formatos XML oficiales y actualización normativa continua.</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300 font-bold flex-wrap justify-center shrink-0">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Soporte e Implantación Chat</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Respaldos Diarios en la Nube</span>
              </div>
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
            <div className="flex gap-4 text-xs font-medium text-slate-500">
              <div>Facturación: <span className="text-[#0B2545] font-bold">8 planes</span></div>
              <div className="border-l border-slate-200 pl-4">ERP: <span className="text-[#0B2545] font-bold">3 planes</span></div>
              <div className="border-l border-slate-200 pl-4">Contador: <span className="text-[#0B2545] font-bold">6 planes</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            
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
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">Lite-Mesa</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                Facturación Electrónica
                {tipoPlan === "facturacion" && <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545] animate-ping"></span>}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Planes Up Light, Up Base, Power y Plus orientados a emisión fiscal ágil de comprobantes.
              </p>
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
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                UpConta Start, Plus y Premium con inventarios multibodega, contabilidad integrada y nómina.
              </p>
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
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold uppercase">Multi-RUC</span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                Planes para Contadores
                {tipoPlan === "contador" && <span className="w-1.5 h-1.5 rounded-full bg-[#0B2545] animate-ping"></span>}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Suscripciones por volumen de empresas, Tax Ilimitado y Socio Estratégico Multiusuario.
              </p>
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

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin">
              <AnimatePresence mode="popLayout">
                {activePlanList.map((p) => {
                  const isSelected = selectedPlanName === p.nombre;
                  const metrics = extractQuickMetrics(p.modulos);
                  
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
                    <motion.div
                      key={p.nombre}
                      layoutId={`plan-card-${p.nombre}`}
                      onClick={() => setSelectedPlanName(p.nombre)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
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
                          <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            {p.nombre}
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0B2545]" />}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            Tier: {p.tier.replace("_", " ")}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">
                            ${cyclePrice.toFixed(2)}
                          </div>
                          <div className="text-[9px] text-slate-500 font-bold">
                            {itemCycleLabel}
                          </div>
                        </div>
                      </div>

                      {/* Quick specifications bullets */}
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{metrics.usuarios}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{metrics.comprobantes}</span>
                        </div>
                        {metrics.empresas && (
                          <div className="flex items-center gap-1.5 col-span-2 text-[#0B2545] font-bold">
                            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#0B2545]" />
                            <span>{metrics.empresas}</span>
                          </div>
                        )}
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
                <div className="p-6 bg-slate-50 border-b border-slate-200 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0B2545]/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 text-[#0B2545] text-[10px] font-extrabold rounded-md uppercase">
                        {tipoPlan}
                      </span>
                      <h3 className="text-xl font-black text-slate-850 mt-2 tracking-tight">
                        Ficha Técnica: {viewedPlanObj.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
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
                      <span className="text-xs text-slate-500 font-bold block mt-0.5">
                        {(() => {
                          if (tipoPlan === "erp" && billingCycle === "annual") {
                            return "/año";
                          }
                          return "/mes";
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

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

                  {/* Quick checkout CTA */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-xs text-slate-500">
                      ¿Deseas emitir una cotización para este plan?
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPlanName(viewedPlanObj.nombre);
                        handleAddProposalPlan(viewedPlanObj);
                        setCalcQuantity(1);
                        setActiveTab("simulador");
                        setTimeout(() => {
                          const calculatorSection = document.getElementById("cotizador-seccion");
                          if (calculatorSection) {
                            calculatorSection.scrollIntoView({ behavior: "smooth" });
                          }
                        }, 50);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#0B2545] hover:bg-[#061830] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Cargar en el Cotizador
                    </button>
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
            {/* CTA Banner to the Simulator */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center shadow-sm max-w-3xl mx-auto mt-8">
              <h3 className="text-sm font-bold text-slate-800">¿Quieres cotizar el plan para tus clientes?</h3>
              <p className="text-xs text-slate-500 mt-1">Usa nuestro simulador interactivo para calcular precios, agregar firmas electrónicas y descargar propuestas en PDF.</p>
              <button 
                onClick={() => setActiveTab("simulador")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] hover:bg-[#061830] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Ir al Simulador de Cotizaciones</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================== TABS: EXPLORAR MÓDULOS ==================================== */}
        {activeTab === "explorador" && (
          <div className="space-y-8 animate-fade-in">
            {/* Strategic Alliance Statement Banner */}
            <div className="bg-gradient-to-br from-[#0B2545] via-[#123866] to-[#0B2545] text-white border border-blue-900/40 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
                  <Shield className="w-3.5 h-3.5 text-blue-300" />
                  <span>Alianza Tecnológica & Comercial Oficial</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                    <span>GoDi S.A.S.</span>
                    <span className="text-blue-300 font-normal text-lg">+</span>
                    <span><span className="text-orange-400 font-black">Up</span>Conta</span>
                    <span className="text-xs font-semibold text-blue-200 bg-blue-900/80 border border-blue-700/60 px-2.5 py-0.5 rounded-md ml-1">
                      Trabajo en Conjunto
                    </span>
                  </h2>

                  {/* Unified Alliance & Transparency Statement in one cohesive block */}
                  <div className="bg-blue-950/60 p-5 rounded-xl border border-blue-800/50 text-xs md:text-sm text-blue-100 leading-relaxed space-y-2.5">
                    <p>
                      En <strong>GoDi S.A.S.</strong> trabajamos en conjunto con nuestro aliado estratégico <strong><span className="text-orange-400 font-bold">Up</span>Conta</strong> para la entrega de herramientas contables de alto nivel y la mejora constante adaptada a las necesidades de cada cliente.
                    </p>
                    <p className="text-blue-200/90 text-xs md:text-sm pt-2 border-t border-blue-800/40">
                      <strong>Transparencia y Respaldo Tecnológico:</strong> El sistema contable y de facturación es desarrollado por nuestro aliado oficial <strong><span className="text-orange-400 font-bold">Up</span>Conta</strong>. En <strong>GoDi S.A.S.</strong> ponemos a tu disposición esta potente herramienta junto a nuestra asesoría comercial, implementación personalizada y acompañamiento técnico permanente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
              <div className="border-b border-slate-200 pb-5 mb-6">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0B2545]" />
                  <span>Demostración del Sistema Contable <span className="text-orange-500 font-black">Up</span>Conta</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Accede de forma directa a la plataforma oficial de nuestro aliado <span className="font-semibold text-slate-700"><span className="text-orange-500 font-bold">Up</span>Conta</span> utilizando las credenciales de prueba preconfiguradas.
                </p>
              </div>

              {/* Directly render the Acceso al Sistema Real mockup full-width */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <AdminModuleMockups moduleName="Acceso al Sistema Real" />
              </div>
            </section>

            {/* CTA Banner to the Simulator */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center shadow-sm max-w-3xl mx-auto">
              <h3 className="text-sm font-bold text-slate-800">¿Quieres cotizar el plan para tus clientes?</h3>
              <p className="text-xs text-slate-500 mt-1">Usa nuestro simulador interactivo para calcular precios, agregar firmas electrónicas y descargar propuestas en PDF.</p>
              <button 
                onClick={() => setActiveTab("simulador")}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B2545] hover:bg-[#061830] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Ir al Simulador de Cotizaciones</span>
              </button>
            </div>
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
                      { nombre: "Azul GODi Oficial", bg: "#0b2545", title: "#0b2545", sub: "#475569" },
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
                        onChange={(e) => setPdfBgColor(e.target.value)}
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
                  <h4 className="text-sm font-extrabold text-[#0B2545]">GODi VALUATOR</h4>
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
          <div className="space-y-8 animate-fade-in">
            {/* Strategic Alliance Banner: GoDi S.A.S. + ANF AC */}
            <div className="bg-gradient-to-br from-[#0B2545] via-[#123866] to-[#0B2545] text-white border border-blue-900/40 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificadora Internacional Acreditada</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>+20 Años de Trayectoria en Ecuador</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5 flex-wrap">
                    <span>GoDi S.A.S.</span>
                    <span className="text-blue-300 font-normal text-lg">+</span>
                    <span className="bg-white text-[#0B2545] font-black px-3 py-1 rounded-lg border border-slate-200 shadow-md inline-flex items-center text-base tracking-wide">
                      ANF AC
                    </span>
                    <span className="text-xs font-semibold text-blue-200 bg-blue-900/80 border border-blue-700/60 px-2.5 py-1 rounded-md ml-1">
                      Trabajo en Conjunto
                    </span>
                  </h2>

                  {/* Unified Alliance & Value Add Statement */}
                  <div className="bg-blue-950/60 p-5 rounded-xl border border-blue-800/50 text-xs md:text-sm text-blue-100 leading-relaxed space-y-3">
                    <p>
                      En <strong>GoDi S.A.S.</strong> trabajamos directamente en conjunto con una certificadora internacional con más de 20 años en el país (<strong className="bg-white text-[#0B2545] px-2 py-0.5 rounded border border-blue-200 font-black">ANF AC</strong>). Te entregamos firmas electrónicas legales y vigentes para el SRI, facturación electrónica y trámites gubernamentales.
                    </p>
                    <p className="text-blue-200/90 text-xs md:text-sm pt-2.5 border-t border-blue-800/40">
                      <strong>Servicios Exclusivos Incluidos:</strong> Adicional a la entrega de tu firma electrónica en formato `.pfx` / `.p12`, te entregamos una <strong>plataforma web para preservar tu archivo</strong> de forma segura en la nube, un módulo para el <strong>cambio de PIN confidencial</strong>, y un <strong>aplicativo móvil oficial</strong> para la firma de documentos en PDF desde cualquier lugar.
                    </p>
                  </div>
                </div>

                {/* 3 Value Proposition Highlight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                      <Cloud className="w-4 h-4" />
                      <span>Plataforma de Preservación</span>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Resguarda y descarga tu archivo fuente de firma electrónica en la nube en cualquier momento, evitando pérdidas por extravío de equipo.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                      <Key className="w-4 h-4" />
                      <span>Gestión & Cambio de PIN</span>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Plataforma intuitiva para gestionar o cambiar la clave PIN de tu firma en forma segura y confidencial sin depender de terceros.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-wider">
                      <Smartphone className="w-4 h-4" />
                      <span>App Móvil para Firmar PDFs</span>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                      Firma contratos, facturas y documentos digitales en formato PDF directamente desde tu teléfono inteligente Android o iOS.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Showcase Cards with Prominent Large Highlight Boxes */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-orange-500" />
                  <span>Detalle Informativo por Tipo de Firma Electrónica</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Información técnica y coberturas de cada modalidad respaldada por ANF AC.
                </p>
              </div>

              {/* Grid of the 4 Signature Types */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. PERSONA NATURAL */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0B2545] flex items-center justify-center font-bold shadow-2xs">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Persona Natural</h3>
                          <span className="text-xs text-slate-500 font-medium">Cédula o Pasaporte / Sin RUC</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-blue-100 text-[#0B2545] border border-blue-200 px-3 py-1 rounded-full">
                        Uso Personal
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Diseñada para ciudadanos que requieren firmar trámites en instituciones públicas, contratos de arrendamiento, escrituras, declaraciones personales ante el SRI o gestiones legales.
                    </p>

                    {/* PROMINENT LARGE HIGHLIGHT BOX requested by user */}
                    <div className="bg-gradient-to-r from-blue-900 to-[#0B2545] text-white p-4 rounded-xl border border-blue-800 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                        BENEFICIOS DESTACADOS INCLUIDOS
                      </span>
                      <div className="space-y-1.5 text-sm font-black text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Validez SRI & Comprobantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Incluye App + Nube</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Precios ya incluyen IVA</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax-inclusive static price list */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tarifas Finales (IVA Incluido):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { vigencia: "15 DÍAS", precio: "$ 6,90" },
                          { vigencia: "1 AÑO", precio: "$ 18,20" },
                          { vigencia: "2 AÑOS", precio: "$ 22,20" },
                          { vigencia: "3 AÑOS", precio: "$ 33,28" },
                          { vigencia: "4 AÑOS", precio: "$ 44,36" },
                          { vigencia: "5 AÑOS", precio: "$ 55,41" }
                        ].map((item) => (
                          <div key={item.vigencia} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
                            <span className="text-[10px] font-bold text-slate-500 block">{item.vigencia}</span>
                            <span className="text-xs font-black text-slate-900">{item.precio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium flex justify-between items-center">
                    <span>Formato .p12 / .pfx oficial</span>
                    <span>ANF Acreditados</span>
                  </div>
                </div>

                {/* 2. PERSONA NATURAL CON RUC */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-2xs">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Persona Natural con RUC</h3>
                          <span className="text-xs text-slate-500 font-medium">Profesionales & Comerciantes</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full">
                        Facturación SRI
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Para profesionales independientes, comerciantes, artesanos y contribuyentes con RUC. Es el requisito oficial para emitir facturas, retenciones y comprobantes en el SRI.
                    </p>

                    {/* PROMINENT LARGE HIGHLIGHT BOX requested by user */}
                    <div className="bg-gradient-to-r from-blue-900 to-[#0B2545] text-white p-4 rounded-xl border border-blue-800 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                        BENEFICIOS DESTACADOS INCLUIDOS
                      </span>
                      <div className="space-y-1.5 text-sm font-black text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Validez SRI & Comprobantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Incluye App + Nube</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Precios ya incluyen IVA</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax-inclusive static price list */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tarifas Finales (IVA Incluido):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { vigencia: "1 AÑO", precio: "$ 18,20" },
                          { vigencia: "2 AÑOS", precio: "$ 22,20" },
                          { vigencia: "3 AÑOS", precio: "$ 33,28" },
                          { vigencia: "4 AÑOS", precio: "$ 44,36" },
                          { vigencia: "5 AÑOS", precio: "$ 55,41" }
                        ].map((item) => (
                          <div key={item.vigencia} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
                            <span className="text-[10px] font-bold text-slate-500 block">{item.vigencia}</span>
                            <span className="text-xs font-black text-slate-900">{item.precio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium flex justify-between items-center">
                    <span>Formato .p12 / .pfx oficial</span>
                    <span>ANF Acreditados</span>
                  </div>
                </div>

                {/* 3. PERSONA JURÍDICA */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-2xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Persona Jurídica</h3>
                          <span className="text-xs text-slate-500 font-medium">Representantes Legales de Empresa</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full">
                        Empresarial
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Otorgada a Representantes Legales, Gerentes o Apoderados de sociedades (S.A.S., Cía. Ltda., S.A.). Certifica la representación empresarial para facturación masiva y trámites corporativos.
                    </p>

                    {/* PROMINENT LARGE HIGHLIGHT BOX requested by user */}
                    <div className="bg-gradient-to-r from-blue-900 to-[#0B2545] text-white p-4 rounded-xl border border-blue-800 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                        BENEFICIOS DESTACADOS INCLUIDOS
                      </span>
                      <div className="space-y-1.5 text-sm font-black text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Validez SRI & Comprobantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Incluye App + Nube</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Precios ya incluyen IVA</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax-inclusive static price list */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tarifas Finales (IVA Incluido):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { vigencia: "1 AÑO", precio: "$ 21,84" },
                          { vigencia: "2 AÑOS", precio: "$ 25,84" },
                          { vigencia: "3 AÑOS", precio: "$ 38,22" },
                          { vigencia: "4 AÑOS", precio: "$ 50,93" },
                          { vigencia: "5 AÑOS", precio: "$ 63,12" }
                        ].map((item) => (
                          <div key={item.vigencia} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center">
                            <span className="text-[10px] font-bold text-slate-500 block">{item.vigencia}</span>
                            <span className="text-xs font-black text-slate-900">{item.precio}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 font-medium flex justify-between items-center">
                    <span>Formato .p12 / .pfx oficial</span>
                    <span>ANF Acreditados</span>
                  </div>
                </div>

                {/* 4. PROMO EMPRENDE */}
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 rounded-2xl border border-orange-200 p-6 space-y-5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">Promo Emprende</h3>
                          <span className="text-xs text-orange-800 font-semibold">Paquete Especial Pymes & Startups</span>
                        </div>
                      </div>
                      <span className="text-xs font-black bg-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                        Paquete Especial
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Plan preferencial en alianza con GoDi + ANF AC para emprendedores y nuevos negocios. Incluye emisión prioritaria express y soporte en la vinculación con tu facturación.
                    </p>

                    {/* PROMINENT LARGE HIGHLIGHT BOX requested by user */}
                    <div className="bg-gradient-to-r from-blue-900 to-[#0B2545] text-white p-4 rounded-xl border border-blue-800 shadow-sm space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block">
                        BENEFICIOS DESTACADOS INCLUIDOS
                      </span>
                      <div className="space-y-1.5 text-sm font-black text-white">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Validez SRI & Comprobantes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Incluye App + Nube</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>• Precios ya incluyen IVA</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax-inclusive static price list */}
                    <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-orange-200 space-y-2">
                      <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block">
                        Tarifas Promocionales Finales (IVA Incluido):
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { vigencia: "1 AÑO", precio: "$ 24,00" },
                          { vigencia: "2 AÑOS", precio: "$ 30,00" },
                          { vigencia: "3 AÑOS", precio: "$ 38,00" }
                        ].map((item) => (
                          <div key={item.vigencia} className="bg-orange-50 border border-orange-200 p-2 rounded-lg text-center">
                            <span className="text-[10px] font-bold text-orange-800 block">{item.vigencia}</span>
                            <span className="text-xs font-black text-slate-900">{item.precio}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-orange-950 font-medium leading-relaxed pt-2 border-t border-orange-100">
                        Incluye sistema de facturación UpConta de 70 comprobantes al año, catálogo de productos, servicios y módulo de impuestos.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-orange-200 text-xs text-orange-950 font-bold flex justify-between items-center relative z-10">
                    <span>Emisión Exprés Prioritaria</span>
                    <span>UpConta & ANF Acreditados</span>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

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
          if (colorPickerTarget === "bg") setPdfBgColor(newColor);
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
          GODi Software Co. © 2026. Todos los derechos reservados.
        </p>
        <p className="text-[10px] text-slate-600 mt-1">
          Las tarifas mostradas incluyen el 15% de IVA aplicable para Ecuador. Los descuentos anuales corresponden al 10% del plan base.
        </p>
      </footer>

    </div>
  );
}
