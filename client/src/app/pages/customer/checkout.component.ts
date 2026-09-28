import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { CartService } from '../../core/services/cart.service';
import { DataService, inr } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { LocationService } from '../../core/services/location.service';
import type { Address, CartItem, Order, PaymentMethod } from '../../core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="container mt-4" style="max-width:900px">
      <h1 class="section-title">Checkout</h1>
      <p class="section-sub">Four quick steps to confirm your fresh order.</p>

      <div class="layout">
        <mat-stepper linear #stepper class="stepper">
          <!-- STEP 1: ADDRESS -->
          <mat-step>
            <ng-template matStepLabel>Address</ng-template>
            <div class="card">
              <h3 style="margin-top:0">Delivery Address</h3>
              <div class="radio-list">
                <label *ngFor="let a of addresses" class="addr-opt" [class.sel]="selectedAddress?.id === a.id">
                  <input type="radio" [checked]="selectedAddress?.id === a.id" (change)="pickAddress(a)" />
                  <div class="grow-1">
                    <b>{{ a.label }}</b>
                    <div class="text-muted">{{ a.line1 }}, {{ a.area }}, {{ a.city }} {{ a.pincode }}</div>
                    <div class="text-muted" style="font-size:12.5px">📞 {{ a.phone }}</div>
                  </div>
                </label>
              </div>
              <mat-form-field appearance="outline">
                <mat-label>Add new address (label)</mat-label>
                <mat-select (selectionChange)="addAddress($event.value)">
                  <mat-option value="Home">+ Home (already saved)</mat-option>
                  <mat-option value="Office">+ Office (already saved)</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" (click)="stepper.next()" [disabled]="!selectedAddress"><mat-icon style="font-size:18px">arrow_forward</mat-icon> Delivery Slot</button>
            </div>
          </mat-step>

          <!-- STEP 2: SLOT -->
          <mat-step>
            <ng-template matStepLabel>Slot</ng-template>
            <div class="card">
              <h3 style="margin-top:0">Choose Delivery Slot — {{ tomorrowLabel }}</h3>
              <div class="slot-grid">
                <button *ngFor="let s of slots" class="slot" [class.sel]="slot === s.label" (click)="slot = s.label">
                  <b>🕐 {{ s.label }}</b>
                  <span class="chip" *ngIf="s.label.includes('12:00 PM')" [class.chip-amber]="true">Most popular</span>
                </button>
              </div>
              <button mat-raised-button color="primary" (click)="stepper.next()" [disabled]="!slot"><mat-icon style="font-size:18px">arrow_forward</mat-icon> Payment</button>
            </div>
          </mat-step>

          <!-- STEP 3: PAYMENT -->
          <mat-step>
            <ng-template matStepLabel>Payment</ng-template>
            <div class="card">
              <h3 style="margin-top:0">Payment Method</h3>
              <div class="pay-grid">
                <button class="pay-opt" [class.sel]="payMethod==='upi'" (click)="payMethod='upi'">
                  <span style="font-size:24px">📱</span><div><b>UPI</b><div class="text-muted" style="font-size:12px">GPay, PhonePe, Paytm</div></div>
                </button>
                <button class="pay-opt" [class.sel]="payMethod==='card'" (click)="payMethod='card'">
                  <span style="font-size:24px">💳</span><div><b>Credit / Debit Card</b><div class="text-muted" style="font-size:12px">Visa, Mastercard, RuPay</div></div>
                </button>
                <button class="pay-opt" [class.sel]="payMethod==='netbanking'" (click)="payMethod='netbanking'">
                  <span style="font-size:24px">🏦</span><div><b>Net Banking</b><div class="text-muted" style="font-size:12px">All major banks</div></div>
                </button>
                <button class="pay-opt" [class.sel]="payMethod==='cod'" (click)="payMethod='cod'">
                  <span style="font-size:24px">💵</span><div><b>Cash on Delivery</b><div class="text-muted" style="font-size:12px">Pay the delivery partner</div></div>
                </button>
              </div>

              <div class="pay-form" *ngIf="payMethod==='upi'">
                <mat-form-field appearance="outline"><mat-label>UPI ID</mat-label><input matInput placeholder="yourname@upi" /></mat-form-field>
              </div>
              <div class="pay-form" *ngIf="payMethod==='card'">
                <mat-form-field appearance="outline"><mat-label>Card number</mat-label><input matInput placeholder="4111 1111 1111 1111" /></mat-form-field>
                <div class="flex gap-2">
                  <mat-form-field appearance="outline"><mat-label>Expiry</mat-label><input matInput placeholder="MM/YY" /></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>CVV</mat-label><input matInput type="password" placeholder="•••" /></mat-form-field>
                </div>
              </div>
              <div class="pay-form" *ngIf="payMethod==='netbanking'">
                <mat-form-field appearance="outline">
                  <mat-label>Bank</mat-label>
                  <mat-select><mat-option>State Bank of India</mat-option><mat-option>Indian Bank</mat-option><mat-option>HDFC</mat-option></mat-select>
                </mat-form-field>
              </div>

              <div class="mock-pay" *ngIf="payMethod">
                <span class="chip chip-green">🔒 Demo mode — no real money is charged</span>
              </div>

              <div class="row flex items-center gap-2 mt-3">
                <mat-progress-bar mode="indeterminate" *ngIf="paying" style="flex:1"></mat-progress-bar>
              </div>
              <button mat-raised-button color="primary" class="mt-3" (click)="pay()" [disabled]="paying">
                <mat-icon style="font-size:19px">payment</mat-icon> Pay {{ inr(t.total) }} &amp; Confirm
              </button>
            </div>
          </mat-step>

          <!-- STEP 4: CONFIRMATION -->
          <mat-step>
            <ng-template matStepLabel>Confirmation</ng-template>
            <div class="card text-center" style="padding:40px">
              <div style="font-size:64px">✅</div>
              <h2 style="margin:10px 0 4px">Order Confirmed!</h2>
              <p class="text-muted">Order <b class="mono">{{ placedOrder?.id }}</b> placed successfully.</p>
              <div class="confirm-tiles">
                <div class="tile"><b>Delivery</b><span>{{ tomorrowLabel }}</span><span>{{ slot }}</span></div>
                <div class="tile"><b>Delivering from</b><span>{{ shopName }}</span><span>{{ shopArea }}</span></div>
                <div class="tile"><b>Payment</b><span>{{ payMethod | uppercase }}</span><span>{{ placedOrder?.paymentStatus === 'paid' ? 'Paid' : 'Cash on delivery' }}</span></div>
                <div class="tile"><b>Amount</b><span class="mono">{{ inr(t.total) }}</span><span>Invoice {{ placedOrder?.invoiceId }}</span></div>
              </div>
              <div class="mt-4 flex justify-center gap-2">
                <button class="btn btn-brand btn-lg" (click)="track()"><mat-icon style="font-size:19px">route</mat-icon> Track Order</button>
                <button class="btn btn-ghost btn-lg" routerLink="/"><mat-icon style="font-size:19px">home</mat-icon> Home</button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>

        <aside class="summary card">
          <b>Order Summary</b>
          <div class="items mt-2">
            <div *ngFor="let it of items" class="s-item">{{ it.quantityKg }} KG {{ it.product.name }} <span class="mono">{{ inr(it.product.pricePerKg * it.quantityKg) }}</span></div>
          </div>
          <div class="row"><span>Item total</span><span>{{ inr(t.subtotal) }}</span></div>
          <div class="row"><span>Delivery</span><span class="mono">{{ t.deliveryFee === 0 ? 'FREE' : inr(t.deliveryFee) }}</span></div>
          <div class="row"><span>GST</span><span>{{ inr(t.tax) }}</span></div>
          <div class="row total"><span>Total</span><span>{{ inr(t.total) }}</span></div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .layout { display: grid; grid-template-columns: 1fr 300px; gap: 18px; align-items: start; }
      .stepper { background: transparent; }
      .radio-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
      .addr-opt { display: flex; gap: 12px; border: 1.5px solid var(--slate-200); border-radius: 12px; padding: 12px 14px; cursor: pointer; }
      .addr-opt.sel { border-color: var(--brand-600); background: var(--brand-50); }
      .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; margin-bottom: 14px; }
      .slot { border: 1.5px solid var(--slate-200); border-radius: 12px; padding: 12px; text-align: left; cursor: pointer; background: #fff; font-family: inherit; display: flex; flex-direction: column; gap: 6px; }
      .slot.sel { border-color: var(--brand-600); background: var(--brand-50); }
      .pay-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; margin-bottom: 12px; }
      .pay-opt { display: flex; gap: 12px; align-items: center; border: 1.5px solid var(--slate-200); border-radius: 12px; padding: 14px; cursor: pointer; background: #fff; font-family: inherit; text-align: left; }
      .pay-opt.sel { border-color: var(--brand-600); background: var(--brand-50); }
      .pay-form { display: flex; flex-direction: column; gap: 4px; max-width: 420px; }
      .mock-pay { margin: 10px 0; }
      .confirm-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px,1fr)); gap: 10px; margin-top: 20px; }
      .tile { border: 1px solid var(--slate-200); border-radius: 12px; padding: 14px; text-align: center; }
      .tile b { display: block; color: var(--slate-500); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
      .tile span { display: block; font-size: 13.5px; }
      .summary { position: sticky; top: 88px; }
      .s-item { display: flex; justify-content: space-between; font-size: 13.5px; padding: 6px 0; border-bottom: 1px solid var(--slate-100); }
      .row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; color: var(--slate-600); }
      .row.total { font-weight: 800; font-size: 17px; color: var(--slate-900); border-top: 2px solid var(--slate-100); margin-top: 6px; padding-top: 10px; }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .summary { position: static; } .pay-grid { grid-template-columns: 1fr; } }
    `,
  ],
})
export class CheckoutPage implements OnInit {
  private cartSvc = inject(CartService);
  private data = inject(DataService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private locSvc = inject(LocationService);
  private route = inject(ActivatedRoute);
  inr = inr;

  items: CartItem[] = [];
  addresses: Address[] = [
    { id: 'A1', label: 'Home', line1: '12, Nehru Street', area: 'Anna Salai', city: 'Tindivanam', pincode: '604001', phone: '+91 98425 20011', isDefault: true },
    { id: 'A2', label: 'Office', line1: '45, North Gate Road', area: 'Bus Stand Road', city: 'Tindivanam', pincode: '604001', phone: '+91 98425 20011', isDefault: false },
    { id: 'A3', label: 'Parent\'s Home', line1: '8, Santhapet Bazaar', area: 'Santhapet', city: 'Villupuram', pincode: '605602', phone: '+91 98425 20011', isDefault: false },
  ];
  selectedAddress: Address | null = null;
  slots = [
    { label: '8:00 AM – 10:00 AM' },
    { label: '10:00 AM – 12:00 PM' },
    { label: '12:00 PM – 2:00 PM' },
    { label: '4:00 PM – 6:00 PM' },
  ];
  slot = '';
  payMethod: PaymentMethod = 'upi';
  paying = false;
  placedOrder: Order | null = null;
  shopName = '';
  shopArea = '';

  get t() {
    return this.cartSvc.totals(this.items);
  }
  get tomorrowLabel() {
    return this.data.tomorrowLabel;
  }

  ngOnInit() {
    this.cartSvc.items.subscribe((i) => (this.items = i));
    this.route.queryParams.subscribe((q) => {
      if (q['slot']) this.slot = q['slot'];
    });
  }
  pickAddress(a: Address) {
    this.selectedAddress = a;
  }
  addAddress(_label?: string) {
    this.toast.show('Address saved (demo)', 'info');
  }
  pay() {
    if (!this.selectedAddress || !this.slot) return;
    if (!this.items.length) return;
    this.paying = true;
    const shop = this.items[0].product;
    this.shopName = shop.shopName;
    this.shopArea = shop.shopArea;
    const loc = this.locSvc.snapshot();
    this.data
      .placeOrder({
        customerId: 'CUS-001',
        customerName: 'Anand Krishnan',
        customerPhone: '+91 98425 20011',
        shopId: shop.shopId,
        shopName: shop.shopName,
        shopArea: shop.shopArea,
        city: shop.city,
        items: this.items,
        slotLabel: this.slot,
        address: `${this.selectedAddress.line1}, ${this.selectedAddress.area}, ${this.selectedAddress.city} ${this.selectedAddress.pincode}`,
        area: this.selectedAddress.area,
        paymentMethod: this.payMethod,
      })
      .then((order) => {
        this.placedOrder = order;
        this.paying = false;
        this.cartSvc.clear();
        this.toast.show(`Order ${order.id} confirmed 🎉`, 'success');
      });
  }
  track() {
    if (this.placedOrder) this.router.navigate(['/order', this.placedOrder.id]);
  }
}