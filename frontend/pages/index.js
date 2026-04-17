import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import CategoriesSidebar from '../components/CategoriesSidebar'

export default function HomePage() {
  const router = useRouter()
  const { category } = router.query
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(category || null)
  const [totalPosts, setTotalPosts] = useState(0)
  const [popularSearches, setPopularSearches] = useState([])
  const [popularLoading, setPopularLoading] = useState(true)

  useEffect(() => {
    setPage(1)
    fetchPosts(1)
  }, [selectedCategory])

  useEffect(() => {
    fetchPopularSearches()
  }, [])

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1)
      let url = `${process.env.NEXT_PUBLIC_API_URL}/posts?page=${pageNum}&limit=9`
      
      if (selectedCategory) {
        url = `${process.env.NEXT_PUBLIC_API_URL}/posts/category/${encodeURIComponent(selectedCategory)}?page=${pageNum}&limit=9`
      }
      
      const response = await axios.get(url)
      
      if (pageNum === 1) {
        setPosts(response.data.data)
      } else {
        setPosts(prev => [...prev, ...response.data.data])
      }
      
      setTotalPosts(response.data.pagination?.total || response.data.data.length)
      setHasMore(response.data.pagination?.page < response.data.pagination?.pages)
      setError(null)
    } catch (err) {
      setError('Failed to load posts. Please try again later.')
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchPopularSearches = async () => {
    try {
      setPopularLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/posts/popular-searches`)
      console.log('Popular searches response:', response.data)
      setPopularSearches(response.data.data || [])
    } catch (error) {
      console.error('Error fetching popular searches:', error)
      setPopularSearches([
        { term: "Luxury Villa", query: "luxury+villa", icon: "🏰", count: 0 },
        { term: "Beachfront", query: "beachfront", icon: "🏖️", count: 0 },
        { term: "Modern Design", query: "modern+design", icon: "🎨", count: 0 },
        { term: "Investment", query: "investment", icon: "💰", count: 0 }
      ])
    } finally {
      setPopularLoading(false)
    }
  }

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName)
    setPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handlePopularSearch = (query) => {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPosts(nextPage)
    }
  }

  if (loading && page === 1) {
    return (
      <div className="container">
        <Navbar />
        <div className="loader-container">
          <BallTriangle color="#ffffff" height={100} width={100} />
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <Navbar />

      <main className="main with-sidebar">
        <aside className="sidebar-left">
          <CategoriesSidebar 
            selectedCategory={selectedCategory} 
            onSelectCategory={handleCategorySelect}
          />
        </aside>

        <div className="main-content">
          <div className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">
                {selectedCategory ? `${selectedCategory}` : 'Discover Your Dream Property'}
              </h1>
              <p className="hero-subtitle">
                {selectedCategory 
                  ? `Explore ${selectedCategory.toLowerCase()} insights and properties`
                  : 'Explore Habitat Horizon, investment opportunities, and expert real estate insights'
                }
              </p>
              
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
                      Search 
                    </button>
                  </div>
                </form>
                
                <div className="popular-searches">
                  <span className="popular-label">Popular Searches:</span>
                  {popularLoading ? (
                    <span className="popular-loading">Loading...</span>
                  ) : (
                    popularSearches.map((item, index) => (
                      <button 
                        key={index}
                        onClick={() => handlePopularSearch(item.query)} 
                        className="popular-tag"
                      >
                        {item.icon} {item.term}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="results-info">
            <p>Found {totalPosts} post{totalPosts !== 1 ? 's' : ''}</p>
          </div>

          <div className="posts-grid">
            {posts.map((post, index) => (
              <Link 
                key={post._id} 
                href={`/post/${post._id}`}
                style={{ textDecoration: 'none' }}
              >
                <article 
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
                      {post.category && (
                        <div className="post-category-badge">{post.category}</div>
                      )}
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
                      <span className="read-more">
                        Explore →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
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
              <div className="no-posts-icon">📂</div>
              <h3>No posts found in {selectedCategory || 'this category'}</h3>
              <p>Be the first to share your real estate insights!</p>
              <Link href="/create" className="create-btn">
                Share Your First Property
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© Habitat Horizon Real Estate Blog</p>
      </footer>
    </div>
  )
}