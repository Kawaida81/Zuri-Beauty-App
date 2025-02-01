'use client'

import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

const OverviewCard = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const Title = styled.h2`
  font-size: 1.25rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
`

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`

const Metric = styled.div`
  .label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
  }
`

const TrendIndicator = styled.div<{ trend: 'up' | 'down' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ trend }) => trend === 'up' ? 'var(--success-color)' : 'var(--danger-color)'};

  svg {
    width: 12px;
  }
`

interface SalesMetric {
  label: string;
  value: string;
  trend: {
    direction: 'up' | 'down';
    value: string;
  };
}

const metrics: SalesMetric[] = [
  {
    label: 'Total Sales',
    value: 'Ksh 45,231',
    trend: {
      direction: 'up',
      value: '12%'
    }
  },
  {
    label: 'Average Order',
    value: 'Ksh 1,250',
    trend: {
      direction: 'up',
      value: '8%'
    }
  },
  {
    label: 'Products Sold',
    value: '142',
    trend: {
      direction: 'down',
      value: '5%'
    }
  },
  {
    label: 'Services Booked',
    value: '89',
    trend: {
      direction: 'up',
      value: '15%'
    }
  }
]

export default function SalesOverview() {
  return (
    <OverviewCard>
      <Title>Sales Overview</Title>
      <MetricGrid>
        {metrics.map((metric, index) => (
          <Metric key={index}>
            <div className="label">{metric.label}</div>
            <div className="value">{metric.value}</div>
            <TrendIndicator trend={metric.trend.direction}>
              <FontAwesomeIcon 
                icon={metric.trend.direction === 'up' ? faArrowUp : faArrowDown} 
              />
              <span>{metric.trend.value}</span>
            </TrendIndicator>
          </Metric>
        ))}
      </MetricGrid>
    </OverviewCard>
  )
} 