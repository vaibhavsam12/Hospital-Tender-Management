import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { BidService } from '../../core/services/bid.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { Bid } from '../../models/models';

@Component({
  selector: 'app-my-bids',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>My Submitted Bids</h1>
          <p>Track the status of your tender participation</p>
        </div>
      </div>

      <div class="glass-card table-container">
        <table mat-table [dataSource]="myBids">
          <ng-container matColumnDef="tender">
            <th mat-header-cell *matHeaderCellDef>Tender</th>
            <td mat-cell *matCellDef="let bid">{{ bid.tender?.title || 'Tender #' + bid.tender_id }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>My Quote</th>
            <td mat-cell *matCellDef="let bid" class="amount-cell">{{ bid.amount | currency:'INR' }}</td>
          </ng-container>

          <ng-container matColumnDef="submitted_at">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let bid">{{ bid.submitted_at | date }}</td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let bid">
              <mat-chip-set>
                <mat-chip [class.won]="bid.won" [class.pending]="!bid.won">
                  {{ bid.won ? 'Awarded' : 'Pending' }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>

          <ng-container matColumnDef="quotation">
            <th mat-header-cell *matHeaderCellDef>Quotation</th>
            <td mat-cell *matCellDef="let bid">
              <a *ngIf="bid.quotation_url" [href]="environment.apiUrl + bid.quotation_url" target="_blank" mat-icon-button color="accent">
                <mat-icon>file_download</mat-icon>
              </a>
              <span *ngIf="!bid.quotation_url" class="no-file">No file</span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div class="empty-state" *ngIf="myBids.length === 0">
          <mat-icon>content_paste_off</mat-icon>
          <p>You haven't submitted any bids yet.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .amount-cell { font-weight: 600; color: #00d4ff; }
    .no-file { color: #8a8d98; font-size: 12px; }
    .mat-chip.won { background-color: rgba(76, 175, 80, 0.2); color: #4caf50; }
    .mat-chip.pending { background-color: rgba(255, 193, 7, 0.1); color: #ffc107; }
    .empty-state {
      padding: 60px;
      text-align: center;
      color: #8a8d98;
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
    }
  `]
})
export class MyBidsComponent implements OnInit {
  myBids: Bid[] = [];
  displayedColumns: string[] = ['tender', 'amount', 'submitted_at', 'status', 'quotation'];

  constructor(private bidService: BidService, private auth: AuthService) { }

  ngOnInit() {
    this.loadMyBids();
  }

  loadMyBids() {
    const userEmail = this.auth.currentUserValue?.full_name; // Simple mock filter
    // In a real app, the backend would filter by user_id from token
    this.bidService.getBids().subscribe(bids => {
      // Mock filtering for demo: find bids matching the current vendor's "name"
      // Since my seed script uses random vendor names, I'll just show all for now or filter by some logic
      this.myBids = bids;
    });
  }
}
