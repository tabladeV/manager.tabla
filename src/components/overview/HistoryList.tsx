import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { BaseKey, useList } from "@refinedev/core"


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



const HistoryList  = () => {

  interface ReviewsType {
    
    results: Review[]
    count: number
    
  }
  
  const [reviewsAPIInfo, setReviewsAPIInfo] =useState<ReviewsType>()


  const {data: reviewsData, isLoading, error} = useList({
          resource: 'api/v1/reviews/',
          filters:[
            {
              field: "page",
              operator: "eq",
              value: 1,
            },
            {
              field: "page_size",
              operator: "eq",
              value: 10,
            },
          ],
          queryOptions:{
            onSuccess(data){
              setReviewsAPIInfo(data.data as unknown as ReviewsType)
            }
          }

      })
  
      
  
  
      const [reviews, setReviews] = useState<Review[]>([])
      
      useEffect(() => {
        if (reviewsAPIInfo) {
          setReviews(reviewsAPIInfo.results as Review[])
          // console.log('reviews',reviews)
        }
      }, [reviewsAPIInfo])
      

  const { t } = useTranslation()

  const len = reviews.length

  const colors: string[] = []

  for (let i = 0; i < len; i++) {
    if (i % 4 === 0) {
      colors.push('bg-redtheme')
    } else if (i % 4 === 1) {
      colors.push('bg-bluetheme')
    } else if (i % 4 === 2) {
      colors.push('bg-greentheme')
    }
    else {
      colors.push('bg-purpletheme')
    }
  }



  const [showText,setShowText] = useState(false)
  

  return (
    <div onMouseLeave={()=>{setShowText(false)}} onMouseOver={()=>{setShowText(true)}} className={` rounded-[20px]   lt-sm:w-full h-[400px] ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':'bg-white text-blacktheme'}`}>
      <div className='flex justify-between items-center p-4'>
        <h1 className='text-xl font-bold'>{t('overview.reviews.title')}</h1>
        
        {/* <Filter onClick={(range: string) => setTimeRange(range)} /> */}
      </div>
      <div className='cursor-default flex flex-col no-scrollbar overflow-y-scroll h-[330px] gap-4 p-2'>
        {reviews.map((item, index) => (
          <div key={index} className='flex justify-between items-center p-1 rounded-lg hover:bg-[#00000003] '>
          <div className='flex items-center gap-2'>
            <div className={`w-10 h-10 ${colors[index]} flex justify-center items-center rounded-full text-white`}>{item.customer.first_name.slice(0,1)}</div>
            <div>
              <h3 className='text-md'>{item.customer.first_name} {item.customer.last_name}</h3>
              <p className={`text-[14px] ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>
                {item.description.length > 30 ? `${item.description.substring(0, 30)}...` : item.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className={`text-[16px] font-bold ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>{((Number(item.ambience_rating) + Number(item.food_rating) + Number(item.service_rating) + Number(item.value_for_money) )/4).toFixed(2)}</p>
            <p className={`text-[12px] ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>{item.created_at.slice(0,10)}</p>
          </div>
        </div>
        ))}
        

      </div>
      {showText && 
        <div className="relative flex justify-center">
          <Link  to='/reviews' className="flex btn-primary shadow-xl shadow-[#00000010] z-50 opacity-100 absolute justify-center  mb-[2em] ml-[1em] mt-[-3em] gap-2 ">
            <p >View all</p>
            <ArrowRight size={20} />
          </Link>
        </div>
      }
    </div>
  )
}

export default HistoryList
