import {
  SAREE_FABRICS,
  OCCASIONS,
  SAREE_TYPES,
  PATTERNS,
  WORK_EMBELLISHMENTS,
  BORDERS,
  BLOUSE_TYPES,
  BLOUSE_FABRICS,
  LOOM_TYPES,
  COLORS,
  COLOR_FAMILIES,
  COLOR_HEX_MAP,
} from '@/config/catalogueTaxonomy';
import { PublicProduct } from '@/types';

/**
 * MEESHO SOURCE DATA MAPPING ADAPTER
 * Seamlessly converts raw Meesho supplier data fields into SORAYVA's standardized product taxonomy.
 * Preserves original source values in `sourceFabric` and internal mappings.
 */

export interface MeeshoRawInput {
  name?: string;
  title?: string;
  category?: string;
  'Saree Fabric'?: string;
  fabric?: string;
  'Type'?: string;
  sareeType?: string;
  'Occasion'?: string | string[];
  occasion?: string | string[];
  'Print or Pattern Type'?: string;
  'Pattern'?: string;
  pattern?: string;
  'Ornamentation'?: string;
  'Work'?: string;
  work?: string;
  'Border'?: string;
  border?: string;
  'Blouse'?: string;
  'Blouse Type'?: string;
  blouseType?: string;
  'Blouse Fabric'?: string;
  blouseFabric?: string;
  'Loom Type'?: string;
  loomType?: string;
  'Color'?: string;
  'Colour'?: string;
  colour?: string;
  price?: number | string;
  mrp?: number | string;
  image?: string;
  images?: string[];
  [key: string]: any;
}

function findBestMatch(inputValue: string | undefined, validOptions: readonly string[]): string {
  if (!inputValue || typeof inputValue !== 'string') return validOptions[validOptions.length - 1] || 'Other';
  const cleanInput = inputValue.trim().toLowerCase();

  for (const option of validOptions) {
    if (option.toLowerCase() === cleanInput) return option;
  }
  for (const option of validOptions) {
    if (cleanInput.includes(option.toLowerCase()) || option.toLowerCase().includes(cleanInput)) return option;
  }
  return inputValue.trim();
}

function findBestColor(inputColor: string | undefined): { colour: string; colourFamily: string; colourHex: string } {
  if (!inputColor || typeof inputColor !== 'string') {
    return { colour: 'Multicolor', colourFamily: 'Multicolor', colourHex: COLOR_HEX_MAP['Multicolor'] };
  }

  const matchedColor = findBestMatch(inputColor, COLORS);
  let family = 'Multicolor';

  for (const colFam of COLOR_FAMILIES) {
    if (matchedColor.toLowerCase().includes(colFam.toLowerCase())) {
      family = colFam;
      break;
    }
  }

  if (family === 'Multicolor' && (matchedColor === 'Maroon' || matchedColor === 'Wine')) family = 'Red';
  if (family === 'Multicolor' && (matchedColor === 'Peach')) family = 'Pink';
  if (family === 'Multicolor' && (matchedColor === 'Teal' || matchedColor === 'Navy')) family = 'Blue';

  return {
    colour: matchedColor,
    colourFamily: family,
    colourHex: COLOR_HEX_MAP[matchedColor] || COLOR_HEX_MAP[family] || '#800020',
  };
}

export function mapMeeshoToSorayva(raw: MeeshoRawInput): Partial<PublicProduct> {
  const sourceFabricRaw = raw['Saree Fabric'] || raw.fabric || '';
  const standardizedFabric = findBestMatch(sourceFabricRaw, SAREE_FABRICS);
  const displayFabric = sourceFabricRaw ? sourceFabricRaw : standardizedFabric;

  const rawType = raw['Type'] || raw.sareeType || '';
  const sareeType = findBestMatch(rawType, SAREE_TYPES);

  const rawOccasion = raw['Occasion'] || raw.occasion || 'Festive';
  let occasionList: string[] = ['Festive'];

  if (Array.isArray(rawOccasion)) {
    occasionList = (rawOccasion as any[]).map((o) => findBestMatch(String(o), OCCASIONS));
  } else if (typeof rawOccasion === 'string') {
    occasionList = rawOccasion.split(',').map((o) => findBestMatch(o.trim(), OCCASIONS));
  }

  const rawPattern = raw['Print or Pattern Type'] || raw['Pattern'] || raw.pattern || '';
  const pattern = findBestMatch(rawPattern, PATTERNS);

  const rawWork = raw['Ornamentation'] || raw['Work'] || raw.work || '';
  const work = findBestMatch(rawWork, WORK_EMBELLISHMENTS);

  const rawBorder = raw['Border'] || raw.border || '';
  const border = findBestMatch(rawBorder, BORDERS);

  const rawBlouse = raw['Blouse'] || raw['Blouse Type'] || raw.blouseType || '';
  const blouseType = findBestMatch(rawBlouse, BLOUSE_TYPES);

  const rawBlouseFabric = raw['Blouse Fabric'] || raw.blouseFabric || '';
  const blouseFabric = findBestMatch(rawBlouseFabric, BLOUSE_FABRICS);

  const rawLoom = raw['Loom Type'] || raw.loomType || '';
  const loomType = findBestMatch(rawLoom, LOOM_TYPES);

  const colorData = findBestColor(raw['Color'] || raw['Colour'] || raw.colour);

  const name = raw.name || raw.title || `${colorData.colour} ${displayFabric} ${sareeType || 'Saree'}`;

  return {
    name,
    category: 'Sarees',
    subcategory: sareeType,
    sareeType,
    fabric: standardizedFabric,
    sourceFabric: sourceFabricRaw,
    displayFabric,
    occasion: occasionList,
    pattern,
    work: [work],
    border,
    blouseType,
    blouseFabric,
    loomType,
    colour: colorData.colour,
    colourFamily: colorData.colourFamily,
    colourHex: colorData.colourHex,
  };
}
