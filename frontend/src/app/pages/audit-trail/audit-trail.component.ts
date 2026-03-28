import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  table_name: string;
  record_id?: number;
  timestamp: string;
  details?: string;
}

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-container" style="padding: 24px">
      <div class="page-header" style="margin-bottom: 24px">
        <div>
          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 4px">System Audit Trail</h1>
          <p style="color: var(--text-secondary)">Security and activity logs (Admin Only)</p>
        </div>
      </div>

      <div class="glass-card table-container" style="padding: 0; overflow: hidden; border-radius: 16px; border: 1px solid var(--border)">
        <table mat-table [dataSource]="logs" style="width: 100%; border-collapse: collapse">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary)">Time</th>
            <td mat-cell *matCellDef="let log" style="padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px">
              {{ log.timestamp | date:'short' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary)">User ID</th>
            <td mat-cell *matCellDef="let log" style="padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px">
              <span style="background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px">#{{ log.user_id }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary)">Action</th>
            <td mat-cell *matCellDef="let log" style="padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px">
              <span class="action-badge" [class]="log.action">{{ log.action }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="entity">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary)">Entity</th>
            <td mat-cell *matCellDef="let log" style="padding: 16px; border-bottom: 1px solid var(--border); font-size: 14px">
              <span style="opacity: 0.7">{{ log.table_name }}</span> 
              <span style="color: var(--accent); margin-left: 4px">#{{ log.record_id }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef style="padding: 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: var(--text-secondary)">Details</th>
            <td mat-cell *matCellDef="let log" style="padding: 16px; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--text-secondary)">
              {{ log.details }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" style="background: rgba(255,255,255,0.02)"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
        </table>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="logs.length === 0" style="padding: 80px; text-align: center; color: var(--text-secondary)">
          <mat-icon style="font-size: 64px; width: 64px; height: 64px; opacity: 0.1; margin-bottom: 16px">history_edu</mat-icon>
          <p style="font-size: 16px; font-weight: 500">No activity logs found</p>
          <p style="font-size: 13px; opacity: 0.7; margin-top: 4px">System actions will appear here automatically</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table-row:hover { background: rgba(255,255,255,0.03); }
    .action-badge {
      padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;
      &.login { background: rgba(0, 212, 255, 0.1); color: var(--accent); }
      &.create_tender { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
      &.submit_bid { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
      &.update_tender { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }
    }
  `]
})
export class AuditTrailComponent implements OnInit {
  logs: AuditLog[] = [];
  displayedColumns: string[] = ['timestamp', 'user', 'action', 'entity', 'details'];

  constructor(private http: HttpClient, private snack: MatSnackBar) { }

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.http.get<AuditLog[]>(`${environment.apiUrl}/audit/`).subscribe({
      next: (res) => {
        console.log('Logs loaded:', res);
        this.logs = res;
      },
      error: (err) => {
        console.error('Audit load failed', err);
        this.snack.open('Failed to load audit logs. Please check server connection.', 'X', { duration: 5000 });
      }
    });
  }
}
