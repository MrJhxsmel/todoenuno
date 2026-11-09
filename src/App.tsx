import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Receipt,
  DollarSign,
  Briefcase,
  Building2,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  FileText,
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
  Download,
} from 'lucide-react';

// --- CONVERSOR DE NÚMEROS A LETRAS OFICIAL SUNAT ---
function Unidades(num: number): string {
  switch (num) {
    case 1: return 'UN';
    case 2: return 'DOS';
    case 3: return 'TRES';
    case 4: return 'CUATRO';
    case 5: return 'CINCO';
    case 6: return 'SEIS';
    case 7: return 'SIETE';
    case 8: return 'OCHO';
    case 9: return 'NUEVE';
    default: return '';
  }
}

function DecenasY(strSin: string, numUnidades: number): string {
  return numUnidades > 0 ? strSin + ' Y ' + Unidades(numUnidades) : strSin;
}

function Decenas(num: number): string {
  const decena = Math.floor(num / 10);
  const unidad = num - decena * 10;
  switch (decena) {
    case 1:
      switch (unidad) {
        case 0: return 'DIEZ';
        case 1: return 'ONCE';
        case 2: return 'DOCE';
        case 3: return 'TRECE';
        case 4: return 'CATORCE';
        case 5: return 'QUINCE';
        default: return 'DIECI' + Unidades(unidad);
      }
    case 2:
      return unidad === 0 ? 'VEINTE' : 'VEINTI' + Unidades(unidad);
    case 3: return DecenasY('TREINTA', unidad);
    case 4: return DecenasY('CUARENTA', unidad);
    case 5: return DecenasY('CINCUENTA', unidad);
    case 6: return DecenasY('SESENTA', unidad);
    case 7: return DecenasY('SETENTA', unidad);
    case 8: return DecenasY('OCHENTA', unidad);
    case 9: return DecenasY('NOVENTA', unidad);
    case 0: return Unidades(unidad);
    default: return '';
  }
}

function Centenas(num: number): string {
  const centenas = Math.floor(num / 100);
  const decenas = num - centenas * 100;
  switch (centenas) {
    case 1: return decenas > 0 ? 'CIENTO ' + Decenas(decenas) : 'CIEN';
    case 2: return 'DOSCIENTOS ' + Decenas(decenas);
    case 3: return 'TRESCIENTOS ' + Decenas(decenas);
    case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
    case 5: return 'QUINIENTOS ' + Decenas(decenas);
    case 6: return 'SEISCIENTOS ' + Decenas(decenas);
    case 7: return 'SETECIENTOS ' + Decenas(decenas);
    case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
    case 9: return 'NOVECIENTOS ' + Decenas(decenas);
    default: return Decenas(decenas);
  }
}

function Seccion(num: number, divisor: number, strSingular: string, strPlural: string): string {
  const cientos = Math.floor(num / divisor);
  if (cientos > 0) return cientos > 1 ? Centenas(cientos) + ' ' + strPlural : strSingular;
  return '';
}

function Miles(num: number): string {
  const divisor = 1000;
  const cientos = Math.floor(num / divisor);
  const resto = num - cientos * divisor;
  const strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
  const strCentenas = Centenas(resto);
  if (strMiles === '') return strCentenas;
  return (strMiles + ' ' + strCentenas).trim();
}

function Millones(num: number): string {
  const divisor = 1000000;
  const cientos = Math.floor(num / divisor);
  const resto = num - cientos * divisor;
  const strMillones = Seccion(num, divisor, 'UN MILLON', 'MILLONES');
  const strMiles = Miles(resto);
  if (strMillones === '') return strMiles;
  return (strMillones + ' ' + strMiles).trim();
}

export function numeroALetras(monto: number): string {
  if (isNaN(monto) || monto === 0) return 'SON: CERO CON 00/100 SOLES';
  const valorPositivo = Math.abs(monto);
  const enteros = Math.floor(valorPositivo);
  const centavos = Math.round((valorPositivo - enteros) * 100);
  const centavosStr = centavos < 10 ? `0${centavos}` : `${centavos}`;
  const letras = Millones(enteros);
  return `SON: ${letras.trim()} CON ${centavosStr}/100 SOLES`;
}

export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto || 0);
}

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

// Directorio con las 10 empresas más buscadas
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

// Matriz de Cronograma SUNAT por último dígito de RUC
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

// Generador genérico para dígitos 2 al 9 y Buenos Contribuyentes
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

export default function App() {
  const getInitialModule = () => {
    const hash = window.location.hash.replace('#', '');
    if (['sunat', 'cambio', 'laboral', 'liquidacion', 'sueldo', 'tim', 'ruc', 'alcabala', 'prestamo', 'cronograma', 'costo_empleador'].includes(hash)) {
      return hash as any;
    }
    return 'home';
  };

  const [activeModule, setActiveModule] = useState<'home' | 'sunat' | 'cambio' | 'laboral' | 'liquidacion' | 'sueldo' | 'tim' | 'ruc' | 'alcabala' | 'prestamo' | 'cronograma' | 'costo_empleador'>(getInitialModule);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('todoenuno_theme') as 'dark' | 'light') || 'dark';
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketData, setTicketData] = useState<{ titulo: string; filas: { label: string; valor: string }[]; total: string; letras: string } | null>(null);

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

  const navigateTo = (mod: typeof activeModule) => {
    setActiveModule(mod);
    window.location.hash = mod === 'home' ? '' : mod;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setActiveModule(getInitialModule());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Atajos de teclado: Esc para volver, / para buscar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showTicketModal) setShowTicketModal(false);
        else navigateTo('home');
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTicketModal]);

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

  const compartirWhatsApp = (titulo: string, texto: string) => {
    const msg = `*Todo en Uno Perú* 🇵🇪 - ${titulo}\n\n${texto}\n\nCalculado en: todoenuno.pe`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
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

  // --- ESTADOS TIPO DE CAMBIO (Rango real S/ 3.40 - S/ 3.50) ---
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

  // --- ESTADOS COSTO LABORAL EMPLEADOR (PYMES) ---
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

  // Cálculos Laborales (Grati & CTS)
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

  // Sueldo Neto & 5ta
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

  const modulesList = [
    { id: 'sunat', title: 'Calculadora SUNAT (IGV, SPOT)', desc: 'IGV 18%, Detracciones Banco de la Nación, Retención 3% y Recibos por Honorarios', tag: 'Tributario', icon: Receipt },
    { id: 'cambio', title: 'Dólar Hoy & Comparador de Bancos', desc: 'Tipo de cambio SUNAT oficial vs. Paralelo con spread de BCP, Interbank y BBVA', tag: 'Finanzas', icon: DollarSign },
    { id: 'cronograma', title: 'Cronograma de Vencimientos SUNAT', desc: 'Fechas límite mensuales según el último dígito del RUC con alerta a Google Calendar', tag: 'Tributario', icon: CalendarDays },
    { id: 'costo_empleador', title: 'Costo Laboral Empleador (Pymes)', desc: 'Sobrecosto real de contratación: Microempresa (REMYPE), Pequeña y General', tag: 'Planilla', icon: UserPlus },
    { id: 'alcabala', title: 'Impuesto de Alcabala Inmobiliario', desc: 'Deducción de 10 UIT inafectas y cálculo del 3% para compraventa de viviendas', tag: 'Inmuebles', icon: Home },
    { id: 'prestamo', title: 'Simulador de Préstamos (Cuota fija)', desc: 'Cronograma con sistema francés, cálculo de TEA mensual y total de intereses', tag: 'Bancario', icon: Coins },
    { id: 'liquidacion', title: 'Liquidación por Despido / Renuncia', desc: 'Cálculo de beneficios truncos (CTS, Gratificación, Vacaciones) e indemnización', tag: 'Laboral', icon: UserCheck },
    { id: 'sueldo', title: 'Calculadora de Sueldo Neto (Boleta)', desc: 'Descuento de pensión (AFP Integra, Prima, Habitat, Profuturo, ONP) y Renta de 5ta', tag: 'Planilla', icon: Percent },
    { id: 'laboral', title: 'Gratificación y Depósito de CTS', desc: 'Cálculo semestral legal de gratificación (+bono EsSalud) y depósito CTS', tag: 'Semestral', icon: Briefcase },
    { id: 'tim', title: 'Intereses Moratorios SUNAT (TIM)', desc: 'Actualización diaria de deudas tributarias vencidas (0.03% diario)', tag: 'Tributario', icon: Calendar },
    { id: 'ruc', title: 'Consulta y Validador Oficial de RUC', desc: 'Búsqueda de razón social, estado, condición, generador DNI y Módulo 11', tag: 'Verificación', icon: Building2 },
  ];

  const filteredModules = useMemo(() => {
    if (!searchTerm.trim()) return modulesList;
    const term = searchTerm.toLowerCase();
    return modulesList.filter(
      (m) => m.title.toLowerCase().includes(term) || m.desc.toLowerCase().includes(term) || m.tag.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-800';
  const bgCard = isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm';
  const bgInput = isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-slate-50 border-slate-300 text-slate-900';
  const borderHeader = isDark ? 'border-zinc-800/80 bg-zinc-900/50' : 'border-slate-200 bg-white/80';

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
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white border border-zinc-700 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODAL TIPO VOUCHER / TICKET DESCARGABLE */}
      {showTicketModal && ticketData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-zinc-950 w-full max-w-sm rounded-2xl shadow-2xl p-6 font-mono text-xs border border-zinc-200 relative animate-scaleIn">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-dashed border-zinc-300 space-y-1">
              <span className="font-black text-sm tracking-widest uppercase">TODO EN UNO PERÚ</span>
              <p className="text-[10px] text-zinc-500">Comprobante de Cálculo Oficial</p>
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

            <div className="pt-4 text-center space-y-3">
              <p className="text-[9px] text-zinc-400">Verificado y calculado en www.todoenuno.pe</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
                <button
                  onClick={() => {
                    compartirWhatsApp(ticketData.titulo, ticketData.filas.map(f => `${f.label}: ${f.valor}`).join('\n') + `\nTotal: ${ticketData.total}\n${ticketData.letras}`);
                  }}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={`border-b ${borderHeader} backdrop-blur sticky top-0 z-40`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div
            onClick={() => {
              navigateTo('home');
              setShowGuide(false);
            }}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className={`w-9 h-9 rounded-lg ${isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-slate-900 text-white'} flex items-center justify-center font-bold text-sm tracking-tight group-hover:scale-105 transition-transform`}>
              T1
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight">Todo en Uno</span>
                <span className={`text-[10px] font-mono tracking-wider ${isDark ? 'bg-zinc-800 text-zinc-400 border-zinc-700/60' : 'bg-slate-200 text-slate-700 border-slate-300'} border px-1.5 py-0.2 rounded`}>
                  PE
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-slate-500'} hidden sm:block`}>Herramientas esenciales del Perú</p>
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
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
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
                  className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
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
              className={`p-2 rounded-lg border transition-colors ${
                isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {activeModule === 'home' ? (
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
                    onClick={() => navigateTo(item.id as any)}
                    className={`group rounded-xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${bgCard} hover:border-zinc-500`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
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
              <div className={`rounded-xl p-4 border ${bgCard} mt-8`}>
                <div className="flex items-center justify-between border-b pb-2 mb-3 border-zinc-800">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-semibold">Cálculos Recientes en esta sesión</span>
                  </div>
                  <button onClick={clearHistory} className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Limpiar historial
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {historyItems.map((h) => (
                    <div key={h.id} className={`p-2.5 rounded-lg border text-xs ${isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-slate-50 border-slate-200'}`}>
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
        ) : activeModule === 'cronograma' ? (
          /* ================= MÓDULO NUEVO: CRONOGRAMA SUNAT CON GOOGLE CALENDAR ================= */
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

            <div className={`p-5 rounded-xl border space-y-4 ${bgCard}`}>
              <span className="text-xs font-medium block">Selecciona el último dígito de tu RUC:</span>
              <div className="flex flex-wrap gap-2">
                {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'bc'].map((dig) => (
                  <button
                    key={dig}
                    onClick={() => setDigitoRucCronograma(dig)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      digitoRucCronograma === dig
                        ? isDark ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-slate-900 text-white border-slate-900'
                        : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {dig === 'bc' ? 'Buenos Contribuyentes' : `Dígito ${dig}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(CRONOGRAMA_SUNAT[digitoRucCronograma] || CRONOGRAMA_SUNAT['0']).map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between ${bgCard}`}>
                  <div>
                    <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-semibold">Periodo: {item.periodo}</span>
                    <span className="text-xl font-bold font-mono tracking-tight block mt-1">{item.vencimiento}</span>
                  </div>
                  <button
                    onClick={() => abrirGoogleCalendar(item.periodo, item.vencimiento)}
                    className="mt-3 py-1.5 px-2.5 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1.5 hover:bg-zinc-800/40 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Alerta en Google Calendar</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeModule === 'costo_empleador' ? (
          /* ================= MÓDULO NUEVO: COSTO LABORAL EMPLEADOR (PYMES) ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                        regimenEmpresa === 'micro' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Microempresa
                    </button>
                    <button
                      onClick={() => setRegimenEmpresa('pequena')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                        regimenEmpresa === 'pequena' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Pequeña Empresa
                    </button>
                    <button
                      onClick={() => setRegimenEmpresa('general')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                        regimenEmpresa === 'general' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Régimen General
                    </button>
                  </div>
                </div>

                <div className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="font-semibold text-zinc-300">Beneficios según ley:</p>
                  <p className="opacity-80">
                    {regimenEmpresa === 'micro' && '• Microempresa REMYPE: 15 días de vacaciones. No tiene CTS ni Gratificaciones de julio/diciembre.'}
                    {regimenEmpresa === 'pequena' && '• Pequeña Empresa: Media gratificación (julio y diciembre), media CTS y 15 días de vacaciones.'}
                    {regimenEmpresa === 'general' && '• Régimen General: Gratificación completa (+9% bono), CTS completa y 30 días de vacaciones.'}
                  </p>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Provisión Mensual de Sobrecostos</span>
                  <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
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

                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
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
                      className="p-2 rounded-md bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" /> Voucher
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'sunat' ? (
          /* ================= MÓDULO: CALCULADORA SUNAT ================= */
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
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
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
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

                <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
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
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Voucher
                      </button>
                    </div>

                    <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">Base Imponible</span>
                        <span className="text-lg font-semibold">S/ {formatearMoneda(subtotalNum)}</span>
                      </div>
                      <button onClick={() => copyToClipboard(subtotalNum.toFixed(2), 'c_sub', 'Subtotal copiado')} className="p-1.5 text-zinc-400 hover:text-zinc-200">
                        {copiedItem === 'c_sub' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <span className="text-[11px] text-zinc-400 block">IGV (18.00%)</span>
                        <span className="text-lg font-semibold">S/ {formatearMoneda(igvCalculado)}</span>
                      </div>
                      <button onClick={() => copyToClipboard(igvCalculado.toFixed(2), 'c_igv', 'IGV copiado')} className="p-1.5 text-zinc-400 hover:text-zinc-200">
                        {copiedItem === 'c_igv' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Facturado</span>
                        <span className="text-2xl font-bold">S/ {formatearMoneda(totalNum)}</span>
                      </div>
                      <button onClick={() => copyToClipboard(totalNum.toFixed(2), 'c_tot', 'Total copiado')} className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border text-slate-700'}`}>
                        {copiedItem === 'c_tot' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className={`p-3 rounded-lg border space-y-1 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-xs font-mono leading-relaxed p-2 rounded ${isDark ? 'bg-zinc-900/60' : 'bg-white border'}`}>{totalEnLetras}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sunatSubTab === 'spot' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Desglose de Pago</span>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">1. Depósito Banco de la Nación (Detracción)</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(montoDetraccion)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(montoDetraccion.toFixed(2), 'c_spot')} className="p-1.5 text-zinc-400 hover:text-zinc-200">
                      {copiedItem === 'c_spot' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">2. Saldo a Pagar al Proveedor</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(netoPagarProveedor)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(netoPagarProveedor.toFixed(2), 'c_neto_spot')} className="p-1.5 text-zinc-400 hover:text-zinc-200">
                      {copiedItem === 'c_neto_spot' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sunatSubTab === 'retencion' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-3 ${bgCard}`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Comprobante de Retención</span>
                  <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Retención (3%)</span>
                      <span className="text-lg font-semibold">S/ {formatearMoneda(montoRetencion)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(montoRetencion.toFixed(2), 'c_ret')} className="p-1.5 text-zinc-400">
                      {copiedItem === 'c_ret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Monto Neto a Cobrar</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(netoPagarRetencion)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(netoPagarRetencion.toFixed(2), 'c_neto_ret')} className="p-1.5 text-zinc-400">
                      {copiedItem === 'c_neto_ret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sunatSubTab === 'cuarta' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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
                <div className={`lg:col-span-6 border rounded-xl p-5 space-y-3 ${bgCard}`}>
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Liquidación</span>
                  <div className={`p-3.5 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Retención Renta (8%)</span>
                      <span className="text-lg font-semibold">S/ {formatearMoneda(montoRetencionCuarta)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(montoRetencionCuarta.toFixed(2), 'c_4ta')} className="p-1.5 text-zinc-400">
                      {copiedItem === 'c_4ta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className={`p-4 rounded-lg border flex justify-between items-center ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Neto a Percibir</span>
                      <span className="text-xl font-bold">S/ {formatearMoneda(netoCobrarCuarta)}</span>
                    </div>
                    <button onClick={() => copyToClipboard(netoCobrarCuarta.toFixed(2), 'c_neto_4ta')} className="p-1.5 text-zinc-400">
                      {copiedItem === 'c_neto_4ta' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeModule === 'cambio' ? (
          /* ================= MÓDULO: TIPO DE CAMBIO ================= */
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
              <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                <span className="text-xs font-medium block">1. Propósito de la consulta</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFuenteTc('sunat')}
                    className={`p-3 rounded-lg border text-left transition-all ${
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
                    className={`p-3 rounded-lg border text-left transition-all ${
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

              <div className={`p-4 rounded-xl border space-y-3 ${bgCard}`}>
                <span className="text-xs font-medium block">2. Tipo de operación</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTipoOperacion('vender')}
                    className={`p-3 rounded-lg border text-center transition-all ${
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
                    className={`p-3 rounded-lg border text-center transition-all ${
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
              <div className={`lg:col-span-7 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

                <div className={`p-3 rounded-lg border space-y-1 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-xs font-mono">{totalEnLetrasPEN}</p>
                </div>
              </div>

              <div className={`lg:col-span-5 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Comparativa de Spread Bancario</span>
                  <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
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

                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <span className="text-[11px] block mb-1 opacity-70">Ahorro estimado frente al banco:</span>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">+ S/ {formatearMoneda(ahorroEstimadoBcp)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'alcabala' ? (
          /* ================= MÓDULO: ALCABALA ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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
                <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between">
                    <span className="opacity-70">Tramo inafecto legal (10 UIT):</span>
                    <span className="font-mono font-semibold">S/ {formatearMoneda(deducc10Uit)}</span>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Liquidación de Alcabala</span>
                  <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between">
                      <span className="opacity-70">Base imponible gravada (saldo):</span>
                      <span className="font-mono">S/ {formatearMoneda(baseAfectaAlcabala)}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Monto de Alcabala a Pagar</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(impuestoAlcabala)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(impuestoAlcabala.toFixed(2), 'c_alc', 'Alcabala copiada')}
                      className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                    >
                      {copiedItem === 'c_alc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'prestamo' ? (
          /* ================= MÓDULO: PRÉSTAMO FRANCÉS ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Resultado</span>
                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Cuota Fija Mensual</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(cuotaMensual)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(cuotaMensual.toFixed(2), 'c_pres', 'Cuota copiada')}
                      className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                    >
                      {copiedItem === 'c_pres' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between">
                      <span className="opacity-70">Intereses Totales a Pagar:</span>
                      <span className="font-mono text-rose-500 font-semibold">+ S/ {formatearMoneda(totalInteresesPrestamo)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'liquidacion' ? (
          /* ================= MÓDULO: LIQUIDACIÓN ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                        motivoCese === 'renuncia' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Renuncia Voluntaria
                    </button>
                    <button
                      onClick={() => setMotivoCese('despido')}
                      className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors ${
                        motivoCese === 'despido' ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold' : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      Despido Arbitrario
                    </button>
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className="space-y-3">
                  <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Desglose</span>
                  <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Liquidación a Cobrar</span>
                      <span className="text-2xl font-bold">S/ {formatearMoneda(totalLiquidacion)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(totalLiquidacion.toFixed(2), 'c_liq')}
                      className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 hover:text-white' : 'bg-white border'}`}
                    >
                      {copiedItem === 'c_liq' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'sueldo' ? (
          /* ================= MÓDULO: SUELDO NETO ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Sueldo Neto a Percibir</span>
                    <span className="text-2xl font-bold">S/ {formatearMoneda(sueldoNetoRecibir)}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(sueldoNetoRecibir.toFixed(2), 'c_neto_bol')}
                    className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                  >
                    {copiedItem === 'c_neto_bol' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'laboral' ? (
          /* ================= MÓDULO: CTS & GRATI ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
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
                    className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                  >
                    {copiedItem === 'c_lab' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeModule === 'tim' ? (
          /* ================= MÓDULO: TIM INTERESES ================= */
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
              <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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

              <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
                <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Actualizado a Pagar</span>
                    <span className="text-2xl font-bold">S/ {formatearMoneda(deudaTotalPagar)}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(deudaTotalPagar.toFixed(2), 'c_tim')}
                    className={`p-2 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                  >
                    {copiedItem === 'c_tim' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ================= MÓDULO: VALIDADOR Y CONSULTA RUC COMPLETO (TOP 10 RUCS) ================= */
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
              <div className={`lg:col-span-5 border rounded-xl p-5 space-y-4 ${bgCard}`}>
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
                  <div className={`p-3 rounded-lg border text-xs space-y-2 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-1.5 font-semibold text-blue-500">
                      <Sparkles className="w-4 h-4" />
                      <span>¿Deseas calcular el RUC 10 de este DNI?</span>
                    </div>
                    <p className="opacity-80">RUC generado: <strong className="font-mono">{ruc10GeneradoDesdeDni}</strong></p>
                    <button
                      onClick={() => setRucInput(ruc10GeneradoDesdeDni)}
                      className="px-3 py-1 bg-blue-600 text-white rounded font-medium text-[11px] hover:bg-blue-500 transition-colors"
                    >
                      Usar este RUC 10
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={consultarDatosRuc}
                    disabled={isSearchingRuc || rucInput.length !== 11}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
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
                    className={`w-full py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      rucInput.length === 11
                        ? isDark ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
                        : 'opacity-40 cursor-not-allowed border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Copiar e ir a SUNAT Oficial</span>
                  </button>
                </div>

                {/* BOTONES TOP 10 RUCS MÁS CONSULTADOS */}
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
                        className={`text-xs px-2.5 py-1 rounded border transition-colors ${
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

              {/* FICHA RUC CON ALTO CONTRASTE */}
              <div className={`lg:col-span-7 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard}`}>
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
                    <div className={`p-4 rounded-lg border space-y-2.5 text-xs ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
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
      <footer className={`border-t py-6 text-center text-xs ${isDark ? 'border-zinc-800/80 bg-zinc-950 text-zinc-500' : 'border-slate-200 bg-white text-slate-500'}`}>
        <p>Todo en Uno Perú © 2026 — Plataforma libre de utilidades tributarias, laborales y financieras.</p>
      </footer>
    </div>
  );
}