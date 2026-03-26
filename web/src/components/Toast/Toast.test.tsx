import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ToastProvider } from './Toast'

import { useToast } from '@/src/hooks/useToast'

function Trigger({ label, action }: { label: string; action: () => void }) {
  return <button onClick={action}>{label}</button>
}

function TestHarness() {
  const toast = useToast()
  return (
    <>
      <Trigger label="success" action={() => toast.success('Operação concluída!')} />
      <Trigger label="error" action={() => toast.error('Algo deu errado.')} />
      <Trigger label="warning" action={() => toast.warning('Atenção necessária.')} />
      <Trigger label="info" action={() => toast.info('Informação disponível.')} />
    </>
  )
}

function renderWithProvider() {
  return render(
    <ToastProvider>
      <TestHarness />
    </ToastProvider>,
  )
}

describe('ToastProvider', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('renders children without toasts initially', () => {
    renderWithProvider()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a success toast', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('success'))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Operação concluída!')).toBeInTheDocument()
  })

  it('shows an error toast', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('error'))
    expect(screen.getByText('Algo deu errado.')).toBeInTheDocument()
  })

  it('shows a warning toast', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('warning'))
    expect(screen.getByText('Atenção necessária.')).toBeInTheDocument()
  })

  it('shows an info toast', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('info'))
    expect(screen.getByText('Informação disponível.')).toBeInTheDocument()
  })

  it('dismisses a toast when close button is clicked', async () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('success'))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Fechar'))

    await act(async () => {
      jest.advanceTimersByTime(300)
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('auto-dismisses after duration', async () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('success'))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    await act(async () => {
      jest.advanceTimersByTime(4300)
    })

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  it('stacks multiple toasts', () => {
    renderWithProvider()
    fireEvent.click(screen.getByText('success'))
    fireEvent.click(screen.getByText('error'))
    fireEvent.click(screen.getByText('info'))

    expect(screen.getAllByRole('alert')).toHaveLength(3)
  })

  it('throws when used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestHarness />)).toThrow('useToast must be used inside <ToastProvider>')
    spy.mockRestore()
  })
})
