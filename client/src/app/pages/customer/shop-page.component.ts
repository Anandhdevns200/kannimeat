import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { LocationService } from '../../core/services/location.service';
import { DataService } from '../../core/services/data.service';
import type { Shop } from '../../core/models';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="container mt-4">
      <h1 class="section-title">Nearby Shops</h1>
      <p class="section-sub">Local shops ready to prepare fresh orders for {{ loc?.area }}, {{ loc?.city }}.</p>

      <div class="shop-grid">
        <div class="card shop-card" *ngFor="let s of shops">
          <div class="emoji">🏪</div>
          <div class="grow-1">
            <b>{{ s.name }}</b>
            <div class="text-muted">{{ s.area }}, {{ s.city }}</div>
            <div class="meta">⭐ {{ s.rating }} · {{ s.ordersToday }} orders today · 🕐 Open 5 AM – 9 PM</div>
          </div>
          <button class="btn btn-brand btn-sm" [routerLink]="['/category','chicken']" [queryParams]="{ shop: s.name }">Order</button>
        </div>
      </div>

      <div class="card mt-6" style="background:var(--slate-900);color:#fff;border:none">
        <b style="font-size:18px">Your area gets more shops soon</b>
        <p class="text-muted" style="color:var(--slate-400);margin:6px 0 0">We onboard new local shops every week. Know a shop that should join?</p>
        <button class="btn btn-ghost btn-sm mt-2" style="border-color:#334155;color:#e2e8f0" routerLink="/about">Refer a shop (demo)</button>
      </div>
    </div>
  `,
  styles: [
    `
      .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 16px; }
      .shop-card { display: flex; gap: 14px; align-items: center; }
      .emoji { font-size: 30px; }
      .meta { font-size: 13px; color: var(--slate-500); margin-top: 4px; }
    `,
  ],
})
export class ShopPage implements OnInit {
  private locSvc = inject(LocationService);
  private data = inject(DataService);
  loc: any = null;
  shops: Shop[] = [];

  ngOnInit() {
    this.locSvc.location.subscribe((l) => (this.loc = l));
    this.locSvc.shopsNear.then((s) => (this.shops = s));
  }
}