import { NextResponse } from 'next/server'
import type { WorkerSchedule } from '@/types/workers'

// Mock data - will be replaced with database calls
const mockSchedules: WorkerSchedule[] = [
  {
    id: '1',
    workerId: '1',
    date: '2024-02-14',
    startTime: '09:00',
    endTime: '17:00',
    breaks: [
      { startTime: '12:00', endTime: '13:00' }
    ],
    appointments: [
      {
        id: '1',
        customerId: '1',
        customerName: 'Alice Smith',
        service: 'Hair Coloring',
        startTime: '10:00',
        endTime: '11:30',
        status: 'completed',
      },
      {
        id: '2',
        customerId: '2',
        customerName: 'Bob Johnson',
        service: 'Hair Treatment',
        startTime: '14:00',
        endTime: '15:00',
        status: 'scheduled',
      },
    ],
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  // In a real implementation, we would filter by date range
  return NextResponse.json(mockSchedules)
}

export async function POST(request: Request) {
  const data = await request.json()
  const newSchedule: WorkerSchedule = {
    id: Date.now().toString(),
    ...data,
  }
  mockSchedules.push(newSchedule)
  return NextResponse.json(newSchedule)
}

export async function PUT(request: Request) {
  const data = await request.json()
  const index = mockSchedules.findIndex(s => s.id === data.id)
  if (index === -1) {
    return new NextResponse('Schedule not found', { status: 404 })
  }
  mockSchedules[index] = { ...mockSchedules[index], ...data }
  return NextResponse.json(mockSchedules[index])
} 