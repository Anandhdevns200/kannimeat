import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-super-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, StatCardComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Platform Overview" subtitle="Super Admin Console · KanniMeat Platform"></app-page-header>

    <div class="stats">
      <app-stat-card icon="🏢" iconBg="#fef3c7" value="3" label="Companies" sub="1 pending verification" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="🏪" iconBg="#dbeafe" value="9" label="Shops" sub="Across 5 cities" trend="up" delta="2"></app-stat-card>
      <app-stat-card icon="🪙" iconBg="#dcfce7" value="₹46.2L" label="GMV (30d)" sub="Commission ₹2.3L" trend="up" delta="18%"></app-stat-card>
      <app-stat-card icon="👥" iconBg="#ede9fe" value="3,842" label="Customers" sub="1,284 repeat" trend="up" delta="11%"></app-stat-card>
      <app-stat-card icon="🚚" iconBg="#ccfbf1" value="212" label="Partners" sub="94 active today" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="🧾" iconBg="#fee2e2" value="97.4%" label="Fulfilment" sub="On-time rate" trend="up" delta="0.4%"></app-stat-card>
    </div>

    <div class="grid mt-4">
      <div class="grid-inner">
        <div class="card">
          <b>Companies</b>
          <div class="comp" *ngFor="let c of companies">
            <div style="display:flex;gap:10px;align-items:center" class="grow-1">
              <span style="font-size:22px">🏢</span>
              <div>
                <b>{{ c.name }}</b>
                <div class="text-muted" style="font-size:12px">{{ c.city }} · {{ c.shops.length }} shops</div>
              </div>
            </div>
            <app-status-badge [status]="c.status" [label]="c.status | titlecase"></app-status-badge>
            <button class="btn btn-ghost btn-xs btn-sm" (click)="verify(c)">{{ c.status === 'verified' ? 'Review' : 'Verify' }}</button>
          </div>
        </div>
        <div class="card">
          <b>City Coverage</b>
          <div class="city" *ngFor="let c of cities">
            <span class="grow-1">{{ c.name }}</span>
            <b class="mono">{{ c.shops }} shops</b>
            <b class="mono">{{ c.orders }} orders</b>
          </div>
        </div>
      </div>
      <div class="card">
        <b>Pending Actions</b>
        <div class="pend" *ngFor="let p of pending">
          {{ p }}
        </div>
        <mat-divider style="margin:12px 0"></mat-divider>
        <b>Platform Settings</b>
        <div class="set">
          <span>Commission (per order)</span><b class="mono">5.0%</b>
        </div>
        <div class="set">
          <span>Go-live cities</span><b>5 / 8</b>
        </div>
        <div class="set">
          <span>Cut-off time</span><b>6:00 PM</b>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1.5fr .5fr; gap: 14px; align-items: start; }
      .grid-inner { display: flex; flex-direction: column; gap: 14px; }
      .comp { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--slate-100); flex-wrap: wrap; }
      .comp:last-child { border-bottom: none; }
      .city { display: flex; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px dashed var(--slate-100); font-size: 13.5px; }
      .pend { padding: 7px 0; border-bottom: 1px dashed var(--slate-100); font-size: 13.5px; color: var(--slate-700); }
      .pend::before { content: '• '; color: var(--amber-500); font-weight: 800; }
      .set { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13.5px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class SuperDashboard implements OnInit {
  private data = inject(DataService);
  private toast = inject(ToastService);
  companies: any[] = [];
  cities: any[] = [];
  pending = [
    'Fresh Farms Trading Pvt Ltd — registration pending verification',
    '2 new shops await assignment to delivery hub',
    '3 refund requests need approval',
  ];

  ngOnInit() {
    this.data.getCompanies().then((c) => (this.companies = c));
    this.cities = [
      { name: 'Tindivanam', shops: 3, orders: 194 },
      { name: 'Villupuram', shops: 4, orders: 142 },
    ];
  }
  verify(c: any) {
    this.toast.show(`Verification flow for ${c.name} (demo)`, 'info');
  }
}

@Component({
  selector: 'app-super-pages',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header [title]="title" [subtitle]="subtitle"></app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:700px">
        <thead><tr><th *ngFor="let h of headers">{{ h }}</th></tr></thead>
        <tbody>
          <tr *ngFor="let r of rows">
            <td><b>{{ r[0] }}</b></td>
            <td *ngFor="let c of cols">{{ r[c] }}</td>
            <td><button class="btn btn-soft btn-sm btn-icon" title="View" (click)="action()"><mat-icon>visibility</mat-icon></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class SuperListPage implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  private toast = inject(ToastService);
  kind = 'companies' as any;
  title = '';
  subtitle = '';
  headers: string[] = [];
  rows: any[][] = [];
  cols: number[] = [];

  constructor() {
    const seg = (this.router.url.split('/').pop() ?? 'companies') as any;
    this.kind = seg;
    const cfg: Record<string, any> = {
      companies: {
        title: 'Companies',
        sub: 'All registered companies on the platform.',
        head: ['Company', 'City', 'Shops', 'GSTIN', 'Status', ''],
        map: (c: any) => [c.name, c.city, c.shops.length, c.gstin, c.status],
      },
      users: {
        title: 'Users',
        sub: 'All accounts across roles.',
        head: ['Name', 'Role', 'Shop / Company', 'Phone', 'Status', ''],
        map: (u: any) => [u.name, u.role, u.shopId ?? u.companyId ?? '—', u.phone, u.status],
      },
      partners: {
        title: 'Delivery Partners',
        sub: 'All registered delivery partners.',
        head: ['Name', 'Area', 'Vehicle', 'Phone', 'Status', ''],
        map: (p: any) => [p.name, p.area, p.vehicle, p.phone, p.status],
      },
    };
    const c = cfg[this.kind] ?? cfg['companies'];
    this.title = c.title;
    this.subtitle = c.sub;
    this.headers = c.head;
    this.cols = c.head.slice(1, -1).map((_: unknown, i: number) => i + 1);
    if (this.kind === 'users') {
      this.data.getEmployees().then((e) => {
        this.rows = e.map(c.map);
      });
    } else if (this.kind === 'partners') {
      this.data.getDeliveryPartners().then((p) => {
        this.rows = p.map(c.map);
      });
    } else {
      this.data.getCompanies().then((cs) => {
        this.rows = cs.map(c.map);
      });
    }
  }
  ngOnInit() {}
  action() {
    this.toast.show('Detail view (demo)', 'info');
  }
}

@Component({
  selector: 'app-super-payouts',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Settlements & Payouts" subtitle="Platform commission and shop payouts."></app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:720px">
        <thead><tr><th>Company</th><th>GMV (30d)</th><th>Commission</th><th>Payout Due</th><th>Cycles</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of payouts">
            <td><b>{{ p.company }}</b></td>
            <td class="mono">{{ p.gmv }}</td>
            <td class="mono">{{ p.comm }}</td>
            <td class="mono">{{ p.due }}</td>
            <td style="font-size:13px">{{ p.cycles }}</td>
            <td><app-status-badge [status]="p.status" [label]="p.status | titlecase"></app-status-badge></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class SuperPayouts {
  payouts = [
    { company: 'Tindivanam Fresh Foods', gmv: '₹19.5L', comm: '₹97.5k', due: '₹18.5L', cycles: 'Bi-weekly', status: 'pending' },
    { company: 'Villupuram Fresh Retail', gmv: '₹8.2L', comm: '₹41k', due: '₹7.8L', cycles: 'Bi-weekly', status: 'pending' },
    { company: 'Kovai Farms Ltd', gmv: '₹0.2L', comm: '₹1k', due: '₹0.2L', cycles: 'Bi-weekly', status: 'halted' },
  ];
}

@Component({
  selector: 'app-super-regions',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Regions & Coverage" subtitle="Manage cities, delivery hubs and go-live status.">
      <button class="btn btn-brand btn-sm"><mat-icon style="font-size:18px">add</mat-icon> Add City</button>
    </app-page-header>
    <div class="grid">
      <div class="card city-card" *ngFor="let r of regions">
        <div class="flex justify-between items-center">
          <b style="font-size:15px">🏙️ {{ r.name }}</b>
          <span class="chip" [class.chip-green]="r.live" [class.chip-slate]="!r.live">{{ r.live ? 'LIVE' : 'COMING SOON' }}</span>
        </div>
        <div class="text-muted" style="font-size:13px;margin-top:6px">{{ r.shops }} shops · {{ r.hubs }} hubs · {{ r.partners }} partners</div>
        <div class="text-muted" style="font-size:12.5px;margin-top:2px">Cut-off {{ r.cutoff }} · Delivery {{ r.delivery }}till 11 AM</div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 14px; }
      .city-card { padding: 18px; }
    `,
  ],
})
export class SuperRegions {
  regions = [
    { name: 'Tindivanam', shops: 3, hubs: 1, partners: 18, live: true, cutoff: '6 PM', delivery: '6 AM' },
    { name: 'Villupuram', shops: 4, hubs: 1, partners: 22, live: true, cutoff: '6 PM', delivery: '6 AM' },
    { name: 'Puducherry', shops: 0, hubs: 0, partners: 0, live: false, cutoff: '—', delivery: '—' },
    { name: 'Chengalpattu', shops: 0, hubs: 0, partners: 0, live: false, cutoff: '—', delivery: '—' },
    { name: 'Kanchipuram', shops: 0, hubs: 0, partners: 0, live: false, cutoff: '—', delivery: '—' },
  ];
}