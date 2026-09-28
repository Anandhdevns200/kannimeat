import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { LocationService } from '../../core/services/location.service';
import { DataService } from '../../core/services/data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-location-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="container mt-4" style="max-width:720px">
      <h1 class="section-title">Where should we deliver?</h1>
      <p class="section-sub">We connect you with local shops that deliver to your area.</p>

      <div class="card">
        <button class="btn btn-dark btn-lg w-full" (click)="useCurrent()">
          <mat-icon>my_location</mat-icon> Use Current Location
        </button>
        <div class="or"><span>OR</span></div>

        <mat-form-field appearance="outline">
          <mat-label>City</mat-label>
          <mat-select [(ngModel)]="city" (selectionChange)="onCity()">
            <mat-option *ngFor="let c of cities" [value]="c">{{ c }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" *ngIf="city">
          <mat-label>Area</mat-label>
          <mat-select [(ngModel)]="area" (selectionChange)="onArea()">
            <mat-option *ngFor="let a of areas" [value]="a">{{ a }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>PIN code</mat-label>
          <input matInput [(ngModel)]="pincode" maxlength="6" placeholder="604001" />
        </mat-form-field>
      </div>

      <div class="card mt-3" *ngIf="shopResults.length">
        <b>Available Shops Near You</b>
        <p class="text-muted" style="margin:4px 0 12px">Delivering to <b>{{ area }}, {{ city }}</b> {{ pincode ? '· ' + pincode : '' }}</p>
        <div class="shop-row" *ngFor="let s of shopResults">
          <span style="font-size:24px">🏪</span>
          <div class="grow-1">
            <b>{{ s.name }}</b>
            <div class="text-muted" style="font-size:13px">{{ s.area }}, {{ s.city }} · ⭐ {{ s.rating }} · {{ s.ordersToday }} orders today</div>
          </div>
          <span class="chip chip-green">✓ Available</span>
        </div>
        <button class="btn btn-brand btn-lg w-full mt-3" (click)="confirmLocation()">Continue →</button>
      </div>
    </div>
  `,
  styles: [
    `
      .or { text-align: center; color: var(--slate-400); padding: 10px 0; font-size: 13px; }
      .shop-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--slate-100); }
      .shop-row:last-child { border-bottom: none; }
    `,
  ],
})
export class LocationPage implements OnInit {
  private locSvc = inject(LocationService);
  private data = inject(DataService);
  private toast = inject(ToastService);
  private router = inject(Router);
  cities: string[] = [];
  areas: string[] = [];
  city = '';
  area = '';
  pincode = '';
  shopResults: any[] = [];

  ngOnInit() {
    this.cities = this.data.cities;
    const l = this.locSvc.snapshot();
    this.city = l.city;
    this.area = l.area;
    this.pincode = l.pincode;
    this.areas = this.data.areasFor(this.city);
    this.refreshShops();
  }
  onCity() {
    this.areas = this.data.areasFor(this.city);
    this.area = this.areas[0] ?? '';
    this.refreshShops();
  }
  onArea() {
    this.refreshShops();
  }
  refreshShops() {
    if (!this.city) return;
    this.locSvc.setLocation({ area: this.area || this.data.areasFor(this.city)[0], city: this.city, pincode: this.pincode || '604001' });
    this.locSvc.shopsNear.then((s) => (this.shopResults = s));
  }
  useCurrent() {
    this.toast.show('Using saved location: Anna Salai, Tindivanam (demo)', 'info');
    this.city = 'Tindivanam';
    this.area = 'Anna Salai';
    this.pincode = '604001';
    this.refreshShops();
  }
  confirmLocation() {
    this.locSvc.setLocation({ area: this.area, city: this.city, pincode: this.pincode || '604001' });
    this.toast.show('Location confirmed — showing shops for your area', 'success');
    this.router.navigate(['/categories']);
  }
}