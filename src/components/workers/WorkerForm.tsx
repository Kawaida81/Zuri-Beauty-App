'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import type { Worker, WorkerFormData } from '@/types/workers'
import useWorkerStore from '@/store/workerStore'

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
  padding: 2rem;
`

const FormContainer = styled.div`
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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
  gap: 1.5rem;
`

const FormSection = styled.div`
  display: grid;
  gap: 1rem;
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const SpecialtiesList = styled.div`
  display: grid;
  gap: 0.5rem;
`

const SpecialtyItem = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  input {
    flex: 1;
  }
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &.add {
    background: var(--primary-color);
    color: white;

    &:hover {
      opacity: 0.9;
    }
  }

  &.remove {
    background: var(--danger-color);
    color: white;

    &:hover {
      opacity: 0.9;
    }
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

interface WorkerFormProps {
  onClose: () => void
  worker?: Worker
}

const WorkerForm = ({ onClose, worker }: WorkerFormProps) => {
  const { addWorker, updateWorker, loading, error: storeError } = useWorkerStore()
  const [formData, setFormData] = useState<WorkerFormData>(
    worker || {
      name: '',
      role: '',
      email: '',
      phone: '',
      specialties: [''],
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    }
  )
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSpecialtyChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((specialty, i) =>
        i === index ? value : specialty
      ),
    }))
  }

  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, ''],
    }))
  }

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (worker) {
        await updateWorker(worker.id, formData)
      } else {
        await addWorker(formData)
      }
      onClose()
    } catch (err) {
      setError('Failed to save worker data')
    }
  }

  return (
    <Overlay onClick={onClose}>
      <FormContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close form">
          <FontAwesomeIcon icon={faTimes} />
        </CloseButton>
        
        <Title>{worker ? 'Edit Worker' : 'Add New Worker'}</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Hair Stylist">Hair Stylist</option>
                  <option value="Massage Therapist">Massage Therapist</option>
                  <option value="Nail Technician">Nail Technician</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>Specialties</SectionTitle>
            <SpecialtiesList>
              {formData.specialties.map((specialty, index) => (
                <SpecialtyItem key={index}>
                  <Input
                    value={specialty}
                    onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                    placeholder="Enter specialty"
                    required
                  />
                  {formData.specialties.length > 1 && (
                    <IconButton
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="remove"
                      aria-label="Remove specialty"
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </IconButton>
                  )}
                </SpecialtyItem>
              ))}
              <IconButton
                type="button"
                onClick={addSpecialty}
                className="add"
                aria-label="Add specialty"
              >
                <FontAwesomeIcon icon={faPlus} />
              </IconButton>
            </SpecialtiesList>
          </FormSection>

          <FormSection>
            <SectionTitle>Additional Information</SectionTitle>
            <FormRow>
              <FormGroup>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : worker ? 'Update Worker' : 'Add Worker'}
          </Button>
          {(error || storeError) && (
            <ErrorMessage>{error || storeError}</ErrorMessage>
          )}
        </Form>
      </FormContainer>
    </Overlay>
  )
}

export default WorkerForm 