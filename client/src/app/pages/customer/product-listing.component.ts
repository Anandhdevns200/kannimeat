import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { CATEGORY_META } from '../../core/mock/companies-products';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import type { Category, Product } from '../../core/models';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, EmptyStateComponent],
  template: `
    <div class="container mt-4" *ngIf="meta">
      <div class="head">
        <div class="flex items-center gap-2">
          <span style="font-size:40px">{{ meta.emoji }}</span>
          <div>
            <h1 class="section-title" style="margin:0">{{ meta.label }}</h1>
            <p class="text-muted" style="margin:2px 0 0">{{ meta.blurb }}</p>
          </div>
        </div>
        <div class="grow-1"></div>
        <mat-form-field appearance="outline" style="max-width:220px">
          <mat-label>Shop</mat-label>
          <mat-select [(ngModel)]="shopFilter" (selectionChange)="applyFilters()">
            <mat-option value="">All shops</mat-option>
            <mat-option *ngFor="let s of shopOptions" [value]="s">{{ s }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="layout">
        <aside class="filters card">
          <b>Filters</b>
          <mat-form-field appearance="outline">
            <mat-label>Max price</mat-label>
            <mat-select [(ngModel)]="priceFilter" (selectionChange)="applyFilters()">
              <mat-option value="9999">Any</mat-option>
              <mat-option value="250">Under ₹250</mat-option>
              <mat-option value="400">Under ₹400</mat-option>
              <mat-option value="600">Under ₹600</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Cut type</mat-label>
            <mat-select [(ngModel)]="cutFilter" (selectionChange)="applyFilters()">
              <mat-option value="">Any cut</mat-option>
              <mat-option *ngFor="let c of cutOptions" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-checkbox [(ngModel)]="inStockOnly" (change)="applyFilters()" color="primary" style="margin-top:6px">In stock only</mat-checkbox>
        </aside>

        <div class="results">
          <div class="count-line">{{ filtered.length }} products</div>
          <div class="product-grid" *ngIf="filtered.length">
            <div class="p-card card" *ngFor="let p of filtered">
              <div class="thumb"><span style="font-size:42px">{{ p.emoji }}</span></div>
              <div class="body">
                <div class="price">{{ inr(p.pricePerKg) }}<span class="per">/KG</span></div>
                <b class="name" [routerLink]="['/product', p.id]" style="cursor:pointer">{{ p.name }}</b>
                <div class="meta">🏪 {{ p.shopName }}</div>
                <div class="fresh"><span class="chip" [class.chip-green]="p.inStock" [class.chip-red]="!p.inStock">{{ p.inStock ? '✓ In stock' : 'Out of stock' }}</span></div>
                <button class="btn btn-brand btn-sm w-full" [disabled]="!p.inStock" (click)="add(p)">
                  <mat-icon style="font-size:18px">add</mat-icon> Add
                </button>
              </div>
            </div>
          </div>
          <app-empty-state *ngIf="!filtered.length" icon="🔍" title="No matches" message="Try changing filters or search term."></app-empty-state>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .head { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
      .layout { display: grid; grid-template-columns: 240px 1fr; gap: 18px; }
      .filters { height: fit-content; display: flex; flex-direction: column; gap: 4px; }
      .count-line { color: var(--slate-500); font-size: 13.5px; margin-bottom: 10px; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 16px; }
      .p-card { padding: 0; overflow: hidden; }
      .thumb { height: 118px; background: linear-gradient(135deg, #fff7ed, #ffe4d0); display: flex; align-items: center; justify-content: center; }
      .body { padding: 14px; display: flex; flex-direction: column; gap: 6px; }
      .price { font-weight: 800; font-size: 18px; font-family: Poppins; }
      .per { color: var(--slate-400); font-size: 12.5px; font-weight: 600; }
      .name { font-size: 14px; }
      .meta { font-size: 12.5px; color: var(--slate-500); }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .filters { flex-direction: row; flex-wrap: wrap; } }
    `,
  ],
})
export class ProductListingPage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  inr = inr;
  meta: any = null;
  all: Product[] = [];
  filtered: Product[] = [];
  shopOptions: string[] = [];
  cutOptions: string[] = [];
  shopFilter = '';
  priceFilter = '9999';
  cutFilter = '';
  inStockOnly = false;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const cat = params['category'] as Category;
      this.meta = CATEGORY_META[cat];
      if (!this.meta) {
        this.router.navigate(['/categories']);
        return;
      }
      this.data.getByCategory(cat).then((p) => {
        this.all = p;
        this.shopOptions = [...new Set(p.map((x) => x.shopName))];
        this.cutOptions = [...new Set(p.flatMap((x) => x.cuts))];
        this.applyFilters();
      });
    });
    this.route.queryParams.subscribe((q) => {
      if (q['shop']) this.shopFilter = this.shopOptions.find((s) => s === q['shop']) ?? '';
    });
  }

  applyFilters() {
    this.filtered = this.all.filter((p) => {
      if (this.shopFilter && p.shopName !== this.shopFilter) return false;
      if (+this.priceFilter < 9999 && p.pricePerKg >= +this.priceFilter) return false;
      if (this.cutFilter && !p.cuts.includes(this.cutFilter)) return false;
      if (this.inStockOnly && !p.inStock) return false;
      return true;
    });
  }

  add(p: Product) {
    this.cart.add(p, 0.5, p.cuts[0]);
    this.toast.show(`${p.name} added to cart`, 'success');
  }
}