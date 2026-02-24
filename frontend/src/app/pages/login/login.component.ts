import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule],
    template: `
    <div class="login-container">
      <div class="glass-card login-card">
        <div class="login-header">
          <div class="logo-circle">
            <mat-icon>security</mat-icon>
          </div>
          <h1>TenderMed Pro</h1>
          <p>Procurement Management System</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <mat-form-field appearance="outline" color="accent">
            <mat-label>Email Address</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" required email placeholder="admin@hospital.com">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" color="accent">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" name="password" [(ngModel)]="password" required>
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>

          <div class="error-msg" *ngIf="error">{{error}}</div>

          <button mat-flat-button color="accent" class="login-btn" [disabled]="loginForm.invalid || loading">
            <span *ngIf="!loading">Login to Dashboard</span>
            <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have an account? <a>Contact Admin</a></p>
        </div>
      </div>
    </div>
  `,
    styles: [`
  /* CONTAINER */
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0c0c1a 0%, #1a0033 50%, #0f0f23 100%);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
      animation: float 20s ease-in-out infinite;
      pointer-events: none;
    }
  }

  /* GLASS CARD - FIXED */
  .glass-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.125);
    border-radius: 24px;
    box-shadow: 
      0 25px 45px rgba(0,0,0,0.3),
      0 0 0 1px rgba(255,255,255,0.05),
      inset 0 1px 0 rgba(255,255,255,0.2);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.1));
      border-radius: 24px;
    }
  }

  /* HEADER */
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
    
    .logo-circle {
      width: 72px;
      height: 72px;
      background: rgba(0, 212, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
      
      mat-icon {
        color: #00d4ff;
        font-size: 36px;
        width: 36px;
        height: 36px;
      }
    }
    
    h1 {
      margin: 0 0 0.5rem;
      font-weight: 800;
      color: #fff;
      font-size: 28px;
      background: linear-gradient(135deg, #fff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    p {
      margin: 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      font-weight: 400;
    }
  }

  /* FORM */
  form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* FIELDS - OVERRIDE MATERIAL */
  mat-form-field {
    ::ng-deep {
      .mdc-text-field--filled {
        border-radius: 16px !important;
        background: rgba(255, 255, 255, 0.06) !important;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        
        &.mdc-text-field--focused {
          border-color: rgba(0, 212, 255, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }
      }
      
      .mdc-floating-label {
        color: rgba(255, 255, 255, 0.8) !important;
      }
      
      .mdc-text-field__input {
        color: #fff !important;
        caret-color: #00d4ff !important;
      }
      
      .mdc-line-ripple {
        background: #00d4ff !important;
      }
    }
  }

  /* BUTTON */
  .login-btn {
    height: 52px !important;
    border-radius: 16px !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    margin-top: 1rem !important;
    background: linear-gradient(135deg, #00d4ff, #0099cc) !important;
    border: none !important;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(0, 212, 255, 0.4);
    }
    
    ::ng-deep {
      .mat-mdc-button-touch-target {
        height: 52px !important;
      }
    }
  }

  /* ERROR */
  .error-msg {
    color: #ff6b6b;
    font-size: 13px;
    text-align: center;
    padding: 0.5rem;
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.3);
    border-radius: 12px;
    backdrop-filter: blur(10px);
  }

  /* FOOTER */
  .login-footer {
    margin-top: 2rem;
    text-align: center;
    
    p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      margin: 0;
    }
    
    a {
      color: #00d4ff;
      text-decoration: none;
      font-weight: 600;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  /* ANIMATIONS */
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-30px) rotate(120deg); }
    66% { transform: translateY(-15px) rotate(240deg); }
  }
`]

})
export class LoginComponent {
    email = '';
    password = '';
    loading = false;
    error = '';
    hidePassword = true;

    constructor(private auth: AuthService, private router: Router) { }

    onSubmit() {
        this.loading = true;
        this.error = '';

        const formData = new FormData();
        formData.append('username', this.email);
        formData.append('password', this.password);

        this.auth.login(formData).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.error = 'Invalid email or password';
                console.error(err);
            }
        });
    }
}
