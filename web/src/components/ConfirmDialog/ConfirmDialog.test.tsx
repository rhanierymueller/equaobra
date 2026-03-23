import { render, screen, fireEvent } from '@testing-library/react'

import { ConfirmDialog } from './ConfirmDialog'

const defaultProps = {
  title: 'Confirmar ação?',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
}

describe('ConfirmDialog', () => {
  it('renders title and default buttons', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Confirmar ação?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<ConfirmDialog {...defaultProps} description="Essa ação não pode ser desfeita." />)
    expect(screen.getByText('Essa ação não pode ser desfeita.')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key is pressed', () => {
    const onCancel = jest.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('renders custom confirmLabel and cancelLabel', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Excluir"
        cancelLabel="Voltar"
      />,
    )
    expect(screen.getByRole('button', { name: /excluir/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voltar/i })).toBeInTheDocument()
  })
})
