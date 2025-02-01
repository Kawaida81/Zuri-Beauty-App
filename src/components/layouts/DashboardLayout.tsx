'use client'

import { ReactNode } from 'react'
import styled from 'styled-components'
import Sidebar from '@/components/navigation/Sidebar'
import Header from '@/components/navigation/Header'

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`

const MainContent = styled.div`
  flex: 1;
  margin-left: 240px; // Width of sidebar
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Header />
        {children}
      </MainContent>
    </LayoutContainer>
  )
} 