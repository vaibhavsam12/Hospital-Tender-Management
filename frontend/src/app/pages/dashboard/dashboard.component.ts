import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TenderService } from '../../core/services/tender.service';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsSummary, Tender, VendorStats } from '../../models/models';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="page-header" *ngIf="auth.currentUser$ | async as user">
      <div class="welcome-section">
        <span class="welcome-text">Welcome back,</span>
        <h1>{{ user.full_name }}</h1>
        <p>Hospital Procurement Overview · {{ today }}</p>
      </div>
    </div>
    <div class="page-body">

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card">
          <div class="kpi-icon"><mat-icon>insert_chart_outlined</mat-icon></div>
          <div class="kpi-info">
            <span class="kpi-label">Total Tenders</span>
            <span class="kpi-value">{{ summary.total_tenders }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon"><mat-icon>event_available</mat-icon></div>
          <div class="kpi-info">
            <span class="kpi-label">Active Opportunities</span>
            <span class="kpi-value">{{ summary.active_tenders }}</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon"><mat-icon>account_balance_wallet</mat-icon></div>
          <div class="kpi-info">
            <span class="kpi-label">Total Value</span>
            <span class="kpi-value">₹{{ formatLakh(summary.total_budget) }}L</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon"><mat-icon>groups</mat-icon></div>
          <div class="kpi-info">
            <span class="kpi-label">Avg Bids / Tender</span>
            <span class="kpi-value">{{ summary.avg_bids_per_tender | number:'1.1-1' }}</span>
          </div>
        </div>
      </div>

      <!-- Vendor Success Section -->
      <div class="vendor-banner" *ngIf="vendorStats">
        <div class="banner-header">
           <mat-icon style="color:var(--accent)">stars</mat-icon>
           <span>Vendor Performance Scorecard</span>
        </div>
        <div class="banner-body">
          <div class="v-stat">
            <span class="v-label">Success Rate</span>
            <span class="v-value" [style.color]="vendorStats.win_rate > 50 ? '#10b981' : '#f59e0b'">{{ vendorStats.win_rate }}%</span>
            <div class="v-bar"><div class="v-fill" [style.width.%]="vendorStats.win_rate" [style.background]="vendorStats.win_rate > 50 ? '#10b981' : '#f59e0b'"></div></div>
          </div>
          <div class="v-stat">
            <span class="v-label">Won Bid Value</span>
            <span class="v-value">₹{{ formatLakh(vendorStats.total_bid_value) }}L</span>
            <span class="v-sub">Total revenue generated</span>
          </div>
          <div class="v-stat">
            <span class="v-label">Bidding Activity</span>
            <span class="v-value">{{ vendorStats.won_bids }} / {{ vendorStats.total_bids }}</span>
            <span class="v-sub">Wins out of total bids</span>
          </div>
          <div class="v-stat">
            <span class="v-label">Open Opportunities</span>
            <span class="v-value">{{ vendorStats.active_bids }}</span>
            <span class="v-sub">Active tender participations</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-card" style="flex:1.2">
          <div class="section-title">Tenders by Category</div>
          <canvas #donutChart></canvas>
        </div>
        <div class="chart-card" style="flex:2">
          <div class="section-title">Budget by Category (₹ Lakhs)</div>
          <canvas #barChart></canvas>
        </div>
      </div>

      <!-- Recent Tenders -->
      <div class="recent-section">
        <div class="section-title" style="margin-bottom:14px">Recent Tenders</div>
        <div class="card" style="padding:0;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th>Title</th>
                <th>Hospital</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of recentTenders" class="table-row">
                <td>{{ t.title }}</td>
                <td>{{ t.hospital?.name || '—' }}</td>
                <td>{{ t.category }}</td>
                <td>₹{{ formatLakh(t.budget) }}L</td>
                <td><span class="status-chip" [ngClass]="t.status">{{ t.status | titlecase }}</span></td>
                <td><a [routerLink]="['/tenders', t.id]" class="view-link">View →</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .charts-row { display: flex; gap: 16px; margin-bottom: 24px; }
    table thead tr th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); }
    table tbody tr td { padding: 14px 16px; font-size: 14px; color: var(--text-primary); border-bottom: 1px solid var(--border); }
    .table-row:hover { background: rgba(255,255,255,0.03); }
    .table-row:last-child td { border-bottom: none; }
    .view-link { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
    .view-link:hover { text-decoration: underline; }
    .welcome-section {
      h1 { font-size: 32px; margin: 4px 0; font-weight: 700; color: #fff; }
      .welcome-text { font-size: 14px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500; }
    }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .kpi-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.1); }
    .kpi-icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(0, 212, 255, 0.1); display: flex; align-items: center; justify-content: center; color: var(--accent); }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #fff; }
    .vendor-banner {
      background: linear-gradient(90deg, rgba(0,212,255,0.1) 0%, rgba(124,58,237,0.05) 100%);
      border: 1px solid rgba(0,212,255,0.15); border-radius: 16px; margin-bottom: 24px; overflow: hidden;
      .banner-header { background: rgba(0,212,255,0.05); padding: 10px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 10px; span { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #cbd5e1; } }
      .banner-body { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(255,255,255,0.05);
        .v-stat { background: var(--card-bg); padding: 20px; display: flex; flex-direction: column; gap: 4px;
          .v-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
          .v-value { font-size: 24px; font-weight: 800; color: #fff; }
          .v-sub { font-size: 11px; color: #4f5b71; }
          .v-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; margin-top: 8px; overflow: hidden;
            .v-fill { height: 100%; border-radius: 2px; transition: width 1s ease-out; }
          }
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('donutChart') donutRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart') barRef!: ElementRef<HTMLCanvasElement>;

  summary: AnalyticsSummary | null = null;
  vendorStats: VendorStats | null = null;
  recentTenders: Tender[] = [];
  today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

  constructor(
    public auth: AuthService,
    private analytics: AnalyticsService,
    private tenderSvc: TenderService
  ) { }

  ngOnInit() {
    this.analytics.getSummary().subscribe(s => {
      this.summary = s;
      if (s && s.by_category) {
        this.drawCharts(s);
      }
    });
    this.tenderSvc.getTenders().subscribe(t => {
      this.recentTenders = t.slice(0, 8);
    });
    if (this.auth.currentUserValue?.role === 'vendor') {
      this.analytics.getVendorStats().subscribe(vs => this.vendorStats = vs);
    }
  }

  ngAfterViewInit() { }

  drawCharts(s: AnalyticsSummary) {
    setTimeout(() => {
      const cats = s.by_category || [];
      const labels = cats.map(c => c.category);
      const counts = cats.map(c => c.count);
      const budgets = cats.map(c => +((c.total_budget || 0) / 100000).toFixed(1));
      const colors = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

      if (this.donutRef?.nativeElement) {
        new Chart(this.donutRef.nativeElement, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }]
          },
          options: {
            plugins: { legend: { position: 'bottom', labels: { color: '#8b9cb8', font: { size: 12 } } } },
            cutout: '65%'
          }
        });
      }

      if (this.barRef?.nativeElement) {
        new Chart(this.barRef.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Budget (₹ Lakhs)',
              data: budgets,
              backgroundColor: colors.map(c => c + 'cc'),
              borderRadius: 8
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
              y: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            }
          }
        });
      }
    }, 100);
  }

  formatCrore(v: number) { return (v / 10000000).toFixed(1); }
  formatLakh(v: number) { return (v / 100000).toFixed(1); }
}
