import React, { useState } from 'react';
import { Scale, Copy, Check } from 'lucide-react';
import { formatearMoneda } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  showToast: (msg: string) => void;
}

export default function ConversorUitModule({ isDark, bgCard, bgInput, showToast }: Props) {
  const uitActual = 5350; // Valor UIT 2026 oficial
  const [uitVal, setUitVal] = useState<string>('1');
  const [penVal, setPenVal] = useState<string>('5350');
  const [copied, setCopied] = useState(false);

  const handleUitChange = (v: string) => {
    setUitVal(v);
    const n = parseFloat(v);
    if (!isNaN(n)) setPenVal((n * uitActual).toFixed(2));
    else setPenVal('');
  };

  const handlePenChange = (v: string) => {
    setPenVal(v);
    const n = parseFloat(v);
    if (!isNaN(n) && uitActual > 0) setUitVal((n / uitActual).toFixed(4));
    else setUitVal('');
  };

  const copiar = () => {
    navigator.clipboard.writeText(penVal);
    setCopied(true);
    showToast('Monto en soles copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-zinc-400" />
          Conversor de Unidad Impositiva Tributaria (UIT 2026)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Valor oficial vigente: 1 UIT = S/ 5,350. Útil para verificar topes de compras estatales, multas del SAT y SUNAFIL.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Conversor Bidireccional</span>
          
          <div>
            <label className="block text-xs font-medium mb-1.5">Cantidad de UIT</label>
            <input
              type="number"
              step="0.1"
              value={uitVal}
              onChange={(e) => handleUitChange(e.target.value)}
              className={`w-full rounded-lg px-4 py-2 text-base font-semibold border ${bgInput}`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Equivalente en Soles (PEN)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
              <input
                type="number"
                step="0.01"
                value={penVal}
                onChange={(e) => handlePenChange(e.target.value)}
                className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-semibold border ${bgInput}`}
              />
            </div>
          </div>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Topes Legales Comunes</span>
            
            <div className="space-y-2 text-xs">
              {[
                { label: 'Contrataciones con el Estado sin licitación (8 UIT):', soles: 8 * uitActual },
                { label: 'Deducción inafecta de Alcabala (10 UIT):', soles: 10 * uitActual },
                { label: 'Tope régimen MYPE Tributario (1,700 UIT):', soles: 1700 * uitActual },
                { label: 'Tope deducción Renta de 5ta categoría (7 UIT):', soles: 7 * uitActual },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleUitChange(String(item.soles / uitActual))}
                  className={`p-2.5 rounded-lg border flex justify-between cursor-pointer hover:border-zinc-500 transition-colors ${
                    isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="opacity-80">{item.label}</span>
                  <span className="font-mono font-bold">S/ {formatearMoneda(item.soles)}</span>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Monto Calculado</span>
                <span className="text-2xl font-bold">S/ {formatearMoneda(parseFloat(penVal) || 0)}</span>
              </div>
              <button
                onClick={copiar}
                className={`p-2 rounded-md btn-press-effect ${isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border'}`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}