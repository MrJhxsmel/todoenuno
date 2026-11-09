import React, { useState } from 'react';
import { FileText, Printer, Copy, Check } from 'lucide-react';

interface Props {
  isDark: boolean;
  bgCard: string;
  bgInput: string;
  showToast: (msg: string) => void;
}

export default function CartaRenunciaModule({ isDark, bgCard, bgInput, showToast }: Props) {
  const [nombre, setNombre] = useState('Juan Pérez Quispe');
  const [dni, setDni] = useState('74839201');
  const [empresa, setEmpresa] = useState('Servicios Generales SAC');
  const [puesto, setPuesto] = useState('Asistente Administrativo');
  const [ultimoDia, setUltimoDia] = useState('28 de Noviembre de 2026');
  const [exonerarPlazo, setExonerarPlazo] = useState(true);
  const [copied, setCopied] = useState(false);

  const textoCarta = `Lima, ${new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}

Señores:
${empresa}
Presente.-

Atención: Área de Recursos Humanos / Gerencia

De mi mayor consideración:

Por medio de la presente, me dirijo a ustedes para comunicarles mi decisión irrevocable de RENUNCIAR al cargo de ${puesto} que vengo desempeñando en su prestigiosa empresa.

${exonerarPlazo 
  ? `Asimismo, al amparo del artículo 18° del Texto Único Ordenado del Decreto Legislativo N° 728 (Ley de Productividad y Competitividad Laboral), solicito se sirva EXONERARME del plazo legal de preaviso de 30 días, fijando como mi último día de labores el ${ultimoDia}.`
  : `Cumplo con dar el preaviso legal de 30 días fijado por ley, siendo mi último día efectivo de trabajo el ${ultimoDia}.`
}

Agradezco la oportunidad y confianza brindada durante mi permanencia en la empresa. Del mismo modo, solicito se sirvan disponer la liquidación de mis beneficios sociales y la entrega de mi Certificado de Trabajo y Carta de Liberación de CTS dentro del plazo de 48 horas conforme a ley.

Atentamente,


____________________________________
${nombre}
DNI N° ${dni}`;

  const imprimir = () => {
    const ventana = window.open('', '', 'width=750,height=800');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Carta de Renuncia - ${nombre}</title>
            <style>
              body { font-family: 'Times New Roman', serif; padding: 40px; font-size: 14pt; line-height: 1.6; }
              pre { white-space: pre-wrap; font-family: inherit; }
            </style>
          </head>
          <body>
            <pre>${textoCarta}</pre>
            <script>window.print();</script>
          </body>
        </html>
      `);
      ventana.document.close();
    }
  };

  const copiar = () => {
    navigator.clipboard.writeText(textoCarta);
    setCopied(true);
    showToast('Carta de renuncia copiada al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-zinc-400" />
          Generador de Carta de Renuncia Laboral (D.L. 728)
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Genera e imprime tu carta formal con solicitud legal de exoneración de 30 días de preaviso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-5 border rounded-xl p-5 space-y-3 ${bgCard} glass-card`}>
          <span className="text-xs font-medium block border-b pb-2 border-zinc-800">Tus Datos y Empleo</span>
          <div>
            <label className="block text-xs font-medium mb-1">Nombre Completo</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">DNI</label>
            <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Empresa</label>
            <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Cargo / Puesto</label>
            <input type="text" value={puesto} onChange={(e) => setPuesto(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Último día de labores</label>
            <input type="text" value={ultimoDia} onChange={(e) => setUltimoDia(e.target.value)} className={`w-full rounded-lg px-3 py-1.5 text-xs border ${bgInput}`} />
          </div>
          <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs ${isDark ? 'bg-zinc-950/70 border-zinc-800' : 'bg-slate-50 border-slate-300'}`}>
            <input type="checkbox" checked={exonerarPlazo} onChange={(e) => setExonerarPlazo(e.target.checked)} className="rounded" />
            <span>Solicitar exoneración de los 30 días de preaviso</span>
          </label>
        </div>

        <div className={`lg:col-span-7 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${bgCard} glass-card`}>
          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-3 border-zinc-800">
              <span className="text-xs font-medium">Vista Previa de la Carta</span>
              <div className="flex gap-2">
                <button onClick={copiar} className="p-1.5 rounded-md border text-xs flex items-center gap-1 btn-press-effect">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copiar
                </button>
                <button onClick={imprimir} className="p-1.5 px-3 rounded-md bg-zinc-900 text-white text-xs flex items-center gap-1 font-semibold btn-press-effect">
                  <Printer className="w-3.5 h-3.5" /> Imprimir A4
                </button>
              </div>
            </div>
            <pre className={`p-4 rounded-lg font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border ${isDark ? 'bg-zinc-950/70 border-zinc-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
              {textoCarta}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}