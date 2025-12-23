import React, { useState, useEffect, memo } from 'react';
import { compareAsc, format, startOfDay, parseISO, isAfter, isBefore, startOfDay as startOfDayFns } from 'date-fns';
import OurCalendar from '../Calendar/OurCalendar';
import { useList } from '@refinedev/core';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import BaseBtn from '../common/BaseBtn';

// #region Types
type SelectedData = {
  reserveDate: string;
  time: string;
  guests: number;
};

type Filter = {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
};

type ReservationProcessProps = {
  onClick: () => void;
  getDateTime: (data: SelectedData) => void;
  maxGuests?: number;
  minGuests?: number;
  resData?: SelectedData;
  filter?: Filter | null;
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
  <div className="animate-pulse p-4">
    <div className="grid grid-cols-7 gap-2">
      {[...Array(35)].map((_, index) => (
        <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      ))}
    </div>
  </div>
));

const TimeSkeletonLoader = memo(() => (
  <div className="animate-pulse flex flex-wrap justify-center gap-3 p-6">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="h-12 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    ))}
  </div>
));

const EmptyState = memo(({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-[200px] p-6 text-center">
    <div className="bg-gray-100 dark:bg-darkthemeitems p-4 rounded-full mb-4">
      {/* Lucide CalendarX2 */}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-gray-400">
        <path d="M8 2v4" /><path d="M16 2v4" /><path d="M21 17V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11" /><path d="M3 10h18" /><path d="m17 22 5-5" /><path d="m17 17 5 5" />
      </svg>
    </div>
    <p className="text-gray-500 dark:text-gray-400 max-w-xs">{message}</p>
  </div>
));

const TabNavigation = memo(({ activeTab, onTabClick, completedSteps }: { activeTab: Tab | null, onTabClick: (tab: Tab) => void, completedSteps: { date: boolean, guests: boolean } }) => {
  const { t } = useTranslation();
  const tabs: Tab[] = ['date', 'guests', 'time'];

  return (
    <div className="flex items-center border-b border-gray-100 dark:border-gray-800 px-2 bg-white dark:bg-bgdarktheme z-20 relative shrink-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        let isDisabled = false;

        if (tab === 'guests' && !completedSteps.date) isDisabled = true;
        if (tab === 'time' && (!completedSteps.date || !completedSteps.guests)) isDisabled = true;

        return (
          <button
            key={tab}
            onClick={() => !isDisabled && onTabClick(tab)}
            disabled={isDisabled}
            className={`
              flex-1 py-4 text-sm font-medium text-center transition-all relative
              ${isActive
                ? 'text-[#335A06] dark:text-[#88AB61]'
                : isDisabled
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }
            `}
          >
            {t(`reservationWidget.reservation.${tab}`)}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#335A06] dark:bg-[#88AB61] rounded-t-full mx-4" />
            )}
          </button>
        );
      })}
    </div>
  );
});

const DateStep = memo(({ selectedDate, onDateClick, availableDates, loading, onMonthChange, filter }: any) => {
  const { t } = useTranslation();

  const filterMessage = filter?.startDate ? (
    <div className="mx-6 mb-4 text-xs font-medium text-[#335A06] bg-[#f0f7e6] dark:bg-[#335A06]/20 dark:text-[#88AB61] p-3 rounded-lg border border-[#88AB61]/30 flex items-center gap-2 shrink-0">
      {/* Lucide Info */}
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
      <span>
        {t("reservationProcess.eventBookingMode", "Event Booking Mode")}: {format(parseISO(filter.startDate), 'MMM dd')}
        {filter.endDate && filter.startDate !== filter.endDate ? ` - ${format(parseISO(filter.endDate), 'MMM dd')}` : ''}
      </span>
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-6 pb-2 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedDate
            ? format(selectedDate, 'dd MMMM yyyy')
            : t("reservationProcess.selectDate")}
        </h2>
        {selectedDate && <p className="text-sm text-[#335A06] dark:text-[#88AB61] font-medium">{t("reservationProcess.hasBeenSelected")}</p>}
      </div>
      {filterMessage}
      <div className="flex-1 pb-4 overflow-y-auto">
        <OurCalendar
          forbidden={true}
          value={selectedDate}
          onClick={onDateClick}
          availableDays={availableDates}
          loading={loading}
          onMonthChange={onMonthChange}
        />
      </div>
    </div>
  );
});

const GuestStep = memo(({ selectedGuests, onGuestClick, maxGuests }: any) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-6 pb-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedGuests ? <>{selectedGuests} <span className="font-normal text-gray-500 text-base">{t("reservationProcess.guests")}</span></>
            : t("reservationProcess.chooseNumberOfGuests")}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-6">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {[...Array(maxGuests ? maxGuests : 15)].map((_, index) => {
            const guests = index + 1;
            const isSelected = selectedGuests === guests;
            return (
              <button
                key={index}
                onClick={() => onGuestClick(guests)}
                className={`
                  aspect-square flex items-center justify-center text-lg font-bold rounded-xl transition-all duration-200
                  border-2 
                  ${isSelected
                    ? 'bg-[#335A06] border-[#335A06] text-white shadow-md scale-105 dark:bg-[#88AB61] dark:border-[#88AB61] dark:text-black'
                    : 'border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#335A06] hover:text-[#335A06] dark:hover:border-[#88AB61] dark:hover:text-[#88AB61] bg-white dark:bg-darkthemeitems'
                  }
                `}
              >
                {guests}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const TimeStep = memo(({ selectedTime, onTimeClick, availableTimes, loading, selectedDate, selectedGuests, filter }: any) => {
  const { t } = useTranslation();

  const filterMessage = filter?.startTime ? (
    <div className="mx-6 mb-4 text-xs font-medium text-[#335A06] bg-[#f0f7e6] dark:bg-[#335A06]/20 dark:text-[#88AB61] p-3 rounded-lg border border-[#88AB61]/30 shrink-0">
      {t("reservationProcess.eventTimeRestricted", "Event times restricted")}: {filter.startTime.slice(0, 5)}
      {filter.endTime ? ` - ${filter.endTime.slice(0, 5)}` : ''}
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-6 pb-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedTime
            ? selectedTime
            : t("reservationProcess.availableTimes")}
        </h2>
        {selectedTime && <p className="text-sm text-[#335A06] dark:text-[#88AB61] font-medium">{t("reservationProcess.hasBeenSelected")}</p>}
      </div>
      {filterMessage}

      <div className="flex-1 overflow-y-auto px-2 pb-6">
        {loading ? (
          <TimeSkeletonLoader />
        ) : Object.keys(availableTimes).length === 0 ? (
          <EmptyState message={t('reservationProcess.noAvailableTimeSlotsWithGuests', { date: selectedDate ? format(selectedDate, 'dd MMM') : '', guests: selectedGuests || 0 })} />
        ) : (
          <div className="space-y-6">
            {Object.entries(availableTimes).map(([category, times]) => (
              <div key={category} className="animate-fadeIn">
                {(times as Array<string>)?.length > 0 && (
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2 sticky top-0 bg-white dark:bg-bgdarktheme py-2 z-10">
                    {category}
                    <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
                  </h3>
                )}
                <div className="flex flex-wrap gap-3">
                  {(times as Array<string>).map((time: string, index: number) => {
                    const now = new Date();
                    const isToday = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                    const [hour, minute] = time.split(':').map(Number);
                    const isPastTime = isToday && (hour < now.getHours() || (hour === now.getHours() && minute < now.getMinutes()));
                    const isSelected = selectedTime === time;

                    return (
                      <button
                        key={index}
                        onClick={() => !isPastTime && onTimeClick(time)}
                        disabled={!!isPastTime}
                        className={`
                          px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 border
                          ${isPastTime
                            ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed dark:bg-darkthemeitems dark:text-gray-600'
                            : isSelected
                              ? 'bg-[#335A06] text-white border-[#335A06] shadow-md dark:bg-[#88AB61] dark:border-[#88AB61] dark:text-black'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#335A06] hover:text-[#335A06] dark:bg-darkthemeitems dark:text-gray-200 dark:border-gray-700 dark:hover:border-[#88AB61] dark:hover:text-[#88AB61]'
                          }
                        `}
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
    </div>
  );
});

const ConfirmStep = memo(({ selectedDate, selectedTime, selectedGuests, onConfirmClick }: any) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden overflow-y-auto">
        <div className="text-center mb-2">
          <div className="w-16 h-16 bg-[#335A06]/10 dark:bg-[#88AB61]/20 rounded-full flex items-center justify-center mx-auto my-2 text-[#335A06] dark:text-[#88AB61]">
            {/* Lucide CheckCircle */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("reservationProcess.confirmReservation", "Confirm Your Reservation")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {t("reservationProcess.pleaseReviewDetails", "Please review your reservation details below.")}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-darkthemeitems/50 rounded-2xl p-2 space-y-2 border border-gray-100 dark:border-gray-700 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-darkthemeitems rounded-lg text-gray-400">
                {/* Lucide Calendar */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <span className="text-gray-600 dark:text-gray-300">{t("reservationProcess.date")}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {selectedDate && format(selectedDate, 'dd MMM yyyy')}
            </span>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700 border-dashed my-1"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-darkthemeitems rounded-lg text-gray-400">
                {/* Lucide Clock */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="text-gray-600 dark:text-gray-300">{t("reservationProcess.time")}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {selectedTime}
            </span>
          </div>

          <div className="h-px bg-gray-200 dark:bg-gray-700 border-dashed my-1"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-darkthemeitems rounded-lg text-gray-400">
                {/* Lucide Users */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="text-gray-600 dark:text-gray-300">{t("reservationProcess.guests")}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {selectedGuests} {t("reservationWidget.confirmation.people")}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 z-10">
        <BaseBtn onClick={onConfirmClick} variant='primary' type='button' className="w-full my-2">
          {t("reservationProcess.confirm")}
        </BaseBtn>
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
  const [isVisible, setIsVisible] = useState(false);

  const completedSteps = {
    date: !!selectedDate,
    guests: !!selectedGuests
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      onSuccess: (data) => {
        let groupedTimes = data?.data as unknown as GroupedTimeSlots || {};

        // Apply Time Filter
        if (props.filter?.startTime || props.filter?.endTime) {
          const startVal = props.filter.startTime ? parseInt(props.filter.startTime.replace(':', '').slice(0, 4)) : 0;
          const endVal = props.filter.endTime ? parseInt(props.filter.endTime.replace(':', '').slice(0, 4)) : 2400;

          const newGrouped: GroupedTimeSlots = {};
          Object.entries(groupedTimes).forEach(([key, times]) => {
            const filtered = times.filter(t => {
              const tVal = parseInt(t.replace(':', '').slice(0, 4));
              return tVal >= startVal && tVal <= endVal;
            });
            if (filtered.length > 0) newGrouped[key] = filtered;
          });
          setAvailableTimes(newGrouped);
        } else {
          setAvailableTimes(groupedTimes);
        }
      },
      onError: (error) => {
        console.error("Error fetching available times:", error);
        setAvailableTimes({});
      },
    }
  });

  useEffect(() => {
    if (dates && !loadingDates) {
      let available = dates?.data as AvailableDate[];

      // Apply Date Filter
      if (props.filter?.startDate || props.filter?.endDate) {
        const start = props.filter.startDate ? startOfDayFns(parseISO(props.filter.startDate)) : null;
        const end = props.filter.endDate ? startOfDayFns(parseISO(props.filter.endDate)) : null;

        available = available.map(d => {
          // Construct date object for the day in currentMonth
          const dateStr = `${currentMonth}-${String(d.day).padStart(2, '0')}`;
          const dateObj = startOfDayFns(new Date(dateStr));

          let isWithin = true;
          if (start && isBefore(dateObj, start)) isWithin = false;
          if (end && isAfter(dateObj, end)) isWithin = false;

          return { ...d, isAvailable: d.isAvailable && isWithin };
        });
      }
      setAvailableDates(available);
    }
  }, [dates, loadingDates, props.filter, currentMonth]);

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
        return <DateStep selectedDate={selectedDate} onDateClick={handleDateClick} availableDates={availableDates} loading={loadingDates} onMonthChange={handleMonthChange} filter={props.filter} />;
      case 'guests':
        return <GuestStep selectedGuests={selectedGuests} onGuestClick={handleGuestClick} maxGuests={props.maxGuests} />;
      case 'time':
        return <TimeStep selectedTime={selectedTime} onTimeClick={handleTimeClick} availableTimes={availableTimes} loading={timesLoading} selectedDate={selectedDate} selectedGuests={selectedGuests} filter={props.filter} />;
      case 'confirm':
        return <ConfirmStep selectedDate={selectedDate} selectedTime={selectedTime} selectedGuests={selectedGuests} onConfirmClick={handleConfirmClick} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`overlay z-[300] glassmorphism transition-opacity duration-100 ${(!isVisible || isExiting) ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose}></div>
      <div className={`popup z-[360] sm:w-[30em] lt-sm:bottom-0 lt-sm:w-full rounded-2xl shadow-2xl transition-all duration-300 ease-out overflow-hidden flex flex-col max-h-[85vh] ${(!isVisible || isExiting) ? 'opacity-0 translate-y-full' : 'opacity-100 lg:translate-y-[-50%] xl:translate-y-[-50%] md:translate-y-[-50%] translate-x-[-50%]'} ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-30 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm glassmorphism"
        >
          {/* Lucide X */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
        <TabNavigation activeTab={activeTab} onTabClick={changeTab} completedSteps={completedSteps} />
        <div className="relative flex flex-col h-full">
          <div className={`overflow-auto max-h-[70vh] transition-opacity duration-150 flex-1 relative ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
};

export default WidgetReservationProcess;