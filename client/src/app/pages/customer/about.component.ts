import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4" style="max-width:820px">
      <h1 class="section-title">About KanniMeat</h1>
      <p class="section-sub">Fresh meat isn't a delivery problem — it's a local trust problem. We fix that.</p>

      <div class="card">
        <p>KanniMeat connects customers in tier-2 and rural towns with the <b>meat shops they already trust</b> — and makes ordering, preparing and delivering <b>predictable</b> for both sides.</p>
        <p>Most online meat platforms run centralised warehouses. Animals are killed and pre-packed hundreds of kilometres away. For families who grew up buying from their local butcher every morning, that is neither fresh nor trustworthy.</p>
        <p>We keep the local shop at the centre:</p>
        <ul>
          <li>You order tonight for tomorrow's delivery slot.</li>
          <li>Your neighbourhood shop sees the demand in advance and sources exactly what is needed.</li>
          <li>Meat is cut fresh on order day, cold-packed, and delivered to your home by a local delivery partner.</li>
        </ul>
        <p><b>Shops win:</b> more regular customers, advance demand visibility, and digital order management — no more guesswork on festival days.</p>
      </div>

      <div class="card mt-3">
        <b>Cities we serve</b>
        <p class="text-muted">Tindivanam · Villupuram</p>
        <b>Onboarding a new town</b>
        <p class="text-muted">We start with a single strong local shop and open ordering area-by-area, the same way we did in Anna Salai.</p>
      </div>
    </div>
  `,
})
export class AboutPage {}