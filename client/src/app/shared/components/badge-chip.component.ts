import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="chip" [ngClass]="colorClass">
      <span *ngIf="dot" class="dot"></span>{{ label }}
    </span>
  `,
  styles: [
    `
      .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    `,
  ],
})
export class BadgeChipComponent {
  @Input() label = '';
  @Input() tone: 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'violet' | 'teal' = 'slate';
  @Input() dot = true;

  get colorClass() {
    return `chip-${this.tone}`;
  }
}