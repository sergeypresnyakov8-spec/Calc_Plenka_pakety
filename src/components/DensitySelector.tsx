import React from 'react';
import { Gauge } from 'lucide-react';

interface DensitySelectorProps {
  density: number;
  onChange: (density: number) => void;
  className?: string;
}

export const DensitySelector: React.FC<DensitySelectorProps> = ({ density, onChange, className = '' }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) onChange(val);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value.replace(',', '.'));
    if (!isNaN(val)) {
      if (val < 0.80) val = 0.80;
      if (val > 1.50) val = 1.50;
      onChange(Math.round(val * 1000) / 1000);
    }
  };

  return (
    <div className={`flex items-center gap-2 bg-slate-100/90 hover:bg-slate-100 border border-slate-200/90 rounded-2xl p-1.5 px-3 shadow-inner transition-all ${className}`}>
      <div className="flex items-center gap-1.5 shrink-0">
        <Gauge className="w-4 h-4 text-brand" />
        <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight hidden sm:inline">
          Плотность:
        </span>
      </div>

      <input
        type="range"
        min="0.80"
        max="1.50"
        step="0.01"
        value={density}
        onChange={handleSliderChange}
        className="w-20 sm:w-28 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-brand"
        title="Регулировка плотности 0.80 - 1.50 г/см³"
      />

      <div className="flex items-center gap-1 bg-white px-2 py-0.5 border border-slate-300 rounded-lg shadow-sm shrink-0">
        <input
          type="number"
          step="0.01"
          min="0.80"
          max="1.50"
          value={density}
          onChange={handleInputChange}
          className="w-12 font-mono font-extrabold text-brand text-xs text-right outline-none"
        />
        <span className="text-[10px] text-slate-500 font-bold">г/см³</span>
      </div>
    </div>
  );
};
