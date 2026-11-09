import React, { useState } from 'react';
import { Briefcase, Copy, Check, Printer } from 'lucide-react';
import { formatearMoneda, numeroALetras } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  abrirTicket: (titulo: string, filas: { label: string; valor: string }[], total: string, letras: string) => void;
  showToast: (msg: string) => void;
}

export default function UtilidadesModule({ isDark, bgCard, bgInput, abrirTicket, showToast }: Props) {
  const [rubroPorcentaje, setRubroPorcentaje] = useState<number>(0.08); // 8% comercio / restaurantes / minería
  const [utilidadRentaNeta, setUtilidadRentaNeta] = useState<string>('500000');
  const [diasTrabajador, setDiasTrabajador] = useState<number>(300);
  const [totalDiasTodos, setTotalDiasTodos] = useState<number>(6000);
  const [remunTrabajador, setRemunTrabajador] = useState<string>('36000');
  const [totalRemunTodos, setTotalRemunTodos] = useState<string>('720000');
  const [copied, setCopied] = useState(false);

  const uNeta = parseFloat(utilidadRentaNeta) || 0;
  const bolsaDistribuible = uNeta * rubroPorcentaje;
  const bolsaDias = bolsaDistribuible * 0.5;
  const bolsaRemun = bolsaDistribuible * 0.5;

  const parteDias = totalDiasTodos > 0 ? (bolsaDias / totalDiasTodos) * diasTrabajador : 0;
  const totalRemun = parseFloat(totalRemunTodos) || 1;
  const parteRemun = (bolsaRemun / totalRemun) * (parseFloat(remunTrabajador) || 0);
  const totalUtilidades = parteDias + parteRemun;

  const copiar = () => {
    navigator.clipboard.writeText(totalUtilidades.toFixed(2));
    setCopied(true);
    showToast('Monto de utilidades copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <Briefcase className="w-5 h-5 text-zinc-400" />
          Simulador de Reparto Legal de Utilidades (D. Leg. 892)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Cálculo del 50% por días laborados y 50% según remuneración para empresas con más de 20 trabajadores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Datos de la Empresa y Trabajador</span>
          
          <div>
            <label className="block text-xs font-medium mb-1.5">Actividad Económica de la Empresa</label>
            <select
              value={rubroPorcentaje}
              onChange={(e) => setRubroPorcentaje(parseFloat(e.target.value))}
              className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none border ${bgInput}`}
            >
              <option value={0.10}>Pesqueras, Telecomunicaciones e Industriales (10%)</option>
              <option value={0.08}>Minería, Comercio, Restaurantes y Mayoristas (8%)</option>
              <option value={0.05}>Agrarias y Otras Actividades (5%)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">Utilidad Neta de la Empresa (Antes de Impuestos)</label>
            <input
              type="number"
              value={utilidadRentaNeta}
              onChange={(e) => setUtilidadRentaNeta(e.target.value)}
              className={`w-full rounded-lg px-4 py-2 text-sm border ${bgInput}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">Tus días laborados en el año</label>
              <input
                type="number"
                value={diasTrabajador}
                onChange={(e) => setDiasTrabajador(parseInt(e.target.value) || 0)}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Días de todos los trabajadores</label>
              <input
                type="number"
                value={totalDiasTodos}
                onChange={(e) => setTotalDiasTodos(parseInt(e.target.value) || 1)}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">Tus sueldos percibidos en el año</label>
              <input
                type="number"
                value={remunTrabajador}
                onChange={(e) => setRemunTrabajador(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5">Total planilla anual de la empresa</label>
              <input
                type="number"
                value={totalRemunTodos}
                onChange={(e) => setTotalRemunTodos(e.target.value)}
                className={`w-full rounded-lg px-3 py-2 text-sm border ${bgInput}`}
              />
            </div>
          </div>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-3">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Resultado de Utilidades</span>
            <div className={`p-3.5 rounded-lg border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className="opacity-70">Bolsa total a repartir:</span>
                <span className="font-mono">S/ {formatearMoneda(bolsaDistribuible)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Por días trabajados (50%):</span>
                <span className="font-mono">+ S/ {formatearMoneda(parteDias)}</span>
              </div>
              <div className="flex justify-between text-blue-500">
                <span>Por remuneraciones percibidas (50%):</span>
                <span className="font-mono">+ S/ {formatearMoneda(parteRemun)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border flex items-center justify-between ${isDark ? 'bg-zinc-900/90 border-zinc-700/80' : 'bg-slate-100 border-slate-300'}`}>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider block opacity-70">Utilidades Netas Estimadas</span>
                <span className="text-2xl font-bold">S/ {formatearMoneda(totalUtilidades)}</span>
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
                      'Estimación de Utilidades',
                      [
                        { label: 'Rubro Porcentaje', valor: `${(rubroPorcentaje * 100).toFixed(0)}%` },
                        { label: 'Parte por Días', valor: `S/ ${formatearMoneda(parteDias)}` },
                        { label: 'Parte por Sueldos', valor: `S/ ${formatearMoneda(parteRemun)}` },
                      ],
                      `S/ ${formatearMoneda(totalUtilidades)}`,
                      numeroALetras(totalUtilidades)
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