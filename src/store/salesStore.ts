import { create } from 'zustand'
import { Sale, ChartDataPoint } from '@/types/sales'

interface SalesState {
  sales: Sale[]
  isLoading: boolean
  error: string | null
  chartData: ChartDataPoint[]
  setSales: (sales: Sale[]) => void
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'status'>) => Promise<void>
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>
  deleteSale: (id: string) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setChartData: (data: ChartDataPoint[]) => void
  fetchSales: () => Promise<void>
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,
  chartData: [],

  setSales: (sales) => set({ sales }),
  
  addSale: async (saleData) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create sale')
      }

      const newSale = await response.json()
      set((state) => ({
        sales: [...state.sales, newSale],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create sale',
        isLoading: false,
      })
      throw error
    }
  },

  updateSale: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update sale')
      }

      const updatedSale = await response.json()
      set((state) => ({
        sales: state.sales.map((sale) =>
          sale.id === id ? updatedSale : sale
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update sale',
        isLoading: false,
      })
      throw error
    }
  },

  deleteSale: async (id) => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete sale')
      }

      set((state) => ({
        sales: state.sales.filter((sale) => sale.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete sale',
        isLoading: false,
      })
      throw error
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setChartData: (data) => set({ chartData: data }),

  fetchSales: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/sales')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch sales')
      }

      const data = await response.json()
      set({ sales: data, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sales',
        isLoading: false,
      })
      throw error
    }
  },
})) 