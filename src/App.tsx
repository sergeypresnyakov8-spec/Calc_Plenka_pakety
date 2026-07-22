import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Layers, 
  TableProperties, 
  Calculator,
  Building2,
  Sparkles
} from 'lucide-react';
import { FilmCalculatorView } from './components/FilmCalculatorView';
import { CourierBagCalculatorView } from './components/CourierBagCalculatorView';
import { PetCalculatorView } from './components/PetCalculatorView';

type AppMode = 'film' | 'courier_bag' | 'pet';

export default function App() {
  const [activeMode, setActiveMode] = useState<AppMode>('courier_bag');

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden selection:bg-brand/20">
      {/* Top Header */}
      <header className="h-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              Guardix <span className="text-slate-400 font-normal hidden sm:inline">|</span> 
              <span className="text-brand">Производственный Калькулятор</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
              ПВД плёнка · Курьерские пакеты
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveMode('courier_bag')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'courier_bag'
                ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-brand" />
            <span className="hidden md:inline">Курьерские пакеты</span>
            <span className="md:hidden">Пакеты</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('film')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'film'
                ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Плёнка ПВД</span>
            <span className="md:hidden">Плёнка</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('pet')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'pet'
                ? 'bg-white text-slate-900 shadow-md scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">ПЭТ</span>
            <span className="md:hidden">ПЭТ</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-[1536px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeMode === 'courier_bag' && (
            <motion.div
              key="courier_bag"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <CourierBagCalculatorView />
            </motion.div>
          )}

          {activeMode === 'film' && (
            <motion.div
              key="film"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <FilmCalculatorView />
            </motion.div>
          )}

          {activeMode === 'pet' && (
            <motion.div
              key="pet"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <PetCalculatorView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="h-12 bg-white/85 backdrop-blur-md border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[11px] text-slate-500 uppercase tracking-widest font-bold z-10 sticky bottom-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-brand" />
          <span>Guardix | Технологический расчет производства</span>
        </div>
        <div className="hidden sm:block">Designed by Economist © 2026</div>
      </footer>
    </div>
  );
}
