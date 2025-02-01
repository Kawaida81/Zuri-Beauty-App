'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faBox,
  faChartLine,
  faCalendarAlt,
  faBoxes,
  faSignOutAlt,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 0;
  width: 240px;
  height: 100vh;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    transform: translateX(-100%);
    &.open {
      transform: translateX(0);
    }
  }
`

const Logo = styled.div`
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  
  h1 {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin: 0;
  }
`

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  background: ${props => props.$active ? 'var(--bg-secondary)' : 'transparent'};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
  }

  svg {
    width: 20px;
    margin-right: 1rem;
  }
`

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 1rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--primary-color);
  }

  svg {
    width: 20px;
    margin-right: 1rem;
  }
`

const navItems = [
  { path: '/dashboard', icon: faHome, label: 'Dashboard' },
  { path: '/products', icon: faBox, label: 'Products' },
  { path: '/sales', icon: faChartLine, label: 'Sales' },
  { path: '/bookings', icon: faCalendarAlt, label: 'Bookings' },
  { path: '/stock', icon: faBoxes, label: 'Stock' },
  { path: '/workers', icon: faUsers, label: 'Workers' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    // Implement logout logic
  }

  return (
    <SidebarContainer className={isOpen ? 'open' : ''}>
      <Logo>
        <h1>Zuri Beauty</h1>
      </Logo>
      <nav>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            href={item.path}
            $active={pathname === item.path}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </NavItem>
        ))}
        <LogoutButton onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </LogoutButton>
      </nav>
    </SidebarContainer>
  )
} 