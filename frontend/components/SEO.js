import Head from 'next/head'
import { useRouter } from 'next/router'

export default function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  author,
  publishedTime,
  modifiedTime,
  type = 'article'
}) {
  const router = useRouter()
  const siteTitle = 'Luxury Real Estate Blog'
  const siteDescription = 'Discover expert insights about luxury real estate investments, property management, and home buying tips.'
  const siteUrl = `https://yourdomain.com${router.asPath}`
  const defaultImage = 'https://res.cloudinary.com/demo/image/upload/v1312461206/sample.jpg'
  const twitterHandle = '@realestateblog'

  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const metaDescription = description || siteDescription
  const metaKeywords = keywords || 'real estate, luxury homes, property investment, real estate blog, property management'
  const metaImage = image || defaultImage
  const metaUrl = url || siteUrl

  return (
    <Head>
      {/* Basic Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={author || 'Real Estate Blog Team'} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="UTF-8" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:creator" content={twitterHandle} />
      
      {/* Article Specific */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime} />
          <meta property="article:author" content={author || 'Real Estate Blog'} />
        </>
      )}
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={metaUrl} />
      
      {/* Structured Data for Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": siteTitle,
            "description": siteDescription,
            "url": siteUrl,
            "publisher": {
              "@type": "Organization",
              "name": "Luxury Real Estate Blog"
            }
          })
        }}
      />
    </Head>
  )
}