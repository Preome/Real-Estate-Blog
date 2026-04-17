import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Image from 'next/image'
import Navbar from '../components/Navbar'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts`)
      setPosts(response.data.data)
      setError(null)
    } catch (err) {
      setError('Failed to load posts. Please try again later.')
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
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
        title="Real Estate Blog | Luxury Property Insights"
        description="Discover expert insights about luxury real estate investments, property management, and home buying."
      />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <h2 className="page-title">Discover Extraordinary Properties</h2>
          
          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
              <button onClick={fetchPosts} className="retry-btn">Try Again</button>
            </div>
          )}

          <div className="posts-grid">
            {posts.map((post) => (
              <article key={post._id} className="post-card">
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
                    {post.description.substring(0, 120)}...
                  </p>
                  <div className="post-meta">
                    <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>👤 {post.authorName}</span>
                    <Link href={`/post/${post._id}`} className="read-more">
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {posts.length === 0 && !error && (
            <div className="no-posts glass">
              <p>No properties shared yet. Be the first!</p>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>© 2024 Luxury Real Estate Blog s</p>
        </footer>
      </div>
    </>
  )
}