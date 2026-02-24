import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tender } from '../../models/models';


@Injectable({ providedIn: 'root' })
export class TenderService {
    private base = 'http://localhost:8000/tenders';

    constructor(private http: HttpClient) { }

    getTenders(status?: string, hospitalId?: number): Observable<Tender[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (hospitalId) params = params.set('hospital_id', hospitalId);
        return this.http.get<Tender[]>(this.base, { params });
    }

    getTender(id: number): Observable<Tender> {
        return this.http.get<Tender>(`${this.base}/${id}`);
    }

    createTender(tender: Partial<Tender>): Observable<Tender> {
        return this.http.post<Tender>(this.base, tender);
    }

    updateTender(id: number, data: Partial<Tender>): Observable<Tender> {
        return this.http.put<Tender>(`${this.base}/${id}`, data);
    }

    deleteTender(id: number): Observable<any> {
        return this.http.delete(`${this.base}/${id}`);
    }
}
