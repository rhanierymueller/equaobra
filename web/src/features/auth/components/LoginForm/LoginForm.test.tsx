import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import { useLoginForm } from '../../hooks/useAuthForm'

function Wrapper() {
  const form = useLoginForm()
  return <LoginForm form={form} onSuccess={jest.fn()} />
}

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<Wrapper />)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('shows error when submitting empty form', async () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByText(/e-mail é obrigatório/i)).toBeInTheDocument()
  })

  it('shows invalid email error', async () => {
    render(<Wrapper />)
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'notanemail' } })
    fireEvent.blur(screen.getByLabelText(/e-mail/i))
    expect(await screen.findByText(/e-mail válido/i)).toBeInTheDocument()
  })
})
