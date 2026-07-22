import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Weight, 
  Maximize, 
  Scissors, 
  CircleDollarSign, 
  ChevronDown, 
  Info 
} from 'lucide-react';
import { PETRecord } from '../types';
import { DEFAULT_PET_DATA } from '../constants';
import { formatInputValue, formatNum, parseNum, displayRU } from '../utils/calculator';

export const PetCalculatorView: React.FC = () => {
  const [data] = useState<PETRecord[]>(DEFAULT_PET_DATA);
  const [selectedThickness, setSelectedThickness] = useState<number>(20);

  const [inputs, setInputs] = useState({
    weight: '420,17',
    area: '15 000',
    length: '750 000',
    format: '20',
    priceKg: '0',
    priceM2: '0',
    priceMp: '0',
  });

  const [pricePriority, setPricePriority] = useState<'kg' | 'm2' | 'mp'>('kg');
  const [mainPriority, setMainPriority] = useState<'weight' | 'area' | 'length'>('area');

  const record = useMemo(() => 
    data.find(r => r.thickness === selectedThickness) || data[0]
  , [data, selectedThickness]);

  const sync = (source: string, val: string, currentFormat?: string) => {
    const cleanVal = formatInputValue(val);
    const v = parseNum(cleanVal);
    const updates: Partial<typeof inputs> = { [source]: cleanVal };
    const f = parseNum(currentFormat ?? inputs.format);
    const m2kg = record.m2PerKg;
    const gsm = record.weightPerM2 / 1000;

    if (source === 'weight') {
      const a = v * m2kg;
      updates.area = formatNum(a);
      updates.length = formatNum(f > 0 ? (a / (f / 1000)) : 0, 1);
    } else if (source === 'area') {
      const w = v * gsm;
      updates.weight = formatNum(w);
      updates.length = formatNum(f > 0 ? (v / (f / 1000)) : 0, 1);
    } else if (source === 'length') {
      const a = v * (f / 1000);
      updates.area = formatNum(a);
      updates.weight = formatNum(a * gsm);
    } else if (source === 'format') {
      if (mainPriority === 'length') {
        const l = parseNum(inputs.length);
        const a = l * (v / 1000);
        updates.area = formatNum(a);
        updates.weight = formatNum(a * gsm);
      } else {
        const a = parseNum(inputs.area);
        updates.length = formatNum(v > 0 ? (a / (v / 1000)) : 0, 1);
      }
      
      if (pricePriority === 'mp') {
        const pMp = parseNum(inputs.priceMp);
        const pM2 = v > 0 ? (pMp / (v / 1000)) : 0;
        updates.priceM2 = formatNum(pM2);
        updates.priceKg = formatNum(pM2 * m2kg);
      } else {
        const pM2 = parseNum(updates.priceM2 ?? inputs.priceM2);
        updates.priceMp = formatNum(pM2 * (v / 1000));
      }
    } else if (source === 'priceKg') {
      const pM2 = v / (m2kg || 1);
      updates.priceM2 = formatNum(pM2);
      updates.priceMp = formatNum(pM2 * (f / 1000));
    } else if (source === 'priceM2') {
      updates.priceKg = formatNum(v * m2kg);
      updates.priceMp = formatNum(v * (f / 1000));
    } else if (source === 'priceMp') {
      const pM2 = f > 0 ? (v / (f / 1000)) : 0;
      updates.priceM2 = formatNum(pM2);
      updates.priceKg = formatNum(pM2 * m2kg);
    }

    setInputs(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    if (mainPriority === 'weight') sync('weight', inputs.weight);
    else if (mainPriority === 'length') sync('length', inputs.length);
    else sync('area', inputs.area);

    if (pricePriority === 'kg') sync('priceKg', inputs.priceKg);
    else if (pricePriority === 'm2') sync('priceM2', inputs.priceM2);
    else if (pricePriority === 'mp') sync('priceMp', inputs.priceMp);
  }, [selectedThickness]);

  const numWeight = parseNum(inputs.weight);
  const numArea = parseNum(inputs.area);
  const numLength = parseNum(inputs.length);
  const numPriceKg = parseNum(inputs.priceKg);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      <aside className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900 m-0 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand" /> Таблица ПЭТ
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Табличные данные плотности ПЭТ</p>
          </div>
          
          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ПЭТ толщина (мкм)</label>
            <div className="relative">
              <select 
                value={selectedThickness}
                onChange={(e) => setSelectedThickness(parseFloat(e.target.value))}
                className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-lg font-bold outline-none cursor-pointer appearance-none"
              >
                {data.map(r => <option key={r.thickness} value={r.thickness}>{r.thickness} мкр</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <InputField 
            label="Общий вес (кг)" 
            value={inputs.weight} 
            onChange={(v) => { setMainPriority('weight'); sync('weight', v); }} 
            icon={<Weight className="w-3 h-3 text-brand" />} 
            isActive={mainPriority === 'weight'}
            onClick={() => setMainPriority('weight')}
          />
          <InputField 
            label="Площадь (м²)" 
            value={inputs.area} 
            onChange={(v) => { setMainPriority('area'); sync('area', v); }} 
            icon={<Maximize className="w-3 h-3 text-emerald-600" />} 
            isActive={mainPriority === 'area'}
            onClick={() => setMainPriority('area')}
          />

          <div className="flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ширина (мм)</label>
            <input type="text" value={inputs.format} onChange={(e) => sync('format', e.target.value)} className="h-11 px-3 bg-white border border-slate-200 rounded-lg text-lg font-bold outline-none" />
          </div>

          <InputField 
            label="Длина (м.п.)" 
            value={inputs.length} 
            onChange={(v) => { setMainPriority('length'); sync('length', v); }} 
            icon={<Scissors className="w-3 h-3 text-indigo-600" />} 
            isActive={mainPriority === 'length'}
            onClick={() => setMainPriority('length')}
          />
        </div>
      </aside>

      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em] mb-4 block">Характеристика ПЭТ</label>
              <div className="text-5xl font-black text-slate-900 mb-2 whitespace-nowrap">
                ПЭТ {selectedThickness} <span className="text-2xl font-normal text-slate-500">мкр</span>
              </div>
            </div>
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Вес 1м²:</span><span className="text-lg font-bold font-mono">{displayRU(record.weightPerM2, 4)} гр</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-text-muted">Квадратов в 1кг:</span><span className="text-lg font-bold font-mono">{displayRU(record.m2PerKg, 2)} м²</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-slate-900 text-white border border-slate-800 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 block">Итоговый метраж</label>
              <div className="text-5xl font-black font-mono tracking-tighter text-amber-400">{displayRU(numLength, 1)}</div>
              <div className="text-xl font-medium mt-1 text-slate-300">погонных метров (м.п.)</div>
            </div>
            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400"><span>При ширине формата {inputs.format} мм</span></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ResultSmallCard label="Общий вес" value={displayRU(numWeight, 2)} unit="кг" icon={<Weight className="w-5 h-5 text-brand" />} />
          <ResultSmallCard label="Общая площадь" value={displayRU(numArea, 2)} unit="м²" icon={<Maximize className="w-5 h-5 text-emerald-600" />} />
          <ResultSmallCard label="Количество м.п." value={displayRU(numLength, 0)} unit="м.п." icon={<Scissors className="w-5 h-5 text-indigo-600" />} />
        </div>
      </div>
    </div>
  );
};

function InputField({ label, value, onChange, icon, isActive, onClick }: { label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, isActive?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex flex-col gap-1.5 p-3 border rounded-xl shadow-sm cursor-pointer ${isActive ? 'bg-blue-50/50 border-blue-300 ring-2 ring-brand/10' : 'bg-white border-slate-200'}`}
    >
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">{icon}{label}</label>
        {isActive && <div className="w-1.5 h-1.5 bg-brand rounded-full" />}
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full bg-transparent text-xl font-bold font-mono text-slate-900 outline-none" />
    </div>
  );
}

function ResultSmallCard({ label, value, unit, icon }: { label: string, value: string, unit: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-[1.5rem] p-5 shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 bg-slate-50">{icon}</div>
      <div className="flex flex-col">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</label>
        <div className="flex items-baseline gap-1">
          <div className="text-xl font-black text-slate-900 font-mono tracking-tight">{value}</div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
        </div>
      </div>
    </div>
  );
}
