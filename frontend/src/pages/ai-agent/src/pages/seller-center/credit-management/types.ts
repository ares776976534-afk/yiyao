export interface CreditData {
  total: number;
  used: number;
  using: number;
  remaining: number;
}

export interface ApiRecord {
  requestId: string;
  apiService: string;
  category: string;
  requestTime: string;
  creditCost: number;
  deductionTime: string;
}

export interface FilterState {
  apiName: string;
  requestId: string;
  dateRange: [string, string] | null;
}

export interface FilterProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
}