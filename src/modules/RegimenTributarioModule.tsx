import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
}

export default function RegimenTributarioModule({ isDark, bgCard }: Props) {
  const [ventasAnuales, setVentasAnuales] = useState<number>(60000);
  const [emiteFacturas, setEmiteFacturas] = useState<boolean>(false);
  const [actividadExcluida, setActividadExcluida] = useState<boolean>(false);

  // Lógica diagnóstica SUNAT
  let regimenRecomendado = 'Nuevo RUS (NRUS)';
  let motivo = 'Ventas menores a S/ 96,000 anuales y emisión exclusiva de boletas a consumidores finales.';
  let pagoEstimado = ventasAnuales <= 60000 ? 'S/ 20 mensuales (Categoría 1)' : 'S/ 50 mensuales (Categoría 2)';

  if (actividadExcluida) {
    regimenRecomendado = 'Régimen General o MYPE Tributario';
    motivo = 'Tu actividad económica (ej. transporte de carga, asesorías profesionales o construcción) está excluida del RUS y RER.';
    pagoEstimado = '1.0% de pago a cuenta mensual + Regularización anual de Renta (10% a 29.5%).';
  } else if (emiteFacturas) {
    if (ventasAnuales <= 525000) {
      regimenRecomendado = 'Régimen Especial de Renta (RER)';
      motivo = 'Vendes a empresas que te exigen factura y tus ingresos no superan los S/ 525,000 anuales.';
      pagoEstimado = '1.5% mensual sobre tus ingresos netos (pago definitivo, no presentas balance anual).';
    } else {
      regimenRecomendado = 'Régimen MYPE Tributario (RMT)';
      motivo = 'Tus ventas superan los S/ 525,000 y están dentro de las 1,700 UIT anuales.';
      pagoEstimado = '1% mensual de pago a cuenta y 10% de impuesto a la renta anual hasta 15 UIT de ganancia neta.';
    }
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-zinc-400" />
          Simulador de Régimen Tributario SUNAT
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Descubre si te conviene el Nuevo RUS, Especial (RER), MYPE Tributario o General para pagar menos impuestos de forma legal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-6 border rounded-xl p-5 space-y-4 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Preguntas de Diagnóstico</span>
          
          <div>
            <label className="block text-xs font-medium mb-1.5">Proyección de Ventas Anuales Estimadas</label>
            <div className="space-y-2">
              {[
                { label: 'Menos de S/ 96,000 al año (Hasta S/ 8,000 al mes)', val: 60000 },
                { label: 'Entre S/ 96,000 y S/ 525,000 anuales', val: 300000 },
                { label: 'Más de S/ 525,000 al año', val: 800000 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setVentasAnuales(opt.val)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors btn-press-effect ${
                    ventasAnuales === opt.val
                      ? isDark ? 'bg-zinc-100 text-zinc-950 font-bold border-white' : 'bg-slate-900 text-white font-bold'
                      : isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-300'}`}>
            <input
              type="checkbox"
              checked={emiteFacturas}
              onChange={(e) => setEmiteFacturas(e.target.checked)}
              className="rounded w-4 h-4"
            />
            <span>¿Tus clientes te solicitan <strong>Factura</strong> (o vendes a empresas / Estado)?</span>
          </label>

          <label className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-300'}`}>
            <input
              type="checkbox"
              checked={actividadExcluida}
              onChange={(e) => setActividadExcluida(e.target.checked)}
              className="rounded w-4 h-4"
            />
            <span>¿Brindas asesoría profesional independiente, transporte o construcción?</span>
          </label>
        </div>

        <div className={`lg:col-span-6 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div className="space-y-4">
            <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Resultado Recomendado</span>
            
            <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-base font-bold">{regimenRecomendado}</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">{motivo}</p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1.5 text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className="font-semibold text-zinc-300 block">Tasa de Impuesto Estimada:</span>
              <p className="opacity-90 leading-relaxed font-mono">{pagoEstimado}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}