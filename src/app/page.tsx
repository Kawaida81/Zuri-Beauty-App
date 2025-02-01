'use client'

import { useEffect } from 'react'
import styled from 'styled-components'
import DashboardLayout from '@/components/layouts/DashboardLayout'

const MainContainer = styled.main`
  padding: 2rem;
  width: 100%;
  min-height: 100vh;
  background: var(--bg-secondary);
`

export default function DashboardPage() {
  useEffect(() => {
    // Check authentication status
    // Initialize any required data
  }, [])

  return (
    <DashboardLayout>
      <MainContainer>
        {/* Dashboard content will be added here */}
      </MainContainer>
    </DashboardLayout>
  )
} 