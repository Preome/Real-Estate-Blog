import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BallTriangle } from 'react-loader-spinner'
import Navbar from '../components/Navbar'

export async function getServerSideProps(context) {
  const { q = '', page = 1 } = context.query;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await axios.get(
      `${API_URL}/posts/search?q=${encodeURIComponent(q)}&page=${page}&limit=9`
    );
    
    const siteTitle = 'Habitat Horizon Real Estate Blog'
    const searchQueryText = q || ''
    const total = response.data.pagination?.total || 0
    const seoTitle = searchQueryText 
      ? `Search Results for "${searchQueryText}" | ${siteTitle}`
      : `Search | ${siteTitle}`
    const seoDescription = searchQueryText 
      ? `Found ${total} result${total !== 1 ? 's' : ''} for "${searchQueryText}". Discover real estate insights, property tips, and market trends on ${siteTitle}.`
      : `Search for properties, real estate insights, and market trends on ${siteTitle}.`
    
    return {
      props: {
        initialPosts: response.data.data || [],
        initialPagination: response.data.pagination || {
          page: 1,
          pages: 1,
          total: 0,
          hasMore: false
        },
        searchQuery: searchQueryText,
        error: null,
        seoTitle: seoTitle,
        seoDescription: seoDescription,
        seoTotal: total
      }
    };
  } catch (error) {
    console.error('SSR Search error:', error);
    const searchQueryText = context.query.q || ''
    const siteTitle = 'Habitat Horizon Real Estate Blog'
    
    return {
      props: {
        initialPosts: [],
        initialPagination: {
          page: 1,
          pages: 1,
          total: 0,
          hasMore: false
        },
        searchQuery: searchQueryText,
        error: 'Failed to load search results',
        seoTitle: searchQueryText ? `Search Results for "${searchQueryText}" | ${siteTitle}` : `Search | ${siteTitle}`,
        seoDescription: searchQueryText ? `Search for "${searchQueryText}" on ${siteTitle}` : `Search for properties on ${siteTitle}`,
        seoTotal: 0
      }
    };
  }
}

export default function SearchPage({ 
  initialPosts, 
  initialPagination, 
  searchQuery: initialSearchQuery,
  error: initialError,
  seoTitle,
  seoDescription,
  seoTotal
}) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [pagination, setPagination] = useState(initialPagination)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fetchSuggestions = async (query) => {
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/suggestions?q=${encodeURIComponent(query)}`
        )
        setSuggestions(response.data.data)
      } catch (err) {
        console.error('Suggestions error:', err)
      }
    } else {
      setSuggestions([])
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
      setLoading(true)
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/search?q=${encodeURIComponent(searchQuery.trim())}&page=1&limit=9`
        )
        setPosts(response.data.data)
        setPagination(response.data.pagination)
        setError(null)
      } catch (err) {
        setError('Failed to load search results')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setShowSuggestions(false)
  }

  const loadMore = async () => {
    if (pagination.hasMore && !loading) {
      const nextPage = pagination.page + 1
      setLoading(true)
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/search?q=${encodeURIComponent(searchQuery)}&page=${nextPage}&limit=9`
        )
        setPosts([...posts, ...response.data.data])
        setPagination(response.data.pagination)
      } catch (err) {
        toast.error('Failed to load more results')
      } finally {
        setLoading(false)
      }
    }
  }

  const fullSeoTitle = searchQuery 
    ? `Search Results for "${searchQuery}" | Habitat Horizon Real Estate Blog`
    : `Search | Habitat Horizon Real Estate Blog`
  const fullSeoDescription = searchQuery 
    ? `Found ${pagination.total} result${pagination.total !== 1 ? 's' : ''} for "${searchQuery}". Discover real estate insights, property tips, and market trends.`
    : `Search for properties, real estate insights, and market trends.`

  if (loading && posts.length === 0) {
    return (
      <>
        <Head>
          <title>{fullSeoTitle}</title>
          <meta name="description" content={fullSeoDescription} />
          <meta name="robots" content="index, follow" />
        </Head>
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
      <Head>
        <title>{fullSeoTitle}</title>
        <meta name="description" content={fullSeoDescription} />
        <meta name="keywords" content={`${searchQuery}, real estate, luxury homes, property search, Real Estate Blog`} />
        <meta name="author" content="Habitat Horizon Real Estate Blog" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta property="og:title" content={fullSeoTitle} />
        <meta property="og:description" content={fullSeoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://yourdomain.com/search?q=${encodeURIComponent(searchQuery || '')}`} />
        <meta property="og:image" content="https://res.cloudinary.com/demo/image/upload/v1312461206/sample.jpg" />
        <meta property="og:site_name" content="Habitat Horizon Real Estate Blog" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullSeoTitle} />
        <meta name="twitter:description" content={fullSeoDescription} />
        <meta name="twitter:image" content="https://res.cloudinary.com/demo/image/upload/v1312461206/sample.jpg" />
        <link rel="canonical" href={`https://yourdomain.com/search?q=${encodeURIComponent(searchQuery || '')}`} />
      </Head>
      
      <div className="container">
        <Navbar />

        <main className="main">
          <div className="search-header">
            <div className="search-container">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setShowSuggestions(true)
                      fetchSuggestions(e.target.value)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for properties, locations, or authors..."
                    className="search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="clear-search"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button type="submit" className="search-submit">
                  Search
                </button>
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.titles && suggestions.titles.length > 0 && (
                    <div className="suggestion-section">
                      <h4>Posts</h4>
                      {suggestions.titles.map((item, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(item.title)}
                        >
                          📄 {item.title}
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestions.authors && suggestions.authors.length > 0 && (
                    <div className="suggestion-section">
                      <h4>Authors</h4>
                      {suggestions.authors.map((author, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(author)}
                        >
                          👤 {author}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="search-results">
            <div className="results-header">
              <h2 className="page-title">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Search"}
              </h2>
              {!loading && (
                <p className="results-count">
                  Found {pagination.total} result{pagination.total !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
                <button onClick={() => window.location.reload()} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}

            {!loading && posts.length === 0 && !error && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No results found for "{searchQuery}"</h3>
                <p>Try searching with different keywords or browse all posts</p>
                <Link href="/" className="browse-all-btn">
                  Browse All Posts
                </Link>
              </div>
            )}

            <div className="posts-grid">
              {posts.map((post) => (
                <Link 
                  key={post._id} 
                  href={`/post/${post._id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <article className="post-card">
                    {post.imageUrl && (
                      <div className="post-image">
                        {/* Using regular img tag instead of Next.js Image */}
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
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
                        <span className="read-more">
                          Read More →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {pagination.hasMore && posts.length > 0 && (
              <div className="load-more-container">
                <button onClick={loadMore} className="load-more-btn">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>© Real Estate Blog</p>
        </footer>
      </div>
    </>
  )
}