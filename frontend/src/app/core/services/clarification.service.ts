import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Clarification } from '../../models/models';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ClarificationService {
    private apiUrl = `${environment.apiUrl}/clarifications`;

    constructor(private http: HttpClient) { }

    getClarifications(tenderId: number): Observable<Clarification[]> {
        return this.http.get<Clarification[]>(`${this.apiUrl}/${tenderId}`);
    }

    askQuestion(tenderId: number, question: string): Observable<Clarification> {
        return this.http.post<Clarification>(`${this.apiUrl}/`, { tender_id: tenderId, question });
    }

    answerQuestion(clarificationId: number, answer: string): Observable<Clarification> {
        return this.http.put<Clarification>(`${this.apiUrl}/${clarificationId}/answer`, { answer });
    }
}
