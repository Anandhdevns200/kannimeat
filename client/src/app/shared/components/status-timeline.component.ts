import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { OrderStatus } from '../../core/models';
import { STATUS_LABEL } from '../../core/models';

const FLOW: OrderStatus[] = ['placed', 'confirmed', 'processing', 'packed', 'ready', 'out_for_delivery', 'delivered'];

@Component({
  selector: 'app-status-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline">
      <div
        class="step"
        *ngFor="let state of FLOW; let i = index"
        [class.done]="stepIndex >= i"
        [class.current]="stepIndex === i"
      >
        <div class="rail">
          <div class="node" [class.badge]="stepIndex > i" [class.dot]="stepIndex === i">
            <span *ngIf="stepIndex > i" class="check">✓</span>
            <span *ngIf="stepIndex === i" class="pulse"></span>
          </div>
          <div class="line" *ngIf="i < FLOW.length - 1" [class.fill]="stepIndex > i"></div>
        </div>
        <div class="content">
          <div class="label">{{ STATUS_LABEL[state] }}</div>
          <div class="meta" *ngIf="stepIndex >= i && meta[state]">{{ meta[state] }}</div>
        </div>
      </div>
      <div class="canceled" *ngIf="cancelled">
        <span class="node red">✕</span>
        <span class="label">{{ STATUS_LABEL.cancelled }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .timeline { padding: 8px 4px; }
      .step { display: flex; gap: 14px; }
      .rail { display: flex; flex-direction: column; align-items: center; }
      .node {
        width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        background: var(--slate-100); color: var(--slate-400); font-size: 14px; flex-shrink: 0; position: relative; z-index: 1;
      }
      .badge { background: var(--green-600); color: #fff; }
      .dot { background: var(--brand-500); box-shadow: 0 0 0 4px var(--brand-100); }
      .red { background: var(--meat-600); color: #fff; }
      .pulse { width: 10px; height: 10px; border-radius: 50%; background: #fff; }
      .line { width: 2px; flex: 1; min-height: 26px; background: var(--slate-200); margin: 2px 0; }
      .fill { background: var(--green-600); }
      .step.done .line { background: var(--green-600); }
      .content { padding-top: 4px; }
      .label { font-weight: 600; font-size: 14px; }
      .step:not(.done):not(.current) .label { color: var(--slate-400); }
      .meta { font-size: 12px; color: var(--slate-500); margin-top: 3px; }
      .canceled { display: flex; gap: 14px; align-items: center; margin-top: 10px; }
    `,
  ],
})
export class StatusTimelineComponent {
  @Input() status: OrderStatus = 'placed';
  @Input() meta: Partial<Record<OrderStatus, string>> = {};
  readonly FLOW = FLOW;
  readonly STATUS_LABEL = STATUS_LABEL;

  get stepIndex() {
    return FLOW.indexOf(this.status);
  }
  get cancelled() {
    return this.status === 'cancelled' || this.status === 'failed';
  }
}