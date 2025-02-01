'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faStar,
  faStarHalf,
  faUsers,
  faCalendarCheck,
  faMoneyBill,
  faChartLine,
  faUserClock,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons'
import useWorkerStore from '@/store/workerStore'
import type { Worker, Review, WorkerPerformanceMetrics } from '@/types/workers'

const PerformanceContainer = styled.div`
  display: grid;
  gap: 1.5rem;
`

const Card = styled.div`
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

const Title = styled.h2`
  font-size: 1.25rem;
  color: var(--text-primary);
`

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`

const MetricCard = styled.div`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
`

const MetricContent = styled.div`
  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }
`

const ReviewsSection = styled.div`
  margin-top: 1.5rem;
`

const ReviewCard = styled.div`
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;

  .customer-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  .date {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`

const Rating = styled.div`
  color: var(--warning-color);
  margin-bottom: 0.5rem;
`

const Comment = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
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

const WorkerPerformance = () => {
  const { workers, performanceMetrics, loading, error, fetchPerformanceMetrics } = useWorkerStore()
  const [selectedWorker, setSelectedWorker] = useState<string>('')

  useEffect(() => {
    if (selectedWorker) {
      fetchPerformanceMetrics(selectedWorker)
    }
  }, [selectedWorker, fetchPerformanceMetrics])

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} />)
    }

    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalf} />)
    }

    const remainingStars = 5 - stars.length
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FontAwesomeIcon
          key={`empty-${i}`}
          icon={faStar}
          style={{ opacity: 0.3 }}
        />
      )
    }

    return stars
  }

  if (loading) {
    return <LoadingState>Loading performance metrics...</LoadingState>
  }

  if (error) {
    return <ErrorState>Error: {error}</ErrorState>
  }

  return (
    <PerformanceContainer>
      <Card>
        <Header>
          <Title>Performance Overview</Title>
          <Select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
          >
            <option value="">Select a worker</option>
            {workers.map((worker: Worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name}
              </option>
            ))}
          </Select>
        </Header>

        {performanceMetrics && (
          <>
            <MetricsGrid>
              <MetricCard>
                <IconWrapper $color="var(--primary-color)">
                  <FontAwesomeIcon icon={faUsers} />
                </IconWrapper>
                <MetricContent>
                  <div className="label">Client Satisfaction</div>
                  <div className="value">{performanceMetrics.metrics.clientSatisfaction.toFixed(1)}</div>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <IconWrapper $color="var(--success-color)">
                  <FontAwesomeIcon icon={faCalendarCheck} />
                </IconWrapper>
                <MetricContent>
                  <div className="label">Appointments</div>
                  <div className="value">{performanceMetrics.metrics.appointmentsCompleted}</div>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <IconWrapper $color="var(--warning-color)">
                  <FontAwesomeIcon icon={faMoneyBill} />
                </IconWrapper>
                <MetricContent>
                  <div className="label">Revenue Generated</div>
                  <div className="value">Ksh {performanceMetrics.metrics.revenueGenerated.toLocaleString()}</div>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <IconWrapper $color="var(--danger-color)">
                  <FontAwesomeIcon icon={faUserClock} />
                </IconWrapper>
                <MetricContent>
                  <div className="label">Attendance Rate</div>
                  <div className="value">{performanceMetrics.metrics.attendanceRate}%</div>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <IconWrapper $color="var(--secondary-color)">
                  <FontAwesomeIcon icon={faThumbsUp} />
                </IconWrapper>
                <MetricContent>
                  <div className="label">Service Quality</div>
                  <div className="value">{performanceMetrics.metrics.serviceQuality.toFixed(1)}</div>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <IconWrapper $color="var(--primary-color)">
                  <FontAwesomeIcon icon={faChartLine} />
                </IconWrapper>
                <MetricContent>
                  <div className="label">Time Management</div>
                  <div className="value">{performanceMetrics.metrics.timeManagement.toFixed(1)}</div>
                </MetricContent>
              </MetricCard>
            </MetricsGrid>

            <ReviewsSection>
              <Title>Recent Reviews</Title>
              {performanceMetrics.recentReviews.map((review: Review) => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <span className="customer-name">{review.customerName}</span>
                    <span className="date">{new Date(review.date).toLocaleDateString()}</span>
                  </ReviewHeader>
                  <Rating>{renderStars(review.rating)}</Rating>
                  <Comment>{review.comment}</Comment>
                </ReviewCard>
              ))}
            </ReviewsSection>
          </>
        )}

        {!performanceMetrics && selectedWorker && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No performance data available for this worker.
          </div>
        )}

        {!selectedWorker && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Select a worker to view their performance metrics.
          </div>
        )}
      </Card>
    </PerformanceContainer>
  )
}

export default WorkerPerformance 