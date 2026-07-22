export type FilmType = 'sleeve' | 'sheet';

export interface PETRecord {
  thickness: number; // мкр
  weightPerM2: number; // гр
  m2PerKg: number; // кол-во м2 в 1кг
}

export interface FilmCalcInputs {
  density: number; // g/cm³ (default 0.95)
  thickness: number; // microns (мкм)
  filmType: FilmType;
  format: string; // width in mm
  weight: string; // kg
  area: string; // m²
  length: string; // linear meters (м.п.)
}

export interface CourierBagInputs {
  density: number; // g/cm³ (default 0.95)
  thickness: number; // microns (мкм)
  width: string; // mm
  height: string; // mm
  flap: string; // mm (клапан)
  bottomGusset: string; // mm (донный фальц)
  quantityPcs: string; // pcs (тираж, шт)
  quantityKg: string; // kg (тираж, кг)
}

export interface CourierBagPreset {
  id: string;
  name: string;
  code: string;
  width: number;
  height: number;
  flap: number;
  bottomGusset: number;
  thickness: number;
  density: number;
}
