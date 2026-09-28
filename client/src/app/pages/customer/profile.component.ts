import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, StatusBadgeComponent],
  template: `
    <div class="container mt-4">
      <h1 class="section-title">My Profile</h1>
      <p class="section-sub">Manage your details, addresses, payments and preferences.</p>

      <div class="layout">
        <div class="main">
          <div class="card mb-3">
            <h3 style="margin-top:0">Personal Details</h3>
            <div class="grid-2">
              <mat-form-field appearance="outline"><mat-label>Full name</mat-label><input matInput [(ngModel)]="profile.name" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput [(ngModel)]="profile.phone" /></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput [(ngModel)]="profile.email" /></mat-form-field>
            </div>
            <button class="btn btn-brand btn-sm" (click)="save()"><mat-icon style="font-size:17px">save</mat-icon> Save Changes</button>
          </div>

          <div class="card mb-3">
            <div class="flex justify-between items-center" style="margin-bottom:10px">
              <h3 style="margin:0">Saved Addresses</h3>
              <button class="btn btn-ghost btn-sm" (click)="toast.show('Add address form (demo)','info')"><mat-icon style="font-size:17px">add_location_alt</mat-icon> Add Address</button>
            </div>
            <div class="addr-grid">
              <div class="addr card" *ngFor="let a of profile.addresses">
                <div class="flex justify-between">
                  <b>{{ a.label }}</b>
                  <span class="chip chip-green" *ngIf="a.isDefault">Default</span>
                </div>
                <div class="text-muted" style="font-size:13.5px">{{ a.line1 }}, {{ a.area }}, {{ a.city }} {{ a.pincode }}</div>
                <button class="btn btn-ghost btn-icon btn-sm" title="Edit address" (click)="toast.show('Edit address (demo)','info')"><mat-icon>edit</mat-icon></button>
              </div>
            </div>
          </div>

          <div class="card mb-3">
            <h3 style="margin-top:0">Saved Payments</h3>
            <div class="pay-list">
              <div class="pay-row" *ngFor="let p of profile.savedPayments"><span>💳</span><span class="grow-1">{{ p }}</span><button class="btn btn-ghost btn-icon btn-sm" title="Remove" (click)="toast.show('Payment removed (demo)','info')"><mat-icon>delete_outline</mat-icon></button></div>
            </div>
            <button class="btn btn-ghost btn-sm mt-2" (click)="toast.show('Add payment method (demo)','info')"><mat-icon style="font-size:17px">add_card</mat-icon> Add Payment Method</button>
          </div>

          <div class="card">
            <h3 style="margin-top:0">Preferences & Notifications</h3>
            <mat-checkbox color="primary" [(ngModel)]="profile.notifications">WhatsApp order updates</mat-checkbox><br>
            <mat-checkbox color="primary" [(ngModel)]="profile.smsFlag">SMS updates</mat-checkbox><br>
            <mat-checkbox color="primary" [(ngModel)]="profile.repeatFlag">Remind me to reorder weekly usuals</mat-checkbox>
            <div class="mt-3">
              <b style="font-size:13.5px">Preferred cuts</b>
              <div class="chips mt-2">
                <span class="chip chip-brand chip-brand-off" *ngFor="let pre of profile.preferences" (click)="togglePref(pre)" [class.on]="isPref(pre)">
                  {{ pre }} {{ isPref(pre) ? '✓' : '+' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <aside class="side">
          <div class="card text-center">
            <div class="avatar">AK</div>
            <b style="display:block;margin:8px 0 2px">{{ profile.name }}</b>
            <div class="text-muted" style="font-size:13px">Customer since 2024 · 24 orders</div>
            <div class="mt-3 stats">
              <div><b>24</b><span>Orders</span></div>
              <div><b>₹31k</b><span>Spent</span></div>
              <div><b>98%</b><span>On-time</span></div>
            </div>
          </div>
          <div class="card mt-3">
            <b>Recent Orders</b>
            <div *ngFor="let o of recent" class="ro" [routerLink]="['/order', o.id]" style="cursor:pointer">
              <div class="mono" style="font-size:13.5px">#{{ o.id }}</div>
              <app-status-badge [status]="o.status" [label]="label(o.status)"></app-status-badge>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      .layout { display: grid; grid-template-columns: 1fr 300px; gap: 18px; align-items: start; }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
      .addr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px,1fr)); gap: 10px; }
      .addr { padding: 12px; }
      .pay-list { display: flex; flex-direction: column; gap: 8px; }
      .pay-row { display: flex; align-items: center; gap: 10px; font-size: 14px; }
      .chips { display: flex; gap: 8px; flex-wrap: wrap; }
      .chip-brand-off { background: var(--slate-100); color: var(--slate-600); cursor: pointer; }
      .chip-brand-off.on { background: var(--brand-100); color: var(--brand-700); }
      .avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--brand-600); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
      .stats { display: flex; justify-content: center; gap: 18px; }
      .stats div { display: flex; flex-direction: column; }
      .stats b { font-size: 17px; }
      .stats span { font-size: 11.5px; color: var(--slate-500); }
      .ro { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--slate-100); }
      .ro:last-child { border-bottom: none; }
      @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .grid-2 { grid-template-columns: 1fr; } }
    `,
  ],
})
export class ProfilePage implements OnInit {
  private data = inject(DataService);
  router = inject(Router);
  toast = inject(ToastService);
  profile = {
    name: 'Anand Krishnan',
    phone: '+91 98425 20011',
    email: 'anand.krishnan@gmail.com',
    addresses: [
      { id: 'A1', label: 'Home', line1: '12, Nehru Street', area: 'Anna Salai', city: 'Tindivanam', pincode: '604001', phone: '+91 98425 20011', isDefault: true },
      { id: 'A2', label: 'Office', line1: '45, North Gate Road', area: 'Bus Stand Road', city: 'Tindivanam', pincode: '604001', phone: '+91 98425 20011', isDefault: false },
    ],
    savedPayments: ['UPI — anand@okhdfc', 'Visa •••• 4412', 'Cash on delivery'],
    preferences: ['Curry Cut', 'Biryani Cut', 'Steak Cut'],
    notifications: true,
    smsFlag: true,
    repeatFlag: true,
  };
  recent: any[] = [];

  ngOnInit() {
    this.data.getOrdersForCustomer('CUS-001').then((o) => (this.recent = o.slice(0, 3)));
  }
  label(s: string) {
    return s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  }
  save() {
    this.toast.show('Profile saved (demo)', 'success');
  }
  isPref(p: string) {
    return this.profile.preferences.includes(p);
  }
  togglePref(p: string) {
    const i = this.profile.preferences.indexOf(p);
    if (i >= 0) this.profile.preferences.splice(i, 1);
    else this.profile.preferences.push(p);
  }
}