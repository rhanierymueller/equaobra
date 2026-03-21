import { render, screen, fireEvent } from '@testing-library/react'
import { RegisterForm } from './RegisterForm'
import { useRegisterForm } from '../../hooks/useAuthForm'

function Wrapper() {
  const form = useRegisterForm()
  return <RegisterForm form={form} onSuccess={jest.fn()} />
}

describe('RegisterForm', () => {
  it('renders required fields', () => {
    render(<Wrapper />)
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
  })

  it('shows profession selector when role is profissional', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByText(/profissional/i))
    expect(screen.getByLabelText(/profissão/i)).toBeInTheDocument()
  })

  it('shows error when passwords do not match', async () => {
    render(<Wrapper />)
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'Senha123' } })
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'Diferente1' } })
    fireEvent.blur(screen.getByLabelText(/confirmar senha/i))
    expect(await screen.findByText(/não coincidem/i)).toBeInTheDocument()
  })
})
