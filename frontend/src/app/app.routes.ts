import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    },
    {
        path: 'tenders',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/tenders/tenders.component').then(m => m.TendersComponent),
    },
    {
        path: 'tenders/:id',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/tender-detail/tender-detail.component').then(m => m.TenderDetailComponent),
    },
    {
        path: 'analytics',
        canActivate: [AuthGuard],
        data: { roles: ['admin', 'officer', 'finance'] },
        loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
    },
    {
        path: 'my-bids',
        canActivate: [AuthGuard],
        data: { roles: ['vendor'] },
        loadComponent: () => import('./pages/my-bids/my-bids.component').then(m => m.MyBidsComponent),
    },
    {
        path: 'audit',
        canActivate: [AuthGuard],
        data: { roles: ['admin'] },
        loadComponent: () => import('./pages/audit-trail/audit-trail.component').then(m => m.AuditTrailComponent),
    },
    { path: '**', redirectTo: 'dashboard' }
];
