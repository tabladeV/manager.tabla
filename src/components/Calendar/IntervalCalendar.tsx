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
import { X } from 'lucide-react';

const colStartClasses = [
  '', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'
];


interface IntervalCalendarProps {
  onRangeSelect: (range: { start: Date; end: Date }) => void;
  onClose?: () => void;
}


const IntervalCalendar: React.FC<IntervalCalendarProps> = ({ onRangeSelect, onClose }) => {
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

  const dayClasses = (day:any) => {
    const isSelected = isEqual(day, dateRange.start ?? new Date(0)) || isEqual(day, dateRange.end ?? new Date(0));
    const inRange = isInRange(day);
    if (isSelected) return 'text-white bg-greentheme';
    else if(isToday(day) && isSameMonth(day, firstDayCurrentMonth)) return 'dark:text-white border border-greentheme ';
    else if (inRange) return 'dark:text-white dark:bg-darkthemeitems text-greentheme bg-softgreentheme';

    return 'dark:text-gray-300 text-gray-900'
  } 

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
    }
  };

  const isInRange = (day: Date) => {
    return dateRange.start && dateRange.end && isWithinInterval(day, { start: dateRange.start, end: dateRange.end });
  };

  const handleCancel = () => {
    setDateRange({ start: null, end: null });
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (dateRange.start || (dateRange.start && dateRange.end)) {
      onRangeSelect({ start: dateRange.start, end: dateRange.end as Date });
    }
    if (onClose) onClose();
  };

  return (
    <div className='ltr rounded-lg dark:bg-bgdarktheme bg-white'>
      <div className='flex justify-end items-center mb-3'>
        <button 
          onClick={onClose}
          className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-softgreentheme dark:hover:bg-darkthemeitems transition duration-200'
        >
          <X className="w-5 h-5 text-greentheme dark:text-white"/>
        </button>
      </div>
      
      <div className='text-xl items-center mb-4 flex justify-between'>
        <div className='font-bold text-greentheme dark:text-white'>{format(firstDayCurrentMonth, 'MMMM yyyy')}</div>
        <div className='flex space-x-2'>
          <button onClick={previousMonth} className='hover:bg-softgreentheme dark:hover:bg-darkthemeitems transition duration-200 w-8 h-8 flex justify-center items-center rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-greentheme dark:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextMonth} className='hover:bg-softgreentheme dark:hover:bg-darkthemeitems transition duration-200 w-8 h-8 flex justify-center items-center rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-greentheme dark:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className='mx-auto'>
        <div className='grid grid-cols-7 mb-2'>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className='font-bold text-center text-sm text-greentheme dark:text-white'>{day}</div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-1'>
          {days.map((day, dayIdx) => (
            <div key={day.toString()} className={classNames(dayIdx === 0 ? colStartClasses[getDay(day)] : '', 'relative')}>
              <button
                type="button"
                onClick={() => selectingDate(day)}
                className={classNames(
                  dayClasses(day),
                  'w-full py-1 rounded-full hover:bg-gray-200 dark:hover:bg-greentheme transition duration-200'
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
        <div className="mt-4 text-sm text-greentheme dark:text-white">
          Selected range: {format(dateRange.start, 'MMM d, yyyy')}
          {dateRange.end ? ` - ${format(dateRange.end, 'MMM d, yyyy')}` : ''}
        </div>
      )}
      
      <div className="mt-6 flex justify-end space-x-3">
        <button 
          onClick={handleCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkthemeitems transition duration-200"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          disabled={!dateRange.start && !dateRange.end}
          className={` rounded-md text-white transition duration-200 ${
            dateRange.start || (dateRange.start && dateRange.end)
              ? 'btn-primary'
              : 'btn-secondary cursor-not-allowed'
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default IntervalCalendar;
