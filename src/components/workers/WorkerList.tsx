'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faTrash,
  faSearch,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'
import useWorkerStore from '@/store/workerStore'
import type { Worker, WorkerFilters } from '@/types/workers'

const ListContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

const SearchInput = styled.div`
  flex: 1;
  min-width: 200px;
  position: relative;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-secondary);
  }
`

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const WorkerGrid = styled.div`
  display: grid;
  gap: 1rem;
`

const WorkerCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`

const WorkerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`

const Details = styled.div`
  h3 {
    font-size: 1rem;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
  }

  .role {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
  }

  .specialties {
    display: flex;
    gap: 0.5rem;
  }
`

const Specialty = styled.span`
  padding: 0.25rem 0.5rem;
  background: var(--bg-primary);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
`

const Status = styled.span<{ $status: Worker['status'] }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  background: ${props => {
    switch (props.$status) {
      case 'active':
        return 'var(--success-color)';
      case 'inactive':
        return 'var(--danger-color)';
      case 'on_leave':
        return 'var(--warning-color)';
      default:
        return 'var(--text-secondary)';
    }
  }};
  color: white;
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-primary);
    color: var(--primary-color);
  }

  &.delete:hover {
    color: var(--danger-color);
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`

const WorkerList = () => {
  const { workers, loading, error, fetchWorkers, deleteWorker } = useWorkerStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<WorkerFilters>({})

  useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  const handleFilterChange = (key: keyof WorkerFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }))
  }

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = !filters.role || worker.role === filters.role
    const matchesStatus = !filters.status || worker.status === filters.status
    const matchesSpecialty = !filters.specialty || 
      worker.specialties.includes(filters.specialty)

    return matchesSearch && matchesRole && matchesStatus && matchesSpecialty
  })

  const handleEdit = (workerId: string) => {
    // Will be implemented when we add the edit functionality
    console.log('Edit worker:', workerId)
  }

  const handleDelete = async (workerId: string) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await deleteWorker(workerId)
      } catch (error) {
        console.error('Failed to delete worker:', error)
      }
    }
  }

  if (loading) {
    return <LoadingState>Loading workers...</LoadingState>
  }

  if (error) {
    return <EmptyState>Error: {error}</EmptyState>
  }

  return (
    <ListContainer>
      <FiltersContainer>
        <SearchInput>
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search workers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>

        <FilterSelect
          value={filters.role || 'all'}
          onChange={(e) => handleFilterChange('role', e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="Hair Stylist">Hair Stylist</option>
          <option value="Massage Therapist">Massage Therapist</option>
          <option value="Nail Technician">Nail Technician</option>
        </FilterSelect>

        <FilterSelect
          value={filters.status || 'all'}
          onChange={(e) => handleFilterChange('status', e.target.value as Worker['status'])}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </FilterSelect>
      </FiltersContainer>

      <WorkerGrid>
        {filteredWorkers.length === 0 ? (
          <EmptyState>No workers found</EmptyState>
        ) : (
          filteredWorkers.map(worker => (
            <WorkerCard key={worker.id}>
              <WorkerInfo>
                <Avatar>
                  {worker.name.charAt(0)}
                </Avatar>
                <Details>
                  <h3>{worker.name}</h3>
                  <div className="role">{worker.role}</div>
                  <div className="specialties">
                    {worker.specialties.map((specialty, index) => (
                      <Specialty key={index}>{specialty}</Specialty>
                    ))}
                  </div>
                </Details>
              </WorkerInfo>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Status $status={worker.status}>
                  {worker.status.replace('_', ' ')}
                </Status>
                <Actions>
                  <ActionButton onClick={() => handleEdit(worker.id)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </ActionButton>
                  <ActionButton 
                    className="delete"
                    onClick={() => handleDelete(worker.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </ActionButton>
                </Actions>
              </div>
            </WorkerCard>
          ))
        )}
      </WorkerGrid>
    </ListContainer>
  )
}

export default WorkerList 