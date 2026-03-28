import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
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
    {
        path: 'settings',
        canActivate: [AuthGuard],
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    },
    { path: '**', redirectTo: 'dashboard' }
];
