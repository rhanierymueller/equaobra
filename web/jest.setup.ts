import '@testing-library/jest-dom'

Element.prototype.scrollIntoView = jest.fn()

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
