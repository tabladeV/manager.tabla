import HistoryList from '../../components/overview/HistoryList'

const Home = () => {

  console.log('Home')
  return (
    <div>
      <div>
        <h1>
          Hello, Alfred
        </h1>
        <p className='text-subblack'>
          Control your reservation, client, and more...
        </p>
      </div>
      <div className=''>
        <div className='flex h-[20em] gap-[10px]'>
          {/* <ReservationsChart /> */}
          <HistoryList /> 
        </div>
      </div>
    </div>
  )
}

export default Home
