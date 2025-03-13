import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import Logo from '../../components/header/Logo';

import logo from '../../assets/logo.png';
import logovertical from '../../assets/LOGO-Vert.png';
import ReservationProcess from '../../components/reservation/ReservationProcess';
import { Download, Navigation, ScreenShareIcon } from 'lucide-react';
import { BaseKey, BaseRecord, useCreate, useCustom, useList, useOne } from '@refinedev/core';
import { table } from 'console';

import bg from '../../assets/bg-widget.png'

import pdf from '../../assets/Regression logistique.pdf'
import { format, set } from 'date-fns';
import { getSubdomain } from '../../utils/getSubdomain';



const WidgetPage = () => {
  const { restaurant } = useParams();

  const [restaurantID, setRestaurantID] = useState<BaseKey>();
  const { data: widgetData, isLoading, error } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: ''
  });


  
  const subdomain = getSubdomain();

  const [occasions, setOccasions] = useState<BaseRecord[]>();

  const { data: posts } = useCustom({
    url: `https://api.dev.tabla.ma/api/v1/bo/restaurants/subdomain/occasions`,
    method: "get",
    
  });

  useEffect(() => {
    if(posts){
      setOccasions(posts.data as unknown as BaseRecord[])
    }
  }, [posts])

  // const {data: occasionData, isLoading: occasionLoading, error: occasionError} = useList({
  //   resource: `api/v1/bo/occasions/`,
  // });

  

  // const [occasions, setOccasions] = useState<BaseRecord[]>();

  // useEffect(() => {
  //   if (occasionData) {
  //     setOccasions(occasionData.data as unknown as BaseRecord[]);
  //   }
  // }, [occasionData]);
  
  // interface OccasionType {
  //   results: BaseRecord[];
  // }

  // const [occasionApiData, setOccasionApiData] = useState<OccasionType>();



  // const { data: occasionData, isLoading: occasionLoading, error: occasionError } = useList({
  //   resource: `api/v1/bo/occasions/`,
  //   filters: [
  //     {
  //       field: "page",
  //       operator: "eq",
  //       value: 1,
  //     },
  //     {
  //       field: "page_size",
  //       operator: "eq",
  //       value: 20,
  //     },
  //   ], 
  //   queryOptions: {
  //     onSuccess: (data) => {
  //       setOccasionApiData(data.data as unknown as OccasionType);
  //       setOccasions(occasionApiData?.results);
  //     }
  //   }
  // });

  const { mutate: createReservation } = useCreate()

  const [widgetInfo, setWidgetInfo] = useState<BaseRecord>();


  useEffect(() => {
    console.log(' widgetData ', widgetData)
    if (widgetData) {
      setWidgetInfo(widgetData.data);
      setRestaurantID(widgetData.data.restaurant);
    }
  }, [widgetData]);

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdf;
    link.download = 'Regression logistique.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const [step, setStep] = useState(1);
  const [showProcess, setShowProcess] = useState(false);


  interface infoType {
    customer: {
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
    };
    occasion?: string;
    internal_note?: string;
    restaurant: number;
    review_link?: string;
    tableId?: BaseKey;
    date?: string;
    source?: string;
    status?: string;
    allergies: string,
    preferences: string,
    time: string;
    number_of_guests: number;
    commenter?: string;
    user?: number;
    offer?: number;
  }
  const [allInformations, setAllInformations] = useState<infoType>();



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

  useEffect(() => {
    console.log(data);
  }, [data]);

  const [userInfromation, setUserInformation] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    // message: '',
    preferences: '',
    allergies: '',
    occasion: ''
  });


  const handleSubmit = (e: any) => {
    e.preventDefault();
    const updatedUserInformation = {
      firstname: e.target.firstname.value,
      lastname: e.target.lastname.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      // message: e.target.req.value,
      preferences: e.target.preferences.value,
      allergies: e.target.allergies.value,
      occasion: e.target.occasion.value
    };
    setUserInformation(updatedUserInformation);
    if (e.target.firstname.value !== '' && e.target.lastname.value !== '' && e.target.email.value !== '' && e.target.phone.value !== '') {
      setStep(4);
    }

  }
  useEffect(() => {
    console.log(userInfromation);
  }, [userInfromation]);


  const [isWidgetActivated, setIsWidgetActivated] = useState(true);

  useEffect(() => {
    if (widgetInfo) {
      setIsWidgetActivated(widgetInfo?.is_widget_activated);
    }
  }, [widgetInfo]);

  useEffect(() => {
    if (isWidgetActivated) {
      setStep(1);
    } else {
      setStep(6)
    }
  }, [isWidgetActivated]);

  const [serverError, setServerError] = useState<string>();

  const handleConfirmation = () => {
    setAllInformations({
      customer: {
        email: userInfromation.email,
        first_name: userInfromation.firstname,
        last_name: userInfromation.lastname,
        phone: userInfromation.phone
      },
      review_link: "",
      restaurant: restaurantID as number,
      internal_note: "",
      occasion: userInfromation.occasion,
      source: 'WIDGET',
      status: 'PENDING',
      allergies: "string",
      preferences: "string",
      // commenter: userInfromation.message,
      date: format(data.reserveDate, 'yyyy-MM-dd'),
      time: data.time + ':00',
      number_of_guests: data.guests
    });

    console.log(allInformations, 'test');
    createReservation({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations/`,
      values: {
        customer: {
          email: userInfromation.email,
          first_name: userInfromation.firstname,
          last_name: userInfromation.lastname,
          phone: userInfromation.phone
        },
        review_link: "",
        restaurant: 1,
        internal_note: "",
        occasion: Number(userInfromation.occasion),
        source: 'WIDGET',
        status: 'PENDING',
        allergies: userInfromation.allergies,
        preferences: userInfromation.preferences,
        commenter: userInfromation.preferences,
        date: format(data.reserveDate, 'yyyy-MM-dd'),
        time: data.time + ':00',
        number_of_guests: data.guests
      }
    }, {
      onSuccess: () => {
        setStep(5);


      },
      onError: () => {
        setServerError('Something went wrong');
      }
    });
  }

  
  console.log(allInformations);

  console.log(widgetInfo)
  const openPdfInNewTab = () => {

    const linkSource = widgetInfo?.menu_file;
    window.open(linkSource, '_blank');
  };

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
    // window.location.reload();
  };
  return (
    <div className={`h-[100vh] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2 text-white' : 'bg-white '}`}>
      <div 
        className={`h-[10vh] w-full flex items-center justify-between px-10 shadow-xl shadow-[#00000004] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'} `}
      >

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
      <div className='h-[90vh] xl:max-w-[1200px] no-scrollbar mx-auto  pb-[5em] overflow-y-auto w-full flex p-5 px-10 justify-between'>
        <div className='w-[60%] lt-sm:w-full'>

          <h1 className={`text-3xl  font-bold mt-4 ${step === 6 ? 'hidden' : 'block'} ${localStorage.getItem('darkMode') === 'true' ? 'text-greentheme ' : 'text-[#3A541C]'}`}> {widgetInfo?.title}</h1>

          <p className={` w-[50%] lt-sm:w-[90%] mt-3 ${step > 1 ? 'hidden' : 'block'} ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffff]' : 'text-subblack '}`}>
            {widgetInfo?.description}
          </p>
          {step === 1 && <div className='w-[70%]'>
            <div className={`btn flex justify-around inputs  cursor-default gap-10 items-center text-subblack mt-3 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme text-textdarktheme' : 'bg-white text-blacktheme'} rounded-[10px] `}>
              <div onClick={() => { setShowProcess(true) }} className='flex justify-around w-full gap-10 cursor-pointer p-3 items-center '>
                {(data.reserveDate === '') ? <div onClick={() => { setShowProcess(true) }}>date </div> : <span onClick={() => { setShowProcess(true) }}>{data.reserveDate}</span>}
                {(data.time === '') ? <div onClick={() => { setShowProcess(true) }}>Time </div> : <span onClick={() => { setShowProcess(true) }}>{data.time}</span>}
                {(data.guests === 0) ? <div onClick={() => { setShowProcess(true) }}>Guests </div> : <span onClick={() => { setShowProcess(true) }}>{data.guests}</span>}
              </div>
              <button onClick={() => { setStep(2) }} className={`btn-primary ${(data.reserveDate === '' || data.time === '' || data.guests === 0) ? 'bg-greentheme hover:bg-greentheme cursor-not-allowed opacity-30' : ''} `} disabled={data.reserveDate === '' || data.time === '' || data.guests === 0}>
                Book
              </button>
            </div>



            {widgetInfo?.menu_file && <div className='btn-secondary w-fit flex gap-4 items-center mt-3 justify-center cursor-pointer'>
              <p className='' onClick={openPdfInNewTab}>Preview our menu </p>
              <ScreenShareIcon size={20} />
            </div>}

          </div>}
          {
            step === 2 &&
            <div>
              <form className='mt-3 flex flex-col gap-3' onSubmit={(e) => { handleSubmit(e) }}>
                <input id='firstname' type="text" placeholder='First Name' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`} />
                <input id='lastname' type="text" placeholder='Last Name' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`} />
                <input id='email' type="text" placeholder='Email' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`} />
                <input id='phone' type="text" placeholder='Phone' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`} />
                <textarea id='allergies' placeholder='Allergies' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`} />
                <textarea id='preferences' placeholder='Preferences' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`} />
                
                <select id='occasion' className={`inputs-unique w-[30em] ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : ''}`}>
                  {occasions?.map((occasion: BaseRecord) => (
                    <option key={occasion.id} value={occasion.id}>{occasion.name}</option>
                  ))}
                </select>

                <div className='flex w-[30em] gap-3 mt-1'>
                  <button onClick={() => { setStep(1) }} className={`btn w-full mt-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-white hover:text-white' : ''}`}>
                    Back
                  </button>
                  <button type='submit' className='btn-primary w-full mt-3'>Submit</button>

                </div>
              </form>
            </div>
          }
          {/* {
            step === 3 &&
            <div className='flex items-center flex-col gap-3'>
              <div className='flex gap-3 mt-5'>
                {roofs.map((roof: BaseRecord) => (
                  <button
                    className={` ${focusedRoof === roof.id ? 'btn-primary ' : 'btn-secondary'}`}
                    key={roof.id}
                    onClick={() => setFocusedRoof(roof.id)}
                  >
                    {roof.name}
                  </button>
                ))}
              </div>
              <div className='relative h-[55vh] w-[80vw] lt-sm:overflow-x-auto shadow-2xl shadow-[#00000020] bg-white mb-3 rounded-[10px] '>
                {tables.filter((table: BaseRecord) => table.floor === floorId).map((table: BaseRecord) => (
                    <button 
                    onClick={()=>table.id !== undefined && handleTableClick(table.id)}
                    disabled={table.id !== undefined && reservedTables.includes(table.id)}
                    className='absolute p-2 '
                    style={{
                      width: table.width,
                      height: table.height,
                      left: table.x,
                      top: table.y,
                      backgroundColor: table.id !== undefined && reservedTables.includes(table.id) ? '#FF4B4B' : '#F4F4F4',
                      borderRadius: table.type === 'RECTANGLE' ? '10px' : '50%',
                    }}
                    >
                      <h2 className='text-[14px] font-semibold'>{table.name}</h2>
                      <p className='text-[13px] p-1 bg-[#1e1e1e10] rounded-[5px]'>{table.max} seats</p>
                    </button>
                    
                ))}
              </div>

            </div>
          } */}
          {
            step === 4 &&
            <div className='flex flex-col items-center gap-3'>
              <button onClick={handleConfirmation} className='btn-primary mt-3'>Confirm your reservation</button>
              <p className='text-sm text-center text-redtheme'>{serverError}</p>
            </div>
          }
          {
            step === 5 &&
            <div>
              <p className={` mt-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#e1e1e1]' : 'text-subblack'}`}>
                Your reservation has been successfully made. You will receive a confirmation email shortly.
              </p>
              <button onClick={() => { setStep(1) }} className='btn-primary mt-3'>Back</button>
            </div>
          }
          {
            step === 6 &&
            <div>
              <h1 className='text-2xl font-bold text-center mt-3'>
                {widgetInfo?.disabled_title}
              </h1>
              <p className={` mt-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#e1e1e1]' : 'text-subblack'}`}>
                {widgetInfo?.disabled_description}
              </p>
            </div>
          }

          {showProcess && <div className=''><ReservationProcess onClick={() => { setShowProcess(false) }} getDateTime={(data: dataTypes) => { setData(data) }} /></div>}
        </div>
        <div className='sm:w-[40%] lt-sm:hidden flex justify-center items-center'>
          <img src={widgetInfo?.image} className='w-[300px] h-[300px] bg-cover rounded-md ' />
        </div>
      </div>
    </div>
  )
}

export default WidgetPage
