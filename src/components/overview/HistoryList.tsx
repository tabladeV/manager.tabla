import { useTranslation } from "react-i18next"
const HistoryList  = () => {

  const { t } = useTranslation()

  const data = [
    {
      name: 'Angel Di Maria',
      status: 'Confirmed',
      time: '18:45 pm 15 Dec 2024',
      color: 'bg-greentheme'
    },
    {
      name: 'Leonardo Bonucci',
      status: 'Canceled',
      time: '18:45 pm 15 Dec 2024',
      color: 'bg-redtheme'

    },
    {
      name: 'Lionel Messi',
      status: 'Confirmed',
      time: '18:45 pm 15 Dec 2024',
      color: 'bg-bluetheme'
    },
    {
      name: 'Cristiano Ronaldo',
      status: 'Confirmed',
      time: '18:45 pm 15 Dec 2024',
      color: 'bg-yellowtheme'
    },
    {
      name: 'Kylian Mbappe',
      status: 'Canceled',
      time: '18:45 pm 15 Dec 2024',
      color: 'bg-redtheme'
    }
  ]

  console.log(Math.floor(Math.random()*1000)+122202)
  return (
    <div className={`bg-white rounded-[20px] w-2/5 no-scrollbar lt-sm:w-full overflow-y-auto h-[400px]`}>
      <div className='flex justify-between items-center p-4'>
        <h1 className='text-xl font-bold'>{t('overview.history.title')}</h1>
        <button className='text-sm btn flex items-center gap-2 font-[600] text-subblack'>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.375 2.0625C1.375 1.88016 1.44743 1.7053 1.57636 1.57636C1.7053 1.44743 1.88016 1.375 2.0625 1.375H8.9375C9.11984 1.375 9.2947 1.44743 9.42364 1.57636C9.55257 1.7053 9.625 1.88016 9.625 2.0625V3.01858C9.62495 3.26168 9.52834 3.4948 9.35642 3.66667L6.875 6.14808V9.55075C6.87501 9.6367 6.85305 9.72122 6.81121 9.7963C6.76936 9.87137 6.70902 9.9345 6.63591 9.97968C6.5628 10.0249 6.47935 10.0506 6.39349 10.0545C6.30763 10.0583 6.2222 10.0402 6.14533 10.0017L4.44171 9.15017C4.34654 9.10259 4.26651 9.02945 4.21057 8.93894C4.15463 8.84844 4.125 8.74415 4.125 8.63775V6.14808L1.64358 3.66667C1.47166 3.4948 1.37505 3.26168 1.375 3.01858V2.0625Z" fill="#1E1E1E" fill-opacity="0.5"/>
          </svg>
          {t('overview.buttons.filter')}
        </button>
      </div>
      <div className='flex flex-col gap-4 p-2'>
        {data.map((item, index) => (
          <div key={index} className='flex justify-between items-center p-1 rounded-lg hover:bg-[#00000003] '>
          <div className='flex items-center gap-2'>
            <div className={`w-10 h-10 ${item.color} flex justify-center items-center rounded-full text-white`}>{item.name.slice(0,1)}</div>
            <h3 className='text-md'>{item.name}</h3>
          </div>
          <div className="flex flex-col items-end">
            <p className={`text-sm font-[600] ${item.status === 'Confirmed' ? 'bg-softgreentheme text-greentheme' : 'bg-softredtheme text-redtheme'} px-2 py-1 rounded-[10px]`}>
              {item.status}
            </p>
            <p className='text-[12px] text-subblack'>{item.time}</p>
          </div>
        </div>
        ))}
        

      </div>
    </div>
  )
}

export default HistoryList
