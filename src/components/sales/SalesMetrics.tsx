'use client'

import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShoppingBag,
  faUsers,
  faChartPie,
  faPercent,
} from '@fortawesome/free-solid-svg-icons'

const MetricsContainer = styled.div`
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`

const MetricCard = styled.div`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const IconWrapper = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.color};
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

  .change {
    font-size: 0.875rem;
    color: var(--success-color);
    margin-top: 0.25rem;
  }
`

const metrics = [
  {
    icon: faShoppingBag,
    label: 'Total Orders',
    value: '231',
    change: '+12.5%',
    color: 'var(--primary-color)',
  },
  {
    icon: faUsers,
    label: 'New Customers',
    value: '45',
    change: '+8.1%',
    color: 'var(--success-color)',
  },
  {
    icon: faChartPie,
    label: 'Sales Revenue',
    value: 'Ksh 48,500',
    change: '+15.2%',
    color: 'var(--warning-color)',
  },
  {
    icon: faPercent,
    label: 'Conversion Rate',
    value: '3.2%',
    change: '+2.4%',
    color: 'var(--danger-color)',
  },
]

export default function SalesMetrics() {
  return (
    <MetricsContainer>
      <Title>Key Metrics</Title>
      <MetricsGrid>
        {metrics.map((metric, index) => (
          <MetricCard key={index}>
            <IconWrapper color={metric.color}>
              <FontAwesomeIcon icon={metric.icon} />
            </IconWrapper>
            <MetricContent>
              <div className="label">{metric.label}</div>
              <div className="value">{metric.value}</div>
              <div className="change">{metric.change}</div>
            </MetricContent>
          </MetricCard>
        ))}
      </MetricsGrid>
    </MetricsContainer>
  )
} 