import { fireEvent, render, screen } from '@testing-library/react'

import { MemberRow } from './MemberRow'
import type { MemberRowProps } from './MemberRow.types'

const baseMember = {
  professionalId: 'p1',
  name: 'João Silva',
  profession: 'Pedreiro',
  phone: '11999999999',
  avatarUrl: null,
  avatarInitials: 'JS',
  hourlyRate: 50,
  isLeader: false,
  status: 'accepted' as const,
  invitationMessage: null,
}

function renderRow(overrides: Partial<MemberRowProps> = {}) {
  const props: MemberRowProps = {
    member: baseMember,
    memberCost: 3200,
    isCurrentUser: false,
    isTeamOwner: true,
    onSetLeader: jest.fn(),
    onRemove: jest.fn(),
    onLeave: jest.fn(),
    onEditProfession: jest.fn(),
    onChat: jest.fn(),
    ...overrides,
  }
  return { ...render(<MemberRow {...props} />), props }
}

describe('MemberRow', () => {
  it('renders member name and profession', () => {
    renderRow()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Pedreiro')).toBeInTheDocument()
  })

  it('shows "você" badge when isCurrentUser is true', () => {
    renderRow({ isCurrentUser: true })
    expect(screen.getByText('você')).toBeInTheDocument()
  })

  it('shows "líder" badge when member isLeader is true', () => {
    renderRow({ member: { ...baseMember, isLeader: true } })
    expect(screen.getByText('líder')).toBeInTheDocument()
  })

  it('shows "pendente" badge when status is pending', () => {
    renderRow({ member: { ...baseMember, status: 'pending' as const } })
    expect(screen.getByText('pendente')).toBeInTheDocument()
  })

  it('calls onRemove when remove button is clicked (owner)', () => {
    const { props } = renderRow({ isTeamOwner: true })
    fireEvent.click(screen.getByTitle('Remover'))
    expect(props.onRemove).toHaveBeenCalledTimes(1)
  })

  it('does not show remove button for non-owners', () => {
    renderRow({ isTeamOwner: false, isCurrentUser: false })
    expect(screen.queryByTitle('Remover')).not.toBeInTheDocument()
  })

  it('shows leave button for current user who is not team owner', () => {
    const { props } = renderRow({ isCurrentUser: true, isTeamOwner: false })
    fireEvent.click(screen.getByTitle('Sair da equipe'))
    expect(props.onLeave).toHaveBeenCalledTimes(1)
  })

  it('shows WhatsApp link for other members with phone', () => {
    renderRow({ isCurrentUser: false })
    expect(screen.getByTitle('WhatsApp')).toBeInTheDocument()
  })

  it('hides WhatsApp link for current user', () => {
    renderRow({ isCurrentUser: true })
    expect(screen.queryByTitle('WhatsApp')).not.toBeInTheDocument()
  })

  it('allows editing profession when owner clicks pencil', () => {
    renderRow({ isTeamOwner: true })
    fireEvent.click(screen.getByTitle('Editar função'))
    expect(screen.getByDisplayValue('Pedreiro')).toBeInTheDocument()
  })

  it('calls onEditProfession on Enter with changed value', () => {
    const { props } = renderRow({ isTeamOwner: true })
    fireEvent.click(screen.getByTitle('Editar função'))
    const input = screen.getByDisplayValue('Pedreiro')
    fireEvent.change(input, { target: { value: 'Mestre de obras' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(props.onEditProfession).toHaveBeenCalledWith('Mestre de obras')
  })

  it('cancels editing on Escape', () => {
    renderRow({ isTeamOwner: true })
    fireEvent.click(screen.getByTitle('Editar função'))
    const input = screen.getByDisplayValue('Pedreiro')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByDisplayValue('Pedreiro')).not.toBeInTheDocument()
  })

  it('shows set-leader button only for owner on non-leader members', () => {
    const { props } = renderRow({ isTeamOwner: true, member: { ...baseMember, isLeader: false } })
    fireEvent.click(screen.getByTitle('Definir como líder'))
    expect(props.onSetLeader).toHaveBeenCalledTimes(1)
  })
})
