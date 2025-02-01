import { NextResponse } from 'next/server'
import type { WorkerPerformance } from '@/types/workers'

// Mock data - will be replaced with database calls
const mockPerformanceMetrics: WorkerPerformance[] = [
  {
    workerId: '1',
    metrics: {
      clientSatisfaction: 4.8,
      appointmentsCompleted: 156,
      revenueGenerated: 12500,
      attendanceRate: 98,
      serviceQuality: 4.7,
      timeManagement: 4.6,
    },
    recentReviews: [
      {
        id: '1',
        customerId: '1',
        customerName: 'Alice Smith',
        rating: 5,
        comment: 'Excellent service, very professional!',
        date: '2024-02-14',
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Bob Johnson',
        rating: 4,
        comment: 'Great work, but slightly delayed.',
        date: '2024-02-13',
      },
    ],
    monthlyStats: [
      {
        month: 'January',
        year: 2024,
        appointmentsCompleted: 52,
        revenue: 4200,
        satisfaction: 4.7,
      },
      {
        month: 'February',
        year: 2024,
        appointmentsCompleted: 48,
        revenue: 3800,
        satisfaction: 4.8,
      },
    ],
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('workerId')

  if (!workerId) {
    return new NextResponse('Worker ID is required', { status: 400 })
  }

  const performance = mockPerformanceMetrics.find(p => p.workerId === workerId)
  if (!performance) {
    return new NextResponse('Performance metrics not found', { status: 404 })
  }

  return NextResponse.json(performance)
}

export async function POST(request: Request) {
  const data = await request.json()
  const { workerId } = data

  if (!workerId) {
    return new NextResponse('Worker ID is required', { status: 400 })
  }

  const existingIndex = mockPerformanceMetrics.findIndex(p => p.workerId === workerId)
  if (existingIndex !== -1) {
    mockPerformanceMetrics[existingIndex] = {
      ...mockPerformanceMetrics[existingIndex],
      ...data,
    }
    return NextResponse.json(mockPerformanceMetrics[existingIndex])
  }

  const newPerformance = {
    workerId,
    ...data,
  }
  mockPerformanceMetrics.push(newPerformance)
  return NextResponse.json(newPerformance)
} 