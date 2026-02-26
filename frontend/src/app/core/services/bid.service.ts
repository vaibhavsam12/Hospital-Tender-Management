import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bid } from '../../models/models';

@Injectable({
    providedIn: 'root'
})
export class BidService {
    private apiUrl = 'http://127.0.0.1:8000/bids/';

    constructor(private http: HttpClient) { }

    getBids(tenderId?: number): Observable<Bid[]> {
        const url = tenderId ? `${this.apiUrl}?tender_id=${tenderId}` : this.apiUrl;
        return this.http.get<Bid[]>(url);
    }

    submitBid(bidData: FormData): Observable<Bid> {
        return this.http.post<Bid>(this.apiUrl, bidData);
    }

    updateBid(id: number, bid: Partial<Bid>): Observable<Bid> {
        return this.http.put<Bid>(`${this.apiUrl}${id}`, bid);
    }
}
