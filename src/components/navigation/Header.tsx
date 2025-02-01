'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell,
  faUser,
  faCog,
  faBars,
} from '@fortawesome/free-solid-svg-icons'

const HeaderContainer = styled.header`
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;

  @media (max-width: 768px) {
    display: block;
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
`

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: var(--danger-color);
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 1rem;
  transform: translate(25%, -25%);
`

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .info {
    display: none;
    @media (min-width: 768px) {
      display: block;
    }
  }

  .name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .role {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`

export default function Header() {
  const [notifications] = useState(3)

  return (
    <HeaderContainer>
      <MenuButton>
        <FontAwesomeIcon icon={faBars} />
      </MenuButton>

      <Actions>
        <IconButton>
          <FontAwesomeIcon icon={faBell} />
          {notifications > 0 && (
            <NotificationBadge>{notifications}</NotificationBadge>
          )}
        </IconButton>
        <IconButton>
          <FontAwesomeIcon icon={faCog} />
        </IconButton>
        <Profile>
          <img src="/images/avatar.jpg" alt="Profile" />
          <div className="info">
            <div className="name">John Doe</div>
            <div className="role">Administrator</div>
          </div>
        </Profile>
      </Actions>
    </HeaderContainer>
  )
} 