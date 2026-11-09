import React, { useState } from 'react';
import { Utensils, Copy, Check, Printer } from 'lucide-react';
import { formatearMoneda, numeroALetras } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  abrirTicket: (titulo: string, filas: { label: string; valor: string }[], total: string, letras: string) => void;
  showToast: (msg: string) => void;
}

export default function RecargoConsumoModule({ isDark, bgCard, bgInput, abrirTicket, showToast }: Props) {
  const [consumoNeto, setConsumoNeto] = useState<string>('180');
  const [tasaIgv, setTasaIgv] = useState<number>(0.18); // 18% estándar o 10% mypes gastronómicas
  const [copied, setCopied] = useState(false);

  const cNeto = parseFloat(consumoNeto) || 0;
  // Recargo al consumo legal (5ta Disposición Final D. Ley 25988): hasta 10%
  const recargo = cNeto * 0.10;
  // El IGV se calcula sobre el consumo neto
  const igv = cNeto * tasaIgv;
  const totalCuenta = cNeto + recargo + igv;

  const copiar = () => {
    navigator.clipboard.writeText(totalCuenta.toFixed(2));
    setCopied(true);
    showToast('Total de cuenta copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <Utensils className="w-5 h-5 text-zinc-400" />
          Recargo al Consumo & Servicio en Restaurantes (10%)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Cálculo del 10% de recargo al consumo destinado a mozos y personal de servicio hotelero/gastronómico + IGV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Detalle de la Comanda</span>
          <div>
            <label className="block text-xs font-medium mb-1.5">Consumo Neto (Platos y Bebidas)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
              <input
                type="number"
                value={consumoNeto}
                onChange={(e) => setConsumoNeto(e.target.value)}
                className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Régimen de IGV del Restaurante</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTasaIgv(0.18)}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                  tasaIgv === 0.18
                    ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold'
                    : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                }`}
              >
                IGV Estándar (18%)
              </button>
              <button
                onClick={() => setTasaIgv(0.10)}
                className={`p-2.5 rounded-lg text-xs font-medium border text-center transition-colors btn-press-effect ${
                  tasaIgv === 0.10
                    ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold' : 'bg-slate-900 text-white font-bold'
                    : isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200'
                }`}
              >
                Ley 31556 Mype (10%)
              </button>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Desglose de la Cuenta</span>
            <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className="opacity-70">Consumo Neto Base:</span>
                <span className="font-mono">S/ {formatearMoneda(cNeto)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Recargo al consumo (10% Mozos):</span>
                <span className="font-mono font-semibold">+ S/ {formatearMoneda(recargo)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>IGV ({(tasaIgv * 100).toFixed(0)}%):</span>
                <span className="font-mono font-semibold">+ S/ {formatearMoneda(igv)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total a Pagar por el Cliente</span>
                <span className="text-2xl font-bold">S/ {formatearMoneda(totalCuenta)}</span>
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
                      'Cuenta de Restaurante',
                      [
                        { label: 'Consumo Neto', valor: `S/ ${formatearMoneda(cNeto)}` },
                        { label: 'Recargo al Consumo (10%)', valor: `S/ ${formatearMoneda(recargo)}` },
                        { label: `IGV (${(tasaIgv * 100).toFixed(0)}%)`, valor: `S/ ${formatearMoneda(igv)}` },
                      ],
                      `S/ ${formatearMoneda(totalCuenta)}`,
                      numeroALetras(totalCuenta)
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