import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Navbar from '../../components/Navbar'

export default function SinglePostPage() {
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`)
      setPost(response.data.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching post:', err)
      setError('Post not found or has been deleted')
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Post deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(error.response?.data?.error || 'Failed to delete post')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <Navbar />
        <div className="loader-container">
          <BallTriangle color="#ffffff" height={100} width={100} />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container">
        <Navbar />
        <div className="error-container">
          <h2>🔍 {error || 'Post not found'}</h2>
          <p>The property insight you're looking for doesn't exist or has been removed.</p>
          <Link href="/" className="back-home">Browse Properties</Link>
        </div>
      </div>
    )
  }

  const isAuthor = currentUser?.id === post.author?._id

  return (
    <>
      <NextSeo
        title={post.title}
        description={post.description.substring(0, 160)}
        image={post.imageUrl}
        url={`https://yourdomain.com/post/${post._id}`}
        author={post.authorName}
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
        type="article"
      />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <article className="single-post">
            <Link href="/" className="back-link">← Back to Home </Link>
            
            {/* Full Image Display - Improved Version */}
            {post.imageUrl && (
              <div className="post-hero-image">
                <div className="full-image-container">
                  {!imageLoaded && (
                    <div className="image-loader">
                      <BallTriangle color="#667eea" height={40} width={40} />
                    </div>
                  )}
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="full-post-image"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      console.error('Image failed to load');
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-metadata">
              <span>📅 {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}</span>
              <span>👤 Author: {post.authorName}</span>
              {post.category && (
                <span className="category-tag">📂 {post.category}</span>
              )}
              <span>📖 {Math.ceil(post.description.length / 1000)} min read</span>
              {isAuthor && <span className="author-badge">✏️ Your Post</span>}
            </div>
            
            <div className="post-body">
              <p>{post.description}</p>
            </div>
            
            {isAuthor && (
              <div className="post-actions">
                <button onClick={handleDelete} className="delete-btn">
                  🗑️ Delete Post
                </button>
              </div>
            )}
          </article>
        </main>

        <footer className="footer">
          <p>© 2024 Habitat Horizon Real Estate Blog | Crafted with 💜 for property enthusiasts</p>
        </footer>
      </div>
    </>
  )
}