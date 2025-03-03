import React, { useEffect, useState } from 'react'
import Logo from '../../components/header/Logo'
import { Moon, Sun } from 'lucide-react'
import { BaseRecord, useOne } from '@refinedev/core';

const Modify = () => {
  
    const [widgetInfo, setWidgetInfo] = useState<BaseRecord>();
    
    const { data: widgetData, isLoading, error } = useOne({
      resource: `api/v1/bo/subdomains/public/cutomer/reservations`,
      id: ''
    });
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
      // window.location.reload();
    };



  return (
    <div className={`h-[100vh]  ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : 'bg-white'}`}>
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

      <div className='h-[90vh] pb-[5em] overflow-y-auto w-full flex p-5 px-10 justify-between'>
        <div className='w-[60%] lt-sm:w-full'>
          <h1 className={`text-4xl font-bold ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
            Kujira Restaurant
          </h1>
          <p className={`text-md mt-1 items-center flex gap-2 ${localStorage.getItem('darkMode') === 'true' ? 'text-softwhitetheme' : ''}`}>
            Marrakesh, Morocco .   
              <svg className='mr-[-5px]' width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.275L7.84996 19.775C7.66663 19.8917 7.47496 19.9417 7.27496 19.925C7.07496 19.9083 6.89996 19.8417 6.74996 19.725C6.59996 19.6083 6.4833 19.4627 6.39996 19.288C6.31663 19.1133 6.29996 18.9173 6.34996 18.7L7.44996 13.975L3.77496 10.8C3.6083 10.65 3.5043 10.479 3.46296 10.287C3.42163 10.095 3.43396 9.90766 3.49996 9.725C3.56596 9.54233 3.66596 9.39233 3.79996 9.275C3.93396 9.15766 4.1173 9.08266 4.34996 9.05L9.19996 8.625L11.075 4.175C11.1583 3.975 11.2876 3.825 11.463 3.725C11.6383 3.625 11.8173 3.575 12 3.575C12.1826 3.575 12.3616 3.625 12.537 3.725C12.7123 3.825 12.8416 3.975 12.925 4.175L14.8 8.625L19.65 9.05C19.8833 9.08333 20.0666 9.15833 20.2 9.275C20.3333 9.39166 20.4333 9.54166 20.5 9.725C20.5666 9.90833 20.5793 10.096 20.538 10.288C20.4966 10.48 20.3923 10.6507 20.225 10.8L16.55 13.975L17.65 18.7C17.7 18.9167 17.6833 19.1127 17.6 19.288C17.5166 19.4633 17.4 19.609 17.25 19.725C17.1 19.841 16.925 19.9077 16.725 19.925C16.525 19.9423 16.3333 19.8923 16.15 19.775L12 17.275Z" fill="#FAC802"/>
              </svg>

                {`(5.0)`}
          </p>
          <div>
            <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
              Description
            </h3>
            <p className={`text-md mt-1 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffff85]' : ''}`}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.
              Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.
            </p>
          </div>
          <div className='flex flex-col gap-2'>
            <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
              Your reservation details
            </h3>
            <p className={`text-md mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
              <span className='font-bold mx-4'>
                Special Request:
              </span>
              A table beside the window
            </p>
            <p className={`text-md mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
              <span className='font-bold mx-4'>
                Allergies
              </span>
              Peanuts
            </p>
            <p className={`text-md mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
              <span className='font-bold mx-4'>
                Occasion
              </span>
              Birthday
            </p>
            <p className={`text-md  flex justify-around mt-1 inputs gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] bg-darkthemeitems ' : ''}`}>
              <p className={`text-md  gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] ' : ''}`}>
                <span className='font-bold mr-4'>
                  Date
                </span>
                2025-04-02
              </p>
              <p className={`text-md  gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] ' : ''}`}>
                <span className='font-bold mr-4'>
                  Time
                </span>
                20:00
              </p>
              <p className={`text-md  gap-3 ${localStorage.getItem('darkMode') === 'true' ? 'text-[#ffffffd5] ' : ''}`}>
                <span className='font-bold mr-4'>
                  Guests
                </span>
                3
              </p>
            </p>
            <button className={`btn-primary mt-2 ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`}>
              Confirm
            </button>
          </div>
          <div className='w-full '>
            <h3 className={`text-xl font-bold mt-5 ${localStorage.getItem('darkMode') === 'true' ? 'text-white' : ''}`}>
              Other actions
            </h3>
            <div className='flex  w-full gap-2 mt-2'>
              <button className={`btn-secondary w-full ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`}>
                Modify
              </button>
              <button className={`btn-secondary w-full bg-softredtheme hover:bg-redtheme  text-redtheme hover:text-white ${localStorage.getItem('darkMode') === 'true' ? '' : ''}`}>
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className='sm:w-[40%] lt-sm:hidden flex justify-center items-center'>
          <img src={widgetInfo?.image} className='w-[300px] h-[300px] rounded-md ' />
        </div>
      </div>
    </div>
  )
}

export default Modify
