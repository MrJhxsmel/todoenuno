import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

interface ModuleItem {
  id: string;
  title: string;
  tag: string;
  icon: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleItem[];
  onSelectModule: (id: string) => void;
  isDark: boolean;
}

export default function CommandPalette({ isOpen, onClose, modules, onSelectModule, isDark }: Props) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = modules.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden anim-modal-in ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ir a cualquier herramienta... (presiona Esc para salir)"
            className="w-full bg-transparent text-sm focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">No se encontraron herramientas</p>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    onClose();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isDark
                      ? 'hover:bg-zinc-800 text-zinc-200'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold block">{item.title}</span>
                      <span className="text-[10px] text-slate-400">{item.tag}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}