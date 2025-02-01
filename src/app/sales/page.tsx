'use client'

import styled from 'styled-components'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  SalesOverview,
  SalesCharts,
  SalesTable,
  SalesMetrics
} from '@/components/sales'

const SalesContainer = styled.div`
  padding: 2rem;
  display: grid;
  gap: 2rem;
`

const SalesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`

const SalesTableSection = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

export default function SalesPage() {
  return (
    <DashboardLayout>
      <SalesContainer>
        <SalesGrid>
          <SalesOverview />
          <SalesMetrics />
        </SalesGrid>
        <SalesCharts />
        <SalesTableSection>
          <SalesTable />
        </SalesTableSection>
      </SalesContainer>
    </DashboardLayout>
  )
} 