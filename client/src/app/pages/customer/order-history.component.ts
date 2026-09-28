import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="container mt-4">
      <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:10px">
        <div>
          <h1 class="section-title" style="margin:0">My Orders</h1>
          <p class="text-muted" style="margin:4px 0 0">Track, view invoices and reorder your usuals.</p>
        </div>
        <button class="btn btn-brand btn-md" routerLink="/categories"><mat-icon style="font-size:18px">add</mat-icon> New Order</button>
      </div>

      <div class="mt-4 list" *ngIf="orders.length">
        <div class="card o-card" *ngFor="let o of orders">
          <div class="top">
            <div>
              <b class="mono" [routerLink]="['/order', o.id]" style="cursor:pointer"># {{ o.id }}</b>
              <span class="text-muted" style="font-size:13px"> · {{ o.deliveryDateLabel }} · {{ o.slotLabel }}</span>
            </div>
            <app-status-badge [status]="o.status" [label]="o.statusLabel"></app-status-badge>
          </div>
          <div class="mid">
            <div class="items">
              <span *ngFor="let it of o.items" class="it"> {{ it.emoji }} {{ it.name }} × {{ it.weightKg }}KG</span>
            </div>
            <div class="amount mono">{{ inr(o.total) }}</div>
          </div>
          <div class="shop-line">🏪 {{ o.shopName }} · {{ o.shopArea }}</div>
          <div class="actions">
            <button class="btn btn-ghost btn-sm btn-icon" title="View / Track order" [routerLink]="['/order', o.id]"><mat-icon>visibility</mat-icon><mat-icon style="font-size:16px">local_shipping</mat-icon></button>
            <button class="btn btn-ghost btn-sm btn-icon" title="View invoice" [routerLink]="['/invoice', o.invoiceId]"><mat-icon>receipt_long</mat-icon></button>
            <button class="btn btn-brand btn-sm reorder" (click)="reorder(o)"><mat-icon style="font-size:17px">repeat</mat-icon> Reorder</button>
          </div>
        </div>
      </div>

      <app-empty-state
        *ngIf="!orders.length"
        icon="🧾"
        title="No orders yet"
        message="Your orders will appear here once you place your first order."
        actionLabel="Browse meat"
        (action)="router.navigate(['/categories'])"
      ></app-empty-state>
    </div>
  `,
  styles: [
    `
      .list { display: flex; flex-direction: column; gap: 12px; }
      .o-card { padding: 16px 18px; }
      .top { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
      .mid { display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
      .items { display: flex; flex-direction: column; font-size: 14px; color: var(--slate-600); }
      .amount { font-size: 19px; font-weight: 800; }
      .shop-line { color: var(--slate-500); font-size: 13px; margin-top: 6px; }
      .actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
      .reorder { color: #fff; }
    `,
  ],
})
export class OrderHistoryPage implements OnInit {
  private data = inject(DataService);
  router = inject(Router);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  inr = inr;
  orders: any[] = [];

  ngOnInit() {
    this.data.getOrdersForCustomer('CUS-001').then((o) => {
      this.orders = o.map((x) => ({
        ...x,
        statusLabel: x.status
          .split('_')
          .map((w) => w[0].toUpperCase() + w.slice(1))
          .join(' '),
      }));
    });
  }
  reorder(o: any) {
    o.items.forEach((it: any) => {
      this.data.getProduct(it.productId).then((p) => {
        if (p) this.cart.add(p, it.weightKg, it.cutPreference);
      });
    });
    this.toast.show('Items added to cart for reorder', 'success');
    this.router.navigate(['/cart']);
  }
}