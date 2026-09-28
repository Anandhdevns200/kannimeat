import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { OrdersTableComponent } from '../../shared/components/orders-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import type { Order } from '../../core/models';

@Component({
  selector: 'app-shop-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatCardComponent, OrdersTableComponent, PageHeaderComponent],
  template: `
    <app-page-header
      title="Good morning, Murugan 👋"
      subtitle="Fresh Meat Centre · Anna Salai, Tindivanam · Order today → deliver tomorrow"
    ></app-page-header>

    <div class="stats">
      <app-stat-card icon="➕" iconBg="#fee2e2" [value]="'' + cnt('placed')" label="New Orders" sub="Today" trend="up" delta="18%"></app-stat-card>
      <app-stat-card icon="🔪" iconBg="#fef3c7" [value]="'' + (cnt('processing') + cnt('confirmed'))" label="Processing" sub="In the cutting room" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="📦" iconBg="#ede9fe" [value]="'' + cnt('packed')" label="Packed" sub="Ready to hand over" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="🚚" iconBg="#dbeafe" [value]="'' + cnt('out_for_delivery')" label="Out for Delivery" sub="On the road" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="✅" iconBg="#dcfce7" [value]="'' + cnt('delivered')" label="Delivered" sub="Today" trend="up" delta="9%"></app-stat-card>
    </div>

    <!-- KEY BUSINESS ADVANTAGE -->
    <div class="card demand mt-4">
      <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:10px">
        <div>
          <b style="font-size:17px">📈 Tomorrow's Demand Forecast</b>
          <div class="text-muted" style="font-size:13px">8 advance orders already booked. Source exactly this much.</div>
        </div>
        <a class="btn btn-soft btn-sm" [routerLink]="['/portal/shop/tomorrow']"><mat-icon style="font-size:17px">event</mat-icon> Tomorrow's Orders</a>
      </div>
      <div class="demand-grid mt-3" *ngIf="demand">
        <div class="demand-tile" [class.high]="demand.chicken != null">
          <span>🐓</span><b>{{ demand.chicken }} KG</b><span class="text-muted">Chicken demand</span>
        </div>
        <div class="demand-tile">
          <span>🐐</span><b>{{ demand.mutton }} KG</b><span class="text-muted">Mutton demand</span>
        </div>
        <div class="demand-tile">
          <span>🐟</span><b>{{ demand.fish }} KG</b><span class="text-muted">Fish demand</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center" style="flex-wrap:wrap;gap:10px">
      <h2 style="margin:0;font-size:18px">Today's Orders</h2>
      <a class="btn btn-ghost btn-sm btn-icon" title="View all orders" [routerLink]="['/portal/shop/orders']"><mat-icon>arrow_forward</mat-icon></a>
    </div>
    <div class="mt-3">
      <app-orders-table [orders]="shopOrders" [searchable]="true" (open)="openOrder($event)"></app-orders-table>
    </div>
  `,
  styles: [
    `
      .demand-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      .demand-tile { display: flex; flex-direction: column; align-items: center; gap: 3px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 12px; padding: 16px; }
      .demand-tile b { font-size: 22px; font-family: Poppins; }
      .demand-tile.high { background: var(--brand-50); border-color: var(--brand-300); }
      @media (max-width: 900px) { .demand-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ShopDashboardPage implements OnInit {
  private data = inject(DataService);
  private router = inject(Router);
  inr = inr;
  shopOrders: Order[] = [];
  today: Record<string, number> = {};
  demand: { chicken: number; mutton: number; fish: number } | null = null;

  ngOnInit() {
    this.data.getOrdersForShop('SH-001').then((orders) => {
      this.shopOrders = orders;
      const t: Record<string, number> = {};
      orders.forEach((o) => {
        t[o.status] = (t[o.status] ?? 0) + 1;
      });
      this.today = t;
    });
    this.computeDemand();
  }

  async computeDemand() {
    const orders = await this.data.getOrdersForShop('SH-001');
    const kg: Record<string, number> = { chicken: 0, mutton: 0, fish: 0 };
    orders.forEach((o) =>
      o.items.forEach((it) => {
        const c = catOf(it.productId);
        kg[c] = (kg[c] ?? 0) + it.weightKg;
      }),
    );
    this.demand = {
      chicken: Math.round((kg['chicken'] || 0) + 28),
      mutton: Math.round((kg['mutton'] || 0) + 16),
      fish: Math.round((kg['fish'] || 0) + 12),
    };
  }
  cnt(key: string) {
    return this.today[key] ?? 0;
  }

  openOrder(id: string) {
    this.router.navigate(['/portal/shop/orders', id]);
  }
}

function catOf(productId: string): 'chicken' | 'mutton' | 'fish' {
  const map: Record<string, 'chicken' | 'mutton' | 'fish'> = {
    'P-001': 'chicken', 'P-002': 'chicken', 'P-003': 'mutton', 'P-004': 'fish',
    'P-005': 'fish', 'P-006': 'mutton', 'P-007': 'chicken', 'P-008': 'fish',
  };
  return map[productId] ?? 'chicken';
}