'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import type { Appointment, Worker, WorkerSchedule } from '@/types/workers'
import useWorkerStore from '@/store/workerStore'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`

const FormContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  position: relative;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: var(--text-primary);
  }
`

const Title = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
`

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

interface AppointmentFormProps {
  onClose: () => void
  date: Date
  appointment?: Appointment & { workerId: string }
}

interface AppointmentFormData {
  workerId: string
  customerId: string
  customerName: string
  service: string
  date: string
  startTime: string
  endTime: string
  status: Appointment['status']
}

const AppointmentForm = ({ onClose, date, appointment }: AppointmentFormProps) => {
  const { workers, loading, error: storeError, addSchedule, updateSchedule } = useWorkerStore()
  const [formData, setFormData] = useState<AppointmentFormData>(
    appointment
      ? {
          workerId: appointment.workerId,
          customerId: appointment.customerId,
          customerName: appointment.customerName,
          service: appointment.service,
          date: date.toISOString().split('T')[0],
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status,
        }
      : {
          workerId: '',
          customerId: '', // This would typically come from a customer selection
          customerName: '',
          service: '',
          date: date.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          status: 'scheduled',
        }
  )
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateTimeSlot = () => {
    const start = new Date(`${formData.date}T${formData.startTime}`)
    const end = new Date(`${formData.date}T${formData.endTime}`)
    
    if (end <= start) {
      return 'End time must be after start time'
    }
    
    // Add more validation as needed (e.g., business hours, overlapping appointments)
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const timeError = validateTimeSlot()
    if (timeError) {
      setError(timeError)
      return
    }

    try {
      const scheduleData: Omit<WorkerSchedule, 'id'> = {
        workerId: formData.workerId,
        date: formData.date,
        startTime: '09:00', // Schedule's working hours start
        endTime: '17:00',   // Schedule's working hours end
        appointments: [{
          id: appointment?.id || Date.now().toString(),
          customerId: formData.customerId,
          customerName: formData.customerName,
          service: formData.service,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status,
        }],
        breaks: [] // You might want to handle breaks separately
      }

      if (appointment) {
        await updateSchedule(appointment.id, scheduleData)
      } else {
        await addSchedule(scheduleData)
      }
      onClose()
    } catch (err) {
      setError('Failed to save appointment')
    }
  }

  return (
    <Overlay onClick={onClose}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        
        <Title>{appointment ? 'Edit Appointment' : 'New Appointment'}</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="workerId">Worker</Label>
            <Select
              id="workerId"
              name="workerId"
              value={formData.workerId}
              onChange={handleChange}
              required
            >
              <option value="">Select a worker</option>
              {workers.map((worker: Worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="service">Service</Label>
            <Input
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </FormGroup>

          {appointment && (
            <FormGroup>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormGroup>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : appointment ? 'Update Appointment' : 'Create Appointment'}
          </Button>
          
          {(error || storeError) && (
            <ErrorMessage>{error || storeError}</ErrorMessage>
          )}
        </Form>
      </FormContainer>
    </Overlay>
  )
}

export default AppointmentForm 