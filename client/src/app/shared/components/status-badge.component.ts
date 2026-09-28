import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeChipComponent } from './badge-chip.component';

const STATUS_TONE: Record<string, string> = {
  placed: 'blue', confirmed: 'blue', processing: 'amber', packed: 'violet',
  ready: 'teal', out_for_delivery: 'blue', delivered: 'green',
  cancelled: 'slate', failed: 'red',
  paid: 'green', pending: 'amber', refunded: 'slate',
  active: 'green', inactive: 'slate', suspended: 'red',
  in_stock: 'green', low: 'amber', out: 'red',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule, BadgeChipComponent],
  template: `<app-badge-chip [label]="label" [tone]="tone"></app-badge-chip>`,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';
  get tone() {
    const s = this.status.toLowerCase();
    return (STATUS_TONE[s] as any) ?? 'slate';
  }
}