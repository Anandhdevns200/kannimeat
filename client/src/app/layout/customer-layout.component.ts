import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { CartService } from '../core/services/cart.service';
import { LocationService } from '../core/services/location.service';
import { AuthService } from '../core/services/auth.service';
import { DataService } from '../core/services/data.service';
import { ToastService } from '../core/services/toast.service';
import { NotificationsComponent } from '../shared/components/notifications.component';
import { Subscription } from 'rxjs';
import type { LocationInfo, Notification } from '../core/models';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, NotificationsComponent],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand">
          <span class="logo">🥩</span>
          <span class="brand-name">Kanni<span style="color:var(--brand-500)">Meat</span></span>
        </a>

        <a routerLink="/location" class="location-chip" *ngIf="loc">
          <mat-icon style="font-size:16px;width:16px;height:16px">location_on</mat-icon>
          {{ loc.area }}, {{ loc.city }}
        </a>

        <div class="search grow-1">
          <mat-icon>search</mat-icon>
          <input
            #q
            placeholder="Search chicken, mutton, fish…"
            (keydown.enter)="search(q.value)"
            style="border:none;outline:none;flex:1;background:transparent;font:inherit"
          />
        </div>

        <nav class="links no-scrollbar">
          <a routerLink="/shop-page" routerLinkActive="active-cat">Shops</a>
          <a routerLink="/categories" routerLinkActive="active-cat">Categories</a>
          <a routerLink="/orders" routerLinkActive="active-cat">Orders</a>
          <a routerLink="/help" routerLinkActive="active-cat">Help</a>
        </nav>

        <div class="right">
          <app-notifications [items]="customerNotifications"></app-notifications>
          <button mat-icon-button [matMenuTriggerFor]="acct" aria-label="Account" title="Account" class="avatar-btn">
            <span class="avatar">{{ initials }}</span>
          </button>
          <mat-menu #acct="matMenu">
            <a mat-menu-item routerLink="/profile">My Profile</a>
            <a mat-menu-item routerLink="/orders">My Orders</a>
            <a mat-menu-item routerLink="/profile">Addresses</a>
            <a mat-menu-item routerLink="/login">Switch role / Login</a>
          </mat-menu>

          <a routerLink="/cart" class="cart-btn" title="Bag">
            <mat-icon>shopping_bag</mat-icon>
            <span class="count" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </a>
        </div>
      </div>

      <div class="mobile-nav">
        <a routerLink="/" routerLinkActive="active-cat">Home</a>
        <a routerLink="/categories" routerLinkActive="active-cat">Categories</a>
        <a routerLink="/cart" routerLinkActive="active-cat">Cart</a>
        <a routerLink="/orders" routerLinkActive="active-cat">Orders</a>
        <a routerLink="/help" routerLinkActive="active-cat">Help</a>
      </div>
    </header>

    <main class="site-main">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <div class="brand"><span class="logo">🥩</span> <b>KanniMeat</b></div>
          <p style="color:var(--slate-400);font-size:13px">
            Order today. Fresh meat tomorrow.<br>
            Connecting customers with local meat shops across tier-2 cities.
          </p>
        </div>
        <div>
          <b class="h">Shop</b>
          <a routerLink="/categories">Chicken</a>
          <a routerLink="/categories">Mutton</a>
          <a routerLink="/categories">Fish</a>
          <a routerLink="/shop-page">Nearby Shops</a>
        </div>
        <div>
          <b class="h">Company</b>
          <a routerLink="/help">How it works</a>
          <a routerLink="/help">Why choose us</a>
          <a routerLink="/about">About us</a>
          <a routerLink="/login">Partner with us</a>
        </div>
        <div>
          <b class="h">Support</b>
          <a routerLink="/help">Help Centre</a>
          <a routerLink="/help">FAQs</a>
          <a routerLink="/help">Contact</a>
          <a routerLink="/login">Shop login</a>
        </div>
      </div>
      <div class="container bottom">
        <span>© 2026 KanniMeat Technologies Pvt Ltd</span>
        <span>Made with ❤️ for local communities</span>
      </div>
    </footer>
  `,
  styles: [
    `
      .site-header { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid var(--slate-200); }
      .header-inner { display: flex; align-items: center; gap: 16px; padding: 12px 20px; }
      .brand { display: flex; align-items: center; gap: 8px; font-family: 'Poppins', sans-serif; font-weight: 800; font-size: 19px; }
      .logo { font-size: 26px; }
      .location-chip { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: var(--brand-700);
        background: var(--brand-50); padding: 7px 12px; border-radius: 999px; white-space: nowrap; }
      .location-chip:hover { background: var(--brand-100); }
      .search { display: flex; align-items: center; gap: 8px; background: var(--slate-50); border: 1px solid var(--slate-200);
        border-radius: 999px; padding: 9px 16px; max-width: 420px; }
      .links { display: flex; gap: 4px; }
      .links a { font-weight: 600; font-size: 14px; color: var(--slate-600); padding: 7px 12px; border-radius: 8px; white-space: nowrap; }
      .links a:hover, .active-cat { background: var(--brand-50); color: var(--brand-700) !important; }
      .right { display: flex; align-items: center; gap: 4px; }
      .avatar-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }
      .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--brand-600); color: #fff;
        display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
      .cart-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;
        border-radius: 12px; background: var(--slate-900); color: #fff; }
      .count { position: absolute; top: -5px; right: -5px; background: var(--meat-600); color: #fff; font-size: 11px;
        font-weight: 700; width: 19px; height: 19px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .site-main { min-height: calc(100dvh - 200px); }
      .site-footer { background: var(--slate-900); color: #fff; margin-top: 60px; }
      .footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 28px; padding: 40px 20px; }
      .footer-grid .h { display: block; margin-bottom: 10px; color: var(--slate-300); }
      .footer-grid a { display: block; color: var(--slate-400); font-size: 13.5px; margin-bottom: 8px; }
      .footer-grid a:hover { color: #fff; }
      .bottom { display: flex; justify-content: space-between; gap: 12px; border-top: 1px solid #1e293b; padding: 16px 20px; font-size: 12.5px; color: var(--slate-500); }
      .mobile-nav { display: none; }
      @media (max-width: 900px) {
        .links { display: none; }
        .search { display: none; }
        .header-inner { flex-wrap: wrap; gap: 10px; }
        .mobile-nav { display: flex; gap: 8px; padding: 8px 16px 10px; overflow-x: auto; }
        .mobile-nav a { font-size: 13px; font-weight: 600; color: var(--slate-600); padding: 7px 14px; border-radius: 999px; background: var(--slate-50); white-space: nowrap; }
        .mobile-nav .active-cat { background: var(--brand-50); color: var(--brand-700); }
        .footer-grid { grid-template-columns: 1fr 1fr; gap: 20px; padding: 32px 16px; }
      }
      @media (max-width: 480px) {
        .footer-grid { grid-template-columns: 1fr; }
        .bottom { flex-direction: column; align-items: center; text-align: center; }
      }
    `,
  ],
})
export class CustomerLayoutComponent implements OnInit, OnDestroy {
  private cart = inject(CartService);
  private locSvc = inject(LocationService);
  private auth = inject(AuthService);
  private data = inject(DataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loc: LocationInfo | null = null;
  cartCount = 0;
  customerNotifications: Notification[] = [];
  private userName = 'Guest';
  private subs: Subscription[] = [];

  get initials() {
    return this.userName.split(' ').map((s) => s[0]).slice(0, 2).join('') || '?';
  }

  ngOnInit() {
    this.subs.push(this.locSvc.location.subscribe((l) => (this.loc = l)));
    this.subs.push(this.auth.user.subscribe((u) => (this.userName = u?.name ?? 'Guest')));
    this.subs.push(this.cart.items.subscribe((i) => (this.cartCount = i.length)));
    this.toast.loadNotifications('customer');
    this.subs.push(this.toast.notifications.subscribe((n) => (this.customerNotifications = n)));
  }
  ngOnDestroy() {
    this.subs.forEach((s) => s.unsubscribe());
  }
  search(q: string) {
    const query = q?.trim();
    if (!query) return;
    window.dispatchEvent(new CustomEvent('search-request', { detail: query }));
    this.router.navigate(['/categories'], { queryParams: { q: query } });
  }
}