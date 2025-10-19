import React, { useState, useEffect, memo } from 'react';
import { compareAsc, format, startOfDay } from 'date-fns';
import OurCalendar from '../Calendar/OurCalendar';
import { useList } from '@refinedev/core';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

// #region Types
type SelectedData = {
  reserveDate: string;
  time: string;
  guests: number;
};

type ReservationProcessProps = {
  onClick: () => void;
  getDateTime: (data: SelectedData) => void;
  maxGuests?: number;
  minGuests?: number;
  resData?: SelectedData;
};

export type AvailableDate = {
  day: number;
  isAvailable: boolean;
};

type GroupedTimeSlots = {
  [category: string]: string[];
};

type Tab = 'date' | 'guests' | 'time' | 'confirm';

const FORM_DATA_KEY = 'tabla_widget_form_data'
const RESERVATION_DATA_KEY = 'tabla_widget_reservation_data'
// #endregion

// #region Sub-components

const SkeletonLoader = memo(() => (
  <div className="animate-pulse">
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, index) => (
        <div key={index} className="h-[40px] bg-gray-200 rounded-md"></div>
      ))}
    </div>
  </div>
));

const TimeSkeletonLoader = memo(() => (
  <div className="animate-pulse flex flex-wrap justify-center gap-[10px] p-[20px]">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="h-[65px] w-[65px] bg-gray-200 dark:bg-darkthemeitems rounded-md"></div>
    ))}
  </div>
));

const EmptyState = memo(({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-[200px] p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="mt-2 text-gray-500 text-center">{message}</p>
  </div>
));

const TabNavigation = memo(({ activeTab, onTabClick }: { activeTab: Tab | null, onTabClick: (tab: Tab) => void }) => {
  const { t } = useTranslation();
  const tabs: Tab[] = ['date', 'guests', 'time'];
  return (
    <div className="flex justify-center gap-5 mt-[1em]">
      {tabs.map(tab => (
        <span
          key={tab}
          className={`${activeTab === tab ? 'activetabb' : 'p-[10px]'} cursor-pointer select-none`}
          onClick={() => onTabClick(tab)}
          id={tab}
        >
          {t(`reservationWidget.reservation.${tab}`)}
        </span>
      ))}
    </div>
  );
});

const DateStep = memo(({ selectedDate, onDateClick, availableDates, loading, onMonthChange }: any) => {
  const { t } = useTranslation();
  return (
    <div className="content">
      <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
        {selectedDate ? <>{format(selectedDate, 'dd MMMM yyyy')} <span className="font-semibold">{t("reservationProcess.hasBeenSelected")}</span></> : <span className="font-semibold">{t("reservationProcess.selectDate")}</span>}
      </div>
      <OurCalendar
        forbidden={true}
        value={selectedDate}
        onClick={onDateClick}
        availableDays={availableDates}
        loading={loading}
        onMonthChange={onMonthChange}
      />
    </div>
  );
});

const GuestStep = memo(({ selectedGuests, onGuestClick, maxGuests }: any) => {
  const { t } = useTranslation();
  return (
    <div className="content">
      <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
        {selectedGuests ?
          <>{selectedGuests} <span className="font-semibold">{t("reservationProcess.guests")} {t("reservationProcess.haveBeenSelected")}</span></> :
          <><span className="font-semibold">{t("reservationProcess.chooseNumberOfGuests")}</span></>
        }
      </div>
      <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
        {[...Array(maxGuests ? maxGuests : 15)].map((_, index) => (
          <button
            className={`text-15 hover:bg-[#335a06] hover:text-white font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-[#335A06] ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ' text-blacktheme'} ${selectedGuests === index + 1 ? 'bg-black text-white' : ''}`}
            key={index}
            onClick={() => onGuestClick(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
});

const TimeStep = memo(({ selectedTime, onTimeClick, availableTimes, loading, selectedDate, selectedGuests }: any) => {
  const { t } = useTranslation();
  return (
    <div className="content">
      <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
        {selectedTime ?
          <>{selectedTime} <span className="font-semibold">{t("reservationProcess.hasBeenSelected")}</span></> :
          <><span className="font-semibold">{t("reservationProcess.availableTimes")}</span></>
        }
      </div>
      {loading ? (
        <TimeSkeletonLoader />
      ) : Object.keys(availableTimes).length === 0 ? (
        <EmptyState message={`No available time slots for this date ${selectedDate ? format(selectedDate, 'dd MMMM yyyy') : ''} and number of guests ${selectedGuests || ''}`} />
      ) : (
        <div className="flex flex-col min-h-[200px] overflow-y-auto max-h-[400px] p-[20px] rounded-[3px]">
          {Object.entries(availableTimes).map(([category, times]) => (
            <div key={category} className="mb-4">
              {(times as Array<string>)?.length > 0 && <h3 className="text-left text-lg font-semibold mb-2 text-[#335A06] border-b border-[#335A06] pb-1">{category}</h3>}
              <div className="flex flex-wrap justify-start gap-[10px]">
                {(times as Array<string>).map((time: string, index: number) => {
                  const now = new Date();
                  const isToday = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                  const [hour, minute] = time.split(':').map(Number);
                  const isPastTime = isToday && (hour < now.getHours() || (hour === now.getHours() && minute < now.getMinutes()));

                  return (
                    <button
                      onClick={() => !isPastTime && onTimeClick(time)}
                      className={`text-15 ${isPastTime ? 'bg-softwhitetheme text-subblack cursor-not-allowed' : 'hover:bg-[#335a06] hover:text-white'} font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-[#335A06] ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ' text-blacktheme'} ${selectedTime === time ? 'bg-black text-white' : ''}`}
                      key={index}
                      disabled={!!isPastTime}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const ConfirmStep = memo(({ selectedDate, selectedTime, selectedGuests, onConfirmClick }: any) => {
  const { t } = useTranslation();
  return (
    <div className="content">
      <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
        <span className='font-[500] mr-2'>{t("reservationProcess.yourReservationIsSetFor")}</span> {selectedDate && format(selectedDate, 'dd/MM/yyyy')} <span className="font-semibold mx-2">{t("reservationProcess.at")}</span>
        {selectedTime} <span className="font-semibold mx-2">{t("reservationProcess.for")}</span>
        {selectedGuests} <span className="font-semibold">{t("reservationProcess.guests")}</span>
      </div>
      <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
        <button onClick={onConfirmClick} className="btn-primary">
          {t("reservationProcess.confirm")}
        </button>
      </div>
    </div>
  );
});

// #endregion

const WidgetReservationProcess: React.FC<ReservationProcessProps> = (props) => {
  const [activeTab, setActiveTab] = useState<Tab | null>('date');
  const [isExiting, setIsExiting] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(props?.resData?.reserveDate ? new Date(props.resData.reserveDate) : null);
  const [selectedTime, setSelectedTime] = useState<string | null>(props?.resData?.time as string || null);
  const [selectedGuests, setSelectedGuests] = useState<number | null>(Number(props?.resData?.guests) || null);
  const [selectedData, setSelectedData] = useState<SelectedData>(props.resData || { reserveDate: '', time: '', guests: 0 });
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [availableTimes, setAvailableTimes] = useState<GroupedTimeSlots>({});
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const { data: dates, isFetching: loadingDates } = useList({
    resource: `api/v1/bo/subdomains/availability/${currentMonth}/`,
  });

  const { data: times, isFetching: timesLoading } = useList({
    resource: 'api/v1/bo/subdomains/availability/time-slots/',
    filters: [
      { field: 'date', operator: 'eq', value: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null },
      { field: 'number_of_guests', operator: 'eq', value: Number(selectedGuests || 0) }
    ],
    queryOptions: {
      enabled: !!(selectedDate && selectedGuests),
      onSuccess: (data) => setAvailableTimes(data?.data as unknown as GroupedTimeSlots || {}),
      onError: (error) => {
        console.error("Error fetching available times:", error);
        setAvailableTimes({});
      },
    }
  });

  useEffect(() => {
    if (dates && !loadingDates) {
      setAvailableDates(dates?.data as AvailableDate[]);
    }
  }, [dates, loadingDates]);

  const changeTab = (newTab: Tab) => {
    if (activeTab === newTab) return;
    setIsContentVisible(false);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsContentVisible(true);
    }, 150); // Duration of the fade-out transition
  };

  const handleDateClick = useDebouncedCallback((day: Date) => {
    setSelectedDate(day);
    setSelectedData({ reserveDate: format(day, 'yyyy-MM-dd'), time: '', guests: 0 });
    setSelectedTime(null);
    setSelectedGuests(null);
    setAvailableTimes({});
    changeTab('guests');
  }, 300);

  const handleGuestClick = useDebouncedCallback((guest: number) => {
    setSelectedGuests(guest);
    setSelectedData((prevData) => ({ ...prevData, guests: guest }));
    setAvailableTimes({});
    setSelectedTime(null);
    changeTab('time');
  }, 300);

  const handleTimeClick = useDebouncedCallback((time: string) => {
    setSelectedTime(time);
    setSelectedData((prevData) => ({ ...prevData, time }));
    changeTab('confirm');
  }, 300);

  const handleClose = useDebouncedCallback(() => {
    setIsExiting(true);
    setTimeout(props.onClick, 300); // Match duration of exit animation
  }, 300);

  const handleConfirmClick = useDebouncedCallback(() => {
    props.getDateTime(selectedData);
    handleClose();
  }, 300);

  // Check if cached reservation data is in the past and clear if needed
  useEffect(() => {
    const validateCachedReservation = () => {
      // Only run validation if we have cached reservation data
      if (props.resData?.reserveDate) {
        const now = new Date();
        const reservationDate = new Date(props.resData.reserveDate);
        
        // Check if date is in the past
        if (compareAsc(startOfDay(reservationDate), startOfDay(now)) < 0) {
          // Date is in the past - reset all data
          setSelectedDate(null);
          setSelectedTime(null);
          setSelectedGuests(null);
          setSelectedData({ reserveDate: '', time: '', guests: 0 });
          return true; // Indicates we've reset the data
        }
        
        // Check if the date is today but time is in the past
        if (format(reservationDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && 
            props.resData.time) {
          const [hours, minutes] = props.resData.time.split(':').map(Number);
          const isPastTime = hours < now.getHours() || 
                            (hours === now.getHours() && minutes < now.getMinutes());
          
          if (isPastTime) {
            // Time is in the past - reset all data
            setSelectedDate(null);
            setSelectedTime(null);
            setSelectedGuests(null);
            setSelectedData({ reserveDate: '', time: '', guests: 0 });
            return true; // Indicates we've reset the data
          }
        }
      }
      return false; // No reset needed
    };

    const wasReset = validateCachedReservation();
    
    // If we reset the data, set activeTab back to 'date'
    if (wasReset) {
      setActiveTab('date');
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(RESERVATION_DATA_KEY);
    }
  }, [props.resData]); // Only run when props.resData changes


  const handleMonthChange = useDebouncedCallback((newMonth: string) => {
    setCurrentMonth(newMonth);
    setAvailableDates([]);
  }, 300);


  const renderContent = () => {
    switch (activeTab) {
      case 'date':
        return <DateStep selectedDate={selectedDate} onDateClick={handleDateClick} availableDates={availableDates} loading={loadingDates} onMonthChange={handleMonthChange} />;
      case 'guests':
        return <GuestStep selectedGuests={selectedGuests} onGuestClick={handleGuestClick} maxGuests={props.maxGuests} />;
      case 'time':
        return <TimeStep selectedTime={selectedTime} onTimeClick={handleTimeClick} availableTimes={availableTimes} loading={timesLoading} selectedDate={selectedDate} selectedGuests={selectedGuests} />;
      case 'confirm':
        return <ConfirmStep selectedDate={selectedDate} selectedTime={selectedTime} selectedGuests={selectedGuests} onConfirmClick={handleConfirmClick} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`overlay z-[300] glassmorphism transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose}></div>
      <div className={`popup z-[360] sm:w-[30em] lt-sm:bottom-0 lt-sm:w-full rounded-[10px] transition-all duration-300 ease-out ${isExiting ? 'opacity-0 translate-y-full' : 'opacity-100 lg:translate-y-[-50%] xl:translate-y-[-50%] md:translate-y-[-50%] translate-x-[-50%]'} ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <TabNavigation activeTab={activeTab} onTabClick={changeTab} />
        <div className={`transition-opacity duration-150 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default WidgetReservationProcess;
