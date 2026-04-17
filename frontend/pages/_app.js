import '../styles/globals.css'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../components/ErrorBoundary'
import PageLoader from '../components/PageLoader'

// Global SEO component that works with router
function GlobalSEO() {
  const router = useRouter()
  const { q } = router.query
  
  let seoTitle = 'Luxury Real Estate Blog'
  let seoDescription = 'Discover expert insights about luxury real estate investments, property management, and home buying tips.'
  let seoKeywords = 'real estate, luxury homes, property investment, real estate blog, property management'
  
  // Customize for search page
  if (router.pathname === '/search' && q) {
    seoTitle = `Search Results for "${q}" | Luxury Real Estate Blog`
    seoDescription = `Found search results for "${q}". Discover real estate insights, property tips, and market trends on Luxury Real Estate Blog.`
    seoKeywords = `${q}, real estate search, property search, luxury homes, real estate insights`
  }
  
  // Customize for create post page
  if (router.pathname === '/create') {
    seoTitle = `Create New Post | Luxury Real Estate Blog`
    seoDescription = `Share your real estate insights, property tips, and market analysis with our community.`
  }
  
  // Customize for login page
  if (router.pathname === '/login') {
    seoTitle = `Login | Luxury Real Estate Blog`
    seoDescription = `Login to your account to manage your property insights and engage with the community.`
  }
  
  // Customize for register page
  if (router.pathname === '/register') {
    seoTitle = `Register | Luxury Real Estate Blog`
    seoDescription = `Create a free account to share property insights and join our real estate community.`
  }
  
  // Customize for my posts page
  if (router.pathname === '/my-posts') {
    seoTitle = `My Posts | Luxury Real Estate Blog`
    seoDescription = `Manage your property insights and track your contributions to the community.`
  }
  
  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content="Luxury Real Estate Blog" />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content="https://res.cloudinary.com/demo/image/upload/v1312461206/sample.jpg" />
      <meta property="og:site_name" content="Luxury Real Estate Blog" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content="https://res.cloudinary.com/demo/image/upload/v1312461206/sample.jpg" />
      <link rel="canonical" href={`https://yourdomain.com${router.asPath}`} />
    </Head>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalSEO />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <meta name="theme-color" content="#667eea" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ErrorBoundary>
        <PageLoader />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
          }}
        />
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  )
}