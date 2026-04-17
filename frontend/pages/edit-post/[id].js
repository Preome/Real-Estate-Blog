import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Navbar from '../../components/Navbar'

export default function EditPostPage() {
  const router = useRouter()
  const { id } = router.query
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [existingImage, setExistingImage] = useState('')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to edit posts')
      router.push('/login')
      return
    }
    
    if (id) {
      fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // First, verify the user is logged in
      if (!token) {
        router.push('/login')
        return
      }
      
      // Fetch the post
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`)
      const post = response.data.data
      
      // Check if current user is the author
      const userData = localStorage.getItem('user')
      const user = JSON.parse(userData)
      
      if (post.author._id !== user.id) {
        toast.error('You are not authorized to edit this post')
        router.push('/')
        return
      }
      
      setFormData({
        title: post.title,
        description: post.description,
        image: null
      })
      
      if (post.imageUrl) {
        setPreviewUrl(post.imageUrl)
        setExistingImage(post.imageUrl)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      if (error.response?.status === 404) {
        toast.error('Post not found')
        router.push('/my-posts')
      } else if (error.response?.status === 401) {
        toast.error('Please login to edit posts')
        router.push('/login')
      } else {
        toast.error('Failed to load post')
        router.push('/my-posts')
      }
    } finally {
      setFetching(false)
    }
  }

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
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }
      setFormData(prev => ({ ...prev, image: file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
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
      
      if (!token) {
        toast.error('Please login to update posts')
        router.push('/login')
        return
      }
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, 
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (response.data.success) {
        toast.success('Post updated successfully!')
        router.push('/my-posts')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      if (error.response?.status === 403) {
        toast.error('You are not authorized to edit this post')
        router.push('/my-posts')
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
        router.push('/login')
      } else {
        toast.error(error.response?.data?.error || 'Failed to update post')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="loader-container">
        <BallTriangle color="#ffffff" height={100} width={100} />
      </div>
    )
  }

  return (
    <>
      <NextSeo title="Edit Post | Habitat Horizon Real Estate Blog" />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <div className="create-post-container">
            <h2 className="page-title" style={{ fontSize: '2rem' }}>
              Edit Property Insight ✏️
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-light)' }}>
              Update your property insights
            </p>
            
            <form onSubmit={handleSubmit} className="create-post-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., 'Modern Villa with Ocean View'"
                  required
                  maxLength="200"
                />
                <small>{formData.title.length}/200 characters</small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Share details about the property, location, amenities, or investment potential..."
                  rows="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Update Image (Optional)</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <small>📸 Leave empty to keep current image. Max 5MB.</small>
                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                    {existingImage && !formData.image && (
                      <div className="current-image-badge">Current Image</div>
                    )}
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image: null }))
                          setPreviewUrl(existingImage)
                        }}
                        className="cancel-image-btn"
                      >
                        Cancel New Image
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => router.push('/my-posts')} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <>
                      <BallTriangle color="#fff" height={20} width={20} />
                      Updating...
                    </>
                  ) : (
                    '✅ Update Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="footer">
          <p>©  Habitat Horizon Real Estate Blog </p>
        </footer>
      </div>
    </>
  )
}