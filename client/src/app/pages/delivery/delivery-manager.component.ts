import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { OrdersTableComponent } from '../../shared/components/orders-table.component';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import type { DeliveryPartner, Order } from '../../core/models';

@Component({
  selector: 'app-dm-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatCardComponent, EmptyStateComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Delivery Hub" subtitle="Tindivanam Hub · assign partners, track active, close deliveries."></app-page-header>

    <div class="stats">
      <app-stat-card icon="📦" iconBg="#fef3c7" value="32" label="Ready for Delivery" sub="Unassigned" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="✍️" iconBg="#dbeafe" value="24" label="Assigned" sub="Partner confirmed" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="🚚" iconBg="#ede9fe" value="18" label="Out for Delivery" sub="On the road now" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="✅" iconBg="#dcfce7" value="76" label="Delivered" sub="Today" trend="up" delta="12%"></app-stat-card>
      <app-stat-card icon="⚠️" iconBg="#fee2e2" value="2" label="Failed" sub="Needs attention" trend="down" delta="1"></app-stat-card>
    </div>

    <div class="grid mt-4">
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <b>Ready Orders (unassigned)</b>
          <a class="btn btn-soft btn-sm" [routerLink]="['/portal/delivery-manager/assign']"><mat-icon style="font-size:17px">assignment_turned_in</mat-icon> Assign Now</a>
        </div>
        <table class="responsive-table">
          <thead><tr><th>Order</th><th>Area</th><th>Slot</th><th>Items</th><th></th></tr></thead>
          <tbody>
            <tr *ngFor="let o of readyOrders">
              <td><b class="mono">{{ o.id }}</b></td>
              <td>{{ o.area }}</td>
              <td style="font-size:13px">{{ o.slotLabel }}</td>
              <td style="font-size:13px">{{ o.totalKg }} KG</td>
              <td><button class="btn btn-brand btn-sm" (click)="assignModal(o)"><mat-icon style="font-size:17px">person_add</mat-icon> Assign</button></td>
            </tr>
          </tbody>
        </table>
        <app-empty-state *ngIf="!readyOrders.length" icon="✅" title="All clear" message="No unassigned orders."></app-empty-state>
      </div>

      <div class="card">
        <b>Active Partners</b>
        <p class="text-muted" style="font-size:13px;margin:2px 0 8px">Live in Tindivanam right now</p>
        <div class="partner" *ngFor="let p of activePartners">
          <div class="avatar">{{ init(p.name) }}</div>
          <div class="grow-1">
            <b style="font-size:14px">{{ p.name }}</b>
            <div class="text-muted" style="font-size:12px">{{ p.area }} · {{ p.vehicle }}</div>
          </div>
          <span class="chip chip-green">● {{ countFor(p.id) }} active</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1.4fr .6fr; gap: 14px; align-items: start; }
      .partner { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--slate-100); }
      .partner:last-child { border-bottom: none; }
      .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--brand-600); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class DeliveryManagerDashboard implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastService);
  inr = inr;
  readyOrders: Order[] = [];
  allOrders: Order[] = [];
  partners: DeliveryPartner[] = [];

  get activePartners() {
    return this.partners.filter((p) => p.status === 'active');
  }
  countFor(partnerId: string) {
    return this.allOrders.filter((o) => o.deliveryPartnerId === partnerId && o.status === 'out_for_delivery').length;
  }

  ngOnInit() {
    this.data.getOrders().then((o) => {
      this.allOrders = o;
      this.readyOrders = o.filter((x) => x.status === 'ready' && !x.assigned);
    });
    this.data.getDeliveryPartners().then((p) => (this.partners = p));
  }
  init(name: string) {
    return name.split(' ').map((s) => s[0]).slice(0, 2).join('');
  }
  assignModal(o: Order) {
    const partner = this.partners.find((p) => p.area === o.area) ?? this.partners[0];
    if (!partner) return;
    this.data.assignDelivery(o.id, partner.id).then(() => {
      this.toast.show(`Order ${o.id} assigned to ${partner.name}`, 'success');
      this.readyOrders = this.readyOrders.filter((x) => x.id !== o.id);
    });
  }
}

@Component({
  selector: 'app-dm-assign',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Assign Delivery" subtitle="Auto-suggest partner by area — tap assign to confirm."></app-page-header>
    <div class="table-scroll card" style="padding:0" *ngIf="orders.length">
      <table class="responsive-table" style="min-width:760px">
        <thead><tr><th>Order</th><th>Customer</th><th>Area</th><th>Slot</th><th>Weight</th><th>Suggested Partner</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let o of orders">
            <td><b class="mono">{{ o.id }}</b></td>
            <td>{{ o.customerName }}</td>
            <td>{{ o.area }}</td>
            <td style="font-size:13px">{{ o.slotLabel }}</td>
            <td>{{ o.totalKg }} KG</td>
            <td>
              <mat-form-field appearance="outline" style="min-width:170px;margin:0">
                <mat-select [(ngModel)]="assignments[o.id]" placeholder="Choose partner">
                  <mat-option *ngFor="let p of partnersFor(o)" [value]="p.id">{{ p.name }} · {{ p.area }}</mat-option>
                </mat-select>
              </mat-form-field>
            </td>
            <td>
              <button class="btn btn-brand btn-sm" [disabled]="!assignments[o.id]" (click)="assign(o)"><mat-icon style="font-size:17px">assignment_turned_in</mat-icon> Assign</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <app-empty-state *ngIf="!orders.length" icon="✅" title="All assigned" message="No ready orders waiting for a partner."></app-empty-state>
  `,
})
export class DeliveryManagerAssign implements OnInit {
  private data = inject(DataService);
  private toast = inject(ToastService);
  orders: Order[] = [];
  partners: DeliveryPartner[] = [];
  assignments: Record<string, string> = {};

  ngOnInit() {
    this.data.getOrders().then((o) => {
      const ready = o.filter((x) => x.status === 'ready' && !x.assigned);
      const out = o.filter((x) => x.status === 'out_for_delivery' && !x.assigned);
      this.orders = [...ready, ...out];
      this.orders.forEach((x) => {
        const p = this.partners.find((pp) => pp.area === x.area);
        if (p) this.assignments[x.id] = p.id;
      });
    });
    this.data.getDeliveryPartners().then((p) => (this.partners = p));
  }
  partnersFor(o: Order) {
    const sameArea = this.partners.filter((p) => p.area === o.area && p.status === 'active');
    return sameArea.length ? sameArea : this.partners.filter((p) => p.status === 'active');
  }
  assign(o: Order) {
    const pid = this.assignments[o.id];
    if (!pid) return;
    this.data.assignDelivery(o.id, pid).then(() => {
      const p = this.partners.find((x) => x.id === pid);
      this.toast.show(`Order ${o.id} → ${p?.name}`, 'success');
      this.orders = this.orders.filter((x) => x.id !== o.id);
    });
  }
}

@Component({
  selector: 'app-dm-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, OrdersTableComponent],
  template: `
    <app-page-header [title]="title" [subtitle]="subtitle"></app-page-header>
    <app-orders-table [orders]="orders" (open)="open($event)"></app-orders-table>
  `,
})
export class DeliveryManagerList implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  kind = 'active';
  orders: Order[] = [];
  get title() {
    const t: Record<string, string> = { ready: 'Ready Orders', active: 'Active Deliveries', completed: 'Completed Deliveries', failed: 'Failed Deliveries' };
    return t[this.kind] ?? '';
  }
  get subtitle() {
    const s: Record<string, string> = {
      ready: 'Packed and ready — assign a partner to dispatch.',
      active: 'Deliveries currently on the road.',
      completed: 'Delivered and closed. Invoice generated automatically.',
      failed: 'Unable to complete. Retry or refund.',
    };
    return s[this.kind] ?? '';
  }

  constructor() {
    const seg = this.router.url.split('/').pop() ?? '';
    this.kind = seg;
  }

  ngOnInit() {
    this.data.getOrders().then((o) => {
      const map: Record<string, (x: Order) => boolean> = {
        ready: (x) => x.status === 'ready',
        active: (x) => x.status === 'out_for_delivery',
        completed: (x) => x.status === 'delivered',
        failed: (x) => x.status === 'failed',
      };
      this.orders = o.filter(map[this.kind] ?? (() => false));
    });
  }
  open(id: string) {
    this.router.navigate(['/portal/delivery-manager', this.kind, id]);
  }
}