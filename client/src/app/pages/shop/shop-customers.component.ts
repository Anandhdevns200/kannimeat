import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import type { Order } from '../../core/models';

@Component({
  selector: 'app-shop-customers',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Customers" subtitle="People who order from your shop regularly.">
      <button class="btn btn-ghost btn-sm" (click)="toast.show('Customer list export started (demo)','info')"><mat-icon style="font-size:18px">file_download</mat-icon> Export</button>
    </app-page-header>

    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:780px">
        <thead><tr><th>Customer</th><th>Phone</th><th>Area</th><th>Orders</th><th>Total spent</th><th>Last order</th><th>Favourite</th></tr></thead>
        <tbody>
          <tr *ngFor="let c of customers">
            <td><b>{{ c.name }}</b></td>
            <td class="mono" style="font-size:13px">{{ c.phone }}</td>
            <td>{{ c.area }}</td>
            <td class="mono">{{ c.orders }}</td>
            <td class="mono">{{ inr(c.spent) }}</td>
            <td style="font-size:13px">{{ c.last }}</td>
            <td style="font-size:12.5px">{{ c.fav }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ShopCustomersPage implements OnInit {
  private data = inject(DataService);
  toast = inject(ToastService);
  inr = (n: number) => '₹' + n.toLocaleString('en-IN');
  customers: any[] = [];

  ngOnInit() {
    this.data.getOrdersForShop('SH-001').then((orders) => {
      const map = new Map<string, { orders: number; spent: number; last: string }>();
      orders.forEach((o: Order) => {
        const cur = map.get(o.customerId) ?? { orders: 0, spent: 0, last: o.deliveryDateLabel };
        cur.orders += 1;
        cur.spent += o.total;
        map.set(o.customerId, { ...cur, last: o.deliveryDateLabel });
      });
      const areas = ['Anna Salai', 'Bus Stand Road', 'Santhapet', 'Pudupalayam'];
      const names = [
        'Anand Krishnan', 'Divya Balan', 'Priya Raghavan', 'Vignesh S', 'Meena Kumari',
        'Karthik Raja', 'Arun Dev', 'Revathi Sivakumar', 'Suresh Bala', 'Lakshmi Narayanan',
      ];
      const favs = ['Chicken Curry Cut', 'Mutton Biryani Cut', 'Fish Steak', 'Chicken Biryani'];
      this.customers = [...map.entries()].map(([id, v], i) => ({
        name: names[i % names.length],
        phone: `+91 984${String(25 - i).padStart(2, '0')} 2${String(1111 + i).padStart(4, '0')}`,
        area: areas[i % areas.length],
        orders: v.orders,
        spent: v.spent,
        last: v.last,
        fav: favs[i % favs.length],
      }));
    });
  }
}