import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import SEO from '../components/SEO'

export default function HomePage() {
  const router = useRouter()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

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
      setError('Failed to load posts. Please try again later.')
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }

  if (loading && page === 1) {
    return (
      <>
        <SEO title="Home" description="Discover expert insights about luxury real estate investments" />
        <div className="container">
          <Navbar />
          <div className="loader-container">
            <BallTriangle color="#ffffff" height={100} width={100} />
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
        keywords="real estate, luxury homes, property investment, real estate blog, property management, home buying tips"
      />
      
      <div className="container">
        <Navbar />

        <main className="main">
          {/* Hero Section with Search Banner */}
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Discover Your Dream Property</h1>
              <p className="hero-subtitle">
                Explore luxury estates, investment opportunities, and expert real estate insights
              </p>
              
              {/* Search Banner */}
              <div className="search-banner">
                <form onSubmit={handleSearch} className="home-search-form">
                  <div className="home-search-wrapper">
                    <span className="home-search-icon">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by property title, location, or author..."
                      className="home-search-input"
                    />
                    <button type="submit" className="home-search-button">
                      Search Properties
                    </button>
                  </div>
                </form>
                
                <div className="popular-searches">
                  <span className="popular-label">Popular:</span>
                  <button onClick={() => router.push('/search?q=luxury')} className="popular-tag">
                    Luxury Villas
                  </button>
                  <button onClick={() => router.push('/search?q=beach')} className="popular-tag">
                    Beachfront
                  </button>
                  <button onClick={() => router.push('/search?q=investment')} className="popular-tag">
                    Investment
                  </button>
                  <button onClick={() => router.push('/search?q=modern')} className="popular-tag">
                    Modern Design
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Properties Section */}
          <div className="featured-section">
            <div className="section-header">
              <h2 className="page-title">Featured Properties</h2>
              <p className="section-subtitle">Discover the most extraordinary properties shared by our community</p>
            </div>
            
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
                <button onClick={fetchPosts} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}

            <div className="posts-grid">
              {posts.map((post, index) => (
                <article 
                  key={post._id} 
                  className="post-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {post.imageUrl && (
                    <div className="post-image">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={400}
                        height={250}
                        style={{ objectFit: 'cover' }}
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                      <div className="post-category">Featured</div>
                    </div>
                  )}
                  <div className="post-content">
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-description">
                      {post.description.substring(0, 120)}
                      {post.description.length > 120 ? '...' : ''}
                    </p>
                    <div className="post-meta">
                      <div className="post-meta-info">
                        <span>📅 {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                        <span>👤 {post.authorName}</span>
                      </div>
                      <Link href={`/post/${post._id}`} className="read-more">
                        Explore Property →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {loading && page > 1 && (
              <div className="loading-more">
                <BallTriangle color="#667eea" height={50} width={50} />
              </div>
            )}

            {hasMore && !loading && (
              <div className="load-more-container">
                <button onClick={loadMore} className="load-more-btn">
                  Load More Properties
                </button>
              </div>
            )}

            {posts.length === 0 && !error && !loading && (
              <div className="no-posts glass">
                <div className="no-posts-icon">🏰</div>
                <h3>No properties shared yet</h3>
                <p>Be the first to share your real estate insights with our community!</p>
                <Link href="/create" className="create-btn">
                  Share Your First Property
                </Link>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>© 2024 Luxury Real Estate Blog | Crafted with 💜 for property enthusiasts</p>
        </footer>
      </div>
    </>
  )
}