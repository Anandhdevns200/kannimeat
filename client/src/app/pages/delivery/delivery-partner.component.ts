import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { FormsModule } from '@angular/forms';
import { STATUS_LABEL, type Order } from '../../core/models';

@Component({
  selector: 'app-dp-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent, StatCardComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Today's Deliveries" subtitle="Ravi Shankar · Bike TN31 AA 4421 · Anna Salai area"></app-page-header>

    <div class="stats">
      <app-stat-card icon="🧾" iconBg="#dbeafe" value="8" label="Assigned today" sub="For tomorrow slots" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="⏳" iconBg="#fef3c7" [value]="'' + pending.length" label="Pending" sub="Not started" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="✅" iconBg="#dcfce7" [value]="'' + completed.length" label="Completed" sub="Today" trend="up" delta="20%"></app-stat-card>
      <app-stat-card icon="⭐" iconBg="#ede9fe" value="4.7" label="Rating" sub="1284 deliveries done" trend="flat" delta=""></app-stat-card>
    </div>

    <h2 class="section-title mt-4" style="font-size:18px">Next Up</h2>
    <div class="list mt-2" *ngIf="pending.length">
      <div class="card d-card" *ngFor="let o of pending">
        <div class="row">
          <b class="mono"># {{ o.id }}</b>
          <app-status-badge [status]="o.status" [label]="STATUS_LABEL[o.status]"></app-status-badge>
        </div>
        <div class="customer mt-2">👤 <b>{{ o.customerName }}</b> · {{ o.customerPhone }}</div>
        <div class="text-muted" style="font-size:13px">📍 {{ o.address }}</div>
        <div class="meta mt-2">
          <span class="chip chip-slate">🕐 {{ o.slotLabel }}</span>
          <span class="chip chip-green">💵 {{ o.paymentStatus | uppercase }}</span>
          <span class="chip chip-teal">{{ o.totalKg }} KG</span>
        </div>
        <div class="actions mt-2">
          <button class="btn btn-ghost btn-sm" (click)="navigate(o)"><mat-icon style="font-size:17px">map</mat-icon> Navigate</button>
          <button class="btn btn-brand btn-sm" (click)="start(o)"><mat-icon style="font-size:17px">{{ o.status === 'out_for_delivery' ? 'arrow_forward' : 'play_arrow' }}</mat-icon> {{ o.status === 'out_for_delivery' ? 'Continue' : 'Start' }}</button>
        </div>
      </div>
    </div>
    <app-empty-state *ngIf="!pending.length" icon="🎉" title="All caught up!" message="No pending deliveries. Check again in a bit."></app-empty-state>

    <h2 class="section-title mt-4" style="font-size:18px">Completed Today</h2>
    <div class="list mt-2" *ngIf="completed.length">
      <div class="card d-card done" *ngFor="let o of completed">
        <div>
          <b class="mono"># {{ o.id }}</b> · {{ o.customerName }}
          <div class="text-muted" style="font-size:12.5px">✅ Delivered · {{ o.slotLabel }}</div>
        </div>
        <span class="mono" style="font-weight:700">{{ inr(o.total) }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .list { display: flex; flex-direction: column; gap: 10px; }
      .d-card { padding: 16px; }
      .row { display: flex; justify-content: space-between; align-items: center; }
      .meta { display: flex; gap: 8px; flex-wrap: wrap; }
      .actions { display: flex; gap: 8px; }
      .done { opacity: .75; display: flex; justify-content: space-between; align-items: center; }
    `,
  ],
})
export class DeliveryPartnerDashboard implements OnInit {
  private data = inject(DataService);
  private toast = inject(ToastService);
  private router = inject(Router);
  inr = inr;
  readonly STATUS_LABEL = STATUS_LABEL;
  today: Order[] = [];
  get pending() {
    return this.today.filter((o) => o.status === 'out_for_delivery' || o.status === 'ready' || o.status === 'packed');
  }
  get completed() {
    return this.today.filter((o) => o.status === 'delivered');
  }

  ngOnInit() {
    this.data.getOrders().then((o) => {
      // partner DEL-01 (Ravi) + a couple of upcoming ready orders for demo
      this.today = o.filter((x) => x.deliveryPartnerId === 'DEL-01' || x.status === 'ready');
      if (this.today.length === 0) this.today = o.slice(0, 3);
    });
  }
  navigate(o: Order) {
    this.toast.show('Opening Google Maps to customer location (demo)', 'info');
  }
  start(o: Order) {
    this.router.navigate(['/portal/delivery-partner/deliveries', o.id]);
  }
}

@Component({
  selector: 'app-dp-delivery',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Delivery — #{{ order?.id }}" subtitle="Confirm delivery with OTP from the customer."></app-page-header>

    <div class="grid" *ngIf="order">
      <div class="card">
        <b>Customer</b>
        <h3 style="margin:8px 0 2px">{{ order.customerName }}</h3>
        <div class="text-muted">📞 {{ order.customerPhone }}</div>
        <div class="text-muted">📍 {{ order.address }}</div>
        <div class="mt-3" style="font-size:13.5px;color:var(--slate-600)">
          🕐 Slot: <b>{{ order.slotLabel }}</b> · {{ order.deliveryDateLabel }}
        </div>

        <b style="display:block;margin-top:20px">Items</b>
        <div *ngFor="let it of order.items" class="it">
          <span>{{ it.emoji }} {{ it.name }} × {{ it.weightKg }}KG</span>
          <span class="mono">{{ inr(it.total) }}</span>
        </div>

        <div class="tot"><span>Collect</span><b class="mono">{{ inr(order.total) }}</b></div>
        <div class="mt-2"><span class="chip chip-amber">💵 {{ order.paymentStatus === 'pending' ? 'CASH ON DELIVERY' : 'PAID ONLINE' }}</span></div>

        <div class="actions mt-4">
          <button class="btn btn-ghost btn-md" (click)="navigate()"><mat-icon>map</mat-icon> Navigate</button>
          <button class="btn btn-ghost btn-md" (click)="sms()"><mat-icon>phone</mat-icon> Call</button>
          <button matTooltip="Mark as out for delivery" class="btn btn-dark btn-md" (click)="markOut()"><mat-icon style="font-size:18px">play_arrow</mat-icon> Start Delivery</button>
        </div>
      </div>

      <div class="card otp-card">
        <b>Delivery OTP</b>
        <p class="text-muted" style="font-size:13.5px;margin:6px 0 12px">Ask the customer for the 4-digit OTP from their order confirmation.</p>
        <div class="otp-box">
          <span *ngFor="let d of otp" class="otp-digit">{{ d }}</span>
        </div>
        <div class="hint">Demo hint: 4 8 2 1</div>
        <mat-form-field appearance="outline" style="margin-top:10px">
          <mat-label>Enter OTP</mat-label>
          <input matInput [(ngModel)]="entered" maxlength="4" placeholder="4821" />
        </mat-form-field>
        <button class="btn btn-brand btn-lg w-full" (click)="confirm()" [disabled]="!entered || entered.length < 4">
          <mat-icon>check_circle</mat-icon> Confirm Delivery
        </button>
      </div>
    </div>
    <app-empty-state *ngIf="!order" icon="🔍" title="No such delivery"></app-empty-state>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1.2fr .8fr; gap: 16px; align-items: start; }
      .it { display: flex; justify-content: space-between; font-size: 13.5px; padding: 6px 0; border-bottom: 1px dashed var(--slate-200); }
      .tot { display: flex; justify-content: space-between; font-size: 16px; padding-top: 10px; }
      .actions { display: flex; gap: 8px; flex-wrap: wrap; }
      .otp-box { display: flex; gap: 12px; justify-content: center; padding: 14px 0; }
      .otp-digit { width: 48px; height: 56px; border: 2px solid var(--brand-300); border-radius: 12px; background: var(--brand-50); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; font-family: Poppins; }
      .hint { text-align: center; color: var(--slate-400); font-size: 12px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class DeliveryPartnerOrder implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastService);
  inr = inr;
  order: Order | null = null;
  otp = ['4', '8', '2', '1'];
  entered = '';

  ngOnInit() {
    const seg = this.router.url.split('/').pop() ?? '';
    this.data.getOrder(seg).then((o) => (this.order = o ?? null));
  }
  navigate() {
    this.toast.show('Opening Google Maps (demo)', 'info');
  }
  sms() {
    this.toast.show('Calling customer: +91 98425 20011 (demo)', 'info');
  }
  markOut() {
    if (!this.order) return;
    this.data.updateOrderStatus(this.order.id, 'out_for_delivery').then((o) => {
      this.order = o;
      this.toast.show('Marked Out for Delivery', 'success');
    });
  }
  confirm() {
    if (this.entered.trim() !== this.otp.join('')) {
      this.toast.show('Invalid OTP. Try 4821.', 'error');
      return;
    }
    if (!this.order) return;
    this.data.updateOrderStatus(this.order.id, 'delivered').then(() => {
      this.toast.show('Delivery confirmed! Invoice generated 🎉', 'success');
    });
  }
}

@Component({
  selector: 'app-dp-history',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Delivery History" subtitle="Last 30 days of completed deliveries."></app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Area</th><th>Date</th><th>Slot</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let o of history">
            <td><b class="mono">{{ o.id }}</b></td>
            <td>{{ o.customerName }}</td>
            <td>{{ o.area }}</td>
            <td style="font-size:13px">{{ o.deliveryDateLabel }}</td>
            <td style="font-size:13px">{{ o.slotLabel }}</td>
            <td><app-status-badge [status]="o.status" [label]="label(o.status)"></app-status-badge></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class DeliveryPartnerHistory implements OnInit {
  private data = inject(DataService);
  history: Order[] = [];
  ngOnInit() {
    this.data.getOrders().then((o) => (this.history = o.filter((x) => x.status === 'delivered')));
  }
  label(s: string) {
    return s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
}