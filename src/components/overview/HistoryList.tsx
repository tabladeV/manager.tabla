import { useTranslation } from "react-i18next"
import Filter from "./Filter"
import { useEffect, useState } from "react"


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
    const statuses = ['Confirmed', 'Canceled'];
    const colors = ['bg-greentheme', 'bg-redtheme', 'bg-bluetheme', 'bg-yellowtheme'];

    const data = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const name = names[Math.floor(Math.random() * names.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      data.push({
        name,
        status,
        time: `${d.toLocaleTimeString()} ${d.toLocaleDateString()}`,
        color
      });
    }
    return data;
  };

  const [data, setData] = useState(generateData(timeRange));

  useEffect(() => {
    setData(generateData(timeRange));
  }, [timeRange]);

  

  console.log(Math.floor(Math.random()*1000)+122202)
  return (
    <div className={` rounded-[20px] w-2/5  lt-sm:w-full h-[400px] ${localStorage.getItem('darkMode')=== 'true'? 'bg-bgdarktheme text-textdarktheme':'bg-white text-blacktheme'}`}>
      <div className='flex justify-between items-center p-4'>
        <h1 className='text-xl font-bold'>{t('overview.history.title')}</h1>
        <Filter onClick={(range: range) => setTimeRange(range)} />
      </div>
      <div className='flex flex-col no-scrollbar overflow-y-scroll h-[330px] gap-4 p-2'>
        {data.map((item, index) => (
          <div key={index} className='flex justify-between items-center p-1 rounded-lg hover:bg-[#00000003] '>
          <div className='flex items-center gap-2'>
            <div className={`w-10 h-10 ${item.color} flex justify-center items-center rounded-full text-white`}>{item.name.slice(0,1)}</div>
            <h3 className='text-md'>{item.name}</h3>
          </div>
          <div className="flex flex-col items-end">
            <p className={`text-sm font-[600] ${item.status === 'Confirmed' ? 'bg-softgreentheme text-greentheme' : 'bg-softredtheme text-redtheme'} px-2 py-1 rounded-[10px]`}>
              {item.status}
            </p>
            <p className={`text-[12px] ${localStorage.getItem('darkMode')==='true'? 'text-softwhitetheme':'text-subblack'}`}>{item.time}</p>
          </div>
        </div>
        ))}
        

      </div>
    </div>
  )
}

export default HistoryList
