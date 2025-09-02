import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Edit2, Trash2, Wifi, Car, Music, UtensilsCrossed, Baby, Cigarette, Users, Phone } from 'lucide-react'

interface ExtraService {
  id: string
  name: string
  description: string
  icon: string
  isActive: boolean
  price?: number
  category: 'amenity' | 'service' | 'feature'
}

const ExtraServices: React.FC = () => {
  const { t } = useTranslation()
  const [services, setServices] = useState<ExtraService[]>([
    {
      id: '1',
      name: 'Free WiFi',
      description: 'High-speed internet access',
      icon: 'wifi',
      isActive: true,
      category: 'amenity'
    },
    {
      id: '2',
      name: 'Valet Parking',
      description: 'Professional parking service',
      icon: 'car',
      isActive: true,
      price: 15,
      category: 'service'
    },
    {
      id: '3',
      name: 'Live Music',
      description: 'Live performances on weekends',
      icon: 'music',
      isActive: true,
      category: 'feature'
    },
    {
      id: '4',
      name: 'Private Dining',
      description: 'Exclusive dining rooms available',
      icon: 'users',
      isActive: false,
      price: 100,
      category: 'service'
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<ExtraService | null>(null)
  const [formData, setFormData] = useState<Partial<ExtraService>>({
    category: 'amenity',
    isActive: true,
    icon: 'utensils'
  })

  const iconMap = {
    wifi: Wifi,
    car: Car,
    music: Music,
    utensils: UtensilsCrossed,
    baby: Baby,
    cigarette: Cigarette,
    users: Users,
    phone: Phone
  }

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || UtensilsCrossed
    return <IconComponent className="w-5 h-5" />
  }

  const handleSubmit = () => {
    if (formData.name && formData.description && formData.icon && formData.category) {
      if (editingService) {
        // Update existing service
        setServices(prev => prev.map(service => 
          service.id === editingService.id 
            ? { ...service, ...formData as ExtraService }
            : service
        ))
      } else {
        // Add new service
        const newService: ExtraService = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          isActive: formData.isActive || true,
          price: formData.price
        }
        setServices(prev => [...prev, newService])
      }
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      category: 'amenity',
      isActive: true,
      icon: 'utensils'
    })
    setShowForm(false)
    setEditingService(null)
  }

  const handleEdit = (service: ExtraService) => {
    setEditingService(service)
    setFormData(service)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id))
  }

  const toggleServiceStatus = (id: string) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, isActive: !service.isActive } : service
    ))
  }

  const getCategoryServices = (category: ExtraService['category']) => {
    return services.filter(service => service.category === category)
  }

  const categories = [
    { key: 'amenity', title: t('marketplace.extraServices.amenities') },
    { key: 'service', title: t('marketplace.extraServices.services') },
    { key: 'feature', title: t('marketplace.extraServices.features') }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
            {t('marketplace.extraServices.title')}
          </h2>
          <p className="text-subblack dark:text-softwhitetheme mt-1">
            {t('marketplace.extraServices.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-greentheme text-whitetheme rounded-lg hover:bg-greentheme/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('marketplace.extraServices.addService')}
        </button>
      </div>

      {/* Add/Edit Service Form */}
      {showForm && (
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <h3 className="text-lg font-semibold mb-4 text-blacktheme dark:text-textdarktheme">
            {editingService 
              ? t('marketplace.extraServices.editService')
              : t('marketplace.extraServices.addService')
            }
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                {t('marketplace.extraServices.name')}
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                placeholder={t('marketplace.extraServices.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                {t('marketplace.extraServices.category')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ExtraService['category'] }))}
                className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
              >
                <option value="amenity">{t('marketplace.extraServices.amenity')}</option>
                <option value="service">{t('marketplace.extraServices.service')}</option>
                <option value="feature">{t('marketplace.extraServices.feature')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                {t('marketplace.extraServices.icon')}
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
              >
                <option value="wifi">WiFi</option>
                <option value="car">Parking</option>
                <option value="music">Music</option>
                <option value="utensils">Dining</option>
                <option value="baby">Kids Friendly</option>
                <option value="cigarette">Smoking Area</option>
                <option value="users">Private Events</option>
                <option value="phone">Reservations</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                {t('marketplace.extraServices.price')} ({t('common.optional')})
              </label>
              <input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blacktheme dark:text-softwhitetheme mb-2">
                {t('marketplace.extraServices.description')}
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-bgdarktheme dark:text-textdarktheme"
                placeholder={t('marketplace.extraServices.descriptionPlaceholder')}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
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
              {editingService ? t('common.update') : t('common.add')}
            </button>
          </div>
        </div>
      )}

      {/* Services by Category */}
      {categories.map(category => (
        <div key={category.key} className="space-y-4">
          <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
            {category.title}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getCategoryServices(category.key as ExtraService['category']).map((service) => (
              <div
                key={service.id}
                className="bg-whitetheme dark:bg-darkthemeitems p-4 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-softgreentheme dark:bg-greentheme/20 rounded-lg">
                      {getIcon(service.icon)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blacktheme dark:text-textdarktheme">
                        {service.name}
                      </h4>
                      {service.price && (
                        <span className="text-greentheme dark:text-greentheme font-medium">
                          ${service.price}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-1 text-subblack hover:text-greentheme dark:text-softwhitetheme dark:hover:text-greentheme transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1 text-subblack hover:text-red-600 dark:text-softwhitetheme dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-subblack dark:text-softwhitetheme text-sm mb-3">
                  {service.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-subblack dark:text-softwhitetheme capitalize">
                    {t(`marketplace.extraServices.${service.category}`)}
                  </span>
                  <button
                    onClick={() => toggleServiceStatus(service.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      service.isActive
                        ? 'bg-softgreentheme text-greentheme dark:bg-greentheme/20 dark:text-greentheme'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                  >
                    {service.isActive ? t('common.active') : t('common.inactive')}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {getCategoryServices(category.key as ExtraService['category']).length === 0 && (
            <div className="text-center py-8 text-subblack dark:text-softwhitetheme">
              {t('marketplace.extraServices.noServices')}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ExtraServices
