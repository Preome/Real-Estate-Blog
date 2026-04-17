import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Navbar from '../components/Navbar'

export default function CreatePostPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('description', formData.description)
    if (formData.image) {
      submitData.append('image', formData.image)
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/posts`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      toast.success('Post created successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error.response?.data?.error || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NextSeo title="Create Post | Luxury Real Estate Blog" />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <div className="create-post-container">
            <h2 className="page-title" style={{ fontSize: '2rem' }}>
              Share Your Property Insight ✨
            </h2>
            
            <form onSubmit={handleSubmit} className="create-post-form">
              <div className="form-group">
                <label>Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., 'Modern Villa with Ocean View'"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Share details about the property..."
                  rows="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Property Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, image: null }))
                        setPreviewUrl(null)
                      }}
                      className="remove-image"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => router.back()} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <>
                      <BallTriangle color="#fff" height={20} width={20} />
                      Publishing...
                    </>
                  ) : (
                    'Publish Insight'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="footer">
          <p>© 2024 Luxury Real Estate Blogs</p>
        </footer>
      </div>
    </>
  )
}