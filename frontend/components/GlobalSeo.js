import Head from 'next/head'
import { useRouter } from 'next/router'

export default function GlobalSEO() {
  const router = useRouter()
  const { q } = router.query
  
  // Get the data from the page props if available
  let seoTitle = 'Habitat Horizon Real Estate Blog'
  let seoDescription = 'Discover expert insights about Habitat Horizon Real estate investments, property management, and home buying tips.'
  
  if (router.pathname === '/search' && q) {
    seoTitle = `Search Results for "${q}" | Habitat Horizon Real Estate Blog`
    seoDescription = `Search results for "${q}" on Habitat Horizon Real Estate Blog. Find real estate insights, property tips, and market trends.`
  }
  
  return (
    <Head>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content="real estate, luxury homes, property investment, Real Estate Blog" />
      <meta name="author" content="Habitat Horizon Real Estate Blog" />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content="https://res.cloudinary.com/demo/image/upload/v1312461206/sample.jpg" />
      <meta property="og:site_name" content="Habitat Horizon Real Estate Blog" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <link rel="canonical" href={`https://yourdomain.com${router.asPath}`} />
    </Head>
  )
}