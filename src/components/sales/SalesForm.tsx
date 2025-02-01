'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useSalesStore } from '@/store/salesStore'
import type { Sale } from '@/types/sales'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const FormContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  position: relative;
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: var(--text-primary);
  }
`

const Title = styled.h2`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
`

const Form = styled.form`
  display: grid;
  gap: 1rem;
`

const FormGroup = styled.div`
  display: grid;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  color: var(--text-secondary);
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

interface SalesFormProps {
  onClose: () => void
  editSale?: Sale
}

export default function SalesForm({ onClose, editSale }: SalesFormProps) {
  const { addSale, updateSale, isLoading, error } = useSalesStore()
  const [formData, setFormData] = useState<Partial<Sale>>(
    editSale || {
      customer: '',
      items: '',
      amount: 0,
      payment: 'M-Pesa',
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editSale) {
        await updateSale(editSale.id, formData)
      } else {
        await addSale(formData as Omit<Sale, 'id' | 'date' | 'status'>)
      }
      onClose()
    } catch (err) {
      // Error is handled by the store
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }))
  }

  return (
    <Overlay onClick={onClose}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close form">
          <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        <Title>{editSale ? 'Edit Sale' : 'New Sale'}</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="items">Items</Label>
            <Input
              id="items"
              name="items"
              value={formData.items}
              onChange={handleChange}
              placeholder="Separate items with commas"
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="amount">Amount (Ksh)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="payment">Payment Method</Label>
            <Select
              id="payment"
              name="payment"
              value={formData.payment}
              onChange={handleChange}
              required
            >
              <option value="M-Pesa">M-Pesa</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </Select>
          </FormGroup>
          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : editSale ? 'Update Sale' : 'Add Sale'}
          </Button>
        </Form>
      </FormContainer>
    </Overlay>
  )
} 