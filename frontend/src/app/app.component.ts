import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { filter, Subscription, interval, startWith, switchMap } from 'rxjs';
import { Notification } from './models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatRippleModule, CommonModule,
    MatButtonModule, MatBadgeModule
  ],
  template: `
    <div class="app-shell" [class.no-sidebar]="!auth.isLoggedIn()">
      <!-- Sidebar -->
      <aside class="sidebar" *ngIf="auth.isLoggedIn()">
        <div class="sidebar-brand">
          <mat-icon class="brand-icon">local_hospital</mat-icon>
          <span class="brand-text">HealthTender Pro</span>
        </div>
        
        <div class="user-profile" *ngIf="auth.currentUser$ | async as user">
          <div class="avatar">{{ user.full_name?.charAt(0) }}</div>
          <div class="info">
            <div class="name">{{ user.full_name }}</div>
            <div class="org-name" *ngIf="user.organization">{{ user.organization.display_name }}</div>
            <div class="role-badge">{{ user.role }}</div>
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
        <!-- Top Nav -->
        <header class="top-nav" *ngIf="auth.isLoggedIn()">
          <h2 class="page-title">{{ currentRouteTitle }}</h2>
          
          <div class="nav-actions">
            <button class="notif-btn" (click)="toggleNotifs($event)">
              <mat-icon [matBadge]="unreadCount" matBadgeColor="warn" [matBadgeHidden]="unreadCount === 0">notifications</mat-icon>
            </button>

            <!-- Notification Dropdown -->
            <div class="notif-dropdown glass-card" *ngIf="showNotifs" (click)="$event.stopPropagation()">
              <div class="dropdown-header">
                <span>Recent Notifications</span>
                <span class="unread-pill" *ngIf="unreadCount > 0">{{ unreadCount }} New</span>
              </div>
              <div class="notif-list">
                <div *ngFor="let n of notifications" 
                     class="notif-item" 
                     [class.unread]="!n.is_read"
                     (click)="handleNotifClick(n)">
                  <div class="notif-icon">
                    <mat-icon>{{ n.title.includes('Awarded') ? 'emoji_events' : 'info' }}</mat-icon>
                  </div>
                  <div class="notif-content">
                    <div class="title">{{ n.title }}</div>
                    <div class="message">{{ n.message }}</div>
                    <div class="time">{{ n.created_at | date:'shortTime' }}</div>
                  </div>
                </div>
                <div class="empty-notifs" *ngIf="notifications.length === 0">
                  <mat-icon>notifications_off</mat-icon>
                  <p>All caught up!</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="content-wrapper" (click)="showNotifs = false">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/tenders', icon: 'description', label: 'Tenders' },
    { path: '/my-bids', icon: 'assignment_turned_in', label: 'My Bids', roles: ['vendor'] },
    { path: '/analytics', icon: 'bar_chart', label: 'Analytics', roles: ['admin', 'officer', 'finance'] },
    { path: '/audit', icon: 'history', label: 'Audit Trail', roles: ['admin'] },
    { path: '/settings', icon: 'settings', label: 'Settings', roles: ['admin'] },
  ];

  currentRouteTitle = 'Dashboard';
  showNotifs = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  private notifSub?: Subscription;

  constructor(
    public auth: AuthService,
    private notifSvc: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
      this.showNotifs = false;
    });

    // Start notification polling
    this.notifSub = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.auth.isLoggedIn() ? this.notifSvc.getNotifications() : [])
    ).subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.is_read).length;
    });
  }

  ngOnDestroy() {
    this.notifSub?.unsubscribe();
  }

  private updateTitle() {
    const active = this.navItems.find(i => this.router.url.includes(i.path));
    this.currentRouteTitle = active ? active.label : 'Details';
  }

  toggleNotifs(event: Event) {
    event.stopPropagation();
    this.showNotifs = !this.showNotifs;
  }

  handleNotifClick(n: Notification) {
    if (!n.is_read) {
      this.notifSvc.markAsRead(n.id).subscribe(() => {
        n.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      });
    }
    if (n.link) {
      this.router.navigateByUrl(n.link);
      this.showNotifs = false;
    }
  }

  logout() {
    this.auth.logout();
  }
}
