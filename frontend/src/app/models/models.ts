export interface Hospital {
  id: number;
  name: string;
  location: string;
  type: string;
}

export interface Bid {
  id: number;
  tender_id: number;
  vendor_name: string;
  amount: number;
  notes: string;
  submitted_at: string;
  won: boolean;
  quotation_url?: string;
}

export interface Tender {
  id: number;
  hospital_id: number;
  title: string;
  category: string;
  budget: number;
  status: 'open' | 'closed' | 'awarded';
  deadline: string | null;
  created_at: string;
  description: string;
  hospital?: Hospital;
  bids?: Bid[];
  bid_count?: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  total_budget: number;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'officer' | 'finance' | 'vendor' | 'viewer';
  is_active: boolean;
  last_login?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AnalyticsSummary {
  total_tenders: number;
  active_tenders: number;
  awarded_tenders: number;
  closed_tenders: number;
  total_budget: number;
  total_bids: number;
  avg_bids_per_tender: number;
  by_category: CategoryStat[];
}

export interface VendorStats {
  total_bids: number;
  won_bids: number;
  win_rate: number;
  total_bid_value: number;
  active_bids: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Clarification {
  id: number;
  tender_id: number;
  user_id: number;
  asker_name: string;
  question: string;
  answer?: string;
  created_at: string;
  answered_at?: string;
}
