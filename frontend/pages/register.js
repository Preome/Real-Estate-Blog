import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      
      // Store token and user data
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      toast.success('Account created successfully!')
      router.push('/')
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.error || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NextSeo title="Register | Luxury Real Estate Blog" />
      
      <div className="container">
        <header className="header glass">
          <h1>🏰 Luxury Estates</h1>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </header>

        <main className="main">
          <div className="auth-container">
            <div className="auth-card">
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Join our community of property enthusiasts</p>
              
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

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
                  <small>Must be at least 6 characters</small>
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-btn">
                  {loading ? (
                    <>
                      <BallTriangle color="#fff" height={20} width={20} />
                      Creating account...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
              </form>

              <p className="auth-footer">
                Already have an account? <Link href="/login">Login here</Link>
              </p>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p>©  Luxury Real Estate Blog </p>
        </footer>
      </div>
    </>
  )
}