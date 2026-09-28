import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DataService, inr } from '../../core/services/data.service';
import { LocationService } from '../../core/services/location.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import type { Product, Shop } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="text">
          <div class="pill"><span class="pulse-dot"></span> Now delivering in Tindivanam &amp; Villupuram</div>
          <h1>Fresh Meat,<br><span class="accent">Delivered to Your Door.</span></h1>
          <p class="tagline">Order today. Get <b>fresh chicken, mutton and fish</b> when you need it — prepared by your local shop.</p>

          <div class="hero-cta">
            <button class="btn btn-brand btn-lg" routerLink="/categories"><mat-icon style="font-size:19px">shopping_bag</mat-icon> Order Now</button>
            <button class="btn btn-ghost btn-lg" routerLink="/location">
              <mat-icon style="font-size:19px">location_on</mat-icon>
              {{ loc?.area }}, {{ loc?.city }}
            </button>
          </div>
          <div class="trust-row">
            <span>⭐ 4.7 rating</span><span>🕐 Same-day prep</span><span>🏪 Local shops</span><span>💸 No payment till confirmed</span>
          </div>
        </div>
        <div class="hero-art">
          <div class="art-card main">
            <div style="font-size:64px">🍖</div>
            <b>Fresh Cut Today</b>
            <span>Country chicken · mutton · fish</span>
          </div>
          <div class="art-card float a">
            <div style="font-size:26px">📦</div>
            <b>Order Today</b>
          </div>
          <div class="art-card float b">
            <div style="font-size:26px">🛵</div>
            <b>Delivered Tomorrow</b>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORY STRIPS -->
    <section class="container" style="margin-top:-20px;position:relative;z-index:5">
      <div class="cats">
        <button class="cat-card" (click)="goCategory('chicken')">
          <span style="font-size:34px">🐓</span><b>Chicken</b><span class="sub">from ₹180/KG</span>
        </button>
        <button class="cat-card" (click)="goCategory('mutton')">
          <span style="font-size:34px">🐐</span><b>Mutton</b><span class="sub">from ₹720/KG</span>
        </button>
        <button class="cat-card" (click)="goCategory('fish')">
          <span style="font-size:34px">🐟</span><b>Fish</b><span class="sub">from ₹220/KG</span>
        </button>
      </div>
    </section>

    <!-- POPULAR -->
    <section class="container mt-6">
      <div class="flex justify-between items-center" style="margin-bottom:14px">
        <div>
          <h2 class="section-title" style="margin:0">Popular This Week</h2>
          <p class="text-muted" style="margin:4px 0 0">What your neighbours are ordering</p>
        </div>
      </div>
      <div class="product-grid">
        <div class="p-card card card-hover" *ngFor="let p of popular">
          <div class="thumb"><span style="font-size:42px">{{ p.emoji }}</span></div>
          <div class="p-body">
            <div class="price">{{ inr(p.pricePerKg) }}<span class="per">/KG</span></div>
            <b class="name">{{ p.name }}</b>
            <div class="shop"><span style="font-size:14px">🏪</span> {{ p.shopName }} · {{ p.shopArea }}</div>
            <div class="fresh"><span class="chip chip-green">✓ {{ p.freshness }}</span></div>
            <button class="btn btn-brand btn-sm w-full" (click)="addQuick(p)">
              <mat-icon style="font-size:18px">add</mat-icon> Add
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- NEARBY SHOPS -->
    <section class="mt-6 container" *ngIf="shops.length">
      <h2 class="section-title">Delivering to {{ loc?.area }}</h2>
      <p class="section-sub">These local shops are ready to prepare your order for tomorrow.</p>
      <div class="shop-grid">
        <div class="card shop-card" *ngFor="let s of shops">
          <div style="font-size:30px">🏪</div>
          <div class="grow-1">
            <b>{{ s.name }}</b>
            <div class="text-muted">{{ s.area }}, {{ s.city }}</div>
            <div style="font-size:13px;margin-top:4px">⭐ {{ s.rating }} · {{ s.ordersToday }} orders today</div>
          </div>
          <button class="btn btn-soft btn-sm" (click)="goCategoryByShop(s)"><mat-icon style="font-size:16px">storefront</mat-icon> Order</button>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="mt-6 how-sec">
      <div class="container">
        <h2 class="section-title text-center" style="color:#fff">How It Works</h2>
        <p class="text-center" style="color:var(--slate-400);margin:4px 0 28px">Order today → shop prepares fresh → delivered tomorrow</p>
        <div class="how-grid">
          <div class="how-step"><div class="num">1</div><b>Pick your meat</b><span>Choose chicken, mutton or fish with cut preference.</span></div>
          <div class="how-step"><div class="num">2</div><b>Choose delivery slot</b><span>Pick tomorrow morning's slot that suits you.</span></div>
          <div class="how-step"><div class="num">3</div><b>Shop prepares fresh</b><span>Your local shop cuts & packs on order day.</span></div>
          <div class="how-step"><div class="num">4</div><b>Receive at home</b><span>Track it live and confirm delivery with OTP.</span></div>
        </div>
      </div>
    </section>

    <!-- WHY US -->
    <section class="container mt-6">
      <h2 class="section-title text-center">Why Choose KanniMeat?</h2>
      <p class="section-sub text-center">Built around local shops and fresh, on-demand preparation</p>
      <div class="why-grid">
        <div class="card why"><div class="why-icon">🚚</div><b>Guaranteed Fresh</b><span>Cut after you order, not pre-packed from a warehouse.</span></div>
        <div class="card why"><div class="why-icon">🏪</div><b>Supports Local Shops</b><span>More regular customers for local businesses you trust.</span></div>
        <div class="card why"><div class="why-icon">🗓️</div><b>Advance Planning</b><span>Shops know demand, so nothing runs out on festival days.</span></div>
        <div class="card why"><div class="why-icon">💰</div><b>Fair Prices</b><span>Local market rates. Pay online or cash on delivery.</span></div>
        <div class="card why"><div class="why-icon">📞</div><b>Real Help</b><span>Talk to your shop on WhatsApp or phone with one tap.</span></div>
        <div class="card why"><div class="why-icon">🔁</div><b>One-Tap Repeat</b><span>Reorder your usual order in seconds.</span></div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section class="container mt-6">
      <h2 class="section-title text-center">What Customers Say</h2>
      <div class="review-grid">
        <div class="card review"><div style="font-size:18px">★★★★★</div><p>"Ordered mutton biryani cut for Sunday. Came packed in ice, super fresh."</p><b>— Meena, Bus Stand Road</b></div>
        <div class="card review"><div style="font-size:18px">★★★★★</div><p>"Our shop started getting repeat customers from KanniMeat. Demand prediction really works."</p><b>— Murugan, Fresh Meat Centre</b></div>
        <div class="card review"><div style="font-size:18px">★★★★☆</div><p>"Very easy for my parents to use. Big buttons, clear steps. Delivery was on time."</p><b>— Divya, Santhapet</b></div>
      </div>
    </section>

    <!-- LOCAL SHOP BENEFIT -->
    <section class="mt-6 container">
      <div class="card partner-banner">
        <div>
          <div style="font-size:36px">🏪</div>
        </div>
        <div class="grow-1">
          <h2 style="margin:0">Are you a local meat shop?</h2>
          <p style="color:var(--slate-500);margin:6px 0 0">See tomorrow's orders tonight. Prepare exactly what's needed and grow regular customers.</p>
        </div>
        <button class="btn btn-dark btn-lg" routerLink="/login">Join as a shop</button>
      </div>
    </section>
  `,
  styles: [
    `
      .hero { background: linear-gradient(135deg, #1e293b 0%, #0f172a 55%, #7c2d12 130%); color: #fff; padding: 46px 0 110px; }
      .hero-inner { display: grid; grid-template-columns: 1.2fr .8fr; gap: 40px; align-items: center; }
      .hero .text h1 { font-size: 46px; line-height: 1.12; margin: 18px 0 12px; font-family: 'Poppins'; font-weight: 800; }
      .hero .text .accent { color: var(--brand-400); }
      .hero .tagline { font-size: 17px; color: var(--slate-300); max-width: 440px; line-height: 1.6; margin: 0 0 24px; }
      .pill { display: inline-flex; align-items: center; gap: 8px; background: #1e293b; border: 1px solid #334155; padding: 7px 14px; border-radius: 999px; font-size: 13px; color: var(--slate-300); font-weight: 600; }
      .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green-500); animation: blink 1.6s infinite; }
      @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: .2; } }
      .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
      .hero-cta .btn-ghost { color: #e2e8f0; border-color: #334155; }
      .trust-row { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 26px; color: var(--slate-400); font-size: 13.5px; font-weight: 600; }
      .hero-art { position: relative; min-height: 300px; }
      .art-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); border-radius: 18px; backdrop-filter: blur(6px); padding: 22px; }
      .art-card.main { width: 220px; text-align: center; margin: 30px auto 0; }
      .art-card.main b, .art-card.main span { display: block; }
      .art-card.main span { color: var(--slate-400); font-size: 13px; margin-top: 4px; }
      .float { position: absolute; width: 150px; text-align: center; }
      .float.a { top: 0; left: 0; }
      .float.b { bottom: 6px; right: 0; }
      .cats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .cat-card { display: flex; flex-direction: column; align-items: center; gap: 2px; background: #fff; border: 1px solid var(--slate-200); border-radius: 16px; padding: 22px; box-shadow: var(--shadow-md); cursor: pointer; }
      .cat-card b { font-size: 17px; font-family: 'Poppins'; }
      .cat-card .sub { color: var(--slate-500); font-size: 13px; }
      .cat-card:hover { border-color: var(--brand-400); transform: translateY(-2px); }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
      .p-card { padding: 0; overflow: hidden; }
      .thumb { height: 130px; background: linear-gradient(135deg, #fff7ed, #ffe4d0); display: flex; align-items: center; justify-content: center; }
      .p-body { padding: 14px; display: flex; flex-direction: column; gap: 6px; }
      .price { font-weight: 800; font-size: 19px; color: var(--slate-900); font-family: 'Poppins'; }
      .per { color: var(--slate-400); font-weight: 600; font-size: 13px; }
      .name { font-size: 14.5px; }
      .shop { font-size: 13px; color: var(--slate-500); }
      .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
      .shop-card { display: flex; align-items: center; gap: 14px; }
      .how-sec { background: var(--slate-900); padding: 48px 0; }
      .how-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .how-step { text-align: center; color: #fff; }
      .how-step .num { width: 40px; height: 40px; margin: 0 auto 10px; border-radius: 50%; background: var(--brand-600); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
      .how-step b { display: block; margin-bottom: 4px; }
      .how-step span { color: var(--slate-400); font-size: 13.5px; line-height: 1.5; }
      .why-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .why { text-align: center; }
      .why-icon { font-size: 30px; margin-bottom: 8px; }
      .why b { display: block; margin-bottom: 4px; }
      .why span { color: var(--slate-500); font-size: 13.5px; line-height: 1.5; }
      .review-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .review p { color: var(--slate-600); font-size: 14.5px; line-height: 1.55; }
      .partner-banner { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; background: linear-gradient(135deg,#fff7ed,#ffedd5); border-color: var(--brand-200); padding: 26px; }
      .grow-1 { flex: 1; }
      @media (max-width: 900px) {
        .hero-inner { grid-template-columns: 1fr; }
        .hero .text h1 { font-size: 34px; }
        .cats, .how-grid, .why-grid, .review-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private data = inject(DataService);
  private locSvc = inject(LocationService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  inr = inr;
  loc: { area: string; city: string } | null = null;
  popular: Product[] = [];
  shops: Shop[] = [];

  ngOnInit() {
    this.locSvc.location.subscribe((l) => (this.loc = l));
    this.data.getPopular().then((p) => (this.popular = p));
    this.locSvc.shopsNear.then((s) => (this.shops = s));
  }
  goCategory(cat: string) {
    this.router.navigate(['/category', cat]);
  }
  goCategoryByShop(shop: Shop) {
    this.router.navigate(['/category', 'chicken'], { queryParams: { shop: shop.id } });
  }
  addQuick(p: Product) {
    this.cart.add(p, 0.5, p.cuts[0]);
    this.toast.show(`${p.name} added to cart`, 'success');
  }
}