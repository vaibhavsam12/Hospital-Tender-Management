import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, AuthResponse } from '../../models/models';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8000/auth';
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(credentials: FormData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(res => {
                localStorage.setItem('token', res.access_token);
                this.fetchMe().subscribe();
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
