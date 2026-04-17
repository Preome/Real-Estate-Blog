import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'
import LoadingSpinner from '../components/LoadingSpinner'
import SkeletonLoader from '../components/SkeletonLoader'
import { handleApiError } from '../utils/errorHandler'

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [page])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts?page=${page}&limit=9`)
      
      if (page === 1) {
        setPosts(response.data.data)
      } else {
        setPosts(prev => [...prev, ...response.data.data])
      }
      
      setHasMore(response.data.pagination.page < response.data.pagination.pages)
      setError(null)
    } catch (err) {
      handleApiError(err, 'Failed to load posts')
      setError('Unable to load blog posts. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  if (error && posts.length === 0) {
    return (
      <>
        <SEO title="Home" description="Discover luxury real estate insights" />
        <div className="container">
          <Navbar />
          <div className="error-container">
            <h2>⚠️ {error}</h2>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO 
        title="Home"
        description="Discover expert insights about luxury real estate investments, property management, and home buying tips. Stay updated with latest market trends."
        keywords="real estate, luxury homes, property investment, real estate blog"
      />
      
      <div className="container">
        <Navbar />

        <main className="main">
          <h2 className="page-title">Discover Extraordinary Properties</h2>
          
          {loading && page === 1 ? (
            <SkeletonLoader type="post" count={6} />
          ) : (
            <>
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
                          loading="lazy"
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

              {loading && page > 1 && (
                <div className="loading-more">
                  <LoadingSpinner message="Loading more posts..." />
                </div>
              )}

              {hasMore && !loading && (
                <div className="load-more-container">
                  <button onClick={loadMore} className="load-more-btn">
                    Load More Posts
                  </button>
                </div>
              )}

              {posts.length === 0 && !loading && (
                <div className="no-posts glass">
                  <p>No posts yet. Be the first to share!</p>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="footer">
          <p> Luxury Real Estate Blog </p>
        </footer>
      </div>
    </>
  )
}