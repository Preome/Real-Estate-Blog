import { BallTriangle } from 'react-loader-spinner'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <BallTriangle color="#667eea" height={80} width={80} />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  )
}