import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function MobileMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [router.pathname])

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        style={{
          background: 'rgba(102, 126, 234, 0.1)',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          borderRadius: '8px',
          display: 'block',
          zIndex: 1001,
        }}
      >
        <div style={{ width: '25px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ width: '100%', height: '2px', background: '#667eea', transition: 'all 0.3s' }}></span>
          <span style={{ width: '100%', height: '2px', background: '#667eea', transition: 'all 0.3s' }}></span>
          <span style={{ width: '100%', height: '2px', background: '#667eea', transition: 'all 0.3s' }}></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
          onClick={() => setIsOpen(false)}
        >
          {/* Menu Board - Positioned to fit all options */}
          <div
            style={{
              position: 'fixed',
              top: 'auto',
              bottom: 'auto',
              left: 'auto',
              right: '20px',
              transform: 'translateY(0)',
              width: '280px',
              backgroundColor: '#ffffff',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginTop: '80px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Menu</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Navigation Links - All visible without scroll */}
            <nav style={{ 
              padding: '8px 0',
              backgroundColor: '#ffffff',
            }}>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 20px',
                  textDecoration: 'none',
                  color: '#1f2937',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.3s',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                }}
              >
                <span style={{ fontSize: '20px' }}>🏠</span>
                <span>Home</span>
              </Link>

              {user ? (
                <>
                  <Link
                    href="/create"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>✨</span>
                    <span>Create Post</span>
                  </Link>

                  <Link
                    href="/my-posts"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>📝</span>
                    <span>My Posts</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      width: '100%',
                      textDecoration: 'none',
                      color: '#dc2626',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🚪</span>
                    <span>Logout ({user.name})</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🔑</span>
                    <span>Login</span>
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      textDecoration: 'none',
                      color: '#1f2937',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.3s',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>📝</span>
                    <span>Register</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}