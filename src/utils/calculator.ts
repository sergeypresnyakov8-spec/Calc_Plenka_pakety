// Formatting utilities
export const formatInputValue = (val: string): string => {
  if (!val) return "";
  let raw = val.replace(/\s/g, '').replace(/\./g, ',').replace(/[^\d,]/g, '');
  if (!raw) return "";
  const parts = raw.split(',');
  let intP = parts[0];
  if (intP === '') intP = '0';
  else if (intP.length > 1 && intP.startsWith('0') && intP !== '0') {
    intP = parseInt(intP, 10).toString();
  }
  let formattedInt = intP.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  if (parts.length > 1) {
    return `${formattedInt},${parts.slice(1).join('')}`;
  }
  return formattedInt;
};

export const parseNum = (val: string | number): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const normalized = val.toString().replace(',', '.').replace(/\s|\u00A0|\u202F/g, '');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

export const formatNum = (num: number, decimals: number = 2, showEmpty: boolean = true): string => {
  if (num === 0 && showEmpty) return "";
  return num.toLocaleString('ru-RU', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: decimals,
    useGrouping: true
  }).replace(/\s|\u00A0|\u202F/g, ' ');
};

export const displayRU = (num: number, dec: number = 2): string => 
  num.toLocaleString('ru-RU', { 
    minimumFractionDigits: dec, 
    maximumFractionDigits: dec,
    useGrouping: true
  }).replace(/\s|\u00A0|\u202F/g, ' ');

// Calculations for LDPE Film
export function calculateFilmUnfoldedWidthMeter(
  filmType: 'sleeve' | 'sheet',
  formatMm: number,
  gussetMm: number = 0
): number {
  const f = formatMm / 1000; // to meters
  switch (filmType) {
    case 'sleeve':
      return f * 2;
    case 'sheet':
      return f;
    default:
      return f * 2;
  }
}

// GSM (weight in g/m² for single layer)
export function calculateFilmGSM(thicknessMicrons: number, density: number): number {
  return thicknessMicrons * density;
}

// m² per 1 kg of single-layer film
export function calculateM2PerKg(thicknessMicrons: number, density: number): number {
  const gsm = calculateFilmGSM(thicknessMicrons, density);
  return gsm > 0 ? 1000 / gsm : 0;
}

// Calculations for Courier Bags
export interface BagCalcResult {
  heightCutMm: number; // total flat length of cut film
  bagAreaM2: number; // area of 1 bag film
  bagWeightGrams: number; // weight of 1 bag in grams
  bagWeightKg: number; // weight of 1 bag in kg
  bagsPerKg: number; // pcs in 1 kg
  
  // Batch
  totalFilmWeightKg: number; // film required
  totalFilmAreaM2: number; // total m²
  linearMetersTube: number; // linear meters of sleeve/tube needed
}

export function calculateCourierBag(
  density: number,
  thickness: number,
  widthMm: number,
  heightMm: number,
  flapMm: number,
  bottomGussetMm: number,
  quantityPcs: number
): BagCalcResult {
  // Height of film cut per bag = 2*Height + Flap + 2*BottomGusset
  const heightCutMm = (2 * heightMm) + flapMm + (2 * bottomGussetMm);
  const bagAreaM2 = (widthMm / 1000) * (heightCutMm / 1000);
  
  // Single bag weight: Area * GSM
  const gsm = calculateFilmGSM(thickness, density); // g/m²
  const bagWeightGrams = bagAreaM2 * gsm;
  const bagWeightKg = bagWeightGrams / 1000;
  const bagsPerKg = bagWeightGrams > 0 ? 1000 / bagWeightGrams : 0;
  
  // Batch production
  const totalFilmWeightKg = quantityPcs * bagWeightKg;
  const totalFilmAreaM2 = quantityPcs * bagAreaM2;
  
  // Linear meters of sleeve needed on machine
  const lengthPerBagMm = heightMm + (flapMm / 2) + bottomGussetMm;
  const linearMetersTube = quantityPcs * (lengthPerBagMm / 1000);
  
  return {
    heightCutMm,
    bagAreaM2,
    bagWeightGrams,
    bagWeightKg,
    bagsPerKg,
    totalFilmWeightKg,
    totalFilmAreaM2,
    linearMetersTube
  };
}
