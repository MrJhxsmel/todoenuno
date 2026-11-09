import React, { useState } from 'react';
import { Receipt, Printer, Copy, Check } from 'lucide-react';
import { formatearMoneda, numeroALetras } from '../utils/formatters';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  showToast: (msg: string) => void;
}

export default function ReciboCajaModule({ isDark, bgCard, bgInput, showToast }: Props) {
  const [tipo, setTipo] = useState<'ingreso' | 'egreso'>('egreso');
  const [monto, setMonto] = useState<string>('350');
  const [receptor, setReceptor] = useState('Carlos Mendoza Alva');
  const [dni, setDni] = useState('45892019');
  const [concepto, setConcepto] = useState('Pago por mantenimiento y pintura de oficina');
  const [copied, setCopied] = useState(false);

  const numMonto = parseFloat(monto) || 0;
  const letrasMonto = numeroALetras(numMonto);

  const textoRecibo = `========================================================
RECIBO DE CAJA CHICA (${tipo.toUpperCase()})
N°: ${Date.now().toString().slice(-6)}
Fecha: ${new Date().toLocaleDateString('es-PE')} - ${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
========================================================

IMPORTE: S/ ${formatearMoneda(numMonto)}
SON: ${letrasMonto}

${tipo === 'egreso' ? 'PAGADO A' : 'RECIBIDO DE'}: ${receptor}
DNI / RUC: ${dni}
POR CONCEPTO DE: ${concepto}

========================================================

Firma y Sello de Conformidad:



_______________________________________
${receptor}
DNI: ${dni}
========================================================`;

  const imprimir = () => {
    const w = window.open('', '', 'width=600,height=600');
    if (w) {
      w.document.write(`
        <html>
          <head>
            <title>Recibo de Caja</title>
            <style>
              body { font-family: monospace; padding: 20px; font-size: 11pt; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${textoRecibo}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      w.document.close();
    }
  };

  const copiar = () => {
    navigator.clipboard.writeText(textoRecibo);
    setCopied(true);
    showToast('Texto del recibo copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <Receipt className="w-5 h-5 text-zinc-400" />
          Generador de Recibo de Caja Simple (Ingreso / Egreso)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Comprobante interno listo para imprimir y firmar para control de caja chica y pagos en efectivo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-5 border rounded-xl p-5 space-y-3 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Datos del Recibo</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTipo('egreso')}
              className={`p-2 rounded-lg text-xs font-bold border transition-colors btn-press-effect ${
                tipo === 'egreso'
                  ? isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-slate-900 text-white'
                  : isDark ? 'bg-zinc-950 text-zinc-400 border-zinc-800' : 'bg-white'
              }`}
            >
              Egreso / Salida
            </button>
            <button
              onClick={() => setTipo('ingreso')}
              className={`p-2 rounded-lg text-xs font-bold border transition-colors btn-press-effect ${
                tipo === 'ingreso'
                  ? isDark ? 'bg-zinc-100 text-zinc-950' : 'bg-slate-900 text-white'
                  : isDark ? 'bg-zinc-950 text-zinc-400 border-zinc-800' : 'bg-white'
              }`}
            >
              Ingreso / Entrada
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Monto en Soles</label>
            <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">{tipo === 'egreso' ? 'Persona a la que se paga' : 'Persona que entrega el dinero'}</label>
            <input type="text" value={receptor} onChange={(e) => setReceptor(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">DNI o RUC</label>
            <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Concepto / Motivo</label>
            <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
        </div>

        <div className={`lg:col-span-7 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-3 border-zinc-800">
              <span className="text-xs font-medium">Vista Previa del Recibo</span>
              <div className="flex gap-2">
                <button onClick={copiar} className="p-1.5 rounded-md border text-xs flex items-center gap-1 btn-press-effect">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copiar
                </button>
                <button onClick={imprimir} className="p-1.5 px-3 rounded-md bg-zinc-900 text-white text-xs flex items-center gap-1 font-semibold btn-press-effect">
                  <Printer className="w-3.5 h-3.5" /> Imprimir
                </button>
              </div>
            </div>
            <pre className={`p-4 rounded-lg font-mono text-[11px] leading-relaxed whitespace-pre-wrap border ${isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
              {textoRecibo}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}