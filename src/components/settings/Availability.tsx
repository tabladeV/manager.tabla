import React, { useEffect, useState } from 'react';
import { Plus, X, Copy, Check, CheckSquare, Square } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { BaseKey, BaseRecord, CanAccess, useCreate, useList, useUpdate } from '@refinedev/core';
import { id } from 'date-fns/locale';
import { set } from 'date-fns';

interface SlotData {
  name: string;
  start_shift: string;
  end_shift: string;
  place_limit: number;
}

interface DayData {
  id: BaseKey;
  day: string;
  closed_day: boolean;
  availability_hours: SlotData[];
}

const Availability = () => {
  useEffect(() => {
    document.title = 'Availability | Tabla'
  }, [])

  const [restaurantId, setRestaurantId] = useState<string>(localStorage.getItem('restaurant_id') || '0');
  const { data: availabilityDays, isLoading, error } = useList({
    resource: `api/v1/bo/availability/days/`,
  });

  const { mutate: updateAvailability } = useCreate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  });

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
          place_limit: slot.place_limit,
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
      newData[index].availability_hours = [];
    setData(newData);
  };

  const addSlot = (dayIndex: number) => {
    const newData = [...data];
    newData[dayIndex].availability_hours.push({
      name: 'Lunch',
      start_shift: '09:00',
      end_shift: '12:00',
      place_limit: 15,
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
    } else if (field === 'place_limit') {
      newData[dayIndex].availability_hours[slotIndex][field] = value as number;
    }
    setData(newData);
  };

  const { t } = useTranslation();
  const [manageWeekly, setManageWeekly] = useState(false);
  const [weeklySlots, setWeeklySlots] = useState<SlotData[]>([
    { name: '', start_shift: '', end_shift: '', place_limit: 0 },
  ]);

  const updateWeeklySlot = (index: number, field: keyof SlotData, value: string | number) => {
    setWeeklySlots((prev) => {
      const updatedSlots = [...prev];
      updatedSlots[index] = { ...updatedSlots[index], [field]: value };
      return updatedSlots;
    });
  };

  const addWeeklySlot = () => {
    setWeeklySlots((prev) => [...prev, { name: '', start_shift: '', end_shift: '', place_limit: 0 }]);
  };

  const applyWeeklyChanges = () => {
    const newData = data.map((day) => ({
      ...day,
      availability_hours: weeklySlots.map(slot => ({ ...slot })),
      closed_day: weeklySlots.length === 0,
    }));
    setData(newData);
    setManageWeekly(false); // Close the modal
  };

  const [pufferValue, setPufferValue] = useState<number | ''>('');

  const { mutate: updateDuration } = useUpdate({
    errorNotification(error, values, resource) {
      return {
        type: 'error',
        message: error?.formattedMessage,
      };
    },
  })

  const handleSaveAvailability = () => {
    const restaurantId = localStorage.getItem('restaurant_id');

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
        place_limit: slot.place_limit,
      }))
    }));
    const availabilitydays = newData;
    updateAvailability({
      resource: "api/v1/bo/availability/days/update_all/",
      values: {
        availability_days: availabilitydays
      },
    });
  }

  return (
    <div className={`rounded-lg p-4 md:p-6 w-full dark:bg-bgdarktheme bg-white`}>
      {manageWeekly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setManageWeekly(false)}></div>
          <div className={`relative rounded-lg p-4 md:p-6 w-full max-w-2xl mx-4 dark:bg-bgdarktheme bg-white`}>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('settingsPage.availability.manageWeek')}</h2>
              <button onClick={() => setManageWeekly(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            {weeklySlots.map((slot, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                <div className="flex flex-col w-full md:w-auto">
                  <label className="text-sm">{t('settingsPage.availability.type')}</label>
                  <input
                    type="text"
                    value={slot.name}
                    onChange={(e) => updateWeeklySlot(index, 'name', e.target.value)}
                    className={`inputs-unique w-full md:w-32 dark:bg-darkthemeitems bg-white`}
                  />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm">{t('settingsPage.availability.from')}</label>
                    <input
                      type="time"
                      value={slot.start_shift}
                      onChange={(e) => updateWeeklySlot(index, 'start_shift', e.target.value)}
                      className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                    />
                  </div>
                  <span className="self-end mb-2">-</span>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm">{t('settingsPage.availability.to')}</label>
                    <input
                      type="time"
                      value={slot.end_shift}
                      onChange={(e) => updateWeeklySlot(index, 'end_shift', e.target.value)}
                      className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                    />
                  </div>
                </div>
                <div className="flex flex-col w-full md:w-auto">
                  <label className="text-sm">
                    {t('settingsPage.availability.placeLimitLabel')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={slot.place_limit}
                      onChange={(e) => updateWeeklySlot(index, 'place_limit', parseInt(e.target.value))}
                      className={`inputs-unique w-20 dark:bg-darkthemeitems bg-white`}
                    />
                    {weeklySlots?.length>1 && <X
                      size={20}
                      className="text-redtheme cursor-pointer"
                      onClick={() => setWeeklySlots((prev) => prev.filter((_, i) => i !== index))}
                    />}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addWeeklySlot}
              className="hover:underline flex items-center gap-2 mb-4"
            >
              <Plus size={16} />
              {t('settingsPage.availability.addAnotherSlot')}
            </button>
            <button
              onClick={applyWeeklyChanges}
              className="btn-primary w-full"
            >
              {t('settingsPage.availability.applyToWeek')}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-4 items-start md:items-center">
        <h2 className="text-xl md:text-2xl font-bold">{t('settingsPage.availability.title')}</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm whitespace-nowrap">{t('settingsPage.availability.puffer')}</label>
          <CanAccess resource='availabilityday' action='change' fallback={duration}>
            <input
              type="string"
              className={`inputs w-24 dark:bg-darkthemeitems bg-white`}
              defaultValue={duration}
              onChange={(e) => setDuration(e.target.value.trim() || '')}
            />
          </CanAccess>
        </div>
      </div>

      <CanAccess resource='availabilityday' action='change'>
        <div className="flex justify-center mb-6">
          <button className="btn-primary w-full sm:w-auto" onClick={() => setManageWeekly(true)}>
            Manage the whole week
          </button>
        </div>
      </CanAccess>

      <div className="space-y-6">
        {data.sort((a, b) => (a.id > b.id ? 1 : -1)).map((day, dayIndex) => (
          <div key={day.day} className="flex flex-col border-b-2 dark:border-darkthemeitems sm:flex-row ">
            <div className={`flex items-center gap-2 w-full sm:w-20 mb-2 sm:mb-0 ${i18next.language === 'ar' && 'mt-2'}`}>
              <CanAccess
                resource='availabilityday'
                action='change'
                fallback={!day.closed_day ? <CheckSquare size={20} className="text-[#88AB61]" /> : <Square size={20} className="text-[#88AB61]" />}
              >
                <input
                  type="checkbox"
                  checked={!day.closed_day}
                  onChange={() => toggleAvailability(dayIndex)}
                  className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
                />
              </CanAccess>
              <span className="font-medium ">
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
                  <div key={slotIndex} className="flex flex-col  sm:flex-row sm:items-center gap-2 mb-4 sm:mb-2 border-b pb-3 sm:pb-2 sm:border-0">
                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto mb-2 sm:mb-0">
                      <CanAccess
                        resource='availabilityhour'
                        action='change'
                        fallback={
                          <div className="flex flex-col">
                            <label className="text-xs sm:hidden">Type</label>
                            <input
                              type="text"
                              value={slot.name}
                              disabled={true}
                              readOnly={true}
                              className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                            />
                          </div>
                        }
                      >
                        <div className="flex flex-col">
                          <label className="text-xs sm:hidden">Type</label>
                          <input
                            type="text"
                            value={slot.name}
                            onChange={(e) => updateSlot(dayIndex, slotIndex, 'name', e.target.value)}
                            className={`inputs-unique w-full sm:w-32 lg:w-72 dark:bg-darkthemeitems bg-white`}
                          />
                        </div>
                      </CanAccess>

                      <CanAccess
                        resource='availabilityhour'
                        action='change'
                        fallback={
                          <div className="flex flex-col">
                            <label className="text-xs sm:hidden">From</label>
                            <input
                              type="time"
                              value={slot.start_shift}
                              disabled={true}
                              readOnly={true}
                              className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                            />
                          </div>
                        }
                      >
                        <div className="flex flex-col">
                          <label className="text-xs sm:hidden">From</label>
                          <input
                            type="time"
                            value={slot.start_shift}
                            onChange={(e) => updateSlot(dayIndex, slotIndex, 'start_shift', e.target.value)}
                            className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                          />
                        </div>
                      </CanAccess>
                    </div>

                    <div className="hidden sm:block">-</div>

                    <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                      <CanAccess
                        resource='availabilityhour'
                        action='change'
                        fallback={
                          <div className="flex flex-col">
                            <label className="text-xs sm:hidden">To</label>
                            <input
                              type="time"
                              value={slot.end_shift}
                              disabled={true}
                              readOnly={true}
                              className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                            />
                          </div>
                        }
                      >
                        <div className="flex flex-col">
                          <label className="text-xs sm:hidden">To</label>
                          <input
                            type="time"
                            value={slot.end_shift}
                            onChange={(e) => updateSlot(dayIndex, slotIndex, 'end_shift', e.target.value)}
                            className={`inputs w-full dark:bg-darkthemeitems bg-white`}
                          />
                        </div>
                      </CanAccess>

                      <div className="flex flex-col">
                        <label className="text-xs sm:hidden">{t('settingsPage.availability.placeLimitLabel')}</label>
                        <div className="flex items-center gap-2">
                          <CanAccess
                            resource='availabilityhour'
                            action='change'
                            fallback={
                              <input
                                disabled={true}
                                readOnly={true}
                                value={slot.place_limit}
                                className={`inputs-unique w-full dark:bg-darkthemeitems bg-white`}
                              />
                            }
                          >
                            <input
                              type="number"
                              value={slot.place_limit}
                              onChange={(e) => updateSlot(dayIndex, slotIndex, 'place_limit', parseInt(e.target.value))}
                              className={`inputs-unique w-full sm:w-16 dark:bg-darkthemeitems bg-white`}
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
                      </div>
                    </div>

                    <div className="sm:hidden mt-2">
                      <span className="text-xs text-gray-500">
                        {t('settingsPage.availability.placeLimitLabel')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-2">
                  {t('settingsPage.availability.unavailable')}
                </div>
              )}

              {!day.closed_day && (
                <div className="mt-2">
                  <CanAccess resource='availabilityhour' action='add'>
                    <button
                      onClick={() => addSlot(dayIndex)}
                      className="flex items-center mb-3 text-[#88AB61] hover:text-[#6A8A43]"
                    >
                      <Plus size={16} />
                      <span className="ml-1 text-sm">Add slot</span>
                    </button>
                  </CanAccess>
                </div>
              )}
            </div>
          </div>
        ))}

        <CanAccess resource='availabilityday' action='change'>
          <div className="flex flex-col justify-center sm:flex-row gap-2 mt-6 pt-4">
            <button onClick={() => { setData(fetchedData) }} className="btn-secondary w-full sm:w-1/4">
              {t('settingsPage.availability.cancel')}
            </button>
            <button onClick={handleSaveAvailability} className="btn-primary w-full sm:w-1/4">
              {t('settingsPage.availability.save')}
            </button>
          </div>
        </CanAccess>
      </div>
    </div>
  );
};

export default Availability;