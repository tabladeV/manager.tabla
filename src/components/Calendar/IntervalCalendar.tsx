import React, { useEffect, useState } from 'react';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  add,
  isWithinInterval,
  isBefore,
} from 'date-fns';

const colStartClasses = [
  '', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'
];


interface IntervalCalendarProps {
  onRangeSelect: (range: { start: Date; end: Date }) => void;
}


const IntervalCalendar: React.FC<IntervalCalendarProps> = ({ onRangeSelect }) => {
  const [filteringHour, setFilteringHour] = useState('');
  const today = startOfToday();
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });


  const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ');

  const previousMonth = () => {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPreviousMonth, 'MMM-yyyy'));
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const selectingDate = (day: Date) => {
    if (!dateRange.start || dateRange.end) {
      setDateRange({ start: day, end: null });
    } else {
      let newStart: Date;
      let newEnd: Date;
      if (dateRange.start) {
        newEnd = isBefore(day, dateRange.start) ? dateRange.start : day;
        newStart = isBefore(day, dateRange.start) ? day : dateRange.start;
      } else {
        newStart = day;
        newEnd = day;
      }
      const range = { start: newStart, end: newEnd };
      setDateRange(range);

      // Ensure both start and end are defined before calling onRangeSelect
      if (range.start && range.end) {
        onRangeSelect({ start: range.start, end: range.end });
      }
    }
  };

  const isInRange = (day: Date) => {
    return dateRange.start && dateRange.end && isWithinInterval(day, { start: dateRange.start, end: dateRange.end });
  };


  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({ id: i.toString(), time: `${i}:00` });
  }

  return (
    <div className='ltr'>
      <div className='text-xl items-center mb-4 flex justify-between'>
        <div className='font-bold text-greentheme'>{format(firstDayCurrentMonth, 'MMMM yyyy')}</div>
        <div className='flex space-x-2'>
          <button onClick={previousMonth} className='hover:bg-softgreentheme transition duration-200 w-8 h-8 flex justify-center items-center rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-greentheme">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className='hover:bg-softgreentheme transition duration-200 w-8 h-8 flex justify-center items-center rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-greentheme">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className='mx-auto'>
        <div className='grid grid-cols-7 mb-2'>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className='font-bold text-center text-sm text-greentheme'>{day}</div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-1'>
          {days.map((day, dayIdx) => (
            <div key={day.toString()} className={classNames(dayIdx === 0 ? colStartClasses[getDay(day)] : '', 'relative')}>
              <button
                type="button"
                onClick={() => selectingDate(day)}
                className={classNames(
                  isInRange(day) && localStorage.getItem('darkMode') === 'true' ? 'text-white bg-darkthemeitems' : 'text-gray-900 ',
                  isInRange(day) && localStorage.getItem('darkMode') === 'false' ? 'text-greentheme bg-softgreentheme' : 'text-gray-900 ',
                  isEqual(day, dateRange.start ?? new Date(0)) ? 'text-black bg-blacktheme' : '',
                  isEqual(day, dateRange.end ?? new Date(0)) ? 'text-black bg-blacktheme' : '',
                  !isEqual(day, dateRange.start ?? new Date(0)) && !isEqual(day, dateRange.end ?? new Date(0)) && isToday(day) ? 'text-greentheme' : '',
                  !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'text-gray-900', 
                  'w-full py-1 rounded-full hover:bg-subblack hover:text-white transition duration-200'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className="text-sm">
                  {format(day, 'd')}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
      {dateRange.start && (
        <div className="mt-4 text-sm text-greentheme">
          Selected range: {format(dateRange.start, 'MMM d, yyyy')}
          {dateRange.end ? ` - ${format(dateRange.end, 'MMM d, yyyy')}` : ''}
        </div>
      )}
      
    
    </div>
  );
};

export default IntervalCalendar;
