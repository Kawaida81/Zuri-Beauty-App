import { NextResponse } from 'next/server'
import type { Sale } from '@/types/sales'

// Mock data for now - will be replaced with database calls
const mockSales: Sale[] = [
  {
    id: '1',
    date: '2024-02-01',
    customer: 'Jane Doe',
    items: 'Hair Treatment, Shampoo',
    amount: 4500,
    payment: 'M-Pesa',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-02-01',
    customer: 'John Smith',
    items: 'Facial Service, Manicure Service',
    amount: 3200,
    payment: 'Cash',
    status: 'pending',
  },
  {
    id: '3',
    date: '2024-02-02',
    customer: 'Alice Johnson',
    items: 'Hair Color, Hair Products',
    amount: 6800,
    payment: 'M-Pesa',
    status: 'completed',
  },
  {
    id: '4',
    date: '2024-02-02',
    customer: 'Bob Wilson',
    items: 'Massage Service, Facial Service',
    amount: 5500,
    payment: 'Card',
    status: 'completed',
  },
  {
    id: '5',
    date: '2024-02-03',
    customer: 'Carol Brown',
    items: 'Nail Care Service, Nail Products',
    amount: 2800,
    payment: 'M-Pesa',
    status: 'cancelled',
  },
]

export async function GET() {
  try {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return NextResponse.json(mockSales)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const sale: Sale = await request.json()
    
    // Validate required fields
    if (!sale.customer || !sale.items || !sale.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Add new sale (in real app, this would be a database operation)
    const newSale: Sale = {
      ...sale,
      id: (mockSales.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    }
    mockSales.push(newSale)

    return NextResponse.json(newSale, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates }: Partial<Sale> & { id: string } = await request.json()
    
    // Find and update sale (in real app, this would be a database operation)
    const saleIndex = mockSales.findIndex(sale => sale.id === id)
    if (saleIndex === -1) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }

    mockSales[saleIndex] = { ...mockSales[saleIndex], ...updates }
    return NextResponse.json(mockSales[saleIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update sale' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()
    
    // Find and delete sale (in real app, this would be a database operation)
    const saleIndex = mockSales.findIndex(sale => sale.id === id)
    if (saleIndex === -1) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }

    mockSales.splice(saleIndex, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    )
  }
} 