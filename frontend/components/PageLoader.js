import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function PageLoader() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let timeoutId

    const handleStart = () => {
      // Add small delay to prevent flashing on fast loads
      timeoutId = setTimeout(() => {
        setLoading(true)
      }, 200)
    }
    
    const handleComplete = () => {
      clearTimeout(timeoutId)
      setLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      clearTimeout(timeoutId)
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  if (!loading) return null

  return (
    <div className="page-loader">
      <div className="page-loader-overlay">
        <div className="page-loader-spinner-container">
          <div className="page-loader-spinner"></div>
          <p className="page-loader-text">Loading...</p>
        </div>
      </div>
    </div>
  )
}