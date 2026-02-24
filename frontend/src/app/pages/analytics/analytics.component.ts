import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TenderService } from '../../core/services/tender.service';
import { AnalyticsSummary, Tender } from '../../models/models';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
    <div class="page-header">
      <h1>Analytics</h1>
      <p>Procurement insights and spending trends</p>
    </div>
    <div class="page-body" *ngIf="summary">

      <!-- KPI Row -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(0,212,255,0.12)">
            <mat-icon style="color:#00d4ff">show_chart</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Avg Bids / Tender</div>
            <div class="kpi-value">{{ summary.avg_bids_per_tender }}</div>
            <div class="kpi-sub">Vendor competition rate</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(16,185,129,0.12)">
            <mat-icon style="color:#10b981">check_circle</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Award Rate</div>
            <div class="kpi-value">{{ awardRate }}%</div>
            <div class="kpi-sub">Tenders successfully awarded</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(124,58,237,0.12)">
            <mat-icon style="color:#7c3aed">trending_up</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Budget</div>
            <div class="kpi-value">₹{{ formatCrore(summary.total_budget) }}Cr</div>
            <div class="kpi-sub">Across all tenders</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(245,158,11,0.12)">
            <mat-icon style="color:#f59e0b">category</mat-icon>
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Top Category</div>
            <div class="kpi-value" style="font-size:18px">{{ topCategory }}</div>
            <div class="kpi-sub">Highest tenders by count</div>
          </div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="charts-row">
        <div class="chart-card" style="flex:1">
          <div class="section-title">Tender Status Distribution</div>
          <canvas #statusChart></canvas>
        </div>
        <div class="chart-card" style="flex:1.5">
          <div class="section-title">Budget by Category (₹ Crores)</div>
          <canvas #categoryBudgetChart></canvas>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="charts-row">
        <div class="chart-card" style="flex:1">
          <div class="section-title">Tender Count by Category</div>
          <canvas #countChart></canvas>
        </div>
        <div class="chart-card" style="flex:1">
          <div class="section-title">Avg Budget per Category (₹ Lakhs)</div>
          <canvas #avgBudgetChart></canvas>
        </div>
      </div>

      <!-- Category Table -->
      <div class="section-title">Category Breakdown</div>
      <div class="card" style="padding:0;overflow:hidden">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th>Category</th>
              <th>Tenders</th>
              <th>Total Budget</th>
              <th>Avg Budget</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of summary.by_category">
              <td><span class="cat-badge">{{ c.category }}</span></td>
              <td>{{ c.count }}</td>
              <td>₹{{ formatCrore(c.total_budget) }}Cr</td>
              <td>₹{{ formatLakh(c.total_budget / c.count) }}L avg</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(c.count / summary.total_tenders) * 100"></div>
                </div>
                <span style="font-size:12px;color:var(--text-secondary)">{{ ((c.count / summary.total_tenders) * 100) | number:'1.0-0' }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `,
    styles: [`
    .charts-row {
      display: flex; gap: 16px; margin-bottom: 24px;
    }
    table thead tr th {
      text-align: left; padding: 12px 16px;
      font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
      color: var(--text-secondary); border-bottom: 1px solid var(--border);
      background: rgba(255,255,255,0.02);
    }
    table tbody tr td {
      padding: 14px 16px; font-size: 14px;
      color: var(--text-primary); border-bottom: 1px solid var(--border);
    }
    table tbody tr:last-child td { border-bottom: none; }
    table tbody tr:hover { background: rgba(255,255,255,0.02); }
    .cat-badge {
      display: inline-block; padding: 4px 10px; border-radius: 6px;
      background: rgba(124,58,237,0.12); color: #7c3aed;
      font-size: 12px; font-weight: 600;
    }
    .progress-bar {
      width: 80px; height: 6px; background: rgba(255,255,255,0.08);
      border-radius: 3px; overflow: hidden; display: inline-block; margin-right: 8px; vertical-align: middle;
    }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #00d4ff, #7c3aed); border-radius: 3px; }
  `]
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
    @ViewChild('statusChart') statusRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('categoryBudgetChart') catBudgetRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('countChart') countRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('avgBudgetChart') avgRef!: ElementRef<HTMLCanvasElement>;

    summary: AnalyticsSummary | null = null;
    awardRate = 0;
    topCategory = '';

    constructor(private analytics: AnalyticsService) { }

    ngOnInit() {
        this.analytics.getSummary().subscribe(s => {
            this.summary = s;
            this.awardRate = s.total_tenders ? +(s.awarded_tenders / s.total_tenders * 100).toFixed(1) : 0;
            this.topCategory = s.by_category.reduce((a: { category: string; count: number; total_budget: number }, b: { category: string; count: number; total_budget: number }) => a.count > b.count ? a : b, s.by_category[0])?.category || '';

            this.drawCharts(s);
        });
    }

    ngAfterViewInit() { }

    drawCharts(s: AnalyticsSummary) {
        setTimeout(() => {
            const colors = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
            const cats = s.by_category;

            // Status doughnut
            if (this.statusRef?.nativeElement) {
                new Chart(this.statusRef.nativeElement, {
                    type: 'doughnut',
                    data: {
                        labels: ['Open', 'Awarded', 'Closed'],
                        datasets: [{ data: [s.active_tenders, s.awarded_tenders, s.closed_tenders], backgroundColor: ['#10b981', '#00d4ff', '#8b9cb8'], borderWidth: 0 }]
                    },
                    options: { plugins: { legend: { position: 'bottom', labels: { color: '#8b9cb8' } } }, cutout: '65%' }
                });
            }

            // Category budget bar
            if (this.catBudgetRef?.nativeElement) {
                new Chart(this.catBudgetRef.nativeElement, {
                    type: 'bar',
                    data: {
                        labels: cats.map(c => c.category),
                        datasets: [{ label: '₹ Crores', data: cats.map(c => +(c.total_budget / 10000000).toFixed(2)), backgroundColor: colors.map(c => c + 'bb'), borderRadius: 8 }]
                    },
                    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
                });
            }

            // Count bar
            if (this.countRef?.nativeElement) {
                new Chart(this.countRef.nativeElement, {
                    type: 'bar',
                    data: {
                        labels: cats.map(c => c.category),
                        datasets: [{ label: 'Tenders', data: cats.map(c => c.count), backgroundColor: ['#00d4ffbb', '#7c3aedbb', '#10b981bb', '#f59e0bbb', '#ef4444bb'], borderRadius: 8 }]
                    },
                    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
                });
            }

            // Avg budget radar / bar
            if (this.avgRef?.nativeElement) {
                new Chart(this.avgRef.nativeElement, {
                    type: 'bar',
                    data: {
                        labels: cats.map(c => c.category),
                        datasets: [{ label: '₹ Lakhs', data: cats.map(c => +((c.total_budget / c.count) / 100000).toFixed(1)), backgroundColor: colors.map(c => c + '99'), borderRadius: 8 }]
                    },
                    options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#8b9cb8' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
                });
            }
        }, 100);
    }

    formatCrore(v: number) { return (v / 10000000).toFixed(2); }
    formatLakh(v: number) { return (v / 100000).toFixed(1); }
}
