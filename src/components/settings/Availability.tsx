import React, { useState } from 'react'
import { Plus, X, Copy } from 'lucide-react'

const Availability = () => {
  const [selectedArea, setSelectedArea] = useState('Restaurant')

  const areas = ['Restaurant', 'Table 01', 'Table 02']

  const initialData = [
    { day: 'SUN', available: false, slots: [] },
    { day: 'MON', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'TUE', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'WED', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'THU', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'FRI', available: true, slots: [{ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 }] },
    { day: 'SAT', available: false, slots: [] },
  ]

  const [data, setData] = useState(initialData)

  const toggleAvailability = (index) => {
    const newData = [...data]
    newData[index].available = !newData[index].available
    if (!newData[index].available) newData[index].slots = []
    setData(newData)
  }

  const addSlot = (dayIndex) => {
    const newData = [...data]
    newData[dayIndex].slots.push({ type: 'Lunch', start: '09:00', end: '12:00', placeLimit: 15 })
    setData(newData)
  }

  const removeSlot = (dayIndex, slotIndex) => {
    const newData = [...data]
    newData[dayIndex].slots.splice(slotIndex, 1)
    setData(newData)
  }

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const newData = [...data]
    newData[dayIndex].slots[slotIndex][field] = value
    setData(newData)
  }

  return (
    <div className="bg-white rounded-lg p-6 w-full ">
      <h2 className="text-2xl font-bold text-center mb-4">Availability</h2>
      <div className="flex justify-center gap-2 mb-6">
        {areas.map((area) => (
          <button
            key={area}
            className={`btn-secondary ${
              selectedArea === area
                ? 'bg-[#88AB61] text-white'
                : 'bg-[#E8F0DE] text-[#88AB61]'
            }`}
            onClick={() => setSelectedArea(area)}
          >
            {area}
          </button>
        ))}
      </div>
      <div className="space-y-4 mx-20">
        {data.map((day, dayIndex) => (
          <div key={day.day} className="flex items-start">
            <div className="flex items-center gap-2 w-20">
              <input
                type="checkbox"
                checked={day.slots.length > 0}
                onChange={() => toggleAvailability(dayIndex)}
                className="w-5 h-5 rounded border-gray-300 text-[#88AB61] focus:ring-[#88AB61]"
              />
              <span className="font-medium">{day.day}</span>
            </div>
            <div className="flex-1">
              {day.slots.length > 0 ? (
                day.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex  items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={slot.type}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'type', e.target.value)}
                      className="border rounded px-2 py-1 w-24 text-sm"
                    />
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'start', e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'end', e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => removeSlot(dayIndex, slotIndex)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                    <span className="text-sm text-gray-500 w-[300px] ml-2">Place limit number</span>
                    <input
                      type="number"
                      value={slot.placeLimit}
                      onChange={(e) => updateSlot(dayIndex, slotIndex, 'placeLimit', e.target.value)}
                      className="border rounded px-2 py-1 w-16 text-sm"
                    />
                  </div>
                ))
              ) : (
                <span className="text-gray-500">Unavailable</span>
              )}
            </div>
            <div className='flex items-center'>
              <button
                onClick={() => addSlot(dayIndex)}
                className="text-[#88AB61] hover:text-[#6A8A43] ml-2"
              >
                <Plus size={16} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Copy className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Availability