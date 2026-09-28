import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusTimelineComponent } from '../../shared/components/status-timeline.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ORDER_STATUS_SEQ, STATUS_LABEL, type OrderStatus } from '../../core/models';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatusTimelineComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="container mt-4" style="max-width:820px" *ngIf="order">
      <div class="card status-card">
        <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:10px">
          <div>
            <h1 style="margin:0;font-size:20px">Order #{{ order.id }}</h1>
            <div class="text-muted">{{ order.deliveryDateLabel }} · {{ order.slotLabel }}</div>
          </div>
          <div class="flex items-center gap-2">
            <app-status-badge [status]="order.status" [label]="sLabel(order.status)"></app-status-badge>
            <button class="btn btn-ghost btn-sm" (click)="reschedule()">Reschedule</button>
            <button class="btn btn-ghost btn-sm" (click)="help()">Need help?</button>
          </div>
        </div>

        <mat-progress-bar
          mode="determinate"
          [value]="progress"
          [class.danger]="order.status==='cancelled'||order.status==='failed'"
          style="margin-top:14px"
        ></mat-progress-bar>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 style="margin-top:0">Live Timeline</h3>
          <app-status-timeline [status]="order.status" [meta]="metaFromTimeline"></app-status-timeline>
        </div>

        <div>
          <div class="card mb-3">
            <b>Customer Delivery</b>
            <div class="mt-2" style="font-size:14px">
              <div>To: <b>{{ order.customerName }}</b></div>
              <div class="text-muted">{{ order.address }}</div>
              <div class="text-muted">📞 {{ order.customerPhone }}</div>
            </div>
          </div>

          <div class="card mb-3">
            <b>Items</b>
            <div *ngFor="let it of order.items" class="it-row">
              <span>{{ it.emoji }} {{ it.name }} × {{ it.weightKg }}KG <span class="text-muted">({{ it.cutPreference }})</span></span>
              <span class="mono">{{ inr(it.total) }}</span>
            </div>
            <div class="tot-line"><span>Total</span><b class="mono">{{ inr(order.total) }}</b></div>
            <div class="pay-line">
              Payment: <app-status-badge [status]="order.paymentStatus" [label]="order.paymentStatus | uppercase"></app-status-badge>
            </div>
          </div>

          <div class="card">
            <b>From</b>
            <div class="mt-2" style="font-size:14px">🏪 <b>{{ order.shopName }}</b><div class="text-muted">{{ order.shopArea }}, {{ order.city }}</div></div>
          </div>

          <button class="btn btn-soft btn-md w-full mt-3" (click)="reorder()">🔁 Reorder this order</button>
          <a class="btn btn-ghost btn-md w-full mt-2" [routerLink]="['/invoice', order.invoiceId]">🧾 View Invoice</a>
        </div>
      </div>
    </div>
    <div class="container mt-4" *ngIf="!order">
      <app-empty-state icon="🔍" title="Order not found" message="Check the order link and try again."></app-empty-state>
    </div>
  `,
  styles: [
    `
      .status-card { padding: 22px; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; align-items: start; }
      .it-row { display: flex; justify-content: space-between; gap: 10px; font-size: 14px; padding: 7px 0; border-bottom: 1px dashed var(--slate-200); }
      .tot-line { display: flex; justify-content: space-between; margin-top: 10px; font-size: 16px; }
      .pay-line { margin-top: 8px; font-size: 13.5px; color: var(--slate-600); }
      @media (max-width: 900px) { .grid-2 { grid-template-columns: 1fr; } }
    `,
  ],
})
export class OrderTrackingPage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private orderId = '';
  inr = inr;
  order: any = null;
  readonly STATUS_LABEL = STATUS_LABEL;

  sLabel(status: string) {
    return STATUS_LABEL[status as OrderStatus] ?? status;
  }

  get progress() {
    const idx = ORDER_STATUS_SEQ.indexOf(this.order?.status);
    if (idx < 0) return 0;
    return Math.round((idx / (ORDER_STATUS_SEQ.length - 1)) * 100);
  }

  get metaFromTimeline() {
    const m: Record<string, string> = {};
    (this.order?.timeline ?? []).forEach((t: any) => {
      m[t.state] = `${t.at}`;
    });
    return m;
  }

  ngOnInit() {
    this.route.params.subscribe((p) => {
      this.orderId = p['id'];
      this.data.getOrder(this.orderId).then((o) => (this.order = o));
    });
  }
  reschedule() {
    this.toast.show('Rescheduling opens a slot picker (demo)', 'info');
  }
  help() {
    this.toast.show('WhatsApp support: +91 98425 00000 (demo)', 'info');
  }
  reorder() {
    this.order?.items.forEach((it: any) => {
      this.data.getProduct(it.productId).then((p) => {
        if (p) {
          this.cart.add(p, it.weightKg, it.cutPreference);
          this.toast.show('Items added to cart for reorder', 'success');
        }
      });
    });
  }
}