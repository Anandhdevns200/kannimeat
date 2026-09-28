import { Injectable } from '@angular/core';
import type {
  CartItem, Category, DeliveryPartner, Employee, Invoice, InventoryItem,
  LocationInfo, Notification, Order, OrderStatus, Product, Shop, SystemUser, UserRole,
} from '../models';
import { PRODUCTS, COMPANIES, CATEGORY_META } from '../mock/companies-products';
import {
  CATEGORY_SALES, CITY_DISTRIBUTION, DAILY_ORDER_TREND, DELIVERY_PARTNERS,
  EMPLOYEES, INVENTORY, INVOICES, NOTIFICATIONS, SYSTEM_USERS,
} from '../mock/ops-data';
import { ORDERS, TOMORROW_LABEL, nextDay } from '../mock/orders';
import { CITIES, AREAS, DEFAULT_LOCATION } from '../mock/locations';

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));
export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
export const kg = (n: number) => `${n} KG`;

@Injectable({ providedIn: 'root' })
export class DataService {
  // ------------------------------------------------------------------ read API
  getProducts() { return delay().then(() => [...PRODUCTS]); }
  getProduct(id: string) { return delay().then(() => PRODUCTS.find((p) => p.id === id)); }
  getByCategory(cat: Category) { return delay().then(() => PRODUCTS.filter((p) => p.category === cat)); }
  getPopular() { return delay().then(() => [...PRODUCTS].sort((a, b) => b.quality - a.quality).slice(0, 4)); }
  getCategoryMeta() { return CATEGORY_META; }

  getShops(): Promise<Shop[]> { return delay().then(() => COMPANIES.flatMap((c) => c.shops)); }
  getCompanies() { return delay().then(() => [...COMPANIES]); }
  getShop(id: string): Promise<Shop | undefined> { return this.getShops().then((s) => s.find((x) => x.id === id)); }
  getInventory(): Promise<InventoryItem[]> { return delay().then(() => [...INVENTORY]); }
  getEmployees(): Promise<Employee[]> { return delay().then(() => [...EMPLOYEES]); }
  getDeliveryPartners(): Promise<DeliveryPartner[]> { return delay().then(() => [...DELIVERY_PARTNERS]); }

  getOrders(): Promise<Order[]> { return delay().then(() => [...ORDERS]); }
  getOrder(id: string): Promise<Order | undefined> { return this.getOrders().then((o) => o.find((x) => x.id === id)); }
  getOrdersForCustomer(customerId: string): Promise<Order[]> { return this.getOrders().then((o) => o.filter((x) => x.customerId === customerId)); }
  getOrdersForShop(shopId: string): Promise<Order[]> { return this.getOrders().then((o) => o.filter((x) => x.shopId === shopId)); }

  getInvoices(): Promise<Invoice[]> { return delay().then(() => [...INVOICES]); }
  getInvoice(id: string): Promise<Invoice | undefined> { return this.getInvoices().then((i) => i.find((x) => x.id === id)); }
  getInvoiceByOrder(orderId: string): Promise<Invoice | undefined> { return this.getInvoices().then((i) => i.find((x) => x.orderId === orderId)); }

  getNotificationsFor(role: string): Promise<Notification[]> {
    return delay(150).then(() => NOTIFICATIONS.filter((n) => n.role === role));
  }

  getSystemUsers(): Promise<SystemUser[]> { return delay().then(() => [...SYSTEM_USERS]); }

  // analytics
  getDailyTrend() { return [...DAILY_ORDER_TREND]; }
  getCityDistribution() { return [...CITY_DISTRIBUTION]; }
  getCategorySales() { return [...CATEGORY_SALES]; }

  // ------------------------------------------------------------------ write API (mock mutation)
  async placeOrder(payload: {
    customerId: string; customerName: string; customerPhone: string; shopId: string; shopName: string;
    shopArea: string; city: string; items: CartItem[]; slotLabel: string; address: string; area: string;
    paymentMethod: Order['paymentMethod'];
  }): Promise<Order> {
    await delay(900);
    const items = payload.items.map((ci) => ({
      productId: ci.product.id,
      name: ci.product.name,
      emoji: ci.product.emoji,
      weightKg: ci.quantityKg,
      cutPreference: ci.cutPreference,
      pricePerKg: ci.product.pricePerKg,
      total: Math.round(ci.product.pricePerKg * ci.quantityKg),
    }));
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const deliveryFee = subtotal > 499 ? 0 : 30;
    const tax = Math.round((subtotal + deliveryFee) * 0.05);
    const total = subtotal + deliveryFee + tax;
    const num = 10245 - ORDERS.length + 10 + 1;
    const order: Order = {
      id: `ORD-${num}`,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      shopId: payload.shopId, shopName: payload.shopName, shopArea: payload.shopArea, city: payload.city,
      items,
      deliveryDate: nextDay.toISOString().slice(0, 10),
      deliveryDateLabel: TOMORROW_LABEL,
      slotLabel: payload.slotLabel,
      address: payload.address, area: payload.area,
      subtotal, deliveryFee, discount: 0, tax, total,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'paid',
      status: 'placed',
      timeline: [
        { state: 'placed', at: 'Just now', by: 'Customer' },
        { state: 'confirmed', at: payload.paymentMethod === 'cod' ? 'Pending shop confirmation' : 'Payment received', by: 'Shop' },
      ],
      invoiceId: `INV-2026-${num}`,
      totalKg: items.reduce((s, i) => s + i.weightKg, 0),
    };
    ORDERS.unshift(order);
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
    await delay(300);
    const order = ORDERS.find((o) => o.id === orderId)!;
    order.status = status;
    order.timeline = [
      ...order.timeline.filter((t) => t.state !== status),
      { state: status, at: `Just now — ${note ?? ''}`, by: 'Shop / Delivery' },
    ];
    return { ...order };
  }

  async assignDelivery(orderId: string, partnerId: string): Promise<Order> {
    await delay(250);
    const order = ORDERS.find((o) => o.id === orderId)!;
    order.deliveryPartnerId = partnerId;
    order.assigned = true;
    if (order.status === 'ready') order.status = 'out_for_delivery';
    return { ...order };
  }

  async addProduct(input: Omit<Product, 'id'>): Promise<Product> {
    await delay(300);
    const max = PRODUCTS.reduce((m, p) => {
      const v = parseInt(p.id.replace('P-', ''), 10);
      return !isNaN(v) && v > m ? v : m;
    }, 0);
    const product: Product = { id: `P-${String(max + 1).padStart(3, '0')}`, ...input };
    PRODUCTS.unshift(product);
    return product;
  }

  // ------------------------------------------------------------------ static helpers
  get tomorrowLabel() { return TOMORROW_LABEL; }
  get cities() { return CITIES; }
  areasFor(city: string) { return AREAS[city] ?? []; }
  get defaultLocation(): LocationInfo { return { ...DEFAULT_LOCATION }; }
}

export const roleLabel: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Company Admin',
  SHOP_ADMIN: 'Shop Admin',
  SHOP_STAFF: 'Shop Staff',
  DELIVERY_MANAGER: 'Delivery Manager',
  DELIVERY_PARTNER: 'Delivery Partner',
  CUSTOMER: 'Customer',
};