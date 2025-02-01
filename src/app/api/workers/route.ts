import { NextResponse } from 'next/server'
import type { Worker } from '@/types/workers'

// Mock data - will be replaced with database calls
const mockWorkers: Worker[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Hair Stylist',
    email: 'sarah.j@zuribeauty.com',
    phone: '+254 712 345 678',
    specialties: ['Hair Coloring', 'Hair Treatment', 'Styling'],
    status: 'active',
    startDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Massage Therapist',
    email: 'michael.c@zuribeauty.com',
    phone: '+254 723 456 789',
    specialties: ['Deep Tissue', 'Swedish Massage', 'Aromatherapy'],
    status: 'on_leave',
    startDate: '2023-03-20',
  },
  {
    id: '3',
    name: 'Emily Brown',
    role: 'Nail Technician',
    email: 'emily.b@zuribeauty.com',
    phone: '+254 734 567 890',
    specialties: ['Manicure', 'Pedicure', 'Nail Art'],
    status: 'active',
    startDate: '2023-02-10',
  },
]

export async function GET() {
  return NextResponse.json(mockWorkers)
}

export async function POST(request: Request) {
  const data = await request.json()
  const newWorker: Worker = {
    id: Date.now().toString(),
    ...data,
  }
  mockWorkers.push(newWorker)
  return NextResponse.json(newWorker)
}

export async function PUT(request: Request) {
  const data = await request.json()
  const index = mockWorkers.findIndex(w => w.id === data.id)
  if (index === -1) {
    return new NextResponse('Worker not found', { status: 404 })
  }
  mockWorkers[index] = { ...mockWorkers[index], ...data }
  return NextResponse.json(mockWorkers[index])
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return new NextResponse('Worker ID is required', { status: 400 })
  }
  const index = mockWorkers.findIndex(w => w.id === id)
  if (index === -1) {
    return new NextResponse('Worker not found', { status: 404 })
  }
  mockWorkers.splice(index, 1)
  return new NextResponse(null, { status: 204 })
} 