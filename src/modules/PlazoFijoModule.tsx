import React, { useState } from 'react';
import { PiggyBank, Copy, Check } from 'lucide-react';
import { formatearMoneda } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  showToast: (msg: string) => void;
}

export default function PlazoFijoModule({ isDark, bgCard, bgInput, showToast }: Props) {
  const [deposito, setDeposito] = useState<string>('10000');
  const [plazoMeses, setPlazoMeses] = useState<number>(12);
  const [trea, setTrea] = useState<string>('7.5');
  const [copied, setCopied] = useState(false);

  const numDep = parseFloat(deposito) || 0;
  const tasaAnual = (parseFloat(trea) || 0) / 100;
  // Interés compuesto por días/meses: Monto Final = Depósito * (1 + TREA)^(meses/12)
  const montoFinal = numDep * Math.pow(1 + tasaAnual, plazoMeses / 12);
  const gananciaInteres = montoFinal - numDep;

  const copiar = () => {
    navigator.clipboard.writeText(gananciaInteres.toFixed(2));
    setCopied(true);
    showToast('Ganancia estimada copiada');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <PiggyBank className="w-5 h-5 text-zinc-400" />
          Simulador de Plazo Fijo & TREA (Cajas vs. Bancos)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Calcula tu rendimiento con la Tasa de Rendimiento Efectivo Anual (TREA) libre de comisiones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Condiciones del Depósito</span>
          <div>
            <label className="block text-xs font-medium mb-1.5">Capital a Invertir</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
              <input
                type="number"
                value={deposito}
                onChange={(e) => setDeposito(e.target.value)}
                className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">TREA Promedio (%)</label>
              <input
                type="number"
                step="0.1"
                value={trea}
                onChange={(e) => setTrea(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Plazo (Meses)</label>
              <select
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(parseInt(e.target.value))}
                className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none border ${bgInput}`}
              >
                <option value={3}>3 Meses (90 días)</option>
                <option value={6}>6 Meses (180 días)</option>
                <option value={12}>12 Meses (1 Año)</option>
                <option value={24}>24 Meses (2 Años)</option>
                <option value={36}>36 Meses (3 Años)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] text-zinc-500 mb-2 block font-medium">Tasas referenciales en Perú:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { nombre: 'Cajas Municipales (Promedio)', rate: '7.8' },
                { nombre: 'Bancos Digitales / Financieras', rate: '6.5' },
                { nombre: 'Banca Tradicional', rate: '4.2' },
              ].map((item) => (
                <button
                  key={item.nombre}
                  onClick={() => setTrea(item.rate)}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors btn-press-effect ${
                    isDark ? 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  }`}
                >
                  {item.nombre} ({item.rate}%)
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Proyección de Rentabilidad</span>
            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Ganancia Neta por Intereses</span>
                <span className="text-2xl font-bold text-emerald-500">+ S/ {formatearMoneda(gananciaInteres)}</span>
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
                <span className="opacity-70">Capital inicial invertido:</span>
                <span className="font-mono">S/ {formatearMoneda(numDep)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total a cobrar al finalizar el plazo:</span>
                <span className="font-mono">S/ {formatearMoneda(montoFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}