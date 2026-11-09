export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto || 0);
}

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