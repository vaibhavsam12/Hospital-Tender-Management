import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsSummary } from '../../models/models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    constructor(private http: HttpClient) { }

    getSummary(): Observable<AnalyticsSummary> {
        return this.http.get<AnalyticsSummary>('http://localhost:8000/analytics/summary');
    }
}
