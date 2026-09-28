import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import type { InventoryItem } from '../../core/models';

@Component({
  selector: 'app-shop-inventory',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Inventory" subtitle="Meat-specific stock — available, reserved and expected demand in KG.">
      <button class="btn btn-ghost btn-sm" (click)="toast.show('Restock request sent to supplier (demo)','info')">Request restock</button>
    </app-page-header>

    <div class="grid">
      <div class="card inv" *ngFor="let it of items">
        <div class="head">
          <div style="font-size:26px">{{ it.emoji }}</div>
          <div class="grow-1"><b>{{ it.product }}</b><div class="text-muted" style="font-size:12px">{{ it.category | titlecase }} · {{ inr(it.unitPricePerKg) }}/KG</div></div>
          <span class="chip" [class.chip-green]="level(it)==='in_stock'" [class.chip-amber]="level(it)==='low'" [class.chip-red]="level(it)==='out'">{{ levelLabel(it) }}</span>
        </div>
        <div class="bars mt-3">
          <div class="bar-row"><span>Available</span><div class="track"><div class="fill" [style.width.%]="availPct(it)" [class]="level(it)"></div></div><b>{{ it.availableKg }} KG</b></div>
          <div class="bar-row"><span>Reserved</span><div class="track"><div class="fill res" [style.width.%]="resPct(it)"></div></div><b>{{ it.reservedKg }} KG</b></div>
          <div class="bar-row"><span>Expected demand</span><div class="track"><div class="fill dem" [style.width.%]="demPct(it)"></div></div><b>{{ it.expectedDemandKg }} KG</b></div>
        </div>
        <div class="foot" *ngIf="level(it)==='low'">
          <span class="chip chip-amber">⚠ Low stock — source more for tomorrow</span>
        </div>
        <div class="foot" *ngIf="level(it)==='out'">
          <span class="chip chip-red">✕ Out of stock today</span>
        </div>
      </div>
    </div>

    <div class="card mt-4">
      <b>How reserve works</b>
      <p class="text-muted" style="font-size:13.5px;margin:6px 0 0">When you accept an order, its KG is moved from Available to Reserved. When delivered, it becomes sales. Expected demand uses advance orders plus historical trend — so you never over- or under-source.</p>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px,1fr)); gap: 14px; }
      .inv { padding: 18px; }
      .head { display: flex; gap: 12px; align-items: center; }
      .bar-row { display: grid; grid-template-columns: 120px 1fr 70px; gap: 10px; align-items: center; font-size: 12.5px; color: var(--slate-600); margin-bottom: 8px; }
      .track { height: 9px; background: var(--slate-100); border-radius: 999px; overflow: hidden; }
      .fill { height: 100%; background: var(--green-500); border-radius: 999px; }
      .fill.res { background: var(--amber-500); }
      .fill.dem { background: #a5b4fc; }
      .fill.low { background: var(--amber-500); }
      .fill.out { background: var(--meat-600); }
      .foot { margin-top: 10px; }
    `,
  ],
})
export class ShopInventoryPage implements OnInit {
  private data = inject(DataService);
  toast = inject(ToastService);
  inr = inr;
  items: InventoryItem[] = [];

  ngOnInit() {
    this.data.getInventory().then((inv) => (this.items = inv.filter((i) => i.shopId === 'SH-001')));
  }
  level(it: InventoryItem) {
    if (it.availableKg + it.reservedKg === 0) return 'out' as const;
    if (it.availableKg < it.expectedDemandKg * 0.5) return 'low' as const;
    return 'in_stock' as const;
  }
  levelLabel(it: InventoryItem) {
    return this.level(it) === 'out' ? 'Out of stock' : this.level(it) === 'low' ? 'Low stock' : 'In stock';
  }
  availPct(it: InventoryItem) {
    return Math.min(100, (it.availableKg / (it.availableKg + it.reservedKg + it.expectedDemandKg)) * 100);
  }
  resPct(it: InventoryItem) {
    return Math.min(100, (it.reservedKg / (it.availableKg + it.reservedKg + it.expectedDemandKg)) * 100);
  }
  demPct(it: InventoryItem) {
    return Math.min(100, (it.expectedDemandKg / (it.availableKg + it.reservedKg + it.expectedDemandKg)) * 100);
  }
}