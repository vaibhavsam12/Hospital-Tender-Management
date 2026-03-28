import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TenderService } from '../../core/services/tender.service';
import { Tender } from '../../models/models';

@Component({
  selector: 'app-tenders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatIconModule, MatTableModule, MatPaginatorModule,
    MatSortModule, MatSelectModule, MatFormFieldModule,
    MatInputModule, MatButtonModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <h1>Tenders Catalog</h1>
        <p>Browse and manage the latest procurement opportunities</p>
      </div>
      <button class="btn-accent" (click)="openNewTenderDialog()">
        <mat-icon>add</mat-icon> Create New Tender
      </button>
    </div>

    <div class="page-body">
      <!-- Filters & Search -->
      <div class="filters-bar">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            placeholder="Filter by title, hospital or category..."
            [(ngModel)]="searchQuery"
            (input)="applyFilter()"
          />
        </div>
        <div class="filter-chips">
          <button
            *ngFor="let s of statuses"
            class="chip"
            [class.active]="selectedStatus === s.value"
            (click)="setStatus(s.value)"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="glass-card mat-table-wrapper" style="padding: 0; overflow: hidden; border-radius: 12px;">
        <table mat-table [dataSource]="dataSource" matSort style="width: 100%; border-collapse: collapse;">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Title</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <div class="tender-title" (click)="goDetail(t.id)">{{ t.title }}</div>
              <div style="font-size: 11px; opacity: 0.6; margin-top: 2px;">#TND-{{ t.id }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="hospital">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Hospital</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <div style="font-weight: 500;">{{ t.hospital?.name || '—' }}</div>
              <div style="font-size: 11px; opacity: 0.6;">{{ t.hospital?.location || 'General' }}</div>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Category</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <span class="category-badge">{{ t.category }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="budget">
            <th mat-header-cell *matHeaderCellDef mat-sort-header style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Budget</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <span class="budget-value">₹{{ formatLakh(t.budget) }}L</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="deadline">
            <th mat-header-cell *matHeaderCellDef mat-sort-header style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Deadline</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <div [class.expiring]="isNearDeadline(t.deadline)">
                {{ t.deadline ? (t.deadline | date:'dd MMM yyyy') : 'No Deadline' }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Status</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <span class="status-chip" [ngClass]="t.status">{{ t.status | titlecase }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="bids">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase;">Bids</th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border);">
              <span class="bid-count">{{ t.bids?.length ?? 0 }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; border-bottom: 1px solid var(--border);"></th>
            <td mat-cell *matCellDef="let t" style="padding: 16px; border-bottom: 1px solid var(--border); text-align: right;">
              <button class="icon-btn" (click)="goDetail(t.id)">
                <mat-icon>arrow_forward</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedCols" style="background: rgba(255,255,255,0.02);"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedCols;" class="table-row" (click)="goDetail(row.id)"></tr>
        </table>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="dataSource.data.length === 0">
          <mat-icon>inventory_2</mat-icon>
          <p>No tenders found matching your criteria</p>
          <button class="btn-ghost" style="margin-top:20px" (click)="resetFilters()">Clear all filters</button>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 20, 50]" showFirstLastButtons style="background: transparent; color: var(--text-secondary);"></mat-paginator>
      </div>
    </div>

    <!-- New Project Modal -->
    <div class="modal-overlay" *ngIf="showNewForm" (click)="closeForm()">
      <div class="modal-card glass-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-icon">
            <mat-icon>post_add</mat-icon>
          </div>
          <div class="header-text">
            <h3>Create New Tender Submission</h3>
            <p>Publish a new procurement requirement to vendors</p>
          </div>
          <button class="close-btn" (click)="closeForm()"><mat-icon>close</mat-icon></button>
        </div>
        
        <div class="modal-body">
          <div class="form-group full">
            <label>Tender Title</label>
            <div class="input-wrapper">
              <mat-icon class="prefix-icon">title</mat-icon>
              <input type="text" [(ngModel)]="newTender.title" placeholder="e.g. Bulk Medical Imaging Systems" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <div class="input-wrapper">
                <mat-icon class="prefix-icon">category</mat-icon>
                <select [(ngModel)]="newTender.category">
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Budget (₹ Amount)</label>
              <div class="input-wrapper">
                <mat-icon class="prefix-icon">payments</mat-icon>
                <input type="number" [(ngModel)]="newTender.budget" placeholder="0" />
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Hospital ID</label>
              <div class="input-wrapper">
                <mat-icon class="prefix-icon">local_hospital</mat-icon>
                <input type="number" [(ngModel)]="newTender.hospital_id" placeholder="Hospital ID" />
              </div>
            </div>
            <div class="form-group">
              <label>Submission Deadline</label>
              <div class="input-wrapper">
                <mat-icon class="prefix-icon">event</mat-icon>
                <input type="date" [(ngModel)]="newTender.deadline" />
              </div>
            </div>
          </div>

          <div class="form-group full">
            <label>Technical Description</label>
            <div class="input-wrapper textarea">
              <mat-icon class="prefix-icon">description</mat-icon>
              <textarea [(ngModel)]="newTender.description" rows="4" placeholder="Provide full technical requirements..."></textarea>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn-cancel" (click)="closeForm()">Discard</button>
          <button class="btn-publish" (click)="submitTender()" [disabled]="submitting || !newTender.title">
            <span *ngIf="!submitting">Publish Tender</span>
            <span *ngIf="submitting" class="loader-content">
              Processing...
            </span>
            <div class="btn-glow"></div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 24px; }
    .header-content h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .header-content p { color: var(--text-secondary); }
    
    .filters-bar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .search-box {
      display: flex; align-items: center; gap: 10px; flex: 1; padding: 10px 16px;
      background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 12px;
      mat-icon { font-size: 20px; color: var(--text-secondary); }
      input { background: none; border: none; outline: none; color: var(--text-primary); width: 100%; font-size: 14px; }
    }
    .filter-chips { display: flex; gap: 8px; }
    .chip {
      padding: 8px 16px; border-radius: 20px; border: 1px solid var(--border); background: transparent;
      color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s;
      &:hover { border-color: var(--accent); color: var(--accent); }
      &.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
    }

    .table-row:hover { background: rgba(255,255,255,0.02); cursor: pointer; }
    .tender-title { font-weight: 600; color: var(--text-primary); font-size: 14px; }
    .category-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid var(--border); }
    .budget-value { font-weight: 700; color: #10b981; }
    .bid-count { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 24px; border-radius: 12px; background: rgba(124,58,237,0.1); color: #7c3aed; font-size: 11px; font-weight: 700; padding: 0 6px; }
    .icon-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: var(--accent); } }
    .expiring { color: #f59e0b; font-weight: 600; }

    .empty-state { padding: 100px 20px; text-align: center; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 80px; width: 80px; height: 80px; opacity: 0.1; margin-bottom: 24px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(12px); animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .modal-card { 
      width: 640px; padding: 40px; border-radius: 28px; 
      background: rgba(14, 21, 40, 0.8) !important;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 40px 80px rgba(0,0,0,0.6);
      animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    .modal-header {
      display: flex; align-items: center; gap: 20px; margin-bottom: 32px;
      .header-icon {
        width: 48px; height: 48px; background: rgba(0, 212, 255, 0.1); border-radius: 12px;
        display: flex; align-items: center; justify-content: center; color: var(--accent);
        mat-icon { font-size: 24px; width: 24px; height: 24px; }
      }
      .header-text { flex: 1; h3 { font-size: 20px; font-weight: 700; color: #fff; margin: 0; } p { font-size: 13px; color: var(--text-secondary); margin: 4px 0 0; } }
      .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; &:hover { color: #fff; } }
    }

    .modal-body { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .form-group {
      display: flex; flex-direction: column; gap: 8px;
      label { font-size: 11px; font-weight: 700; color: #8b9cb8; text-transform: uppercase; letter-spacing: 0.8px; padding-left: 4px; }
    }

    .input-wrapper {
      background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
      display: flex; align-items: center; transition: all 0.3s ease;
      &:focus-within { border-color: var(--accent); background: rgba(255,255,255,0.05); box-shadow: 0 0 0 4px rgba(0,212,255,0.1); }
      
      .prefix-icon { margin: 0 12px 0 16px; font-size: 20px; width: 20px; height: 20px; color: #8b9cb8; flex-shrink: 0; }
      
      input, select, textarea {
        background: transparent; border: none; outline: none; color: #f0f4ff; padding: 12px 16px 12px 0; width: 100%; font-size: 14px;
        option { background: #0e1528; color: #fff; }
      }
      &.textarea { align-items: flex-start; .prefix-icon { margin-top: 14px; } textarea { padding: 12px 16px 12px 0; resize: none; } }
    }

    .form-actions {
      display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px;
      .btn-cancel { background: transparent; border: 1px solid var(--border); color: #8b9cb8; padding: 0 24px; height: 48px; border-radius: 12px; font-weight: 600; cursor: pointer; &:hover { background: rgba(255,255,255,0.05); color: #fff; } }
      .btn-publish {
        background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #fff; border: none; padding: 0 32px; height: 48px; 
        border-radius: 12px; font-weight: 700; cursor: pointer; position: relative; overflow: hidden; transition: transform 0.2s;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,212,255,0.2); }
      }
    }
  `]
})
export class TendersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedCols = ['title', 'hospital', 'category', 'budget', 'deadline', 'status', 'bids', 'actions'];
  dataSource = new MatTableDataSource<Tender>([]);
  selectedStatus = '';
  searchQuery = '';
  showNewForm = false;
  submitting = false;

  statuses = [
    { label: 'All', value: '' },
    { label: 'Open', value: 'open' },
    { label: 'Awarded', value: 'awarded' },
    { label: 'Closed', value: 'closed' },
  ];
  categories = ['Equipment', 'Drugs', 'Services', 'IT', 'Infrastructure'];

  newTender: any = { title: '', category: 'Equipment', budget: 0, hospital_id: 1, deadline: '', description: '' };

  constructor(private tenderSvc: TenderService, private router: Router) { }

  ngOnInit() { this.loadTenders(); }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (t, f) =>
      (t.title + t.category + (t.hospital?.name || '')).toLowerCase().includes(f);
  }

  loadTenders() {
    this.tenderSvc.getTenders(this.selectedStatus || undefined).subscribe(t => {
      this.dataSource.data = t;
    });
  }

  applyFilter() {
    this.dataSource.filter = this.searchQuery.toLowerCase();
  }

  setStatus(s: string) {
    this.selectedStatus = s;
    this.loadTenders();
  }

  resetFilters() {
    this.selectedStatus = '';
    this.searchQuery = '';
    this.loadTenders();
  }

  goDetail(id: number) { this.router.navigate(['/tenders', id]); }

  openNewTenderDialog() { this.showNewForm = true; }
  closeForm() {
    this.showNewForm = false;
    this.newTender = { title: '', category: 'Equipment', budget: 0, hospital_id: 1, deadline: '', description: '' };
  }

  submitTender() {
    if (!this.newTender.title) return;
    this.submitting = true;
    const payload = { ...this.newTender, budget: +this.newTender.budget };
    this.tenderSvc.createTender(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.closeForm();
        this.loadTenders();
      },
      error: () => this.submitting = false
    });
  }

  isNearDeadline(d: string | null): boolean {
    if (!d) return false;
    const diff = (new Date(d).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diff > 0 && diff < 7;
  }

  formatLakh(v: number) { return (v / 100000).toFixed(1); }
}
