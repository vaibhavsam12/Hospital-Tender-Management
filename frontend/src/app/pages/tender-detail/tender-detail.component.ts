import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TenderService } from '../../core/services/tender.service';
import { BidService } from '../../core/services/bid.service';
import { ClarificationService } from '../../core/services/clarification.service';
import { AuthService } from '../../core/services/auth.service';
import { Tender, Bid, Clarification } from '../../models/models';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-tender-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <div style="display:flex; justify-content:space-between; align-items:flex-end; width:100%">
        <div>
          <a routerLink="/tenders" class="back-link"><mat-icon>arrow_back</mat-icon> All Tenders</a>
          <h1 *ngIf="tender">{{ tender.title }}</h1>
          <p *ngIf="tender">{{ tender.hospital?.name }} · {{ tender.category }}</p>
        </div>
        <button class="export-btn" (click)="exportPDF()" *ngIf="tender && bids.length > 0">
          <mat-icon>picture_as_pdf</mat-icon>
          Export Report
        </button>
      </div>
    </div>
    <div class="page-body" *ngIf="tender">

      <!-- Tender Info -->
      <div class="detail-grid">
        <div class="card detail-card">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Status </span>
              <span class="status-chip" [ngClass]="tender.status"> {{ tender.status | titlecase }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Budget</span>
              <span class="info-value big"> ₹{{ formatLakh(tender.budget) }} Lakhs</span>
            </div>
            <div class="info-item">
              <span class="info-label">Deadline</span>
              <span class="info-value"> {{ tender.deadline ? (tender.deadline | date:'dd MMM yyyy') : 'N/A' }}</span>
            </div>
          </div>
          <div class="description-section" *ngIf="tender.description">
            <div class="info-label" style="margin-bottom:8px">Description</div>
            <p class="description-text"> {{ tender.description }}</p>
          </div>
        </div>

        <!-- Bid Submission Form (Only for Vendors) -->
        <div class="card bid-form-card" *ngIf="tender.status === 'open' && auth.hasRole(['vendor'])">
          <div class="section-title">Submit a Bid</div>
          <div class="form-group">
            <label>Bid Amount (₹)</label>
            <input type="number" [(ngModel)]="newBid.amount" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea [(ngModel)]="newBid.notes" rows="3" placeholder="Warranty, delivery etc."></textarea>
          </div>
          <div class="form-group">
            <label>Quotation PDF (Optional)</label>
            <input type="file" (change)="onFileSelected($event)" accept=".pdf,.doc,.docx" />
          </div>
          <button class="btn-accent" style="width:100%" (click)="submitBid()" [disabled]="submitting">
            <mat-icon style="font-size:16px;vertical-align:middle;margin-right:4px">gavel</mat-icon>
            {{ submitting ? 'Submitting...' : 'Submit Bid' }}
          </button>
        </div>

        <div class="card bid-form-card closed-banner" *ngIf="tender.status !== 'open'">
          <mat-icon style="font-size:48px;color:var(--text-secondary);margin-bottom:8px">lock</mat-icon>
          <p>This tender is <strong>{{ tender.status }}</strong>.</p>
        </div>
      </div>

      <!-- Comparison Engine Actions -->
      <div class="comparison-actions" *ngIf="bids.length > 1 && auth.hasRole(['admin', 'officer', 'finance'])">
        <button class="compare-btn" [class.active]="compareMode" (click)="compareMode = !compareMode">
          <mat-icon>{{ compareMode ? 'grid_view' : 'compare' }}</mat-icon>
          {{ compareMode ? 'Exit Comparison' : 'Compare Bids (L1 Detection)' }}
        </button>
      </div>

      <!-- Bids Table -->
      <div class="section-title">
        {{ compareMode ? 'Bid Comparison Engine (L1 Highlighted)' : 'Bid Submissions (' + bids.length + ')' }}
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <table style="width:100%;border-collapse:collapse" id="bids-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>vs Budget</th>
              <th *ngIf="!compareMode">Quotation</th>
              <th>Status</th>
              <th *ngIf="!compareMode">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of bids; let i = index" 
                [class.winner-row]="b.won"
                [class.l1-row]="compareMode && isL1(b)">
              <td>{{ i + 1 }}</td>
              <td class="vendor-name">
                {{ b.vendor_name }}
                <span *ngIf="compareMode && isL1(b)" class="l1-badge">L1</span>
              </td>
              <td class="amount-cell">₹{{ formatLakh(b.amount) }}L</td>
              <td>
                <span class="diff-chip" [class.lower]="b.amount < tender.budget" [class.higher]="b.amount >= tender.budget">
                  {{ b.amount < tender.budget ? '▼' : '▲' }}
                  {{ ((b.amount - tender.budget) / tender.budget * 100 | number:'1.1-1') }}%
                </span>
              </td>
              <td *ngIf="!compareMode">
                <a *ngIf="b.quotation_url" [href]="'http://127.0.0.1:8000' + b.quotation_url" target="_blank" style="color:var(--accent)">
                  <mat-icon style="font-size:18px">file_download</mat-icon>
                </a>
              </td>
              <td>
                <span *ngIf="b.won" class="winner-badge"><mat-icon style="font-size:14px">emoji_events</mat-icon> Winner</span>
                <span *ngIf="!b.won" class="pending-badge">Pending</span>
              </td>
              <td *ngIf="!compareMode">
                <button *ngIf="!b.won && auth.hasRole(['admin', 'officer']) && tender.status !== 'awarded'" 
                        class="mark-winner-btn" 
                        (click)="markWinner(b)"
                        [disabled]="awardingId === b.id">
                  {{ awardingId === b.id ? 'Working...' : 'Mark Won' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Q&A Section -->
      <div class="card qa-card" style="margin-top: 24px;">
        <div class="section-title">Clarifications & Q&A</div>
        
        <div class="qa-list">
          <div class="qa-item" *ngFor="let q of clarifications">
            <div class="question-row">
              <span class="asker">{{ q.asker_name }} asked:</span>
              <span class="q-text">{{ q.question }}</span>
              <span class="q-date">{{ q.created_at | date:'short' }}</span>
            </div>
            <div class="answer-row" *ngIf="q.answer">
              <mat-icon>reply</mat-icon>
              <div class="a-content">
                <span class="a-text">{{ q.answer }}</span>
                <span class="a-date">Answered on {{ q.answered_at | date:'short' }}</span>
              </div>
            </div>
            <div class="answer-row pending" *ngIf="!q.answer && auth.hasRole(['admin', 'officer'])">
              <mat-icon>reply</mat-icon>
              <div class="a-form">
                <textarea [(ngModel)]="replyText[q.id]" placeholder="Provide a clarification..."></textarea>
                <button class="btn-small" (click)="submitAnswer(q.id)">Respond</button>
              </div>
            </div>
            <div class="answer-row pending" *ngIf="!q.answer && !auth.hasRole(['admin', 'officer'])">
              <mat-icon style="opacity:0.3">reply</mat-icon>
              <span class="pending-text">Awaiting official response...</span>
            </div>
          </div>
          
          <div class="empty-qa" *ngIf="clarifications.length === 0">
            <mat-icon style="opacity:0.2; font-size:40px; width:40px; height:40px; margin-bottom:12px">question_answer</mat-icon>
            <p>No clarifications requested yet.</p>
          </div>
        </div>

        <div class="ask-section" *ngIf="auth.hasRole(['vendor']) && tender.status === 'open'">
          <hr style="margin: 24px 0; border: none; border-top: 1px solid rgba(255,255,255,0.05);">
          <div class="info-label" style="margin-bottom: 12px;">Ask a Question</div>
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <textarea style="flex: 1; min-height:80px" [(ngModel)]="newQuestion" placeholder="Need clarity on technical specs or delivery?"></textarea>
            <button class="btn-accent" style="padding: 12px 24px" (click)="askQuestion()" [disabled]="!newQuestion">Post Question</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .back-link { display: inline-flex; align-items: center; gap: 4px; color: var(--text-secondary); text-decoration: none; font-size: 14px; margin-bottom: 8px; &:hover { color: var(--accent); } }
    .export-btn { background: rgba(0, 212, 255, 0.1); color: var(--accent); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; transition: all 0.3s; &:hover { background: var(--accent); color: #000; } }
    .detail-grid { display: grid; grid-template-columns: 1fr 340px; gap: 16px; margin-bottom: 24px; }
    .info-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
    .info-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
    .info-value { font-size: 15px; font-weight: 500; color: var(--text-primary); }
    .info-value.big { font-size: 22px; font-weight: 700; color: #10b981; }
    .description-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
    .bid-form-card { display: flex; flex-direction: column; gap: 14px; p { text-align: center; } }
    .form-group { display: flex; flex-direction: column; gap: 6px; label { font-size: 11px; font-weight: 600; color: var(--text-secondary); } input, textarea { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; color: var(--text-primary); outline: none; &:focus { border-color: var(--accent); } } }
    table { width: 100%; border-collapse: collapse; thead th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text-secondary); border-bottom: 1px solid var(--border); } tbody td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); } }
    .amount-cell { font-weight: 700; color: #10b981; }
    .diff-chip { padding: 2px 8px; border-radius: 4px; font-size: 12px; &.lower { background: rgba(16,185,129,0.12); color: #10b981; } &.higher { background: rgba(239,68,68,0.12); color: #ef4444; } }
    .winner-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(0,212,255,0.12); color: var(--accent); border-radius: 20px; padding: 4px 10px; font-size: 12px; }
    .pending-badge { color: var(--text-secondary); font-size: 12px; opacity: 0.7; }
    .l1-row { background: rgba(16, 185, 129, 0.08) !important; }
    .l1-badge { background: #10b981; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 8px; vertical-align: middle; }
    .comparison-actions { margin-bottom: 24px;
      .compare-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-primary); padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;
        &:hover { background: rgba(255,255,255,0.1); border-color: var(--accent); }
        &.active { background: var(--accent); color: #000; font-weight: 600; }
      }
    }
    .mark-winner-btn { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); padding: 4px 10px; border-radius: 6px; cursor: pointer; &:hover { border-color: var(--accent); color: var(--accent); } }

    .qa-card {
      .qa-list { display: flex; flex-direction: column; gap: 20px; }
      .qa-item {
        background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px;
        .question-row { display: flex; flex-direction: column; gap: 8px;
          .asker { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; }
          .q-text { font-size: 15px; color: #fff; line-height: 1.5; }
          .q-date { font-size: 10px; color: #4f5b71; }
        }
        .answer-row { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px;
          mat-icon { color: var(--accent); transform: rotate(180deg); }
          .a-content { flex:1;
            .a-text { font-size: 14px; color: #cbd5e1; line-height: 1.5; }
            .a-date { display: block; margin-top: 6px; font-size: 10px; color: #4f5b71; }
          }
          .pending-text { font-size: 13px; color: #4f5b71; font-style: italic; }
          .a-form { flex: 1; display: flex; flex-direction: column; gap: 10px;
            textarea { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: #fff; width: 100%; min-height: 60px; outline: none; &:focus { border-color: var(--accent); } }
            .btn-small { background: var(--accent); color: #000; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; width: fit-content; align-self: flex-end; }
          }
        }
      }
      .empty-qa { padding: 40px; text-align: center; color: #4f5b71; display: flex; flex-direction: column; align-items: center; }
    }
  `]
})
export class TenderDetailComponent implements OnInit {
  tender: Tender | null = null;
  bids: Bid[] = [];
  clarifications: Clarification[] = [];
  newQuestion = '';
  replyText: { [key: number]: string } = {};
  newBid = { amount: 0, notes: '' };
  selectedFile: File | null = null;
  submitting = false;
  compareMode = false;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private tenderSvc: TenderService,
    private bidSvc: BidService,
    private clarifSvc: ClarificationService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tenderSvc.getTender(id).subscribe(t => {
      this.tender = t;
      this.bids = t.bids ?? [];
    });
    this.loadClarifications(id);
  }

  loadClarifications(id: number) {
    this.clarifSvc.getClarifications(id).subscribe(c => this.clarifications = c);
  }

  askQuestion() {
    if (!this.tender || !this.newQuestion) return;
    this.clarifSvc.askQuestion(this.tender.id, this.newQuestion).subscribe(q => {
      this.clarifications = [q, ...this.clarifications];
      this.newQuestion = '';
      this.snack.open('Question posted!', 'OK', { duration: 3000 });
    });
  }

  submitAnswer(clarificationId: number) {
    const answer = this.replyText[clarificationId];
    if (!answer) return;
    this.clarifSvc.answerQuestion(clarificationId, answer).subscribe(updated => {
      this.clarifications = this.clarifications.map(c => c.id === clarificationId ? updated : c);
      delete this.replyText[clarificationId];
      this.snack.open('Clarification sent!', 'OK', { duration: 3000 });
    });
  }

  isL1(bid: Bid): boolean {
    if (!this.bids.length) return false;
    const minAmount = Math.min(...this.bids.map(b => b.amount));
    return bid.amount === minAmount;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submitBid() {
    if (!this.tender || !this.newBid.amount) {
      this.snack.open('Amount is required', 'OK', { duration: 3000 });
      return;
    }

    this.submitting = true;
    const formData = new FormData();
    formData.append('tender_id', this.tender.id.toString());
    formData.append('vendor_name', this.auth.currentUserValue?.full_name || 'Generic Vendor');
    formData.append('amount', this.newBid.amount.toString());
    formData.append('notes', this.newBid.notes);
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.bidSvc.submitBid(formData).subscribe({
      next: (b) => {
        this.bids = [...this.bids, b];
        this.newBid = { amount: 0, notes: '' };
        this.selectedFile = null;
        this.submitting = false;
        this.snack.open('Bid submitted!', '✓', { duration: 3000 });
      },
      error: () => {
        this.submitting = false;
        this.snack.open('Submission failed', 'X', { duration: 3000 });
      }
    });
  }

  awardingId: number | null = null;

  markWinner(bid: Bid) {
    this.awardingId = bid.id;
    this.bidSvc.updateBid(bid.id, { won: true }).subscribe({
      next: () => {
        this.bids = this.bids.map(b => ({ ...b, won: b.id === bid.id }));
        if (this.tender) {
          this.tenderSvc.updateTender(this.tender.id, { status: 'awarded' }).subscribe(t => {
            this.tender = t;
            this.awardingId = null;
          });
        } else {
          this.awardingId = null;
        }
      },
      error: () => this.awardingId = null
    });
  }

  exportPDF() {
    if (!this.tender) return;

    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(22); doc.setTextColor(0, 172, 193);
      doc.text('Tender Comparison Report', 14, 22);

      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      // Tender Details
      doc.setFontSize(14); doc.setTextColor(0);
      doc.text('Tender Information', 14, 45);
      doc.setFontSize(10);
      doc.text(`Title: ${this.tender.title}`, 14, 52);
      doc.text(`Hospital: ${this.tender.hospital?.name || 'N/A'}`, 14, 57);
      doc.text(`Budget: INR ${this.formatLakh(this.tender.budget)} Lakhs`, 14, 62);
      doc.text(`Status: ${this.tender.status?.toUpperCase()}`, 14, 67);

      // Bids Table
      const tableData = this.bids.map((b, i) => [
        i + 1,
        b.vendor_name,
        `INR ${b.amount.toLocaleString()}`,
        this.isL1(b) ? 'YES (L1)' : 'No',
        b.won ? 'Winner' : 'Pending'
      ]);

      autoTable(doc, {
        startY: 75,
        head: [['#', 'Vendor', 'Quote Amount', 'is L1?', 'Status']],
        body: tableData,
        headStyles: { fillColor: [0, 172, 193] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`Tender_Report_${this.tender.id}.pdf`);
    } catch (err) {
      console.error('PDF Export failed', err);
      this.snack.open('Failed to generate PDF. Check console.', 'X', { duration: 5000 });
    }
  }

  formatLakh(v: number) { return (v / 100000).toFixed(2); }
}
