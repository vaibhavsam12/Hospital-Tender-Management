import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsSummary, VendorStats } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    constructor(private http: HttpClient) { }

    getSummary(): Observable<AnalyticsSummary> {
        return this.http.get<AnalyticsSummary>('http://127.0.0.1:8000/analytics/summary');
    }

    getVendorStats(): Observable<VendorStats> {
        return this.http.get<VendorStats>('http://127.0.0.1:8000/analytics/vendor');
    }
}
