import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Weight, 
  Maximize, 
  Scissors, 
  Layers, 
  Ruler
} from 'lucide-react';
import { FilmType } from '../types';
import { DEFAULT_DENSITY } from '../constants';
import { DensitySelector } from './DensitySelector';
import { 
  calculateFilmGSM, 
  calculateFilmUnfoldedWidthMeter, 
  calculateM2PerKg, 
  formatInputValue, 
  formatNum, 
  parseNum, 
  displayRU 
} from '../utils/calculator';

export const FilmCalculatorView: React.FC = () => {
  const [density, setDensity] = useState<number>(DEFAULT_DENSITY);
  const [thickness, setThickness] = useState<number>(50);
  const [filmType, setFilmType] = useState<FilmType>('sleeve');
  
  // Inputs
  const [inputs, setInputs] = useState({
    format: '500', // mm
    weight: '100', // kg
    area: '2 105,3', // m²
    length: '2 105,3', // m.p.
  });

  const [mainPriority, setMainPriority] = useState<'weight' | 'area' | 'length'>('weight');

  // Recalculate GSM & m² per kg
  const gsm = calculateFilmGSM(thickness, density); // g/m²
  const m2PerKg = calculateM2PerKg(thickness, density); // m² in 1kg
  const formatMm = parseNum(inputs.format);
  
  // Unfolded single-layer width in meters for 1 linear meter of roll
  const unfoldedWidthMeter = calculateFilmUnfoldedWidthMeter(filmType, formatMm);

  const sync = (
    source: string, 
    val: string, 
    curFormat?: string, 
    curThickness?: number, 
    curDensity?: number, 
    curFilmType?: FilmType
  ) => {
    const cleanVal = formatInputValue(val);
    const v = parseNum(cleanVal);
    const updates: Partial<typeof inputs> = { [source]: cleanVal };
    
    const fMm = parseNum(curFormat ?? inputs.format);
    const th = curThickness ?? thickness;
    const den = curDensity ?? density;
    const ft = curFilmType ?? filmType;

    const curGsm = calculateFilmGSM(th, den);
    const curM2Kg = calculateM2PerKg(th, den);
    const unfWidthM = calculateFilmUnfoldedWidthMeter(ft, fMm); // m² per 1 linear meter of roll

    if (source === 'weight') {
      // Weight -> Area & Length
      const areaVal = v * curM2Kg;
      updates.area = formatNum(areaVal, 1);
      updates.length = formatNum(unfWidthM > 0 ? areaVal / unfWidthM : 0, 1);
    } else if (source === 'area') {
      // Area -> Weight & Length
      const weightVal = v * (curGsm / 1000);
      updates.weight = formatNum(weightVal, 1);
      updates.length = formatNum(unfWidthM > 0 ? v / unfWidthM : 0, 1);
    } else if (source === 'length') {
      // Length -> Area & Weight
      const areaVal = v * unfWidthM;
      updates.area = formatNum(areaVal, 1);
      updates.weight = formatNum(areaVal * (curGsm / 1000), 1);
    } else if (source === 'format' || source === 'filmType') {
      if (mainPriority === 'length') {
        const l = parseNum(inputs.length);
        const areaVal = l * unfWidthM;
        updates.area = formatNum(areaVal, 1);
        updates.weight = formatNum(areaVal * (curGsm / 1000), 1);
      } else if (mainPriority === 'weight') {
        const w = parseNum(inputs.weight);
        const areaVal = w * curM2Kg;
        updates.area = formatNum(areaVal, 1);
        updates.length = formatNum(unfWidthM > 0 ? areaVal / unfWidthM : 0, 1);
      } else {
        const a = parseNum(inputs.area);
        updates.weight = formatNum(a * (curGsm / 1000), 1);
        updates.length = formatNum(unfWidthM > 0 ? a / unfWidthM : 0, 1);
      }
    }

    setInputs((prev) => ({ ...prev, ...updates }));
  };

  // Re-sync whenever density, thickness, or filmType changes
  useEffect(() => {
    sync(mainPriority, inputs[mainPriority], inputs.format, thickness, density, filmType);
  }, [density, thickness, filmType]);

  const numWeight = parseNum(inputs.weight);
  const numArea = parseNum(inputs.area);
  const numLength = parseNum(inputs.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left Input Sidebar */}
      <aside className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
          
          {/* Header & Density */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand" /> Калькулятор Плёнки
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Пересчёт вес / площадь / погонный метраж</p>
            </div>

            <DensitySelector density={density} onChange={(d) => setDensity(d)} />
          </div>

          {/* Film Type Selector */}
          <div className="flex flex-col gap-1.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
              Вид плёночного материала
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'sleeve', name: 'Рукав' },
                { id: 'sheet', name: 'Полотно' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setFilmType(t.id as FilmType);
                    sync('filmType', inputs.format, inputs.format, thickness, density, t.id as FilmType);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    filmType === t.id
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Format & Thickness Input Blocks (Analogous Styling) */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Основные параметры
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-brand" /> Ширина (мм)
                </label>
                <input
                  type="text"
                  value={inputs.format}
                  onChange={(e) => sync('format', e.target.value)}
                  className="h-8 text-lg font-bold font-mono text-slate-900 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-brand" /> Толщина (мкм)
                </label>
                <input
                  type="text"
                  value={thickness.toString()}
                  onChange={(e) => {
                    const val = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    const newThickness = isNaN(val) ? 0 : val;
                    setThickness(newThickness);
                  }}
                  className="h-8 text-lg font-bold font-mono text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Weight, Area, Length Input Cards */}
          <div className="space-y-2.5">
            <InputField
              label="Общий вес партии (кг)"
              value={inputs.weight}
              onChange={(v) => { setMainPriority('weight'); sync('weight', v); }}
              icon={<Weight className="w-3.5 h-3.5 text-brand" />}
              isActive={mainPriority === 'weight'}
              onClick={() => setMainPriority('weight')}
            />

            <InputField
              label="Площадь плёнки (м²)"
              value={inputs.area}
              onChange={(v) => { setMainPriority('area'); sync('area', v); }}
              icon={<Maximize className="w-3.5 h-3.5 text-emerald-600" />}
              isActive={mainPriority === 'area'}
              onClick={() => setMainPriority('area')}
            />

            <InputField
              label="Длина рулонов (м.п.)"
              value={inputs.length}
              onChange={(v) => { setMainPriority('length'); sync('length', v); }}
              icon={<Scissors className="w-3.5 h-3.5 text-indigo-600" />}
              isActive={mainPriority === 'length'}
              onClick={() => setMainPriority('length')}
            />
          </div>

        </div>
      </aside>

      {/* Right Production Output Area */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em] mb-3 block">
                Характеристика плёнки
              </label>
              <div className="text-4xl font-black text-slate-900 mb-2 font-mono">
                {thickness} <span className="text-2xl font-normal text-slate-500">мкм</span>
              </div>
              <p className="text-xs font-bold text-brand">
                Плотность: {density} г/см³ ({filmType === 'sleeve' ? 'Рукав' : 'Полотно'})
              </p>
            </div>
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Удельный вес (GSM):</span>
                <span className="text-lg font-black font-mono text-slate-900">{displayRU(gsm, 2)} гр/м²</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">Площадь плёнки в 1 кг:</span>
                <span className="text-lg font-black font-mono text-emerald-600">{displayRU(m2PerKg, 2)} м²</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 text-white border border-slate-800 rounded-[2rem] p-7 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em] mb-3 block">
                Выход погонного метража
              </label>
              <div className="text-5xl font-black font-mono tracking-tighter text-amber-400">
                {displayRU(numLength, 1)}
              </div>
              <div className="text-lg font-medium mt-1 text-slate-300">погонных метров (м.п.)</div>
            </div>
            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
              Формат: {formatMm} мм ({unfoldedWidthMeter.toFixed(2)} м.п. разворота)
            </div>
          </motion.div>
        </div>

        {/* Technical Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ResultSmallCard
            label="Общий вес партии"
            value={displayRU(numWeight, 1)}
            unit="кг"
            icon={<Weight className="w-5 h-5 text-brand" />}
            colorClass="bg-blue-50 text-brand"
          />
          <ResultSmallCard
            label="Общая площадь плёнки"
            value={displayRU(numArea, 1)}
            unit="м²"
            icon={<Maximize className="w-5 h-5 text-emerald-600" />}
            colorClass="bg-emerald-50 text-emerald-600"
          />
        </div>
      </div>
    </div>
  );
};

function InputField({
  label,
  value,
  onChange,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-1 focus-within:ring-2 focus-within:ring-brand/10 transition-all p-3 border rounded-xl shadow-sm cursor-pointer ${
        isActive ? 'bg-blue-50/50 border-blue-300 ring-2 ring-brand/10' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {label}
        </label>
        {isActive && <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full bg-transparent text-xl font-bold font-mono text-slate-900 outline-none"
      />
    </div>
  );
}

function ResultSmallCard({
  label,
  value,
  unit,
  icon,
  colorClass,
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200/60 ${colorClass}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
          {label}
        </label>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">{value}</div>
          <span className="text-xs font-bold text-slate-500 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );
}
