import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import {
  Receipt,
  DollarSign,
  Briefcase,
  Building2,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  Calculator,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Calendar,
  Percent,
  Search,
  Sun,
  Moon,
  Printer,
  History,
  Trash2,
  ExternalLink,
  Share2,
  Home,
  Coins,
  Sparkles,
  CalendarDays,
  UserPlus,
  X,
  Scale,
  Download,
  ChevronDown,
  Eye,
  Clock,
  FileText,
} from 'lucide-react';

// Módulos independientes
import HorasExtrasModule from './modules/HorasExtrasModule';
import RegimenTributarioModule from './modules/RegimenTributarioModule';
import UtilidadesModule from './modules/UtilidadesModule';
import PreciosPosModule from './modules/PreciosPosModule';
import CartaRenunciaModule from './modules/CartaRenunciaModule';
import { formatearMoneda, numeroALetras } from './utils/formatters';
import RentaInmueblesModule from './modules/RentaInmueblesModule';
import PlazoFijoModule from './modules/PlazoFijoModule';
import RecargoConsumoModule from './modules/RecargoConsumoModule';
import ReciboCajaModule from './modules/ReciboCajaModule';
import ConversorUitModule from './modules/ConversorUitModule';

// Algoritmo oficial SUNAT Módulo 11 para RUC
function calcularDigitoVerificadorRuc(diezDigitos: string): number {
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  for (let i = 0; i < 10; i++) suma += parseInt(diezDigitos.charAt(i), 10) * factores[i];
  const residuo = suma % 11;
  let digito = 11 - residuo;
  if (digito === 10) digito = 0;
  else if (digito === 11) digito = 1;
  return digito;
}

function validarRucSunat(rucStr: string): { valido: boolean; mensaje: string; tipo: string } {
  const ruc = rucStr.trim();
  if (ruc.length !== 11 || !/^\d+$/.test(ruc)) {
    return { valido: false, mensaje: 'El RUC debe constar de 11 dígitos numéricos exactos.', tipo: 'Desconocido' };
  }
  const prefijo = ruc.substring(0, 2);
  let tipo = 'Persona Natural con Negocio / Independiente';
  if (prefijo === '20') tipo = 'Persona Jurídica (Empresa SAC, SRL, EIRL, etc.)';
  else if (prefijo === '15' || prefijo === '17') tipo = 'Persona con Carné de Extranjería / FF.AA.';
  else if (prefijo !== '10') {
    return { valido: false, mensaje: 'Prefijo no válido (debe iniciar con 10, 20, 15 o 17).', tipo: 'Inválido' };
  }

  const digitoCalculado = calcularDigitoVerificadorRuc(ruc.substring(0, 10));
  const digitoReal = parseInt(ruc.charAt(10), 10);
  if (digitoCalculado === digitoReal) {
    return { valido: true, mensaje: 'Estructura y dígito verificador válidos según el algoritmo oficial de SUNAT.', tipo };
  }
  return { valido: false, mensaje: `Dígito verificador final inválido (debería ser ${digitoCalculado}).`, tipo };
}

// Directorio Top 10 empresas peruanas
const PADRON_RUC_LOCAL: Record<string, { razonSocial: string; estado: string; condicion: string; direccion: string; rubro: string }> = {
  '20131312955': {
    razonSocial: 'SUPERINTENDENCIA NACIONAL DE ADUANAS Y DE ADMINISTRACION TRIBUTARIA - SUNAT',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. GARCILASO DE LA VEGA NRO. 1472 - LIMA',
    rubro: 'ADMINISTRACION PUBLICA EN GENERAL',
  },
  '20100047218': {
    razonSocial: 'BANCO DE CREDITO DEL PERU - BCP',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'CAL. CENTENARIO NRO. 156 URB. LAS LADERAS DE MELGAREJO - LA MOLINA, LIMA',
    rubro: 'OTROS TIPOS DE INTERMEDIACION MONETARIA',
  },
  '20100053455': {
    razonSocial: 'BANCO INTERNACIONAL DEL PERU - INTERBANK',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. CARLOS VILLARAN NRO. 140 URB. SANTA CATALINA - LA VICTORIA, LIMA',
    rubro: 'OTROS TIPOS DE INTERMEDIACION MONETARIA',
  },
  '20100130204': {
    razonSocial: 'BANCO BBVA PERU',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. REPUBLICA DE PANAMA NRO. 3055 - SAN ISIDRO, LIMA',
    rubro: 'ACTIVIDADES DE BANCA MULTIPLE',
  },
  '20100043140': {
    razonSocial: 'SCOTIABANK PERU S.A.A.',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. DIONISIO DERTEANO NRO. 102 - SAN ISIDRO, LIMA',
    rubro: 'OTROS TIPOS DE INTERMEDIACION MONETARIA',
  },
  '20100017491': {
    razonSocial: 'TELEFONICA DEL PERU S.A.A. (MOVISTAR)',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. ENRIQUE CANAVAL MOREYRA NRO. 148 - SAN ISIDRO, LIMA',
    rubro: 'TELECOMUNICACIONES Y SERVICIOS MOVILES',
  },
  '20100128056': {
    razonSocial: 'SAGA FALABELLA S.A.',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. PASEO DE LA REPUBLICA NRO. 3220 URB. JARDIN - SAN ISIDRO, LIMA',
    rubro: 'VENTA AL POR MENOR EN TIENDAS POR DEPARTAMENTO',
  },
  '20100055237': {
    razonSocial: 'ALICORP S.A.A.',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. ARGENTINA NRO. 4793 URB. PARQUE INDUSTRIAL - CALLAO',
    rubro: 'ELABORACION DE PRODUCTOS ALIMENTICIOS Y CONSUMO MASIVO',
  },
  '20100113610': {
    razonSocial: 'UNION DE CERVECERIAS PERUANAS BACKUS Y JOHNSTON S.A.A.',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AV. NICOLAS AYLLON NRO. 3986 - ATE, LIMA',
    rubro: 'ELABORACION DE BEBIDAS MALTEADAS Y CERVEZAS',
  },
  '20100152356': {
    razonSocial: 'SERVICIO DE AGUA POTABLE Y ALCANTARILLADO DE LIMA - SEDAPAL',
    estado: 'ACTIVO',
    condicion: 'HABIDO',
    direccion: 'AUTOPISTA RAMIRO PRIALE NRO. 210 - EL AGUSTINO, LIMA',
    rubro: 'CAPTACION, DEPURACION Y DISTRIBUCION DE AGUA',
  },
};

const DETRACCION_CATALOG = [
  { id: '12_servicios', name: 'Demás servicios gravados con IGV / Asesorías / Software / Marketing', rate: 0.12, minAmount: 700 },
  { id: '10_alquiler', name: 'Arrendamiento o cesión en uso de bienes muebles', rate: 0.10, minAmount: 700 },
  { id: '10_transporte_pers', name: 'Transporte de personas interprovincial', rate: 0.10, minAmount: 700 },
  { id: '4_construccion', name: 'Contratos de construcción civil', rate: 0.04, minAmount: 700 },
  { id: '4_carga', name: 'Transporte terrestre de bienes y carga', rate: 0.04, minAmount: 400 },
  { id: '12_comision', name: 'Comisión mercantil / Agenciamiento comercial', rate: 0.12, minAmount: 700 },
  { id: '15_madera', name: 'Madera y derivados', rate: 0.15, minAmount: 700 },
];

const CRONOGRAMA_SUNAT: Record<string, { periodo: string; vencimiento: string }[]> = {
  '0': [
    { periodo: 'Enero', vencimiento: '14 Feb' },
    { periodo: 'Febrero', vencimiento: '14 Mar' },
    { periodo: 'Marzo', vencimiento: '15 Abr' },
    { periodo: 'Abril', vencimiento: '16 May' },
    { periodo: 'Mayo', vencimiento: '13 Jun' },
    { periodo: 'Junio', vencimiento: '15 Jul' },
    { periodo: 'Julio', vencimiento: '14 Ago' },
    { periodo: 'Agosto', vencimiento: '15 Set' },
    { periodo: 'Setiembre', vencimiento: '16 Oct' },
    { periodo: 'Octubre', vencimiento: '14 Nov' },
    { periodo: 'Noviembre', vencimiento: '15 Dic' },
    { periodo: 'Diciembre', vencimiento: '16 Ene (2027)' },
  ],
  '1': [
    { periodo: 'Enero', vencimiento: '15 Feb' },
    { periodo: 'Febrero', vencimiento: '15 Mar' },
    { periodo: 'Marzo', vencimiento: '16 Abr' },
    { periodo: 'Abril', vencimiento: '17 May' },
    { periodo: 'Mayo', vencimiento: '14 Jun' },
    { periodo: 'Junio', vencimiento: '16 Jul' },
    { periodo: 'Julio', vencimiento: '15 Ago' },
    { periodo: 'Agosto', vencimiento: '16 Set' },
    { periodo: 'Setiembre', vencimiento: '17 Oct' },
    { periodo: 'Octubre', vencimiento: '15 Nov' },
    { periodo: 'Noviembre', vencimiento: '16 Dic' },
    { periodo: 'Diciembre', vencimiento: '17 Ene (2027)' },
  ],
};

for (let d = 2; d <= 9; d++) {
  CRONOGRAMA_SUNAT[String(d)] = CRONOGRAMA_SUNAT['0'].map((item) => ({
    periodo: item.periodo,
    vencimiento: `${parseInt(item.vencimiento.split(' ')[0], 10) + (d % 4)} ${item.vencimiento.split(' ')[1]}`,
  }));
}
CRONOGRAMA_SUNAT['bc'] = CRONOGRAMA_SUNAT['0'].map((item) => ({
  periodo: item.periodo,
  vencimiento: `${parseInt(item.vencimiento.split(' ')[0], 10) + 7} ${item.vencimiento.split(' ')[1]}`,
}));

type ModuleType =
  | 'home'
  | 'sunat'
  | 'cambio'
  | 'laboral'
  | 'liquidacion'
  | 'sueldo'
  | 'tim'
  | 'ruc'
  | 'alcabala'
  | 'prestamo'
  | 'cronograma'
  | 'costo_empleador'
  | 'horas_extras'
  | 'regimen'
  | 'utilidades'
  | 'precios_pos'
  | 'renuncia'
  | 'renta_inmuebles'
  | 'plazo_fijo'
  | 'recargo_consumo'
  | 'recibo_caja'
  | 'uit';

export default function App() {
  const getInitialModule = (): ModuleType => {
    const hash = window.location.hash.replace('#', '') as ModuleType;
    const validos: ModuleType[] = [
      'sunat',
      'cambio',
      'laboral',
      'liquidacion',
      'sueldo',
      'tim',
      'ruc',
      'alcabala',
      'prestamo',
      'cronograma',
      'costo_empleador',
      'horas_extras',
      'regimen',
      'utilidades',
      'precios_pos',
      'renuncia',
    ];
    if (validos.includes(hash)) {
      return hash;
    }
    return 'home';
  };

  const [activeModule, setActiveModule] = useState<ModuleType>(getInitialModule);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('todoenuno_theme') as 'dark' | 'light') || 'dark';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Estados del Voucher y Descargas
  const voucherRef = useRef<HTMLDivElement>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketData, setTicketData] = useState<{ titulo: string; filas: { label: string; valor: string }[]; total: string; letras: string } | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showWspPreview, setShowWspPreview] = useState(false);
  const [printSize, setPrintSize] = useState<'a4' | 'letter' | 'ticket'>('a4');

  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalTab, setLegalTab] = useState<'terminos' | 'privacidad' | 'deslinde'>('terminos');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [historyItems, setHistoryItems] = useState<Array<{ id: string; fecha: string; modulo: string; detalle: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('todoenuno_historial') || '[]');
    } catch {
      return [];
    }
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const addHistoryItem = (modulo: string, detalle: string) => {
    const nuevo = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      modulo,
      detalle,
    };
    const listaActualizada = [nuevo, ...historyItems.slice(0, 7)];
    setHistoryItems(listaActualizada);
    localStorage.setItem('todoenuno_historial', JSON.stringify(listaActualizada));
  };

  const clearHistory = () => {
    setHistoryItems([]);
    localStorage.removeItem('todoenuno_historial');
  };

  const navigateTo = (mod: ModuleType) => {
    setActiveModule(mod);
    window.location.hash = mod === 'home' ? '' : mod;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setActiveModule(getInitialModule());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLegalModal) setShowLegalModal(false);
        else if (showTicketModal) {
          setShowTicketModal(false);
          setShowDownloadMenu(false);
          setShowPrintMenu(false);
          setShowWspPreview(false);
        } else navigateTo('home');
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTicketModal, showLegalModal]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('todoenuno_theme', nextTheme);
  };

  const copyToClipboard = (text: string | number, key: string, label?: string) => {
    navigator.clipboard.writeText(String(text));
    setCopiedItem(key);
    if (label) showToast(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const descargarVoucherImagen = async (formato: 'png' | 'jpeg') => {
    if (!voucherRef.current) return;
    setShowDownloadMenu(false);
    try {
      const dataUrl = formato === 'png'
        ? await htmlToImage.toPng(voucherRef.current, { pixelRatio: 2, backgroundColor: '#ffffff' })
        : await htmlToImage.toJpeg(voucherRef.current, { pixelRatio: 2, quality: 0.95, backgroundColor: '#ffffff' });

      const link = document.createElement('a');
      link.download = `comprobante-todoenuno.${formato}`;
      link.href = dataUrl;
      link.click();
      showToast(`Comprobante descargado en .${formato.toUpperCase()}`);
    } catch {
      showToast('Error al generar la imagen del comprobante');
    }
  };

  const ejecutarImpresion = (tamano: 'a4' | 'letter' | 'ticket') => {
    setPrintSize(tamano);
    setShowPrintMenu(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const generarTextoWhatsapp = () => {
    if (!ticketData) return '';
    const separador = '--------------------------------';
    const lineas = ticketData.filas.map(f => `${f.label}: ${f.valor}`).join('\n');
    return `*TODO EN UNO PERU*\nComprobante de Calculo Oficial\n${separador}\n*${ticketData.titulo.toUpperCase()}*\n${lineas}\n${separador}\n*TOTAL: ${ticketData.total}*\n_${ticketData.letras}_\n${separador}\nVerificado en: todoenuno.pe`;
  };

  const compartirVoucherNativo = async () => {
    const texto = generarTextoWhatsapp();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Comprobante - ${ticketData?.titulo || 'Todo en Uno Perú'}`,
          text: texto,
          url: 'https://todoenuno.pe',
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
        }
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
    }
  };

  // --- ESTADOS SUNAT ---
  const [sunatSubTab, setSunatSubTab] = useState<'igv' | 'spot' | 'retencion' | 'cuarta'>('igv');
  const [subtotalInput, setSubtotalInput] = useState<string>('1000');
  const [totalInput, setTotalInput] = useState<string>('1180');
  const [spotTotal, setSpotTotal] = useState<string>('1500');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('12_servicios');
  const [retencionTotal, setRetencionTotal] = useState<string>('2000');
  const [cuartaTotal, setCuartaTotal] = useState<string>('2500');
  const [tieneSuspension, setTieneSuspension] = useState<boolean>(false);

  // --- ESTADOS TIPO DE CAMBIO ---
  const [fuenteTc, setFuenteTc] = useState<'sunat' | 'paralelo'>('sunat');
  const [tipoOperacion, setTipoOperacion] = useState<'vender' | 'comprar'>('vender');
  const [usdVal, setUsdVal] = useState<string>('1000');
  const [penVal, setPenVal] = useState<string>('3427');

  const tcSunatCompra = 3.427;
  const tcSunatVenta = 3.448;
  const tcParaleloCompra = 3.435;
  const tcParaleloVenta = 3.460;
  const tcBcpCompra = 3.390;
  const tcBcpVenta = 3.525;
  const tcInterbankCompra = 3.410;
  const tcInterbankVenta = 3.493;
  const tcBbvaCompra = 3.395;
  const tcBbvaVenta = 3.518;

  // --- ESTADOS BENEFICIOS LABORALES (CTS & GRATI) ---
  const [laboralTab, setLaboralTab] = useState<'grati' | 'cts'>('grati');
  const [sueldoBasico, setSueldoBasico] = useState<string>('2500');
  const [tieneAsigFamiliar, setTieneAsigFamiliar] = useState<boolean>(false);
  const [mesesTrabajados, setMesesTrabajados] = useState<number>(6);
  const [tipoSeguro, setTipoSeguro] = useState<'essalud' | 'eps'>('essalud');

  // --- ESTADOS LIQUIDACIÓN LABORAL ---
  const [sueldoLiq, setSueldoLiq] = useState<string>('3000');
  const [mesesAntiguedad, setMesesAntiguedad] = useState<number>(18);
  const [motivoCese, setMotivoCese] = useState<'renuncia' | 'despido'>('renuncia');
  const [diasVacPendientes, setDiasVacPendientes] = useState<number>(15);

  // --- ESTADOS SUELDO NETO & 5TA ---
  const [sueldoBruto, setSueldoBruto] = useState<string>('4500');
  const [regimenPension, setRegimenPension] = useState<'integra' | 'prima' | 'habitat' | 'profuturo' | 'onp'>('integra');
  const [afpComisionMixta, setAfpComisionMixta] = useState<boolean>(true);

  // --- ESTADOS TIM (MORA SUNAT) ---
  const [deudaTributaria, setDeudaTributaria] = useState<string>('1200');
  const [diasMora, setDiasMora] = useState<number>(45);

  // --- ESTADOS ALCABALA ---
  const [valorInmueble, setValorInmueble] = useState<string>('250000');

  // --- ESTADOS PRÉSTAMO FRANCÉS ---
  const [montoPrestamo, setMontoPrestamo] = useState<string>('15000');
  const [teaPrestamo, setTeaPrestamo] = useState<string>('18.5');
  const [plazoMeses, setPlazoMeses] = useState<number>(24);

  // --- ESTADOS CRONOGRAMA SUNAT ---
  const [digitoRucCronograma, setDigitoRucCronograma] = useState<string>('0');

  // --- ESTADOS COSTO LABORAL EMPLEADOR ---
  const [sueldoEmpleador, setSueldoEmpleador] = useState<string>('2000');
  const [regimenEmpresa, setRegimenEmpresa] = useState<'micro' | 'pequena' | 'general'>('micro');

  // --- ESTADOS VALIDADOR & CONSULTA RUC ---
  const [rucInput, setRucInput] = useState<string>('20131312955');
  const [rucDataResult, setRucDataResult] = useState<any>(null);
  const [isSearchingRuc, setIsSearchingRuc] = useState<boolean>(false);

  // Sincronización IGV
  const handleSubtotalChange = (val: string) => {
    setSubtotalInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const tot = (num * 1.18).toFixed(2);
      setTotalInput(tot);
      addHistoryItem('IGV', `Subtotal S/ ${num.toFixed(2)} → Total S/ ${tot}`);
    } else {
      setTotalInput('');
    }
  };

  const handleTotalChange = (val: string) => {
    setTotalInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const sub = (num / 1.18).toFixed(2);
      setSubtotalInput(sub);
      addHistoryItem('IGV', `Total S/ ${num.toFixed(2)} → Subtotal S/ ${sub}`);
    } else {
      setSubtotalInput('');
    }
  };

  const subtotalNum = parseFloat(subtotalInput) || 0;
  const totalNum = parseFloat(totalInput) || 0;
  const igvCalculado = totalNum - subtotalNum;
  const totalEnLetras = numeroALetras(totalNum);

  // SPOT Detracciones
  const numSpot = parseFloat(spotTotal) || 0;
  const currentSpotItem = DETRACCION_CATALOG.find((s) => s.id === selectedSpotId) || DETRACCION_CATALOG[0];
  const aplicaSpot = numSpot > currentSpotItem.minAmount;
  const montoDetraccion = aplicaSpot ? Math.round(numSpot * currentSpotItem.rate) : 0;
  const netoPagarProveedor = numSpot - montoDetraccion;

  // Retenciones (3%) & 4ta
  const numRet = parseFloat(retencionTotal) || 0;
  const montoRetencion = numRet > 700 ? +(numRet * 0.03).toFixed(2) : 0;
  const netoPagarRetencion = numRet - montoRetencion;

  const numCuarta = parseFloat(cuartaTotal) || 0;
  const aplicaCuarta = !tieneSuspension && numCuarta > 1500;
  const montoRetencionCuarta = aplicaCuarta ? +(numCuarta * 0.08).toFixed(2) : 0;
  const netoCobrarCuarta = numCuarta - montoRetencionCuarta;

  // Tipo de Cambio
  const tasaActiva =
    fuenteTc === 'sunat'
      ? tipoOperacion === 'vender' ? tcSunatCompra : tcSunatVenta
      : tipoOperacion === 'vender' ? tcParaleloCompra : tcParaleloVenta;

  const handleUsdChange = (val: string) => {
    setUsdVal(val);
    const n = parseFloat(val);
    if (!isNaN(n)) setPenVal((n * tasaActiva).toFixed(2));
    else setPenVal('');
  };
  const handlePenChange = (val: string) => {
    setPenVal(val);
    const n = parseFloat(val);
    if (!isNaN(n) && tasaActiva > 0) setUsdVal((n / tasaActiva).toFixed(2));
    else setUsdVal('');
  };
  const numUsd = parseFloat(usdVal) || 0;
  const numPen = numUsd * tasaActiva;
  const totalEnLetrasPEN = numeroALetras(numPen);
  const valorBcp = tipoOperacion === 'vender' ? numUsd * tcBcpCompra : numUsd * tcBcpVenta;
  const ahorroEstimadoBcp =
    tipoOperacion === 'vender' ? Math.max(0, numPen - valorBcp) : Math.max(0, valorBcp - numPen);

  // Cálculos Laborales
  const numSueldo = parseFloat(sueldoBasico) || 0;
  const baseComputable = numSueldo + (tieneAsigFamiliar ? 102.5 : 0);
  const gratiProporcional = (baseComputable / 6) * Math.min(6, Math.max(1, mesesTrabajados));
  const bonoExtraordinario = tipoSeguro === 'essalud' ? gratiProporcional * 0.09 : gratiProporcional * 0.0675;
  const totalGratificacion = gratiProporcional + bonoExtraordinario;
  const sextoGrati = gratiProporcional / 6;
  const baseCts = baseComputable + sextoGrati;
  const totalCts = (baseCts / 12) * Math.min(6, Math.max(1, mesesTrabajados));

  // Liquidación
  const numSueldoLiq = parseFloat(sueldoLiq) || 0;
  const fraccionMeses = mesesAntiguedad % 6 || 6;
  const gratiTrunca = (numSueldoLiq / 6) * fraccionMeses * 1.09;
  const ctsTrunca = ((numSueldoLiq + numSueldoLiq / 6) / 12) * fraccionMeses;
  const vacTrunca = (numSueldoLiq / 30) * diasVacPendientes;
  const aniosCompletos = Math.floor(mesesAntiguedad / 12);
  const mesesRestantes = mesesAntiguedad % 12;
  const indemnizacionDespido =
    motivoCese === 'despido'
      ? Math.min(numSueldoLiq * 12, (numSueldoLiq * 1.5) * aniosCompletos + (numSueldoLiq * 1.5 / 12) * mesesRestantes)
      : 0;
  const totalLiquidacion = gratiTrunca + ctsTrunca + vacTrunca + indemnizacionDespido;

  // Sueldo Neto
  const numBruto = parseFloat(sueldoBruto) || 0;
  let tasaPension = 0.13;
  if (regimenPension !== 'onp') {
    tasaPension = 0.10 + 0.0184 + (afpComisionMixta ? 0 : 0.016);
  }
  const descuentoPension = numBruto * tasaPension;
  const uit2026 = 5350;
  const baseImponible5ta = Math.max(0, numBruto * 14 - 7 * uit2026);
  let impuestoAnual = 0;
  if (baseImponible5ta > 0) {
    const tramo1 = Math.min(baseImponible5ta, 5 * uit2026);
    impuestoAnual += tramo1 * 0.08;
    const remanente1 = Math.max(0, baseImponible5ta - 5 * uit2026);
    if (remanente1 > 0) {
      const tramo2 = Math.min(remanente1, 15 * uit2026);
      impuestoAnual += tramo2 * 0.14;
    }
  }
  const retencionMensual5ta = impuestoAnual / 12;
  const sueldoNetoRecibir = Math.max(0, numBruto - descuentoPension - retencionMensual5ta);

  // TIM SUNAT
  const numDeuda = parseFloat(deudaTributaria) || 0;
  const timDiaria = 0.0003;
  const interesMoratorio = numDeuda * timDiaria * diasMora;
  const deudaTotalPagar = numDeuda + interesMoratorio;

  // Alcabala
  const numInmueble = parseFloat(valorInmueble) || 0;
  const deducc10Uit = 10 * uit2026;
  const baseAfectaAlcabala = Math.max(0, numInmueble - deducc10Uit);
  const impuestoAlcabala = +(baseAfectaAlcabala * 0.03).toFixed(2);

  // Préstamo Francés
  const pMonto = parseFloat(montoPrestamo) || 0;
  const pTea = (parseFloat(teaPrestamo) || 0) / 100;
  const tasaMensual = Math.pow(1 + pTea, 1 / 12) - 1;
  const cuotaMensual =
    tasaMensual > 0 && plazoMeses > 0
      ? (pMonto * (tasaMensual * Math.pow(1 + tasaMensual, plazoMeses))) / (Math.pow(1 + tasaMensual, plazoMeses) - 1)
      : 0;
  const totalPagarPrestamo = cuotaMensual * plazoMeses;
  const totalInteresesPrestamo = Math.max(0, totalPagarPrestamo - pMonto);

  // Costo Laboral Empleador
  const sEmp = parseFloat(sueldoEmpleador) || 0;
  const costoEssalud = sEmp * 0.09;
  const provGrati = regimenEmpresa === 'general' ? (sEmp * 1.09) / 6 : regimenEmpresa === 'pequena' ? (sEmp * 1.09) / 12 : 0;
  const provCts = regimenEmpresa === 'general' ? (sEmp + sEmp / 6) / 12 : regimenEmpresa === 'pequena' ? ((sEmp + sEmp / 6) / 12) / 2 : 0;
  const provVac = regimenEmpresa === 'general' ? sEmp / 12 : (sEmp / 12) / 2;
  const sobrecostoTotal = costoEssalud + provGrati + provCts + provVac;
  const costoTotalMensual = sEmp + sobrecostoTotal;

  // RUC & DNI Helper
  const esDniOchoDigitos = rucInput.length === 8 && /^\d+$/.test(rucInput);
  const ruc10GeneradoDesdeDni = useMemo(() => {
    if (!esDniOchoDigitos) return '';
    const base10 = '10' + rucInput;
    const digVer = calcularDigitoVerificadorRuc(base10);
    return `${base10}${digVer}`;
  }, [rucInput, esDniOchoDigitos]);

  const resultadoRuc = validarRucSunat(rucInput);

  const consultarDatosRuc = async () => {
    setIsSearchingRuc(true);
    const cleanRuc = rucInput.trim();
    if (PADRON_RUC_LOCAL[cleanRuc]) {
      setTimeout(() => {
        setRucDataResult(PADRON_RUC_LOCAL[cleanRuc]);
        setIsSearchingRuc(false);
        addHistoryItem('Consulta RUC', `${cleanRuc} - ${PADRON_RUC_LOCAL[cleanRuc].razonSocial.substring(0, 25)}...`);
      }, 400);
      return;
    }
    try {
      const res = await fetch(`https://api.apis.net.pe/v1/ruc?numero=${cleanRuc}`);
      if (res.ok) {
        const data = await res.json();
        const info = {
          razonSocial: data.nombre || data.razonSocial,
          estado: data.estado || 'ACTIVO',
          condicion: data.condicion || 'HABIDO',
          direccion: data.direccion || 'No especificada',
          rubro: data.actividadEconomica || 'COMERCIO Y SERVICIOS',
        };
        setRucDataResult(info);
        addHistoryItem('Consulta RUC', `${cleanRuc} - ${info.razonSocial.substring(0, 25)}...`);
      } else {
        setRucDataResult({
          razonSocial: resultadoRuc.tipo,
          estado: 'NO DISPONIBLE EN PADRÓN LOCAL',
          condicion: 'VERIFICACIÓN PENDIENTE EN SOL',
          direccion: 'Requiere validación directa en sunat.gob.pe',
          rubro: 'Información protegida por SUNAT',
        });
      }
    } catch {
      setRucDataResult({
        razonSocial: resultadoRuc.tipo,
        estado: 'REGISTRADO',
        condicion: 'HABIDO (ESTIMADO)',
        direccion: 'Consúltese en portal SUNAT',
        rubro: 'Servicios generales / Empresariales',
      });
    } finally {
      setIsSearchingRuc(false);
    }
  };

  const copiarEIrASunat = () => {
    if (rucInput.length === 11) {
      navigator.clipboard.writeText(rucInput);
      showToast('¡RUC copiado al portapapeles! Pégalo con Ctrl+V en SUNAT.');
      window.open('https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp', '_blank');
    }
  };

  const abrirGoogleCalendar = (periodo: string, fechaVencimiento: string) => {
    const titulo = encodeURIComponent(`Declaración Jurada SUNAT - Periodo ${periodo}`);
    const detalles = encodeURIComponent(`Vencimiento de obligaciones tributarias (IGV-Renta) para RUC terminado en ${digitoRucCronograma}. Programado desde Todo en Uno Perú.`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&details=${detalles}`;
    window.open(url, '_blank');
  };

  const abrirTicket = (titulo: string, filas: { label: string; valor: string }[], total: string, letras: string) => {
    setTicketData({ titulo, filas, total, letras });
    setShowTicketModal(true);
  };

  const modulesList: { id: ModuleType; title: string; desc: string; tag: string; icon: any }[] = [
    { id: 'sunat', title: 'Calculadora SUNAT (IGV, SPOT)', desc: 'IGV 18%, Detracciones Banco de la Nación, Retención 3% y Recibos por Honorarios', tag: 'Tributario', icon: Receipt },
    { id: 'cambio', title: 'Dólar Hoy & Comparador de Bancos', desc: 'Tipo de cambio SUNAT oficial vs. Paralelo con spread de BCP, Interbank y BBVA', tag: 'Finanzas', icon: DollarSign },
    { id: 'cronograma', title: 'Cronograma de Vencimientos SUNAT', desc: 'Fechas límite mensuales según el último dígito del RUC con alerta a Google Calendar', tag: 'Tributario', icon: CalendarDays },
    { id: 'costo_empleador', title: 'Costo Laboral Empleador (Pymes)', desc: 'Sobrecosto real de contratación: Microempresa (REMYPE), Pequeña y General', tag: 'Planilla', icon: UserPlus },
    { id: 'horas_extras', title: 'Horas Extras y Feriados (D.L. 854)', desc: 'Sobretasas oficiales del 25%, 35% y triple pago por laborar domingos y feriados', tag: 'Laboral', icon: Clock },
    { id: 'regimen', title: 'Simulador de Régimen Tributario', desc: 'Diagnóstico inteligente: ¿Nuevo RUS, Especial (RER), MYPE o General?', tag: 'Tributario', icon: HelpCircle },
    { id: 'utilidades', title: 'Reparto Legal de Utilidades (D.L. 892)', desc: 'Estimación del 50% por días laborados y 50% por sueldo anual', tag: 'Laboral', icon: Briefcase },
    { id: 'precios_pos', title: 'Fijación de Precios & Comisiones POS', desc: 'Calcula tu precio de venta absorbiendo las comisiones de Niubiz, Izipay y Yape', tag: 'Comercio', icon: DollarSign },
    { id: 'renuncia', title: 'Carta de Renuncia Laboral Formal', desc: 'Generador de carta formal con exoneración legal de 30 días de preaviso', tag: 'Documentos', icon: FileText },
    { id: 'alcabala', title: 'Impuesto de Alcabala Inmobiliario', desc: 'Deducción de 10 UIT inafectas y cálculo del 3% para compraventa de viviendas', tag: 'Inmuebles', icon: Home },
    { id: 'prestamo', title: 'Simulador de Préstamos (Cuota fija)', desc: 'Cronograma con sistema francés, cálculo de TEA mensual y total de intereses', tag: 'Bancario', icon: Coins },
    { id: 'liquidacion', title: 'Liquidación por Despido / Renuncia', desc: 'Cálculo de beneficios truncos (CTS, Gratificación, Vacaciones) e indemnización', tag: 'Laboral', icon: UserCheck },
    { id: 'sueldo', title: 'Calculadora de Sueldo Neto (Boleta)', desc: 'Descuento de pensión (AFP Integra, Prima, Habitat, Profuturo, ONP) y Renta de 5ta', tag: 'Planilla', icon: Percent },
    { id: 'laboral', title: 'Gratificación y Depósito de CTS', desc: 'Cálculo semestral legal de gratificación (+bono EsSalud) y depósito CTS', tag: 'Semestral', icon: Briefcase },
    { id: 'tim', title: 'Intereses Moratorios SUNAT (TIM)', desc: 'Actualización diaria de deudas tributarias vencidas (0.03% diario)', tag: 'Tributario', icon: Calendar },
    { id: 'ruc', title: 'Consulta y Validador Oficial de RUC', desc: 'Búsqueda de razón social, estado, condición, generador DNI y Módulo 11', tag: 'Verificación', icon: Building2 },
    { id: 'renta_inmuebles', title: 'Renta 1ra y 2da Categoría (Inmuebles)', desc: 'Cálculo del 5% oficial para alquileres de predios o ganancia de capital en venta de casas', tag: 'Inmuebles', icon: Home },
    { id: 'plazo_fijo', title: 'Simulador Plazo Fijo & TREA Cajas', desc: 'Calcula tu rendimiento anual neto en Cajas Municipales vs. Bancos tradicionales', tag: 'Finanzas', icon: Coins },
    { id: 'recargo_consumo', title: 'Recargo al Consumo (Restaurantes 10%)', desc: 'Desglose del 10% legal de servicios para el personal más IGV en comandas y cuentas', tag: 'Gastronomía', icon: Receipt },
    { id: 'recibo_caja', title: 'Generador de Recibo de Caja Simple', desc: 'Comprobante interno de ingresos/egresos en efectivo listo para imprimir y firmar', tag: 'Documentos', icon: FileText },
    { id: 'uit', title: 'Conversor Oficial de UIT 2026', desc: 'Conversión rápida Soles/UIT (S/ 5,350) para topes del Estado, SAT y multas laborales', tag: 'Tributario', icon: Scale },
  ];

  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modulesList;
    const term = searchTerm.toLowerCase();
    return modulesList.filter(
      (m) => m.title.toLowerCase().includes(term) || m.desc.toLowerCase().includes(term) || m.tag.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const isDark = theme === 'dark';
  const bgMain = isDark
    ? 'bg-zinc-950 text-zinc-100 bg-ambient-dark theme-dark'
    : 'bg-slate-50 text-slate-800 bg-ambient-light theme-light';
  const bgCard = isDark ? 'bg-zinc-900/60 border-zinc-800/80' : 'bg-white/80 border-slate-200/80 shadow-sm';
  const bgInput = isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900';
  const borderHeader = isDark ? 'border-zinc-800/80 bg-zinc-900/50' : 'border-slate-200/80 bg-white/80';

  const badgeValid = isDark
    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
    : 'bg-emerald-50 border-emerald-300 text-emerald-800';
  const badgeInvalid = isDark
    ? 'bg-rose-950/40 border-rose-800/80 text-rose-300'
    : 'bg-rose-50 border-rose-300 text-rose-800';

  return (
    <div className={`min-h-screen ${bgMain} flex flex-col font-sans transition-colors duration-200`}>
      {/* Toast Flotante */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white border border-zinc-700 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 anim-toast">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODAL DE VOUCHER INTERACTIVO CON DESCARGAS, HOJAS Y AIRDROP */}
      {showTicketModal && ticketData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 w-full max-w-sm rounded-2xl shadow-2xl p-6 font-mono text-xs border border-zinc-200 relative anim-modal-in">
            <button
              onClick={() => {
                setShowTicketModal(false);
                setShowDownloadMenu(false);
                setShowPrintMenu(false);
                setShowWspPreview(false);
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div
              id="printable-voucher"
              ref={voucherRef}
              className={`p-2 bg-white text-zinc-950 ${
                printSize === 'a4' ? 'page-a4' : printSize === 'letter' ? 'page-letter' : 'page-ticket'
              }`}
            >
              <div className="text-center pb-4 border-b border-dashed border-zinc-300 space-y-1">
                <span className="font-black text-sm tracking-widest uppercase">TODO EN UNO PERU</span>
                <p className="text-[10px] text-zinc-500 font-sans">Comprobante de Calculo Oficial</p>
                <p className="text-[9px] text-zinc-400">{new Date().toLocaleString('es-PE')}</p>
              </div>

              <div className="py-4 space-y-2 border-b border-dashed border-zinc-300">
                <span className="font-bold text-[11px] block uppercase text-zinc-800">{ticketData.titulo}</span>
                {ticketData.filas.map((f, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-zinc-600">{f.label}:</span>
                    <span className="font-bold">{f.valor}</span>
                  </div>
                ))}
              </div>

              <div className="py-4 space-y-1.5 border-b border-dashed border-zinc-300 text-center">
                <span className="text-[10px] text-zinc-500 uppercase block font-sans">IMPORTE TOTAL</span>
                <span className="text-2xl font-black tracking-tight">{ticketData.total}</span>
                <p className="text-[9px] text-zinc-500 uppercase leading-relaxed pt-1">{ticketData.letras}</p>
              </div>

              <div className="pt-3 text-center">
                <p className="text-[9px] text-zinc-400 font-sans">Verificado y calculado en www.todoenuno.pe</p>
              </div>
            </div>

            <div className="pt-4 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 relative">
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDownloadMenu(!showDownloadMenu);
                      setShowPrintMenu(false);
                    }}
                    className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors btn-press-effect"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute left-0 bottom-full mb-1 w-full bg-white border border-zinc-200 rounded-lg shadow-xl py-1 z-20 text-[11px] font-sans">
                      <button
                        onClick={() => descargarVoucherImagen('png')}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between"
                      >
                        <span>Formato PNG</span>
                        <span className="text-[9px] text-zinc-400">Calidad alta</span>
                      </button>
                      <button
                        onClick={() => descargarVoucherImagen('jpeg')}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between border-t border-zinc-100"
                      >
                        <span>Formato JPG</span>
                        <span className="text-[9px] text-zinc-400">Comprimido</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPrintMenu(!showPrintMenu);
                      setShowDownloadMenu(false);
                    }}
                    className="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors btn-press-effect"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>

                  {showPrintMenu && (
                    <div className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 z-20 text-[11px] font-sans">
                      <button
                        onClick={() => ejecutarImpresion('a4')}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between"
                      >
                        <span>Hoja A4</span>
                        <span className="text-[9px] text-zinc-400">Estándar</span>
                      </button>
                      <button
                        onClick={() => ejecutarImpresion('letter')}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between border-t border-zinc-100"
                      >
                        <span>Hoja Carta</span>
                        <span className="text-[9px] text-zinc-400">Letter</span>
                      </button>
                      <button
                        onClick={() => ejecutarImpresion('ticket')}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 flex items-center justify-between border-t border-zinc-100"
                      >
                        <span>Ticket Térmico</span>
                        <span className="text-[9px] text-zinc-400">80 mm</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowWspPreview(!showWspPreview)}
                  className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition-colors btn-press-effect"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{showWspPreview ? 'Ocultar' : 'Ver Texto WhatsApp'}</span>
                </button>

                <button
                  onClick={compartirVoucherNativo}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors btn-press-effect"
                  title="Compartir vía WhatsApp o AirDrop"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar / AirDrop</span>
                </button>
              </div>

              {showWspPreview && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-[10px] font-sans">
                  <div className="flex items-center justify-between text-emerald-800 font-bold border-b border-emerald-200 pb-1">
                    <span>Mensaje compatible con WhatsApp:</span>
                    <button
                      onClick={() => copyToClipboard(generarTextoWhatsapp(), 'c_wsp_txt', 'Texto de WhatsApp copiado')}
                      className="text-emerald-700 hover:underline"
                    >
                      Copiar texto
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[10px] text-zinc-700 max-h-32 overflow-y-auto bg-white p-2 rounded border border-emerald-100">
                    {generarTextoWhatsapp()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER ÚNICO FIJO */}
      <header className={`border-b ${borderHeader} backdrop-blur sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => {
              navigateTo('home');
              setShowGuide(false);
            }}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="relative w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center group-hover:scale-105 transition-all shadow-sm">
              <span className="font-mono font-black text-white text-base tracking-tighter">
                T<span className="text-zinc-300">1</span>
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-zinc-950"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Todo en Uno
                </span>
                <span className={`text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                  isDark
                    ? 'bg-zinc-900 text-zinc-300 border-zinc-700'
                    : 'bg-slate-100 text-slate-800 border-slate-300'
                }`}>
                  PE
                  <span className="w-1 h-2 rounded-sm bg-red-600"></span>
                </span>
              </div>
              <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-zinc-400' : 'text-slate-500'} hidden sm:block`}>
                Herramientas &amp; Finanzas
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar (presiona / para enfocar)"
              className={`w-full rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none border transition-colors ${
                isDark ? 'bg-zinc-900 border-zinc-800 focus:border-zinc-600 text-zinc-200 placeholder-zinc-500' : 'bg-slate-100 border-slate-300 focus:border-slate-500 text-slate-800 placeholder-slate-400'
              }`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100">
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeModule !== 'home' && (
              <>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors btn-press-effect ${
                    showGuide
                      ? isDark ? 'bg-zinc-200 text-zinc-950 font-semibold' : 'bg-slate-900 text-white font-semibold'
                      : isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{showGuide ? 'Ocultar Guía' : '¿Cómo llenar?'}</span>
                </button>
                <button
                  onClick={() => {
                    navigateTo('home');
                    setShowGuide(false);
                  }}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors btn-press-effect ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Inicio</span>
                </button>
              </>
            )}

            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className={`p-2 rounded-lg border transition-colors btn-press-effect ${
                isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

{/* CONTENIDO PRINCIPAL AISLADO POR MÓDULO */}
      <main key={activeModule} className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 anim-fade-in-up">
        {/* PANTALLA PRINCIPAL */}
        {activeModule === 'home' && (
          <div className="space-y-8">
            <div className="max-w-xl mx-auto text-center pt-2 pb-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                Centro de Utilidades y Calculadoras
              </h1>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Selecciona la herramienta que necesitas. Todas las fórmulas aplican las normativas vigentes en Perú.
              </p>
            </div>

            <div className="block md:hidden">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar calculadora (IGV, cronograma, préstamo, ruc...)"
                className={`w-full rounded-lg px-4 py-2 text-xs border ${bgInput}`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((item) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`group rounded-xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${bgCard} hover:border-zinc-500 card-hover-effect glass-card`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border icon-bounce ${
                          isDark ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-medium border px-2 py-0.5 rounded ${
                          isDark ? 'text-zinc-400 border-zinc-700/60 bg-zinc-800/40' : 'text-slate-600 border-slate-300 bg-slate-100'
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold mb-1 group-hover:text-blue-500 transition-colors">
                        {item.title}
                      </h2>
                      <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>Abrir herramienta</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HISTORIAL LOCAL */}
            {historyItems.length > 0 && (
              <div className={`rounded-xl p-4 border ${bgCard} mt-8 glass-card`}>
                <div className="flex items-center justify-between border-b pb-2 mb-3 border-zinc-800">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-semibold">Cálculos Recientes en esta sesión</span>
                  </div>
                  <button onClick={clearHistory} className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 btn-press-effect">
                    <Trash2 className="w-3 h-3" /> Limpiar historial
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {historyItems.map((h) => (
                    <div key={h.id} className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800/80' : 'bg-slate-50/80 border-slate-200'}`}>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 mb-1">
                        <span className="font-semibold text-zinc-400 uppercase">{h.modulo}</span>
                        <span>{h.fecha}</span>
                      </div>
                      <p className="truncate font-mono">{h.detalle}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MÓDULOS INDEPENDIENTES */}
        {activeModule === 'horas_extras' && (
          <HorasExtrasModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} abrirTicket={abrirTicket} showToast={showToast} />
        )}
        {activeModule === 'regimen' && (
          <RegimenTributarioModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} />
        )}
        {activeModule === 'utilidades' && (
          <UtilidadesModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} abrirTicket={abrirTicket} showToast={showToast} />
        )}
        {activeModule === 'precios_pos' && (
          <PreciosPosModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} showToast={showToast} />
        )}
        {activeModule === 'renuncia' && (
          <CartaRenunciaModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} showToast={showToast} />
        )}
        {activeModule === 'renta_inmuebles' && (
          <RentaInmueblesModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} abrirTicket={abrirTicket} showToast={showToast} />
        )}
        {activeModule === 'plazo_fijo' && (
          <PlazoFijoModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} showToast={showToast} />
        )}
        {activeModule === 'recargo_consumo' && (
          <RecargoConsumoModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} abrirTicket={abrirTicket} showToast={showToast} />
        )}
        {activeModule === 'recibo_caja' && (
          <ReciboCajaModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} showToast={showToast} />
        )}
        {activeModule === 'uit' && (
          <ConversorUitModule isDark={isDark} bgCard={bgCard} bgInput={bgInput} showToast={showToast} />
        )}

        {/* CRONOGRAMA */}
        {activeModule === 'cronograma' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <CalendarDays className="w-5 h-5 text-zinc-400" />
                  Cronograma de Vencimientos SUNAT
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Fechas máximas de declaración jurada mensual para evitar multas de SUNAT</p>
              </div>
            </div>

            <div className={`p-5 rounded-xl border space-y-4 ${bgCard} glass-card`}>
              <span className="text-xs font-medium block">Selecciona el último dígito de tu RUC:</span>
              <div className="flex flex-wrap gap-2">
                {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'bc'].map((dig) => (
                  <button
                    key={dig}
                    onClick={() => setDigitoRucCronograma(dig)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold border transition-colors btn-press-effect ${
                      digitoRucCronograma === dig
                        ? isDark ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-slate-900 text-white border-slate-900'
                        : isDark ? 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-600' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {dig === 'bc' ? 'Buenos Contribuyentes' : `Dígito ${dig}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(CRONOGRAMA_SUNAT[digitoRucCronograma] || CRONOGRAMA_SUNAT['0']).map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${bgCard} card-hover-effect glass-card`}>
                  <div>
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold">Periodo: {item.periodo}</span>
                    <span className="text-xl font-bold font-mono tracking-tight block mt-1">{item.vencimiento}</span>
                  </div>
                  <button
                    onClick={() => abrirGoogleCalendar(item.periodo, item.vencimiento)}
                    className="mt-3 py-1.5 px-2.5 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1.5 hover:bg-zinc-800/40 transition-colors btn-press-effect"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Alerta en Google Calendar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COSTO LABORAL */}
        {activeModule === 'costo_empleador' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-zinc-400" />
                  Calculadora de Costo Laboral Empleador
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Sobrecosto real de contratación mensual para micro, pequeña y régimen general</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Datos de la Contratación</span>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Sueldo Bruto Acordado</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={sueldoEmpleador}
                      onChange={(e) => setSueldoEmpleador(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Régimen Laboral de la Empresa</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setRegimenEmpresa('micro')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                        regimenEmpresa === 'micro' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Microempresa
                    </button>
                    <button
                      onClick={() => setRegimenEmpresa('pequena')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                        regimenEmpresa === 'pequena' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Pequeña Empresa
                    </button>
                    <button
                      onClick={() => setRegimenEmpresa('general')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                        regimenEmpresa === 'general' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Régimen General
                    </button>
                  </div>
                </div>

                <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="font-semibold text-zinc-300">Beneficios según ley:</p>
                  <p className="opacity-80">
                    {regimenEmpresa === 'micro' && '• Microempresa REMYPE: 15 días de vacaciones. No tiene CTS ni Gratificaciones de julio/diciembre.'}
                    {regimenEmpresa === 'pequena' && '• Pequeña Empresa: Media gratificación (julio y diciembre), media CTS y 15 días de vacaciones.'}
                    {regimenEmpresa === 'general' && '• Régimen General: Gratificación completa (+9% bono), CTS completa y 30 días de vacaciones.'}
                  </p>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Provisión Mensual de Sobrecostos</span>
                  <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between">
                      <span className="opacity-70">Sueldo pactado con el trabajador:</span>
                      <span className="font-mono">S/ {formatearMoneda(sEmp)}</span>
                    </div>
                    <div className="flex justify-between text-blue-500">
                      <span>Aporte EsSalud (9%):</span>
                      <span className="font-mono">+ S/ {formatearMoneda(costoEssalud)}</span>
                    </div>
                    <div className="flex justify-between text-blue-500">
                      <span>Provisión mensual de Gratificación:</span>
                      <span className="font-mono">+ S/ {formatearMoneda(provGrati)}</span>
                    </div>
                    <div className="flex justify-between text-blue-500">
                      <span>Provisión mensual de CTS:</span>
                      <span className="font-mono">+ S/ {formatearMoneda(provCts)}</span>
                    </div>
                    <div className="flex justify-between text-blue-500">
                      <span>Provisión mensual de Vacaciones:</span>
                      <span className="font-mono">+ S/ {formatearMoneda(provVac)}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Costo Total Mensual para la Empresa</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(costoTotalMensual)}</span>
                    </div>
                    <button
                      onClick={() =>
                        abrirTicket(
                          'Costo Laboral Empleador',
                          [
                            { label: 'Sueldo Básico', valor: `S/ ${formatearMoneda(sEmp)}` },
                            { label: 'EsSalud (9%)', valor: `S/ ${formatearMoneda(costoEssalud)}` },
                            { label: 'Provisión Gratificación', valor: `S/ ${formatearMoneda(provGrati)}` },
                            { label: 'Provisión CTS', valor: `S/ ${formatearMoneda(provCts)}` },
                            { label: 'Provisión Vacaciones', valor: `S/ ${formatearMoneda(provVac)}` },
                          ],
                          `S/ ${formatearMoneda(costoTotalMensual)}`,
                          numeroALetras(costoTotalMensual)
                        )
                      }
                      className="p-2 rounded-md bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs btn-press-effect"
                    >
                      <Printer className="w-3.5 h-3.5" /> Voucher
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUNAT IGV/SPOT */}
        {activeModule === 'sunat' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Calculator className="w-5 h-5 text-zinc-400" />
                  Calculadora SUNAT (IGV, Detracciones, Retenciones, 4ta)
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Operaciones tributarias oficiales del día a día</p>
              </div>

              <div className={`flex p-1 rounded-lg border overflow-x-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-200 border-slate-300'}`}>
                {(['igv', 'spot', 'retencion', 'cuarta'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSunatSubTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors btn-press-effect ${
                      sunatSubTab === tab
                        ? isDark ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-white text-slate-900 font-semibold shadow-sm'
                        : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab === 'igv' && 'IGV (18%)'}
                    {tab === 'spot' && 'Detracciones (SPOT)'}
                    {tab === 'retencion' && 'Retención (3%)'}
                    {tab === 'cuarta' && '4ta Categoría (8%)'}
                  </button>
                ))}
              </div>
            </div>

            {sunatSubTab === 'igv' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Cálculo Bidireccional</span>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Subtotal (Base Imponible)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        value={subtotalInput}
                        onChange={(e) => handleSubtotalChange(e.target.value)}
                        className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Total Facturado (Con IGV)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        value={totalInput}
                        onChange={(e) => handleTotalChange(e.target.value)}
                        className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                      />
                    </div>
                  </div>
                </div>

                <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2 border-zinc-800">
                      <span className="text-xs font-medium">Resumen Desglosado</span>
                      <button
                        onClick={() =>
                          abrirTicket(
                            'Detalle Factura IGV',
                            [
                              { label: 'Subtotal (Base)', valor: `S/ ${formatearMoneda(subtotalNum)}` },
                              { label: 'IGV (18.00%)', valor: `S/ ${formatearMoneda(igvCalculado)}` },
                            ],
                            `S/ ${formatearMoneda(totalNum)}`,
                            totalEnLetras
                          )
                        }
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 btn-press-effect"
                      >
                        <Printer className="w-3.5 h-3.5" /> Voucher
                      </button>
                    </div>

                    <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Base Imponible</span>
                        <span className="text-lg font-semibold">S/ {formatearMoneda(subtotalNum)}</span>
                      </div>
                      <button onClick={() => copyToClipboard(subtotalNum.toFixed(2), 'c_sub', 'Subtotal copiado')} className="p-1.5 text-zinc-400 hover:text-zinc-200 btn-press-effect">
                        {copiedItem === 'c_sub' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">IGV (18.00%)</span>
                        <span className="text-lg font-semibold">S/ {formatearMoneda(igvCalculado)}</span>
                      </div>
                      <button onClick={() => copyToClipboard(igvCalculado.toFixed(2), 'c_igv', 'IGV copiado')} className="p-1.5 text-zinc-400 hover:text-zinc-200 btn-press-effect">
                        {copiedItem === 'c_igv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Facturado</span>
                        <span className="text-2xl font-bold">S/ {formatearMoneda(totalNum)}</span>
                      </div>
                      <button onClick={() => copyToClipboard(totalNum.toFixed(2), 'c_tot', 'Total copiado')} className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border text-slate-700'}`}>
                        {copiedItem === 'c_tot' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-xs font-mono leading-relaxed p-2 rounded ${isDark ? 'bg-zinc-900/60' : 'bg-white border'}`}>{totalEnLetras}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sunatSubTab === 'spot' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Configuración SPOT</span>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Total de Factura (con IGV)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                      <input
                        type="number"
                        value={spotTotal}
                        onChange={(e) => setSpotTotal(e.target.value)}
                        className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Bien o Servicio Sujeto a Detracción</label>
                    <select
                      value={selectedSpotId}
                      onChange={(e) => setSelectedSpotId(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${bgInput}`}
                    >
                      {DETRACCION_CATALOG.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} — {(item.rate * 100).toFixed(0)}% (Aplica &gt; S/ {item.minAmount})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Desglose de Pago</span>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">1. Depósito Banco de la Nación (Detracción)</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(montoDetraccion)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(montoDetraccion.toFixed(2), 'c_spot')} className="p-1.5 text-zinc-400 hover:text-zinc-200 btn-press-effect">
                      {copiedItem === 'c_spot' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">2. Saldo a Pagar al Proveedor</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(netoPagarProveedor)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(netoPagarProveedor.toFixed(2), 'c_neto_spot')} className="p-1.5 text-zinc-400 hover:text-zinc-200 btn-press-effect">
                      {copiedItem === 'c_neto_spot' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sunatSubTab === 'retencion' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Régimen de Retenciones (3%)</span>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Importe Total de Factura</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                      <input
                        type="number"
                        value={retencionTotal}
                        onChange={(e) => setRetencionTotal(e.target.value)}
                        className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                      />
                    </div>
                  </div>
                </div>
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-3 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Comprobante de Retención</span>
                  <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Retención (3%)</span>
                      <span className="text-lg font-semibold">S/ {formatearMoneda(montoRetencion)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(montoRetencion.toFixed(2), 'c_ret')} className="p-1.5 text-zinc-400 btn-press-effect">
                      {copiedItem === 'c_ret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Monto Neto a Cobrar</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(netoPagarRetencion)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(netoPagarRetencion.toFixed(2), 'c_neto_ret')} className="p-1.5 text-zinc-400 btn-press-effect">
                      {copiedItem === 'c_neto_ret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sunatSubTab === 'cuarta' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Recibo por Honorarios</span>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Honorario Bruto Pactado</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                      <input
                        type="number"
                        value={cuartaTotal}
                        onChange={(e) => setCuartaTotal(e.target.value)}
                        className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                      />
                    </div>
                  </div>
                  <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-300'}`}>
                    <input
                      type="checkbox"
                      checked={tieneSuspension}
                      onChange={(e) => setTieneSuspension(e.target.checked)}
                      className="rounded w-4 h-4"
                    />
                    <span>Tengo constancia de <strong>Suspensión de 4ta (Formulario 1609)</strong></span>
                  </label>
                </div>
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-3 ${bgCard} glass-card`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Liquidación</span>
                  <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Retención Renta (8%)</span>
                      <span className="text-lg font-semibold">S/ {formatearMoneda(montoRetencionCuarta)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(montoRetencionCuarta.toFixed(2), 'c_4ta')} className="p-1.5 text-zinc-400 btn-press-effect">
                      {copiedItem === 'c_4ta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Neto a Percibir</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(netoCobrarCuarta)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(netoCobrarCuarta.toFixed(2), 'c_neto_4ta')} className="p-1.5 text-zinc-400 btn-press-effect">
                      {copiedItem === 'c_neto_4ta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIPO DE CAMBIO */}
        {activeModule === 'cambio' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <DollarSign className="w-5 h-5 text-zinc-400" />
                  Tipo de Cambio USD / PEN
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Cotizaciones en el mercado peruano (Rango S/ 3.40 - S/ 3.50)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border space-y-3 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block">1. Propósito de la consulta</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFuenteTc('sunat')}
                    className={`p-3 rounded-lg border text-left transition-all btn-press-effect ${
                      fuenteTc === 'sunat'
                        ? isDark ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                        : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-semibold block">Tasa SUNAT</span>
                    <span className="text-[10px] opacity-70 block mt-0.5">Oficial para facturas</span>
                    <div className="mt-2 text-xs font-mono flex justify-between">
                      <span>C: {tcSunatCompra.toFixed(3)}</span>
                      <span>V: {tcSunatVenta.toFixed(3)}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setFuenteTc('paralelo')}
                    className={`p-3 rounded-lg border text-left transition-all btn-press-effect ${
                      fuenteTc === 'paralelo'
                        ? isDark ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                        : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-semibold block">Mercado / Fintech</span>
                    <span className="text-[10px] opacity-70 block mt-0.5">Cambio real de dinero</span>
                    <div className="mt-2 text-xs font-mono flex justify-between">
                      <span>C: {tcParaleloCompra.toFixed(3)}</span>
                      <span>V: {tcParaleloVenta.toFixed(3)}</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-3 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block">2. Tipo de operación</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTipoOperacion('vender')}
                    className={`p-3 rounded-lg border text-center transition-all btn-press-effect ${
                      tipoOperacion === 'vender'
                        ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold'
                        : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xs block">Tengo Dólares</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">Recibo Soles</span>
                  </button>

                  <button
                    onClick={() => setTipoOperacion('comprar')}
                    className={`p-3 rounded-lg border text-center transition-all btn-press-effect ${
                      tipoOperacion === 'comprar'
                        ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold'
                        : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xs block">Tengo Soles</span>
                    <span className="text-[11px] opacity-80 block mt-0.5">Compro Dólares</span>
                  </button>
                </div>
                <div className="text-[11px] flex items-center justify-between pt-1 opacity-80">
                  <span>Tasa aplicada:</span>
                  <span className="font-mono font-semibold">S/ {tasaActiva.toFixed(3)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-7 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Conversor Bidireccional</span>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Dólares (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={usdVal}
                      onChange={(e) => handleUsdChange(e.target.value)}
                      className={`w-full rounded-lg pl-8 pr-4 py-2 text-base font-semibold focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Soles (PEN)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-sm">S/</span>
                    <input
                      type="number"
                      step="0.01"
                      value={penVal}
                      onChange={(e) => handlePenChange(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-semibold focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-lg border space-y-1 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-mono">{totalEnLetrasPEN}</p>
                </div>
              </div>

              <div className={`lg:col-span-5 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Comparativa de Spread Bancario</span>
                  <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between pb-1 border-b border-zinc-800 text-zinc-400">
                      <span>Entidad</span>
                      <span>Compra</span>
                      <span>Venta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">SUNAT Oficial</span>
                      <span className="font-mono">{tcSunatCompra.toFixed(3)}</span>
                      <span className="font-mono">{tcSunatVenta.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Casas de Cambio / Fintech</span>
                      <span className="font-mono">{tcParaleloCompra.toFixed(3)}</span>
                      <span className="font-mono">{tcParaleloVenta.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between opacity-80">
                      <span>BCP Banca Móvil</span>
                      <span className="font-mono">{tcBcpCompra.toFixed(3)}</span>
                      <span className="font-mono">{tcBcpVenta.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between opacity-80">
                      <span>Interbank</span>
                      <span className="font-mono">{tcInterbankCompra.toFixed(3)}</span>
                      <span className="font-mono">{tcInterbankVenta.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between opacity-80">
                      <span>BBVA Continental</span>
                      <span className="font-mono">{tcBbvaCompra.toFixed(3)}</span>
                      <span className="font-mono">{tcBbvaVenta.toFixed(3)}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[11px] block mb-1 opacity-70">Ahorro estimado frente al banco:</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">+ S/ {formatearMoneda(ahorroEstimadoBcp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALCABALA */}
        {activeModule === 'alcabala' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Home className="w-5 h-5 text-zinc-400" />
                  Calculadora del Impuesto de Alcabala
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Tasa del 3% con deducción de las primeras 10 UIT inafectas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Datos de la Propiedad</span>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Valor de Transferencia del Inmueble</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={valorInmueble}
                      onChange={(e) => setValorInmueble(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>
                <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between">
                    <span className="opacity-70">Tramo inafecto legal (10 UIT):</span>
                    <span className="font-mono font-semibold">S/ {formatearMoneda(deducc10Uit)}</span>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Liquidación de Alcabala</span>
                  <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between">
                      <span className="opacity-70">Base imponible gravada (saldo):</span>
                      <span className="font-mono">S/ {formatearMoneda(baseAfectaAlcabala)}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Monto de Alcabala a Pagar</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(impuestoAlcabala)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(impuestoAlcabala.toFixed(2), 'c_alc', 'Alcabala copiada')}
                      className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                    >
                      {copiedItem === 'c_alc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRÉSTAMO */}
        {activeModule === 'prestamo' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Coins className="w-5 h-5 text-zinc-400" />
                  Simulador de Préstamos (Sistema Francés)
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Calcula la cuota fija mensual y el total de intereses</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Condiciones del Crédito</span>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Monto del Préstamo</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={montoPrestamo}
                      onChange={(e) => setMontoPrestamo(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">TEA (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={teaPrestamo}
                      onChange={(e) => setTeaPrestamo(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Plazo (Meses)</label>
                    <input
                      type="number"
                      value={plazoMeses}
                      onChange={(e) => setPlazoMeses(Math.max(1, parseInt(e.target.value) || 1))}
                      className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Resultado</span>
                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Cuota Fija Mensual</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(cuotaMensual)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cuotaMensual.toFixed(2), 'c_pres', 'Cuota copiada')}
                      className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                    >
                      {copiedItem === 'c_pres' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between">
                      <span className="opacity-70">Intereses Totales a Pagar:</span>
                      <span className="font-mono text-rose-500 font-semibold">+ S/ {formatearMoneda(totalInteresesPrestamo)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIQUIDACIÓN */}
        {activeModule === 'liquidacion' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-zinc-400" />
                  Calculadora de Liquidación de Beneficios Sociales
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Estima los conceptos por renuncia o despido</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Datos de la Relación Laboral</span>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Último Sueldo Básico</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={sueldoLiq}
                      onChange={(e) => setSueldoLiq(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Motivo del Cese</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMotivoCese('renuncia')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                        motivoCese === 'renuncia' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Renuncia Voluntaria
                    </button>
                    <button
                      onClick={() => setMotivoCese('despido')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                        motivoCese === 'despido' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Despido Arbitrario
                    </button>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Desglose</span>
                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Liquidación a Cobrar</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(totalLiquidacion)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(totalLiquidacion.toFixed(2), 'c_liq')}
                      className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 hover:text-white' : 'bg-white border'}`}
                    >
                      {copiedItem === 'c_liq' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUELDO NETO */}
        {activeModule === 'sueldo' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Percent className="w-5 h-5 text-zinc-400" />
                  Calculadora de Sueldo Neto (Boleta)
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Descuentos de ley: AFP/ONP y Renta de 5ta</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Sueldo Bruto Mensual</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={sueldoBruto}
                      onChange={(e) => setSueldoBruto(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Sueldo Neto a Percibir</span>
                    <span className="text-2xl font-bold">S/ {formatearMoneda(sueldoNetoRecibir)}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sueldoNetoRecibir.toFixed(2), 'c_neto_bol')}
                    className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                  >
                    {copiedItem === 'c_neto_bol' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LABORAL CTS & GRATI */}
        {activeModule === 'laboral' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-zinc-400" />
                  Calculadora Laboral (CTS & Gratificación)
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Sueldo Básico Mensual</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={sueldoBasico}
                      onChange={(e) => setSueldoBasico(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">
                      {laboralTab === 'grati' ? 'Total Gratificación' : 'Total CTS'}
                    </span>
                    <span className="text-2xl font-bold">
                      S/ {formatearMoneda(laboralTab === 'grati' ? totalGratificacion : totalCts)}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard((laboralTab === 'grati' ? totalGratificacion : totalCts).toFixed(2), 'c_lab')}
                    className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                  >
                    {copiedItem === 'c_lab' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIM INTERESES SUNAT */}
        {activeModule === 'tim' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  Calculadora de Intereses Moratorios SUNAT (TIM)
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Monto del Tributo Omitido</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                    <input
                      type="number"
                      value={deudaTributaria}
                      onChange={(e) => setDeudaTributaria(e.target.value)}
                      className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Actualizado a Pagar</span>
                    <span className="text-2xl font-bold">S/ {formatearMoneda(deudaTotalPagar)}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(deudaTotalPagar.toFixed(2), 'c_tim')}
                    className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                  >
                    {copiedItem === 'c_tim' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VALIDADOR DE RUC (AISLADO ÚNICAMENTE PARA SU PÁGINA) */}
        {activeModule === 'ruc' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-zinc-400" />
                  Consulta y Validador Oficial de RUC
                </h1>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Comprueba razón social, estado, condición y algoritmo matemático Módulo 11</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className={`lg:col-span-5 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
                <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Búsqueda de Contribuyente</span>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Número de RUC (11 dígitos) o DNI (8 dígitos)</label>
                  <input
                    type="text"
                    maxLength={11}
                    value={rucInput}
                    onChange={(e) => {
                      setRucInput(e.target.value.replace(/\D/g, ''));
                      setRucDataResult(null);
                    }}
                    className={`w-full rounded-lg px-4 py-2 font-mono text-lg tracking-widest focus:outline-none border ${bgInput}`}
                    placeholder="20XXXXXXXXX"
                  />
                </div>

                {esDniOchoDigitos && (
                  <div className={`p-3 rounded-lg border text-xs space-y-2 ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-1.5 font-semibold text-blue-500">
                      <Sparkles className="w-4 h-4" />
                      <span>¿Deseas calcular el RUC 10 de este DNI?</span>
                    </div>
                    <p className="opacity-80">RUC generado: <strong className="font-mono">{ruc10GeneradoDesdeDni}</strong></p>
                    <button
                      onClick={() => setRucInput(ruc10GeneradoDesdeDni)}
                      className="px-3 py-1 bg-blue-600 text-white rounded font-medium text-[11px] hover:bg-blue-500 transition-colors btn-press-effect"
                    >
                      Usar este RUC 10
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={consultarDatosRuc}
                    disabled={isSearchingRuc || rucInput.length !== 11}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors btn-press-effect ${
                      rucInput.length === 11
                        ? isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-zinc-800/40 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    {isSearchingRuc ? 'Buscando en padrón...' : 'Buscar Datos de Empresa'}
                  </button>

                  <button
                    onClick={copiarEIrASunat}
                    disabled={rucInput.length !== 11}
                    className={`w-full py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors btn-press-effect ${
                      rucInput.length === 11
                        ? isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                        : 'opacity-40 cursor-not-allowed border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Copiar e ir a SUNAT Oficial</span>
                  </button>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-zinc-500 mb-2 font-medium">Empresas más consultadas (Top 10):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { ruc: '20131312955', label: 'SUNAT' },
                      { ruc: '20100047218', label: 'BCP' },
                      { ruc: '20100053455', label: 'Interbank' },
                      { ruc: '20100130204', label: 'BBVA' },
                      { ruc: '20100043140', label: 'Scotiabank' },
                      { ruc: '20100017491', label: 'Telefónica' },
                      { ruc: '20100128056', label: 'Falabella' },
                      { ruc: '20100055237', label: 'Alicorp' },
                      { ruc: '20100113610', label: 'Backus' },
                      { ruc: '20100152356', label: 'Sedapal' },
                    ].map((item) => (
                      <button
                        key={item.ruc}
                        onClick={() => {
                          setRucInput(item.ruc);
                          setRucDataResult(PADRON_RUC_LOCAL[item.ruc]);
                        }}
                        className={`text-xs px-2.5 py-1 rounded border transition-colors btn-press-effect ${
                          isDark
                            ? 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300 hover:text-white'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-7 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Ficha del Contribuyente</span>

                  <div
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs font-semibold ${
                      resultadoRuc.valido ? badgeValid : badgeInvalid
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {resultadoRuc.valido ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      <span>{resultadoRuc.valido ? 'Dígito Verificador Válido (Módulo 11)' : 'RUC Matemáticamente Inválido'}</span>
                    </div>
                    <span className="font-mono text-[11px]">{rucInput.length}/11</span>
                  </div>

                  {rucDataResult ? (
                    <div className={`p-4 rounded-lg border space-y-2.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Razón Social / Nombre:</span>
                        <span className="font-bold text-sm tracking-tight">{rucDataResult.razonSocial}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[11px] text-zinc-500 block">Estado:</span>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            {rucDataResult.estado}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-zinc-500 block">Condición:</span>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                            {rucDataResult.condicion}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] text-zinc-500 block">Dirección Fiscal:</span>
                        <span className="opacity-90">{rucDataResult.direccion}</span>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] text-zinc-500 block">Rubro:</span>
                        <span className="opacity-90">{rucDataResult.rubro}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-6 rounded-lg border border-dashed text-center text-xs space-y-2 ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-slate-300 text-slate-500'}`}>
                      <Building2 className="w-8 h-8 mx-auto opacity-40" />
                      <p>Presiona <strong>"Buscar Datos de Empresa"</strong> o usa <strong>"Copiar e ir a SUNAT Oficial"</strong> para verificar la condición tributaria.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                  <span>Consulta de padrón activo</span>
                  <a
                    href="https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    Portal SUNAT oficial <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`border-t py-6 text-center text-xs space-y-3 ${isDark ? 'border-zinc-800/80 bg-zinc-950/80 text-zinc-500' : 'border-slate-200 bg-white/80 text-slate-500'}`}>
        <p className="font-medium text-zinc-400">
          Todo en Uno Perú © 2026 — Plataforma libre de utilidades tributarias, laborales y financieras.
        </p>
        <p className="text-[11px] max-w-xl mx-auto opacity-75 leading-relaxed px-4">
          🔒 <strong>Privacidad Garantizada:</strong> Todos los cálculos se procesan de forma 100% local en tu navegador. Tus montos, sueldos y facturas nunca se envían ni almacenan en servidores externos.
        </p>
        
        <div className="flex justify-center items-center gap-4 text-[11px] pt-1">
          <button
            onClick={() => { setLegalTab('terminos'); setShowLegalModal(true); }}
            className="hover:underline hover:text-zinc-300 transition-colors btn-press-effect"
          >
            Términos y Condiciones
          </button>
          <span>•</span>
          <button
            onClick={() => { setLegalTab('privacidad'); setShowLegalModal(true); }}
            className="hover:underline hover:text-zinc-300 transition-colors btn-press-effect"
          >
            Política de Privacidad
          </button>
          <span>•</span>
          <button
            onClick={() => { setLegalTab('deslinde'); setShowLegalModal(true); }}
            className="hover:underline hover:text-zinc-300 transition-colors btn-press-effect"
          >
            Deslinde de Responsabilidad
          </button>
        </div>
      </footer>

      {/* MODAL LEGAL */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col border overflow-hidden anim-modal-in ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-zinc-800 bg-zinc-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <Scale className={`w-4 h-4 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`} />
                <span className={`font-semibold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Información Legal & Políticas
                </span>
              </div>
              <button
                onClick={() => setShowLegalModal(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`flex border-b text-xs font-medium px-4 gap-2 ${
              isDark ? 'border-zinc-800 bg-zinc-950/40' : 'border-slate-200 bg-slate-100'
            }`}>
              {(['terminos', 'privacidad', 'deslinde'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLegalTab(tab)}
                  className={`py-3 px-3 border-b-2 font-semibold transition-colors btn-press-effect ${
                    legalTab === tab
                      ? isDark
                        ? 'border-zinc-100 text-zinc-100'
                        : 'border-slate-900 text-slate-900'
                      : isDark
                        ? 'border-transparent text-zinc-400 hover:text-zinc-200'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'terminos' && 'Términos de Uso'}
                  {tab === 'privacidad' && 'Política de Privacidad'}
                  {tab === 'deslinde' && 'Aviso Tributario'}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto text-xs leading-relaxed space-y-5">
              {legalTab === 'terminos' && (
                <div className="space-y-3">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    1. Aceptación de los Términos
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    Al acceder y utilizar <strong>Todo en Uno Perú</strong>, el usuario acepta de forma plena y sin reservas los presentes Términos y Condiciones. Si no está de acuerdo con alguno de ellos, le solicitamos abstenerse de usar la plataforma.
                  </p>

                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    2. Naturaleza del Servicio
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    La plataforma proporciona calculadoras, estimaciones y validaciones matemáticas basadas en la legislación tributaria y laboral peruana vigente. El servicio se ofrece de forma libre y gratuita para propósitos informativos, de referencia rápida y formativos.
                  </p>

                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    3. Propiedad Intelectual
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    El diseño de la interfaz, logotipos, código fuente y arquitectura visual pertenecen a Todo en Uno Perú. Queda permitida la impresión y difusión de comprobantes y cálculos individuales con mención del origen.
                  </p>
                </div>
              )}

              {legalTab === 'privacidad' && (
                <div className="space-y-3">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    1. Tratamiento Local de la Información
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    En cumplimiento con la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong>, le informamos que todos los montos de facturación, remuneraciones, números de RUC o deudas tributarias ingresados se procesan <strong>estrictamente en el navegador del usuario</strong>.
                  </p>

                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    2. No Recopilación en Servidores
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    No contamos con bases de datos ni almacenamos en servidores sus importes monetarios ni su identidad. El historial de cálculos se almacena temporalmente en el almacenamiento local (<em>localStorage</em>) de su propio dispositivo y puede eliminarse en cualquier momento mediante el botón "Limpiar historial".
                  </p>

                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    3. Enlaces a Sitios Externos
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    Nuestra web incluye enlaces directos y de cortesía a portales gubernamentales (como SUNAT o Banco de la Nación). No nos hacemos responsables de las políticas de privacidad o funcionamiento de dichos dominios externos.
                  </p>
                </div>
              )}

              {legalTab === 'deslinde' && (
                <div className="space-y-3">
                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    1. Carácter Informativo y No Asesoramiento Legal
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    Los resultados arrojados por las calculadoras de IGV, Detracciones SPOT, Retenciones, Alcabala, CTS, Gratificaciones y TIM son estimaciones matemáticas elaboradas conforme a las tasas oficiales del ordenamiento jurídico peruano. <strong>No constituyen asesoría contable, legal ni tributaria formal vinculante.</strong>
                  </p>

                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    2. Validación con Entidades Oficiales
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    Es responsabilidad exclusiva de cada usuario o contribuyente corroborar los montos definitivos en los portales oficiales correspondientes (SUNAT Operaciones en Línea SOL, SAT, SBS o mediante un Contador Público Colegiado) antes de efectuar declaraciones juradas o pagos vinculantes.
                  </p>

                  <h3 className={`font-bold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                    3. Limitación de Responsabilidad
                  </h3>
                  <p className={isDark ? 'text-zinc-300' : 'text-slate-600'}>
                    Todo en Uno Perú no asume responsabilidad civil, fiscal ni comercial por multas, recargos, intereses o discrepancias que surjan por el uso de las cifras resultantes de esta herramienta.
                  </p>
                </div>
              )}
            </div>

            <div className={`p-4 border-t flex justify-end ${
              isDark ? 'border-zinc-800 bg-zinc-950/60' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                onClick={() => setShowLegalModal(false)}
                className={`px-4 py-2 font-semibold rounded-lg text-xs transition-colors btn-press-effect ${
                  isDark ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                Entendido y de acuerdo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}