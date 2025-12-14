import React, { useState, useEffect } from 'react';
import { eachDayOfInterval, endOfMonth, format, getDay, isEqual, isSameMonth, isToday, parse, startOfToday, add, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';

const colStartClasses = [
  '', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'
];

const OurCalendar = (props) => {
  let today = startOfToday();
  const { availableDays = [], value = null, loading = false } = props;

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  // Check if a day is available based on the availableDays prop
  function isDayAvailable(day) {
    const dayNumber = parseInt(format(day, 'd'), 10);
    const foundDay = availableDays.find(d => d.day === dayNumber);
    return foundDay ? foundDay.isAvailable : true; // Default to true if not specified
  }

  const [selectedDay, setSelectedDay] = useState(value || today);
  let [currentMonth, setCurrentMonth] = useState(format(value || today, 'MMM-yyyy'));
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  // Update selected day when selectedDate prop changes
  useEffect(() => {
    if (value) {
      setSelectedDay(value);
      setCurrentMonth(format(value, 'MMM-yyyy'));
    }
  }, [value]);

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const previousMonth = useDebouncedCallback(()=> {
    // if (loading) return;
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    props.onMonthChange?.(format(firstDayNextMonth, 'yyyy-MM'));
    setTimeout(()=> {
      setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    }, 300);
  },50);

  const nextMonth = useDebouncedCallback(()=> {
    // if (loading) return;
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    props.onMonthChange?.(format(firstDayNextMonth, 'yyyy-MM'));
    setTimeout(()=> {
      setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    }, 300);
  },50);

  function selectingDate(day) {
    if (loading) return;
    // Only allow selecting available days
    if (props.forbidden && day < today || (availableDays.length > 0 && !isDayAvailable(day))) {
      return;
    }
    
    setSelectedDay(day);
    if (props.onClick) {
      props.onClick(day); // Call the onClick function and pass the day as an argument
    }
  }

  // Use either external selectedDate or internal selectedDay
  const actualSelectedDay = value || selectedDay;

  const {t}= useTranslation();
  // Get localized month name from i18n
  const localizedMonth = t(`calendarPopup.months.${format(firstDayCurrentMonth, 'MMMM').toLowerCase()}`) || format(firstDayCurrentMonth, 'MMMM');

  const getDayClasses = (day) => {
    const isSelected = isSameDay(day, actualSelectedDay);
    const isAvailable = isDayAvailable(day);
    const isForbidden = props.forbidden && day < today;
    const isDisabled = isForbidden || !isAvailable;

    if (isDisabled) {
        return 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50';
    }

    if (isSelected) {
        return 'text-white bg-greentheme font-bold shadow-md';
    }
    
    if (isToday(day)) {
        return 'dark:text-white text-greentheme border border-greentheme font-bold';
    }

    if (!isSameMonth(day, firstDayCurrentMonth)) {
        return 'text-gray-400 dark:text-gray-600';
    }

    return 'dark:text-gray-300 text-gray-900 hover:bg-gray-200 dark:hover:bg-darkthemeitems';
  };

  return (
    <div className='ltr rounded-lg dark:bg-bgdarktheme bg-white min-h-[360px]'>
      <style>{`
        @keyframes calendarFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-calendar-fade {
          animation: calendarFadeIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className='text-xl items-center mb-4 flex justify-between px-2 pt-2'>
        {loading ? (
          <div className='font-bold w-32 h-8 bg-gray-200 dark:bg-darkthemeitems animate-pulse rounded'></div>
        ) : (
          <div className='font-bold text-greentheme dark:text-white capitalize'>
            {localizedMonth} {format(firstDayCurrentMonth, 'yyyy')}
          </div>
        )}
        
        <div className='flex space-x-2'>
          <button 
            onClick={previousMonth} 
            className='hover:bg-softgreentheme dark:hover:bg-darkthemeitems transition duration-200 w-8 h-8 flex justify-center items-center rounded-full'
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-greentheme dark:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={nextMonth} 
            className='hover:bg-softgreentheme dark:hover:bg-darkthemeitems transition duration-200 w-8 h-8 flex justify-center items-center rounded-full'
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-greentheme dark:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className='mx-auto pb-2'>
        <div className='grid grid-cols-7 mb-2'>
          {[ t('calendarPopup.days.sunday'), t('calendarPopup.days.monday'), t('calendarPopup.days.tuesday'), t('calendarPopup.days.wednesday'), t('calendarPopup.days.thursday'), t('calendarPopup.days.friday'), t('calendarPopup.days.saturday')].map((day, index) => (
            <div key={index} className='font-bold text-center text-sm text-greentheme dark:text-white'>{day}</div>
          ))}
        </div>
        
        {loading ? (
          <div className='grid grid-cols-7 gap-1 animate-calendar-fade'>
            {Array(42).fill(0).map((_, index) => (
              <div key={index} className='w-full h-9 flex items-center justify-center'>
                <div className='h-8 w-8 bg-gray-200 dark:bg-darkthemeitems animate-pulse rounded-full'></div>
              </div>
            ))}
          </div>
        ) : (
          <div key={currentMonth} className='grid grid-cols-7 gap-1 animate-calendar-fade'>
            {days.map((day, dayIdx) => {
              const isAvailable = isDayAvailable(day);
              const isForbidden = props.forbidden && day < today;
              return (
                <div key={day.toString()} className={classNames(dayIdx === 0 && colStartClasses[getDay(day)], 'relative')}>
                  <button
                    type="button"
                    onClick={() => selectingDate(day)}
                    disabled={isForbidden || !isAvailable || loading}
                    className={classNames(
                      getDayClasses(day),
                      'w-full h-9 flex items-center justify-center rounded-full transition duration-200 text-sm'
                    )}
                  >
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'd')}
                    </time>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OurCalendar;
