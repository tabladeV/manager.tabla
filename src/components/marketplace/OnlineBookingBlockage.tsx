import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Plus, Trash2, AlertCircle, Ban } from 'lucide-react'

interface BookingBlockage {
  id: string
  title: string
  description?: string
  type: 'date' | 'time' | 'recurring'
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  recurringDays?: number[] // 0 = Sunday, 1 = Monday, etc.
  isActive: boolean
}

const OnlineBookingBlockage: React.FC = () => {
  const { t } = useTranslation()
  const [blockages, setBlockages] = useState<BookingBlockage[]>([
    {
      id: '1',
      title: 'Christmas Day',
      description: 'Restaurant closed for Christmas',
      type: 'date',
      startDate: '2024-12-25',
      isActive: true
    },
    {
      id: '2',
      title: 'Kitchen Break',
      description: 'Daily kitchen break',
      type: 'time',
      startDate: '2024-01-01',
      startTime: '15:00',
      endTime: '17:00',
      isActive: true
    },
    {
      id: '3',
      title: 'Weekly Maintenance',
      description: 'Every Monday morning',
      type: 'recurring',
      startDate: '2024-01-01',
      startTime: '09:00',
      endTime: '11:00',
      recurringDays: [1], // Monday
      isActive: true
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<BookingBlockage>>({
    type: 'date',
    isActive: true
  })

  const dayNames = [
    t('common.days.sunday'),
    t('common.days.monday'),
    t('common.days.tuesday'),
    t('common.days.wednesday'),
    t('common.days.thursday'),
    t('common.days.friday'),
    t('common.days.saturday')
  ]

  const handleSubmit = () => {
    if (formData.title && formData.startDate && formData.type) {
      const newBlockage: BookingBlockage = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        recurringDays: formData.recurringDays,
        isActive: formData.isActive || true
      }
      setBlockages(prev => [...prev, newBlockage])
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'date',
      isActive: true
    })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    setBlockages(prev => prev.filter(blockage => blockage.id !== id))
  }

  const toggleBlockageStatus = (id: string) => {
    setBlockages(prev => prev.map(blockage => 
      blockage.id === id ? { ...blockage, isActive: !blockage.isActive } : blockage
    ))
  }

  const handleRecurringDayToggle = (day: number) => {
    const currentDays = formData.recurringDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort()
    
    setFormData(prev => ({ ...prev, recurringDays: newDays }))
  }

  const getBlockageIcon = (type: string) => {
    switch (type) {
      case 'date':
        return <Calendar className="w-5 h-5" />
      case 'time':
        return <Clock className="w-5 h-5" />
      case 'recurring':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Ban className="w-5 h-5" />
    }
  }

  const formatBlockageDetails = (blockage: BookingBlockage) => {
    switch (blockage.type) {
      case 'date':
        if (blockage.endDate) {
          return `${new Date(blockage.startDate).toLocaleDateString()} - ${new Date(blockage.endDate).toLocaleDateString()}`
        }
        return new Date(blockage.startDate).toLocaleDateString()
      case 'time':
        return `${blockage.startTime} - ${blockage.endTime}`
      case 'recurring': {
        const days = blockage.recurringDays?.map(day => dayNames[day]).join(', ') || ''
        return `${days} ${blockage.startTime} - ${blockage.endTime}`
      }
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
            {t('marketplace.booking.title')}
          </h2>
          <p className="text-subblack dark:text-softwhitetheme mt-1">
            {t('marketplace.booking.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-greentheme text-whitetheme rounded-lg hover:bg-greentheme/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('marketplace.booking.addBlockage')}
        </button>
      </div>

      {/* Add Blockage Form */}
      {showForm && (
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <h3 className="text-lg font-semibold mb-4 text-blacktheme dark:text-textdarktheme">
            {t('marketplace.booking.createBlockage')}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                  {t('marketplace.booking.title')}
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                  placeholder={t('marketplace.booking.titlePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                  {t('marketplace.booking.type')}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as BookingBlockage['type'] }))}
                  className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                >
                  <option value="date">{t('marketplace.booking.specificDate')}</option>
                  <option value="time">{t('marketplace.booking.dailyTime')}</option>
                  <option value="recurring">{t('marketplace.booking.recurringTime')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                {t('marketplace.booking.description')}
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                placeholder={t('marketplace.booking.descriptionPlaceholder')}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                  {formData.type === 'date' ? t('marketplace.booking.startDate') : t('marketplace.booking.effectiveFrom')}
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                />
              </div>
              {formData.type === 'date' && (
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                    {t('marketplace.booking.endDate')} ({t('common.optional')})
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                  />
                </div>
              )}
            </div>

            {/* Time Range */}
            {(formData.type === 'time' || formData.type === 'recurring') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                    {t('marketplace.booking.startTime')}
                  </label>
                  <input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                    {t('marketplace.booking.endTime')}
                  </label>
                  <input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                  />
                </div>
              </div>
            )}

            {/* Recurring Days */}
            {formData.type === 'recurring' && (
              <div>
                <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                  {t('marketplace.booking.recurringDays')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleRecurringDayToggle(index)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        formData.recurringDays?.includes(index)
                          ? 'bg-softgreentheme text-greentheme dark:bg-greentheme/20 dark:text-greentheme'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-subblack dark:text-softwhitetheme hover:text-blacktheme dark:hover:text-textdarktheme transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-greentheme text-whitetheme rounded-lg hover:bg-greentheme/90 transition-colors"
            >
              {t('marketplace.booking.createBlockage')}
            </button>
          </div>
        </div>
      )}

      {/* Blockages List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {t('marketplace.booking.activeBlockages')}
        </h3>
        
        {blockages.map((blockage) => (
          <div
            key={blockage.id}
            className="bg-whitetheme dark:bg-darkthemeitems p-4 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-softgreentheme dark:bg-greentheme/20 rounded-lg">
                  {getBlockageIcon(blockage.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blacktheme dark:text-textdarktheme">
                    {blockage.title}
                  </h4>
                  {blockage.description && (
                    <p className="text-subblack dark:text-softwhitetheme text-sm mt-1">
                      {blockage.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-subblack dark:text-softwhitetheme">
                    <span className="capitalize">
                      {t(`marketplace.booking.${blockage.type}`)}
                    </span>
                    <span>
                      {formatBlockageDetails(blockage)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBlockageStatus(blockage.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    blockage.isActive
                      ? 'bg-softgreentheme text-greentheme dark:bg-greentheme/20 dark:text-greentheme'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}
                >
                  {blockage.isActive ? t('common.active') : t('common.inactive')}
                </button>
                <button
                  onClick={() => handleDelete(blockage.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {blockages.length === 0 && (
          <div className="text-center py-8 text-subblack dark:text-softwhitetheme">
            <Ban className="w-12 h-12 mx-auto mb-4 text-subblack dark:text-softwhitetheme" />
            <p>{t('marketplace.booking.noBlockages')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnlineBookingBlockage
