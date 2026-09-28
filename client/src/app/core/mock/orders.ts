import type { Order, OrderItem, OrderStatus } from '../models';
import { getProductById } from './companies-products';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const todayIdx = new Date().getDay();
export const nextDay = new Date(Date.now() + 86400000);
export const TOMORROW_LABEL = `Tomorrow (${days[(todayIdx + 1) % 7]})`;

function item(productId: string, weightKg: number, cut: string): OrderItem {
  const p = getProductById(productId)!;
  const total = Math.round(p.pricePerKg * weightKg);
  return {
    productId, name: p.name, emoji: p.emoji, weightKg, cutPreference: cut,
    pricePerKg: p.pricePerKg, total,
  };
}

interface OrderSeed {
  id: string;
  customerId: string;
  customer: string;
  phone: string;
  shopId: string;
  shopName: string;
  area: string;
  city: string;
  items: { id: string; kg: number; cut: string }[];
  slot: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  deliveredToday?: boolean;
  deliveryDateLabel?: string;
  deliveryPartnerId?: string;
}

function buildOrder(seed: OrderSeed): Order {
  const items = seed.items.map((i) => item(i.id, i.kg, i.cut));
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const deliveryFee = subtotal > 499 ? 0 : 30;
  const tax = Math.round((subtotal + deliveryFee) * 0.05);
  const total = subtotal + deliveryFee + tax;

  const timeline: { state: OrderStatus; at: string; by: string }[] = [
    { state: 'placed', at: 'Yesterday 6:12 PM', by: 'Customer' },
    { state: 'confirmed', at: 'Yesterday 6:18 PM', by: 'Shop' },
  ];
  const seq: OrderStatus[] = ['processing', 'packed', 'ready', 'out_for_delivery', 'delivered'];
  const cutoff = seq.indexOf(seed.status);
  const stamps = ['6:30 PM', '7:05 PM', '7:40 PM', '8:10 AM', '10:42 AM'];
  seq.slice(0, Math.max(0, cutoff + 1)).forEach((s, idx) => {
    timeline.push({ state: s, at: seed.deliveredToday ? `Today ${stamps[idx + 1]}` : `${seed.deliveryDateLabel ?? TOMORROW_LABEL} ${stamps[idx + 1]}`, by: 'Shop / Delivery' });
  });

  const totalKg = items.reduce((s, i) => s + i.weightKg, 0);
  return {
    id: seed.id, customerId: seed.customerId, customerName: seed.customer, customerPhone: seed.phone,
    shopId: seed.shopId, shopName: seed.shopName, shopArea: seed.area, city: seed.city,
    items,
    deliveryDate: nextDay.toISOString().slice(0, 10),
    deliveryDateLabel: seed.deliveredToday ? 'Today' : TOMORROW_LABEL,
    slotLabel: seed.slot,
    address: `12, Nehru Street, ${seed.area}, ${seed.city} ${seed.city === 'Villupuram' ? '605602' : '604001'}`,
    area: seed.area,
    subtotal, deliveryFee, discount: 0, tax, total,
    paymentMethod: seed.paymentMethod, paymentStatus: seed.paymentStatus,
    status: seed.status, timeline, invoiceId: `INV-2026-${seed.id.slice(4)}`,
    deliveryPartnerId: seed.deliveryPartnerId,
    assigned: !!seed.deliveryPartnerId && seed.status === 'out_for_delivery',
    totalKg,
  };
}

export const ORDERS: Order[] = [
  buildOrder({ id: 'ORD-10245', customerId: 'CUS-001', customer: 'Anand Krishnan', phone: '+91 98425 20011', shopId: 'SH-001', shopName: 'Fresh Meat Centre', area: 'Anna Salai', city: 'Tindivanam', items: [{ id: 'P-001', kg: 2, cut: 'Curry Cut' }], slot: '9:00 AM – 11:00 AM', paymentMethod: 'upi', paymentStatus: 'paid', status: 'processing' }),
  buildOrder({ id: 'ORD-10244', customerId: 'CUS-002', customer: 'Divya Balan', phone: '+91 98425 20012', shopId: 'SH-003', shopName: 'Local Fresh Foods', area: 'Santhapet', city: 'Villupuram', items: [{ id: 'P-004', kg: 1, cut: 'Steak Cut' }, { id: 'P-008', kg: 0.5, cut: 'Deveined' }], slot: '10:00 AM – 12:00 PM', paymentMethod: 'upi', paymentStatus: 'paid', status: 'ready' }),
  buildOrder({ id: 'ORD-10243', customerId: 'CUS-003', customer: 'Priya Raghavan', phone: '+91 98425 20013', shopId: 'SH-002', shopName: 'Sri Chicken & Mutton', area: 'Bus Stand Road', city: 'Tindivanam', items: [{ id: 'P-002', kg: 1, cut: 'Curry Cut' }], slot: '8:00 AM – 10:00 AM', paymentMethod: 'cod', paymentStatus: 'pending', status: 'confirmed' }),
  buildOrder({ id: 'ORD-10242', customerId: 'CUS-004', customer: 'Vignesh S', phone: '+91 98425 20014', shopId: 'SH-001', shopName: 'Fresh Meat Centre', area: 'Anna Salai', city: 'Tindivanam', items: [{ id: 'P-003', kg: 1, cut: 'Biryani Cut' }], slot: '9:00 AM – 11:00 AM', paymentMethod: 'card', paymentStatus: 'paid', status: 'out_for_delivery', deliveredToday: true, deliveryPartnerId: 'DEL-01' }),
  buildOrder({ id: 'ORD-10240', customerId: 'CUS-005', customer: 'Meena Kumari', phone: '+91 98425 20015', shopId: 'SH-002', shopName: 'Sri Chicken & Mutton', area: 'Bus Stand Road', city: 'Tindivanam', items: [{ id: 'P-006', kg: 0.5, cut: 'Leg Piece' }], slot: '12:00 PM – 2:00 PM', paymentMethod: 'upi', paymentStatus: 'paid', status: 'packed' }),
  buildOrder({ id: 'ORD-10238', customerId: 'CUS-006', customer: 'Karthik Raja', phone: '+91 98425 20016', shopId: 'SH-003', shopName: 'Local Fresh Foods', area: 'Santhapet', city: 'Villupuram', items: [{ id: 'P-005', kg: 1.5, cut: 'Steak Cut' }], slot: '8:00 AM – 10:00 AM', paymentMethod: 'cod', paymentStatus: 'paid', status: 'out_for_delivery', deliveredToday: true, deliveryPartnerId: 'DEL-04' }),
  buildOrder({ id: 'ORD-10235', customerId: 'CUS-007', customer: 'Arun Dev', phone: '+91 98425 20017', shopId: 'SH-001', shopName: 'Fresh Meat Centre', area: 'Pudupalayam', city: 'Tindivanam', items: [{ id: 'P-007', kg: 2, cut: 'Biryani Cut' }], slot: '10:00 AM – 12:00 PM', paymentMethod: 'upi', paymentStatus: 'paid', status: 'delivered', deliveredToday: true }),
  buildOrder({ id: 'ORD-10230', customerId: 'CUS-008', customer: 'Revathi Sivakumar', phone: '+91 98425 20018', shopId: 'SH-001', shopName: 'Fresh Meat Centre', area: 'Kamaraj Street', city: 'Tindivanam', items: [{ id: 'P-001', kg: 1, cut: 'Curry Cut' }, { id: 'P-003', kg: 0.5, cut: 'Curry Cut' }], slot: '10:00 AM – 12:00 PM', paymentMethod: 'upi', paymentStatus: 'paid', status: 'delivered', deliveredToday: true }),
  buildOrder({ id: 'ORD-10221', customerId: 'CUS-009', customer: 'Suresh Bala', phone: '+91 98425 20019', shopId: 'SH-002', shopName: 'Sri Chicken & Mutton', area: 'Kelur Road', city: 'Tindivanam', items: [{ id: 'P-002', kg: 1.5, cut: 'Biryani Cut' }], slot: '9:00 AM – 11:00 AM', paymentMethod: 'card', paymentStatus: 'paid', status: 'delivered', deliveredToday: false }),
  buildOrder({ id: 'ORD-10219', customerId: 'CUS-010', customer: 'Lakshmi Narayanan', phone: '+91 98425 20020', shopId: 'SH-003', shopName: 'Local Fresh Foods', area: 'Nellikuppam Road', city: 'Villupuram', items: [{ id: 'P-004', kg: 1, cut: 'Cleaned' }], slot: '8:00 AM – 10:00 AM', paymentMethod: 'cod', paymentStatus: 'pending', status: 'cancelled' }),
  buildOrder({ id: 'ORD-10210', customerId: 'CUS-001', customer: 'Anand Krishnan', phone: '+91 98425 20011', shopId: 'SH-001', shopName: 'Fresh Meat Centre', area: 'Anna Salai', city: 'Tindivanam', items: [{ id: 'P-003', kg: 0.5, cut: 'Curry Cut' }, { id: 'P-001', kg: 1, cut: 'Curry Cut' }], slot: '10:00 AM – 12:00 PM', paymentMethod: 'card', paymentStatus: 'paid', status: 'delivered', deliveredToday: false }),
];

export function getOrderById(id: string): Order | undefined {
  return ORDERS.find((o) => o.id === id);
}

export function getOrdersForCustomer(customerId: string): Order[] {
  return ORDERS.filter((o) => o.customerId === customerId);
}