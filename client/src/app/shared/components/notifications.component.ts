import { Component, Input, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu" [matBadge]="unread" matBadgeSize="small" matBadgeColor="warn">
      <mat-icon style="color:var(--slate-600)">notifications</mat-icon>
    </button>
    <mat-menu #menu="matMenu" style="max-width: 360px">
      <div style="width:360px;max-width:90vw;padding:12px 16px">
        <div class="flex justify-between items-center mb-1">
          <b style="font-family:Poppins">Notifications</b>
          <button mat-button (click)="markAll()" style="font-size:12px" disabled>Mark all read</button>
        </div>
        <div style="max-height:320px;overflow:auto">
          <div *ngFor="let n of items" class="item" [class.unread]="!n.read">
            <div class="ic">{{ n.icon }}</div>
            <div class="body">
              <div class="title">{{ n.title }}</div>
              <div class="txt">{{ n.body }}</div>
              <div class="time">{{ n.time }}</div>
            </div>
          </div>
          <div *ngIf="items.length === 0" class="state-box">No notifications</div>
        </div>
      </div>
    </mat-menu>
  `,
  styles: [
    `
      .item { display: flex; gap: 12px; padding: 10px 4px; border-bottom: 1px solid var(--slate-100); cursor: pointer; }
      .item:last-child { border-bottom: none; }
      .unread { background: var(--brand-50); border-radius: 8px; }
      .ic { font-size: 22px; }
      .title { font-weight: 600; font-size: 13.5px; }
      .txt { font-size: 12.5px; color: var(--slate-500); }
      .time { font-size: 11px; color: var(--slate-400); margin-top: 2px; }
    `,
  ],
})
export class NotificationsComponent implements OnChanges {
  @Input() items: any[] = [];
  get unread() {
    return this.items.filter((i) => !i.read).length;
  }
  markAll() {
    this.items = this.items.map((i) => ({ ...i, read: true }));
  }
  ngOnChanges() {}
}