import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Setting } from '../../models/models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) { }

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.apiUrl + '/');
  }

  getPublicSettings(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/public');
  }

  saveSettings(settings: any[]): Observable<Setting[]> {
    return this.http.put<Setting[]>(this.apiUrl + '/bulk', { settings });
  }
}
