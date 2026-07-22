import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Weight, 
  Ruler,
  Boxes
} from 'lucide-react';
import { CourierBagInputs } from '../types';
import { DEFAULT_DENSITY } from '../constants';
import { DensitySelector } from './DensitySelector';
import { BagVisualizer } from './BagVisualizer';
import { 
  calculateCourierBag, 
  parseNum, 
  displayRU, 
  formatInputValue, 
  formatNum,
  calculateFilmGSM 
} from '../utils/calculator';

export const CourierBagCalculatorView: React.FC = () => {
  const [inputs, setInputs] = useState<CourierBagInputs>({
    density: DEFAULT_DENSITY,
    thickness: 50,
    width: '240',
    height: '320',
    flap: '40',
    bottomGusset: '0',
    quantityPcs: '10 000',
    quantityKg: '77,5',
  });

  const [mainPriority, setMainPriority] = useState<'pcs' | 'kg'>('pcs');

  const sync = (
    source: 'pcs' | 'kg' | 'dim',
    val?: string,
    overrideInputs?: Partial<CourierBagInputs>
  ) => {
    const curInputs = { ...inputs, ...overrideInputs };
    const wMm = parseNum(curInputs.width);
    const hMm = parseNum(curInputs.height);
    const flMm = parseNum(curInputs.flap);
    const bgMm = parseNum(curInputs.bottomGusset);
    const th = curInputs.thickness;
    const den = curInputs.density;

    const cutMm = (2 * hMm) + flMm + (2 * bgMm);
    const areaM2 = (wMm / 1000) * (cutMm / 1000);
    const bGsm = calculateFilmGSM(th, den);
    const bWg = (areaM2 * bGsm) / 1000; // kg per bag

    const updates: Partial<CourierBagInputs> = {};

    if (source === 'pcs') {
      const formattedPcs = formatInputValue(val ?? curInputs.quantityPcs);
      const pcsVal = parseNum(formattedPcs);
      updates.quantityPcs = formattedPcs;
      const kg = pcsVal * bWg;
      updates.quantityKg = formatNum(kg, 1);
    } else if (source === 'kg') {
      const formattedKg = formatInputValue(val ?? curInputs.quantityKg);
      const kgVal = parseNum(formattedKg);
      updates.quantityKg = formattedKg;
      const pcs = bWg > 0 ? kgVal / bWg : 0;
      updates.quantityPcs = formatNum(pcs, 0);
    } else if (source === 'dim') {
      if (mainPriority === 'pcs') {
        const pcsVal = parseNum(curInputs.quantityPcs);
        const kg = pcsVal * bWg;
        updates.quantityKg = formatNum(kg, 1);
      } else {
        const kgVal = parseNum(curInputs.quantityKg);
        const pcs = bWg > 0 ? kgVal / bWg : 0;
        updates.quantityPcs = formatNum(pcs, 0);
      }
    }

    setInputs((prev) => ({ ...prev, ...overrideInputs, ...updates }));
  };

  const numDensity = inputs.density;
  const numThickness = inputs.thickness;
  const numWidth = parseNum(inputs.width);
  const numHeight = parseNum(inputs.height);
  const numFlap = parseNum(inputs.flap);
  const numBottomGusset = parseNum(inputs.bottomGusset);
  const numQuantityPcs = parseNum(inputs.quantityPcs);

  const calc = calculateCourierBag(
    numDensity,
    numThickness,
    numWidth,
    numHeight,
    numFlap,
    numBottomGusset,
    numQuantityPcs
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Input Sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
          
          {/* Header & Density */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand" /> Курьерские Пакеты
              </h2>
            </div>
            
            <DensitySelector
              density={inputs.density}
              onChange={(d) => sync('dim', undefined, { density: d })}
            />
          </div>

          {/* Compact Bag Dimensions & Thickness Block */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-brand" /> Параметры пакета
              </span>
              <span className="text-[10px] font-bold text-slate-400">Габариты и толщина</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex flex-col bg-white p-2 rounded-xl border border-slate-200">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Ширина</label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    value={inputs.width}
                    onChange={(e) => sync('dim', undefined, { width: e.target.value })}
                    className="w-full text-base font-bold font-mono text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">мм</span>
                </div>
              </div>

              <div className="flex flex-col bg-white p-2 rounded-xl border border-slate-200">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Высота</label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    value={inputs.height}
                    onChange={(e) => sync('dim', undefined, { height: e.target.value })}
                    className="w-full text-base font-bold font-mono text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">мм</span>
                </div>
              </div>

              <div className="flex flex-col bg-white p-2 rounded-xl border border-slate-200">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Клапан</label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    value={inputs.flap}
                    onChange={(e) => sync('dim', undefined, { flap: e.target.value })}
                    className="w-full text-base font-bold font-mono text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">мм</span>
                </div>
              </div>

              <div className="flex flex-col bg-white p-2 rounded-xl border border-slate-200">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Толщина</label>
                <div className="flex items-baseline gap-1">
                  <input
                    type="text"
                    value={inputs.thickness.toString()}
                    onChange={(e) => {
                      const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                      const newTh = isNaN(val) ? 0 : val;
                      sync('dim', undefined, { thickness: newTh });
                    }}
                    className="w-full text-base font-bold font-mono text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">мкм</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Circulation Block: Pieces & Kilograms */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <div 
              onClick={() => setMainPriority('pcs')}
              className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                mainPriority === 'pcs' ? 'bg-blue-50/70 border-blue-300 ring-2 ring-brand/10 shadow-sm' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-brand" /> Тираж (шт)
                </label>
                {mainPriority === 'pcs' && <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />}
              </div>
              <input
                type="text"
                value={inputs.quantityPcs}
                onChange={(e) => {
                  setMainPriority('pcs');
                  sync('pcs', e.target.value);
                }}
                className="h-8 font-mono font-black text-brand text-lg outline-none bg-transparent"
              />
            </div>

            <div 
              onClick={() => setMainPriority('kg')}
              className={`flex flex-col gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                mainPriority === 'kg' ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10 shadow-sm' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5 text-emerald-600" /> Вес тиража (кг)
                </label>
                {mainPriority === 'kg' && <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" />}
              </div>
              <input
                type="text"
                value={inputs.quantityKg}
                onChange={(e) => {
                  setMainPriority('kg');
                  sync('kg', e.target.value);
                }}
                className="h-8 font-mono font-black text-emerald-700 text-lg outline-none bg-transparent"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Right Results & Visualizer Area */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Interactive Bag Visualizer */}
        <BagVisualizer
          widthMm={numWidth}
          heightMm={numHeight}
          flapMm={numFlap}
          bottomGussetMm={numBottomGusset}
          thickness={numThickness}
          density={numDensity}
          weightGrams={calc.bagWeightGrams}
        />

        {/* Major Key Production Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Вес 1 пакета
              </span>
              <div className="text-4xl font-black font-mono text-brand">
                {calc.bagWeightGrams.toFixed(2)} <span className="text-xl font-normal text-slate-600">г</span>
              </div>
              <div className="text-xs font-medium text-slate-500 mt-2">
                Выход: <span className="font-bold font-mono text-slate-800">~{calc.bagsPerKg.toFixed(0)} шт/кг</span>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>Плотность: {numDensity} г/см³</span>
              <span className="font-bold text-emerald-600">ПВД</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-slate-900 text-white border border-slate-800 rounded-[2rem] p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Общий вес тиража
              </span>
              <div className="text-4xl font-black font-mono text-amber-400">
                {displayRU(calc.totalFilmWeightKg, 1)} <span className="text-xl font-normal text-slate-400">кг</span>
              </div>
              <div className="text-xs font-medium text-slate-400 mt-2">
                Тираж: <span className="text-white font-mono font-bold">{displayRU(numQuantityPcs, 0)} шт</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};
