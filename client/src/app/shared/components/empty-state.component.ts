import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="state-box">
      <div [style.font-size]="'46px'">{{ icon }}</div>
      <h3 style="margin:8px 0 4px;color:var(--slate-600)">{{ title }}</h3>
      <p *ngIf="message">{{ message }}</p>
      <div class="mt-3" *ngIf="actionLabel">
        <button class="btn btn-brand btn-sm" (click)="action.emit()">
          <mat-icon style="font-size:17px">{{ actionIcon }}</mat-icon> {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '🧾';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
  @Input() actionLabel = '';
  @Input() actionIcon = 'arrow_forward';
  @Output() action = new EventEmitter<void>();
}