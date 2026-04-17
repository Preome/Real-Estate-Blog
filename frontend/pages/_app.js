import '../styles/globals.css'
import Head from 'next/head'  // Add this import
import { Toaster } from 'react-hot-toast'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Toaster position="top-right" />
      <Component {...pageProps} />
    </>
  )
}