import React, { useState } from 'react';
import { eachDayOfInterval, endOfMonth, format, getDay, isEqual, isSameMonth, isToday, parse, startOfToday, add } from 'date-fns';

const colStartClasses = [
  '', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'
];

const OurCalendar = (props) => {
  let today = startOfToday();

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const [selectedDay, setSelectedDay] = useState(today);
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function selectingDate(day) {
    setSelectedDay(day);
    if (props.onClick) {
      props.onClick(day); // Call the onClick function and pass the day as an argument
    }
  }

  return (
    <div className='p-[1em] w-full h-full mx-auto'>
      <div className='text-[20px] items-center mb-2 flex justify-between'>
        <div className='font-bold'>{format(firstDayCurrentMonth, 'MMMM yyyy')}</div>
        <div className='flex'>
          <button onClick={previousMonth} className='hover:bg-[#3333330a] transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%]'>
            {/* SVG for previous month */}
            {'<'}
          </button>
          <button onClick={nextMonth} className='hover:bg-[#3333330a] transition duration-500 w-[35px] h-[35px] flex justify-center items-center rounded-[100%]'>
            {/* SVG for next month */}
            {'>'}
          </button>
        </div>
      </div>
      <div className='mx-auto'>
        <div className='grid mx-auto grid-cols-7'>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
            <button key={index} className='font-bold w-[30px] cursor-default rounded-[6px] h-[30px]'>{day}</button>
          ))}
        </div>
        <div className='mx-auto grid grid-cols-7 justify-around'>
          {days.map((day, dayIdx) => (
            <div key={day.toString()} className={classNames(dayIdx === 0 && colStartClasses[getDay(day)], 'py-1.5')}>
              <button
                type="button"
                onClick={() => selectingDate(day)}
                className={classNames(
                  isEqual(day, selectedDay) && 'text-white',
                  !isEqual(day, selectedDay) && isToday(day) && 'text-[#70ae29] font-bold',
                  !isEqual(day, selectedDay) && !isToday(day) && isSameMonth(day, firstDayCurrentMonth) && localStorage.getItem('darkMode') === 'true' ? 'text-white' : 'text-gray-900',
                  !isEqual(day, selectedDay) && !isToday(day) && !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                  isEqual(day, selectedDay) && isToday(day) && 'bg-greentheme font-bold',
                  isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
                  !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                  (isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurCalendar;
