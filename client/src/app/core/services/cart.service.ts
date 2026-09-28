import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { CartItem, Product } from '../models';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart$ = new BehaviorSubject<CartItem[]>([]);
  private data = inject(DataService);

  get items(): Observable<CartItem[]> {
    return this.cart$.asObservable();
  }

  snapshot(): CartItem[] {
    return this.cart$.getValue();
  }

  add(product: Product, quantityKg: number, cutPreference: string) {
    const cur = this.cart$.getValue();
    const existing = cur.find(
      (i) => i.product.id === product.id && i.cutPreference === cutPreference,
    );
    if (existing) {
      const next = cur.map((i) =>
        i.product.id === product.id && i.cutPreference === cutPreference
          ? { ...i, quantityKg: i.quantityKg + quantityKg }
          : i,
      );
      this.cart$.next(next);
    } else {
      this.cart$.next([...cur, { product, quantityKg, cutPreference, lineId: `${Date.now()}` }]);
    }
  }

  update(lineId: string, quantityKg: number) {
    this.cart$.next(
      this.cart$.getValue().map((i) => (i.lineId === lineId ? { ...i, quantityKg } : i)),
    );
  }

  remove(lineId: string) {
    this.cart$.next(this.cart$.getValue().filter((i) => i.lineId !== lineId));
  }

  clear() {
    this.cart$.next([]);
  }

  count(): Observable<number> {
    return new Observable((sub) => {
      this.cart$.subscribe((items) => sub.next(items.reduce((s, i) => s + i.quantityKg, 0)));
    });
  }

  totals(items: CartItem[]) {
    const subtotal = items.reduce((s, i) => s + i.product.pricePerKg * i.quantityKg, 0);
    const deliveryFee = subtotal === 0 || subtotal > 499 ? 0 : 30;
    const tax = Math.round((subtotal + deliveryFee) * 0.05);
    return { subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax };
  }
}