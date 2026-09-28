import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-head">
      <div>
        <div class="crumb" *ngIf="crumbs?.length">
          <span *ngFor="let c of crumbs; let last = last">
            <a [routerLink]="c.link" *ngIf="c.link && !last">{{ c.label }}</a>
            <span *ngIf="!c.link || last" class="text-muted">{{ c.label }}</span>
            <span class="sep" *ngIf="!last"> / </span>
          </span>
        </div>
        <h1 class="title">{{ title }}</h1>
        <p class="sub" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
      .title { font-size: 24px; font-weight: 700; margin: 2px 0 0; font-family: 'Poppins', sans-serif; }
      .sub { color: var(--slate-500); margin: 4px 0 0; }
      .crumb { font-size: 12.5px; color: var(--slate-400); }
      .crumb a:hover { color: var(--brand-600); }
      .sep { margin: 0 6px; }
      .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() crumbs: { label: string; link?: string }[] = [];
}