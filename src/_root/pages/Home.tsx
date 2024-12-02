import HistoryList from '../../components/overview/HistoryList'
import ReservationsChart from '../../components/overview/ReservationsChart'
import TopActions from '../../components/overview/TopActions'
import TopUsers from '../../components/overview/TopUsers'
import VisitorsChart from '../../components/overview/VisitorsChart'

import { useTranslation } from 'react-i18next';
import 'i18next'
import i18next from 'i18next'


const Home = () => {



  const { t } = useTranslation();

  console.log('Home')
  return (
    <div className={i18next.language === 'ar' ?'rtl':''}>
      <div className='mb-4 ml-4'>
        <h1>
          {t('overview.headline') + ' Alfred'} 
          {/* Hello, Alfred */}
        </h1>
        <p className='text-subblack'>
          {t('overview.subtitle')}
          {/* Here’s what’s happening with your business today. */}
        </p>
      </div>
      <div className='flex flex-col gap-[10px]'>
        <div className='flex gap-[10px] lt-sm:flex-col'>
          <ReservationsChart />
          <HistoryList /> 
        </div>
        <div className='flex gap-[10px] lt-sm:flex-col lt-sm:w-full'>
          <VisitorsChart />
          <TopActions />
          <TopUsers />
        </div>
      </div>
    </div>
  )
}

export default Home
