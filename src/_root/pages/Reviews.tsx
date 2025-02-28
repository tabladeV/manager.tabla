import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import SearchBar from "../../components/header/SearchBar"
import { format } from "date-fns"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"
import { parseArgs } from "util"
import { BaseKey, BaseRecord, useList } from "@refinedev/core"
import Pagination from "../../components/reservation/Pagination"
import ExportModal, { InputType } from "../../components/common/ExportModal"
import useExportConfig from "../../components/common/config/exportConfig"

interface Review {
  id: BaseKey
  food_rating: string
  value_for_money: string
  service_rating: string
  ambience_rating: string
  created_at: string
  description: string
  customer: {
    id: number
    first_name: string
    last_name: string

    email: string
    phone: string
  }
  source: string
}




const Reviews = () => {
  const { t } = useTranslation();
  

  useEffect(() => {
    document.title = 'Reviews | Tabla'
  }, [])

  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [size, setSize] = useState(10)

  const [reviews, setReviews] = useState<Review[]>([])

    useEffect(() => {
      console.log(reviews,'reviews')
    }
    , [reviews])
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const {reviews: reviewsExportConfig} = useExportConfig();


  const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {

    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword)
  };

  interface ReviewsType {

    results: BaseRecord[]
    count: number

  }

  const [reviewsAPIInfo, setReviewsAPIInfo] = useState<ReviewsType>()
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })

  console.log(selectedDateRange)

  const { data, isLoading, error } = useList({
    resource: 'api/v1/reviews/',
    filters: [
      {
        field: "search",
        operator: "eq",
        value: searchKeyword
      },
      {
        field: "created_at_",
        operator: "gte",
        value: selectedDateRange.start ? format(selectedDateRange.start, 'yyyy-MM-dd') : ''
      },
      {
        field: "created_at_",
        operator: "lte",
        value: selectedDateRange.end ? format(selectedDateRange.end, 'yyyy-MM-dd') : ''
      },
      {
        field: "page",
        operator: "eq",
        value: page,
      },
      {
        field: "page_size",
        operator: "eq",
        value: size,
      },
      {
        field: "ordering",
        operator: "eq",
        value: "id",
      }
    ],
    queryOptions: {
      onSuccess: (data) => {
        setReviewsAPIInfo(data.data as unknown as ReviewsType);
      },
      onError: (error) => {
        console.log('Error fetching data:', error);
      }
    }
  })

  useEffect(() => {
    if (reviewsAPIInfo) {
      setReviews(reviewsAPIInfo.results as Review[])
      setCount(reviewsAPIInfo.count)
    }
  }, [reviewsAPIInfo])




  const avg = (a: number, b: number, c: number, d: number) => {
    return ((a + b + c + d) / 4).toFixed(2)
  }

  const [focusedFilter, setFocusedFilter] = useState('')
  const [selectingDay, setSelectingDay] = useState('')
  const [focusedDate, setFocusedDate] = useState(false)
  const [searchResults, setSearchResults] = useState<Review[]>([])
  const [focusReview, setFocusReview] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<BaseKey>(0)
  const [selectedReview, setSelectedReview] = useState<Review>()



  useEffect(() => {
    if (selectedClient !== '') {
      const review = (reviews as Review[]).find((review: Review) => review.id === selectedClient)
      if (review) {
        setSelectedReview(review)
      }
    }
  }, [selectedClient])

  const handleDateClick = (range: { start: Date, end: Date }) => {
    setSelectedDateRange(range)
  }

  useEffect(() => {
    if (selectedDateRange.start && selectedDateRange.end) {
      const formattedStart = format(selectedDateRange.start, 'dd/MM/yyyy')
      const formattedEnd = format(selectedDateRange.end, 'dd/MM/yyyy')
      setSelectingDay(`${formattedStart} - ${formattedEnd}`)
    } else if (selectedDateRange.start) {
      setSelectingDay(format(selectedDateRange.start, 'dd/MM/yyyy'))
    } else {
      setSelectingDay('')
    }
  }, [selectedDateRange])




  const setDefaultFilter = () => {
    setFocusedFilter('')
    setSelectingDay('')
    setSelectedDateRange({ start: null, end: null })
  }


  let filteredReviews = reviews as Review[]

  useEffect(() => {
    if (searchResults.length === 0) {
      setSearchResults(reviews as Review[])
    }
  }, [reviews])

  filteredReviews = searchResults?.filter((reservation: Review) => {
    if (focusedFilter !== '') return false
    if (selectedDateRange.start && selectedDateRange.end) {
      const reservationDate = reservation.created_at.slice(0, 10)
      const reservationDateObj = new Date(reservationDate);
      return reservationDateObj >= selectedDateRange.start && reservationDateObj <= selectedDateRange.end;
    }
    return true
  })

  const stars = (rating: number) => {
    rating = Math.round(rating)
    let number = ''
    for (let i = 0; i < rating; i++) {
      number += '⭐'
    }
    return number

  }







  return (
    <div>
      {showExportModal && (
        <ExportModal
          columns={reviewsExportConfig.columns}
          customFields={reviewsExportConfig.customFields}
          onExport={(format, selectedColumns, customValues) => {
            console.log(format, selectedColumns)
            setShowExportModal(false);
          }}
          onClose={() => setShowExportModal(false)}
        />
      )}
      {selectedClient !== 0 && (
        <div>
          <div className="overlay" onClick={() => setSelectedClient(0)}></div>
          <div className={`sidepopup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'} `}>
            <h1 className="text-2xl font-[600] mb-4">{t('reviews.view.title')} by <span className="font-[800]">{selectedReview?.customer.first_name} {selectedReview?.customer.last_name}</span></h1>
            <div className="space-y-2">
              <div>
                <div className="font-[600] mb-[.4em]">{t('reviews.view.comment')}:</div>
                {selectedReview && (
                  <p className={`p-2  border-[2px] rounded-md ${localStorage.getItem('darkMode') === 'true' ? 'border-darkthemeitems' : 'border-black'}`}>{selectedReview.description}</p>
                )}

                {selectedReview && (
                  <>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t('reviews.view.food')}:</div>
                      {stars(Number(selectedReview.food_rating))}
                      <span>{`(${selectedReview.food_rating})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t('reviews.view.service')}:</div>
                      {stars(Number(selectedReview.service_rating))}
                      <span>{`(${selectedReview.service_rating})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t('reviews.view.environment')}:</div>
                      {stars(Number(selectedReview.ambience_rating))}
                      <span>{`(${selectedReview.ambience_rating})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t('reviews.view.valueForMoney')}:</div>
                      {stars(Number(selectedReview.value_for_money))}
                      <span>{`(${selectedReview.value_for_money})`}</span>
                    </div>

                    <div className="flex mt-4 gap-4">
                      <div className="font-[600]">{t('reviews.view.total')}:</div>
                      {stars((Number(selectedReview.ambience_rating) + Number(selectedReview.service_rating) + Number(selectedReview.food_rating) + Number(selectedReview.value_for_money)) / 4)}
                      <span>{`(${((Number(selectedReview.ambience_rating) + Number(selectedReview.service_rating) + Number(selectedReview.food_rating) + Number(selectedReview.value_for_money)) / 4).toFixed(2)})`}</span>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <h1>{t('reviews.title')}</h1>
        <button onClick={() => setShowExportModal(true)} className={`${localStorage.getItem('darkMode') === 'true' ? ' text-whitetheme' : ''} btn-primary`}>
          {/* {t('reviews.filters.all')} */}
          export
        </button>
      </div>
      <div className="flex lt-sm:flex-col lt-sm:gap-2 justify-between">
        <div className="">
          <SearchBar SearchHandler={searchFilter} />
        </div>
        <div className="flex lt-sm:flex-wrap gap-4">

          <button
            className={`gap-2 flex items-center ${localStorage.getItem('darkMode') === 'true' ? ' text-whitetheme' : ''} ${selectingDay === '' ? 'btn' : 'btn-primary'}`}
            onClick={() => setFocusedDate(true)}
          >
            {t('reviews.filters.date')}
          </button>
          <button onClick={setDefaultFilter} className={`${localStorage.getItem('darkMode') === 'true' ? ' text-whitetheme' : ''} ${(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}`}>
            {t('reviews.filters.all')}
          </button>
        </div>
      </div>
      <div>
        <table className={`min-w-full divide-y ${localStorage.getItem('darkMode') === 'true' ? 'divide-gray-800' : 'divide-gray-200'}`}>
          <thead className={localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2 text-white' : 'bg-gray-50 text-gray-500'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.id')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.comment')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.food')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.service')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.environment')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.valueForMoney')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.total')}</th>

            </tr>
          </thead>
          <tbody className={localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2 text-white' : 'bg-gray-50 text-gray-500'}>
            {reviews.map(review => (
              <tr key={review.id} className=" hover:opacity-75">
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))} >{review.id}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))} >{review.customer.first_name} {review.customer.last_name}</td>
                <td className="px-6 py-4 max-w-[20em] whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))}>
                  {review.description.length > 50 ? `${review.description.substring(0, 40)}...` : review.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))} >{review.food_rating}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))} >{review.service_rating}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))} >{review.ambience_rating}</td>
                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => (setSelectedClient(review.id))} >{review.value_for_money}</td>
                <td className="px-6 py-4 whitespace-nowrap " onClick={() => (setSelectedClient(review.id))}>
                  {avg(Number(review.food_rating), Number(review.service_rating), Number(review.ambience_rating), Number(review.value_for_money))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination setPage={(page: number) => { setPage(page) }} size={size} count={count} />
      </div>
      {focusedDate && (
        <div>
          <div className="overlay" onClick={() => setFocusedDate(false)}></div>
          <div className={`popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
            <IntervalCalendar onRangeSelect={handleDateClick} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews
