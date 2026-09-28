import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import type { Product } from '../../core/models';

const QUANTITIES: { kg: number; label: string }[] = [
  { kg: 0.25, label: '250g' },
  { kg: 0.5, label: '500g' },
  { kg: 1, label: '1 KG' },
  { kg: 2, label: '2 KG' },
  { kg: 3, label: '3 KG' },
];

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="container mt-4" *ngIf="p">
      <div class="layout">
        <div class="visual card">
          <div class="art"><span style="font-size:110px">{{ p.emoji }}</span></div>
          <div class="badges">
            <span class="chip chip-green">✓ {{ p.freshness }}</span>
            <span class="chip" [class.chip-green]="p.inStock" [class.chip-red]="!p.inStock">{{ p.inStock ? 'In stock' : 'Out of stock' }}</span>
          </div>
        </div>

        <div class="info">
          <div class="crumb text-muted">
            <a routerLink="/categories">Home</a> / <a [routerLink]="['/category', p.category]">{{ p.category | titlecase }}</a> / {{ p.name }}
          </div>
          <h1 style="font-size:30px;margin:10px 0 4px;font-family:Poppins">{{ p.name }}</h1>
          <div class="shop-line">Freshly prepared by <b>🏪 {{ p.shopName }}</b> · {{ p.shopArea }}, {{ p.city }}</div>
          <div class="rating"><span class="stars">⭐ {{ p.quality }} quality score · Freshness {{ p.freshness }}</span></div>

          <div class="price-line">{{ inr(p.pricePerKg) }}<span class="per">per KG</span></div>
          <p class="desc">{{ p.description }}</p>

          <div class="block">
            <label class="lbl">Select Quantity</label>
            <div class="opt-grid">
              <button
                *ngFor="let q of quantities"
                class="qty-opt"
                [class.sel]="qty.kg === q.kg"
                (click)="pickQty(q.kg)"
              >
                <b>{{ q.label }}</b>
                <span>{{ inr(p.pricePerKg * q.kg) }}</span>
              </button>
            </div>
          </div>

          <div class="block">
            <label class="lbl">Cut Preference</label>
            <div class="opt-grid cuts">
              <button
                *ngFor="let c of p.cuts"
                class="cut-opt"
                [class.sel]="cut === c"
                (click)="pickCut(c)"
              >
                {{ c }}
              </button>
            </div>
          </div>

          <div class="cta-row">
            <button class="btn btn-brand btn-lg" style="flex:1" [disabled]="!p.inStock" (click)="addToCart()">
              <mat-icon>shopping_bag</mat-icon> Add to Cart · {{ inr(lineTotal) }}
            </button>
          </div>
          <div class="assure">
            <span>🧊 Cold-chain packed</span><span>🔪 Cut on order</span><span>↩️ 100% replacement policy</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .layout { display: grid; grid-template-columns: 420px 1fr; gap: 24px; }
      .visual { padding: 20px; }
      .art { height: 320px; background: linear-gradient(135deg, #fff7ed, #ffe4d0); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
      .badges { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
      .shop-line { color: var(--slate-600); margin-bottom: 6px; }
      .rating { margin-bottom: 8px; }
      .stars { color: var(--slate-500); font-size: 13.5px; }
      .price-line { font-size: 34px; font-weight: 800; font-family: Poppins; color: var(--slate-900); margin: 8px 0; }
      .per { color: var(--slate-400); font-size: 16px; font-weight: 600; margin-left: 6px; }
      .desc { color: var(--slate-600); line-height: 1.6; }
      .block { margin: 22px 0; }
      .lbl { font-weight: 700; display: block; margin-bottom: 10px; font-size: 14.5px; }
      .opt-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
      .opt-grid.cuts { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
      .qty-opt, .cut-opt { border: 1.5px solid var(--slate-200); border-radius: 12px; background: #fff; padding: 12px 10px; cursor: pointer; display: flex; flex-direction: column; gap: 3px; font-family: inherit; }
      .qty-opt span { color: var(--slate-500); font-size: 12.5px; }
      .qty-opt:hover, .cut-opt:hover { border-color: var(--brand-400); }
      .sel { border-color: var(--brand-600); background: var(--brand-50); box-shadow: inset 0 0 0 1px var(--brand-600); }
      .cta-row { display: flex; gap: 12px; margin-top: 8px; }
      .assure { display: flex; gap: 16px; margin-top: 14px; color: var(--slate-500); font-size: 13px; flex-wrap: wrap; }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .art { height: 220px; } }
    `,
  ],
})
export class ProductDetailsPage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  inr = inr;
  p: Product | null = null;
  quantities = QUANTITIES;
  qty = { kg: 0.5 };
  cut = '';

  get lineTotal() {
    return this.p ? this.p.pricePerKg * this.qty.kg : 0;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.data.getProduct(params['id']).then((p) => {
        if (!p) return;
        this.p = p;
        this.cut = p.cuts[0];
      });
    });
  }
  pickQty(kg: number) {
    this.qty = { kg };
  }
  pickCut(c: string) {
    this.cut = c;
  }
  addToCart() {
    if (!this.p) return;
    this.cart.add(this.p, this.qty.kg, this.cut);
    this.toast.show('Added to cart — pick your delivery slot next', 'success');
  }
}