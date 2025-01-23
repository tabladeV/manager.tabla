import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import SearchBar from "../../components/header/SearchBar"
import { format } from "date-fns"
import IntervalCalendar from "../../components/Calendar/IntervalCalendar"
import { parseArgs } from "util"

interface Review {
    id: string
    fullName: string
    comment: string
    rating: {
        food: number
        service: number
        environment: number
    }
    date: string
}

const Reviews = () => {
    const {t}= useTranslation()

    const [reviews, setReviews] = useState([
        {
            id: '1',
            fullName: "John Smith",
            comment: "Great place to eat. The food was delicious and the service was excellent. I would definitely recommend this place to my friends and family.",
            rating: {
                food: 5,
                service: 5,
                environment: 5
            },
            date: "2025-01-20",
        },
        {
            id: '2',
            fullName: "Jane Smith",
            comment: "Lovely ambiance. The environment was very cozy and the staff were very friendly. The food was good but could be better.",
            rating: {
                food: 4,
                service: 4,
                environment: 4
            },
            date: "2025-01-21",
        },
        {
            id: '3',
            fullName: "Alice Johnson",
            comment: "Good service. The staff were very attentive and the food was served quickly. The environment was nice but a bit noisy.",
            rating: {
                food: 4,
                service: 5,
                environment: 4
            },
            date: "2025-01-22",
        },
        {
            id: '4',
            fullName: "Bob Johnson",
            comment: "Delicious food. The food was very tasty and the portions were generous. The service was good but the environment could be improved.",
            rating: {
                food: 5,
                service: 4,
                environment: 2
            },
            date: "2025-01-23",
        }
    ])

    const avg = (a: number, b: number, c: number) => {
        return ((a + b + c) / 3).toFixed(2)
    }

    const [focusedFilter, setFocusedFilter] = useState('')
    const [selectingDay, setSelectingDay] = useState('')
    const [focusedDate, setFocusedDate] = useState(false)
    const [searchResults, setSearchResults] = useState(reviews)
    const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null })
    const [focusReview, setFocusReview] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [selectedReview, setSelectedReview] = useState<Review>(
        {
            id: '',
            fullName: "",
            comment: "",
            rating: {
                food: 0,
                service: 0,
                environment: 0
            },
            date: "",
        }
    )


    useEffect(() => {
        if (selectedClient !== '') {
          const review = reviews.find(review => review.id === selectedClient)
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

      const searchFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        const results = reviews.filter((item) =>
            item.fullName.toLowerCase().includes(keyword)
        );
        setSearchResults(results);
      };

    const setDefaultFilter = () => {
        setFocusedFilter('')
        setSelectingDay('')
        setSelectedDateRange({ start: null, end: null })
    }


    const filteredReviews = searchResults.filter(reservation => {
        if (focusedFilter !== '') return false
        if (selectedDateRange.start && selectedDateRange.end) {
          const reservationDate = new Date(reservation.date.split('/').reverse().join('-'))
          return reservationDate >= selectedDateRange.start && reservationDate <= selectedDateRange.end
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
        { selectedClient !== '' && (
        <div>
          <div className="overlay" onClick={() => setSelectedClient('')}></div>
          <div className={`sidepopup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 lt-sm:overflow-y-auto h-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'} `}>
            <h1 className="text-2xl font-[600] mb-4">{t('reviews.view.title')} by <span className="font-[800]">{selectedReview.fullName}</span></h1>
            <div className="space-y-2">
                <div>
                    <div className="font-[600] mb-[.4em]">{t('reviews.view.comment')}:</div>
                    <p className={`p-2  border-[2px] rounded-md ${localStorage.getItem('darkMode')==='true' ? 'border-darkthemeitems':'border-black'}`}>{selectedReview.comment}</p>
                    
                    <div className="flex mt-4 gap-4">
                        <div className="font-[600]">{t('reviews.view.food')}:</div>
                        {stars(selectedReview.rating.food)}
                        <span>{`(${selectedReview.rating.food})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                        <div className="font-[600]">{t('reviews.view.service')}:</div>
                        {stars(selectedReview.rating.service)}
                        <span>{`(${selectedReview.rating.service})`}</span>
                    </div>
                    <div className="flex mt-4 gap-4">
                        <div className="font-[600]">{t('reviews.view.environment')}:</div>
                        {stars(selectedReview.rating.environment)}
                        <span>{`(${selectedReview.rating.environment})`}</span>
                    </div>

                    <div className="flex mt-4 gap-4">
                        <div className="font-[600]">{t('reviews.view.total')}:</div>
                        {stars(((selectedReview.rating.environment+selectedReview.rating.service+selectedReview.rating.food)/3))}
                        <span>{`(${((selectedReview.rating.environment+selectedReview.rating.service+selectedReview.rating.food)/3).toFixed(2)})`}</span>
                    </div>

                </div>
            </div>
          </div>
        </div>
      )}
        <h1>{t('reviews.title')}</h1>
        <div className="flex lt-sm:flex-col lt-sm:gap-2 justify-between">
            <div className="">
                <SearchBar SearchHandler={searchFilter}/>
            </div>
            <div className="flex lt-sm:flex-wrap gap-4">
            
            <button 
                className={`gap-2 flex items-center ${localStorage.getItem('darkMode')==='true'?' text-whitetheme':''} ${selectingDay === '' ? 'btn' : 'btn-primary'}`} 
                onClick={() => setFocusedDate(true)}
            >
                {t('reviews.filters.date')}
            </button>
            <button onClick={setDefaultFilter} className={`${localStorage.getItem('darkMode')==='true'?' text-whitetheme':''} ${(focusedFilter === '') && (selectingDay === '') ? 'btn-primary' : 'btn'}`}>
                {t('reviews.filters.all')}
            </button>
            </div>
        </div>
        <div>
        <table className={`min-w-full divide-y ${localStorage.getItem('darkMode')==='true'?'divide-gray-800':'divide-gray-200'}`}>
            <thead className={localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2 text-white':'bg-gray-50 text-gray-500'}>
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.id')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.comment')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.food')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.service')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.environment')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('reviews.tableHeaders.total')}</th>
                
                </tr>
            </thead>
            <tbody className={ `  ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme divide-y divide-gray-800':'bg-white divide-y divide-gray-200'}`} >
                {filteredReviews.map(review => (
                <tr key={review.id} className=" hover:opacity-75">
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer"  onClick={()=>(setSelectedClient(review.id))} >{review.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer"  onClick={()=>(setSelectedClient(review.id))} >{review.fullName}</td>
                    <td className="px-6 py-4 max-w-[20em] whitespace-nowrap cursor-pointer" onClick={()=>(setSelectedClient(review.id))}>
                    {review.comment.length > 50 ? `${review.comment.substring(0, 40)}...` : review.comment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer"  onClick={()=>(setSelectedClient(review.id))} >{review.rating.food }</td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={()=>(setSelectedClient(review.id))} >{review.rating.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={()=>(setSelectedClient(review.id))} >{review.rating.environment}</td>
                    <td className="px-6 py-4 whitespace-nowrap " onClick={()=>(setSelectedClient(review.id))}>
                    {avg(review.rating.food, review.rating.service, review.rating.environment)}
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
      </div>
      {focusedDate && (
        <div>
          <div className="overlay" onClick={() => setFocusedDate(false)}></div>
          <div className={`popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
            <IntervalCalendar onRangeSelect={handleDateClick} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews
