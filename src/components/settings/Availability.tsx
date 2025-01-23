import React, { useState } from 'react';
import { Plus, X, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

interface SlotData {
  type: string;
  start: string;
  end: string;
  placeLimit: number;
}

interface DayData {
  day: string;
  available: boolean;
  slots: SlotData[];
}

const Availability = () => {
  const [selectedArea, setSelectedArea] = useState('Restaurant');

  const areas = ['Restaurant', 'Table 01', 'Table 02'];

  const initialData: DayData[] = [
    { day: 'SUN', available: false, slots: [] },
    { day: 'MON', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'TUE', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'WED', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'THU', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'FRI', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'SAT', available: false, slots: [] },
  ];

  const [data, setData] = useState<DayData[]>(initialData);

  const toggleAvailability = (index: number) => {
    const newData = [...data];
    newData[index].available = !newData[index].available;
    if (!newData[index].available) newData[index].slots = [];
    else newData[index].slots = [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }];
    setData(newData);
  };

  const addSlot = (dayIndex: number) => {
    const newData = [...data];
    newData[dayIndex].slots.push({ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 });
    setData(newData);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newData = [...data];
    newData[dayIndex].slots.splice(slotIndex, 1);
    setData(newData);
  };

  const updateSlot = (
    dayIndex: number,
    slotIndex: number,
    field: keyof SlotData,
    value: string | number
  ) => {
    const newData = [...data];

    if (field === 'type' || field === 'start' || field === 'end') {
      newData[dayIndex].slots[slotIndex][field] = value as string;
    } else if (field === 'placeLimit') {
      newData[dayIndex].slots[slotIndex][field] = value as number;
    }

    setData(newData);
  };

  const { t } = useTranslation();

  const [manageWeekly, setManageWeekly] = useState(false);

  const [weeklySlots, setWeeklySlots] = useState<SlotData[]>([
    { type: '', start: '', end: '', placeLimit: 0 },
  ]);

  const updateWeeklySlot = (index: number, field: keyof SlotData, value: string | number) => {
    setWeeklySlots((prev) => {
      const updatedSlots = [...prev];
      updatedSlots[index] = { ...updatedSlots[index], [field]: value };
      return updatedSlots;
    });
  };

  const addWeeklySlot = () => {
    setWeeklySlots((prev) => [...prev, { type: '', start: '', end: '', placeLimit: 0 }]);
  };

  const applyWeeklyChanges = () => {
    const newData = data.map((day) => ({
      ...day,
      slots: [...weeklySlots],
    }));
    setData(newData);
    setManageWeekly(false); // Close the modal
  };

  const [pufferValue, setPufferValue] = useState<number | ''>('');

  return (
    <div className={` rounded-lg p-6 w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
      {manageWeekly && (
        <div>
          <div className="overlay" onClick={() => setManageWeekly(false)}></div>
          <div className={`popup w-fit lt-sm:w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
            <div className="flex justify-between">
              <h2 className="mb-3">{t('settingsPage.availability.manageWeek')}</h2>
            </div>
            {weeklySlots.map((slot, index) => (
              <div key={index} className="flex items-center gap-2 mb-2 lt-sm:flex-wrap">
                <div className='flex flex-col'>
                  <label className="text-sm ">{t('settingsPage.availability.type')}</label>
                  <input
                    type="text"
                    value={slot.type}
                    onChange={(e) => updateWeeklySlot(index, 'type', e.target.value)}
                    className={`inputs-unique lt-sm:w-full w-[10em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <label className="text-sm ">{t('settingsPage.availability.from')}</label>
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => updateWeeklySlot(index, 'start', e.target.value)}
                    className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <span>-</span>
                <div>
                  <label className="text-sm ">{t('settingsPage.availability.to')}</label>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => updateWeeklySlot(index, 'end', e.target.value)}
                    className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <span className="text-sm  w-[300px] ml-2">
                    {t('settingsPage.availability.placeLimitLabel')}
                  </span>
                  <input
                    type="number"
                    value={slot.placeLimit}
                    onChange={(e) => updateWeeklySlot(index, 'placeLimit', parseInt(e.target.value))}
                    className={`inputs-unique ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                  />
                </div>
                <X size={24} className="text-redtheme cursor-pointer mt-3" onClick={() => setWeeklySlots((prev) => prev.filter((_, i) => i !== index))} />
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

      <div className='flex justify-between mb-4 items-center'>
        <h2 className="text-2xl font-bold text-center ">{t('settingsPage.availability.title')}</h2>
        <div className="flex justify-center items-center gap-3">
          <label className="text-sm ">{t('settingsPage.availability.puffer')}</label>
          <input
            type="number"
            className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
            value={pufferValue}
            onChange={(e) => setPufferValue(parseInt(e.target.value) || '')}
          />
        </div>
      </div>
      <div className="flex justify-center gap-2 mb-6" onClick={() => setManageWeekly(true)}>
        <button className="btn-primary">Manage the whole week</button>
      </div>
      <div className="space-y-4 mx-4">
        {data.map((day, dayIndex) => (
          <div key={day.day} className="flex items-start">
            <div className={`flex mt-5 items-center gap-2 w-20 ${i18next.language === 'ar' && 'mt-2'}`}>
              <input
                type="checkbox"
                checked={day.slots.length > 0}
                onChange={() => toggleAvailability(dayIndex)}
                className="checkbox w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
              />
              <span className="font-medium">{day.day === 'SUN'? t('settingsPage.availability.days.sunday') : day.day === 'MON' ? t('settingsPage.availability.days.monday'): day.day === 'TUE' ? t('settingsPage.availability.days.tuesday'): day.day === 'WED' ? t('settingsPage.availability.days.wednesday'): day.day === 'THU' ? t('settingsPage.availability.days.thursday') : day.day === 'FRI' ? t('settingsPage.availability.days.friday') : t('settingsPage.availability.days.saturday')}</span>
            </div>
            
            <div className="flex-1 ">
              {day.slots.length > 0 ? (
                day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex  items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={slot.type}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'type', e.target.value)}
                      className={`inputs-unique w-[10em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'start', e.target.value)}
                      className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    <span>-</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'end', e.target.value)}
                      className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    <span className={`text-sm  w-[300px] ml-2 `}>{t('settingsPage.availability.placeLimitLabel')}</span>
                    <input
                      type="number"
                      value={slot.placeLimit}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'placeLimit', parseInt(e.target.value))}
                      className={`inputs-unique w-[4em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                      />
                    <button
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                      className="text-redtheme hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className={` mt-5 ${i18next.language === 'ar' && 'mt-2'}`}>{t('settingsPage.availability.unavailable')}</div>
              )}
            </div>
            <div className={`flex mt-4 items-center ${i18next.language=== 'ar' && 'mt-[.4em]'}`}>
              <button
                onClick={() => addSlot(dayIndex)}
                className="text-[#88AB61] hover:text-[#6A8A43] ml-2 "
              >
                <Plus size={16} />
              </button>
              
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default Availability;
