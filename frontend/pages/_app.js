import '../styles/globals.css'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../components/ErrorBoundary'
import PageLoader from '../components/PageLoader'

// Global SEO component
function GlobalSEO() {
  const router = useRouter()
  const { q } = router.query
  
  let seoTitle = 'Habitat Horizon Real Estate Blog'
  let seoDescription = 'Discover expert insights about Habitat Horizon Real estate investments, property management, and home buying tips.'
  
  if (router.pathname === '/search' && q) {
    seoTitle = `Search Results for "${q}" | Habitat Horizon Real Estate Blog`
    seoDescription = `Found search results for "${q}". Discover real estate insights, property tips, and market trends.`
  }
  
  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
      <meta name="theme-color" content="#667eea" />
    </Head>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalSEO />
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