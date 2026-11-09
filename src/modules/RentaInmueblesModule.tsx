import React, { useState } from 'react';
import { Home, Copy, Check, Printer } from 'lucide-react';
import { formatearMoneda, numeroALetras } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  abrirTicket: (titulo: string, filas: { label: string; valor: string }[], total: string, letras: string) => void;
  showToast: (msg: string) => void;
}

export default function RentaInmueblesModule({ isDark, bgCard, bgInput, abrirTicket, showToast }: Props) {
  const [categoria, setCategoria] = useState<'primera' | 'segunda'>('primera');
  const [montoAlquiler, setMontoAlquiler] = useState<string>('2000');
  const [precioCompra, setPrecioCompra] = useState<string>('200000');
  const [precioVenta, setPrecioVenta] = useState<string>('280000');
  const [copied, setCopied] = useState(false);

  // 1ra Categoría: 5% del alquiler (Tasa efectiva mensual)
  const numAlquiler = parseFloat(montoAlquiler) || 0;
  const impuesto1ra = numAlquiler * 0.05;

  // 2da Categoría: 5% sobre la ganancia de capital (Venta - Compra actualizada)
  const pCompra = parseFloat(precioCompra) || 0;
  const pVenta = parseFloat(precioVenta) || 0;
  const gananciaCapital = Math.max(0, pVenta - pCompra);
  const impuesto2da = gananciaCapital * 0.05;

  const impuestoFinal = categoria === 'primera' ? impuesto1ra : impuesto2da;

  const copiar = () => {
    navigator.clipboard.writeText(impuestoFinal.toFixed(2));
    setCopied(true);
    showToast('Impuesto copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <Home className="w-5 h-5 text-zinc-400" />
          Renta de 1ra y 2da Categoría (Alquileres & Inmuebles)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Cálculo del 5% oficial para alquiler de predios (Formulario 1683) o ganancia de capital en venta de propiedades.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Tipo de Renta SUNAT</span>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCategoria('primera')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors btn-press-effect ${
                categoria === 'primera'
                  ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold border-white' : 'bg-slate-900 text-white font-bold'
                  : isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
              }`}
            >
              <span className="block font-semibold">1ra Categoría</span>
              <span className="text-[10px] opacity-75">Alquileres de casas/locales</span>
            </button>
            <button
              onClick={() => setCategoria('segunda')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors btn-press-effect ${
                categoria === 'segunda'
                  ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold border-white' : 'bg-slate-900 text-white font-bold'
                  : isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
              }`}
            >
              <span className="block font-semibold">2da Categoría</span>
              <span className="text-[10px] opacity-75">Ganancia en venta de inmueble</span>
            </button>
          </div>

          {categoria === 'primera' ? (
            <div>
              <label className="block text-xs font-medium mb-1.5">Monto Mensual del Alquiler Pactado</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                <input
                  type="number"
                  value={montoAlquiler}
                  onChange={(e) => setMontoAlquiler(e.target.value)}
                  className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5">Costo de Adquisición / Compra Original</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                  <input
                    type="number"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Precio de Venta del Inmueble</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
                  <input
                    type="number"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Liquidación Tributaria</span>
            <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className="opacity-70">
                  {categoria === 'primera' ? 'Base mensual de alquiler:' : 'Ganancia neta de capital:'}
                </span>
                <span className="font-mono">
                  S/ {formatearMoneda(categoria === 'primera' ? numAlquiler : gananciaCapital)}
                </span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Tasa efectiva SUNAT:</span>
                <span className="font-mono font-bold">5.00%</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Impuesto a Pagar a SUNAT</span>
                <span className="text-2xl font-bold">S/ {formatearMoneda(impuestoFinal)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copiar}
                  className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() =>
                    abrirTicket(
                      categoria === 'primera' ? 'Renta 1ra Cat. Alquiler' : 'Renta 2da Cat. Ganancia Capital',
                      [
                        { label: categoria === 'primera' ? 'Alquiler' : 'Ganancia', valor: `S/ ${formatearMoneda(categoria === 'primera' ? numAlquiler : gananciaCapital)}` },
                        { label: 'Tasa SUNAT', valor: '5.00%' },
                      ],
                      `S/ ${formatearMoneda(impuestoFinal)}`,
                      numeroALetras(impuestoFinal)
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
    </div>
  );
}