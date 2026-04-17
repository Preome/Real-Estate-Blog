import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, formData)
      
      // Store token and user data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      toast.success('Welcome back!')
      router.push('/')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NextSeo title="Login | Habitat Horizon Real Estate Blog" />
      
      <div className="container">
        <header className="header glass">
          <h1>🏰 Habitat Horizon</h1>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </header>

        <main className="main">
          <div className="auth-container">
            <div className="auth-card">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Login to manage your property insights</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn">
                  {loading ? (
                    <>
                      <BallTriangle color="#fff" height={20} width={20} />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>

              <p className="auth-footer">
                Don't have an account? <Link href="/register">Register here</Link>
              </p>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>©  Habitat Horizon Real Estate Blog </p>
        </footer>
      </div>
    </>
  )
}