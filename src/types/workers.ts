export interface Worker {
  id: string
  name: string
  role: string
  email: string
  phone: string
  specialties: string[]
  status: 'active' | 'inactive' | 'on_leave'
  startDate: string
  imageUrl?: string
}

export interface WorkerSchedule {
  id: string
  workerId: string
  date: string
  startTime: string
  endTime: string
  breaks: Break[]
  appointments: Appointment[]
}

export interface Break {
  startTime: string
  endTime: string
}

export interface Appointment {
  id: string
  customerId: string
  customerName: string
  service: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface WorkerPerformanceMetrics {
  workerId: string
  metrics: {
    clientSatisfaction: number
    appointmentsCompleted: number
    revenueGenerated: number
    attendanceRate: number
    serviceQuality: number
    timeManagement: number
  }
  recentReviews: Review[]
}

export interface Feedback {
  id: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  date: string
}

export interface WorkerFormData extends Omit<Worker, 'id'> {
  password?: string
}

export interface WorkerFilters {
  role?: string
  status?: Worker['status']
  specialty?: string
}

export interface MonthlyStats {
  month: string
  year: number
  appointmentsCompleted: number
  revenue: number
  satisfaction: number
}

export interface Review {
  id: string
  customerId: string
  customerName: string
  rating: number
  comment: string
  date: string
}

export interface Metrics {
  clientSatisfaction: number
  appointmentsCompleted: number
  revenueGenerated: number
  attendanceRate: number
  serviceQuality: number
  timeManagement: number
}

export interface WorkerPerformance {
  workerId: string
  metrics: Metrics
  recentReviews: Review[]
  monthlyStats: MonthlyStats[]
} 