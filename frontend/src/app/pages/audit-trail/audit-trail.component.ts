import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
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
    imports: [CommonModule, MatTableModule, MatIconModule],
    template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>System Audit Trail</h1>
          <p>Security and activity logs (Admin Only)</p>
        </div>
      </div>

      <div class="glass-card table-container">
        <table mat-table [dataSource]="logs">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Time</th>
            <td mat-cell *matCellDef="let log">{{ log.timestamp | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>User ID</th>
            <td mat-cell *matCellDef="let log">#{{ log.user_id }}</td>
          </ng-container>

          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let log">
              <span class="action-badge" [class]="log.action">{{ log.action }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="entity">
            <th mat-header-cell *matHeaderCellDef>Entity</th>
            <td mat-cell *matCellDef="let log">{{ log.table_name }} #{{ log.record_id }}</td>
          </ng-container>

          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>Details</th>
            <td mat-cell *matCellDef="let log" class="details-cell">{{ log.details }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .action-badge {
      padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase;
      &.login { background: rgba(0, 212, 255, 0.1); color: var(--accent); }
      &.create_tender { background: rgba(76, 175, 80, 0.1); color: #4caf50; }
      &.submit_bid { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
    }
    .details-cell { font-size: 13px; color: var(--text-secondary); max-width: 300px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
  `]
})
export class AuditTrailComponent implements OnInit {
    logs: AuditLog[] = [];
    displayedColumns: string[] = ['timestamp', 'user', 'action', 'entity', 'details'];

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get<AuditLog[]>('http://localhost:8000/audit/').subscribe(res => {
            this.logs = res;
        });
    }
}
