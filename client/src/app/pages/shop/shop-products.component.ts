import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { DataService, inr } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { AddProductDialogComponent, type AddProductDialogData } from '../../shared/components/add-product-dialog.component';
import type { Product } from '../../core/models';

@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageHeaderComponent],
  template: `
    <app-page-header title="Products" subtitle="Your shop catalogue with pricing, cuts and freshness.">
      <button class="btn btn-brand btn-sm" (click)="openAdd()"><mat-icon style="font-size:18px">add</mat-icon> Add Product</button>
    </app-page-header>

    <div class="table-scroll card" style="padding:0">
      <table class="responsive-table" style="min-width:760px">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Cuts</th><th>Freshness</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr *ngFor="let p of products">
            <td><span style="font-size:22px;margin-right:8px">{{ p.emoji }}</span><b>{{ p.name }}</b></td>
            <td><span class="chip chip-slate">{{ p.category | titlecase }}</span></td>
            <td class="mono">{{ inr(p.pricePerKg) }}/KG</td>
            <td style="font-size:12.5px">{{ p.cuts.join(', ') }}</td>
            <td class="text-muted" style="font-size:13px">{{ p.freshness }}</td>
            <td><span class="chip" [class.chip-green]="p.inStock" [class.chip-red]="!p.inStock">{{ p.inStock ? 'Active' : 'Sold out' }}</span></td>
            <td><button class="btn btn-ghost btn-sm btn-icon" title="Edit product" (click)="toast.show('Edit product (demo)','info')"><mat-icon>edit</mat-icon></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ShopProductsPage implements OnInit {
  private data = inject(DataService);
  private dialog = inject(MatDialog);
  toast = inject(ToastService);
  inr = inr;
  products: Product[] = [];
  ngOnInit() {
    this.load();
  }
  load() {
    this.data.getProducts().then((p) => (this.products = p.filter((x) => x.shopId === 'SH-001')));
  }
  openAdd() {
    const dialogData: AddProductDialogData = {
      shopId: 'SH-001', shopName: 'Fresh Meat Centre', shopArea: 'Anna Salai', city: 'Tindivanam',
    };
    const ref = this.dialog.open(AddProductDialogComponent, { data: dialogData, width: '560px' });
    ref.afterClosed().subscribe((p: Omit<Product, 'id'> | null) => {
      if (!p) return;
      this.data.addProduct(p).then(() => {
        this.toast.show(`${p.name} added with ${p.cuts.length} cut option${p.cuts.length > 1 ? 's' : ''}`, 'success');
        this.load();
      });
    });
  }
}