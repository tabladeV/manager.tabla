import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import OurCalendar from '../Calendar/OurCalendar';
import { useList } from '@refinedev/core';

// Define interfaces for availability data
interface AvailabilityHour {
  id: number;
  name: string;
  start_shift: string;
  end_shift: string;
  place_limit: number;
}

interface AvailabilityDay {
  id: number;
  day: string;
  closed_day: boolean;
  created_at: string;
  edit_at: string;
  restaurant: number;
  availability_hours: AvailabilityHour[];
}

interface GroupedTimeSlot {
  name: string;
  timeSlots: string[];
}

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
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<GroupedTimeSlot[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);

  // Fetch available days
  const { data: availabilityDays, isFetching, isLoading, error } = useList<AvailabilityDay>({
    resource: `api/v1/bo/availability/days/`,
  });

  // Process available time slots when date is selected
  useEffect(() => {
    if (selectedDate && availabilityDays?.data) {
      const dayOfWeek = format(selectedDate, 'EEE').toUpperCase();
      const selectedAvailabilityDay = availabilityDays.data.find(day => day.day === dayOfWeek);
      
      if (selectedAvailabilityDay && !selectedAvailabilityDay.closed_day) {
        const grouped: GroupedTimeSlot[] = [];
        
        selectedAvailabilityDay.availability_hours.forEach(hour => {
          const slots: string[] = [];
          
          // Parse start and end times
          const [startHour, startMin] = hour.start_shift.split(':').map(Number);
          const [endHour, endMin] = hour.end_shift.split(':').map(Number);
          
          // Round start time up to the nearest 30 min
          let currentHour = startHour;
          let currentMin = startMin >= 30 ? 30 : 0;
          if (startMin > 0 && startMin < 30) {
            currentMin = 30;
          }
          
          // Round end time down to the nearest 30 min
          const endTimeHour = endHour;
          let endTimeMin = endMin <= 30 ? 0 : 30;
          if (endMin > 0 && endMin < 30) {
            endTimeMin = 0;
          }
          
          // Generate time slots in 30-minute intervals
          while (
            currentHour < endTimeHour || 
            (currentHour === endTimeHour && currentMin <= endTimeMin)
          ) {
            const formattedHour = currentHour < 10 ? `0${currentHour}` : currentHour;
            const formattedMin = currentMin === 0 ? '00' : currentMin;
            slots.push(`${formattedHour}:${formattedMin}`);
            
            // Increment by 30 minutes
            if (currentMin === 30) {
              currentHour++;
              currentMin = 0;
            } else {
              currentMin = 30;
            }
          }
          
          if (slots.length > 0) {
            grouped.push({
              name: hour.name,
              timeSlots: slots
            });
          }
        });
        
        setGroupedTimeSlots(grouped);
      } else {
        // No availability for this day or closed day
        setGroupedTimeSlots([]);
      }
    }
  }, [selectedDate, availabilityDays]);

  // Handle tab change with transition
  const handleTabChange = (tab: 'date' | 'time' | 'guest' | 'confirm' | null) => {
    if (activeTab === tab) return;
    
    setIsTransitioning(true);
    setContentVisible(false);
    
    setTimeout(() => {
      setActiveTab(tab);
      
      setTimeout(() => {
        setContentVisible(true);
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    const formattedDate = format(day, 'yyyy-MM-dd');
    setSelectedData((prevData) => ({ ...prevData, reserveDate: formattedDate.toString() }));
    handleTabChange('time');
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setSelectedData((prevData) => ({ ...prevData, time }));
    handleTabChange('guest');
  };

  const handleGuestClick = (guest: number) => {
    setSelectedGuests(guest);
    setSelectedData((prevData) => ({ ...prevData, guests: guest }));
    handleTabChange('confirm');
  };
  
  const handleConfirmClick = () => {
    props.getDateTime(selectedData);
    props.onClick();
  }

  // Check if a time slot is in the past
  const isTimeSlotInPast = (timeString: string): boolean => {
    if (!selectedDate) return false;
    
    const now = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
    
    if (!isToday) return false;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours < now.getHours() || (hours === now.getHours() && minutes <= now.getMinutes()));
  }

  return (
    <div className="">
      <div className="overlay z-[309] glassmorphism" onClick={props.onClick}></div>
      <div className={`popup z-[360] lt-sm:min-h-[70vh] sm:w-[30em] lt-sm:bottom-0 lt-sm:w-full rounded-[10px] dark:bg-bgdarktheme bg-white`}>
        <div className="flex justify-center gap-5 mt-[1em]">
          { (
            <span
              className={activeTab === 'date' ? 'activetabb' : 'p-[10px] cursor-pointer'}
              onClick={() => handleTabChange('date')}
              id="date"
            >
              Date
            </span>
          )}
          { (
            <span
              className={`${activeTab === 'time' ? 'activetabb' : 'p-[10px]'} ${selectedDate ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => selectedDate && handleTabChange('time')}
              id="time"
            >
              Time
            </span>
          )}
          { (
            <span
              className={`${activeTab === 'guest' ? 'activetabb' : 'p-[10px]'} ${selectedTime ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => selectedTime && handleTabChange('guest')}
              id="guest"
            >
              Guest
            </span>
          )}
        </div>

        <div className={`transition-all duration-300 ease-in-out ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
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
              <div className="h-[284px] overflow-y-auto p-[20px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#335A06]"></div>
                  </div>
                ) : groupedTimeSlots.length > 0 ? (
                  groupedTimeSlots.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-4">
                      <h3 className="text-left text-lg font-semibold mb-2 text-[#335A06] border-b border-[#335A06] pb-1">{group.name}</h3>
                      <div className="flex flex-wrap justify-start gap-[10px]">
                        {group.timeSlots.map((timeString, index) => {
                          const isPastTime = isTimeSlotInPast(timeString);
                          return (
                            <button
                              onClick={() => !isPastTime && handleTimeClick(timeString)}
                              className={`text-15 ${isPastTime ? 'bg-softwhitetheme text-subblack cursor-not-allowed' : 'hover:bg-[#335a06] hover:text-white'} font-bold h-[65px] w-[65px] flex items-center justify-center border-solid border-[1px] border-[#335A06] ${localStorage.getItem('darkMode')==='true'?'text-white':' text-blacktheme'} ${selectedTime === timeString ? 'bg-black text-white' : ''} transition-colors duration-200`}
                              key={index}
                              disabled={isPastTime}
                            >
                              {timeString}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-center text-gray-500">No available time slots for this date</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guest' && (
            <div className="content">
              <div className="text-[20px] text-left mx-[30px] mt-[1em] mb-[.5em] font-bold">
                {selectedGuests?<>{selectedGuests} <span className="font-semibold">guests have been selected</span></>:''}
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
                {!props.maxGuests && <>
                <div className="text-center w-full my-2"> Or Enter number of guests </div>
                </>}
                {
                  !props.maxGuests && 
                  <div>
                    <div className="flex rounded-lg">
                    <input type="number" min={1} name='note' placeholder="Enter number of guests" value={selectedGuests as number}
                          className='w-full p-3 border border-gray-300 dark:border-darkthemeitems rounded-s-lg bg-white dark:bg-darkthemeitems text-black dark:text-white'
                          onChange={(e) => setSelectedGuests(Number(e.target.value))} />
                      <button type="button" onClick={() => handleGuestClick(Number(selectedGuests))} className="btn-primary rounded-none rounded-e-lg">
                        Confirm
                      </button>
                    </div>
                  </div>
                }
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
    </div>
  );
};

export default ReservationProcess;
