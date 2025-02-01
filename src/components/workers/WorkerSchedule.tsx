'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import type { Worker, WorkerSchedule as IWorkerSchedule, Appointment } from '@/types/workers'
import useWorkerStore from '@/store/workerStore'
import AppointmentForm from './AppointmentForm'

const ScheduleContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const WeekNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const NavButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
  }
`

const CurrentWeek = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: auto repeat(7, 1fr);
  gap: 1px;
  background: var(--border-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
`

const TimeColumn = styled.div`
  background: var(--bg-secondary);
  padding: 0.5rem;
  min-width: 80px;

  .time-slot {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
`

const DayColumn = styled.div`
  background: var(--bg-primary);
`

const DayHeader = styled.div<{ $isToday: boolean }>`
  padding: 0.75rem;
  text-align: center;
  background: ${props => props.$isToday ? 'var(--primary-color)' : 'var(--bg-primary)'};
  color: ${props => props.$isToday ? 'white' : 'var(--text-primary)'};
  font-weight: 500;

  .date {
    font-size: 0.875rem;
    opacity: 0.8;
  }
`

const TimeSlot = styled.div`
  height: 60px;
  border-top: 1px solid var(--border-color);
  position: relative;
`

const AppointmentSlot = styled.div<{ $duration: number; $status: Appointment['status'] }>`
  position: absolute;
  left: 4px;
  right: 4px;
  height: ${props => props.$duration * 60}px;
  background: ${props => {
    switch (props.$status) {
      case 'scheduled':
        return 'var(--primary-color)'
      case 'completed':
        return 'var(--success-color)'
      case 'cancelled':
        return 'var(--danger-color)'
      default:
        return 'var(--bg-secondary)'
    }
  }};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }

  .customer-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .service {
    opacity: 0.9;
  }
`

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--danger-color);
`

const WorkerSchedule = () => {
  const { schedules, loading, error, fetchSchedules } = useWorkerStore()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<(Appointment & { workerId: string }) | undefined>()

  const weekStart = startOfWeek(selectedDate)
  const weekEnd = endOfWeek(selectedDate)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    fetchSchedules(weekStart, weekEnd)
  }, [weekStart, weekEnd, fetchSchedules])

  const handlePrevWeek = () => {
    setSelectedDate(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setSelectedDate(prev => addDays(prev, 7))
  }

  const getAppointmentsForDay = (date: Date) => {
    const schedule = schedules.find(s => 
      isSameDay(new Date(s.date), date)
    )
    return schedule?.appointments.map(appointment => ({
      ...appointment,
      workerId: schedule.workerId
    })) || []
  }

  const calculateAppointmentPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    return (hours - 8) * 60 + minutes
  }

  const calculateAppointmentDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)
    return (endHours - startHours) + (endMinutes - startMinutes) / 60
  }

  const handleAppointmentClick = (appointment: Appointment, workerId: string) => {
    setSelectedAppointment({ ...appointment, workerId })
    setShowAppointmentForm(true)
  }

  const handleCloseForm = () => {
    setShowAppointmentForm(false)
    setSelectedAppointment(undefined)
  }

  if (loading) {
    return <LoadingState>Loading schedules...</LoadingState>
  }

  if (error) {
    return <ErrorState>Error: {error}</ErrorState>
  }

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 8 PM

  return (
    <ScheduleContainer>
      <Header>
        <WeekNavigation>
          <NavButton onClick={handlePrevWeek}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </NavButton>
          <CurrentWeek>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </CurrentWeek>
          <NavButton onClick={handleNextWeek}>
            <FontAwesomeIcon icon={faChevronRight} />
          </NavButton>
        </WeekNavigation>
        <AddButton onClick={() => setShowAppointmentForm(true)}>
          <FontAwesomeIcon icon={faPlus} />
          Add Appointment
        </AddButton>
      </Header>

      <ScheduleGrid>
        <TimeColumn>
          <DayHeader $isToday={false}>
            <div className="day-name">Time</div>
          </DayHeader>
          {timeSlots.map(hour => (
            <div key={hour} className="time-slot">
              {format(new Date().setHours(hour, 0), 'h:mm a')}
            </div>
          ))}
        </TimeColumn>

        {weekDays.map((date, index) => {
          const appointments = getAppointmentsForDay(date)
          const isToday = isSameDay(date, new Date())

          return (
            <DayColumn key={index}>
              <DayHeader $isToday={isToday}>
                <div className="day-name">{format(date, 'EEEE')}</div>
                <div className="date">{format(date, 'MMM d')}</div>
              </DayHeader>
              {timeSlots.map(hour => (
                <TimeSlot key={hour}>
                  {appointments.map(appointment => {
                    const appointmentStart = calculateAppointmentPosition(appointment.startTime)
                    const duration = calculateAppointmentDuration(
                      appointment.startTime,
                      appointment.endTime
                    )
                    const currentSlotStart = (hour - 8) * 60
                    const currentSlotEnd = currentSlotStart + 60

                    if (
                      appointmentStart >= currentSlotStart &&
                      appointmentStart < currentSlotEnd
                    ) {
                      return (
                        <AppointmentSlot
                          key={appointment.id}
                          style={{ top: `${appointmentStart - currentSlotStart}px` }}
                          $duration={duration}
                          $status={appointment.status}
                          onClick={() => handleAppointmentClick(appointment, appointment.workerId)}
                        >
                          <div className="customer-name">{appointment.customerName}</div>
                          <div className="service">{appointment.service}</div>
                        </AppointmentSlot>
                      )
                    }
                    return null
                  })}
                </TimeSlot>
              ))}
            </DayColumn>
          )
        })}
      </ScheduleGrid>

      {showAppointmentForm && (
        <AppointmentForm
          onClose={handleCloseForm}
          date={selectedDate}
          appointment={selectedAppointment}
        />
      )}
    </ScheduleContainer>
  )
}

export default WorkerSchedule 