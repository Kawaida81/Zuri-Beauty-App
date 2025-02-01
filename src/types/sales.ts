export interface Sale {
  id: string;
  date: string;
  customer: string;
  items: string;
  amount: number;
  payment: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface SalesMetric {
  label: string;
  value: string;
  trend: {
    direction: 'up' | 'down';
    value: string;
  };
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date: string;
}

export type SortField = keyof Sale;
export type SortDirection = 'asc' | 'desc' | null;
export type AriaSort = 'none' | 'ascending' | 'descending' | undefined;

export interface TimeRangeOption {
  value: string;
  label: string;
}

export interface ThProps {
  sortable?: boolean;
  onClick?: () => void;
  role?: string;
  'aria-sort'?: AriaSort;
  children: React.ReactNode;
} 