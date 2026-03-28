import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../models/models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = `${environment.apiUrl}/notifications`;

    constructor(private http: HttpClient) { }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}/`);
    }

    markAsRead(id: number): Observable<Notification> {
        return this.http.post<Notification>(`${this.apiUrl}/${id}/read`, {});
    }
}
