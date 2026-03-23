import { render, screen, fireEvent } from '@testing-library/react'

import { ChatModal } from './ChatModal'

jest.mock('../../hooks/useChat', () => ({
  useChat: () => ({
    conversations: [],
    getOrCreateConversation: jest.fn(() => ({ id: 'conv-1', messages: [] })),
    sendMessage: jest.fn(),
    getConversation: jest.fn(() => ({ id: 'conv-1', messages: [] })),
  }),
}))

const mockUser = {
  id: 'user-1',
  name: 'João Silva',
  email: 'joao@email.com',
  role: 'contratante' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
}

const mockProfessional = {
  professionalId: 'pro-1',
  name: 'Carlos Pedreiro',
  avatarInitials: 'CP',
  profession: 'Pedreiro',
}

describe('ChatModal', () => {
  it('renders the professional name in the header', () => {
    render(<ChatModal user={mockUser} professional={mockProfessional} onClose={jest.fn()} />)
    expect(screen.getByText('Carlos Pedreiro')).toBeInTheDocument()
  })

  it('renders the profession subtitle', () => {
    render(<ChatModal user={mockUser} professional={mockProfessional} onClose={jest.fn()} />)
    expect(screen.getByText('Pedreiro')).toBeInTheDocument()
  })

  it('renders empty state when no messages', () => {
    render(<ChatModal user={mockUser} professional={mockProfessional} onClose={jest.fn()} />)
    expect(screen.getByText(/iniciar conversa/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<ChatModal user={mockUser} professional={mockProfessional} onClose={onClose} />)
    const closeButtons = screen.getAllByRole('button')
    fireEvent.click(closeButtons[0])
    expect(onClose).toHaveBeenCalled()
  })
})
