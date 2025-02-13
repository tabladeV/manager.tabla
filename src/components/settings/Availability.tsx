import React, { useEffect, useState } from 'react';
import { Plus, X, Copy, Check, CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { BaseKey, BaseRecord, CanAccess, useCreate, useList, useUpdate } from '@refinedev/core';
import { id } from 'date-fns/locale';
import { set } from 'date-fns';

interface SlotData {
  name: string; // Renamed from 'type'
  start_shift: string; // Renamed from 'start'
  end_shift: string; // Renamed from 'end'
  max_party_size: number; // Renamed from 'placeLimit'
}

interface DayData {
  id: BaseKey;
  day: string;
  closed_day: boolean; // Renamed from 'available' (inverted logic)
  availability_hours: SlotData[]; // Renamed from 'slots'
}

const Availability = () => {
  const [restaurantId, setRestaurantId] = useState<string>(localStorage.getItem('restaurant_id') || '0');
  const { data: availabilityDays, isLoading, error } = useList({
    resource: `api/v1/bo/availability/days/`,

  });

  const { mutate: updateAvailability } = useCreate();

  const { data: restaurantData, isLoading: restaurantLoading, error: restaurantError } = useList({
    resource: `api/v1/bo/restaurants/${restaurantId}/current/`,
  });





  const [duration, setDuration] = useState<string>('');

  useEffect(() => {
    if (restaurantData?.data) {
      setDuration((restaurantData.data as BaseRecord).reservation_max_duration as string);
    }
  }, [restaurantData]);

  const [selectedArea, setSelectedArea] = useState('Restaurant');
  const areas = ['Restaurant', 'Table 01', 'Table 02'];

  const initialData: DayData[] = [
    { id: 1, day: 'SUN', closed_day: true, availability_hours: [] },
    { id: 2, day: 'MON', closed_day: true, availability_hours: [] },
    { id: 3, day: 'TUE', closed_day: true, availability_hours: [] },
    { id: 4, day: 'WED', closed_day: true, availability_hours: [] },
    { id: 5, day: 'THU', closed_day: true, availability_hours: [] },
    { id: 6, day: 'FRI', closed_day: true, availability_hours: [] },
    { id: 7, day: 'SAT', closed_day: true, availability_hours: [] },
  ];

  const [data, setData] = useState<DayData[]>(initialData);

  const [fetchedData, setFetchedData] = useState<DayData[]>(initialData)

  useEffect(() => {
    if (availabilityDays?.data) {
      const newData = availabilityDays.data as BaseRecord[];
      const updatedData = newData.map((day) => ({
        id: day.id as BaseKey,
        day: day.day,
        closed_day: day.closed_day,
        availability_hours: day.availability_hours.map((slot: any) => ({
          name: slot.name,
          start_shift: slot.start_shift,
          end_shift: slot.end_shift,
          max_party_size: slot.max_party_size,
        })),
      }));
      setData(updatedData);
      setFetchedData(availabilityDays.data as DayData[]);
    }
  }, [availabilityDays]);

  const toggleAvailability = (index: number) => {
    const newData = [...data];
    newData[index].closed_day = !newData[index].closed_day;
    if (newData[index].closed_day) newData[index].availability_hours = [];
    else
      newData[index].availability_hours = [
        
      ];
    setData(newData);
  };

  const addSlot = (dayIndex: number) => {
    const newData = [...data];
    newData[dayIndex].availability_hours.push({
      name: 'Lunch',
      start_shift: '09:00',
      end_shift: '12:00',
      max_party_size: 15,
    });
    setData(newData);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newData = [...data];
    newData[dayIndex].availability_hours.splice(slotIndex, 1);
    setData(newData);
  };

  const updateSlot = (
    dayIndex: number,
    slotIndex: number,
    field: keyof SlotData,
    value: string | number
  ) => {
    const newData = [...data];
    if (field === 'name' || field === 'start_shift' || field === 'end_shift') {
      newData[dayIndex].availability_hours[slotIndex][field] = value as string;
    } else if (field === 'max_party_size') {
      newData[dayIndex].availability_hours[slotIndex][field] = value as number;
    }
    setData(newData);
  };

  const { t } = useTranslation();
  const [manageWeekly, setManageWeekly] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState<SlotData[]>([
    { name: '', start_shift: '', end_shift: '', max_party_size: 0 },
  ]);

  const updateWeeklySlot = (index: number, field: keyof SlotData, value: string | number) => {
    setWeeklySlots((prev) => {
      const updatedSlots = [...prev];
      updatedSlots[index] = { ...updatedSlots[index], [field]: value };
      return updatedSlots;
    });
  };

  const addWeeklySlot = () => {
    setWeeklySlots((prev) => [...prev, { name: '', start_shift: '', end_shift: '', max_party_size: 0 }]);
  };

  const applyWeeklyChanges = () => {
    const newData = data.map((day) => ({
      ...day,
      availability_hours: [...weeklySlots],
      closed_day: weeklySlots.length === 0,
    }));
    setData(newData);
    setManageWeekly(false); // Close the modal
  };

  const [pufferValue, setPufferValue] = useState<number | ''>('');

  const { mutate: updateDuration } = useUpdate()

  const handleSaveAvailability = () => {

    const restaurantId = localStorage.getItem('restaurantId') || '0';

    updateDuration({
      resource: "api/v1/bo/restaurants",
      values: {
        reservation_max_duration: duration,
      },
      id: restaurantId + "/", // Ensure the ID is appended correctly
    });

    const newData = data.map((day) => ({
      day: day.day,
      closed_day: day.closed_day,
      availability_hours: day.availability_hours.map((slot) => ({
        name: slot.name,
        start_shift: slot.start_shift,
        end_shift: slot.end_shift,
        max_party_size: slot.max_party_size,
      }))
    }));
    const availabilitydays = newData;
    console.log(data);
    updateAvailability({
      resource: "api/v1/bo/availability/days/update_all/",
      values: {
        availability_days: availabilitydays
      },
    });
  }

  return (
    <div className={`rounded-lg p-6 w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
      {manageWeekly && (
        <div>
          <div className="overlay" onClick={() => setManageWeekly(false)}></div>
          <div className={`popup w-fit lt-sm:w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
            <div className="flex justify-between">
              <h2 className="mb-3">{t('settingsPage.availability.manageWeek')}</h2>
            </div>
            {weeklySlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2 mb-2 lt-sm:flex-wrap">
                <div className="flex flex-col">
                  <label className="text-sm">{t('settingsPage.availability.type')}</label>
                  <input
                    type="text"
                    value={slot.name}
                    onChange={(e) => updateWeeklySlot(index, 'name', e.target.value)}
                    className={`inputs-unique lt-sm:w-full w-[10em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <label className="text-sm">{t('settingsPage.availability.from')}</label>
                  <input
                    type="time"
                    value={slot.start_shift}
                    onChange={(e) => updateWeeklySlot(index, 'start_shift', e.target.value)}
                    className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <span>-</span>
                <div>
                  <label className="text-sm">{t('settingsPage.availability.to')}</label>
                  <input
                    type="time"
                    value={slot.end_shift}
                    onChange={(e) => updateWeeklySlot(index, 'end_shift', e.target.value)}
                    className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <span className="text-sm w-[300px] ml-2">
                    {t('settingsPage.availability.placeLimitLabel')}
                  </span>
                  <input
                    type="number"
                    value={slot.max_party_size}
                    onChange={(e) => updateWeeklySlot(index, 'max_party_size', parseInt(e.target.value))}
                    className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <X
                  size={24}
                  className="text-redtheme cursor-pointer mt-3"
                  onClick={() => setWeeklySlots((prev) => prev.filter((_, i) => i !== index))}
                />
              </div>
            ))}
            <button onClick={addWeeklySlot} className="hover:underline flex items-center gap-2">
              <Plus size={16} />
              {t('settingsPage.availability.addAnotherSlot')}
            </button>
            <button onClick={applyWeeklyChanges} className="btn-primary mt-4">
              {t('settingsPage.availability.applyToWeek')}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-2xl font-bold text-center">{t('settingsPage.availability.title')}</h2>
        <div className="flex justify-center items-center gap-3">
          <label className="text-sm">{t('settingsPage.availability.puffer')}</label>
          <CanAccess resource='availabilityday' action='change' fallback={duration}>
            <input
              type="string"
              className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
              defaultValue={duration}
              onChange={(e) => setDuration(e.target.value.trim() || '')}
            />
          </CanAccess>
        </div>
      </div>
      <CanAccess resource='availabilityday' action='change'>
        <div className="flex justify-center gap-2 mb-6" onClick={() => setManageWeekly(true)}>
          <button className="btn-primary">Manage the whole week</button>
        </div>
      </CanAccess>
      <div className="space-y-4 mx-4">
        {data.sort((a, b) => (a.id > b.id ? 1 : -1)).map((day, dayIndex) => (
          <div key={day.day} className="flex items-start">
            <div className={`flex mt-5 items-center gap-2 w-20 ${i18next.language === 'ar' && 'mt-2'}`}>

              <CanAccess resource='availabilityday' action='change' fallback={!day.closed_day ? <CheckSquare size={20} className="text-[#88AB61]" /> : <Square size={20} className="text-[#88AB61]" />}>
                <input
                  type="checkbox"
                  checked={!day.closed_day}
                  onChange={() => toggleAvailability(dayIndex)}
                  className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                />
              </CanAccess>
              <span className="font-medium">
                {day.day === 'SUN'
                  ? t('settingsPage.availability.days.sunday')
                  : day.day === 'MON'
                    ? t('settingsPage.availability.days.monday')
                    : day.day === 'TUE'
                      ? t('settingsPage.availability.days.tuesday')
                      : day.day === 'WED'
                        ? t('settingsPage.availability.days.wednesday')
                        : day.day === 'THU'
                          ? t('settingsPage.availability.days.thursday')
                          : day.day === 'FRI'
                            ? t('settingsPage.availability.days.friday')
                            : t('settingsPage.availability.days.saturday')}
              </span>
            </div>
            <div className="flex-1">
              {!day.closed_day ? (
                day.availability_hours.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex items-center gap-2 mb-2">
                    <CanAccess resource='availabilityhour' action='change' fallback={
                      <input
                        type="text"
                        value={slot.name}
                        disabled={true}
                        readOnly={true}
                        className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    } >
                    <input
                      type="text"
                      value={slot.name}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'name', e.target.value)}
                      className={`inputs-unique w-[10em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                    />
                    </CanAccess>
                    
                    <CanAccess resource='availabilityhour' action='change' fallback={
                      <input
                        type="time"
                        value={slot.start_shift}
                        disabled={true}
                        readOnly={true}
                        className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    } >
                    <input
                      type="time"
                      value={slot.start_shift}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'start_shift', e.target.value)}
                      className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                    />
                    </CanAccess>
                    <span>-</span>

                    <CanAccess resource='availabilityhour' action='change' fallback={
                      <input
                        type="time"
                        value={slot.end_shift}
                        disabled={true}
                        readOnly={true}
                        className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    } >
                      <input
                        type="time"
                        value={slot.end_shift}
                        onChange={(e) => updateSlot(dayIndex, slotIndex, 'end_shift', e.target.value)}
                        className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    </CanAccess>
                    <span className={`text-sm w-[300px] ml-2`}>
                      {t('settingsPage.availability.placeLimitLabel')}
                    </span>
                    <CanAccess resource='availabilityhour' action='change' fallback={
                      <input
                        disabled={true}
                        readOnly={true}
                        value={slot.max_party_size}
                        className={`inputs-unique w-[4em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    } >
                      <input
                        type="number"
                        disabled={true}
                        readOnly={true}
                        value={slot.max_party_size}
                        onChange={(e) => updateSlot(dayIndex, slotIndex, 'max_party_size', parseInt(e.target.value))}
                        className={`inputs-unique w-[4em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    </CanAccess>
                    <CanAccess resource='availabilityhour' action='remove'>
                      <button
                        onClick={() => removeSlot(dayIndex, slotIndex)}
                        className="text-redtheme hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </CanAccess>

                  </div>
                ))
              ) : (
                <div className={`mt-5 ${i18next.language === 'ar' && 'mt-2'}`}>
                  {t('settingsPage.availability.unavailable')}
                </div>
              )}
            </div>
            <div className={`flex mt-4 items-center ${i18next.language === 'ar' && 'mt-[.4em]'}`}>
              <CanAccess resource='availabilityhour' action='add'>
                <button
                  onClick={() => addSlot(dayIndex)}
                  className="text-[#88AB61] hover:text-[#6A8A43] ml-2"
                >
                  <Plus size={16} />
                </button>
              </CanAccess>
            </div>
          </div>
        ))}
        <CanAccess resource='availabilityday' action='change'>
          <div className="flex justify-center gap-2 mt-6">
            <button onClick={handleSaveAvailability} className="btn-primary">{t('settingsPage.availability.save')}</button>
            <button onClick={() => { setData(fetchedData) }} className="btn-secondary">{t('settingsPage.availability.cancel')}</button>
          </div>
        </CanAccess>
      </div>
    </div>
  );
};

export default Availability;