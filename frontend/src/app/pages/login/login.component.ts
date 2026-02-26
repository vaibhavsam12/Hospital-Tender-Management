import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="login-page">
      <div class="background-decor">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
      </div>

      <div class="login-card glass-card">
        <div class="login-header">
          <div class="brand-logo">
            <mat-icon>security</mat-icon>
          </div>
          <h1>TenderMed Pro</h1>
          <p>Enterprise Procurement Dashboard</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="login-form" novalidate>
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <mat-icon class="prefix-icon">mail</mat-icon>
              <input 
                type="email" 
                name="email" 
                [(ngModel)]="email" 
                required 
                placeholder="admin@hospital.com"
                autocomplete="username"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <mat-icon class="prefix-icon">lock</mat-icon>
              <input 
                [type]="hidePassword ? 'password' : 'text'" 
                name="password" 
                [(ngModel)]="password" 
                required
                placeholder="••••••••"
                autocomplete="current-password"
              >
              <button type="button" class="suffix-btn" (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </div>
          </div>

          <div class="error-msg" *ngIf="error">
            <mat-icon>error_outline</mat-icon>
            {{error}}
          </div>

          <button type="button" class="submit-btn" [disabled]="loading" (click)="onSubmit()">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading" class="loader-content">
              Authenticating...
            </span>
            <div class="btn-glow"></div>
          </button>
        </form>

        <div class="login-footer">
          <p>Don't have access? <a href="mailto:admin@tendermed.pro">Contact Administrator</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #060a12;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    .background-decor {
      position: absolute;
      inset: 0;
      z-index: 1;
      .circle {
        position: absolute;
        border-radius: 50%;
        filter: blur(100px);
      }
      .c1 { width: 500px; height: 500px; background: rgba(0, 212, 255, 0.1); top: -100px; right: -100px; }
      .c2 { width: 400px; height: 400px; background: rgba(124, 58, 237, 0.08); bottom: -100px; left: -100px; }
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 48px;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(14, 21, 40, 0.7);
      backdrop-filter: blur(30px) saturate(180%);
      box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4);
      z-index: 10;
      position: relative;
    }

    .login-header {
      text-align: center;
      margin-bottom: 40px;
      .brand-logo {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(124, 58, 237, 0.2));
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        border: 1px solid rgba(0, 212, 255, 0.3);
        mat-icon { color: #00d4ff; font-size: 28px; width: 28px; height: 28px; }
      }
      h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 6px; letter-spacing: -0.5px; }
      p { color: #8b9cb8; font-size: 14px; }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      label {
        font-size: 11px;
        font-weight: 700;
        color: #8b9cb8;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding-left: 4px;
      }
    }

    .input-wrapper {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      height: 48px; /* Explicit height to prevent collapsing */

      &:focus-within {
        background: rgba(255, 255, 255, 0.05);
        border-color: #00d4ff;
        box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.1);
      }

      .prefix-icon {
        margin-left: 16px;
        margin-right: 12px;
        color: #8b9cb8;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      input {
        background: transparent;
        border: none;
        outline: none;
        color: #f0f4ff;
        padding: 14px 16px 14px 0;
        width: 100%;
        font-size: 15px;
        flex: 1;
        line-height: normal;
        height: 100%;

        &::placeholder { color: rgba(139, 156, 184, 0.4); }

        /* Robust Autofill fix */
        &:-webkit-autofill,
        &:-webkit-autofill:hover, 
        &:-webkit-autofill:focus {
          -webkit-text-fill-color: #f0f4ff !important;
          -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      }

      .suffix-btn {
        background: none;
        border: none;
        padding: 0 16px;
        cursor: pointer;
        color: #8b9cb8;
        &:hover { color: #00d4ff; }
        mat-icon { font-size: 20px; width: 20px; height: 20px; }
      }
    }

    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #ff8080;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .submit-btn {
      margin-top: 12px;
      height: 52px;
      background: linear-gradient(135deg, #00d4ff, #7c3aed);
      border: none;
      border-radius: 14px;
      color: #fff;
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s;

      &:disabled { opacity: 0.6; cursor: not-allowed; }
      &:not(:disabled):hover { transform: translateY(-1px); }
      &:not(:disabled):active { transform: translateY(0); }

      .loader-content { display: flex; align-items: center; justify-content: center; gap: 8px; }
    }

    .login-footer {
      margin-top: 40px;
      text-align: center;
      p { color: #8b9cb8; font-size: 14px; }
      a { color: #00d4ff; text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
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
    console.log('Login attempt:', this.email);
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    const body = new HttpParams()
      .set('username', this.email)
      .set('password', this.password);

    this.auth.login(body).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 0) {
          this.error = 'Cannot connect to backend. Is the server running on port 8000?';
        } else if (err.status === 401) {
          this.error = 'Invalid email or password.';
        } else {
          this.error = `Server Error (${err.status}): ${err.message || 'Unknown error'}`;
        }
        console.error('Login Error:', err);
      }
    });
  }
}
