import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, X, Copy, Check, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  filas: { label: string; valor: string }[];
  total: string;
  letras: string;
  isDark: boolean;
  showToast: (msg: string) => void;
}

export default function SocialShareModal({
  isOpen,
  onClose,
  titulo,
  filas,
  total,
  letras,
  isDark,
  showToast,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [temaGradiente, setTemaGradiente] = useState<'slate' | 'indigo' | 'emerald' | 'sunset'>('indigo');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gradientes = {
    indigo: 'from-blue-600 via-indigo-700 to-purple-800',
    emerald: 'from-emerald-600 via-teal-700 to-cyan-800',
    slate: 'from-slate-800 via-zinc-900 to-black',
    sunset: 'from-amber-500 via-rose-600 to-purple-800',
  };

  const descargarImagen = async () => {
    if (!cardRef.current) return;
    soundEffects.playClick();
    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, { pixelRatio: 2.5 });
      const a = document.createElement('a');
      a.download = `calculo-${titulo.toLowerCase().replace(/\s+/g, '-')}.png`;
      a.href = dataUrl;
      a.click();
      showToast('Tarjeta gráfica descargada en alta resolución');
    } catch {
      showToast('Error al generar la tarjeta');
    }
  };

  const copiarPortapapeles = async () => {
    if (!cardRef.current) return;
    soundEffects.playClick();
    try {
      const blob = await htmlToImage.toBlob(cardRef.current, { pixelRatio: 2 });
      if (blob && navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        soundEffects.playPop();
        showToast('Tarjeta copiada como imagen al portapapeles');
        setTimeout(() => setCopied(false), 2000);
      } else {
        descargarImagen();
      }
    } catch {
      descargarImagen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border p-5 space-y-4 anim-modal-in ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-sm">Generador de Tarjeta Social / Cotización</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de color de fondo */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-zinc-400">Estilo del degradado:</span>
          <div className="flex gap-2">
            {(['indigo', 'emerald', 'sunset', 'slate'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setTemaGradiente(g)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  temaGradiente === g ? 'scale-110 border-white ring-2 ring-blue-500' : 'border-transparent'
                } bg-gradient-to-tr ${gradientes[g]}`}
              />
            ))}
          </div>
        </div>

        {/* Tarjeta a renderizar como imagen (Estilo Ray.so) */}
        <div
          ref={cardRef}
          className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-br ${gradientes[temaGradiente]} shadow-2xl flex items-center justify-center`}
        >
          <div className="w-full bg-slate-950/85 backdrop-blur-md text-white border border-white/15 rounded-xl p-5 shadow-2xl font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-sans font-bold text-slate-400 tracking-wider uppercase">
                TODO EN UNO PERÚ
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-blue-400 uppercase font-sans font-bold tracking-wide">
                Comprobante Oficial
              </span>
              <h4 className="text-sm font-bold text-white">{titulo}</h4>
            </div>

            <div className="space-y-1.5 py-2 border-y border-white/10 text-[11px]">
              {filas.map((f, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-slate-400">{f.label}:</span>
                  <span className="font-semibold text-slate-200">{f.valor}</span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-slate-400 font-sans">IMPORTE TOTAL:</span>
                <span className="text-xl font-black text-emerald-400">{total}</span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 uppercase leading-tight line-clamp-1">{letras}</p>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[9px] text-slate-400 font-sans">
              <span>{new Date().toLocaleDateString('es-PE')}</span>
              <span>Calculado en todoenuno.pe</span>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={copiarPortapapeles}
            className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors btn-press-effect"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>Copiar Imagen</span>
          </button>
          <button
            onClick={descargarImagen}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md btn-press-effect"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}