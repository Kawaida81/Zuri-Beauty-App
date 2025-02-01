import { create } from 'zustand'
import type { Worker, WorkerSchedule, WorkerPerformance } from '@/types/workers'

interface WorkerStore {
  workers: Worker[]
  schedules: WorkerSchedule[]
  performanceMetrics: WorkerPerformance | null
  loading: boolean
  error: string | null
  
  // Worker actions
  fetchWorkers: () => Promise<void>
  addWorker: (worker: Omit<Worker, 'id'>) => Promise<void>
  updateWorker: (worker: Worker) => Promise<void>
  deleteWorker: (id: string) => Promise<void>
  
  // Schedule actions
  fetchSchedules: (startDate: string, endDate: string) => Promise<void>
  addSchedule: (schedule: Omit<WorkerSchedule, 'id'>) => Promise<void>
  updateSchedule: (schedule: WorkerSchedule) => Promise<void>
  
  // Performance actions
  fetchPerformanceMetrics: (workerId: string) => Promise<void>
  updatePerformanceMetrics: (metrics: WorkerPerformance) => Promise<void>
}

const useWorkerStore = create<WorkerStore>((set) => ({
  workers: [],
  schedules: [],
  performanceMetrics: null,
  loading: false,
  error: null,

  // Worker actions
  fetchWorkers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/workers')
      if (!response.ok) throw new Error('Failed to fetch workers')
      const workers = await response.json()
      set({ workers, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },

  addWorker: async (worker) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worker),
      })
      if (!response.ok) throw new Error('Failed to add worker')
      const newWorker = await response.json()
      set((state) => ({ workers: [...state.workers, newWorker], loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },

  updateWorker: async (worker) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/workers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worker),
      })
      if (!response.ok) throw new Error('Failed to update worker')
      const updatedWorker = await response.json()
      set((state) => ({
        workers: state.workers.map((w) => (w.id === worker.id ? updatedWorker : w)),
        loading: false,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },

  deleteWorker: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/workers?id=${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete worker')
      set((state) => ({
        workers: state.workers.filter((w) => w.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },

  // Schedule actions
  fetchSchedules: async (startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/workers/schedules?start=${startDate}&end=${endDate}`)
      if (!response.ok) throw new Error('Failed to fetch schedules')
      const schedules = await response.json()
      set({ schedules, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },

  addSchedule: async (schedule) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/workers/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      })
      if (!response.ok) throw new Error('Failed to add schedule')
      const newSchedule = await response.json()
      set((state) => ({ schedules: [...state.schedules, newSchedule], loading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },

  updateSchedule: async (schedule) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('/api/workers/schedules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      })
      if (!response.ok) throw new Error('Failed to update schedule')
      const updatedSchedule = await response.json()
      set((state) => ({
        schedules: state.schedules.map((s) => (s.id === schedule.id ? updatedSchedule : s)),
        loading: false,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
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
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
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
      set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false })
    }
  },
}))

export default useWorkerStore 