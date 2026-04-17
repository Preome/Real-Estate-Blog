import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Image from 'next/image'
import Navbar from '../components/Navbar'

export default function MyPostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      toast.error('Please login to view your posts')
      router.push('/login')
      return
    }
    
    setUser(JSON.parse(userData))
    fetchMyPosts()
  }, [])

  const fetchMyPosts = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/my-posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setPosts(response.data.data)
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      } else if (error.response?.status === 404) {
        toast.error('No posts found')
      } else {
        toast.error('Failed to load your posts')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token')
        
        await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        toast.success('Post deleted successfully')
        setPosts(posts.filter(post => post._id !== postId))
      } catch (error) {
        console.error('Error deleting post:', error)
        if (error.response?.status === 403) {
          toast.error('You are not authorized to delete this post')
        } else if (error.response?.status === 401) {
          toast.error('Please login again')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
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

  return (
    <>
      <NextSeo 
        title="My Posts | Habitat Horizon Real Estate Blog" 
        description="Manage your property insights and Real Estate Blog posts"
      />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="page-title" style={{ marginBottom: 0 }}>My Property Insights</h2>
            <Link href="/create" className="create-btn" style={{ display: 'inline-block', width: 'auto' }}>
              + Create New Post
            </Link>
          </div>
          
          {posts.length === 0 ? (
            <div className="no-posts glass">
              <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>📝 No posts yet</p>
              <p>You haven't created any property insights. Share your first real estate tip!</p>
              <Link href="/create" className="create-btn" style={{ marginTop: '1.5rem' }}>
                Create Your First Post
              </Link>
            </div>
          ) : (
            <>
              <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
                Showing {posts.length} post{posts.length !== 1 ? 's' : ''}
              </p>
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post._id} className="post-card-wrapper">
                    <Link 
                      href={`/post/${post._id}`}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <article className="post-card">
                        {post.imageUrl && (
                          <div className="post-image">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={400}
                              height={250}
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className="post-content">
                          <h3 className="post-title">{post.title}</h3>
                          <p className="post-description">
                            {post.description.substring(0, 120)}
                            {post.description.length > 120 ? '...' : ''}
                          </p>
                          <div className="post-meta">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <span>📅 {new Date(post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                                Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                    <div className="post-actions-buttons">
                      <Link href={`/edit-post/${post._id}`} className="edit-btn">
                         Edit
                      </Link>
                      <button onClick={() => handleDelete(post._id)} className="delete-btn-small">
                         Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        <footer className="footer">
          <p>© Habitat Horizon Real Estate Blogs</p>
        </footer>
      </div>
    </>
  )
}