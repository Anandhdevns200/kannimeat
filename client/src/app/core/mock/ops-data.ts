import type { DeliveryPartner, Employee, InventoryItem, Invoice, Notification, SystemUser } from '../models';
import { ORDERS } from './orders';

export const INVENTORY: InventoryItem[] = [
  { id: 'INV-001', product: 'Country Chicken', category: 'chicken', emoji: '🐓', availableKg: 40, reservedKg: 14, expectedDemandKg: 46, unitPricePerKg: 280, shopId: 'SH-001' },
  { id: 'INV-002', product: 'Broiler Chicken', category: 'chicken', emoji: '🍗', availableKg: 35, reservedKg: 18, expectedDemandKg: 40, unitPricePerKg: 180, shopId: 'SH-002' },
  { id: 'INV-003', product: 'Mutton', category: 'mutton', emoji: '🐐', availableKg: 25, reservedKg: 8, expectedDemandKg: 22, unitPricePerKg: 720, shopId: 'SH-001' },
  { id: 'INV-004', product: 'Vanjaram Fish', category: 'fish', emoji: '🐟', availableKg: 30, reservedKg: 10, expectedDemandKg: 28, unitPricePerKg: 350, shopId: 'SH-003' },
  { id: 'INV-005', product: 'Sankara Fish', category: 'fish', emoji: '🐠', availableKg: 6, reservedKg: 4, expectedDemandKg: 12, unitPricePerKg: 220, shopId: 'SH-003' },
  { id: 'INV-006', product: 'Prawns', category: 'fish', emoji: '🦐', availableKg: 8, reservedKg: 3, expectedDemandKg: 9, unitPricePerKg: 420, shopId: 'SH-003' },
  { id: 'INV-007', product: 'Mutton Leg', category: 'mutton', emoji: '🍖', availableKg: 0, reservedKg: 0, expectedDemandKg: 6, unitPricePerKg: 760, shopId: 'SH-002' },
];

export const EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Murugan Selvam', role: 'Shop Admin', shopId: 'SH-001', phone: '+91 98430 22110', status: 'active' },
  { id: 'EMP-002', name: 'Vel Murugan', role: 'Shop Staff — Cutting', shopId: 'SH-001', phone: '+91 98430 22114', status: 'active' },
  { id: 'EMP-003', name: 'Arasu Kumar', role: 'Shop Staff — Packing', shopId: 'SH-001', phone: '+91 98430 22115', status: 'active' },
  { id: 'EMP-004', name: 'Rathna Kumar', role: 'Shop Admin', shopId: 'SH-002', phone: '+91 98430 22111', status: 'active' },
  { id: 'EMP-005', name: 'Pandi Laundry', role: 'Shop Admin', shopId: 'SH-003', phone: '+91 98430 22112', status: 'active' },
  { id: 'EMP-006', name: 'Ganesh Ravichandran', role: 'Shop Admin', shopId: 'SH-005', phone: '+91 99440 11223', status: 'active' },
];

export const DELIVERY_PARTNERS: DeliveryPartner[] = [
  { id: 'DEL-01', name: 'Ravi Shankar', phone: '+91 90030 11121', city: 'Tindivanam', area: 'Anna Salai', vehicle: 'Bike TN31 AA 4421', status: 'active', completed: 1284, rating: 4.7 },
  { id: 'DEL-02', name: 'Kumar Perumal', phone: '+91 90030 11122', city: 'Tindivanam', area: 'Bus Stand Road', vehicle: 'Bike TN31 BN 8820', status: 'active', completed: 967, rating: 4.5 },
  { id: 'DEL-03', name: 'Arjun Prakash', phone: '+91 90030 11123', city: 'Villupuram', area: 'Santhapet', vehicle: 'Scooty TN31 CQ 1123', status: 'active', completed: 742, rating: 4.4 },
  { id: 'DEL-04', name: 'Sathish Govind', phone: '+91 90030 11124', city: 'Tindivanam', area: 'Pudupalayam', vehicle: 'Bike PY01 D 5567', status: 'active', completed: 1501, rating: 4.9 },
  { id: 'DEL-05', name: 'Mani Rathnam', phone: '+91 90030 11125', city: 'Villupuram', area: 'Hospital Road', vehicle: 'Bike TN31 FJ 9034', status: 'inactive', completed: 415, rating: 4.1 },
];

export const INVOICES: Invoice[] = ORDERS.map((o) => ({
  id: o.invoiceId,
  orderId: o.id,
  customerName: o.customerName,
  customerPhone: o.customerPhone,
  shopName: o.shopName,
  address: o.address,
  city: o.city,
  items: o.items,
  subtotal: o.subtotal,
  deliveryFee: o.deliveryFee,
  discount: o.discount,
  tax: o.tax,
  total: o.total,
  paymentStatus: o.paymentStatus,
  paymentMethod: o.paymentMethod,
  date: o.deliveryDate,
}));

export const NOTIFICATIONS: Notification[] = [
  { id: 'N-01', role: 'customer', title: 'Order packed', body: 'Your order #ORD-10245 has been packed by Fresh Meat Centre.', time: '10 min ago', read: false, icon: '📦' },
  { id: 'N-02', role: 'shop', title: 'New orders for tomorrow', body: '8 new orders received for tomorrow. Total demand 14.5 KG.', time: '20 min ago', read: false, icon: '🛒' },
  { id: 'N-03', role: 'delivery_manager', title: 'Orders ready to assign', body: '5 orders are ready for delivery assignment.', time: '35 min ago', read: false, icon: '🚚' },
  { id: 'N-04', role: 'delivery_partner', title: 'New delivery assigned', body: 'Order #ORD-10242 assigned to you — Anna Salai slot 9-11 AM.', time: '1 hr ago', read: false, icon: '📬' },
  { id: 'N-05', role: 'company_admin', title: 'Tindivanam shops performance', body: 'Tindivanam shops crossed ₹1.9L revenue this week.', time: '2 hrs ago', read: true, icon: '📈' },
  { id: 'N-06', role: 'super_admin', title: 'New company onboarding', body: 'Villupuram Meats Co has completed onboarding request.', time: '3 hrs ago', read: true, icon: '🏢' },
];

export const SYSTEM_USERS: SystemUser[] = [
  { id: 'U-001', name: 'Rajendran V', role: 'SUPER_ADMIN', org: 'Kanni Meats HQ', phone: '+91 90000 00001', status: 'active' },
  { id: 'U-002', name: 'Santhosh Kumar', role: 'COMPANY_ADMIN', org: 'Tindivanam Fresh Foods', phone: '+91 90000 00002', status: 'active' },
  { id: 'U-003', name: 'Murugan Selvam', role: 'SHOP_ADMIN', org: 'Fresh Meat Centre', phone: '+91 90000 00003', status: 'active' },
  { id: 'U-004', name: 'Rathna Kumar', role: 'SHOP_ADMIN', org: 'Sri Chicken & Mutton', phone: '+91 90000 00004', status: 'active' },
  { id: 'U-005', name: 'Vel Murugan', role: 'SHOP_STAFF', org: 'Fresh Meat Centre', phone: '+91 90000 00005', status: 'active' },
  { id: 'U-006', name: 'Divya Balaji', role: 'DELIVERY_MANAGER', org: 'Tindivanam Hub', phone: '+91 90000 00006', status: 'active' },
  { id: 'U-007', name: 'Ravi Shankar', role: 'DELIVERY_PARTNER', org: 'Anna Salai, Tindivanam', phone: '+91 90000 00007', status: 'active' },
  { id: 'U-008', name: 'Anand Krishnan', role: 'CUSTOMER', org: 'Anna Salai, Tindivanam', phone: '+91 98425 20011', status: 'active' },
];

export const DAILY_ORDER_TREND = [
  { day: 'Mon', orders: 142, value: 41000 },
  { day: 'Tue', orders: 168, value: 52000 },
  { day: 'Wed', orders: 155, value: 47000 },
  { day: 'Thu', orders: 210, value: 69000 },
  { day: 'Fri', orders: 244, value: 84000 },
  { day: 'Sat', orders: 301, value: 112000 },
  { day: 'Sun', orders: 275, value: 98000 },
];

export const CITY_DISTRIBUTION = [
  { city: 'Tindivanam', orders: 468, revenue: 208000 },
  { city: 'Villupuram', orders: 312, revenue: 134000 },
];

export const CATEGORY_SALES = [
  { name: 'Chicken', value: 58 },
  { name: 'Mutton', value: 27 },
  { name: 'Fish', value: 15 },
];