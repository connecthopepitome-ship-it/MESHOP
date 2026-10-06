/**
 * CENTRAL CATALOGUE TAXONOMY CONFIGURATION
 * Meesho-compatible taxonomy structure with SORAYVA Luxury Brand Standards.
 * Single Source of Truth for all filters, dropdowns, navigation, search normalization, and admin editor forms.
 */

export const PRIMARY_CATEGORY = 'Sarees';

/**
 * 1. Core Saree Types (Subcategory / Type)
 * Meesho-compatible primary type taxonomy
 */
export const CORE_SAREE_TYPES = [
  'Fancy Sarees',
  'Daily Wear Sarees',
  'Party Wear Sarees',
  'Wedding Sarees',
  'Festive Sarees',
  'Designer Sarees',
  'Printed Sarees',
  'Embroidered Sarees',
  'Traditional Sarees',
  'Bollywood Style Sarees',
  'Ready-to-Wear Sarees',
  'Pre-Stitched Sarees',
  'Silk Sarees',
  'Cotton Sarees',
  'Georgette Sarees',
  'Chiffon Sarees',
  'Organza Sarees',
  'Net Sarees',
  'Crepe Sarees',
  'Banarasi Sarees',
  'Bandhani Sarees',
  'Linen Sarees',
] as const;

/**
 * 2. Saree Fabric System
 * Standardized fabric names with source preservation
 */
export const SAREE_FABRICS = [
  'Cotton',
  'Georgette',
  'Chiffon',
  'Organza',
  'Silk',
  'Banarasi Silk',
  'Art Silk',
  'Linen',
  'Net',
  'Crepe',
  'Chiffon Silk',
  'Viscose',
  'Rayon',
  'Jacquard',
  'Chanderi',
  'Kanjivaram / Kanchipuram',
  'Tissue',
  'Satin',
  'Velvet',
  'Brasso',
  'Modal',
  'Poly Silk',
  'Other',
] as const;

/**
 * 3. Customer Occasions
 * Multi-selectable occasion tags
 */
export const OCCASIONS = [
  'Daily',
  'Casual',
  'Office',
  'Party',
  'Festive',
  'Wedding',
  'Reception',
  'Engagement',
  'Haldi',
  'Mehendi',
  'Sangeet',
  'Traditional',
  'Puja',
  'Bridal',
  'Summer',
  'Travel',
  'Special Occasion',
] as const;

/**
 * 4. Saree Type Filter (Specific Wear/Type attribute)
 */
export const SAREE_TYPES = [
  'Fancy',
  'Designer',
  'Daily Wear',
  'Party Wear',
  'Wedding Wear',
  'Traditional',
  'Bollywood',
  'Printed',
  'Embroidered',
  'Ready-to-Wear',
  'Pre-Stitched',
  'Traditional Silk',
  'Cotton',
  'Banarasi',
  'Bandhani',
  'Handloom',
  'Hand Block Print',
] as const;

/**
 * 5. Pattern / Print Taxonomy
 */
export const PATTERNS = [
  'Solid',
  'Printed',
  'Floral',
  'Geometric',
  'Abstract',
  'Striped',
  'Checks',
  'Polka',
  'Paisley',
  'Animal',
  'Traditional',
  'Ethnic',
  'Butta',
  'Digital Print',
  'Foil Print',
  'Colorblocked',
  'Embroidered',
  'Embellished',
  'Woven Design',
  'Jacquard',
] as const;

/**
 * 6. Work & Embellishment
 */
export const WORK_EMBELLISHMENTS = [
  'Embroidery',
  'Zari',
  'Sequins',
  'Stone Work',
  'Mirror Work',
  'Lace',
  'Tassels',
  'Latkans',
  'Foil Print',
  'Thread Work',
  'Aari Work',
  'Zardozi',
  'Bead Work',
  'Cutdana',
  'Pearl Work',
  'Applique',
  'Block Print',
  'Hand Painted',
  'Woven',
  'Jacquard',
  'Embellished',
  'Plain',
] as const;

/**
 * 7. Border Type
 */
export const BORDERS = [
  'No Border',
  'Small Border',
  'Big Border',
  'Zari Border',
  'Lace Border',
  'Printed Border',
  'Embroidered Border',
  'Embellished Border',
  'Temple Border',
  'Contrast Border',
] as const;

/**
 * 8. Blouse Type
 */
export const BLOUSE_TYPES = [
  'Separate Blouse Piece',
  'Running Blouse',
  'Unstitched Blouse',
  'Semi-Stitched Blouse',
  'Stitched Blouse',
  'No Blouse',
] as const;

/**
 * 9. Blouse Fabric
 */
export const BLOUSE_FABRICS = [
  'Cotton',
  'Georgette',
  'Chiffon',
  'Organza',
  'Art Silk',
  'Silk',
  'Bangalori Silk',
  'Poly Silk',
  'Same as Saree',
  'Other',
] as const;

/**
 * 10. Loom Type
 */
export const LOOM_TYPES = [
  'Handloom',
  'Powerloom',
  'Other',
  'Not Specified',
] as const;

/**
 * 11. Color System & Color Family
 */
export const COLORS = [
  'Maroon',
  'Red',
  'Pink',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Black',
  'White',
  'Cream',
  'Beige',
  'Brown',
  'Grey',
  'Gold',
  'Silver',
  'Peach',
  'Wine',
  'Navy',
  'Teal',
  'Magenta',
  'Multicolor',
] as const;

export const COLOR_FAMILIES = [
  'Red',
  'Pink',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Black',
  'White',
  'Neutral',
  'Brown',
  'Gold',
  'Silver',
  'Multicolor',
] as const;

export const COLOR_HEX_MAP: Record<string, string> = {
  Red: '#C8102E',
  Maroon: '#800020',
  Pink: '#FF69B4',
  'Blush Pink': '#FFB6C1',
  Blue: '#1F4E79',
  Navy: '#000080',
  Teal: '#008080',
  Green: '#2E7D32',
  Emerald: '#50C878',
  Yellow: '#FFD700',
  Orange: '#FF7F50',
  Purple: '#6A0D91',
  Magenta: '#FF00FF',
  Black: '#1C1C1C',
  White: '#FFFFFF',
  Cream: '#FFFDD0',
  Beige: '#F5F5DC',
  Brown: '#5C4033',
  Grey: '#808080',
  Gold: '#D4AF37',
  Silver: '#C0C0C0',
  Peach: '#FFDAB9',
  Wine: '#722F37',
  Multicolor: 'linear-gradient(45deg, #FF69B4, #FFD700, #50C878, #1F4E79)',
};

/**
 * 12. Standard Selling Price Ranges
 */
export const PRICE_RANGES = [
  { label: 'Under ₹499', min: 0, max: 499 },
  { label: '₹500 – ₹999', min: 500, max: 999 },
  { label: '₹1,000 – ₹1,499', min: 1000, max: 1499 },
  { label: '₹1,500 – ₹2,499', min: 1500, max: 2499 },
  { label: '₹2,500 – ₹4,999', min: 2500, max: 4999 },
  { label: '₹5,000 – ₹9,999', min: 5000, max: 9999 },
  { label: '₹10,000+', min: 10000, max: 1000000 },
] as const;

/**
 * 13. Rating Options
 */
export const RATING_OPTIONS = [
  { label: '4★ & above', minRating: 4.0 },
  { label: '3★ & above', minRating: 3.0 },
  { label: '2★ & above', minRating: 2.0 },
] as const;

/**
 * 14. Availability Options
 */
export const AVAILABILITY_OPTIONS = [
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
] as const;

/**
 * 15. Standard E-commerce Sort Options
 */
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_low_high', label: 'Price — Low to High' },
  { value: 'price_high_low', label: 'Price — High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'discount', label: 'Discount' },
  { value: 'bestseller', label: 'Best Selling' },
] as const;
