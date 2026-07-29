import React, { useState } from "react";
import { 
  Calculator, 
  Send, 
  Sparkles, 
  Building2, 
  Layers, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Users, 
  FileText,
  MessageSquare,
  HelpCircle,
  Briefcase,
  TrendingUp,
  Boxes
} from "lucide-react";

interface Asesor {
  nombre: string;
  telefono: string;
}

const ASESORES: Record<string, Asesor> = {
  salome: { nombre: "Salomé Estrella", telefono: "593990388493" },
  karla: { nombre: "Karla Haro", telefono: "593989347443" },
  ismenia: { nombre: "Ismenia Escalona", telefono: "593999122519" },
  evelyn: { nombre: "Evelyn Narváez", telefono: "593981947894" },
  david: { nombre: "David Santander", telefono: "593980690459" },
};

export function ContadorModule() {
  // Form state
  const [asesorKey, setAsesorKey] = useState<string>("");
  const [tipoEmpresaBase, setTipoEmpresaBase] = useState<string>("0");

  // Facturación e Inventarios
  const [cant70, setCant70] = useState<number>(0);
  const [cant500, setCant500] = useState<number>(0);
  const [cantIlim, setCantIlim] = useState<number>(0);

  // Módulos Corporativos
  const [mTesoreriaCant, setMTesoreriaCant] = useState<number>(0);
  const [mNominaCant, setMNominaCant] = useState<number>(0);
  const [mActivosCant, setMActivosCant] = useState<number>(0);
  const [mRestaurantesCant, setMRestaurantesCant] = useState<number>(0);
  const [mContabilidadCant, setMContabilidadCant] = useState<number>(0);

  // Prices
  const getBaseEmpresasPrice = (tipo: string): number => {
    switch (tipo) {
      case "1": return 50;
      case "3": return 100;
      case "6": return 150;
      case "10": return 200;
      case "tax_ilimitado": return 100;
      case "ilimitadas": return 300;
      default: return 0;
    }
  };

  const precioBaseEmpresas = getBaseEmpresasPrice(tipoEmpresaBase);

  // Facturación packages total
  const totalComprobantes = (cant70 * 10) + (cant500 * 25) + (cantIlim * 55);

  // Módulos corporativos total
  const totalModulosCantidad = mTesoreriaCant + mNominaCant + mActivosCant + mRestaurantesCant + mContabilidadCant;
  const totalModulos = totalModulosCantidad * 75;

  // Subtotal, IVA, Total
  const subtotal = precioBaseEmpresas + totalComprobantes + totalModulos;
  const iva = subtotal * 0.15;
  const totalAnual = subtotal + iva;

  // Quantity counts
  const totalPlanesFactura = cant70 + cant500 + cantIlim;

  // Exact Calculation Rule logic requested by user:
  // "donde solo si la cantidad de planes de facturacion son mayores a los adicionales, estos planes de facturacion se suman y se dividen para el total,
  // en el caso que los adicionales sean mayores a los planes de facturación, solo divides la cantidad maxima para el total"
  let divisor = 0;
  let descPromedio = "";

  if (tipoEmpresaBase === "tax_ilimitado") {
    if (totalPlanesFactura > totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio anual por cada uno de tus ${divisor} planes de facturación`;
    } else if (totalModulosCantidad > totalPlanesFactura) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor por cada uno de tus ${divisor} módulos corporativos`;
    } else if (totalPlanesFactura > 0 && totalPlanesFactura === totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio anual por cada uno de tus ${divisor} ítems contratados`;
    } else {
      divisor = 0;
      descPromedio = "Agrega planes de facturación o módulos corporativos para calcular";
    }
  } else if (tipoEmpresaBase === "ilimitadas") {
    if (totalPlanesFactura > totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor por cada uno de tus ${divisor} planes de facturación. (Empresas contables ilimitadas)`;
    } else if (totalModulosCantidad > totalPlanesFactura) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor por cada uno de tus ${divisor} módulos corporativos. (Empresas contables ilimitadas)`;
    } else if (totalPlanesFactura > 0 && totalPlanesFactura === totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor por cada uno de tus ${divisor} ítems contratados. (Empresas contables ilimitadas)`;
    } else {
      divisor = 0;
      descPromedio = "Agrega planes de facturación o módulos corporativos. ¡Empresas bases sin costo extra!";
    }
  } else if (["1", "3", "6", "10"].includes(tipoEmpresaBase)) {
    const numEmpresas = parseInt(tipoEmpresaBase, 10);
    if (totalPlanesFactura > totalModulosCantidad && totalPlanesFactura > numEmpresas) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio anual por cada uno de tus ${divisor} planes de facturación`;
    } else if (totalModulosCantidad > totalPlanesFactura && totalModulosCantidad > numEmpresas) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor promedio por cada uno de tus ${divisor} módulos corporativos`;
    } else {
      divisor = numEmpresas;
      descPromedio = `Valor de tu plan base dividido entre las ${numEmpresas} empresas incluidas`;
    }
  } else {
    if (totalPlanesFactura > totalModulosCantidad) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor promedio por cada uno de tus ${divisor} planes de facturación`;
    } else if (totalModulosCantidad > totalPlanesFactura) {
      divisor = totalModulosCantidad;
      descPromedio = `Valor promedio por cada uno de tus ${divisor} módulos corporativos`;
    } else if (totalPlanesFactura > 0) {
      divisor = totalPlanesFactura;
      descPromedio = `Valor por cada uno de tus ${divisor} ítems contratados`;
    } else {
      divisor = 0;
      descPromedio = "Selecciona un plan base o módulos para calcular";
    }
  }

  const valPromedio = divisor > 0 ? totalAnual / divisor : 0;

  const formatMoney = (val: number) => {
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // WhatsApp Sender
  const handleEnviarWhatsApp = () => {
    if (!asesorKey || !ASESORES[asesorKey]) {
      alert("Por favor elige un asesor comercial asignado antes de enviar.");
      return;
    }

    const asesorObj = ASESORES[asesorKey];
    let mensaje = `¡Hola ${asesorObj.nombre}! 👋\n\n`;

    if (tipoEmpresaBase === "ilimitadas") {
      mensaje += `🔥 *¡QUIERO SER ALIADO ESTRATÉGICO!*\nHe configurado mi Plan Ilimitado en la calculadora UpConta y deseo conocer los beneficios de distribución de firmas y comisiones.\n\n`;
    } else {
      mensaje += `He configurado mi plan contable en el Entorno UpConta y deseo contratar:\n\n`;
    }

    const getPlanBaseText = () => {
      switch (tipoEmpresaBase) {
        case "1": return "1 EMPRESA ($50)";
        case "3": return "3 EMPRESAS ($100)";
        case "6": return "6 EMPRESAS ($150)";
        case "10": return "10 EMPRESAS ($200)";
        case "tax_ilimitado": return "TAX ILIMITADO ($100)";
        case "ilimitadas": return "ILIMITADAS SOCIO ESTRATÉGICO ($300)";
        default: return "Sin selección";
      }
    };

    mensaje += `💎 1. Plan Base Seleccionado: ${getPlanBaseText()}\n\n`;
    mensaje += `💎 2. Paquetes de Facturación:\n`;
    mensaje += `* Paquetes UP LIGHT 70: ${cant70} ud.\n`;
    mensaje += `* Paquetes UP BASE 500: ${cant500} ud.\n`;
    mensaje += `* Paquetes UP POWER Ilimitado: ${cantIlim} ud.\n\n`;

    mensaje += `💎 3. Módulos Corporativos:\n`;
    mensaje += `* Tesorería: ${mTesoreriaCant} ud.\n`;
    mensaje += `* Nómina: ${mNominaCant} ud.\n`;
    mensaje += `* Activos Fijos: ${mActivosCant} ud.\n`;
    mensaje += `* Restaurantes: ${mRestaurantesCant} ud.\n`;
    mensaje += `* Contabilidad: ${mContabilidadCant} ud.\n\n`;

    mensaje += `💎 RESUMEN ECONÓMICO ANUAL:\n`;
    mensaje += `* Subtotal: $${formatMoney(subtotal)}\n`;
    mensaje += `* IVA (15%): $${formatMoney(iva)}\n`;
    mensaje += `* TOTAL ANUAL PROYECTADO: $${formatMoney(totalAnual)}\n\n`;

    mensaje += `💎 ANÁLISIS DE EFICIENCIA:\n`;
    mensaje += `* ${descPromedio}: $${formatMoney(valPromedio)} / año`;

    window.open(`https://api.whatsapp.com/send?phone=${asesorObj.telefono}&text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Main Grid: Configurator Left, Summary Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Configurator Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            
            {/* Asesor & Plan Base */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Ajustes de Plan &amp; Asesor</h3>
                  <p className="text-xs text-slate-500">Selecciona el asesor asignado y la base de empresas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Asesor Asignado <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={asesorKey}
                    onChange={e => setAsesorKey(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-sm focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  >
                    <option value="">-- Elige un Asesor --</option>
                    {Object.entries(ASESORES).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Empresas Base <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={tipoEmpresaBase}
                    onChange={e => setTipoEmpresaBase(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 text-white font-black text-sm rounded-xl focus:ring-2 focus:ring-orange-400 transition-all"
                  >
                    <option value="0">SELECCIONA...</option>
                    <option value="1">1 EMPRESA ($50.00)</option>
                    <option value="3">3 EMPRESAS ($100.00)</option>
                    <option value="6">6 EMPRESAS ($150.00)</option>
                    <option value="10">10 EMPRESAS ($200.00)</option>
                    <option value="tax_ilimitado">TAX ILIMITADO ($100.00)</option>
                    <option value="ilimitadas">ILIMITADAS SOCIO ESTRATÉGICO ($300.00)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Facturación e Inventarios */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Facturación e Inventarios</h3>
                  <p className="text-xs text-slate-500">Paquetes de comprobantes electrónicos autorizados</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">UP LIGHT 70</span>
                    <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-2 py-0.5 rounded-md">$10.00</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cant70}
                    onChange={e => setCant70(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">UP BASE 500</span>
                    <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-2 py-0.5 rounded-md">$25.00</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cant500}
                    onChange={e => setCant500(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm">UP POWER ILIMITADO</span>
                    <span className="bg-orange-100 text-orange-700 font-extrabold text-xs px-2 py-0.5 rounded-md">$55.00</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={cantIlim}
                    onChange={e => setCantIlim(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-center font-black text-slate-900 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Módulos Corporativos */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Módulos Corporativos</h3>
                  <p className="text-xs text-slate-500">Añade tesorería, nómina, activos fijos y más ($75.00 c/u)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Tesorería ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mTesoreriaCant}
                    onChange={e => setMTesoreriaCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Nómina ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mNominaCant}
                    onChange={e => setMNominaCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Activos Fijos ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mActivosCant}
                    onChange={e => setMActivosCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-xs">Restaurantes ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mRestaurantesCant}
                    onChange={e => setMRestaurantesCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
                  <span className="font-bold text-slate-800 text-xs">Contabilidad Avanzada ($75)</span>
                  <input
                    type="number"
                    min="0"
                    value={mContabilidadCant}
                    onChange={e => setMContabilidadCant(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-black text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Financial Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B2545] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 sticky top-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Resumen de Propuesta</h3>
                  <p className="text-xs text-slate-300">Valores sin IVA e IVA incluido (15%)</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full uppercase">
                Anual
              </span>
            </div>

            {/* Financial Line Items */}
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between items-center text-slate-300">
                <span>Plan Base:</span>
                <span className="font-black text-white">${formatMoney(precioBaseEmpresas)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Facturación e Inventarios:</span>
                <span className="font-black text-white">${formatMoney(totalComprobantes)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Módulos Adicionales:</span>
                <span className="font-black text-white">${formatMoney(totalModulos)}</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-slate-200">
                <span className="font-bold">Subtotal:</span>
                <span className="font-black text-white">${formatMoney(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>IVA (15%):</span>
                <span className="font-black text-amber-300">${formatMoney(iva)}</span>
              </div>

              {/* Total Anual Highlight */}
              <div className="pt-3 border-t-2 border-orange-500/40 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-black text-orange-400 tracking-wider block">TOTAL ANUAL</span>
                  <span className="text-xs text-slate-400">Incluye IVA oficial</span>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-orange-400 tracking-tight">
                  ${formatMoney(totalAnual)}
                </span>
              </div>
            </div>

            {/* Partner Alliance Badge (Only for ILIMITADAS) */}
            {tipoEmpresaBase === "ilimitadas" && (
              <div className="bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-400/80 p-5 rounded-2xl space-y-2.5 shadow-xl animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>¡FELICIDADES! SOCIO ESTRATÉGICO</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Este plan te convierte en <strong className="text-emerald-300 font-bold">SOCIO ESTRATÉGICO</strong> de UpConta.
                </p>
                <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-emerald-800/60">
                  <p>🔥 Distribuye <strong>Firmas Electrónicas</strong> junto a nuestra certificadora <strong>ANF</strong> con <strong className="text-amber-300">50% DE DESCUENTO</strong>.</p>
                  <p>💰 Comisiona hasta un <strong className="text-amber-300">30%</strong> por cada plan que refieras.</p>
                </div>
              </div>
            )}

            {/* Analysis Box */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border-l-4 border-orange-500 border-r border-t border-b border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider block">
                ANÁLISIS DE EFICIENCIA POR EMPRESA
              </span>
              <p className="text-xs text-slate-300 font-medium leading-tight">
                {descPromedio}
              </p>
              <span className="text-2xl font-black text-white block pt-1">
                ${formatMoney(valPromedio)} <span className="text-xs font-normal text-slate-400">/ año</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Dynamic Module Showcase ("Ficha Técnica de tu Plan") */}
      {tipoEmpresaBase !== "0" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                Ficha Técnica de tu Plan
              </h3>
              <p className="text-xs text-slate-500">
                Módulos y capacidades incluidas en la configuración actual
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Módulo Administrativo & Comprobantes */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                Módulo Administrativo
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Dashboard Informativo</li>
                <li>Proformas y Cotizaciones</li>
                <li>Facturación Electrónica SRI</li>
                <li>Facturas de reembolso</li>
                <li>Facturación por Lote</li>
                <li>Comprobantes de retención</li>
                <li>Notas de Crédito / Débito</li>
                <li>Liquidación de Compras</li>
                <li>Guías de Remisión</li>
                <li>Notas de Venta / Compras</li>
                <li>Facturación recurrente / Contratos</li>
              </ul>
            </div>

            {/* Módulo de Impuestos */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                Módulo de Impuestos
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>ATS (Anexo Transaccional Simplificado)</li>
                <li>Formulario 103 (Retenciones)</li>
                <li>Formulario 104 (IVA)</li>
                <li>Reporte SRI automatizado</li>
              </ul>
            </div>

            {/* Módulo Contabilidad */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                Módulo Contabilidad
              </h4>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                <li>Plan de Cuentas flexible</li>
                <li>Centro de costos</li>
                <li>Reglas Contables y Asientos automáticos</li>
                <li>Balance de Comprobación</li>
                <li>Balance General</li>
                <li>Estado de Pérdidas y Ganancias (P&amp;L)</li>
              </ul>
            </div>

            {/* Módulo de Producción (shown if Facturación packages > 0) */}
            {totalPlanesFactura > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo de Producción &amp; Inventarios
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Catálogo de productos y servicios</li>
                  <li>Productos con receta / combos</li>
                  <li>Multibodega y transferencias</li>
                  <li>Liquidación de importaciones</li>
                  <li>Análisis de Rotación e Inventarios</li>
                  <li>Análisis de rentabilidad</li>
                  <li>Órdenes de compra y producción</li>
                </ul>
              </div>
            )}

            {/* Módulo de Tesorería */}
            {mTesoreriaCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo de Tesorería
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Estado de cuenta proveedores y clientes</li>
                  <li>Histórico de pagos y cobros masivos</li>
                  <li>Anticipos y compensaciones</li>
                  <li>Cuentas bancarias y tarjetas de crédito</li>
                  <li>Cajas chicas y conciliación bancaria</li>
                </ul>
              </div>
            )}

            {/* Módulo de Nómina */}
            {mNominaCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo de Nómina
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Base de datos de empleados y roles de pago</li>
                  <li>Kardex de vacaciones y certificados</li>
                  <li>RDEP, Formulario 107 y gastos personales</li>
                  <li>Cargas familiares, novedades y horas extras</li>
                  <li>Anticipos, préstamos e incremento de sueldos</li>
                </ul>
              </div>
            )}

            {/* Módulo Activos Fijos */}
            {mActivosCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo Activos Fijos
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Ficha detallada de activos</li>
                  <li>Depreciaciones automáticas</li>
                  <li>Kárdex de control</li>
                  <li>Acta de entrega recepción</li>
                </ul>
              </div>
            )}

            {/* Módulo Restaurantes */}
            {mRestaurantesCant > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-orange-600 pb-2 border-b border-slate-200">
                  Módulo Restaurantes
                </h4>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  <li>Gestión de meseros y mesas</li>
                  <li>Comandas e impresora de cocina</li>
                  <li>Caja Restaurante y pre-cuenta</li>
                  <li>Informe diario de ventas</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
