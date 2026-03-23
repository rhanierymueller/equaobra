import { render, screen, fireEvent } from '@testing-library/react'

import AuthPage from './AuthPage'

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

describe('AuthPage', () => {
  it('renders login form by default', () => {
    render(<AuthPage />)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument()
  })

  it('switches to register form on tab click', () => {
    render(<AuthPage />)
    fireEvent.click(screen.getAllByRole('button', { name: /criar conta/i })[0])
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
  })
})
