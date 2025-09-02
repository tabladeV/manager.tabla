import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Plus, Percent, Gift } from 'lucide-react'

interface Offer {
  id: string
  name: string
  description: string
  type: 'percentage' | 'fixed' | 'item'
  value: number
  validFrom: string
  validTo: string
  isActive: boolean
  conditions?: string
}

const Offers: React.FC = () => {
  const { t } = useTranslation()
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      name: 'Happy Hour',
      description: '20% off on all drinks',
      type: 'percentage',
      value: 20,
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      isActive: true,
      conditions: 'Valid from 5 PM to 7 PM'
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    type: 'percentage',
    isActive: true
  })

  const handleAddOffer = () => {
    if (newOffer.name && newOffer.description && newOffer.value && newOffer.validFrom && newOffer.validTo) {
      const offer: Offer = {
        id: Date.now().toString(),
        name: newOffer.name,
        description: newOffer.description,
        type: newOffer.type || 'percentage',
        value: newOffer.value,
        validFrom: newOffer.validFrom,
        validTo: newOffer.validTo,
        isActive: newOffer.isActive || true,
        conditions: newOffer.conditions
      }
      setOffers(prev => [...prev, offer])
      setNewOffer({ type: 'percentage', isActive: true })
      setShowForm(false)
    }
  }

  const handleDeleteOffer = (id: string) => {
    setOffers(prev => prev.filter(offer => offer.id !== id))
  }

  const toggleOfferStatus = (id: string) => {
    setOffers(prev => prev.map(offer => 
      offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
    ))
  }

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />
      case 'fixed':
        return <span className="text-sm font-bold">$</span>
      case 'item':
        return <Gift className="w-4 h-4" />
      default:
        return <Percent className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('marketplace.offers.title')}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 "
        >
          <Plus className="w-4 h-4" />
          {t('marketplace.offers.addOffer')}
        </button>
      </div>

      {/* Add Offer Form */}
      {showForm && (
        <div className="bg-white dark:bg-bgdarktheme p-6 rounded-lg shadow-md border border-gray-200 dark:border-darkthemeitems">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t('marketplace.offers.createOffer')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.name')}
              </label>
              <input
                type="text"
                value={newOffer.name || ''}
                onChange={(e) => setNewOffer(prev => ({ ...prev, name: e.target.value }))}
                className="inputs w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
                placeholder={t('marketplace.offers.namePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.type')}
              </label>
              <select
                value={newOffer.type}
                onChange={(e) => setNewOffer(prev => ({ ...prev, type: e.target.value as Offer['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
              >
                <option value="percentage">{t('marketplace.offers.percentage')}</option>
                <option value="fixed">{t('marketplace.offers.fixedAmount')}</option>
                <option value="item">{t('marketplace.offers.freeItem')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.value')}
              </label>
              <input
                type="number"
                value={newOffer.value || ''}
                onChange={(e) => setNewOffer(prev => ({ ...prev, value: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
                placeholder={newOffer.type === 'percentage' ? '20' : '10'}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.description')}
              </label>
              <textarea
                value={newOffer.description || ''}
                onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
                placeholder={t('marketplace.offers.descriptionPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.validFrom')}
              </label>
              <input
                type="date"
                value={newOffer.validFrom || ''}
                onChange={(e) => setNewOffer(prev => ({ ...prev, validFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.validTo')}
              </label>
              <input
                type="date"
                value={newOffer.validTo || ''}
                onChange={(e) => setNewOffer(prev => ({ ...prev, validTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('marketplace.offers.conditions')}
              </label>
              <input
                type="text"
                value={newOffer.conditions || ''}
                onChange={(e) => setNewOffer(prev => ({ ...prev, conditions: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-white"
                placeholder={t('marketplace.offers.conditionsPlaceholder')}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="btn"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddOffer}
              className="btn-primary"
            >
              {t('common.add')}
            </button>
          </div>
        </div>
      )}

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white dark:bg-bgdarktheme p-6 rounded-lg shadow-md border border-gray-200 dark:border-darkthemeitems"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-greentheme text-white rounded-lg">
                  {getOfferIcon(offer.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {offer.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {offer.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleOfferStatus(offer.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    offer.isActive
                      ? 'bg-softgreentheme text-greentheme'
                      : ' text-redtheme bg-softredtheme '
                  }`}
                >
                  {offer.isActive ? t('common.active') : t('common.inactive')}
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer.id)}
                  className="text-redtheme hover:text-red-800  transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('marketplace.offers.type')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {t(`marketplace.offers.${offer.type}`)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('marketplace.offers.value')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {offer.type === 'percentage' ? `${offer.value}%` : 
                   offer.type === 'fixed' ? `$${offer.value}` : 
                   t('marketplace.offers.freeItem')}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('marketplace.offers.validFrom')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {new Date(offer.validFrom).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  {t('marketplace.offers.validTo')}:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {new Date(offer.validTo).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {offer.conditions && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-darkthemeitems rounded-md">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t('marketplace.offers.conditions')}:</strong> {offer.conditions}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Offers
