import { render, screen, fireEvent } from '@testing-library/react'

import { SupportChat } from './SupportChat'

describe('SupportChat', () => {
  it('renders the support toggle button', () => {
    render(<SupportChat />)
    expect(screen.getByRole('button', { name: /suporte/i })).toBeInTheDocument()
  })

  it('opens the chat window when toggle button is clicked', () => {
    render(<SupportChat />)
    fireEvent.click(screen.getByRole('button', { name: /suporte/i }))
    expect(screen.getByText(/suporte equaobra/i)).toBeInTheDocument()
  })

  it('renders initial bot greeting message', () => {
    render(<SupportChat />)
    fireEvent.click(screen.getByRole('button', { name: /suporte/i }))
    expect(screen.getByText(/como posso te ajudar/i)).toBeInTheDocument()
  })

  it('renders initial suggestion buttons', () => {
    render(<SupportChat />)
    fireEvent.click(screen.getByRole('button', { name: /suporte/i }))
    expect(screen.getByText(/como funciona a plataforma/i)).toBeInTheDocument()
  })

  it('shows bot answer when a suggestion is clicked', () => {
    render(<SupportChat />)
    fireEvent.click(screen.getByRole('button', { name: /suporte/i }))
    fireEvent.click(screen.getByText(/como funciona a plataforma/i))
    expect(screen.getByText(/conecta contratantes/i)).toBeInTheDocument()
  })
})
