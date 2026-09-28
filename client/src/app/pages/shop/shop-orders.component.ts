import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { OrdersTableComponent } from '../../shared/components/orders-table.component';
import type { Order, OrderStatus } from '../../core/models';

type ListKind = 'orders' | 'tomorrow' | 'processing' | 'packing' | 'ready';

const META: Record<ListKind, { title: string; sub: string; filter: (o: Order) => boolean; actions: { label: string; status?: OrderStatus }[] }> = {
  orders: {
    title: "Today's Orders",
    sub: 'Every order for your shop across delivery dates.',
    filter: () => true,
    actions: [{ label: 'Accept', status: 'confirmed' }],
  },
  tomorrow: {
    title: "Tomorrow's Orders",
    sub: 'Advance demand booked for tomorrow — this is your preparation list.',
    filter: (o) => o.deliveryDateLabel.includes('Tomorrow'),
    actions: [{ label: 'Accept', status: 'confirmed' }, { label: 'Start Processing', status: 'processing' }],
  },
  processing: {
    title: 'Processing',
    sub: 'Orders being cut in the cutting room.',
    filter: (o) => o.status === 'processing' || o.status === 'confirmed',
    actions: [{ label: 'Mark Packed', status: 'packed' }],
  },
  packing: {
    title: 'Packing',
    sub: 'Weighed, packed and labelled.',
    filter: (o) => o.status === 'packed',
    actions: [{ label: 'Mark Ready', status: 'ready' }],
  },
  ready: {
    title: 'Ready for Delivery',
    sub: 'Waiting for the delivery manager to assign a partner.',
    filter: (o) => o.status === 'ready',
    actions: [{ label: 'Handover to Delivery', status: 'out_for_delivery' }],
  },
};

@Component({
  selector: 'app-shop-orders',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, OrdersTableComponent],
  template: `
    <app-page-header [title]="meta.title" [subtitle]="meta.sub" [crumbs]="[{label:'Shop', link:'/portal/shop'}, {label: meta.title}]">
      <span class="chip chip-green" *ngIf="orders.length">{{ orders.length }} orders</span>
    </app-page-header>
    <app-orders-table
      [orders]="orders"
      [actions]="meta.actions"
      (open)="openOrder($event)"
      (advance)="advance($event.orderId, $event.status)"
    ></app-orders-table>
  `,
})
export class ShopListPage implements OnInit {
  kind!: ListKind;
  meta = META.orders;
  orders: Order[] = [];
  private data = inject(DataService);
  private router = inject(Router);

  constructor() {
    const url = this.router.url;
    const seg = url.split('/').pop() ?? '';
    this.kind = (['orders', 'tomorrow', 'processing', 'packing', 'ready'].includes(seg) ? seg : 'orders') as ListKind;
    this.meta = META[this.kind];
  }

  ngOnInit() {
    this.data.getOrdersForShop('SH-001').then((all) => {
      this.orders = all.filter(this.meta.filter);
    });
  }

  openOrder(id: string) {
    this.router.navigate(['/portal/shop/orders', id], { queryParams: { from: `/portal/shop/${this.kind}` } });
  }
  advance(orderId: string, status: string) {
    this.data.updateOrderStatus(orderId, status as OrderStatus).then(() => {
      this.orders = this.orders.filter((o) => !(this.meta.filter(o) && o.id === orderId) || o.id !== orderId);
      this.orders = this.orders.filter(this.meta.filter);
    });
  }
}