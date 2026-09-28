import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { InvoiceViewComponent } from '../../shared/components/invoice-view.component';
import { DataService } from '../../core/services/data.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import type { Invoice } from '../../core/models';

@Component({
  selector: 'app-invoice-page',
  standalone: true,
  imports: [CommonModule, RouterModule, InvoiceViewComponent, EmptyStateComponent],
  template: `
    <div class="container mt-4">
      <h1 class="section-title">Invoice</h1>
      <p class="section-sub">View, print or download your invoice.</p>
      <div *ngIf="invoice"><app-invoice-view [data]="invoice"></app-invoice-view></div>
      <app-empty-state *ngIf="!invoice" icon="🧾" title="Invoice not found" message="Check the invoice link and try again."></app-empty-state>
    </div>
  `,
})
export class InvoicePage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  invoice: Invoice | null = null;

  ngOnInit() {
    this.route.params.subscribe((p) => {
      this.data.getInvoice(p['id']).then((inv) => (this.invoice = inv ?? null));
    });
  }
}