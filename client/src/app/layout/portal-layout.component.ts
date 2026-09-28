import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { AuthService, AuthUser } from '../core/services/auth.service';
import { DataService } from '../core/services/data.service';
import { ToastService } from '../core/services/toast.service';
import { NotificationsComponent } from '../shared/components/notifications.component';
import { RoleDisplayPipe } from '../shared/pipes/role-display.pipe';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

function portalMenu(role: string): { section: string; items: NavItem[] }[] {
  if (role === 'SHOP_ADMIN' || role === 'SHOP_STAFF') {
    return [
      {
        section: 'Operations',
        items: [
          { label: 'Dashboard', icon: 'dashboard', route: '/portal/shop' },
          { label: "Today's Orders", icon: 'list_alt', route: '/portal/shop/orders' },
          { label: "Tomorrow's Orders", icon: 'event_available', route: '/portal/shop/tomorrow' },
          { label: 'Processing', icon: 'settings', route: '/portal/shop/processing' },
          { label: 'Packing', icon: 'inventory_2', route: '/portal/shop/packing' },
          { label: 'Ready for Delivery', icon: 'local_shipping', route: '/portal/shop/ready' },
        ],
      },
      {
        section: 'Catalogue',
        items: [
          { label: 'Products', icon: 'egg_alt', route: '/portal/shop/products' },
          { label: 'Inventory', icon: 'warehouse', route: '/portal/shop/inventory' },
          { label: 'Customers', icon: 'people', route: '/portal/shop/customers' },
          { label: 'Invoices', icon: 'receipt_long', route: '/portal/shop/invoices' },
          { label: 'Reports', icon: 'bar_chart', route: '/portal/shop/reports' },
        ],
      },
    ];
  }
  if (role === 'COMPANY_ADMIN') {
    return [
      {
        section: 'Company',
        items: [
          { label: 'Dashboard', icon: 'dashboard', route: '/portal/company' },
          { label: 'Shops', icon: 'storefront', route: '/portal/company/shops' },
          { label: 'Employees', icon: 'badge', route: '/portal/company/employees' },
          { label: 'Products', icon: 'egg_alt', route: '/portal/company/products' },
          { label: 'Inventory', icon: 'warehouse', route: '/portal/company/inventory' },
          { label: 'Orders', icon: 'receipt_long', route: '/portal/company/orders' },
          { label: 'Deliveries', icon: 'local_shipping', route: '/portal/company/deliveries' },
          { label: 'Payments', icon: 'payments', route: '/portal/company/payments' },
          { label: 'Invoices', icon: 'description', route: '/portal/company/invoices' },
          { label: 'Reports', icon: 'bar_chart', route: '/portal/company/reports' },
        ],
      },
    ];
  }
  if (role === 'SUPER_ADMIN') {
    return [
      {
        section: 'Platform',
        items: [
          { label: 'Dashboard', icon: 'dashboard', route: '/portal/super' },
          { label: 'Companies', icon: 'apartment', route: '/portal/super/companies' },
          { label: 'Shops', icon: 'storefront', route: '/portal/super/shops' },
          { label: 'Users & Roles', icon: 'admin_panel_settings', route: '/portal/super/users' },
          { label: 'Products', icon: 'egg_alt', route: '/portal/super/products' },
          { label: 'Inventory', icon: 'warehouse', route: '/portal/super/inventory' },
          { label: 'Orders', icon: 'receipt_long', route: '/portal/super/orders' },
          { label: 'Delivery Partners', icon: 'motorcycle', route: '/portal/super/partners' },
          { label: 'Payments', icon: 'payments', route: '/portal/super/payments' },
          { label: 'Invoices', icon: 'description', route: '/portal/super/invoices' },
          { label: 'Reports', icon: 'bar_chart', route: '/portal/super/reports' },
          { label: 'Settings', icon: 'settings', route: '/portal/super/settings' },
        ],
      },
    ];
  }
  if (role === 'DELIVERY_MANAGER') {
    return [
      {
        section: 'Operations',
        items: [
          { label: 'Dashboard', icon: 'dashboard', route: '/portal/delivery-manager' },
          { label: 'Ready Orders', icon: 'inventory_2', route: '/portal/delivery-manager/ready' },
          { label: 'Assign Delivery', icon: 'assignment_ind', route: '/portal/delivery-manager/assign' },
          { label: 'Active Deliveries', icon: 'local_shipping', route: '/portal/delivery-manager/active' },
          { label: 'Completed', icon: 'task_alt', route: '/portal/delivery-manager/completed' },
          { label: 'Failed', icon: 'error', route: '/portal/delivery-manager/failed' },
        ],
      },
    ];
  }
  return [
    {
      section: 'Deliveries',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/portal/delivery-partner' },
        { label: "Today's Deliveries", icon: 'local_shipping', route: '/portal/delivery-partner/deliveries' },
        { label: 'Delivery History', icon: 'history', route: '/portal/delivery-partner/history' },
        { label: 'Help', icon: 'help_outline', route: '/portal/delivery-partner/help' },
      ],
    },
  ];
}

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, NotificationsComponent, RoleDisplayPipe],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav #sidenav [mode]="desktop ? 'side' : 'over'" class="side" [opened]="desktop" [fixedInViewport]="true">
        <div class="side-brand">
          <span class="logo">🥩</span>
          <span>Kanni<span style="color:var(--brand-400)">Meat</span></span>
          <span class="tag">{{ portalTag }}</span>
        </div>
        <div class="nav-wrap" (click)="desktop || sidenav.close()">
          <ng-container *ngFor="let group of menu">
            <div class="group-title">{{ group.section }}</div>
            <a
              *ngFor="let item of group.items"
              class="nav-item"
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.route === '/portal/' + portalSlug }"
            >
              <mat-icon class="ni">{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          </ng-container>
        </div>
        <div class="side-foot">
          <a routerLink="/" class="back-link"><mat-icon>storefront</mat-icon> Back to website</a>
          <div class="user-tile">
            <div class="avatar">{{ avatar }}</div>
            <div class="grow-1">
              <b style="font-size:13px">{{ user?.name }}</b>
              <div class="role">{{ user?.role | roleDisplay }}</div>
            </div>
            <button mat-icon-button (click)="logout()" matTooltip="Logout"><mat-icon style="font-size:19px">logout</mat-icon></button>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="topbar">
          <button mat-icon-button (click)="sidenav.toggle()" class="hamburger"><mat-icon>menu</mat-icon></button>
          <div class="grow-1"></div>
          <app-notifications [items]="portalNotifications"></app-notifications>
          <button mat-icon-button [matMenuTriggerFor]="um">
            <div class="avatar sm">{{ avatar }}</div>
          </button>
          <mat-menu #um="matMenu">
            <div style="padding:8px 16px">
              <b>{{ user?.name }}</b><br>
              <span class="text-muted" style="font-size:12px">{{ user?.org }}</span>
            </div>
            <a mat-menu-item routerLink="/"><mat-icon>storefront</mat-icon> View website</a>
            <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
          </mat-menu>
        </div>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .shell { height: 100dvh; }
      .side { width: 264px; background: var(--slate-900); color: #fff; border: none; }
      .side-brand { display: flex; align-items: center; gap: 8px; padding: 20px 18px; font-family: 'Poppins'; font-weight: 800; font-size: 18px; border-bottom: 1px solid #1e293b; }
      .side-brand .logo { font-size: 24px; }
      .tag { margin-left: auto; font-size: 10px; background: var(--brand-600); padding: 2px 8px; border-radius: 999px; font-family: 'Inter'; font-weight: 600; }
      .nav-wrap { padding: 12px 12px; overflow-y: auto; height: calc(100vh - 190px); }
      .group-title { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--slate-500); padding: 14px 10px 6px; font-weight: 700; }
      .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; color: var(--slate-300); font-size: 14px; font-weight: 500; margin-bottom: 2px; }
      .nav-item:hover { background: #1e293b; color: #fff; }
      .nav-item.active { background: var(--brand-600); color: #fff; font-weight: 600; }
      .ni { font-size: 20px; width: 20px; height: 20px; }
      .side-foot { border-top: 1px solid #1e293b; padding: 12px; }
      .back-link { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--slate-400); padding: 8px 10px; border-radius: 8px; }
      .back-link:hover { background: #1e293b; color: #fff; }
      .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
      .user-tile { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 10px; border-radius: 10px; background: #1e293b; }
      .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--brand-600); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
      .avatar.sm { width: 32px; height: 32px; font-size: 13px; }
      .role { font-size: 11px; color: var(--slate-400); }
      .topbar { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #fff; border-bottom: 1px solid var(--slate-200); position: sticky; top: 0; z-index: 40; }
      .content { padding: 24px; max-width: 1280px; margin: 0 auto; }
      @media (max-width: 900px) { .content { padding: 16px; } }
    `,
  ],
})
export class PortalLayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private data = inject(DataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  user: AuthUser | null = null;
  menu: { section: string; items: NavItem[] }[] = [];
  portalSlug = '';
  portalTag = '';
  desktop = typeof window !== 'undefined' && window.innerWidth >= 900;
  portalNotifications: any[] = [];

  @HostListener('window:resize')
  onResize() {
    this.desktop = window.innerWidth >= 900;
  }

  get avatar() {
    return this.user?.name?.split(' ').map((s) => s[0]).slice(0, 2).join('') ?? '?';
  }

  ngOnInit() {
    this.user = this.auth.snapshot;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    const slug = this.router.url.split('/')[2];
    this.portalSlug = slug;
    const tags: Record<string, string> = {
      shop: 'Shop', company: 'Company', super: 'Super Admin',
      'delivery-manager': 'Hub', 'delivery-partner': 'Delivery',
    };
    this.portalTag = tags[slug] ?? '';
    this.menu = portalMenu(this.user.role);
    const notifRole: Record<string, string> = {
      shop: 'shop', company: 'company_admin', super: 'super_admin',
      'delivery-manager': 'delivery_manager', 'delivery-partner': 'delivery_partner',
    };
    this.toast.loadNotifications(notifRole[slug] ?? '');
    this.toast.notifications.subscribe((n) => (this.portalNotifications = n));
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}