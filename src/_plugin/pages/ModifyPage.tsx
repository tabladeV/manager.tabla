import React, { useEffect, useState } from 'react'
import Logo from '../../components/header/Logo'
import { ArrowDown, ArrowLeft, Expand, Moon, MoveDown, Send, Sun } from 'lucide-react'
import { BaseRecord, useCreate, useCustom, useCustomMutation, useOne, useUpdate } from '@refinedev/core';
import ReservationProcess from '../../components/reservation/ReservationProcess';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { format, set } from 'date-fns';
import { getSubdomain } from '../../utils/getSubdomain';
import { useRef } from 'react';
import { useClickAway } from 'react-use';
import BaseBtn from '../../components/common/BaseBtn';

const Modify = () => {
  interface LoadingRowProps {
    isDarkMode: boolean;
  }
  const LoadingComponent: React.FC<LoadingRowProps> = ({ isDarkMode }) => {
    return (
      <tr>
        
        <td className=" py-2">
          <div className="flex items-center">
            <div className="ml-0 space-y-1">
              <div className={`h-[2.4em] w-[10em] lt-sm:w-[20vw] rounded ${isDarkMode ? "bg-bgdarktheme" : "bg-gray-200"}`}></div>
            </div>
            <div className="ml-4 space-y-1">
              <div className={`h-[2.4em] w-[25em] lt-sm:w-[60vw] rounded ${isDarkMode ? "bg-bgdarktheme" : "bg-gray-200"}`}></div>
            </div>
            
          </div>
        </td>
        
      </tr>
    )
  }

  const { pathname } = useLocation();
  useEffect(() => {
    document.title = "Tabla | Taste Morocco's best ";
  }, [pathname]);

    const { token } = useParams();
  
  
    const [widgetInfo, setWidgetInfo] = useState<BaseRecord>();
    
    const [reservationInfo, setReservationInfo] = useState<BaseRecord>();
    
    const { mutate, isLoading: widgetLoading , error: widgetError } = useCustomMutation();
    
    const [updateInfo, setUpdateInfo] = useState<BaseRecord>();

    const [errorPage, setErrorPage] = useState(false);

    const { data: reservation, isLoading: reservationLoading, error: reservationError } = useOne({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
      id: token + '',
      queryOptions: {
        retry: 1,
        onSuccess: (data) => {
          setUpdateInfo(data.data);
        },
        onError: (error) => {
          console.log(error.message,'error')
          setErrorPage(true)
        }
      },
      errorNotification(error, values, resource) {
        return {
          type: 'error',
          message: error?.formattedMessage,
        };
      },
    });
    console.log('error?',errorPage)

    const { mutate: cancelReservation, isLoading: cancelLoading, error: cancelError } = useCreate({
      errorNotification(error, values, resource) {
        return {
          type: 'error',
          message: error?.formattedMessage,
        };
      },
    });

    const handleCancel = () => {
      cancelReservation({
        resource: `api/v1/bo/subdomains/public/cutomer/reservations/${token}/cancel`,
        values: {}
      })
      // window.location.reload();
      setErrorPage(true)
    }
    useEffect(() => {
      console.log('updateInfo', updateInfo)
    }
    , [updateInfo])


    const modifyeservation = () => {
      console.log('updateInfo', updateInfo?.occasion)
      mutate({
        url: `api/v1/bo/subdomains/public/cutomer/reservations/${token}`,
        method: 'patch',
        values:{
          customer: {
            email: updateInfo?.customer?.email,
            first_name: updateInfo?.customer?.first_name, 
            last_name: updateInfo?.customer?.last_name,
            phone: updateInfo?.customer?.phone
          },
          status: updateInfo?.status,
          source: updateInfo?.source,
          commenter: updateInfo?.commenter,
          internal_note: updateInfo?.internal_note,
          date: data.reserveDate !== '' ? format(data.reserveDate, 'yyyy-MM-dd'): updateInfo?.date,
          time: data.time !== '' ? data.time+':00': updateInfo?.time,
          number_of_guests: data.guests !== 0 ? data.guests : updateInfo?.number_of_guests,
          allergies: updateInfo?.allergies,
          preferences: updateInfo?.preferences,
          restaurant: updateInfo?.restaurant,
          offer: 0,
          occasion: updateInfo?.occasion
        }
      })
      
    }

    useEffect(() => {
      if(reservation){
        setReservationInfo(reservation.data)
      }
    }, [reservation])

    console.log('reservation', reservation)

    const subdomain = getSubdomain();

    const [occasions, setOccasions] = useState<BaseRecord[]>();

    const { data: posts } = useCustom({
      url: `https://api.dev.tabla.ma/api/v1/bo/restaurants/subdomain/occasions`,
      method: "get",
      
    });



    const {data: messageAccess, isLoading: messageLoading, error: messageError} = useOne({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
      id: `${token}/message`,
      queryOptions: {
        retry: 1,
        onError: (error) => {
          setMessageSent(true)
        }
      },
    })


    useEffect(() => {
      if(posts){
        setOccasions(posts.data as unknown as BaseRecord[])
      }
    }, [posts])
    

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "preview";

    const [tab, setTab] = useState('preview');

    useEffect(() => {
      if(errorPage){
        setTab('error')
      }
    }
    , [errorPage,tab])
    
    const { data: widgetData, isLoading, error } = useOne({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
      id: ''
    });

    useEffect(() => {
      setTab(activeTab);
    }, [activeTab]);


    const [restaurantID, setRestaurantID] = useState<string>();
  
    useEffect(() => {
      console.log(' widgetData ', widgetData)
      if (widgetData) {
        setWidgetInfo(widgetData.data);
        setRestaurantID(widgetData.data.restaurant);
      }
    }, [widgetData]);

  const [isDarkMode, setIsDarkMode] = useState(
      localStorage.getItem('darkMode') === 'true'
    );
    const toggleDarkMode = () => {
      setIsDarkMode((prev) => {
        const newMode = !prev;
        localStorage.setItem('darkMode', newMode.toString());
        return newMode;
      });
      window.location.reload();
    };

    const [showProcess, setShowProcess] = useState(false);
    interface dataTypes {
      reserveDate: string,
      time: string,
      guests: number
    }
  
  
    const [data, setData] = useState<dataTypes>({
      reserveDate: '',
      time: '',
      guests: 0
    });

    const [message,setMessage] = useState('')

    const { mutate: sendMessage, isLoading: loadingMessage, error: cancelMessage } = useCreate({
      errorNotification(error, values, resource) {
        return {
          type: 'error',
          message: error?.formattedMessage,
        };
      },
    })

    const [messageSent, setMessageSent] = useState(false);

    const handleSendMessage = () => {

      sendMessage({
        resource: `api/v1/bo/subdomains/public/cutomer/reservations/${token}/message`,
        values: {
          text: message
        }
      })
      setMessageSent(true)

    }

    const occasionRef = useRef(null);

    useClickAway(occasionRef, () => {
      setShowOccasions(false);
    });

    const[showOccasions, setShowOccasions] = useState(false);



  return (
    <div className={`h-[100vh] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2 text-white' : 'bg-white'}`}>
      <div
        className={`h-[10vh] w-full flex items-center justify-between px-10 shadow-xl shadow-[#00000004] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'} `}>
        <Logo className='horizontal' />
        <button
        onClick={toggleDarkMode}
        className={`btn-secondary my-[1em] p-1 w-[40px] h-[40px] flex justify-center items-center rounded-[100%] ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`}
      >
        {!isDarkMode ? (

          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM11 1V5H13V1H11ZM11 19V23H13V19H11ZM23 11H19V13H23V11ZM5 11H1V13H5V11ZM16.24 17.66L18.71 20.13L20.12 18.72L17.65 16.25L16.24 17.66ZM3.87 5.28L6.34 7.75L7.75 6.34L5.28 3.87L3.87 5.28ZM6.34 16.24L3.87 18.71L5.28 20.12L7.75 17.65L6.34 16.24ZM18.72 3.87L16.25 6.34L17.66 7.75L20.13 5.28L18.72 3.87Z" fill="black" />
          </svg>
          ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z" fill="white" />
          </svg>

        )}

      </button>
        

      </div>

      <div className='h-[90vh] items-center xl:max-w-[1200px] no-scrollbar mx-auto  pb-[5em] overflow-y-auto w-full flex p-5 px-10 justify-between'>
        <div className='w-[60%] lt-sm:w-full'>
          <h1 className={`text-4xl font-bold ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
            {widgetInfo?.title}
          </h1>
          
          <div>
            {/* <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
              Description
            </h3> */}
            <p className={`text-md mt-1 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffff85]' : ''}`}>
              {widgetInfo?.description}
            </p>
          </div>
          { reservationLoading ? <div>
            {Array.from({ length: 5 }, (_, index) => (
              <LoadingComponent key={index} isDarkMode={isDarkMode} />
            ))}
          </div> :
            errorPage ? <div className='flex flex-col gap-2 cursor-default bg-softredtheme p-3 text-center mt-2 items-center rounded-lg'>
              <h1 className='text-2xl text-redtheme'>You can't modify your reservation</h1>
              <p className='text-md'>
                Something went wrong, you might have already fulfilled a modification or canceled your reservation
              </p>
            </div> :
            <div>
              {tab === 'preview' && <div>
                <div className='flex flex-col gap-2'>
                  <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
                    Your reservation details
                  </h3>
                  <p className={`text-md mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
                    <span className='font-bold mx-4'>
                      Special Request
                    </span>
                    {reservationInfo?.commenter}
                  </p>
                  <p className={`text-md mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
                    <span className='font-bold mx-4'>
                      Allergies
                    </span>
                    {reservationInfo?.allergies}
                  </p>
                  <p className={`text-md mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
                    <span className='font-bold mx-4'>
                      Occasion
                    </span>
                    {occasions?.find(occasion => occasion.id === updateInfo?.occasion)?.name}
                  </p>
                  <p className={`text-md  flex justify-around mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
                    <p className={`text-md  gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] ' : ''}`}>
                      <span className='font-bold mr-4'>
                        Date
                      </span>
                      {reservationInfo?.date}
                    </p>
                    <p className={`text-md  gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] ' : ''}`}>
                      <span className='font-bold mr-4'>
                        Time
                      </span>
                      {reservationInfo?.time.slice(0, 5)}
                    </p>
                    <p className={`text-md  gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] ' : ''}`}>
                      <span className='font-bold mr-4'>
                        Guests
                      </span>
                      {reservationInfo?.number_of_guests}
                    </p>
                  </p>
                  {/* <button className={`btn-primary mt-2 ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`} onClick={confirmReservation}>
                    Confirm
                  </button> */}
                </div>
                <div className='w-full '>
                  {/* <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
                    Other actions
                  </h3> */}
                  <div className='flex  w-full gap-2 mt-2'>
                    <button className={`btn-secondary w-full ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`} onClick={() => setSearchParams('tab=modify')}>
                      Modify
                    </button>
                    <BaseBtn variant="secondary" className='w-full bg-softredtheme hover:bg-redtheme  text-redtheme hover:text-white'  loading={cancelLoading}  onClick={handleCancel} >
                      Cancel
                    </BaseBtn>
                    {/* <button className={`btn-secondary w-full bg-softredtheme hover:bg-redtheme  text-redtheme hover:text-white ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`} onClick={handleCancel} >
                      Cancel
                    </button> */}
                  </div>
                  <div className='mt-2'>
                    <button className={`btn-secondary w-full bg-softorangetheme hover:bg-orangetheme  text-orangetheme hover:text-white ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`} onClick={() => {setSearchParams('tab=contact')}}>
                      Send a message
                    </button>
                  </div>
                </div>
              </div>}
              {
                tab === 'modify' && 
                  <div className='flex flex-col gap-2'>
                    <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
                      Modify your reservation
                    </h3>
                    <input type='text' defaultValue={reservationInfo?.commenter} name='Special request' className={`text-md inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`} placeholder='Special request'  onChange={(e) => {setUpdateInfo({...updateInfo, commenter: e.target.value})}} />
                    <input type='text' defaultValue={reservationInfo?.allergies} name='Allergies' className={`text-md inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`} placeholder='Allergies'  onChange={(e) => {setUpdateInfo({...updateInfo, allergies: e.target.value})}} />
                    <div className={`text-md cursor-pointer gap-3 inputs ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`} >
                      <div className=' flex justify-between items-center' onClick={()=>{setShowOccasions(!showOccasions)}}>{occasions?.find(occasion => occasion.id === updateInfo?.occasion)?.name || 'Select an occasions'} 
                        {!showOccasions? 
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.40755 13.4643L4.69338 8.75011L5.87171 7.57178L9.99672 11.6968L14.1217 7.57178L15.3 8.75011L10.5859 13.4643C10.4296 13.6205 10.2177 13.7083 9.99672 13.7083C9.77574 13.7083 9.56382 13.6205 9.40755 13.4643Z" fill={localStorage.getItem('darkMode') === 'true' ? 'white' : 'black'}/>
                        </svg>
                        :
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4748 8.61491L19.1318 14.2719L17.7178 15.6859L12.7678 10.7359L7.81781 15.6859L6.40381 14.2719L12.0608 8.61491C12.2483 8.42744 12.5026 8.32213 12.7678 8.32213C13.033 8.32213 13.2873 8.42744 13.4748 8.61491Z"  fill={localStorage.getItem('darkMode') === 'true' ? 'white' : 'black'}/>
                        </svg>
                        
                        
                        }
      
                      </div>
                    </div>
                    <div  className='relative'>
                      

                      <div ref={occasionRef} className={`flex w-full z-[400] p-4  flex-col absolute gap-2 ${showOccasions ? 'block' : 'hidden'} ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-textdarktheme' : 'bg-white text-blacktheme border-[1px] '} rounded-[10px] p-2`}>
                        {showOccasions && occasions?.map((occasion: BaseRecord) => (
                          <button key={occasion.id} className='text-left' onClick={() => {setUpdateInfo({...updateInfo, occasion: occasion.id});setShowOccasions(false)}}>{occasion.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className={`btn cursor-default  text-subblack ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems text-textdarktheme' : 'bg-white text-blacktheme'} rounded-[10px] `}>
                      <div onClick={() => { setShowProcess(true) }} className='cursor-pointer flex gap-10 justify-around  p-1 items-center'>
                        <div className='flex gap-2'>
                          <div onClick={() => { setShowProcess(true) }} className={`font-[600] ${localStorage.getItem('darkMode')==='true'? 'text-white':'text-bgdarktheme'}`}>Date </div>{(data.reserveDate === '') ? reservationInfo?.date : <span onClick={() => { setShowProcess(true) }}>{data.reserveDate}</span>}
                        </div>
                        <div className='flex gap-2'>
                          <div onClick={() => { setShowProcess(true) }} className={`font-[600] ${localStorage.getItem('darkMode')==='true'? 'text-white':'text-bgdarktheme'}`}>Time </div> {(data.time === '') ? reservationInfo?.time : <span onClick={() => { setShowProcess(true) }}>{data.time}</span>}
                        </div>
                        <div className='flex gap-2'>
                          <div onClick={() => { setShowProcess(true) }} className={`font-[600] ${localStorage.getItem('darkMode')==='true'? 'text-white':'text-bgdarktheme'}`}>Guests </div> {(data.guests === 0) ? reservationInfo?.number_of_guests : <span onClick={() => { setShowProcess(true) }}>{data.guests}</span>}
                        </div>
                      </div>

                    </div>
                    <BaseBtn variant="primary" className=''  loading={widgetLoading} onClick={modifyeservation} >
                      Confirm
                    </BaseBtn>
                    <button className={`btn ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`} onClick={() => setSearchParams('tab=preview')}>
                      Back
                    </button>
                  </div>
              }
              {
                tab === 'contact' &&
                <div>
                  {

                    messageLoading ? <div>
                      {Array.from({ length: 5 }, (_, index) => (
                        <LoadingComponent key={index} isDarkMode={isDarkMode} />
                      ))}
                    </div> 
                    
                    :
                  
                  !messageSent ? <div className='flex flex-col gap-2'>
                    <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
                      Send a message
                    </h3>
                    <textarea name='Message' className={`text-md inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`} placeholder='Message' onChange={(e)=>{setMessage(e.target.value)}} />
                    <BaseBtn variant="primary" className=''  loading={loadingMessage} onClick={handleSendMessage} >
                      Send
                    </BaseBtn>
                    <button className={`btn ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`} onClick={() => {setTab('preview'); setSearchParams('tab=preview')}}>
                      Back
                    </button>
                  </div>
                  :
                  <div className={`flex flex-col gap-2  items-center p-3 rounded-xl mt-4 bg-softgreentheme `}>
                    
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.1565 16.4058L12.1564 16.4057L10.8298 13.4212L12.6505 11.6001L12.6567 11.5939L12.6627 11.5874C12.819 11.4198 12.904 11.198 12.9 10.9688C12.8959 10.7396 12.8031 10.521 12.641 10.3589C12.479 10.1968 12.2603 10.104 12.0311 10.0999C11.802 10.0959 11.5802 10.181 11.4125 10.3372L11.4061 10.3432L11.3998 10.3494L9.57867 12.1701L6.59433 10.8436C6.5943 10.8436 6.59427 10.8436 6.59424 10.8436C6.46315 10.7851 6.47041 10.596 6.60631 10.5482C6.60633 10.5482 6.60636 10.5482 6.60638 10.5482L15.2873 7.51018C15.4131 7.46623 15.5338 7.58694 15.4898 7.71266L12.4517 16.3936C12.4517 16.3936 12.4517 16.3936 12.4517 16.3937C12.4039 16.5298 12.2146 16.5367 12.1565 16.4058Z" fill="#88AB61" stroke="#88AB61"/>
                        <circle cx="11.5" cy="11.5" r="9.5" stroke="#88AB61" stroke-width="2"/>
                      </svg>

                      <h3 className={`text-xl font-bold text-greentheme mb-1`}>
                        You have sent a message
                      </h3>
                    <button className={`btn-secondary flex gap-2 items-center`} onClick={() => {setTab('preview'); setSearchParams('tab=preview')}}>
                      <ArrowLeft size={15}/> <span>Back</span>
                    </button>
                  </div>
                  
                  }
                </div>
              }
              <div className='h-10'></div>
            </div>
          }
        </div>
        <div className='sm:w-[40%] lt-sm:hidden flex justify-center items-center'>
          <img src={widgetInfo?.image} className='w-[300px] h-[300px] rounded-md ' />
        </div>
      </div>
      {showProcess && <div className=''><ReservationProcess onClick={() => { setShowProcess(false) }} getDateTime={(data: dataTypes) => { setData(data) }} /></div>}
    </div>
  )
}

export default Modify
