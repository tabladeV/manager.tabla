import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Logo from '../../components/header/Logo';
import ReservationProcess from '../../components/reservation/ReservationProcess';
import { LoaderCircle, ScreenShareIcon } from 'lucide-react';
import { BaseKey, BaseRecord, useCreate, useCustom, useList, useOne } from '@refinedev/core';
import { format } from 'date-fns';
import { getSubdomain } from '../../utils/getSubdomain';
import WidgetReservationProcess from '../../components/reservation/WidgetReservationProcess';

const WidgetPage = () => {

  
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = "Tabla | Taste Morocco's best ";
  }, [pathname]);

  const { restaurant } = useParams();
  const [restaurantID, setRestaurantID] = useState<BaseKey>();
  const { data: widgetData } = useOne({
    resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
    id: '',
  });

  const subdomain = getSubdomain();
  const [occasions, setOccasions] = useState<BaseRecord[]>();

  const { data: posts } = useList({
    resource: `api/v1/bo/restaurants/subdomain/occasions`,
  });

  useEffect(() => {
    if (posts) {
      setOccasions(posts.data as unknown as BaseRecord[]);
    }

  }, [posts])

  

  const { mutate: createReservation } = useCreate();
  const [widgetInfo, setWidgetInfo] = useState<BaseRecord>();

  useEffect(() => {
    if (widgetData) {
      setWidgetInfo(widgetData.data);
      setRestaurantID(widgetData.data.restaurant);
    }
  }, [widgetData]);

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
    allergies: string;
    preferences: string;
    time: string;
    number_of_guests: number;
    commenter?: string;
    user?: number;
    offer?: number;
  }

  const [allInformations, setAllInformations] = useState<infoType>();
  const [data, setData] = useState({ reserveDate: '', time: '', guests: 0 });
  const [userInfromation, setUserInformation] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    preferences: '',
    allergies: '',
    occasion: '',
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const updatedUserInformation = {
      firstname: e.target.firstname.value,
      lastname: e.target.lastname.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      preferences: e.target.preferences.value,
      allergies: e.target.allergies.value,
      occasion: e.target.occasion?.value!== 0? e.target.occasion?.value: null, 
    };
    setUserInformation(updatedUserInformation);
    if (
      e.target.firstname.value !== '' &&
      e.target.lastname.value !== '' &&
      e.target.email.value !== '' &&
      e.target.phone.value !== ''
    ) {
      setStep(4);
    }
  };

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
      setStep(6);
    }
  }, [isWidgetActivated]);

  const [serverError, setServerError] = useState<string>();

  const handleConfirmation = () => {
    setAllInformations({
      customer: {
        email: userInfromation.email,
        first_name: userInfromation.firstname,
        last_name: userInfromation.lastname,
        phone: userInfromation.phone,
      },
      review_link: '',
      restaurant: restaurantID as number,
      internal_note: '',
      occasion: userInfromation.occasion,
      source: 'WIDGET',
      status: 'PENDING',
      allergies: 'string',
      preferences: 'string',
      date: format(data.reserveDate, 'yyyy-MM-dd'),
      time: data.time + ':00',
      number_of_guests: data.guests,
    });

    createReservation(
      {
        resource: `api/v1/bo/subdomains/public/cutomer/reservations/`,
        values: {
          customer: {
            email: userInfromation.email,
            first_name: userInfromation.firstname,
            last_name: userInfromation.lastname,
            phone: userInfromation.phone,
          },
          review_link: '',
          restaurant: 1,
          internal_note: '',
          occasion: Number(userInfromation.occasion),
          source: 'WIDGET',
          status: 'PENDING',
          allergies: userInfromation.allergies,
          preferences: userInfromation.preferences,
          commenter: userInfromation.preferences,
          date: format(data.reserveDate, 'yyyy-MM-dd'),
          time: data.time + ':00',
          number_of_guests: data.guests,
        },
      },
      {
        onSuccess: () => {
          setStep(5);
        },
        onError: () => {
          setServerError('Something went wrong');
        },
      }
    );
  };

  return (
    <div className="h-[100vh] bg-white dark:bg-bgdarktheme2 text-black dark:text-white">
      <div className="h-[10vh] w-full flex items-center justify-between px-4 sm:px-10 shadow-xl shadow-[#00000004] bg-white dark:bg-bgdarktheme">
        <Logo className="horizontal" />
        <button
          onClick={() => {document.documentElement.classList.toggle('dark');localStorage.setItem('darkMode', document.documentElement.classList.contains('dark') ? 'true' : 'false');}}
          className="btn-secondary hover:bg-[#88AB6110] my-[1em] p-1 w-[40px] h-[40px] flex justify-center items-center rounded-[100%]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="dark:hidden"
          >
            <path
              d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM11 1V5H13V1H11ZM11 19V23H13V19H11ZM23 11H19V13H23V11ZM5 11H1V13H5V11ZM16.24 17.66L18.71 20.13L20.12 18.72L17.65 16.25L16.24 17.66ZM3.87 5.28L6.34 7.75L7.75 6.34L5.28 3.87L3.87 5.28ZM6.34 16.24L3.87 18.71L5.28 20.12L7.75 17.65L6.34 16.24ZM18.72 3.87L16.25 6.34L17.66 7.75L20.13 5.28L18.72 3.87Z"
              fill="#88AB61"
            />
          </svg>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hidden dark:block "
          >
            <path
              d="M12.0581 20C9.83544 20 7.94644 19.2223 6.39111 17.667C4.83577 16.1117 4.05811 14.2227 4.05811 12C4.05811 9.97401 4.71811 8.21734 6.03811 6.73001C7.35811 5.24267 8.99277 4.36467 10.9421 4.09601C10.9961 4.09601 11.0491 4.09801 11.1011 4.10201C11.1531 4.10601 11.2041 4.11167 11.2541 4.11901C10.9168 4.58967 10.6498 5.11301 10.4531 5.68901C10.2564 6.26501 10.1581 6.86867 10.1581 7.50001C10.1581 9.27801 10.7801 10.789 12.0241 12.033C13.2681 13.277 14.7794 13.8993 16.5581 13.9C17.1921 13.9 17.7964 13.8017 18.3711 13.605C18.9458 13.4083 19.4618 13.1413 19.9191 12.804C19.9271 12.854 19.9328 12.905 19.9361 12.957C19.9394 13.009 19.9414 13.062 19.9421 13.116C19.6861 15.0647 18.8144 16.699 17.3271 18.019C15.8398 19.339 14.0841 19.9993 12.0581 20Z"
              fill="#88AB61"
            />
          </svg>
        </button>
      </div>
      <div className="h-[90vh] items-center xl:max-w-[1200px] no-scrollbar mx-auto pb-[5em] overflow-y-auto w-full flex flex-col sm:flex-row p-5 px-4 sm:px-10 justify-between">
        <div className="w-full sm:w-[60%]">
          <h1 className={`text-3xl font-bold mt-4 ${step === 6 ? 'hidden' : 'block'} text-[#3A541C] dark:text-greentheme`}>
            {widgetInfo?.title}
          </h1>
          <p className={`w-full sm:w-[50%] mt-3 ${step > 1 ? 'hidden' : 'block'} text-subblack dark:text-white`}>
            {widgetInfo?.description}
          </p>
          {step === 1 && (
            <div className="w-full sm:w-[70%]">
              <div
                className={`btn flex justify-around  cursor-default items-center text-subblack my-3 bg-white dark:bg-bgdarktheme text-blacktheme dark:text-textdarktheme rounded-[10px]`}
              >
                <div onClick={() => setShowProcess(true)} className="flex justify-around w-full gap-10 cursor-pointer p-1 items-center">
                  {data.reserveDate === '' ? <div>Date</div> : <span>{data.reserveDate}</span>}
                  {data.time === '' ? <div>Time</div> : <span>{data.time}</span>}
                  {data.guests === 0 ? <div>Guests</div> : <span>{data.guests}</span>}
                </div>
              </div>
                <button
                  onClick={() => setStep(2)}
                  className={`btn-primary lt-sm:w-full ${
                    data.reserveDate === '' || data.time === '' || data.guests === 0
                      ? 'bg-greentheme hover:bg-greentheme cursor-not-allowed opacity-30'
                      : ''
                  }`}
                  disabled={data.reserveDate === '' || data.time === '' || data.guests === 0}
                >
                  Book
                </button>
              {widgetInfo?.menu_file && (
                <div className="btn-secondary w-fit flex gap-4 items-center mt-3 justify-center cursor-pointer">
                  <p onClick={() => window.open(widgetInfo.menu_file, '_blank')}>Preview our menu</p>
                  <ScreenShareIcon size={20} />
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <div>
              <form className="mt-3 flex flex-col gap-3" onSubmit={handleSubmit}>
                <input id="firstname" type="text" placeholder="First Name" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2" />
                <input id="lastname" type="text" placeholder="Last Name" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2" />
                <input id="email" type="text" placeholder="Email" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2" />
                <input id="phone" type="text" placeholder="Phone" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2" />
                <textarea id="allergies" placeholder="Allergies" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2" />
                <textarea id="preferences" placeholder="Preferences" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2" />
                {
                occasions?.length? <select id="occasion" className="inputs-unique w-full sm:w-[30em] bg-white dark:bg-bgdarktheme2">
                  {occasions?.map((occasion: BaseRecord) => (
                    <option key={occasion.id} value={occasion.id}>
                      {occasion.name}
                    </option>
                  ))}
                </select>:<></>
                }
                <div className="flex w-full sm:w-[30em] gap-3 mt-1">
                  <button onClick={() => setStep(1)} className="btn w-full mt-3 text-blacktheme dark:text-white">
                    Back
                  </button>
                  <button type="submit" className="btn-primary w-full mt-3">
                    

                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col  gap-3">
              <div className=' w-full sm:w-[30em] flex flex-col gap-3 bg-white dark:bg-bgdarktheme2'>
                <div className="flex flex-col gap-3">
                  <p className="text-left text-xl font-bold mt-3">Your reservation details</p>                  
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>First Name:</p>
                  <p className='' >{userInfromation.firstname}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Last Name:</p>
                  <p className='' >{userInfromation.lastname}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Email:</p>
                  <p className='' >{userInfromation.email}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Phone:</p>
                  <p className='' >{userInfromation.phone}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Preferences:</p>
                  <p className='' >{userInfromation.preferences}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Allergies:</p>
                  <p className='' >{userInfromation.allergies}</p>
                </div>
                {
                  (occasions?.length && userInfromation.occasion)?
                  <div className="flex gap-3 inputs-unique">
                    <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Occasion:</p>
                    <p className='' >{occasions?.find((occasion: BaseRecord) => occasion.id === Number(userInfromation.occasion))?.name}</p>
                  </div>:<></>
                }
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Date:</p>
                  <p className='' >{format(data.reserveDate, 'yyyy-MM-dd')}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Time:</p>
                  <p className='' >{data.time}</p>
                </div>
                <div className="flex gap-3 inputs-unique">
                  <p className='text-subblack font-[600] dark:text-[#e1e1e1]'>Guests:</p>
                  <p className='' >{data.guests}</p>
                </div>
              </div>
              <button onClick={handleConfirmation} className="btn-primary mt-3 w-fit lt-sm:w-full">
                Confirm your reservation
              </button>
              <p className="text-sm text-center text-redtheme">{serverError}</p>
            </div>
          )}
          {step === 5 && (
            <div>
              <p className="mt-3 text-subblack dark:text-[#e1e1e1]">
                Your reservation has been successfully made. You will receive a confirmation email shortly.
              </p>
              <button onClick={() => window.location.reload()} className="btn-primary mt-3">
                Make another reservation
              </button>
            </div>
          )}
          {step === 6 && (
            <div>
              <h1 className="text-2xl font-bold text-center mt-3">{widgetInfo?.disabled_title}</h1>
              <p className="mt-3 text-subblack dark:text-[#e1e1e1]">{widgetInfo?.disabled_description}</p>
            </div>
          )}
          {showProcess && (
            <div>
              <WidgetReservationProcess
                onClick={() => setShowProcess(false)}
                maxGuests={widgetInfo?.max_of_guests_par_reservation}
                resData={data}
                getDateTime={(data: any) => setData(data)}
              />
            </div>
          )}
        </div>
        <div className="w-full sm:w-[40%] hidden sm:flex justify-center items-center">
          <img src={widgetInfo?.image} className="w-[300px] h-[300px] bg-cover rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default WidgetPage;