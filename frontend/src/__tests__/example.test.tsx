import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Example test - replace with actual component tests
describe('Example Test', () => {
  it('should render without crashing', () => {
    const { container } = render(<div>Test Component</div>)
    expect(container).toBeInTheDocument()
  })

  it('should display text correctly', () => {
    render(<div>Test Component</div>)
    const element = screen.getByText('Test Component')
    expect(element).toBeInTheDocument()
  })
})
