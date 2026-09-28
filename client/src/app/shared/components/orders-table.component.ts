import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { StatusBadgeComponent } from './status-badge.component';
import { EmptyStateComponent } from './empty-state.component';
import { inr } from '../../core/services/data.service';
import type { Order, OrderStatus } from '../../core/models';
import { STATUS_LABEL } from '../../core/models';

export interface RowAction {
  label: string;
  status?: OrderStatus;
}

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div>
      <div class="toolbar" *ngIf="searchable !== false">
        <mat-form-field appearance="outline" style="max-width:260px">
          <mat-label>Search order / customer</mat-label>
          <input matInput [(ngModel)]="q" (ngModelChange)="applyFilter()" placeholder="ORD-10245, Anand…" />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
        <div class="grow-1"></div>
        <span class="text-muted" style="font-size:13px">{{ filtered.length }} of {{ orders.length }} orders</span>
      </div>

      <div class="card table-scroll" style="padding:0">
        <table class="responsive-table" *ngIf="filtered.length">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Items / Weight</th><th>Delivery</th><th>Slot</th><th>Payment</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of filtered" [style.cursor]="'pointer'" (click)="rowClick(o.id)">
              <td><b class="mono">{{ o.id }}</b></td>
              <td>
                <b>{{ o.customerName }}</b>
                <div class="text-muted" style="font-size:12px">📞 {{ o.customerPhone }}</div>
              </td>
              <td>
                <div *ngFor="let it of o.items" style="font-size:13px">{{ it.name }} · {{ it.weightKg }}KG ({{ it.cutPreference }})</div>
                <div class="text-muted" style="font-size:12px">Total {{ o.totalKg }} KG</div>
              </td>
              <td>{{ o.deliveryDateLabel }}</td>
              <td style="font-size:13px">{{ o.slotLabel }}</td>
              <td>
                <div style="font-size:12.5px" [class]="o.paymentStatus==='paid' ? 'text-success' : ''">{{ o.paymentStatus | uppercase }}</div>
                <div style="font-size:11.5px" class="text-muted">{{ o.paymentMethod | uppercase }}</div>
              </td>
              <td><app-status-badge [status]="o.status" [label]="STATUS_LABEL[o.status]"></app-status-badge></td>
              <td (click)="$event.stopPropagation()">
                <div class="flex gap-1" style="flex-direction:column">
                  <button class="btn btn-ghost btn-sm btn-icon" title="View order" (click)="open.emit(o.id)"><mat-icon>visibility</mat-icon></button>
                  <button *ngFor="let a of actions" class="btn btn-brand btn-sm" (click)="advance.emit({ orderId: o.id, status: a.status ?? '' })"><mat-icon style="font-size:16px">bolt</mat-icon> {{ a.label }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <app-empty-state *ngIf="!filtered.length" icon="📭" title="No orders here yet" message="Orders will appear as they arrive."></app-empty-state>
      </div>
    </div>
  `,
  styles: [
    `
      .toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
      .text-success { color: var(--green-600); font-weight: 600; }
    `,
  ],
})
export class OrdersTableComponent {
  @Input() orders: Order[] = [];
  @Input() actions: RowAction[] = [];
  @Input() searchable: boolean = true;
  @Output() open = new EventEmitter<string>();
  @Output() advance = new EventEmitter<{ orderId: string; status: string }>();
  inr = inr;
  readonly STATUS_LABEL = STATUS_LABEL;
  q = '';
  filtered: Order[] = this.orders;

  applyFilter() {
    const s = this.q.toLowerCase().trim();
    this.filtered = this.orders.filter(
      (o) =>
        !s ||
        o.id.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.shopArea.toLowerCase().includes(s),
    );
  }
  ngOnChanges() {
    this.applyFilter();
  }
  rowClick(id: string) {
    this.open.emit(id);
  }
}