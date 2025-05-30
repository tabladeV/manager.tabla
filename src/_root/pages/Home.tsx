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
import { useDarkContext } from '../../context/DarkContext'


const Home = () => {

  useEffect(() => {
    document.title = `Tabla | Taste Morocco's Best`
  }, [])

  const { data, isLoading, error } = useList({
    resource: 'api/v1/bo/restaurants/users/me/',
    queryOptions: {
      onSuccess: (data: any) => {
        console.log("is_manager", data.data.is_manager)
        localStorage.setItem("is_manager", data.data.is_manager);
      },
    }
  },
  )

  const [user, setUser] = useState<any>()

  useEffect(() => {
    setUser(data?.data)
  }, [data])

  const { darkMode } = useDarkContext();
  const { t } = useTranslation();

  return (
    <div className={i18next.language === 'ar' ? 'rtl' : ''}>

      <div className='mb-4 ml-4'>
        <h1>
          {t('overview.headline') + ' ' + (user ? user.first_name : '')}
        </h1>
        <p className="text-subblack dark:text-softwhitetheme">
          {t('overview.subtitle')}
          {/* Here's what's happening with your business today. */}
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-[10px]'>
        <div className='md:col-span-4 lg:col-span-2'>
          <ReservationsChart />
        </div>
        <div className='md:col-span-2 lg:col-span-1'>
          <HistoryList />
        </div>
        <div className='md:col-span-2 lg:col-span-1'>
          <TopActions />
        </div>
        <div className='md:col-span-2 lg:col-span-1'>
          <TopUsers />
        </div>
        <div className='md:col-span-2 lg:col-span-1'>
          <VisitorsChart />
        </div>
      </div>
    </div>
  )
}

export default Home
