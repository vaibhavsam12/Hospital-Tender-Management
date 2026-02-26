import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { User, AuthResponse } from '../../models/models';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://127.0.0.1:8000/auth';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        try {
            const savedUser = localStorage.getItem('user');
            if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
                this.currentUserSubject.next(JSON.parse(savedUser));
            }
        } catch (e) {
            console.warn('Corrupted user data found in localStorage. Clearing it.');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(credentials: HttpParams): Observable<User> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).pipe(
            switchMap(res => {
                localStorage.setItem('token', res.access_token);
                return this.fetchMe();
            })
        );
    }

    fetchMe(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`).pipe(
            tap(user => {
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    hasRole(roles: string[]): boolean {
        const user = this.currentUserValue;
        return !!user && roles.includes(user.role);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }
}
