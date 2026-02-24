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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
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
      <h1>Tenders</h1>
      <p>Manage all hospital procurement tenders</p>
    </div>
    <div class="page-body">

      <!-- Filters & Search -->
      <div class="filters-bar">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input
            type="text"
            placeholder="Search tenders..."
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
        <button class="btn-accent" (click)="openNewTenderDialog()">
          <mat-icon style="font-size:16px;vertical-align:middle">add</mat-icon> New Tender
        </button>
      </div>

      <!-- Table -->
      <div class="mat-table-wrapper">
        <table mat-table [dataSource]="dataSource" matSort>
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
            <td mat-cell *matCellDef="let t">
              <span class="tender-title" (click)="goDetail(t.id)">{{ t.title }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="hospital">
            <th mat-header-cell *matHeaderCellDef>Hospital</th>
            <td mat-cell *matCellDef="let t">{{ t.hospital?.name || '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let t">{{ t.category }}</td>
          </ng-container>

          <ng-container matColumnDef="budget">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Budget</th>
            <td mat-cell *matCellDef="let t">
              <span class="budget-value">₹{{ formatLakh(t.budget) }}L</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="deadline">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Deadline</th>
            <td mat-cell *matCellDef="let t">{{ t.deadline ? (t.deadline | date:'dd MMM yy') : '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let t">
              <span class="status-chip" [ngClass]="t.status">{{ t.status | titlecase }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="bids">
            <th mat-header-cell *matHeaderCellDef>Bids</th>
            <td mat-cell *matCellDef="let t">
              <span class="bid-count">{{ t.bids?.length ?? 0 }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let t">
              <button class="icon-btn" (click)="goDetail(t.id)">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedCols"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedCols;" (click)="goDetail(row.id)"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[10, 20, 50]" showFirstLastButtons></mat-paginator>
      </div>

    </div>

    <!-- Inline New Tender Modal -->
    <div class="modal-overlay" *ngIf="showNewForm" (click)="closeForm()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Create New Tender</h3>
          <button class="icon-btn" (click)="closeForm()"><mat-icon>close</mat-icon></button>
        </div>
        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="newTender.title" placeholder="Tender title" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Category</label>
            <select [(ngModel)]="newTender.category">
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Budget (₹)</label>
            <input type="number" [(ngModel)]="newTender.budget" placeholder="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Hospital ID</label>
            <input type="number" [(ngModel)]="newTender.hospital_id" placeholder="1–5" />
          </div>
          <div class="form-group">
            <label>Deadline</label>
            <input type="date" [(ngModel)]="newTender.deadline" />
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="newTender.description" rows="3" placeholder="Optional description..."></textarea>
        </div>
        <div class="form-actions">
          <button class="btn-ghost" (click)="closeForm()">Cancel</button>
          <button class="btn-accent" (click)="submitTender()">Create Tender</button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 14px;
      flex: 1;
      min-width: 200px;

      mat-icon { color: var(--text-secondary); font-size: 18px; }
      input {
        background: none;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-size: 14px;
        width: 100%;

        &::placeholder { color: var(--text-secondary); }
      }
    }
    .filter-chips {
      display: flex;
      gap: 6px;
    }
    .chip {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover { border-color: var(--accent); color: var(--accent); }
      &.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
    }
    .tender-title {
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      &:hover { color: var(--accent); }
    }
    .budget-value { font-weight: 600; color: #10b981; }
    .bid-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px; height: 28px;
      border-radius: 50%;
      background: rgba(124,58,237,0.15);
      color: #7c3aed;
      font-size: 13px;
      font-weight: 600;
    }
    .icon-btn {
      background: none; border: none; color: var(--text-secondary);
      cursor: pointer; padding: 4px;
      &:hover { color: var(--accent); }
    }
    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-card {
      background: #131929;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      width: 540px;
      max-width: 95vw;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 20px;
      h3 { font-size: 18px; font-weight: 700; }
    }
    .form-group {
      margin-bottom: 14px;
      label { display: block; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; text-transform: uppercase; }
      input, select, textarea {
        width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
        border-radius: 8px; padding: 10px 12px; color: var(--text-primary); font-size: 14px;
        outline: none; font-family: inherit;
        &:focus { border-color: var(--accent); }
      }
      textarea { resize: vertical; }
    }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .btn-ghost {
      background: transparent; border: 1px solid var(--border); color: var(--text-secondary);
      padding: 10px 20px; border-radius: 10px; cursor: pointer; font-size: 14px;
      &:hover { border-color: var(--accent); color: var(--accent); }
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

    goDetail(id: number) { this.router.navigate(['/tenders', id]); }

    openNewTenderDialog() { this.showNewForm = true; }
    closeForm() { this.showNewForm = false; }

    submitTender() {
        const payload = { ...this.newTender, budget: +this.newTender.budget };
        this.tenderSvc.createTender(payload).subscribe(() => {
            this.closeForm();
            this.loadTenders();
            this.newTender = { title: '', category: 'Equipment', budget: 0, hospital_id: 1, deadline: '', description: '' };
        });
    }

    formatLakh(v: number) { return (v / 100000).toFixed(1); }
}
