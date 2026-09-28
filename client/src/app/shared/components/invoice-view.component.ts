import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { ToastService } from '../../core/services/toast.service';
import { inr } from '../../core/services/data.service';
import type { Invoice } from '../../core/models';

@Component({
  selector: 'app-invoice-view',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="invoice" id="invoice">
      <div class="head">
        <div class="l">
          <div style="font-size:22px;font-weight:800;font-family:Poppins">🥩 KanniMeat</div>
          <div style="color:var(--slate-500);font-size:13px">Fresh Meat Platform · GSTIN 33ABCKM4567P1Z8</div>
        </div>
        <div class="r">
          <div style="font-size:28px;font-weight:800;color:var(--slate-800)">INVOICE</div>
          <div class="mono" style="color:var(--slate-500);font-size:14px">#{{ data.id }}</div>
        </div>
      </div>

      <div class="meta">
        <div class="party">
          <b>Billed To</b>
          <div>{{ data.customerName }}</div>
          <div style="color:var(--slate-500);font-size:13px">{{ data.customerPhone }}</div>
          <div style="color:var(--slate-500);font-size:13px">{{ data.address }}</div>
        </div>
        <div class="party">
          <b>Fulfilled By</b>
          <div>{{ data.shopName }}</div>
          <div style="color:var(--slate-500);font-size:13px">{{ data.city }}</div>
          <div style="color:var(--slate-500);font-size:13px">{{ data.date }}</div>
        </div>
        <div class="party right">
          <div>Order: <b class="mono">{{ data.orderId }}</b></div>
          <div style="margin-top:4px">Payment: <span class="chip" [class.chip-green]="data.paymentStatus==='paid'" [class.chip-amber]="data.paymentStatus!=='paid'">{{ data.paymentStatus | uppercase }}</span></div>
          <div style="margin-top:4px">Method: {{ data.paymentMethod | uppercase }}</div>
          <div style="margin-top:4px" *ngIf="data.paymentMethod==='upi'">Ref: UPI{{ upiRef }}</div>
        </div>
      </div>

      <div class="table-scroll">
        <table class="responsive-table" style="min-width:470px">
          <thead>
            <tr><th>Item</th><th>Weight</th><th>Cut</th><th class="text-right">Rate</th><th class="text-right">Amount</th></tr>
          </thead>
        <tbody>
          <tr *ngFor="let it of data.items">
            <td>
              <span style="margin-right:6px">{{ it.emoji }}</span><b>{{ it.name }}</b>
            </td>
            <td>{{ it.weightKg }} KG</td>
            <td>{{ it.cutPreference }}</td>
            <td class="text-right mono">{{ inr(it.pricePerKg) }}/KG</td>
            <td class="text-right mono">{{ inr(it.total) }}</td>
          </tr>
        </tbody>
        </table>
      </div>

      <div class="totals">
        <div class="row"><span>Subtotal</span><span class="mono">{{ inr(data.subtotal) }}</span></div>
        <div class="row" *ngIf="data.deliveryFee > 0"><span>Delivery Fee</span><span class="mono">{{ inr(data.deliveryFee) }}</span></div>
        <div class="row" *ngIf="data.discount > 0"><span>Discount</span><span class="mono">-{{ inr(data.discount) }}</span></div>
        <div class="row"><span>GST (5%)</span><span class="mono">{{ inr(data.tax) }}</span></div>
        <div class="row total"><span>TOTAL</span><span class="mono">{{ inr(data.total) }}</span></div>
      </div>

      <div class="foot">
        <div>Thank you for ordering local! Order in advance to help your neighbourhood shop plan fresh.</div>
        <div style="font-weight:600">This is a computer generated invoice for a prototype. Valid for demo purposes.</div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-dark btn-md" (click)="print()"><mat-icon style="font-size:18px">print</mat-icon> Print</button>
      <button class="btn btn-brand btn-md" (click)="download()"><mat-icon style="font-size:18px">download</mat-icon> Download</button>
    </div>
  `,
  styles: [
    `
      .invoice { background: #fff; border: 1px solid var(--slate-200); border-radius: 12px; padding: 28px; max-width: 820px; margin: 0 auto; box-shadow: var(--shadow-md); }
      .head { display: flex; justify-content: space-between; border-bottom: 2px solid var(--slate-900); padding-bottom: 14px; flex-wrap: wrap; gap: 10px; }
      .meta { display: flex; justify-content: space-between; gap: 16px; padding: 18px 0; flex-wrap: wrap; }
      .party { font-size: 14px; }
      .party.right { text-align: right; }
      .totals { max-width: 320px; margin-left: auto; padding: 16px 4px; }
      .totals .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: var(--slate-600); }
      .totals .row.total { font-weight: 800; font-size: 17px; color: var(--slate-900); border-top: 2px solid var(--slate-900); margin-top: 6px; padding-top: 10px; }
      .foot { border-top: 1px dashed var(--slate-300); padding-top: 14px; color: var(--slate-500); font-size: 12.5px; display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
      .actions { display: flex; justify-content: center; gap: 10px; margin-top: 20px; }
      @media print {
        .actions, .site-header, .site-footer { display: none !important; }
        .invoice { box-shadow: none; border: none; }
      }
    `,
  ],
})
export class InvoiceViewComponent {
  @Input() data!: Invoice;
  private toast = inject(ToastService);
  inr = inr;

  get upiRef() {
    return this.data.id.replace(/\D/g, '').slice(0, 6);
  }

  print() {
    window.print();
  }
  download() {
    this.toast.show('Invoice download started (demo) — PDF export runs on the backend later.', 'info');
  }
}