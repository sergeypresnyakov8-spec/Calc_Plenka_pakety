import React from 'react';
import { Layers } from 'lucide-react';

interface BagVisualizerProps {
  widthMm: number;
  heightMm: number;
  flapMm: number;
  bottomGussetMm: number;
  thickness: number;
  density: number;
  weightGrams: number;
}

export const BagVisualizer: React.FC<BagVisualizerProps> = ({
  widthMm,
  heightMm,
  flapMm,
  bottomGussetMm,
  thickness,
  density,
  weightGrams,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-slate-700">
      <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center text-brand">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Чертеж Курьерского Пакета</h3>
            <p className="text-xs text-slate-400">Схема раскроя и технологические клапаны</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-black">
            {thickness} мкм ({density} г/см³)
          </span>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="my-6 flex items-center justify-center min-h-[230px]">
        <svg viewBox="0 0 380 250" className="w-full max-w-[360px] h-auto drop-shadow-2xl">
          <defs>
            <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
            </linearGradient>
            <pattern id="gridPattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="380" height="250" fill="url(#gridPattern)" rx="12" />

          {/* Bag Body Outline */}
          <g transform="translate(45, 25)">
            {/* Top Flap / Valve */}
            <path
              d="M 10 0 L 190 0 C 195 0, 195 24, 190 28 L 10 28 C 5 24, 5 0, 10 0 Z"
              fill="rgba(56, 189, 248, 0.35)"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="5 3"
            />

            {/* Main Bag Envelope */}
            <rect
              x="10"
              y="28"
              width="180"
              height="145"
              rx="2"
              fill="url(#bagGrad)"
              stroke="#38bdf8"
              strokeWidth="2.5"
            />

            {/* Weld Seams (Side Seams) */}
            <line x1="10" y1="28" x2="10" y2="173" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="3 3" />
            <line x1="190" y1="28" x2="190" y2="173" stroke="#0284c7" strokeWidth="3.5" strokeDasharray="3 3" />

            {/* Bottom Gusset Fold if present */}
            {bottomGussetMm > 0 && (
              <g>
                <path
                  d="M 10 173 L 30 155 L 170 155 L 190 173 Z"
                  fill="rgba(234, 179, 8, 0.25)"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <text x="100" y="167" fill="#facc15" fontSize="10" fontWeight="800" textAnchor="middle">
                  Донный фальц ({bottomGussetMm} мм)
                </text>
              </g>
            )}

            {/* Dimension Lines */}
            {/* Width arrow */}
            <line x1="10" y1="188" x2="190" y2="188" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 10 185 L 3 188 L 10 191 M 190 185 L 197 188 L 190 191" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
            <text x="100" y="206" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle">
              Ширина: {widthMm} мм
            </text>

            {/* Height arrow */}
            <line x1="204" y1="28" x2="204" y2="173" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 201 28 L 204 21 L 207 28 M 201 173 L 204 180 L 207 173" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
            <text x="220" y="100" fill="#ffffff" fontSize="13" fontWeight="900" textAnchor="middle" transform="rotate(90, 220, 100)">
              Высота: {heightMm} мм
            </text>

            {/* Flap arrow */}
            <line x1="204" y1="0" x2="204" y2="28" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M 201 0 L 204 -3 L 207 0 M 201 28 L 204 31 L 207 28" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
            <text x="214" y="18" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="start">
              Клапан: +{flapMm} мм
            </text>
          </g>
        </svg>
      </div>

      {/* Bag Quick Spec Footer */}
      <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 text-center">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">Размер раскроя</span>
          <span className="text-sm font-black font-mono text-amber-400">
            {widthMm} × {heightMm + flapMm + bottomGussetMm * 2} мм
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">Вес 1 пакета</span>
          <span className="text-sm font-black font-mono text-emerald-400">
            {weightGrams.toFixed(2)} г
          </span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">Выход из 1 кг</span>
          <span className="text-sm font-black font-mono text-brand">
            ~{weightGrams > 0 ? Math.round(1000 / weightGrams) : 0} шт
          </span>
        </div>
      </div>
    </div>
  );
};

