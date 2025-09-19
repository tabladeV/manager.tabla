import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Star, MessageSquare, User } from 'lucide-react'

interface Review {
  id: string
  customerName: string
  rating: number
  serviceRating: number
  environmentRating: number
  foodRating: number
  valueRating: number
  comment: string
  date: string
  isVisible: boolean
  response?: string
  responseDate?: string
}

const Reviews: React.FC = () => {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'John Doe',
      rating: 5,
      serviceRating: 5,
      environmentRating: 4,
      foodRating: 5,
      valueRating: 4,
      comment: 'Amazing food and excellent service! Will definitely come back.',
      date: '2024-01-15',
      isVisible: true
    },
    {
      id: '2',
      customerName: 'Marie Dupont',
      rating: 4,
      serviceRating: 4,
      environmentRating: 5,
      foodRating: 4,
      valueRating: 3,
      comment: 'Great atmosphere and delicious meals. The dessert was exceptional.',
      date: '2024-01-14',
      isVisible: true,
      response: 'Thank you for your wonderful feedback! We\'re glad you enjoyed your experience.',
      responseDate: '2024-01-14'
    },
    {
      id: '3',
      customerName: 'Ahmed Hassan',
      rating: 2,
      serviceRating: 2,
      environmentRating: 3,
      foodRating: 2,
      valueRating: 2,
      comment: 'Service was slow and food was cold when it arrived.',
      date: '2024-01-13',
      isVisible: false
    }
  ])
  const [selectedReview, setSelectedReview] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / reviews.length).toFixed(1)
  }

  const getCategoryAverages = () => {
    if (reviews.length === 0) return {
      service: 0,
      environment: 0,
      food: 0,
      value: 0
    }
    
    return {
      service: (reviews.reduce((sum, review) => sum + review.serviceRating, 0) / reviews.length).toFixed(1),
      environment: (reviews.reduce((sum, review) => sum + review.environmentRating, 0) / reviews.length).toFixed(1),
      food: (reviews.reduce((sum, review) => sum + review.foodRating, 0) / reviews.length).toFixed(1),
      value: (reviews.reduce((sum, review) => sum + review.valueRating, 0) / reviews.length).toFixed(1)
    }
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  const addResponse = (reviewId: string) => {
    if (responseText.trim()) {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              response: responseText.trim(),
              responseDate: new Date().toISOString().split('T')[0]
            }
          : review
      ))
      setResponseText('')
      setSelectedReview(null)
    }
  }

  const distribution = getRatingDistribution()
  const categoryAverages = getCategoryAverages()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-blacktheme dark:text-textdarktheme mb-2">
          {t('marketplace.reviews.title')}
        </h2>
        <p className="text-subblack dark:text-softwhitetheme">
          {t('marketplace.reviews.subtitle')}
        </p>
      </div>

      {/* Review Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Rating */}
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl font-bold text-greentheme">
              {getAverageRating()}
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                {getRatingStars(Math.round(Number(getAverageRating())))}
              </div>
              <p className="text-sm text-subblack dark:text-softwhitetheme mt-1">
                {reviews.length} {t('marketplace.reviews.reviews')}
              </p>
            </div>
          </div>
          <h3 className="text-center font-medium text-blacktheme dark:text-textdarktheme">
            {t('marketplace.reviews.overall')}
          </h3>
        </div>

        {/* Service Rating */}
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-greentheme">
              {categoryAverages.service}
            </div>
            <div className="ml-2">
              <div className="flex items-center">
                {getRatingStars(Math.round(Number(categoryAverages.service)))}
              </div>
            </div>
          </div>
          <h3 className="text-center font-medium text-blacktheme dark:text-textdarktheme">
            {t('marketplace.reviews.service')}
          </h3>
        </div>

        {/* Environment Rating */}
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-greentheme">
              {categoryAverages.environment}
            </div>
            <div className="ml-2">
              <div className="flex items-center">
                {getRatingStars(Math.round(Number(categoryAverages.environment)))}
              </div>
            </div>
          </div>
          <h3 className="text-center font-medium text-blacktheme dark:text-textdarktheme">
            {t('marketplace.reviews.environment')}
          </h3>
        </div>

        {/* Food Rating */}
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-greentheme">
              {categoryAverages.food}
            </div>
            <div className="ml-2">
              <div className="flex items-center">
                {getRatingStars(Math.round(Number(categoryAverages.food)))}
              </div>
            </div>
          </div>
          <h3 className="text-center font-medium text-blacktheme dark:text-textdarktheme">
            {t('marketplace.reviews.food')}
          </h3>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Value for Money & Distribution */}
        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <div className="flex items-center justify-center mb-4">
            <div className="text-3xl font-bold text-greentheme">
              {categoryAverages.value}
            </div>
            <div className="ml-3">
              <div className="flex items-center">
                {getRatingStars(Math.round(Number(categoryAverages.value)))}
              </div>
            </div>
          </div>
          <h3 className="text-center font-medium text-blacktheme dark:text-textdarktheme mb-4">
            {t('marketplace.reviews.valueForMoney')}
          </h3>
        </div>

        <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
          <h3 className="text-lg font-semibold mb-4 text-blacktheme dark:text-textdarktheme">
            {t('marketplace.reviews.distribution')}
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm font-medium text-blacktheme dark:text-textdarktheme w-4">
                  {rating}
                </span>
                <Star className="w-4 h-4 text-yellowtheme fill-current" />
                <div className="flex-1 bg-softgreytheme dark:bg-bgdarktheme rounded-full h-2">
                  <div
                    className="bg-greentheme h-2 rounded-full"
                    style={{
                      width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-subblack dark:text-softwhitetheme w-8">
                  {distribution[rating as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2">
        <h3 className="text-lg font-semibold mb-4 text-blacktheme dark:text-textdarktheme">
          {t('marketplace.reviews.summary')}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blacktheme dark:text-textdarktheme">
              {reviews.length}
            </div>
            <p className="text-subblack dark:text-softwhitetheme">
              {t('marketplace.reviews.total')}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blacktheme dark:text-textdarktheme">
          {t('marketplace.reviews.allReviews')}
        </h3>
        
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-whitetheme dark:bg-darkthemeitems p-6 rounded-lg shadow-md border border-softgreytheme dark:border-bgdarktheme2"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-softgreytheme dark:bg-bgdarktheme rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-subblack dark:text-softwhitetheme" />
                </div>
                <div>
                  <h4 className="font-semibold text-blacktheme dark:text-textdarktheme">
                    {review.customerName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {getRatingStars(review.rating)}
                    </div>
                    <span className="text-sm text-subblack dark:text-softwhitetheme">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-softgreentheme dark:bg-bgdarktheme rounded-lg">
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  {getRatingStars(review.serviceRating)}
                </div>
                <p className="text-xs text-subblack dark:text-softwhitetheme">
                  {t('marketplace.reviews.service')}
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  {getRatingStars(review.environmentRating)}
                </div>
                <p className="text-xs text-subblack dark:text-softwhitetheme">
                  {t('marketplace.reviews.environment')}
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  {getRatingStars(review.foodRating)}
                </div>
                <p className="text-xs text-subblack dark:text-softwhitetheme">
                  {t('marketplace.reviews.food')}
                </p>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-center mb-1">
                  {getRatingStars(review.valueRating)}
                </div>
                <p className="text-xs text-subblack dark:text-softwhitetheme">
                  {t('marketplace.reviews.valueForMoney')}
                </p>
              </div>
            </div>

            <p className="text-blacktheme dark:text-textdarktheme mb-4">
              {review.comment}
            </p>

            {/* Restaurant Response */}
            {review.response ? (
              <div className="bg-softgreentheme dark:bg-bgdarktheme2 p-4 rounded-lg border-l-4 border-greentheme">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-greentheme" />
                  <span className="font-medium text-greentheme">
                    {t('marketplace.reviews.restaurantResponse')}
                  </span>
                  <span className="text-sm text-subblack dark:text-softwhitetheme">
                    {review.responseDate ? new Date(review.responseDate).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-blacktheme dark:text-textdarktheme">
                  {review.response}
                </p>
              </div>
            ) : (
              <div>
                {selectedReview === review.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder={t('marketplace.reviews.responsePlaceholder')}
                      rows={3}
                      className="w-full px-3 py-2 border border-softgreytheme dark:border-bgdarktheme2 rounded-md focus:ring-2 focus:ring-greentheme focus:border-transparent dark:bg-darkthemeitems dark:text-textdarktheme"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => addResponse(review.id)}
                        className="px-4 py-2 bg-greentheme text-whitetheme rounded-lg hover:bg-greentheme/90 transition-colors"
                      >
                        {t('marketplace.reviews.addResponse')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReview(null)
                          setResponseText('')
                        }}
                        className="px-4 py-2 text-subblack dark:text-softwhitetheme hover:text-blacktheme dark:hover:text-textdarktheme transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedReview(review.id)}
                    className="flex items-center gap-2 text-greentheme hover:text-greentheme/80 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {t('marketplace.reviews.respond')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reviews
