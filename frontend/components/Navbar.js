import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <header className="header glass">
      <h1>🏰 Luxury Estates</h1>
      
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="desktop-nav">
        <nav className="nav">
          <Link href="/">Home</Link>
          {user ? (
            <>
              <Link href="/create">Create Post</Link>
              <Link href="/my-posts">My Posts</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout ({user.name})
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      <MobileMenu user={user} onLogout={handleLogout} />
    </header>
  )
}