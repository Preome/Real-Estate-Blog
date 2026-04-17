import '../styles/globals.css'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '../components/ErrorBoundary'
import PageLoader from '../components/PageLoader'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  )
}