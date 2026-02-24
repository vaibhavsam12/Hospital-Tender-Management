import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TenderService } from '../../core/services/tender.service';
import { AnalyticsSummary, Tender } from '../../models/models';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, MatIconModule],
    template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Hospital Procurement Overview · {{ today }}</p>
    </div>
    <div class="page-body">

      <!-- KPI Cards -->
      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(0,212,255,0.12)">
            <mat-icon style="color:#00d4ff">description</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Tenders</div>
            <div class="kpi-value">{{ summary.total_tenders }}</div>
            <div class="kpi-sub">All time</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(16,185,129,0.12)">
            <mat-icon style="color:#10b981">lock_open</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Active (Open)</div>
            <div class="kpi-value">{{ summary.active_tenders }}</div>
            <div class="kpi-sub">Accepting bids</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(245,158,11,0.12)">
            <mat-icon style="color:#f59e0b">emoji_events</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Awarded</div>
            <div class="kpi-value">{{ summary.awarded_tenders }}</div>
            <div class="kpi-sub">Contracts assigned</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(124,58,237,0.12)">
            <mat-icon style="color:#7c3aed">account_balance_wallet</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Budget</div>
            <div class="kpi-value">₹{{ formatCrore(summary.total_budget) }}Cr</div>
            <div class="kpi-sub">Procurement value</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(239,68,68,0.12)">
            <mat-icon style="color:#ef4444">gavel</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Bids</div>
            <div class="kpi-value">{{ summary.total_bids }}</div>
            <div class="kpi-sub">Avg {{ summary.avg_bids_per_tender }} per tender</div>
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
    .charts-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    table thead tr th {
      text-align: left;
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.02);
    }
    table tbody tr td {
      padding: 14px 16px;
      font-size: 14px;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border);
    }
    .table-row:hover { background: rgba(255,255,255,0.03); }
    .table-row:last-child td { border-bottom: none; }
    .view-link { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
    .view-link:hover { text-decoration: underline; }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('donutChart') donutRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('barChart') barRef!: ElementRef<HTMLCanvasElement>;

    summary: AnalyticsSummary | null = null;
    recentTenders: Tender[] = [];
    today = new Date().toLocaleDateString('en-IN', { dateStyle: 'long' });

    constructor(
        private analytics: AnalyticsService,
        private tenderSvc: TenderService
    ) { }

    ngOnInit() {
        this.analytics.getSummary().subscribe(s => {
            this.summary = s;
            this.drawCharts(s);
        });
        this.tenderSvc.getTenders().subscribe(t => {
            this.recentTenders = t.slice(0, 8);
        });
    }

    ngAfterViewInit() { }

    drawCharts(s: AnalyticsSummary) {
        setTimeout(() => {
            const cats = s.by_category;
            const labels = cats.map(c => c.category);
            const counts = cats.map(c => c.count);
            const budgets = cats.map(c => +(c.total_budget / 100000).toFixed(1));
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
                        cutout: '60%'
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
                            backgroundColor: colors.map(c => c + 'bb'),
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
