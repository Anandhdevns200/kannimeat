import type { Company, Product } from '../models';

export const COMPANIES: Company[] = [
  {
    id: 'CMP-001', name: 'Tindivanam Fresh Foods Private Limited', city: 'Tindivanam', founded: '2018',
    gstin: '33AAKCM1234F1Z5', status: 'active',
    shops: [
      { id: 'SH-001', name: 'Fresh Meat Centre', city: 'Tindivanam', area: 'Anna Salai', companyId: 'CMP-001', managerName: 'Murugan Selvam', managerPhone: '+91 98430 22110', status: 'active', rating: 4.8, ordersToday: 24, revenueThisMonth: 842000 },
      { id: 'SH-002', name: 'Sri Chicken & Mutton', city: 'Tindivanam', area: 'Bus Stand Road', companyId: 'CMP-001', managerName: 'Rathna Kumar', managerPhone: '+91 98430 22111', status: 'active', rating: 4.6, ordersToday: 31, revenueThisMonth: 615000 },
      { id: 'SH-003', name: 'Local Fresh Foods', city: 'Villupuram', area: 'Santhapet', companyId: 'CMP-001', managerName: 'Pandi Laundry', managerPhone: '+91 98430 22112', status: 'active', rating: 4.7, ordersToday: 19, revenueThisMonth: 498000 },
      { id: 'SH-004', name: 'Santhapet Meat Mart', city: 'Villupuram', area: 'Nellikuppam Road', companyId: 'CMP-001', managerName: 'Selvaraj', managerPhone: '+91 98430 22113', status: 'inactive', rating: 4.2, ordersToday: 0, revenueThisMonth: 120000 },
    ],
  },
  {
    id: 'CMP-002', name: 'Villupuram Fresh Retail LLP', city: 'Villupuram', founded: '2020',
    gstin: '33AACMC9876K1Z2', status: 'active',
    shops: [
      { id: 'SH-005', name: 'Central Meat Shop', city: 'Villupuram', area: 'Hospital Road', companyId: 'CMP-002', managerName: 'Ganesh', managerPhone: '+91 99440 11223', status: 'active', rating: 4.5, ordersToday: 17, revenueThisMonth: 382000 },
      { id: 'SH-006', name: 'Koottinatham Fresh', city: 'Villupuram', area: 'Koottinatham', companyId: 'CMP-002', managerName: 'Senthil', managerPhone: '+91 99440 11224', status: 'active', rating: 4.3, ordersToday: 12, revenueThisMonth: 264000 },
    ],
  },
  {
    id: 'CMP-003', name: 'Villupuram Quality Meats', city: 'Villupuram', founded: '2021',
    gstin: '33AACCS7654H1Z9', status: 'suspended',
    shops: [
      { id: 'SH-007', name: 'Hospital Road Meat House', city: 'Villupuram', area: 'Hospital Road', companyId: 'CMP-003', managerName: 'Kumar', managerPhone: '+91 98765 55443', status: 'active', rating: 4.1, ordersToday: 9, revenueThisMonth: 190000 },
    ],
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'P-001', name: 'Country Chicken Curry Cut', category: 'chicken', emoji: '🐓', pricePerKg: 280,
    freshness: 'Prepared today', quality: 4.8, shopId: 'SH-001', shopName: 'Fresh Meat Centre', shopArea: 'Anna Salai',
    city: 'Tindivanam', description: 'Farm-reared country chicken, cleaned and cut fresh every morning from trusted local farms near Tindivanam.',
    cuts: ['Curry Cut', 'Biryani Cut', 'Boneless', 'Whole'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-002', name: 'Broiler Chicken Curry Cut', category: 'chicken', emoji: '🍗', pricePerKg: 180,
    freshness: 'Prepared today', quality: 4.6, shopId: 'SH-002', shopName: 'Sri Chicken & Mutton', shopArea: 'Bus Stand Road',
    city: 'Tindivanam', description: 'Tender broiler chicken, freshly cut for the day. Perfect for daily family curries.',
    cuts: ['Curry Cut', 'Biryani Cut', 'Boneless'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-003', name: 'Mutton Curry Cut', category: 'mutton', emoji: '🐐', pricePerKg: 720,
    freshness: 'Cut on order', quality: 4.9, shopId: 'SH-001', shopName: 'Fresh Meat Centre', shopArea: 'Anna Salai',
    city: 'Tindivanam', description: 'Premium mutton from locally reared goats, cut fresh on order for maximum tenderness.',
    cuts: ['Curry Cut', 'Biryani Cut', 'Chops', 'Boneless'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-004', name: 'Fresh Vanjaram (Seer) Fish', category: 'fish', emoji: '🐟', pricePerKg: 350,
    freshness: 'Daily catch', quality: 4.7, shopId: 'SH-003', shopName: 'Local Fresh Foods', shopArea: 'Santhapet',
    city: 'Villupuram', description: 'Fresh seer fish from the Puducherry coast delivered daily. Ideal for frying and fish curry.',
    cuts: ['Whole', 'Steak Cut', 'Cleaned'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-005', name: 'Sankara Fish', category: 'fish', emoji: '🐠', pricePerKg: 220,
    freshness: 'Daily catch', quality: 4.5, shopId: 'SH-003', shopName: 'Local Fresh Foods', shopArea: 'Santhapet',
    city: 'Villupuram', description: 'Fresh snapper, perfect for fish curry and fried fish. Cleaned and packed daily.',
    cuts: ['Whole', 'Steak Cut', 'Cleaned'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-006', name: 'Mutton Leg Piece', category: 'mutton', emoji: '🍖', pricePerKg: 760,
    freshness: 'Cut on order', quality: 4.8, shopId: 'SH-002', shopName: 'Sri Chicken & Mutton', shopArea: 'Bus Stand Road',
    city: 'Tindivanam', description: 'Premium mutton leg pieces for special biryanis and festive cooking.',
    cuts: ['Leg Piece', 'Curry Cut'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-007', name: 'Country Chicken Biryani Cut', category: 'chicken', emoji: '🍛', pricePerKg: 280,
    freshness: 'Prepared today', quality: 4.7, shopId: 'SH-001', shopName: 'Fresh Meat Centre', shopArea: 'Anna Salai',
    city: 'Tindivanam', description: 'Country chicken cut into large biryani pieces, ideal for authentic dum biryani.',
    cuts: ['Biryani Cut', 'Curry Cut'], inStock: true, unit: 'KG',
  },
  {
    id: 'P-008', name: 'Fresh Prawns (Medium)', category: 'fish', emoji: '🦐', pricePerKg: 420,
    freshness: 'Daily catch', quality: 4.6, shopId: 'SH-003', shopName: 'Local Fresh Foods', shopArea: 'Santhapet',
    city: 'Villupuram', description: 'Medium-sized fresh prawns, deveined and cleaned. Great for pepper fry and curries.',
    cuts: ['Whole', 'Deveined'], inStock: true, unit: 'KG',
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export const CATEGORY_META: Record<string, { label: string; emoji: string; blurb: string }> = {
  chicken: { label: 'Chicken', emoji: '🐓', blurb: 'Country & broiler chicken, cut to your preference' },
  mutton: { label: 'Mutton', emoji: '🐐', blurb: 'Premium goat meat cut fresh on order' },
  fish: { label: 'Fish', emoji: '🐟', blurb: 'Fresh catch delivered daily from the Puducherry coast' },
};