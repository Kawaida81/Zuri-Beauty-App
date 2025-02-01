'use client'

import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSort, 
  faSortUp, 
  faSortDown,
  faEllipsisV,
  faFileExport,
  faPlus,
  faPencilAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import type { Sale, SortField, SortDirection, AriaSort, ThProps } from '@/types/sales'
import { useSalesStore } from '@/store/salesStore'
import SalesForm from './SalesForm'

const TableContainer = styled.div`
  overflow-x: auto;
`

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`

const Title = styled.h2`
  font-size: 1.25rem;
  color: var(--text-primary);
`

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    opacity: 0.9;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`

const Th = styled.th<Pick<ThProps, 'sortable'>>`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};

  &:hover {
    background: ${props => props.sortable ? 'var(--bg-secondary)' : 'transparent'};
  }
`

const Td = styled.td`
  padding: 1rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;
`

const StatusBadge = styled.span<{ status: 'completed' | 'pending' | 'cancelled' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'completed':
        return `
          background: var(--success-color);
          color: white;
        `
      case 'pending':
        return `
          background: var(--warning-color);
          color: white;
        `
      case 'cancelled':
        return `
          background: var(--danger-color);
          color: white;
        `
    }
  }}
`

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;

  &:hover {
    color: var(--text-primary);
  }
`

interface TableProps {
  isLoading?: boolean;
  error?: string | null;
}

const TableWrapper = styled.div<TableProps>`
  opacity: ${props => props.isLoading ? 0.7 : 1};
  pointer-events: ${props => props.isLoading ? 'none' : 'auto'};
`

const ErrorMessage = styled.div`
  color: var(--danger-color);
  padding: 1rem;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 1rem 0;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`

const getAriaSortValue = (field: SortField, currentSortField: SortField | null, direction: SortDirection): AriaSort => {
  if (field !== currentSortField) return 'none'
  if (direction === 'asc') return 'ascending'
  if (direction === 'desc') return 'descending'
  return undefined
}

const ActionMenu = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 150px;
  overflow: hidden;
`

const ActionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--bg-secondary);
  }

  &.delete {
    color: var(--danger-color);
  }
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

const ActionWrapper = styled.div`
  position: relative;
`

export default function SalesTable() {
  const { sales, isLoading, error, fetchSales, deleteSale } = useSalesStore()
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc'
        if (prev === 'desc') return null
        return 'asc'
      })
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return faSort
    if (sortDirection === 'asc') return faSortUp
    if (sortDirection === 'desc') return faSortDown
    return faSort
  }

  const sortedSales = useMemo(() => {
    if (!sortField || !sortDirection) return sales;
    
    return [...sales].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [sales, sortField, sortDirection]);

  const handleExport = async () => {
    try {
      const csvContent = sortedSales
        .map(sale => 
          Object.values(sale).join(',')
        )
        .join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sales_export.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export sales data:', err)
    }
  }

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale)
    setShowForm(true)
    setOpenMenuId(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(id)
      } catch (err) {
        // Error is handled by the store
      }
    }
    setOpenMenuId(null)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedSale(null)
  }

  if (error) {
    return <ErrorMessage role="alert">{error}</ErrorMessage>
  }

  return (
    <TableWrapper isLoading={isLoading}>
      <TableHeader>
        <Title>Recent Sales</Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <AddButton onClick={() => setShowForm(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Add Sale
          </AddButton>
          <ExportButton 
            onClick={handleExport}
            disabled={isLoading}
            aria-label="Export sales data"
          >
            <FontAwesomeIcon icon={faFileExport} />
            Export
          </ExportButton>
        </div>
      </TableHeader>
      <TableContainer>
        <Table role="table" aria-label="Sales Records">
          <thead>
            <tr>
              <Th 
                sortable 
                onClick={() => handleSort('date')} 
                role="columnheader" 
                aria-sort={getAriaSortValue('date', sortField, sortDirection)}
              >
                Date
                <FontAwesomeIcon icon={getSortIcon('date')} aria-hidden="true" />
              </Th>
              <Th 
                sortable 
                onClick={() => handleSort('customer')} 
                role="columnheader" 
                aria-sort={getAriaSortValue('customer', sortField, sortDirection)}
              >
                Customer
                <FontAwesomeIcon icon={getSortIcon('customer')} aria-hidden="true" />
              </Th>
              <Th role="columnheader">Items</Th>
              <Th 
                sortable 
                onClick={() => handleSort('amount')} 
                role="columnheader" 
                aria-sort={getAriaSortValue('amount', sortField, sortDirection)}
              >
                Amount
                <FontAwesomeIcon icon={getSortIcon('amount')} aria-hidden="true" />
              </Th>
              <Th role="columnheader">Payment</Th>
              <Th 
                sortable 
                onClick={() => handleSort('status')} 
                role="columnheader" 
                aria-sort={getAriaSortValue('status', sortField, sortDirection)}
              >
                Status
                <FontAwesomeIcon icon={getSortIcon('status')} aria-hidden="true" />
              </Th>
              <Th role="columnheader">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.length === 0 ? (
              <tr>
                <Td colSpan={7}>
                  <EmptyState>No sales records found</EmptyState>
                </Td>
              </tr>
            ) : (
              sortedSales.map((sale) => (
                <tr key={sale.id} role="row">
                  <Td role="cell">{sale.date}</Td>
                  <Td role="cell">{sale.customer}</Td>
                  <Td role="cell">{sale.items}</Td>
                  <Td role="cell">Ksh {sale.amount.toLocaleString()}</Td>
                  <Td role="cell">{sale.payment}</Td>
                  <Td role="cell">
                    <StatusBadge status={sale.status}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </StatusBadge>
                  </Td>
                  <Td role="cell">
                    <ActionWrapper>
                      <ActionButton 
                        onClick={() => setOpenMenuId(openMenuId === sale.id ? null : sale.id)}
                        aria-label={`More actions for sale ${sale.id}`}
                        aria-expanded={openMenuId === sale.id}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} aria-hidden="true" />
                      </ActionButton>
                      {openMenuId === sale.id && (
                        <ActionMenu>
                          <ActionMenuItem onClick={() => handleEdit(sale)}>
                            <FontAwesomeIcon icon={faPencilAlt} />
                            Edit
                          </ActionMenuItem>
                          <ActionMenuItem 
                            onClick={() => handleDelete(sale.id)}
                            className="delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete
                          </ActionMenuItem>
                        </ActionMenu>
                      )}
                    </ActionWrapper>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
      {isLoading && (
        <LoadingOverlay>
          <span>Loading...</span>
        </LoadingOverlay>
      )}
      {showForm && (
        <SalesForm 
          onClose={handleCloseForm}
          editSale={selectedSale || undefined}
        />
      )}
    </TableWrapper>
  )
} 