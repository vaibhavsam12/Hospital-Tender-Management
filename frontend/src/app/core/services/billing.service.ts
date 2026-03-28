import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Plan {
  id: number;
  name: string;
  price: number;
  features: string;
  stripe_plan_id?: string;
}

export interface Subscription {
  id: number;
  plan_id: number;
  status: string;
  current_period_end: string;
  plan?: Plan;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private base = `${environment.apiUrl}/billing`;

  constructor(private http: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.base}/plans`);
  }

  getSubscription(): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.base}/subscription`);
  }

  createTransaction(planId: number, amount: number): Observable<any> {
    return this.http.post(`${this.base}/transaction`, { plan_id: planId, amount });
  }
}
