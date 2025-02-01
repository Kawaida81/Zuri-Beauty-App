'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faCalendarAlt,
  faChartLine,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { WorkerList, WorkerSchedule, WorkerPerformance, WorkerForm } from '.'

const DashboardContainer = styled.div`
  padding: 2rem;
  display: grid;
  gap: 2rem;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.5rem;
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

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
`

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--primary-color);
  }
`

type TabType = 'list' | 'schedule' | 'performance'

export default function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [showForm, setShowForm] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return <WorkerList />
      case 'schedule':
        return <WorkerSchedule />
      case 'performance':
        return <WorkerPerformance />
      default:
        return null
    }
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>Worker Management</Title>
        <AddButton onClick={() => setShowForm(true)}>
          <FontAwesomeIcon icon={faUserPlus} />
          Add Worker
        </AddButton>
      </Header>

      <TabContainer>
        <Tab
          $active={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
        >
          <FontAwesomeIcon icon={faUsers} />
          Workers
        </Tab>
        <Tab
          $active={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
        >
          <FontAwesomeIcon icon={faCalendarAlt} />
          Schedule
        </Tab>
        <Tab
          $active={activeTab === 'performance'}
          onClick={() => setActiveTab('performance')}
        >
          <FontAwesomeIcon icon={faChartLine} />
          Performance
        </Tab>
      </TabContainer>

      {renderContent()}

      {showForm && (
        <WorkerForm onClose={() => setShowForm(false)} />
      )}
    </DashboardContainer>
  )
} 