import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

interface Props {
  isDark: boolean;
  onCopyResult: (val: string) => void;
}

export default function QuickCalculator({ isDark, onCopyResult }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');

  const handleBtn = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      return;
    }
    if (val === '=') {
      try {
        // Evaluación aritmética simple y segura
        const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(Number(res.toFixed(4))));
      } catch {
        setDisplay('Error');
      }
      return;
    }
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Abrir calculadora rápida (C)"
        className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl flex items-center justify-center transition-all btn-press-effect hover:scale-105"
      >
        <Calculator className="w-5 h-5" />
      </button>

      {isOpen && (
        <div
          className={`fixed bottom-20 left-6 z-50 w-64 rounded-2xl shadow-2xl border p-4 anim-modal-in ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 mb-3">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-500" /> Calculadora Rápida
            </span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            className={`p-2.5 rounded-xl font-mono text-right text-lg font-bold mb-3 overflow-x-auto border ${
              isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
            }`}
          >
            {display}
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
            {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='].map(
              (btn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleBtn(btn)}
                  className={`py-2 rounded-lg border transition-colors btn-press-effect ${
                    btn === '='
                      ? 'col-span-2 bg-blue-600 text-white border-blue-600 font-bold'
                      : btn === 'C'
                      ? 'bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-900'
                      : isDark
                      ? 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 text-zinc-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {btn}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => {
              onCopyResult(display);
              setIsOpen(false);
            }}
            className="w-full mt-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Copiar al portapapeles
          </button>
        </div>
      )}
    </>
  );
}