import React from 'react'
import { useTranslation } from 'react-i18next';
import { format, set, subDays, subMonths } from 'date-fns';
import IntervalCalendar from '../Calendar/IntervalCalendar';
import { Console } from 'console';
interface FilterProps {
    onClick: (range: string) => void;
}

const Filter = (props:FilterProps) => {
    const { t } = useTranslation();
    const [showFilter, setShowFilter] = React.useState(false);
    // const handleDateRangeClick = () => {
    //   const start = format(subDays(new Date(), 0), 'yyyy-MM-dd');
    //   const end = format(new Date(), 'yyyy-MM-dd');
    //   props.onClick({ start, end });
    // };

    const last7Days = () => {
      // const start = format(subDays(new Date(), 3), 'yyyy-MM-dd');
      // const end = format(new Date(), 'yyyy-MM-dd');
      props.onClick('last_7_days');
      // console.log(start, end);
      setShowFilter(false);
    };

    const lastMonth = () => {
      // const start = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      // const end = format(new Date(), 'yyyy-MM-dd');
      props.onClick('last_month');
      setShowFilter(false);

    };

    const lastYear = () => {
      // const start = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      // const end = format(new Date(), 'yyyy-MM-dd');
      props.onClick('last_year');
      setShowFilter(false);

    };

    const [selection, setSelection] = React.useState(false);

    // const handleDateClick = (range: { start: Date, end: Date }) => {
    //   const start = format(range.start, 'yyyy-MM-dd');
    //   const end = format(range.end, 'yyyy-MM-dd');
    //   props.onClick({ start, end });
    //   setShowFilter(false);
    //   setSelection(false);
    //   console.log(start, end);

    // }

    // const rangeOfDays = () => {
    //   setSelection(true);
    //   setShowFilter(false);
    // }

    
  return (
    <div className='relative'>
        {/* {selection && 
          <div>
            <div className='overlay' onClick={()=>{setSelection(false)}}/>
            <div className={`popup lt-sm:w-full h-[50vh] lt-sm:h-[70vh] z-[250] lt-sm:bottom-0 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
              <IntervalCalendar onRangeSelect={handleDateClick} />
            </div>
          </div>
        } */}
        {showFilter && 
            <div>
                <div className='overlay bg-transparent' onClick={()=>{setShowFilter(false)}}/>
                <div className={`absolute w-[11em] flex flex-col p-2 rounded-md ml-[-5.8em] justify-between items-start mt-[2.6em] z-[230]  ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`}>
                    {/* <div onClick={rangeOfDays} className='items-center w-full cursor-pointer hover:opacity-70 p-1 flex gap-2 justify-start'>Select date range</div> */}
                    <div onClick={last7Days} className='items-center w-full cursor-pointer hover:opacity-70 p-1 flex gap-2 justify-start'>{t('export.lastWeek')}</div>
                    <div onClick={lastMonth} className='items-center w-full cursor-pointer hover:opacity-70 p-1 flex gap-2 justify-start'>{t('export.lastMonth')}</div>
                    <div onClick={lastYear} className='items-center w-full cursor-pointer hover:opacity-70 p-1 flex gap-2 justify-start'>{t('export.lastYear')}</div>
                </div>
            </div>
        }
      <button onClick={()=>{setShowFilter(true)}} className={`text-sm btn flex items-center gap-2 font-[600] text-subblack ${localStorage.getItem('darkMode')==='true'?'border-none bg-darkthemeitems text-white':''}`}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M1.375 2.0625C1.375 1.88016 1.44743 1.7053 1.57636 1.57636C1.7053 1.44743 1.88016 1.375 2.0625 1.375H8.9375C9.11984 1.375 9.2947 1.44743 9.42364 1.57636C9.55257 1.7053 9.625 1.88016 9.625 2.0625V3.01858C9.62495 3.26168 9.52834 3.4948 9.35642 3.66667L6.875 6.14808V9.55075C6.87501 9.6367 6.85305 9.72122 6.81121 9.7963C6.76936 9.87137 6.70902 9.9345 6.63591 9.97968C6.5628 10.0249 6.47935 10.0506 6.39349 10.0545C6.30763 10.0583 6.2222 10.0402 6.14533 10.0017L4.44171 9.15017C4.34654 9.10259 4.26651 9.02945 4.21057 8.93894C4.15463 8.84844 4.125 8.74415 4.125 8.63775V6.14808L1.64358 3.66667C1.47166 3.4948 1.37505 3.26168 1.375 3.01858V2.0625Z" fill={localStorage.getItem('darkMode')==='true' ? '#ffffff':'#1e1e1e80'} fillOpacity="1"/>
        </svg>
        {t('overview.buttons.filter')}
      </button>
    </div>
  )
}

export default Filter
