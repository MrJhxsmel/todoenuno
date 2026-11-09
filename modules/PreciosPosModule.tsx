import React, { useState } from 'react';
import { DollarSign, Copy, Check } from 'lucide-react';
import { formatearMoneda } from '../src/utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  showToast: (msg: string) => void;
}

export default function PreciosPosModule({ isDark, bgCard, bgInput, showToast }: Props) {
  const [costo, setCosto] = useState<string>('50');
  const [margenDeseado, setMargenDeseado] = useState<number>(30); // 30%
  const [tasaPos, setTasaPos] = useState<number>(0.0345); // 3.45% Niubiz / Izipay promedio
  const [incluyeIgv, setIncluyeIgv] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const numCosto = parseFloat(costo) || 0;
  // Margen sobre el costo: Precio Base = Costo / (1 - Margen%)
  const precioBase = numCosto / (1 - margenDeseado / 100);
  // Comisión POS con IGV de la pasarela: tasaPos * 1.18
  const comisionRealPos = tasaPos * 1.18;
  const precioCobrarPos = precioBase / (1 - comisionRealPos);
  const precioFinalCliente = incluyeIgv ? precioCobrarPos * 1.18 : precioCobrarPos;

  const copiar = () => {
    navigator.clipboard.writeText(precioFinalCliente.toFixed(2));
    setCopied(true);
    showToast('Precio sugerido copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <DollarSign className="w-5 h-5 text-zinc-400" />
          Fijación de Precios con Comisiones POS (Niubiz / Izipay / Yape)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Calcula cuánto cobrar al cliente para no perder tu margen de ganancia al pagar las comisiones de tarjeta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Costos y Márgenes del Producto</span>
          <div>
            <label className="block text-xs font-medium mb-1.5">Costo Unitario del Producto o Servicio</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
              <input
                type="number"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Margen de Ganancia Deseado (%)</label>
            <input
              type="number"
              value={margenDeseado}
              onChange={(e) => setMargenDeseado(Math.min(95, Math.max(1, parseInt(e.target.value) || 0)))}
              className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Pasarela o POS</label>
            <select
              value={tasaPos}
              onChange={(e) => setTasaPos(parseFloat(e.target.value))}
              className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${bgInput}`}
            >
              <option value={0.0345}>Niubiz / Izipay POS (3.45% + IGV)</option>
              <option value={0.0399}>Culqi / Openpay Online (3.99% + IGV)</option>
              <option value={0.0295}>Mercado Pago QR (2.95% + IGV)</option>
              <option value={0.00}>Yape / Plin a cuenta de ahorros (0%)</option>
            </select>
          </div>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Precio Sugerido al Público</span>
            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Precio Final a Cobrar</span>
                <span className="text-2xl font-bold">S/ {formatearMoneda(precioFinalCliente)}</span>
              </div>
              <button
                onClick={copiar}
                className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className="opacity-70">Comisión estimada descontada por el POS:</span>
                <span className="font-mono text-rose-500 font-semibold">- S/ {formatearMoneda(precioCobrarPos * comisionRealPos)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Ganancia neta líquida en tu cuenta:</span>
                <span className="font-mono text-emerald-500 font-bold">S/ {formatearMoneda(precioBase - numCosto)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}