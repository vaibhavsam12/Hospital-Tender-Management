import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsSummary, VendorStats } from '../../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    constructor(private http: HttpClient) { }

    getSummary(): Observable<AnalyticsSummary> {
        return this.http.get<AnalyticsSummary>(`${environment.apiUrl}/analytics/summary`);
    }

    getVendorStats(): Observable<VendorStats> {
        return this.http.get<VendorStats>(`${environment.apiUrl}/analytics/vendor`);
    }
}
