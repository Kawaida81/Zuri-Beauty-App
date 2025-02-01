'use client'

import styled from 'styled-components'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import WorkerDashboard from '@/components/workers/WorkerDashboard'

const WorkersContainer = styled.div`
  padding: 2rem;
`

export default function WorkersPage() {
  return (
    <DashboardLayout>
      <WorkersContainer>
        <WorkerDashboard />
      </WorkersContainer>
    </DashboardLayout>
  )
} 