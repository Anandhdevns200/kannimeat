import type { InjectionToken } from '@angular/core';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export type Category = 'chicken' | 'mutton' | 'fish';
export type OrderStatus =
  | 'placed' | 'confirmed' | 'processing' | 'packed' | 'ready'
  | 'out_for_delivery' | 'delivered' | 'cancelled' | 'failed';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export type UserRole =
  | 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SHOP_ADMIN' | 'SHOP_STAFF'
  | 'DELIVERY_MANAGER' | 'DELIVERY_PARTNER' | 'CUSTOMER';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  ready: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

export const STATUS_ORDER: OrderStatus[] = [
  'placed', 'confirmed', 'processing', 'packed', 'ready', 'out_for_delivery', 'delivered',
];
export const ORDER_STATUS_SEQ = STATUS_ORDER;

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------
export interface Product {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  pricePerKg: number;
  freshness: string;
  quality: number;
  shopId: string;
  shopName: string;
  shopArea: string;
  city: string;
  description: string;
  cuts: string[];
  inStock: boolean;
  unit: string;
}

export interface CartItem {
  product: Product;
  quantityKg: number;
  cutPreference: string;
  lineId: string;
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  area: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export interface DeliverySlot {
  id: string;
  label: string;
  window: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  emoji: string;
  weightKg: number;
  cutPreference: string;
  pricePerKg: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  shopArea: string;
  city: string;
  items: OrderItem[];
  deliveryDate: string;
  deliveryDateLabel: string;
  slotLabel: string;
  address: string;
  area: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  timeline: { state: OrderStatus; at: string; by: string }[];
  invoiceId: string;
  deliveryPartnerId?: string;
  assigned?: boolean;
  totalKg: number;
}

export interface Shop {
  id: string;
  name: string;
  city: string;
  area: string;
  companyId: string;
  managerName: string;
  managerPhone: string;
  status: 'active' | 'inactive';
  rating: number;
  ordersToday: number;
  revenueThisMonth: number;
}

export interface Company {
  id: string;
  name: string;
  city: string;
  founded: string;
  gstin: string;
  status: 'active' | 'suspended';
  shops: Shop[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  shopId: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface InventoryItem {
  id: string;
  product: string;
  category: Category;
  emoji: string;
  availableKg: number;
  reservedKg: number;
  expectedDemandKg: number;
  unitPricePerKg: number;
  shopId: string;
}

export type StockLevel = 'in_stock' | 'low' | 'out';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  city: string;
  area: string;
  vehicle: string;
  status: 'active' | 'inactive';
  completed: number;
  rating: number;
}

export interface Invoice {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  shopName: string;
  address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  date: string;
}

export interface Notification {
  id: string;
  role: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
}

export interface ActivityLogItem {
  state: OrderStatus;
  at: string;
}

export interface SystemUser {
  id: string;
  name: string;
  role: UserRole;
  org?: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface RevenuePoint { day: string; value: number; }
export interface CategorySales { name: string; value: number; }
export interface CityDistribution { city: string; orders: number; revenue: number; }

export interface MetricCard {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  icon: string;
}

// ---------------------------------------------------------------------------
// DI tokens so real HTTP services can replace the mock implementation later
// ---------------------------------------------------------------------------
export interface ProductServiceContract {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getByCategory(category: Category): Promise<Product[]>;
  getPopular(): Promise<Product[]>;
}

export interface ShopServiceContract {
  getShops(): Promise<Shop[]>;
  getShopsNear(location: LocationInfo): Promise<Shop[]>;
}

export interface LocationInfo {
  area: string;
  city: string;
  pincode: string;
}

export interface Token { label: string; value: unknown; }