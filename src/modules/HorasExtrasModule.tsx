import React, { useState } from 'react';
import { Clock, Copy, Check, Printer } from 'lucide-react';
import { formatearMoneda, numeroALetras } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  abrirTicket: (titulo: string, filas: { label: string; valor: string }[], total: string, letras: string) => void;
  showToast: (msg: string) => void;
}

function HorasExtrasModule({ isDark, bgCard, bgInput, abrirTicket, showToast }: Props) {
  const [sueldo, setSueldo] = useState<string>('2400');
  const [horas25, setHoras25] = useState<number>(4);
  const [horas35, setHoras35] = useState<number>(2);
  const [diasFeriados, setDiasFeriados] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const numSueldo = parseFloat(sueldo) || 0;
  const valorDia = numSueldo / 30;
  const valorHora = valorDia / 8;

  // Tasas oficiales D.L. 854
  const monto25 = horas25 * (valorHora * 1.25);
  const monto35 = horas35 * (valorHora * 1.35);
  // Feriado trabajado no compensado = 1 día por laborar + 100% de sobretasa (2 días adicionales)
  const montoFeriados = diasFeriados * (valorDia * 2);
  const totalHorasExtras = monto25 + monto35 + montoFeriados;

  const copiar = () => {
    navigator.clipboard.writeText(totalHorasExtras.toFixed(2));
    setCopied(true);
    showToast('Total de horas extras copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-zinc-400" />
          Calculadora de Horas Extras y Feriados (D.L. 854)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Sobretasas oficiales del 25% (primeras 2h), 35% (3ra hora en adelante) y triple pago por feriados.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Jornada y Horas Laboradas</span>
          <div>
            <label className="block text-xs font-medium mb-1.5">Sueldo Básico Mensual</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">S/</span>
              <input
                type="number"
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value)}
                className={`w-full rounded-lg pl-9 pr-4 py-2 text-base font-medium focus:outline-none border ${bgInput}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">Horas con 25% (Primeras 2h)</label>
              <input
                type="number"
                value={horas25}
                onChange={(e) => setHoras25(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Horas con 35% (A partir de 3ra)</label>
              <input
                type="number"
                value={horas35}
                onChange={(e) => setHoras35(Math.max(0, parseInt(e.target.value) || 0))}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Domingos o Feriados laborados sin descanso compensatorio</label>
            <input
              type="number"
              value={diasFeriados}
              onChange={(e) => setDiasFeriados(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
            />
          </div>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Liquidación Estimada</span>
            <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className="opacity-70">Valor hora ordinaria base:</span>
                <span className="font-mono font-semibold">S/ {formatearMoneda(valorHora)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Monto horas extras 25% ({horas25}h):</span>
                <span className="font-mono">+ S/ {formatearMoneda(monto25)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Monto horas extras 35% ({horas35}h):</span>
                <span className="font-mono">+ S/ {formatearMoneda(monto35)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Sobretasa 100% feriados ({diasFeriados} d):</span>
                <span className="font-mono">+ S/ {formatearMoneda(montoFeriados)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Total Adicional a Percibir</span>
                <span className="text-2xl font-bold">S/ {formatearMoneda(totalHorasExtras)}</span>
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
                      'Liquidación Horas Extras',
                      [
                        { label: 'Sueldo Base', valor: `S/ ${formatearMoneda(numSueldo)}` },
                        { label: `Horas 25% (${horas25}h)`, valor: `S/ ${formatearMoneda(monto25)}` },
                        { label: `Horas 35% (${horas35}h)`, valor: `S/ ${formatearMoneda(monto35)}` },
                        { label: `Feriados (${diasFeriados} d)`, valor: `S/ ${formatearMoneda(montoFeriados)}` },
                      ],
                      `S/ ${formatearMoneda(totalHorasExtras)}`,
                      numeroALetras(totalHorasExtras)
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

export default HorasExtrasModule;