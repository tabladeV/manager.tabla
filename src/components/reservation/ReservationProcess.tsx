import React, { useState } from 'react';
import { format } from 'date-fns';
import OurCalendar from '../Calendar/OurCalendar';


type SelectedData = {

  reserveDate: string ;
  time: string ;
  guests: number ;
};

type ReservationProcessProps = {
  onClick: () => void;
  getDateTime: (data: SelectedData) => void;
  maxGuests?: number;
  minGuests?: number;
};



const ReservationProcess: React.FC<ReservationProcessProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'date' | 'time' | 'guest' | 'confirm' | null>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedGuests, setSelectedGuests] = useState<number | null>(null);
  const [selectedData, setSelectedData] = useState<SelectedData>({
    reserveDate: '',
    time: '',
    guests: 0,
  });

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const formattedDate = format(day, 'yyyy-MM-dd');
    setSelectedData((prevData) => ({ ...prevData, reserveDate: formattedDate.toString() }));
    setActiveTab('time');
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setSelectedData((prevData) => ({ ...prevData, time }));
    setActiveTab('guest');
  };

  const handleGuestClick = (guest: number) => {
    setSelectedGuests(guest);
    setSelectedData((prevData) => ({ ...prevData, guests: guest }));
    setActiveTab('confirm');
  };
  const handleConfirmClick = () => {
    props.getDateTime(selectedData);
    props.onClick();
  }

  return (
    <div className="">
      <div className="overlay z-[309] glassmorphism" onClick={props.onClick}></div>
      <div className={`popup z-[360] lt-sm:h-[70vh] sm:w-[30em] lt-sm:bottom-0 lt-sm:w-full  rounded-[10px] ${localStorage.getItem('darkMode')  === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
        <div className="flex justify-center gap-5 mt-[1em]">
          { (
            <span
              className={activeTab === 'date' ? 'activetabb' : 'p-[10px]'}
              onClick={() => setActiveTab('date')}
              id="date"
            >
              Date
            </span>
          )}
          { (
            <span
              className={` ${activeTab === 'time' ? 'activetabb' : 'p-[10px]'}`}
              onClick={() => setActiveTab('time')}
              id="time"
            >
              Time
            </span>
          )}
          { (
            <span
              className={activeTab === 'guest' ? 'activetabb' : 'p-[10px]'}
              onClick={() => setActiveTab('guest')}
              id="guest"
            >
              Guest
            </span>
          )}
        </div>

        {activeTab === 'date' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              {selectedDate && format(selectedDate, 'dd MMMM yyyy')} <span className="font-semibold">has been selected</span>
            </div>
            <OurCalendar forbidden={true} onClick={handleDateClick} />
          </div>
        )}

        {activeTab === 'time' && (
            <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              {selectedTime} <span className="font-semibold">has been selected</span>
            </div>
            <div className="flex flex-wrap h-[284px] overflow-y-auto justify-center gap-[10px] p-[20px] rounded-[3px]">
              {[...Array(48)].map((_, index) => {
              const hour = Math.floor(index / 2);
              const minute = index % 2 === 0 ? '00' : '30';
              const timeString = `${hour < 10 ? '0' + hour : hour}:${minute}`;
              const now = new Date();
              const isToday = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
              const isPastTime = isToday && (hour < now.getHours() || (hour === now.getHours() && minute === '00' && now.getMinutes() >= 30));
              return (
                <button
                onClick={() => !isPastTime && handleTimeClick(timeString)}
                className={`text-15 ${isPastTime ? 'bg-softwhitetheme text-subblack cursor-not-allowed' : 'hover:bg-[#335a06] hover:text-white'} font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-[#335A06] ${localStorage.getItem('darkMode')==='true'?'text-white':' text-blacktheme'} ${selectedTime === timeString ? 'bg-black text-white' : ''}`}
                key={index}
                disabled={!!isPastTime}
                >
                {timeString}
                </button>
              );
              })}
            </div>
            </div>
        )}

        {activeTab === 'guest' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              {selectedGuests} <span className="font-semibold">guests have been selected</span>
            </div>
            <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
              {[...Array(props.maxGuests ? props.maxGuests : 15)].map((_, index) => (
                <button
                  className={`text-15 hover:bg-[#335a06] hover:text-white font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-[#335A06] ${localStorage.getItem('darkMode')==='true'?'text-white':' text-blacktheme'} ${selectedGuests === index + 1 ? 'bg-black text-white' : ''}`}
                  key={index}
                  onClick={() => handleGuestClick(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'confirm' && (
          <div className="content">
            <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
              <span className='font-[500] mr-2'>Your reservation is set for</span> {selectedDate && format(selectedDate, 'dd MMMM yyyy')} <span className="font-semibold mx-2">at</span> 
              {selectedTime} <span className="font-semibold mx-2">for</span> 
              {selectedGuests} <span className="font-semibold">guests</span>
            </div>
            <div className="flex flex-wrap justify-center gap-[10px] p-[20px] rounded-[3px]">
              <button onClick={handleConfirmClick} className="btn-primary">
                Confirm
              </button>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationProcess;
