import { fireEvent, render, screen } from '@testing-library/react'

import { PendingInvitesList } from './PendingInvitesList'

const baseMember = {
  professionalId: 'p1',
  name: 'Carlos Melo',
  profession: 'Eletricista',
  phone: '',
  avatarUrl: null,
  avatarInitials: 'CM',
  hourlyRate: null,
  isLeader: false,
  status: 'pending' as const,
  invitationMessage: null,
}

describe('PendingInvitesList', () => {
  it('renders nothing when members list is empty', () => {
    const { container } = render(<PendingInvitesList members={[]} onCancel={jest.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders member name and profession', () => {
    render(<PendingInvitesList members={[baseMember]} onCancel={jest.fn()} />)
    expect(screen.getByText('Carlos Melo')).toBeInTheDocument()
    expect(screen.getByText('Eletricista')).toBeInTheDocument()
  })

  it('shows singular label for one invite', () => {
    render(<PendingInvitesList members={[baseMember]} onCancel={jest.fn()} />)
    expect(screen.getByText(/1 convite aguardando resposta/)).toBeInTheDocument()
  })

  it('shows plural label for multiple invites', () => {
    const m2 = { ...baseMember, professionalId: 'p2', name: 'Ana Lima' }
    render(<PendingInvitesList members={[baseMember, m2]} onCancel={jest.fn()} />)
    expect(screen.getByText(/2 convites aguardando resposta/)).toBeInTheDocument()
  })

  it('shows invitation message when provided', () => {
    const m = { ...baseMember, invitationMessage: 'Precisamos de você!' }
    render(<PendingInvitesList members={[m]} onCancel={jest.fn()} />)
    expect(screen.getByText(/Precisamos de você!/)).toBeInTheDocument()
  })

  it('calls onCancel with the member when cancel button is clicked', () => {
    const onCancel = jest.fn()
    render(<PendingInvitesList members={[baseMember]} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledWith(baseMember)
  })
})
