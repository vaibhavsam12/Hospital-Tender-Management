import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SettingsService } from '../../core/services/settings.service';
import { BillingService, Plan, Subscription } from '../../core/services/billing.service';
import { Setting } from '../../models/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  template: `
    <div class="page-header">
      <h1>System Settings</h1>
      <p>Configure platform branding and system integrations.</p>
    </div>

    <div class="page-body">
      <div class="settings-container">
        <!-- Groups -->
        <div class="settings-group card" *ngFor="let group of groups">
          <div class="group-header">
            <mat-icon>{{ group === 'branding' ? 'brush' : 'email' }}</mat-icon>
            <h2>{{ group | titlecase }} Settings</h2>
          </div>
          
          <div class="settings-list">
            <div class="setting-item" *ngFor="let s of getSettingsByGroup(group)">
              <div class="setting-info">
                <label>{{ s.key.replace('_', ' ') | titlecase }}</label>
                <span class="description">{{ s.description }}</span>
              </div>
              <div class="setting-input">
                <input [type]="s.key.includes('password') ? 'password' : 'text'" 
                       [(ngModel)]="s.value" 
                       [placeholder]="s.key" />
              </div>
            </div>
          </div>
        </div>

        <div class="actions-bar">
          <button class="btn-accent" (click)="save()" [disabled]="saving">
            <mat-icon>{{ saving ? 'sync' : 'save' }}</mat-icon>
            {{ saving ? 'Saving...' : 'Save All Changes' }}
          </button>
        </div>

        <!-- Subscription & Billing Section -->
        <div class="settings-group card billing-card">
           <div class="group-header">
             <mat-icon>payments</mat-icon>
             <h2>Subscription & Billing</h2>
           </div>

           <div class="active-sub-banner" *ngIf="subscription">
             <div class="sub-info">
               <span class="label">Current Plan</span>
               <span class="plan-name">{{ subscription.plan?.name || 'Active' }} Plan</span>
               <span class="expiry" *ngIf="subscription.current_period_end">Ends on {{ subscription.current_period_end | date:'mediumDate' }}</span>
             </div>
             <div class="sub-status" [class.active]="subscription.status === 'active'">
               {{ subscription.status | uppercase }}
             </div>
           </div>

           <div class="plans-grid">
             <div class="plan-card" *ngFor="let p of plans" [class.current]="subscription?.plan_id === p.id">
               <div class="plan-header">
                 <h3>{{ p.name }}</h3>
                 <div class="price">₹{{ p.price | number:'1.0-0' }}<span>/mo</span></div>
               </div>
               <div class="plan-features">
                 <div class="feature" *ngFor="let f of parseFeatures(p.features)">
                   <mat-icon>check_circle</mat-icon>
                   {{ f }}
                 </div>
               </div>
               <button class="plan-btn" [disabled]="subscription?.plan_id === p.id" (click)="upgrade(p)">
                 {{ subscription?.plan_id === p.id ? 'Current Plan' : 'Upgrade' }}
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container { display: flex; flex-direction: column; gap: 24px; max-width: 800px; }
    .settings-group { padding: 24px; }
    .group-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px;
      mat-icon { color: var(--accent); }
      h2 { margin:0; font-size: 18px; font-weight: 600; }
    }
    .settings-list { display: flex; flex-direction: column; gap: 20px; }
    .setting-item { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; align-items: center; }
    @media (max-width: 600px) { .setting-item { grid-template-columns: 1fr; gap: 8px; } }
    
    .setting-info { display: flex; flex-direction: column; gap: 4px;
      label { font-size: 14px; font-weight: 600; color: var(--text-primary); text-transform: capitalize; }
      .description { font-size: 12px; color: var(--text-secondary); }
    }
    .setting-input {
      input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; color: #fff; outline:none; transition: all 0.3s;
        &:focus { border-color: var(--accent); background: rgba(255,255,255,0.08); }
      }
    }
    .btn-accent { padding: 12px 32px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 20px rgba(0,212,255,0.3); }

    .billing-card { margin-top: 40px; border-top: 2px solid var(--accent); }
    .active-sub-banner { 
      background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.1); border-radius: 12px; 
      padding: 16px 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;
      .sub-info { display: flex; flex-direction: column; 
        .label { font-size: 10px; text-transform: uppercase; color: var(--text-secondary); }
        .plan-name { font-size: 18px; font-weight: 700; color: #fff; }
        .expiry { font-size: 12px; color: var(--text-secondary); }
      }
      .sub-status { background: #10b981; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; }
    }
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
    .plan-card { 
      background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 20px; transition: all 0.3s;
      &.current { border-color: var(--accent); background: rgba(0, 212, 255, 0.03); }
      &:hover { transform: translateY(-4px); border-color: var(--accent); }
      .plan-header { h3 { margin: 0; font-size: 16px; color: var(--text-secondary); } .price { font-size: 28px; font-weight: 800; color: #fff; span { font-size: 14px; opacity: 0.5; } } }
      .plan-features { flex: 1; display: flex; flex-direction: column; gap: 10px; .feature { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--accent); } } }
      .plan-btn { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--accent); background: transparent; color: var(--accent); font-weight: 700; cursor: pointer; &:hover { background: var(--accent); color: #000; } &:disabled { opacity: 0.5; cursor: default; } }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings: Setting[] = [];
  groups: string[] = [];
  saving = false;
  plans: Plan[] = [];
  subscription: Subscription | null = null;

  constructor(
    private settingsSvc: SettingsService, 
    private billingSvc: BillingService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadSettings();
    this.loadBilling();
  }

  loadBilling() {
    this.billingSvc.getPlans().subscribe(p => this.plans = p);
    this.billingSvc.getSubscription().subscribe(s => this.subscription = s);
  }

  parseFeatures(f: string): string[] {
    try { return JSON.parse(f); } catch { return []; }
  }

  upgrade(plan: Plan) {
    this.snack.open(`Redirecting to payment for ${plan.name}...`, 'Wait', { duration: 2000 });
    // Simulate transaction
    this.billingSvc.createTransaction(plan.id, plan.price).subscribe({
      next: () => {
        this.snack.open(`${plan.name} upgrade simulated! Redrawing state...`, 'OK', { duration: 3000 });
        this.loadBilling();
      }
    });
  }

  loadSettings() {
    this.settingsSvc.getSettings().subscribe(res => {
      this.settings = res;
      this.groups = Array.from(new Set(res.map(s => s.group)));
    });
  }

  getSettingsByGroup(group: string) {
    return this.settings.filter(s => s.group === group);
  }

  save() {
    this.saving = true;
    const payload = this.settings.map(s => ({ key: s.key, value: s.value }));
    this.settingsSvc.saveSettings(payload).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Settings saved successfully!', 'OK', { duration: 3000 });
      },
      error: () => {
        this.saving = false;
        this.snack.open('Error saving settings', 'X', { duration: 3000 });
      }
    });
  }
}
