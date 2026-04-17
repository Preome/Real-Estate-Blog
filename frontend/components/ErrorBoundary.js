import React from 'react'
import toast from 'react-hot-toast'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    toast.error('Something went wrong. Please refresh the page.')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-content">
            <h2>😅 Oops! Something went wrong</h2>
            <p>We're sorry for the inconvenience. Please try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary