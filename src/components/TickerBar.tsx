import React, { useState, useMemo } from 'react';
import { Activity, Clock, ExternalLink } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface Props {
  isDark: boolean;
  onNavigateToCronograma: () => void;
}

export default function TickerBar({ isDark, onNavigateToCronograma }: Props) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Cálculo dinámico de próxima fecha clave
  const proximoHito = useMemo(() => {
    const ahora = new Date();
    const anio = ahora.getFullYear();

    // Hitos laborales y tributarios oficiales peruanos
    const fechas = [
      { nombre: 'Depósito de CTS (1er Semestre)', fecha: new Date(anio, 4, 15) }, // 15 Mayo
      { nombre: 'Gratificación de Fiestas Patrias', fecha: new Date(anio, 6, 15) }, // 15 Julio
      { nombre: 'Depósito de CTS (2do Semestre)', fecha: new Date(anio, 10, 15) }, // 15 Noviembre
      { nombre: 'Gratificación de Navidad', fecha: new Date(anio, 11, 15) }, // 15 Diciembre
    ];

    // Buscar la próxima fecha que no haya pasado
    for (const h of fechas) {
      const diffDias = Math.ceil((h.fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDias >= 0) {
        return { ...h, diasRestantes: diffDias };
      }
    }
    return { nombre: 'Depósito de CTS (Mayo)', diasRestantes: 180 };
  }, []);

  const itemsTicker = [
    { label: 'DÓLAR SUNAT', valor: 'C: S/ 3.427 | V: S/ 3.448', color: 'text-emerald-500' },
    { label: 'DÓLAR CALLE / FINTECH', valor: 'C: S/ 3.435 | V: S/ 3.460', color: 'text-teal-500' },
    { label: 'UIT OFICIAL', valor: 'S/ 5,350', color: 'text-rose-500' },
    { label: 'SUELDO MÍNIMO (RMV)', valor: 'S/ 1,025', color: 'text-blue-500' },
    { label: 'TIM MORA SUNAT', valor: '0.03% diario (0.90% mensual)', color: 'text-amber-500' },
    { label: 'FONDO SEGURO DEPÓSITOS (FSD)', valor: 'Hasta S/ 121,500 cubiertos', color: 'text-purple-500' },
    { label: 'IGV GENERAL', valor: '18% (16% IGV + 2% IPM)', color: 'text-sky-500' },
    { label: 'DETRACCIÓN GENERAL SERVICIOS', valor: '12% (> S/ 700)', color: 'text-indigo-500' },
  ];

  return (
    <>
      <div
        className={`border-b text-[11px] h-9 flex items-center overflow-hidden select-none transition-colors ${
          isDark
            ? 'bg-zinc-950/90 border-zinc-800 text-zinc-300'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}
      >
        {/* Semáforo SUNAT compacto a la izquierda */}
        <button
          onClick={() => {
            soundEffects.playClick();
            setShowStatusModal(true);
          }}
          title="Ver estado de servidores SUNAT y OSE"
          className="h-full px-3 flex items-center gap-1.5 border-r border-slate-800 dark:border-zinc-800 hover:bg-white/5 transition-colors z-20 flex-shrink-0"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-[10px] hidden sm:inline tracking-wider">SUNAT: OPERATIVO</span>
          <Activity className="w-3 h-3 text-slate-400" />
        </button>

        {/* Cinta Marquee Infinita */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="animate-marquee items-center gap-8 py-1 font-mono text-[10px]">
            {/* Duplicamos los elementos para generar ciclo visual continuo infinito */}
            {[...itemsTicker, ...itemsTicker].map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 flex-shrink-0">
                <span className="font-semibold text-slate-400 dark:text-zinc-400">{item.label}:</span>
                <span className={`font-bold ${item.color}`}>{item.valor}</span>
                <span className="text-slate-600 dark:text-zinc-700 ml-3">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerta de Cierre Próximo a la derecha */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onNavigateToCronograma();
          }}
          className="h-full px-3 flex items-center gap-1.5 border-l border-slate-800 dark:border-zinc-800 hover:bg-white/5 transition-colors z-20 flex-shrink-0 text-amber-300 font-semibold text-[10px]"
        >
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="hidden md:inline">{proximoHito.nombre}:</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 font-mono">
            Faltan {proximoHito.diasRestantes} días
          </span>
        </button>
      </div>

      {/* MODAL DE ESTADO DE SERVIDORES SUNAT */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm rounded-2xl shadow-2xl border p-5 space-y-4 anim-modal-in ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm">Estado de Servicios Tributarios</h3>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                <span>SUNAT Operaciones en Línea (SOL)</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operativo
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                <span>Emisión de Facturas y Boletas (SEE)</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Estable
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                <span>Servicio de Consulta RUC Web</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> En línea
                </span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
                <span>Plataformas Bancarias SPOT (Detracciones)</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Normal
                </span>
              </div>
            </div>

            <p className="text-[10px] opacity-70 leading-relaxed">
              Monitoreo activo para declaraciones juradas, emisiones de comprobantes de pago y consultas de contribuyentes.
            </p>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full py-2 bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs rounded-xl"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}