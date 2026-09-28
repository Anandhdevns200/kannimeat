import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { OrdersTableComponent } from '../../shared/components/orders-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ToastService } from '../../core/services/toast.service';
import type { Order } from '../../core/models';

@Component({
  selector: 'app-super-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent, OrdersTableComponent],
  template: `
    <app-page-header title="Orders" subtitle="Every order on the platform."></app-page-header>
    <app-orders-table [orders]="orders" (open)="open($event)"></app-orders-table>
  `,
})
export class SuperOrders implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  orders: Order[] = [];
  ngOnInit() {
    this.data.getOrders().then((o) => (this.orders = o));
  }
  open(id: string) {
    this.router.navigate(['/portal/super/orders', id]);
  }
}

@Component({
  selector: 'app-super-generic-table',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header [title]="cfg.title" [subtitle]="cfg.sub"></app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:680px">
        <thead><tr><th *ngFor="let h of cfg.head">{{ h }}</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of rows">
            <td><b>{{ r[0] }}</b></td>
            <td *ngFor="let i of middle">{{ r[i] }}</td>
            <td><span class="chip" [class.chip-green]="chipTone(r[last])==='green'" [class.chip-red]="chipTone(r[last])==='red'" [class.chip-slate]="chipTone(r[last])==='slate'" [class.chip-amber]="chipTone(r[last])==='amber'">{{ r[last] }}</span></td>
            <td><button class="btn btn-ghost btn-sm btn-icon" title="View" (click)="toast.show('Detail view (demo)','info')"><mat-icon>visibility</mat-icon></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class SuperGenericTable implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  toast = inject(ToastService);
  kind: string = 'shops';
  rows: any[][] = [];
  middle: number[] = [];
  last = 0;
  cfg: any = { head: [], title: '', sub: '' };
  chipTone(v: unknown): 'green' | 'amber' | 'red' | 'slate' {
    const s = String(v ?? '').toLowerCase();
    if (['active', 'in stock', 'good'].includes(s)) return 'green';
    if (['low'].includes(s)) return 'amber';
    if (['halted', 'out', 'inactive'].includes(s)) return 'red';
    return 'slate';
  }

  constructor() {
    this.kind = (this.router.url.split('/').pop() ?? 'shops') as string;
  }

  ngOnInit() {
    const maps: Record<string, any> = {
      shops: {
        title: 'Shops',
        sub: 'All shops across all companies.',
        head: ['Shop', 'Company', 'City', 'Rating', 'Status', ''],
        rows: () => this.data.getCompanies().then((cs) =>
          cs.flatMap((c: any) => c.shops.map((s: any) => [s.name, c.name, s.city, '⭐ ' + s.rating, s.status]))
        ),
      },
      products: {
        title: 'Products',
        sub: 'Master catalogue (company-level).',
        head: ['Product', 'Company', 'Price', 'Category', 'Stock', ''],
        rows: () => this.data.getCompanies().then((cs) => {
          const c = cs[0] as any;
          return (c?.products ?? []).map((p: any) => [p.name, c.name, inr(p.pricePerKg) + '/KG', p.category, p.inStock ? 'In stock' : 'Out']);
        }),
      },
      inventory: {
        title: 'Inventory',
        sub: 'Stock levels at every shop (KG).',
        head: ['Product', 'Shop', 'Available', 'Reserved', 'Status', ''],
        rows: () => this.data.getInventory().then((inv) =>
          inv.map((i: any) => [i.product, i.shopId, i.availableKg + ' KG', i.reservedKg + ' KG', i.availableKg > 5 ? 'Good' : i.availableKg > 0 ? 'Low' : 'Out'])
        ),
      },
      invoices: {
        title: 'Invoices',
        sub: 'All platform invoices.',
        head: ['Invoice', 'Order', 'Company', 'Amount', 'Paid', ''],
        rows: () => this.data.getInvoices().then((iv) =>
          iv.map((i: any) => [i.id, i.orderId, i.shopName, inr(i.total), i.paymentStatus === 'paid' ? 'Paid' : 'Pending'])
        ),
      },
    };
    const cfg = maps[this.kind] ?? maps['shops'];
    this.cfg = { head: cfg.head, title: cfg.title, sub: cfg.sub };
    this.middle = cfg.head.slice(1, -2).map((_: any, i: number) => i + 1);
    this.last = cfg.head.length - 2;
    cfg.rows().then((rows: any[][]) => (this.rows = rows));
  }
}

@Component({
  selector: 'app-super-reports',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Platform Reports" subtitle="Company-wise platform analytics."></app-page-header>
    <div class="grid">
      <div class="card">
        <b>GMV by company (30d)</b>
        <div class="bar" *ngFor="let r of gmv">
          <span class="grow-1">{{ r.company }}</span>
          <div class="track"><div class="fill" [style.width.%]="r.pct"></div></div>
          <b class="mono">{{ r.val }}</b>
        </div>
      </div>
      <div class="card">
        <b>Orders by status</b>
        <div class="bar" *ngFor="let r of status">
          <span class="grow-1">{{ r.label }}</span>
          <div class="track" style="max-width:none"><div class="fill dim" [style.width.%]="r.pct"></div></div>
          <b class="mono">{{ r.val }}</b>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; }
      .bar { display: flex; gap: 12px; align-items: center; padding: 10px 0; font-size: 13.5px; }
      .track { flex: 1; height: 10px; background: var(--slate-100); border-radius: 999px; overflow: hidden; }
      .fill { height: 100%; background: linear-gradient(90deg, var(--brand-500), var(--brand-600)); border-radius: 999px; }
      .fill.dim { background: var(--slate-300); }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class SuperReports {
  gmv = [
    { company: 'Tindivanam Fresh Foods', val: '₹19.5L', pct: 100 },
    { company: 'Villupuram Fresh Retail', val: '₹8.2L', pct: 42 },
    { company: 'Kovai Farms Ltd', val: '₹0.2L', pct: 2 },
  ];
  status = [
    { label: 'Delivered', val: '76', pct: 76 },
    { label: 'Out for delivery', val: '18', pct: 18 },
    { label: 'Ready', val: '32', pct: 32 },
    { label: 'Processing', val: '14', pct: 14 },
  ];
}

@Component({
  selector: 'app-super-settings',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Platform Settings" subtitle="Global configuration for KanniMeat."></app-page-header>
    <div class="card" style="max-width:640px">
      <div class="set" *ngFor="let s of settings">
        <div class="grow-1"><b>{{ s.name }}</b><div class="text-muted" style="font-size:12.5px">{{ s.desc }}</div></div>
        <span class="chip" [class.chip-green]="s.on">{{ s.on ? 'ON' : 'OFF' }}</span>
      </div>
      <table class="responsive-table mt-4">
        <tbody>
          <tr><td><div><b>Commission</b><div class="text-muted" style="font-size:12.5px">Per order from shops</div></div></td><td><b class="mono">5.0%</b></td></tr>
          <tr><td><div><b>Cut-off time</b><div class="text-muted" style="font-size:12.5px">Last order for tomorrow delivery</div></div></td><td><b>6:00 PM</b></td></tr>
          <tr><td><div><b>Delivery windows</b><div class="text-muted" style="font-size:12.5px">Morning slots offered</div></div></td><td><b>6–9 AM · 9–11 AM</b></td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`.set { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--slate-100); } .set:last-child { border-bottom: none; }`],
})
export class SuperSettings {
  settings = [
    { name: 'New customer onboarding', desc: 'Allow new customer registrations', on: true },
    { name: 'COD for new cities', desc: 'Allow cash on delivery everywhere', on: true },
    { name: 'Dynamic pricing', desc: 'Market-based prices per city', on: false },
    { name: 'Weekend delivery', desc: 'Deliveries on all 7 days', on: false },
  ];
}