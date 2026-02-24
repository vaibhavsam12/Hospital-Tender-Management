import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatRippleModule, CommonModule, MatButtonModule],
  template: `
    <div class="app-shell" [class.no-sidebar]="!auth.isLoggedIn()">
      <!-- Sidebar -->
      <aside class="sidebar" *ngIf="auth.isLoggedIn()">
        <div class="sidebar-brand">
          <mat-icon class="brand-icon">local_hospital</mat-icon>
          <span class="brand-text">TenderMed Pro</span>
        </div>
        
        <div class="user-profile" *ngIf="auth.currentUser$ | async as user">
          <div class="avatar">{{ user.full_name?.charAt(0) }}</div>
          <div class="info">
            <span class="name">{{ user.full_name }}</span>
            <span class="role">{{ user.role }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of navItems">
            <a *ngIf="!item.roles || auth.hasRole(item.roles)"
               [routerLink]="item.path"
               routerLinkActive="active"
               matRipple
               class="nav-item">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <button mat-button (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/tenders', icon: 'description', label: 'Tenders' },
    { path: '/my-bids', icon: 'assignment_turned_in', label: 'My Bids', roles: ['vendor'] },
    { path: '/analytics', icon: 'bar_chart', label: 'Analytics', roles: ['admin', 'officer', 'finance'] },
    { path: '/audit', icon: 'history', label: 'Audit Trail', roles: ['admin'] },
  ];

  constructor(public auth: AuthService) { }

  logout() {
    this.auth.logout();
  }
}
