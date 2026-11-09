import React, { useState } from 'react';
import { DollarSign, Scale, Calendar } from 'lucide-react';

interface Props {
  isDark: boolean;
  onNavigateToCronograma: () => void;
}

export default function TickerBar({ isDark, onNavigateToCronograma }: Props) {
  const [userRucDigit, setUserRucDigit] = useState<string>(() => {
    return localStorage.getItem('todoenuno_ruc_digit') || '0';
  });

  const handleDigitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setUserRucDigit(val);
    localStorage.setItem('todoenuno_ruc_digit', val);
  };

  return (
    <div
      className={`border-b text-[11px] px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-slate-200/70 border-slate-300 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 font-medium">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Dólar SUNAT:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">C: 3.427 | V: 3.448</span>
        </div>

        <div className="flex items-center gap-1.5 font-medium">
          <Scale className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>UIT 2026:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">S/ 5,350</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] opacity-80">Mi RUC termina en:</span>
        <select
          value={userRucDigit}
          onChange={handleDigitChange}
          className={`rounded px-1.5 py-0.5 text-[11px] font-bold font-mono focus:outline-none border ${
            isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          onClick={onNavigateToCronograma}
          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold ml-1"
        >
          <Calendar className="w-3 h-3" /> Ver mi fecha límite
        </button>
      </div>
    </div>
  );
}