import { getProducts, Product } from '@stripe/firestore-stripe-payments'
import Head from 'next/head'
import { useRecoilValue } from 'recoil'
import { modalState, movieState } from '../atoms/modalAtom.'
import Banner from '../components/Banner'
import Header from '../components/Header'
import Modal from '../components/Modal'
import Plans from '../components/Plans'
import Row from '../components/Row'
import useAuth from '../hooks/useAuth'
import useSubscription from '../hooks/useSubscription'
import payments from '../lib/stripe'
import { Movie } from '../typings'
import requests from '../utils/requests'

interface Props {
  netflixOriginals: Movie[]
  trendingNow: Movie[]
  topRated: Movie[]
  actionMovies: Movie[]
  comedyMovies: Movie[]
  horrorMovies: Movie[]
  romanceMovies: Movie[]
  documentaries: Movie[]
  products: Product[]
}

const Home = ({
  netflixOriginals,
  actionMovies,
  comedyMovies,
  documentaries,
  horrorMovies,
  romanceMovies,
  topRated,
  trendingNow,
  products,
}: Props) => {
  const { user, loading } = useAuth()
  const subscription = useSubscription(user)
  const showModal = useRecoilValue(modalState)
  const movie = useRecoilValue(movieState)

  if (loading || subscription === null) return null
  console.log(subscription)

  if (!subscription) return <Plans products={products} />

  return (
    <div
      className={`relative h-screen bg-gradient-to-b from-gray-900/10 to-[#010511] ${
        showModal && 'overflow-hidden'
      }`}
    >
      <Head>
        <title>
          {movie?.title || movie?.original_name || 'Home'} - Netflix
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="pl-7 pb-24 lg:space-y-24 lg:pl-16 ">
        {/* <Banner netflixOriginals={netflixOriginals} /> */}

        <section className="space-y-12 md:space-y-24">
          <Row title="Trending Now" movies={trendingNow} index={0} />
          <Row title="Top Rated" movies={topRated} index={1} />
          <Row title="Action Thrillers" movies={actionMovies} index={2} />
          <Row title="Comedies" movies={comedyMovies} index={3} />
          <Row title="Scary Movies" movies={horrorMovies} index={4} />
          <Row title="Romance Movies" movies={romanceMovies} index={5} />
          <Row title="Documentaries" movies={documentaries} index={6} />
        </section>
      </main>
      {showModal && <Modal />}
    </div>
  )
}

export default Home

export const getServerSideProps = async () => {
  const products = await getProducts(payments, {
    includePrices: true,
    activeOnly: true,
  })
    .then((res) => res)
    .catch((error) => console.log(error.message))

  const [
    netflixOriginalsRes,
    trendingNowRes,
    topRatedRes,
    actionMoviesRes,
    comedyMoviesRes,
    horrorMoviesRes,
    romanceMoviesRes,
    documentariesRes,
  ] = await Promise.all([
    fetch(requests.fetchNetflixOriginals),
    fetch(requests.fetchTrending),
    fetch(requests.fetchTopRated),
    fetch(requests.fetchActionMovies),
    fetch(requests.fetchComedyMovies),
    fetch(requests.fetchHorrorMovies),
    fetch(requests.fetchRomanceMovies),
    fetch(requests.fetchDocumentaries),
  ])
  const [
    netflixOriginals,
    trendingNow,
    topRated,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    documentaries,
  ] = await Promise.all([
    netflixOriginalsRes.json(),
    trendingNowRes.json(),
    topRatedRes.json(),
    actionMoviesRes.json(),
    comedyMoviesRes.json(),
    horrorMoviesRes.json(),
    romanceMoviesRes.json(),
    documentariesRes.json(),
  ])

  return {
    props: {
      netflixOriginals: netflixOriginals.results,
      trendingNow: trendingNow.results,
      topRated: topRated.results,
      actionMovies: actionMovies.results,
      comedyMovies: comedyMovies.results,
      horrorMovies: horrorMovies.results,
      romanceMovies: romanceMovies.results,
      documentaries: documentaries.results,
      products,
    },
  }
}
