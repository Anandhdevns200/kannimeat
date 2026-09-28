import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatCardComponent, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Company Dashboard" subtitle="Tindivanam Fresh Foods Private Limited · GSTIN 33AAKCM1234F1Z5">
    </app-page-header>

    <div class="stats">
      <app-stat-card icon="🏪" iconBg="#fef3c7" value="4" label="Total Shops" sub="3 active · 1 paused" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="🧾" iconBg="#dbeafe" value="274" label="Orders (30d)" sub="132 Tindivanam · 142 Villupuram" trend="up" delta="14%"></app-stat-card>
      <app-stat-card icon="🪙" iconBg="#dcfce7" value="₹19.5L" label="Revenue (30d)" sub="vs ₹16.2L last month" trend="up" delta="20%"></app-stat-card>
      <app-stat-card icon="👥" iconBg="#ede9fe" value="1,284" label="Customers" sub="274 repeat this month" trend="up" delta="9%"></app-stat-card>
      <app-stat-card icon="⏳" iconBg="#fee2e2" value="6" label="Pending Orders" sub="Needs processing" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="🚚" iconBg="#ccfbf1" value="97%" label="Delivery Performance" sub="On time" trend="up" delta="1%"></app-stat-card>
    </div>

    <div class="grid mt-4">
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <b>Shop Performance</b>
          <button class="btn btn-brand btn-sm" (click)="addShop()"><mat-icon style="font-size:18px">add</mat-icon> Add Shop</button>
        </div>
        <table class="responsive-table">
          <thead><tr><th>Shop</th><th>Location</th><th>Manager</th><th>Orders</th><th>Revenue</th><th>Status</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of shops">
              <td><b>{{ s.name }}</b></td>
              <td>{{ s.area }}, {{ s.city }}</td>
              <td style="font-size:13.5px">{{ s.managerName }}</td>
              <td class="mono" *ngIf="s.status==='active'">{{ s.ordersToday }}/day</td>
              <td class="mono" *ngIf="s.status!=='active'">—</td>
              <td class="mono">₹{{ (s.revenueThisMonth/1000).toFixed(0) }}k</td>
              <td><app-status-badge [status]="s.status" [label]="s.status | titlecase"></app-status-badge></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <b>City Breakdown</b>
        <div class="city" *ngFor="let c of cityData">
          <div class="grow-1">
            <b>{{ c.city }}</b>
            <div class="text-muted" style="font-size:12.5px">{{ c.orders }} orders · {{ c.shops }} shops</div>
          </div>
          <div class="track"><div class="fill" [style.width.%]="c.pct"></div></div>
          <b class="mono" style="font-size:13px">₹{{ c.rev }}k</b>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1.4fr .6fr; gap: 14px; align-items: start; }
      .city { display: flex; gap: 10px; align-items: center; padding: 8px 0; }
      .track { flex: 1; height: 10px; background: var(--slate-100); border-radius: 999px; overflow: hidden; }
      .fill { height: 100%; background: linear-gradient(90deg, var(--brand-500), var(--brand-600)); border-radius: 999px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CompanyDashboard implements OnInit {
  private data = inject(DataService);
  private toast = inject(ToastService);
  shops: any[] = [];
  cityData = [
    { city: 'Tindivanam', orders: 132, shops: 2, rev: 1450, pct: 100 },
    { city: 'Villupuram', orders: 142, shops: 2, rev: 620, pct: 60 },
  ];

  ngOnInit() {
    this.data.getCompanies().then((c) => {
      const comp = c.find((x) => x.id === 'CMP-001');
      if (comp) this.shops = comp.shops;
    });
  }
  addShop() {
    this.toast.show('Add shop wizard (demo)', 'info');
  }
}

@Component({
  selector: 'app-company-shops',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Shops" subtitle="Manage your shops, managers and status.">
      <button class="btn btn-brand btn-sm" (click)="toast.show('Add shop wizard (demo)','info')"><mat-icon style="font-size:18px">add</mat-icon> Add Shop</button>
    </app-page-header>

    <div class="tree card mb-3">
      <b>Company → Cities → Shops</b>
      <div class="tree-city" *ngFor="let c of grouped">
        <div class="city-head">🏙️ <b>{{ c.city }}</b> <span class="chip chip-slate">{{ c.shops.length }} shops</span></div>
        <div class="tree-shops">
          <div class="tree-shop" *ngFor="let s of c.shops">
            <span>🏪</span><b>{{ s.name }}</b>
            <span class="text-muted" style="font-size:12.5px">{{ s.managerName }}</span>
            <span class="chip" [class.chip-green]="s.status==='active'" [class.chip-red]="s.status!=='active'">{{ s.status }}</span>
            <button class="btn btn-ghost btn-sm btn-icon" title="Edit shop" (click)="toast.show('Edit '+s.name+' (demo)','info')"><mat-icon>edit</mat-icon></button>
          </div>
        </div>
      </div>
    </div>

    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table">
        <thead><tr><th>Shop</th><th>Location</th><th>Manager</th><th>Phone</th><th>Rating</th><th>Revenue</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let s of shops">
            <td><b>{{ s.name }}</b></td>
            <td>{{ s.area }}, {{ s.city }}</td>
            <td>{{ s.managerName }}</td>
            <td class="mono" style="font-size:12.5px">{{ s.managerPhone }}</td>
            <td>⭐ {{ s.rating }}</td>
            <td class="mono">₹{{ (s.revenueThisMonth/1000).toFixed(0) }}k</td>
            <td><app-status-badge [status]="s.status" [label]="s.status | titlecase"></app-status-badge></td>
            <td>
              <button class="btn btn-ghost btn-sm" (click)="manageStaff(s)">Staff</button>
              <button class="btn btn-soft btn-sm" (click)="perf(s)">Performance</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .tree-city { border: 1px solid var(--slate-200); border-radius: 12px; margin-top: 10px; overflow: hidden; }
      .city-head { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: var(--slate-50); }
      .tree-shops { display: flex; flex-direction: column; }
      .tree-shop { display: flex; align-items: center; gap: 10px; padding: 10px 14px 10px 30px; border-top: 1px solid var(--slate-100); flex-wrap: wrap; }
      .tree-shop b { flex: 1; }
    `,
  ],
})
export class CompanyShops implements OnInit {
  private data = inject(DataService);
  toast = inject(ToastService);
  shops: any[] = [];
  grouped: any[] = [];

  ngOnInit() {
    this.data.getCompanies().then((c) => {
      const comp = c.find((x) => x.id === 'CMP-001');
      if (comp) {
        this.shops = comp.shops;
        const map: Record<string, any[]> = {};
        comp.shops.forEach((s) => {
          (map[s.city] ??= []).push(s);
        });
        this.grouped = Object.entries(map).map(([city, shops]) => ({ city, shops }));
      }
    });
  }
  manageStaff(s: any) {
    this.toast.show(`Manage staff for ${s.name} (demo)`, 'info');
  }
  perf(s: any) {
    this.toast.show(`Performance report for ${s.name} (demo)`, 'info');
  }
}

@Component({
  selector: 'app-company-employees',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Employees" subtitle="Shop admins and staff across your company.">
      <button class="btn btn-brand btn-sm" (click)="toast.show('Invite employee (demo)','info')">+ Invite</button>
    </app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:640px">
        <thead><tr><th>Name</th><th>Role</th><th>Shop</th><th>Phone</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let e of employees">
            <td><b>{{ e.name }}</b></td>
            <td>{{ e.role }}</td>
            <td style="font-size:13.5px">{{ shopName(e.shopId) }}</td>
            <td class="mono" style="font-size:12.5px">{{ e.phone }}</td>
            <td><app-status-badge [status]="e.status" [label]="e.status | titlecase"></app-status-badge></td>
            <td><button class="btn btn-ghost btn-sm" (click)="toast.show('Roles & permissions (demo)','info')">Roles</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class CompanyEmployees implements OnInit {
  private data = inject(DataService);
  toast = inject(ToastService);
  employees: any[] = [];
  shops: any[] = [];

  ngOnInit() {
    this.data.getEmployees().then((e) => (this.employees = e));
    this.data.getShops().then((s) => (this.shops = s));
  }
  shopName(id: string) {
    return this.shops.find((s) => s.id === id)?.name ?? id;
  }
}