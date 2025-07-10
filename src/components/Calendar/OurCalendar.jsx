import React, { useState, useEffect } from 'react';
import { eachDayOfInterval, endOfMonth, format, getDay, isEqual, isSameMonth, isToday, parse, startOfToday, add, isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

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

  function previousMonth() {
    // if (loading) return;
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    props.onMonthChange?.(format(firstDayNextMonth, 'yyyy-MM'));
  }

  function nextMonth() {
    // if (loading) return;
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    props.onMonthChange?.(format(firstDayNextMonth, 'yyyy-MM'));
  }

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

  // Skeleton loaders for calendar
  const renderSkeleton = () => {
    return (
      <>
        <div className='text-[20px] items-center mb-2 flex justify-between'>
          <div className='font-bold w-28 h-7 bg-gray-200 dark:bg-darkthemeitems animate-pulse rounded'></div>
          {/* <div className='flex'>
            <div className='w-[35px] h-[35px] bg-gray-200 animate-pulse rounded-full mx-1'></div>
            <div className='w-[35px] h-[35px] bg-gray-200 animate-pulse rounded-full mx-1'></div>
          </div> */}
          <div className='flex'>
              <button 
                onClick={previousMonth} 
                className='hover:bg-[#3333330a] transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%]'
                disabled={loading}
              >
                {'<'}
              </button>
              <button 
                onClick={nextMonth} 
                className='hover:bg-[#3333330a] transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%]'
                disabled={loading}
              >
                {'>'}
              </button>
            </div>
        </div>
        <div className='mx-auto'>
          <div className='grid mx-auto grid-cols-7'>
            {Array(7).fill(0).map((_, index) => (
              <div key={index} className='font-bold ml-3 w-[30px] h-[30px] bg-gray-200 dark:bg-darkthemeitems animate-pulse rounded-[6px] mb-2'></div>
            ))}
          </div>
          <div className='mx-auto grid grid-cols-7 justify-around'>
            {Array(35).fill(0).map((_, index) => (
              <div key={index} className='py-1.5'>
                <div className='mx-auto h-8 w-8 bg-gray-200 dark:bg-darkthemeitems animate-pulse rounded-full'></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // Use either external selectedDate or internal selectedDay
  const actualSelectedDay = value || selectedDay;

  const {t}= useTranslation();
  // Get localized month name from i18n
  const localizedMonth = t(`calendarPopup.months.${format(firstDayCurrentMonth, 'MMMM').toLowerCase()}`) || format(firstDayCurrentMonth, 'MMMM');

  return (
    <div className='p-[1em] w-full h-full mx-auto'>
      {loading ? (
        renderSkeleton()
      ) : (
        <>
          <div className='text-[20px] items-center mb-2 flex justify-between'>
            <div className='font-bold'>
              {localizedMonth} {format(firstDayCurrentMonth, 'yyyy')}
            </div>
            <div className='flex'>
              <button 
                onClick={previousMonth} 
                className='hover:bg-[#3333330a] transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%]'
                disabled={loading}
              >
                {'<'}
              </button>
              <button 
                onClick={nextMonth} 
                className='hover:bg-[#3333330a] transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%]'
                disabled={loading}
              >
                {'>'}
              </button>
            </div>
          </div>
          <div className='mx-auto'>
            <div className='grid mx-auto grid-cols-7'>
              {[ t('calendarPopup.days.sunday'), t('calendarPopup.days.monday'), t('calendarPopup.days.tuesday'), t('calendarPopup.days.wednesday'), t('calendarPopup.days.thursday'), t('calendarPopup.days.friday'), t('calendarPopup.days.saturday')].map((day, index) => (
                <button key={index} className='font-bold ml-3 w-[30px] cursor-default rounded-[6px] h-[30px]'>{day}</button>
              ))}
            </div>
            <div className='mx-auto grid grid-cols-7 justify-around'>
              {days.map((day, dayIdx) => {
                const isAvailable = isDayAvailable(day);
                return (
                  <div key={day.toString()} className={classNames(dayIdx === 0 && colStartClasses[getDay(day)], 'py-1.5')}>
                    <button
                      type="button"
                      onClick={() => selectingDate(day)}
                      disabled={(props.forbidden && day < today) || !isAvailable || loading}
                      className={classNames(
                        isSameDay(day, actualSelectedDay) && 'text-white',
                        !isSameDay(day, actualSelectedDay) && isToday(day) && 'text-[#70ae29] font-bold',
                        !isSameDay(day, actualSelectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'text-gray-900',
                        !isSameDay(day, actualSelectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                        isSameDay(day, actualSelectedDay) && isToday(day) && 'bg-greentheme font-bold',
                        isSameDay(day, actualSelectedDay) && !isToday(day) && 'bg-gray-900',
                        !isSameDay(day, actualSelectedDay) && isAvailable && 'hover:bg-softgreentheme',
                        (isSameDay(day, actualSelectedDay) || isToday(day)) && 'font-semibold',
                        !isAvailable && 'bg-gray-100 dark:bg-softredtheme cursor-not-allowed',
                        'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                      )}
                    >
                      <time dateTime={format(day, 'yyyy-MM-dd')} className={((props.forbidden && day < today) || !isAvailable ? 'opacity-20' : '')}>
                        {format(day, 'd')}
                      </time>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OurCalendar;
