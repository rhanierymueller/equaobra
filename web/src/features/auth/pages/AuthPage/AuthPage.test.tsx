import { render, screen, fireEvent } from '@testing-library/react'

import AuthPage from './AuthPage'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('AuthPage', () => {
  it('renders login form by default', () => {
    render(<AuthPage />)
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('switches to register form on tab click', () => {
    render(<AuthPage />)
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
  })
})
