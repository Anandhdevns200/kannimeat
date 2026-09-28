import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../core/services/auth.service';
import { ApiHealth, ApiHealthService } from '../../core/services/api-health.service';
import { ToastService } from '../../core/services/toast.service';
import { SystemUser } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="wrap">
      <div class="panel">
        <div class="brand"><span style="font-size:34px">🥩</span><b>KanniMeat</b></div>
        <h1>Sign in to KanniMeat</h1>
        <p class="sub">Prototype login — pick the role you want to demo. Real JWT + RBAC arrives with the ASP.NET Core API in the next phase.</p>

        <mat-form-field appearance="outline">
          <mat-label>Phone number</mat-label>
          <input matInput placeholder="+91 98425 00000" />
          <mat-icon matPrefix style="font-size:18px">phone</mat-icon>
        </mat-form-field>
        <div class="otp-hint">Enter your phone to receive a 4-digit OTP <span class="chip chip-green">OTP demo — auto-fills</span></div>

        <button class="btn btn-brand btn-lg w-full" (click)="sendOtp()"><mat-icon style="font-size:19px">send</mat-icon> Send OTP</button>
        <div class="divider"><span>or continue as a demo role</span></div>

        <div class="grid">
          <button class="role" *ngFor="let r of roles" (click)="login(r)">
            <span style="font-size:30px">{{ r.icon }}</span>
            <b>{{ r.label }}</b>
            <span class="who text-muted">{{ r.who }}</span>
          </button>
        </div>

        <div class="foot-links">
          <a routerLink="/"><mat-icon style="font-size:15px;vertical-align:-2px">arrow_back</mat-icon> Back to Website</a>
        </div>
        <div class="api" [class.online]="api?.status === 'online'">
          <span class="dot"></span>
          <span *ngIf="api?.status === 'checking'">Checking API…</span>
          <span *ngIf="api?.status === 'online'">API online — {{ api?.baseUrl }}</span>
          <span *ngIf="api?.status === 'offline'">API offline — {{ api?.baseUrl }} <em>({{ api?.detail }})</em></span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #0f172a, #1e293b 60%, #7c2d12); padding: 30px 16px; }
      .panel { background: #fff; border-radius: 20px; padding: 34px; max-width: 620px; width: 100%; box-shadow: var(--shadow-lg); }
      .brand { display: flex; align-items: center; gap: 8px; font-size: 22px; font-family: Poppins; margin-bottom: 20px; }
      h1 { margin: 0 0 6px; font-size: 26px; }
      .sub { color: var(--slate-500); font-size: 13.5px; line-height: 1.55; margin: 0 0 18px; }
      .otp-hint { font-size: 12.5px; color: var(--slate-500); margin: 4px 0 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .divider { display: flex; align-items: center; gap: 10px; margin: 18px 0 12px; color: var(--slate-400); font-size: 12.5px; text-transform: uppercase; letter-spacing: .04em; }
      .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--slate-200); }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .role { display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1.5px solid var(--slate-200); border-radius: 14px; padding: 14px 8px; cursor: pointer; font-family: inherit; background: #fff; transition: all .12s ease; }
      .role:hover { border-color: var(--brand-500); background: var(--brand-50); transform: translateY(-2px); }
      .role b { font-size: 13.5px; }
      .who { font-size: 11px; }
      .foot-links { margin-top: 18px; text-align: center; font-size: 13.5px; color: var(--brand-600); font-weight: 600; }
      .api { margin-top: 14px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--slate-500); word-break: break-all; }
      .api .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--slate-300); flex: 0 0 auto; }
      .api.online .dot { background: #16a34a; }
      .api em { font-style: normal; opacity: .8; }
      @media (max-width: 620px) { .grid { grid-template-columns: 1fr 1fr; } }
    `,
  ],
})
export class LoginPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private apiHealth = inject(ApiHealthService);

  api: ApiHealth | null = null;

  constructor() {
    this.api = { status: 'checking', baseUrl: this.apiHealth.baseUrl };
    this.apiHealth.check().subscribe((r) => (this.api = r));
  }

  roles = [
    { icon: '🛒', label: 'Customer', who: 'Anand Krishnan', role: 'CUSTOMER' },
    { icon: '🏪', label: 'Shop Owner', who: 'Murugan Selvam', role: 'SHOP_ADMIN' },
    { icon: '🏢', label: 'Company Admin', who: 'Santhosh Kumar', role: 'COMPANY_ADMIN' },
    { icon: '🛡️', label: 'Super Admin', who: 'Rajendran V', role: 'SUPER_ADMIN' },
    { icon: '📦', label: 'Delivery Manager', who: 'Divya Balaji', role: 'DELIVERY_MANAGER' },
    { icon: '🛵', label: 'Delivery Partner', who: 'Ravi Shankar', role: 'DELIVERY_PARTNER' },
  ];

  sendOtp() {
    this.toast.show('OTP sent to +91 98425 00000 — demo mode, auto-verifies', 'info');
  }

  login(r: any) {
    const names: Record<string, string> = {
      CUSTOMER: 'Anand Krishnan', SHOP_ADMIN: 'Murugan Selvam', COMPANY_ADMIN: 'Santhosh Kumar',
      SUPER_ADMIN: 'Rajendran V', DELIVERY_MANAGER: 'Divya Balaji', DELIVERY_PARTNER: 'Ravi Shankar',
    };
    const orgs: Record<string, string> = {
      CUSTOMER: 'Anna Salai, Tindivanam', SHOP_ADMIN: 'Fresh Meat Centre', COMPANY_ADMIN: 'Tindivanam Fresh Foods',
      SUPER_ADMIN: 'KanniMeat HQ', DELIVERY_MANAGER: 'Tindivanam Delivery Hub', DELIVERY_PARTNER: 'Bike TN31 AA 4421',
    };
    this.auth.login({ name: names[r.role], role: r.role, org: orgs[r.role], uid: 'DEMO-001', avatarText: '' });
    const routes: Record<string, string> = {
      CUSTOMER: '/', SHOP_ADMIN: '/portal/shop', COMPANY_ADMIN: '/portal/company',
      SUPER_ADMIN: '/portal/super', DELIVERY_MANAGER: '/portal/delivery-manager', DELIVERY_PARTNER: '/portal/delivery-partner',
    };
    this.toast.show(`Signed in as ${r.label}`, 'success');
    this.router.navigate([routes[r.role]]);
  }
}