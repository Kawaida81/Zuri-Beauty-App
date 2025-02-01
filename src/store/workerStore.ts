import { create } from 'zustand'
import type {
  Worker,
  WorkerSchedule,
  WorkerPerformanceMetrics,
  WorkerFormData,
} from '@/types/workers'

interface WorkerStore {
  // Worker List State
  workers: Worker[]
  loading: boolean
  error: string | null
  
  // Worker Schedule State
  schedules: WorkerSchedule[]
  selectedDate: Date
  
  // Worker Performance State
  performanceMetrics: WorkerPerformanceMetrics | null
  selectedPeriod: string

  // Actions
  fetchWorkers: () => Promise<void>
  addWorker: (data: WorkerFormData) => Promise<void>
  updateWorker: (id: string, data: WorkerFormData) => Promise<void>
  deleteWorker: (id: string) => Promise<void>
  
  fetchSchedules: (startDate: Date, endDate: Date) => Promise<void>
  addSchedule: (schedule: Omit<WorkerSchedule, 'id'>) => Promise<void>
  updateSchedule: (id: string, schedule: Partial<WorkerSchedule>) => Promise<void>
  
  fetchPerformanceMetrics: (workerId: string) => Promise<void>
  updatePerformanceMetrics: (metrics: WorkerPerformanceMetrics) => Promise<void>
}

const useWorkerStore = create<WorkerStore>((set, get) => ({
  // Initial State
  workers: [],
  loading: false,
  error: null,
  schedules: [],
  selectedDate: new Date(),
  performanceMetrics: null,
  selectedPeriod: 'month',

  // Worker List Actions
  fetchWorkers: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/workers')
      const data = await response.json()
      set({ workers: data })
    } catch (error) {
      set({ error: 'Failed to fetch workers' })
    } finally {
      set({ loading: false })
    }
  },

  addWorker: async (data) => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const newWorker = await response.json()
      set(state => ({
        workers: [...state.workers, newWorker],
      }))
    } catch (error) {
      set({ error: 'Failed to add worker' })
    } finally {
      set({ loading: false })
    }
  },

  updateWorker: async (id, data) => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/workers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updatedWorker = await response.json()
      set(state => ({
        workers: state.workers.map(worker =>
          worker.id === id ? updatedWorker : worker
        ),
      }))
    } catch (error) {
      set({ error: 'Failed to update worker' })
    } finally {
      set({ loading: false })
    }
  },

  deleteWorker: async (id) => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      await fetch(`/api/workers/${id}`, {
        method: 'DELETE',
      })
      set(state => ({
        workers: state.workers.filter(worker => worker.id !== id),
      }))
    } catch (error) {
      set({ error: 'Failed to delete worker' })
    } finally {
      set({ loading: false })
    }
  },

  // Schedule Actions
  fetchSchedules: async (startDate: Date, endDate: Date) => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const response = await fetch(
        `/api/workers/schedules?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      )
      const data = await response.json()
      set({ schedules: data })
    } catch (error) {
      set({ error: 'Failed to fetch schedules' })
    } finally {
      set({ loading: false })
    }
  },

  addSchedule: async (schedule) => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/workers/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      })
      const newSchedule = await response.json()
      set(state => ({
        schedules: [...state.schedules, newSchedule],
      }))
    } catch (error) {
      set({ error: 'Failed to add schedule' })
    } finally {
      set({ loading: false })
    }
  },

  updateSchedule: async (id, schedule) => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/workers/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      })
      const updatedSchedule = await response.json()
      set(state => ({
        schedules: state.schedules.map(s =>
          s.id === id ? updatedSchedule : s
        ),
      }))
    } catch (error) {
      set({ error: 'Failed to update schedule' })
    } finally {
      set({ loading: false })
    }
  },

  // Performance actions
  fetchPerformanceMetrics: async (workerId) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/workers/performance?workerId=${workerId}`)
      if (!response.ok) throw new Error('Failed to fetch performance metrics')
      const metrics = await response.json()
      set({ performanceMetrics: metrics, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      })
      throw error
    }
  },

  updatePerformanceMetrics: async (metrics) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/workers/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      })
      if (!response.ok) throw new Error('Failed to update performance metrics')
      const updatedMetrics = await response.json()
      set({ performanceMetrics: updatedMetrics, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      })
      throw error
    }
  },
}))

export default useWorkerStore 