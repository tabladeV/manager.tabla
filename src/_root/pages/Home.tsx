import HistoryList from '../../components/overview/HistoryList'
import ReservationsChart from '../../components/overview/ReservationsChart'
import TopActions from '../../components/overview/TopActions'
import TopUsers from '../../components/overview/TopUsers'
import VisitorsChart from '../../components/overview/VisitorsChart'

import { useTranslation } from 'react-i18next';
import 'i18next'
import i18next from 'i18next'
import { useEffect, useState } from 'react'
import { useList } from '@refinedev/core'


const Home = () => {

  useEffect(() => {
    document.title = `Tabla | taste Morocco's best`
  }, [])

  const { data, isLoading, error } = useList({
    resource: 'api/v1/bo/restaurants/users/me/',
    queryOptions: {
      onSuccess: (data: any) => {
        console.log(' onSuccess data.is_manager', data)
        localStorage.setItem("is_manager", data.is_manager);
        if (data.is_manager) {
          localStorage.setItem("is_manager", "true");
          console.log(' if is_manager', data.is_manager)
        }

      },
    }
  },
  )

  const [user, setUser] = useState<any>()

  useEffect(() => {
    setUser(data?.data)


  }, [data])




  const { t } = useTranslation();

  return (
    <div className={i18next.language === 'ar' ? 'rtl' : ''}>

      <div className='mb-4 ml-4'>
        <h1>
          {t('overview.headline') + ' ' + (user ? user.first_name : '')}
        </h1>
        <p className={` ${localStorage.getItem('darkMode') === 'true' ? ' text-softwhitetheme' : 'text-subblack'}`}>
          {t('overview.subtitle')}
          {/* Here’s what’s happening with your business today. */}
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-[10px]'>
        <div className='md:col-span-2'>
          <ReservationsChart />
        </div>
        <div className='md:col-span-1'>
          <HistoryList />
        </div>
        <div className='md:col-span-1'>
          <TopActions />
        </div>
        <div className='md:col-span-1'>
          <TopUsers />
        </div>
        <div className='md:col-span-1'>
          <VisitorsChart />
        </div>
      </div>
    </div>
  )
}

export default Home
