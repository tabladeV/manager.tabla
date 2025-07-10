import React, { useState, useEffect } from 'react';
import { format, set } from 'date-fns';
import OurCalendar from '../Calendar/OurCalendar';
import { useCustom, useList } from '@refinedev/core';
import BaseBtn from '../common/BaseBtn';
import { useTranslation } from 'react-i18next';
// Import the actual useCustom hook instead of using the mock implementation


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

// Add a new type for grouped time slots
type GroupedTimeSlots = {
  [category: string]: string[];
};

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, index) => (
        <div key={index} className="h-[40px] bg-gray-200 rounded-md"></div>
      ))}
    </div>
  </div>
);

const TimeSkeletonLoader = () => (
  <div className="animate-pulse flex flex-wrap justify-center gap-[10px] p-[20px]">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="h-[65px] w-[65px] bg-gray-200 dark:bg-darkthemeitems rounded-md"></div>
    ))}
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-[200px] p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="mt-2 text-gray-500 text-center">{message}</p>
  </div>
);

const WidgetReservationProcess: React.FC<ReservationProcessProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'date' | 'guest' | 'time' | 'confirm' | null>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(props?.resData?.reserveDate ? new Date(props.resData.reserveDate) : null);
  const [selectedTime, setSelectedTime] = useState<string | null>(props?.resData?.time as string);
  const [selectedGuests, setSelectedGuests] = useState<any>(props?.resData?.guests as number | null);
  const [numberGuests, setNumberGuests] = useState<any>(props?.resData?.guests as number | null);
  const [selectedData, setSelectedData] = useState<SelectedData>({
    reserveDate: '',
    time: '',
    guests: 0,
  });
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  // Update available times to use the new grouped structure
  const [availableTimes, setAvailableTimes] = useState<GroupedTimeSlots>({});
  const [loadingTimes, setLoadingTimes] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Remove the mock implementation and use the actual hook

  // Fetch available dates for the current month
  const { data: dates, isFetching: loadingDates, refetch: getAvailableDays } = useList({
    resource: `api/v1/bo/availability/work-shifts/${currentMonth}/`,
  });

  // Fetch available times when date and guests are selected
  const { data: times, isFetching: timesLoading, isLoading: isLoadingTimes, refetch: refetchTimes } = useList({
    resource: 'api/v1/bo/availability/work-shifts/time-slots/',
    filters: [
      {
        field: 'date',
        operator: 'eq',
        value: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      },
      {
        field: 'number_of_guests',
        operator: 'eq',
        value: Number(selectedGuests || 0),
      }
    ],
    queryOptions: {
      enabled: !!(selectedDate && selectedGuests), // Only enable when date and guests are selected
      onSuccess: (data) => {
        // Handle the new grouped time slots format
        setAvailableTimes(data?.data as unknown as GroupedTimeSlots);
      },
      onError: (error) => {
        console.error("Error fetching available times:", error);
        setAvailableTimes({}); // Reset available times on error
      },
    }
  });

  useEffect(() => {
    if (dates && !loadingDates) {
      setAvailableDates(dates?.data as AvailableDate[]);
    }
  }, [dates, loadingDates]);
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const formattedDate = format(day, 'yyyy-MM-dd');
    setSelectedData((prev) => ({ ...prev, time: '', reserveDate: formattedDate }));
    setSelectedTime(null);
    setSelectedGuests(null);
    setNumberGuests(null);
    setAvailableTimes({});
    setActiveTab('guest');
  };

  const handleGuestClick = (guest: number) => {
    if(timesLoading)
        return;
    setAvailableTimes({});
    setSelectedGuests(guest);
    setNumberGuests(guest);
    setSelectedData((prevData) => ({ ...prevData, guests: guest }));
    setSelectedTime(null);
    setActiveTab('time');
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setSelectedData((prevData) => ({ ...prevData, time }));
    setActiveTab('confirm');
  };

  const handleConfirmClick = () => {
    props.getDateTime(selectedData);
    props.onClick();
  };

  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth);
    setAvailableDates([]);
  };

  const{t} = useTranslation()

  return (
    <div className="">
      <div className="overlay z-[309] glassmorphism" onClick={props.onClick}></div>
      <div className={`popup z-[360] lt-sm:h-[70vh] sm:w-[30em] lt-sm:bottom-0 lt-sm:w-full rounded-[10px] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <div className="flex justify-center gap-5 mt-[1em]">
          {(
            <span
              className={activeTab === 'date' ? 'activetabb' : 'p-[10px]'}
              onClick={() => setActiveTab('date')}
              id="date"
            >
              {t('reservationProcess.date')}
            </span>
          )}
          {(
            <span
              className={activeTab === 'guest' ? 'activetabb' : 'p-[10px]'}
              onClick={() => selectedDate && setActiveTab('guest')}
              id="guest"
            >
              {t('reservationProcess.guests')}
            </span>
          )}
          {(
            <span
              className={activeTab === 'time' ? 'activetabb' : 'p-[10px]'}
              onClick={() => (selectedDate && selectedGuests) && setActiveTab('time')}
              id="time"
            >
              {t('reservationProcess.time')}
            </span>
          )}
        </div>

        {activeTab === 'date' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              {selectedDate ? <>{format(selectedDate, 'dd MMMM yyyy')} <span className="font-semibold">{t('reservationProcess.hasBeenSelected')}</span></> : <span className="font-semibold">Select a date</span>}
            </div>
            <OurCalendar
              forbidden={true}
              value={selectedDate}
              onClick={handleDateClick}
              availableDays={availableDates}
              loading={loadingDates || !availableDates?.length}
              onMonthChange={(month) => handleMonthChange(month)}
            />
          </div>
        )}

        {activeTab === 'guest' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              {selectedGuests ?
                <>
                  {selectedGuests} <span className="font-semibold">{t('reservationProcess.guests')} {' '} {t('reservationProcess.haveBeenSelected')}</span>
                </> :
                <>
                  <span className="font-semibold">{t('reservationProcess.chooseNumberOfGuests')}</span>
                </>
              }
            </div>
            <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
              {[...Array(props.maxGuests ? props.maxGuests : 15)].map((_, index) => (
                <button
                  className={`text-15 hover:bg-[#335a06] hover:text-white font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-[#335A06] ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ' text-blacktheme'} ${selectedGuests === index + 1 ? 'bg-black text-white' : ''}`}
                  key={index}
                  onClick={() => handleGuestClick(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {!props.maxGuests && <>
              <div className="text-center w-full my-2">{t('reservationProcess.orEnterNumberOfGuests')}</div>
            </>}
            {
              !props.maxGuests &&
              <div>
                <div className="flex rounded-lg">
                  <input type="number" min={1} name='note' placeholder="Enter number of guests" value={numberGuests} onChange={(e) => setNumberGuests(e.target.value)}
                    className='w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-s-lg bg-white dark:bg-darkthemeitems text-black dark:text-white'/>
                    <BaseBtn onClick={() => handleGuestClick(Number(numberGuests))} className="rounded-none rounded-e-lg" loading={timesLoading} disabled={timesLoading || !numberGuests || numberGuests < 1}>
                      {t('reservationProcess.confirm')}
                    </BaseBtn>
                </div>
              </div>
            }
          </div>
        )}

        {activeTab === 'time' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              {selectedTime ?
                <>
                  {selectedTime} <span className="font-semibold">{t('reservationProcess.hasBeenSelected')}</span>
                </> :
                <>
                  <span className="font-semibold">{t('reservationProcess.availableTimes')}</span>
                </>
              }
            </div>
            {timesLoading ? (
              <TimeSkeletonLoader />
            ) : Object.keys(availableTimes).length === 0 ? (
              <EmptyState message={`No available time slots for this date ${selectedDate ? format(selectedDate, 'dd MMMM yyyy') : ''} and number of guests ${selectedGuests || ''}`} />
            ) : (
              <div className="flex flex-col min-h-[200px] overflow-y-auto max-h-[400px] p-[20px] rounded-[3px]">
                {Object.entries(availableTimes).map(([category, times]) => (
                  <div key={category} className="mb-4">
                    <h3 className="text-left text-lg font-semibold mb-2 text-[#335A06] border-b border-[#335A06] pb-1">{category}</h3>
                    <div className="flex flex-wrap justify-start gap-[10px]">
                      {times.map((time, index) => {
                        const now = new Date();
                        const isToday = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                        const [hour, minute] = time.split(':').map(Number);
                        const isPastTime = isToday && (hour < now.getHours() || (hour === now.getHours() && minute < now.getMinutes()));

                        return (
                          <button
                            onClick={() => !isPastTime && handleTimeClick(time)}
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
        )}

        {activeTab === 'confirm' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              <span className='font-[500] mr-2'>{t('reservationProcess.yourReservationIsSetFor')}</span> {selectedDate && format(selectedDate, 'dd/MM/yyyy')} <span className="font-semibold mx-2">{t('reservationProcess.at')}</span>
              {selectedTime} <span className="font-semibold mx-2">{t('reservationProcess.for')}</span>
              {selectedGuests} <span className="font-semibold">{t('reservationProcess.guests')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
              <button onClick={handleConfirmClick} className="btn-primary">
                {t('reservationProcess.confirm')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetReservationProcess;
