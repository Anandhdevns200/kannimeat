import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card card">
      <div class="row">
        <div class="icon" [style.background]="iconBg">{{ icon }}</div>
        <span class="chip" *ngIf="trend !== 'flat'" [class.trend-up]="trend === 'up'" [class.trend-down]="trend === 'down'">
          {{ trend === 'up' ? '▲' : '▼' }} {{ delta }}
        </span>
      </div>
      <div class="value fw-700">{{ value }}</div>
      <div class="label">{{ label }}</div>
      <div class="sub" *ngIf="sub">{{ sub }}</div>
    </div>
  `,
  styles: [
    `
      .stat-card { padding: 18px; }
      .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
      .icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
      .value { font-size: 26px; font-family: 'Poppins', sans-serif; }
      .label { color: var(--slate-500); font-size: 13px; margin-top: 2px; }
      .sub { color: var(--slate-400); font-size: 12px; margin-top: 4px; }
      .trend-up { background: #dcfce7; color: var(--green-700); }
      .trend-down { background: #fee2e2; color: var(--meat-700); }
    `,
  ],
})
export class StatCardComponent {
  @Input() icon = '📦';
  @Input() iconBg = 'var(--slate-100)';
  @Input() value = '0';
  @Input() label = '';
  @Input() sub = '';
  @Input() delta = '';
  @Input() trend: 'up' | 'down' | 'flat' = 'flat';
}