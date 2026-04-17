import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Image from 'next/image'
import Navbar from '../../components/Navbar'

export default function SinglePostPage() {
  const router = useRouter()
  const { id } = router.query
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthor, setIsAuthor] = useState(false)

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setCurrentUser(user)
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
      
      // Check if current user is the author
      const userData = localStorage.getItem('user')
      if (userData && response.data.data) {
        const user = JSON.parse(userData)
        setIsAuthor(user.id === response.data.data.author._id)
      }
    } catch (err) {
      setError('Post not found or has been deleted')
      toast.error('Failed to load post')
      console.error('Error fetching post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('You must be logged in to delete posts')
          router.push('/login')
          return
        }
        
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        toast.success('Post deleted successfully')
        router.push('/')
      } catch (error) {
        console.error('Error deleting post:', error)
        if (error.response?.status === 403) {
          toast.error('You are not authorized to delete this post')
        } else if (error.response?.status === 401) {
          toast.error('Please login to delete posts')
          router.push('/login')
        } else {
          toast.error('Failed to delete post')
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="loader-container">
        <BallTriangle color="#ffffff" height={100} width={100} />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container">
        <Navbar />
        <main className="main">
          <div className="error-container">
            <h2>🔍 {error || 'Post not found'}</h2>
            <p>The property insight you're looking for doesn't exist or has been removed.</p>
            <Link href="/" className="back-home">Explore Other Properties</Link>
          </div>
        </main>
        <footer className="footer">
          <p>© 2024 Luxury Real Estate Blog </p>
        </footer>
      </div>
    )
  }

  return (
    <>
      <NextSeo
        title={`${post.title} | Luxury Real Estate Blog`}
        description={post.description.substring(0, 160)}
        canonical={`https://yourdomain.com/post/${post._id}`}
        openGraph={{
          title: post.title,
          description: post.description.substring(0, 160),
          url: `https://yourdomain.com/post/${post._id}`,
          type: 'article',
          article: {
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
          },
          images: post.imageUrl ? [
            {
              url: post.imageUrl,
              alt: post.title,
              width: 1200,
              height: 630,
            }
          ] : [],
        }}
      />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <article className="single-post">
            <Link href="/" className="back-link">
              ← Back to all properties
            </Link>
            
            {post.imageUrl && (
              <div className="post-hero-image">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={1200}
                  height={600}
                  style={{ objectFit: 'cover' }}
                  priority={true}
                />
              </div>
            )}
            
            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-metadata">
              <span>📅 Published: {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <span>👤 Author: {post.author?.name || 'Unknown'}</span>
              {post.author?._id === currentUser?.id && (
                <span className="author-badge">✏️ Your Post</span>
              )}
            </div>
            
            <div className="post-body">
              <p>{post.description}</p>
            </div>
            
            {/* Only show delete button to the author */}
            {isAuthor && (
              <div className="post-actions">
                <button onClick={handleDelete} className="delete-btn">
                  🗑️ Delete Property Insight
                </button>
              </div>
            )}
          </article>
        </main>

        <footer className="footer">
          <p>© 2024 Luxury Real Estate Blog </p>
        </footer>
      </div>
    </>
  )
}