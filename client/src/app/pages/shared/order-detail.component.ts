import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusTimelineComponent } from '../../shared/components/status-timeline.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { STATUS_LABEL, type Order, type OrderStatus } from '../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatusTimelineComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div style="max-width:920px" *ngIf="order">
      <a [routerLink]="backLink" class="btn btn-ghost btn-sm mb-3"><mat-icon style="font-size:17px">arrow_back</mat-icon> Back</a>

      <div class="card mb-3">
        <div class="flex justify-between align-start" style="flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin:0;font-size:22px">Order #{{ order.id }}</h2>
            <div class="text-muted">Placed Yesterday 6:12 PM · {{ order.deliveryDateLabel }} · {{ order.slotLabel }}</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="amount mono">{{ inr(order.total) }}</span>
            <app-status-badge [status]="order.status" [label]="STATUS_LABEL[order.status]"></app-status-badge>
          </div>
        </div>
      </div>

      <div class="grid">
        <div class="card col" style="min-height:0">
          <b>Customer</b>
          <div style="margin-top:8px;font-size:14px">
            <h3 style="margin:0 0 2px">{{ order.customerName }}</h3>
            <div class="text-muted">{{ order.address }}</div>
            <div class="text-muted">📞 {{ order.customerPhone }}</div>
            <div class="chip chip-blue mt-2">Delivery area: {{ order.area }}</div>
          </div>

          <b style="display:block;margin-top:22px">Products</b>
          <div class="it" *ngFor="let it of order.items">
            <div class="grow-1">{{ it.emoji }} {{ it.name }} — <b>{{ it.weightKg }} KG</b><div class="text-muted" style="font-size:12px">Cut preference: {{ it.cutPreference }}</div></div>
            <span class="mono">{{ inr(it.total) }}</span>
          </div>
          <div class="tot"><span>Total</span><span class="mono">{{ inr(order.total) }}</span></div>

          <b style="display:block;margin-top:18px">Payment</b>
          <div class="mt-1"><app-status-badge [status]="order.paymentStatus" [label]="order.paymentStatus | uppercase"></app-status-badge> {{ order.paymentMethod | uppercase }}</div>

          <b style="display:block;margin-top:18px">Delivery</b>
          <div class="text-muted">{{ order.deliveryDateLabel }} · {{ order.slotLabel }} · 🚚 {{ partnerName }}</div>
        </div>

        <div class="card col">
          <b>Order Timeline</b>
          <div class="mt-2">
            <app-status-timeline [status]="order.status" [meta]="timelineMeta"></app-status-timeline>
          </div>

          <mat-divider style="margin:16px 0"></mat-divider>
          <b>Actions</b>
          <div class="actions">
            <button *ngFor="let a of availableActions" class="btn btn-brand btn-md w-full" (click)="advance(a.status)"
              [disabled]="advancing"><mat-icon style="font-size:18px">{{ a.icon }}</mat-icon> {{ a.label }}</button>
            <mat-progress-bar mode="indeterminate" *ngIf="advancing" style="margin-top:8px"></mat-progress-bar>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="!order"><app-empty-state icon="🔍" title="Order not found"></app-empty-state></div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; align-items: start; }
      .amount { font-size: 20px; font-weight: 800; }
      .it { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; padding: 8px 0; border-bottom: 1px dashed var(--slate-200); }
      .tot { display: flex; justify-content: space-between; font-weight: 800; font-size: 15.5px; padding-top: 10px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class OrderDetailPage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  inr = inr;
  order: Order | null = null;
  advancing = false;
  backLink = '/portal/shop/orders';
  readonly STATUS_LABEL = STATUS_LABEL;

  get partnerName() {
    return this.order?.deliveryPartnerId ? this.order.deliveryPartnerId : 'Not assigned';
  }
  get timelineMeta() {
    const m: Record<string, string> = {};
    (this.order?.timeline ?? []).forEach((t: any) => {
      m[t.state] = t.at;
    });
    return m;
  }

  get availableActions(): { label: string; icon: string; status: OrderStatus }[] {
    if (!this.order) return [];
    const s = this.order.status;
    const map: Record<string, { label: string; icon: string; status: OrderStatus }[]> = {
      placed: [{ label: 'Accept Order', icon: 'check', status: 'confirmed' }],
      confirmed: [{ label: 'Start Processing', icon: 'play_arrow', status: 'processing' }],
      processing: [{ label: 'Mark Packed', icon: 'inventory_2', status: 'packed' }],
      packed: [{ label: 'Mark Ready', icon: 'check_circle', status: 'ready' }],
      ready: [{ label: 'Handover to Delivery', icon: 'local_shipping', status: 'out_for_delivery' }],
      out_for_delivery: [{ label: 'Mark Delivered', icon: 'task_alt', status: 'delivered' }],
    };
    return map[s] ?? [];
  }

  ngOnInit() {
    this.route.params.subscribe((p) => {
      this.data.getOrder(p['id']).then((o) => (this.order = o ?? null));
    });
    this.route.queryParams.subscribe((q) => {
      if (q['from']) this.backLink = q['from'];
    });
  }

  advance(status: OrderStatus) {
    this.advancing = true;
    this.data.updateOrderStatus(this.order!.id, status).then((updated) => {
      this.order = updated;
      this.advancing = false;
      this.toast.show(`Order ${this.order!.id} → ${STATUS_LABEL[status]}`, 'success');
    });
  }
}