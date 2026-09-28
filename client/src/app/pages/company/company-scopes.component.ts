import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DataService, inr } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { OrdersTableComponent } from '../../shared/components/orders-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { ToastService } from '../../core/services/toast.service';
import { AddProductDialogComponent, type ShopOption } from '../../shared/components/add-product-dialog.component';
import type { InventoryItem, Order, Product } from '../../core/models';

@Component({
  selector: 'app-company-reports',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Reports" subtitle="Analytics across shops and cities.">
      <span class="btn btn-ghost btn-sm btn-icon"><mat-icon style="font-size:17px">calendar_today</mat-icon> Last 30 days</span>
      <button class="btn btn-brand btn-sm"><mat-icon style="font-size:18px">file_download</mat-icon> Export CSV</button>
    </app-page-header>

    <div class="stats">
      <div class="card kpi"><span class="k">Orders</span><b>274</b><i>+14% vs last month</i></div>
      <div class="card kpi"><span class="k">Revenue</span><b>₹19.5L</b><i>+20% vs last month</i></div>
      <div class="card kpi"><span class="k">AOV</span><b>₹711</b><i>+5% vs last month</i></div>
      <div class="card kpi"><span class="k">Repeat rate</span><b>47%</b><i>+3% vs last month</i></div>
    </div>

    <div class="grid mt-4">
      <div class="card">
        <b>Orders by category</b>
        <div class="bar" *ngFor="let r of byCat">
          <span class="grow-1">{{ r.label }}</span>
          <div class="track"><div class="fill" [style.width.%]="r.pct"></div></div>
          <b class="mono">{{ r.val }}</b>
        </div>
      </div>
      <div class="card">
        <b>Top selling cuts</b>
        <table class="responsive-table" *ngIf="top">
          <thead><tr><th>Product</th><th>KG sold</th><th>Revenue</th></tr></thead>
          <tbody>
            <tr *ngFor="let t of top">
              <td>{{ t.name }}</td><td class="mono">{{ t.kg }}</td><td class="mono">{{ inr(t.rev) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .kpi { display: flex; flex-direction: column; gap: 6px; }
      .kpi b { font-size: 26px; font-family: Poppins; }
      .kpi i { font-style: normal; font-size: 12px; color: var(--slate-400); }
      .kpi .k { color: var(--slate-500); font-size: 13px; }
      .grid { display: grid; grid-template-columns: 1.4fr .6fr; gap: 14px; align-items: start; }
      .bar { display: flex; gap: 12px; align-items: center; padding: 9px 0; font-size: 13.5px; }
      .track { flex: 1; height: 10px; background: var(--slate-100); border-radius: 999px; overflow: hidden; }
      .fill { height: 100%; background: linear-gradient(90deg, var(--brand-500), var(--brand-600)); border-radius: 999px; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CompanyReports {
  inr = inr;
  byCat = [
    { label: 'Chicken', val: '1,026 KG', pct: 100 },
    { label: 'Mutton', val: '312 KG', pct: 30 },
    { label: 'Fish', val: '184 KG', pct: 18 },
    { label: 'Eggs & others', val: '492 KG', pct: 24 },
  ];
  top = [
    { name: 'Chicken · Curry Cut', kg: '512', rev: 81920 },
    { name: 'Chicken · Breast', kg: '172', rev: 29240 },
    { name: 'Mutton · Curry Cut', kg: '98', rev: 58800 },
    { name: 'Chicken · Whole', kg: '204', rev: 22440 },
    { name: 'Fish · Vanjaram', kg: '38', rev: 22800 },
  ];
}

@Component({
  selector: 'app-company-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent, OrdersTableComponent],
  template: `
    <app-page-header title="Orders" subtitle="All orders across your company's shops."></app-page-header>
    <app-orders-table [orders]="orders" (open)="openOrder($event)"></app-orders-table>
  `,
})
export class CompanyOrders implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  orders: Order[] = [];
  ngOnInit() {
    this.data.getOrders().then((o) => (this.orders = o));
  }
  openOrder(id: string) {
    this.router.navigate(['/portal/company/orders-overview', id]);
  }
}

@Component({
  selector: 'app-company-products',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, MatDialogModule],
  template: `
    <app-page-header title="Products" subtitle="Master catalogue for your company.">
      <button class="btn btn-brand btn-sm" (click)="openAdd()"><mat-icon style="font-size:18px">add</mat-icon> Add Product</button>
    </app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:700px">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Cuts</th><th>In stock</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of products">
            <td><span style="font-size:20px;margin-right:6px">{{ p.emoji }}</span><b>{{ p.name }}</b></td>
            <td><span class="chip chip-slate">{{ p.category | titlecase }}</span></td>
            <td class="mono">{{ inr(p.pricePerKg) }}/KG</td>
            <td style="font-size:12.5px">{{ p.cuts.join(', ') }}</td>
            <td><span class="chip" [class.chip-green]="p.inStock" [class.chip-red]="!p.inStock">{{ p.inStock ? 'Yes' : 'No' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class CompanyProducts implements OnInit {
  private data = inject(DataService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  inr = inr;
  products: Product[] = [];
  shops: ShopOption[] = [];
  ngOnInit() {
    this.load();
    this.data.getShops().then((s) => (this.shops = s.map((x) => ({ id: x.id, name: x.name, area: x.area, city: x.city }))));
  }
  load() {
    this.data.getProducts().then((p) => (this.products = p));
  }
  openAdd() {
    const ref = this.dialog.open(AddProductDialogComponent, {
      data: { shopId: this.shops[0]?.id ?? 'SH-001', shopName: this.shops[0]?.name ?? 'Shop', shopArea: this.shops[0]?.area ?? '', city: this.shops[0]?.city ?? '', shops: this.shops },
      width: '560px',
    });
    ref.afterClosed().subscribe((p: Omit<Product, 'id'> | null) => {
      if (!p) return;
      this.data.addProduct(p).then(() => {
        this.toast.show(`${p.name} added to the catalogue`, 'success');
        this.load();
      });
    });
  }
}

@Component({
  selector: 'app-company-inventory',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Inventory" subtitle="Stock across all shops, in KG."></app-page-header>
    <div class="grid">
      <div class="card" *ngFor="let it of items">
        <div class="flex items-center gap-2">
          <span style="font-size:26px">{{ it.emoji }}</span>
          <div class="grow-1"><b>{{ it.product }}</b><div class="text-muted" style="font-size:12px">{{ it.category | titlecase }} → {{ shopName(it.shopId) }}</div></div>
          <span class="chip" [class.chip-green]="it.availableKg>5" [class.chip-amber]="it.availableKg<=5 && it.availableKg>0" [class.chip-red]="it.availableKg===0">{{ level(it) }}</span>
        </div>
        <div class="stats mt-2" style="display:flex;gap:14px;font-size:13px">
          <span>Available <b class="mono">{{ it.availableKg }} KG</b></span>
          <span>Reserved <b class="mono">{{ it.reservedKg }} KG</b></span>
          <span>Expected <b class="mono">{{ it.expectedDemandKg }} KG</b></span>
        </div>
      </div>
    </div>
  `,
  styles: [`.grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 14px; }`],
})
export class CompanyInventory implements OnInit {
  private data = inject(DataService);
  items: InventoryItem[] = [];
  ngOnInit() {
    this.data.getInventory().then((i) => (this.items = i));
  }
  shopName(id: string) {
    return id === 'SH-001' ? 'Fresh Meat Centre' : id === 'SH-002' ? 'Sri Chicken & Mutton' : 'Local Fresh Foods';
  }
  level(it: InventoryItem) {
    if (it.availableKg === 0) return 'Out';
    if (it.availableKg <= 5) return 'Low';
    return 'In stock';
  }
}

@Component({
  selector: 'app-company-deliveries',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, OrdersTableComponent],
  template: `
    <app-page-header title="Deliveries" subtitle="Delivery operations across your company."></app-page-header>
    <mat-tab-group>
      <mat-tab label="Out for Delivery">
        <div style="padding-top:14px"><app-orders-table [orders]="out" [actions]="[]"></app-orders-table></div>
      </mat-tab>
      <mat-tab label="Delivered Today">
        <div style="padding-top:14px"><app-orders-table [orders]="done" [actions]="[]"></app-orders-table></div>
      </mat-tab>
    </mat-tab-group>
  `,
})
export class CompanyDeliveries implements OnInit {
  private data = inject(DataService);
  out: Order[] = [];
  done: Order[] = [];
  ngOnInit() {
    this.data.getOrders().then((o) => {
      this.out = o.filter((x) => x.status === 'out_for_delivery');
      this.done = o.filter((x) => x.status === 'delivered');
    });
  }
}

@Component({
  selector: 'app-company-payments',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Payments" subtitle="Settlement and payment reconciliation."></app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Settlement</th></tr></thead>
        <tbody>
          <tr *ngFor="let p of payments">
            <td class="mono"><b>{{ p.orderId }}</b></td>
            <td>{{ p.customer }}</td>
            <td><span class="chip chip-slate">{{ p.method }}</span></td>
            <td class="mono">{{ inr(p.amount) }}</td>
            <td><app-status-badge [status]="p.status" [label]="p.status | uppercase"></app-status-badge></td>
            <td style="font-size:13px">{{ p.settlement }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class CompanyPayments implements OnInit {
  private data = inject(DataService);
  payments: any[] = [];
  inr = inr;
  ngOnInit() {
    this.data.getOrders().then((o) => {
      this.payments = o.slice(0, 8).map((x) => ({
        orderId: x.id,
        customer: x.customerName,
        method: x.paymentMethod.toUpperCase(),
        amount: x.total,
        status: x.paymentStatus,
        settlement: x.paymentStatus === 'paid' ? 'Settled to shop' : 'Pending pickup',
      }));
    });
  }
}

@Component({
  selector: 'app-company-invoices',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Invoices" subtitle="Company-wide invoices.">
      <button class="btn btn-ghost btn-sm"><mat-icon style="font-size:18px">file_download</mat-icon> Export</button>
    </app-page-header>
    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table">
        <thead><tr><th>Invoice</th><th>Order</th><th>Shop</th><th>Amount</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let inv of invoices">
            <td class="mono"><b>{{ inv.id }}</b></td>
            <td class="mono">{{ inv.orderId }}</td>
            <td>{{ inv.shopName }}</td>
            <td class="mono">{{ inr(inv.total) }}</td>
            <td><span class="chip" [class.chip-green]="inv.paymentStatus==='paid'" [class.chip-amber]="inv.paymentStatus!=='paid'">{{ inv.paymentStatus | uppercase }}</span></td>
            <td><a class="btn btn-ghost btn-sm btn-icon" title="View invoice" [routerLink]="['/invoice', inv.id]"><mat-icon>visibility</mat-icon></a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class CompanyInvoices implements OnInit {
  private data = inject(DataService);
  inr = inr;
  invoices: any[] = [];
  ngOnInit() {
    this.data.getInvoices().then((i) => (this.invoices = i));
  }
}