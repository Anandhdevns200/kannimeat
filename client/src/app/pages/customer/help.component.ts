import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';

interface GuideStep { title: string; desc: string; icon: string; }
interface Guide { key: string; label: string; icon: string; intro: string; steps: GuideStep[]; faqs: { q: string; a: string }[]; }

const GUIDES: Guide[] = [
  {
    key: 'customer', label: 'Customer', icon: '🛒',
    intro: 'Order fresh meat today for delivery tomorrow — in under 6 taps.',
    steps: [
      { icon: '📍', title: 'Select your location', desc: 'Use current location or search area, city or PIN code. We show only shops that deliver there.' },
      { icon: '🐓', title: 'Browse meat', desc: 'Pick Chicken, Mutton or Fish. Every cut is prepared fresh by your local shop.' },
      { icon: '⚖️', title: 'Choose quantity & cut', desc: 'Select 250g – 3KG and a cut preference like Curry Cut or Biryani Cut.' },
      { icon: '📅', title: 'Pick tomorrow’s slot', desc: 'Choose a morning or afternoon delivery slot that suits you.' },
      { icon: '💳', title: 'Pay your way', desc: 'UPI, card, net banking or cash on delivery. Nothing is charged to your card in demo mode.' },
      { icon: '🚚', title: 'Track delivery', desc: 'Follow your order from processing to delivery, and confirm with OTP.' },
      { icon: '🔁', title: 'Reorder in seconds', desc: 'Repeat your usual order from history with one tap.' },
    ],
    faqs: [
      { q: 'How fresh is the meat?', a: 'The shop only prepares your order after you order. For tomorrow deliveries, meat is sourced fresh that morning and cold-packed.' },
      { q: 'What if I miss my delivery slot?', a: 'The delivery partner will call you on the saved phone number. You can reschedule for the next available slot.' },
      { q: 'Is cash on delivery available?', a: 'Yes. Pay the delivery partner on receipt. Online methods also available.' },
    ],
  },
  {
    key: 'shop', label: 'Shop Owner', icon: '🏪',
    intro: 'See tomorrow’s demand tonight. Prepare exactly what’s needed. Deliver on time.',
    steps: [
      { icon: '🔐', title: 'Login', desc: 'Sign in with your shop account. Shop staff get limited, role-based access.' },
      { icon: '📋', title: 'Check tomorrow’s orders', desc: 'Open “Tomorrow’s Orders” to see exactly how much quantity is booked.' },
      { icon: '📦', title: 'Review required quantity', desc: 'The dashboard shows expected demand in KG per category so you source correctly.' },
      { icon: '✅', title: 'Accept orders', desc: 'Accept or reject each order before the 8 PM cutoff.' },
      { icon: '🔪', title: 'Process meat', desc: 'Cut per the customer’s cut preference on delivery day.' },
      { icon: '📦', title: 'Pack orders', desc: 'Weigh, cold-pack and label each order when packing.' },
      { icon: '🚚', title: 'Mark ready for delivery', desc: 'Ready orders flow to the delivery manager automatically.' },
      { icon: '🧾', title: 'Handover & invoice', desc: 'Invoice is generated instantly. Track daily sales in Reports.' },
    ],
    faqs: [
      { q: 'What if I can’t accept an order?', a: 'Reject before cutoff with a reason. The customer is notified and refunded (demo).' },
      { q: 'How do I avoid running out of stock?', a: 'Use the demand forecast on the dashboard. Reserve stock automatically when orders are accepted.' },
      { q: 'Does it replace my counter sales?', a: 'No. Online orders are an addition to your regular counter business.' },
    ],
  },
  {
    key: 'company', label: 'Company Admin', icon: '🏢',
    intro: 'Manage all your shops, staff and performance from one place.',
    steps: [
      { icon: '🏪', title: 'Manage shops', desc: 'Add new shops, assign managers, and view performance per shop.' },
      { icon: '👥', title: 'Manage staff', desc: 'Onboard shop admins and staff with role-based permissions.' },
      { icon: '🥩', title: 'Manage products', desc: 'Control the catalogue and pricing across your shops.' },
      { icon: '📊', title: 'Monitor inventory', desc: 'See live stock, reserved and expected demand per shop.' },
      { icon: '🧾', title: 'Orders & payments', desc: 'Track all orders, payments and invoices across your network.' },
      { icon: '📈', title: 'View reports', desc: 'Revenue, cancelled rates, delivery performance and more.' },
    ],
    faqs: [
      { q: 'What data can I see?', a: 'Everything about your own company’s shops, staff, orders and inventory. No other company’s data.' },
      { q: 'Can a shop integrate its own billing?', a: 'Future ERP/accounting export is planned. Invoices are downloadable today.' },
    ],
  },
  {
    key: 'super', label: 'Super Admin', icon: '🛡️',
    intro: 'The platform-level control centre across companies, cities and delivery ops.',
    steps: [
      { icon: '🏢', title: 'Companies', desc: 'Onboard companies, suspend accounts, manage GSTIN.' },
      { icon: '🏪', title: 'Shops', desc: 'Activate/deactivate shops and see city-wise performance.' },
      { icon: '👤', title: 'Users & Roles', desc: 'Manage every role with permissions that map to the API RBAC.' },
      { icon: '🥩', title: 'Products & inventory', desc: 'Platform-wide catalogue sanity and stock visibility.' },
      { icon: '🛵', title: 'Delivery partners', desc: 'Onboard and monitor partners across cities.' },
      { icon: '💳', title: 'Payments & invoices', desc: 'Reconciliation dashboard for settlements.' },
      { icon: '⚙️', title: 'Settings', desc: 'System configuration like GST and delivery fees.' },
    ],
    faqs: [
      { q: 'How is RBAC enforced?', a: 'UI hides what you cannot access, and the ASP.NET Core API enforces the same roles server-side.' },
      { q: 'Can I see another company’s data?', a: 'Yes — as platform owner all data is visible in read-only or full as per permissions.' },
    ],
  },
  {
    key: 'delivery-partner', label: 'Delivery Partner', icon: '🛵',
    intro: 'Simple. See your deliveries, navigate, confirm with OTP, done.',
    steps: [
      { icon: '🔐', title: 'Login', desc: 'Your own delivery partner account.' },
      { icon: '📦', title: 'View assigned deliveries', desc: 'Orders are assigned by the delivery manager.' },
      { icon: '🧭', title: 'Navigate', desc: 'Open the customer location in maps with one tap.' },
      { icon: '📞', title: 'Contact customer', desc: 'Call the customer through the app if you can’t find the address.' },
      { icon: '🔑', title: 'Confirm OTP', desc: 'Customer shares the 4-digit OTP to complete delivery.' },
    ],
    faqs: [
      { q: 'What if the customer isn’t home?', a: 'Call them. If unreachable, mark as failed after 2 attempts.' },
      { q: 'How do I handle COD?', a: 'Collect cash and its amount shows in your pending settlements report.' },
    ],
  },
];

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <div class="container mt-4">
      <h1 class="section-title">Help Centre & User Guide</h1>
      <p class="section-sub">Step-by-step guides and FAQs for every user.</p>

      <mat-tab-group class="tabs" (selectedTabChange)="select($event.index)">
        <mat-tab *ngFor="let g of guides; let i = index">
          <ng-template mat-tab-label>
            <span style="margin-right:6px;font-size:17px">{{ g.icon }}</span>{{ g.label }}
          </ng-template>
        </mat-tab>
      </mat-tab-group>

      <div class="mt-4" *ngIf="active">
        <div class="card intro-card">
          <b style="font-size:18px">{{ active.icon }} {{ active.label }} Guide</b>
          <p class="text-muted" style="margin:4px 0 0">{{ active.intro }}</p>
        </div>

        <div class="steps">
          <div class="step card" *ngFor="let s of active.steps; let i = index">
            <div class="num">{{ i + 1 }}</div>
            <div>
              <b>{{ s.icon }} {{ s.title }}</b>
              <p class="text-muted" style="margin:4px 0 0">{{ s.desc }}</p>
            </div>
          </div>
        </div>

        <div class="card mt-4">
          <b>FAQs</b>
          <mat-expansion-panel *ngFor="let f of active.faqs" class="mt-2">
            <mat-expansion-panel-header><b style="font-size:14px">{{ f.q }}</b></mat-expansion-panel-header>
            <p class="text-muted" style="margin:0">{{ f.a }}</p>
          </mat-expansion-panel>
        </div>

        <div class="card mt-4 text-center">
          <b>Still stuck?</b>
          <p class="text-muted" style="margin:6px 0 12px">Chat with our support on WhatsApp or call us.</p>
          <a class="btn btn-brand btn-md" href="https://wa.me/919842500000" target="_blank">💬 WhatsApp Support</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tabs { background: #fff; border-radius: 12px; padding: 6px 14px 0; border: 1px solid var(--slate-200); }
      .intro-card { background: linear-gradient(135deg,#fff7ed,#ffedd5); border-color: var(--brand-200); }
      .steps { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
      .step { display: flex; gap: 14px; align-items: flex-start; }
      .num { width: 34px; height: 34px; border-radius: 50%; background: var(--brand-600); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; }
    `,
  ],
})
export class HelpPage {
  guides = GUIDES;
  active: Guide = GUIDES[0];

  select(index: number) {
    this.active = this.guides[index];
  }
}