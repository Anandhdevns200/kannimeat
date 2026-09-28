import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { CartService } from '../../core/services/cart.service';
import { DataService, inr } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import type { CartItem } from '../../core/models';

const SLOTS = [
  { id: 's1', label: '8:00 AM – 10:00 AM' },
  { id: 's2', label: '10:00 AM – 12:00 PM', note: 'Most popular' },
  { id: 's3', label: '12:00 PM – 2:00 PM' },
  { id: 's4', label: '4:00 PM – 6:00 PM' },
];

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, EmptyStateComponent],
  template: `
    <div class="container mt-4">
      <h1 class="section-title">Your Cart</h1>
      <p class="section-sub">Order before 8 PM today for fresh delivery tomorrow.</p>

      <div *ngIf="items.length" class="layout">
        <div class="col">
          <div class="card item-card" *ngFor="let it of items">
            <div class="thumb"><span style="font-size:34px">{{ it.product.emoji }}</span></div>
            <div class="grow-1">
              <b>{{ it.product.name }}</b>
              <div class="meta">{{ it.cutPreference }} · {{ it.product.shopName }}</div>
              <div class="stepper">
                <button class="sq" (click)="dec(it)">−</button>
                <span class="qty">{{ it.quantityKg }} KG</span>
                <button class="sq" (click)="inc(it)">+</button>
              </div>
            </div>
            <div class="right-col">
              <b class="mono">{{ inr(it.product.pricePerKg * it.quantityKg) }}</b>
              <a class="link" (click)="remove(it.lineId)">Remove</a>
            </div>
          </div>

          <div class="card mt-3">
            <h3 style="margin:0 0 4px">Delivery Date</h3>
            <p class="text-muted" style="margin:0 0 12px">Order today → deliver {{ tomorrowLabel }}</p>
            <div class="doc-tile">
              <b>Tomorrow</b>
              <span>{{ tomorrowLabel }}</span>
              <span class="chip chip-green">Delivery confirmed at shop</span>
            </div>
          </div>

          <div class="card mt-3">
            <h3 style="margin:0 0 12px">Available Delivery Slots</h3>
            <div class="slot-grid">
              <button
                *ngFor="let s of slots"
                class="slot"
                [class.sel]="selectedSlot === s.id"
                (click)="selectedSlot = s.id"
              >
                <b>🕐 {{ s.label }}</b>
                <span *ngIf="s.note" class="chip chip-amber">{{ s.note }}</span>
              </button>
            </div>
          </div>
        </div>

        <aside class="summary card">
          <h3 style="margin:0 0 14px">Bill Summary</h3>
          <div class="row"><span>Item total</span><span class="mono">{{ inr(t.subtotal) }}</span></div>
          <div class="row"><span>Delivery</span><span class="mono" [class.free]="t.deliveryFee === 0">{{ t.deliveryFee === 0 ? 'FREE' : inr(t.deliveryFee) }}</span></div>
          <div class="row"><span>GST (5%)</span><span class="mono">{{ inr(t.tax) }}</span></div>
          <div class="row total"><span>To Pay</span><span class="mono">{{ inr(t.total) }}</span></div>
          <div class="note" *ngIf="t.deliveryFee === 0 && t.subtotal > 0">🚚 Free delivery on orders above ₹499</div>
          <button class="btn btn-brand btn-lg w-full mt-3" [disabled]="!selectedSlot" (click)="checkout()">
            <mat-icon style="font-size:19px">arrow_forward</mat-icon> Continue to Checkout
          </button>
          <button class="btn btn-ghost btn-md w-full mt-2" routerLink="/categories"><mat-icon style="font-size:17px">arrow_back</mat-icon> Add More Items</button>
        </aside>
      </div>

      <app-empty-state
        *ngIf="!items.length"
        icon="🛒"
        title="Your cart is empty"
        message="Add fresh chicken, mutton or fish from your neighbourhood shops."
        actionLabel="Browse meat"
        (action)="router.navigate(['/categories'])"
      ></app-empty-state>
    </div>
  `,
  styles: [
    `
      .layout { display: grid; grid-template-columns: 1fr 340px; gap: 18px; align-items: start; }
      .item-card { display: flex; gap: 14px; align-items: center; padding: 14px; margin-bottom: 12px; }
      .thumb { width: 64px; height: 64px; border-radius: 12px; background: #fff7ed; display: flex; align-items: center; justify-content: center; }
      .meta { font-size: 13px; color: var(--slate-500); margin: 2px 0 8px; }
      .stepper { display: flex; align-items: center; gap: 10px; }
      .sq { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--slate-300); background: #fff; cursor: pointer; font-size: 16px; }
      .qty { font-weight: 700; font-size: 14px; min-width: 44px; text-align: center; }
      .right-col { text-align: right; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
      .link { font-size: 12.5px; color: var(--meat-600); cursor: pointer; }
      .doc-tile { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; background: var(--slate-50); border: 1px dashed var(--slate-300); padding: 12px 16px; border-radius: 10px; }
      .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
      .slot { border: 1.5px solid var(--slate-200); border-radius: 12px; padding: 12px; text-align: left; font-family: inherit; background: #fff; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
      .slot:hover { border-color: var(--brand-400); }
      .slot.sel { border-color: var(--brand-600); background: var(--brand-50); }
      .summary { position: sticky; top: 88px; }
      .row { display: flex; justify-content: space-between; padding: 7px 0; font-size: 14.5px; color: var(--slate-600); }
      .row.total { font-weight: 800; font-size: 18px; color: var(--slate-900); border-top: 2px solid var(--slate-100); margin-top: 6px; padding-top: 12px; }
      .free { color: var(--green-600); font-weight: 700; }
      .note { font-size: 12.5px; color: var(--green-700); margin-top: 6px; }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .summary { position: static; } }
    `,
  ],
})
export class CartPage implements OnInit {
  private cartSvc = inject(CartService);
  private data = inject(DataService);
  private toast = inject(ToastService);
  router = inject(Router);
  inr = inr;
  items: CartItem[] = [];
  slots = SLOTS;
  selectedSlot = '';
  tomorrowLabel = '';

  get t() {
    return this.cartSvc.totals(this.items);
  }

  ngOnInit() {
    this.cartSvc.items.subscribe((i) => (this.items = i));
    this.tomorrowLabel = this.data.tomorrowLabel;
  }
  inc(it: CartItem) {
    this.cartSvc.update(it.lineId, it.quantityKg + 0.25);
  }
  dec(it: CartItem) {
    if (it.quantityKg <= 0.25) return;
    this.cartSvc.update(it.lineId, it.quantityKg - 0.25);
  }
  remove(lineId: string) {
    this.cartSvc.remove(lineId);
    this.toast.show('Item removed', 'info');
  }
  checkout() {
    if (!this.selectedSlot) return;
    const slot = this.slots.find((s) => s.id === this.selectedSlot);
    this.router.navigate(['/checkout'], { queryParams: { slot: slot?.label } });
  }
}