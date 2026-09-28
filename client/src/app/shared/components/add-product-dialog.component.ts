import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CATEGORY_META } from '../../core/mock/companies-products';
import type { Category, Product } from '../../core/models';

export interface ShopOption {
  id: string;
  name: string;
  area: string;
  city: string;
}

export interface AddProductDialogData {
  shopId: string;
  shopName: string;
  shopArea: string;
  city: string;
  shops?: ShopOption[];
}

export const CUT_OPTIONS: Record<Category, string[]> = {
  chicken: ['Curry Cut', 'Biryani Cut', 'Boneless', 'Whole', 'Wings'],
  mutton: ['Curry Cut', 'Biryani Cut', 'Chops', 'Leg Piece', 'Boneless', 'Mince'],
  fish: ['Whole', 'Steak Cut', 'Cleaned', 'Deveined', 'Fillets'],
};

const EMOJI_OPTIONS: Record<Category, string[]> = {
  chicken: ['🐓', '🍗', '🍛'],
  mutton: ['🐐', '🍖', '🥩'],
  fish: ['🐟', '🐠', '🦐'],
};

const FRESHNESS = ['Prepared today', 'Cut on order', 'Daily catch'];

@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px">
      <mat-icon style="color:var(--brand-600)">add_circle_outline</mat-icon> Add Product
    </h2>
    <mat-dialog-content style="min-width:480px;max-width:94vw">
      <div class="form">
        <mat-form-field appearance="outline" *ngIf="shops.length">
          <mat-label>Shop</mat-label>
          <mat-select [(ngModel)]="selShopId">
            <mat-option *ngFor="let s of shops" [value]="s.id">{{ s.name }} · {{ s.area }}, {{ s.city }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Product name</mat-label>
          <input matInput [(ngModel)]="name" placeholder="e.g. Country Chicken Curry Cut" />
        </mat-form-field>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="category" (selectionChange)="applyCategory()">
              <mat-option *ngFor="let c of categories" [value]="c">{{ meta[c].emoji }} {{ meta[c].label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Emoji</mat-label>
            <mat-select [(ngModel)]="emoji">
              <mat-option *ngFor="let e of emojiOptions" [value]="e">{{ e }} &nbsp;{{ emojiName(e) }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row-2">
          <mat-form-field appearance="outline">
            <mat-label>Price per KG (₹)</mat-label>
            <input matInput type="number" min="0" step="10" [(ngModel)]="price" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Freshness</mat-label>
            <mat-select [(ngModel)]="freshness">
              <mat-option *ngFor="let f of freshnessOptions" [value]="f">{{ f }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="section">
          <div class="sec-head">
            <mat-icon style="font-size:18px">content_cut</mat-icon>
            <b>Pieces / cuts this shop will offer</b>
            <span class="text-muted">Customers pick one of these when ordering</span>
          </div>
          <div class="cuts">
            <label class="cut" *ngFor="let c of cutOptions" [class.sel]="isCut(c)">
              <input type="checkbox" [checked]="isCut(c)" (change)="toggleCut(c)" />
              <span>🍖</span>
              <b>{{ c }}</b>
            </label>
          </div>
          <div class="hint" *ngIf="!cutOptions.length">Select a category to see available pieces.</div>
        </div>

        <div class="section stock-row">
          <mat-slide-toggle color="primary" [(ngModel)]="inStock">In stock</mat-slide-toggle>
          <span class="text-muted" style="font-size:12.5px">Sold out items are hidden from customers.</span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom:16px;gap:8px">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!valid()" (click)="save()">
        <mat-icon style="font-size:18px">check</mat-icon> Save Product
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form { display: flex; flex-direction: column; gap: 14px; padding-top: 4px; }
      .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .section { border: 1px solid var(--slate-200); border-radius: 12px; padding: 12px 14px; background: var(--slate-50); }
      .sec-head { display: flex; align-items: center; gap: 6px; font-size: 13.5px; margin-bottom: 8px; }
      .sec-head .text-muted { font-size: 11.5px; margin-left: auto; }
      .cuts { display: flex; flex-wrap: wrap; gap: 8px; }
      .cut { display: inline-flex; align-items: center; gap: 6px; border: 1.5px solid var(--slate-200); background: #fff;
        border-radius: 10px; padding: 7px 12px; font-size: 13px; cursor: pointer; transition: all .12s ease; }
      .cut:hover { border-color: var(--brand-400); }
      .cut input { display: none; }
      .cut.sel { border-color: var(--brand-600); background: var(--brand-50); color: var(--brand-800); font-weight: 600; }
      .cut.sel span { transform: scale(1.15); }
      .hint { font-size: 12px; color: var(--slate-400); }
      .stock-row { border-style: dashed; background: #fff; }
      @media (max-width: 560px) { .row-2 { grid-template-columns: 1fr; } }
    `,
  ],
})
export class AddProductDialogComponent {
  private dialogRef = inject(MatDialogRef<AddProductDialogComponent>);
  data = inject<AddProductDialogData>(MAT_DIALOG_DATA);

  meta = CATEGORY_META;
  categories: Category[] = ['chicken', 'mutton', 'fish'];
  freshnessOptions = FRESHNESS;

  name = '';
  category: Category = 'chicken';
  emoji = '🐓';
  price = 0;
  freshness = 'Prepared today';
  cuts: string[] = ['Curry Cut'];
  inStock = true;
  shops = this.data.shops ?? [];
  selShopId = this.data.shopId;

  get cutOptions() {
    return CUT_OPTIONS[this.category];
  }
  get emojiOptions() {
    return EMOJI_OPTIONS[this.category];
  }
  get shop() {
    return this.shops.find((s) => s.id === this.selShopId) ?? {
      id: this.data.shopId, name: this.data.shopName, area: this.data.shopArea, city: this.data.city,
    };
  }

  emojiName(e: string) {
    return e === '🐓' ? 'Chicken' : e === '🍗' ? 'Broiler' : e === '🍛' ? 'Biryani pack' : e === '🐐' ? 'Goat' : e === '🍖' ? 'Leg' : e === '🥩' ? 'Steak' : e === '🐟' ? 'Seer' : e === '🐠' ? 'Snapper' : 'Prawns';
  }

  applyCategory() {
    this.cuts = this.cuts.filter((c) => this.cutOptions.includes(c));
    if (!this.emojiOptions.includes(this.emoji)) this.emoji = this.emojiOptions[0];
  }

  isCut(c: string) {
    return this.cuts.includes(c);
  }
  toggleCut(c: string) {
    const i = this.cuts.indexOf(c);
    if (i >= 0) this.cuts.splice(i, 1);
    else this.cuts.push(c);
  }

  valid() {
    return !!this.name.trim() && this.price > 0 && this.cuts.length > 0;
  }

  save() {
    const payload: Omit<Product, 'id'> = {
      name: this.name.trim(),
      category: this.category,
      emoji: this.emoji,
      pricePerKg: Math.round(this.price),
      freshness: this.freshness,
      quality: 4.5,
      shopId: this.shop.id,
      shopName: this.shop.name,
      shopArea: this.shop.area,
      city: this.shop.city,
      description: '',
      cuts: [...this.cuts],
      inStock: this.inStock,
      unit: 'KG',
    };
    this.dialogRef.close(payload);
  }

  close() {
    this.dialogRef.close(null);
  }
}