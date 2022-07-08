import '../styles/globals.css'
import Link from 'next/link'
import Nav from './Nav'

function MyApp({ Component, pageProps }) {
  return(
    <div>
    <Nav/>
    <Component {...pageProps} />

</div>
  )
  

}

export default MyApp
