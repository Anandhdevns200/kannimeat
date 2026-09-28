import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import type { Invoice } from '../../core/models';

@Component({
  selector: 'app-shop-invoices',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <app-page-header title="Invoices" subtitle="All invoices generated for your shop."></app-page-header>

    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:760px">
        <thead><tr><th>Invoice</th><th>Order</th><th>Customer</th><th>Date</th><th>Amount</th><th>Payment</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let inv of invoices">
            <td><b class="mono">{{ inv.id }}</b></td>
            <td class="mono">{{ inv.orderId }}</td>
            <td>{{ inv.customerName }}</td>
            <td style="font-size:13px">{{ inv.date }}</td>
            <td class="mono"><b>{{ inr(inv.total) }}</b></td>
            <td><app-status-badge [status]="inv.paymentStatus" [label]="inv.paymentStatus | uppercase"></app-status-badge></td>
            <td><a class="btn btn-ghost btn-sm btn-icon" title="View invoice" [routerLink]="['/invoice', inv.id]"><mat-icon>visibility</mat-icon></a></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ShopInvoicesPage implements OnInit {
  private data = inject(DataService);
  inr = (n: number) => '₹' + n.toLocaleString('en-IN');
  invoices: Invoice[] = [];
  ngOnInit() {
    this.data.getInvoices().then((inv) => (this.invoices = inv));
  }
}