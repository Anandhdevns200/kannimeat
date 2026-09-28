import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card.component';

@Component({
  selector: 'app-shop-reports',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent, StatCardComponent],
  template: `
    <app-page-header title="Reports" subtitle="Daily, weekly and monthly performance for your shop."></app-page-header>

    <mat-button-toggle-group>
      <mat-button-toggle checked>Today</mat-button-toggle>
      <mat-button-toggle>This week</mat-button-toggle>
      <mat-button-toggle>This month</mat-button-toggle>
    </mat-button-toggle-group>

    <div class="stats mt-4">
      <app-stat-card icon="🪙" iconBg="#dcfce7" value="₹38,400" label="Revenue today" sub="vs ₹31,200 yesterday" trend="up" delta="23%"></app-stat-card>
      <app-stat-card icon="🧾" iconBg="#dbeafe" value="76" label="Orders today" sub="vs 61 yesterday" trend="up" delta="24%"></app-stat-card>
      <app-stat-card icon="⚖️" iconBg="#fef3c7" value="91 KG" label="Meat sold today" sub="Chicken 58 · Mutton 22 · Fish 11" trend="flat" delta=""></app-stat-card>
      <app-stat-card icon="⏱️" iconBg="#ede9fe" value="97%" label="On-time delivery" sub="Target 95%" trend="up" delta="2%"></app-stat-card>
    </div>

    <div class="grid mt-4">
      <div class="card">
        <b>Weekly Revenue (₹)</b>
        <div class="bars mt-3">
          <div class="bar-row" *ngFor="let d of trend">
            <span class="day">{{ d.day }}</span>
            <div class="track"><div class="fill" [style.width.%]="bar(d.value)"></div></div>
            <span class="val mono">{{ k(d.value) }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <b>Category Sales (this month)</b>
        <div class="donut-wrap mt-3">
          <div class="legend">
            <div><span class="dot chicken"></span> Chicken <b>58%</b></div>
            <div><span class="dot mutton"></span> Mutton <b>27%</b></div>
            <div><span class="dot fish"></span> Fish <b>15%</b></div>
          </div>
        </div>
        <div class="mt-3 text-muted" style="font-size:13px">Top seller: Country Chicken Curry Cut — 210 KG this month</div>
      </div>
    </div>

    <div class="card mt-4">
      <b>Top customers (repeat)</b>
      <p class="text-muted" style="font-size:13px;margin:4px 0 10px">Repeat customers drive 72% of your online revenue.</p>
      <table class="responsive-table" style="min-width:600px">
        <thead><tr><th>Customer</th><th>Orders</th><th>Spent</th><th>Last order</th></tr></thead>
        <tbody>
          <tr><td>Anand Krishnan</td><td>34</td><td class="mono">₹41,280</td><td>Yesterday 9 AM</td></tr>
          <tr><td>Revathi Sivakumar</td><td>27</td><td class="mono">₹28,960</td><td>Today 10 AM</td></tr>
          <tr><td>Divya Balan</td><td>22</td><td class="mono">₹19,540</td><td>Today 8 AM</td></tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: 1.3fr .7fr; gap: 14px; }
      .bars { display: flex; flex-direction: column; gap: 8px; }
      .bar-row { display: grid; grid-template-columns: 40px 1fr 60px; gap: 10px; align-items: center; font-size: 13px; }
      .track { height: 16px; background: var(--slate-100); border-radius: 6px; overflow: hidden; }
      .fill { height: 100%; background: linear-gradient(90deg, var(--brand-500), var(--brand-600)); border-radius: 6px; }
      .val { text-align: right; }
      .legend { display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
      .dot { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; }
      .chicken { background: var(--brand-500); } .mutton { background: var(--meat-600); } .fish { background: #64748b; }
      @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ShopReportsPage implements OnInit {
  private data = inject(DataService);
  trend: any[] = [];
  bar(v: number) {
    return Math.round((v / 112000) * 100);
  }
  k(v: number) {
    return '₹' + (v / 1000).toFixed(1) + 'k';
  }
  ngOnInit() {
    this.trend = this.data.getDailyTrend();
  }
}