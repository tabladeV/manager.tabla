import HistoryList from '../../components/overview/HistoryList'
import ReservationsChart from '../../components/overview/ReservationsChart'
import TopActions from '../../components/overview/TopActions'
import TopUsers from '../../components/overview/TopUsers'
import VisitorsChart from '../../components/overview/VisitorsChart'

const Home = () => {

  console.log('Home')
  return (
    <div>
      <div className='mb-4 ml-4'>
        <h1>
          Hello, Alfred
        </h1>
        <p className='text-subblack'>
          Control your reservation, client, and more...
        </p>
      </div>
      <div className='flex flex-col gap-[10px]'>
        <div className='flex gap-[10px]'>
          <ReservationsChart />
          <HistoryList /> 
        </div>
        <div className='flex gap-[10px]'>
          <VisitorsChart />
          <TopActions />
          <TopUsers />
        </div>
      </div>
    </div>
  )
}

export default Home
