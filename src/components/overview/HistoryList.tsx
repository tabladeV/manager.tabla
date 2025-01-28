import { useTranslation } from "react-i18next"
import Filter from "./Filter"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"


interface range {
  start: string,
  end: string
}

const HistoryList  = () => {

  const [timeRange, setTimeRange] = useState<range>({start: '2023-01-01', end: '2023-12-31'})

  const { t } = useTranslation()

  const generateData = (range: range) => {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    const names = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Margaret Hamilton'];
    const comments = ['Had a great time', 'Would recommend', 'Will come back', 'Not satisfied', 'Would not recommend'];
    const ratings = ['5', '3.5','4.5', '2', '1'];
    const colors = ['bg-redtheme', 'bg-bluetheme', 'bg-greentheme'];

    const data = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const name = names[Math.floor(Math.random() * names.length)];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rating = ratings[Math.floor(Math.random() * ratings.length)];
      data.push({
        name,
        color,
        time: `${d.toLocaleTimeString()} ${d.toLocaleDateString()}`,
        rating,
        comment,
      });
    }
    return data;
  };

  const [data, setData] = useState(generateData(timeRange));

  useEffect(() => {
    setData(generateData(timeRange));
  }, [timeRange]);

  const [showText,setShowText] = useState(false)
  

  console.log(Math.floor(Math.random()*1000)+122202)
  return (
    <div onMouseLeave={()=>{setShowText(false)}} onMouseOver={()=>{setShowText(true)}} className={` rounded-[20px]   lt-sm:w-full h-[400px] ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':'bg-white text-blacktheme'}`}>
      <div className='flex justify-between items-center p-4'>
        <h1 className='text-xl font-bold'>{t('overview.reviews.title')}</h1>
        
        <Filter onClick={(range: range) => setTimeRange(range)} />
      </div>
      <div className='flex flex-col no-scrollbar overflow-y-scroll h-[330px] gap-4 p-2'>
        {data.map((item, index) => (
          <div key={index} className='flex justify-between items-center p-1 rounded-lg hover:bg-[#00000003] '>
          <div className='flex items-center gap-2'>
            <div className={`w-10 h-10 ${item.color} flex justify-center items-center rounded-full text-white`}>{item.name.slice(0,1)}</div>
            <div>
              <h3 className='text-md'>{item.name}</h3>
              <p className={`text-[14px] ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>{item.comment}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className={`text-[16px] font-bold ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>{item.rating}</p>
            <p className={`text-[12px] ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>{item.time}</p>
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
