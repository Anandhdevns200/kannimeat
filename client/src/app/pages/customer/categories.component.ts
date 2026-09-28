import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { LocationService } from '../../core/services/location.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import type { Product, Shop } from '../../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="container mt-4">
      <h1 class="section-title">Browse Categories</h1>
      <p class="section-sub">Fresh meat, cut to your preference by nearby local shops.</p>

      <div class="cat-list">
        <button class="cat-card" *ngFor="let c of cats" (click)="go(c.key)">
          <span style="font-size:44px">{{ c.emoji }}</span>
          <div class="grow-1">
            <b style="font-size:20px;font-family:Poppins">{{ c.label }}</b>
            <div class="text-muted">{{ c.blurb }}</div>
          </div>
          <span class="btn btn-soft btn-sm btn-icon" title="Browse"><mat-icon>arrow_forward</mat-icon></span>
        </button>
      </div>

      <!-- Today's offers -->
      <h2 class="section-title mt-6">Today's Offers</h2>
      <div class="offer-grid">
        <div class="offer card"><b style="font-size:20px">Fresh Friday</b><span>Flat ₹50 off on orders above ₹599</span><span class="chip chip-red">Code: FRESH50</span></div>
        <div class="offer card"><b style="font-size:20px">First Order</b><span>Free delivery on your first order</span><span class="chip chip-green">Auto applied</span></div>
        <div class="offer card"><b style="font-size:20px">Weekly Repeat</b><span>Subscribe & get 5% off every week</span><span class="chip chip-teal">Coming soon</span></div>
      </div>

      <!-- Nearby shops -->
      <h2 class="section-title mt-6">Shops delivering to {{ loc?.area }}, {{ loc?.city }}</h2>
      <div class="shop-grid">
        <div class="card shop-card" *ngFor="let s of shops">
          <div style="font-size:28px">🏪</div>
          <div class="grow-1">
            <b>{{ s.name }}</b>
            <div class="text-muted">{{ s.area }}, {{ s.city }}</div>
            <div>⭐ {{ s.rating }} · {{ s.ordersToday }} orders today</div>
          </div>
          <button class="btn btn-soft btn-sm" [routerLink]="['/category','chicken']" [queryParams]="{shop:s.id}">Order</button>
        </div>
      </div>

      <div *ngIf="allShopProducts.length" class="mt-6">
        <h2 class="section-title">Everything available near you</h2>
        <div class="product-grid">
          <div class="p-card card card-hover" *ngFor="let p of allShopProducts">
            <div class="thumb"><span style="font-size:38px">{{ p.emoji }}</span></div>
            <div class="body">
              <div class="price">{{ inr(p.pricePerKg) }}/KG</div>
              <b>{{ p.name }}</b>
              <div class="meta">{{ p.shopName }}</div>
              <button class="btn btn-brand btn-sm w-full" (click)="add(p)"><mat-icon style="font-size:17px">add</mat-icon> Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cat-list { display: flex; flex-direction: column; gap: 12px; }
      .cat-card { display: flex; align-items: center; gap: 18px; background: #fff; border: 1px solid var(--slate-200); border-radius: 16px; padding: 20px 24px; box-shadow: var(--shadow); cursor: pointer; text-align: left; }
      .cat-card:hover { border-color: var(--brand-400); transform: translateY(-2px); }
      .offer-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
      .offer { display: flex; flex-direction: column; gap: 6px; }
      .offer span { color: var(--slate-500); font-size: 13.5px; }
      .shop-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 14px; }
      .shop-card { display: flex; align-items: center; gap: 14px; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(230px,1fr)); gap: 16px; }
      .p-card { padding: 0; overflow: hidden; }
      .thumb { height: 110px; background: #fff7ed; display: flex; align-items: center; justify-content: center; }
      .body { padding: 14px; display: flex; flex-direction: column; gap: 5px; }
      .price { font-weight: 800; font-family: Poppins; color: var(--slate-900); }
      .meta { font-size: 13px; color: var(--slate-500); }
      @media (max-width: 900px) { .offer-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CategoriesPage {
  private data = inject(DataService);
  private locSvc = inject(LocationService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  inr = inr;
  cats: any[] = [];
  loc: any = null;
  shops: Shop[] = [];
  allShopProducts: Product[] = [];

  constructor() {
    const meta = this.data.getCategoryMeta();
    this.cats = Object.entries(meta).map(([k, v]: any) => ({ ...v, key: k }));
    this.locSvc.location.subscribe((l) => (this.loc = l));
    this.locSvc.shopsNear.then((s) => (this.shops = s));
    this.data.getProducts().then((all) => {
      const shopIds = this.shops.map((s) => s.id);
      this.allShopProducts = all.filter((p) => shopIds.includes(p.shopId));
    });
  }
  go(cat: string) {
    this.router.navigate(['/category', cat]);
  }
  add(p: Product) {
    this.cart.add(p, 0.5, p.cuts[0]);
    this.toast.show(`${p.name} added to cart`, 'success');
  }
}