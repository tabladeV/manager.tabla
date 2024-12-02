import { useEffect, useState } from "react";
import OurCalendar from "../Calendar/OurCalendar";
import { addDays, format, startOfToday } from "date-fns";
import { useDateContext } from "../../context/DateContext";
import { i18n } from "../../../../../../../Downloads/gridpack_trial/codebase/gridpack";
import { useTranslation } from "react-i18next";

const DateSelection = () => {

    const {t}= useTranslation();
    const { chosenDay, setChosenDay } = useDateContext(); // Get the global date from context

    const [isCalendar, setIsCalendar] = useState(false);

    
    // Handle date selection from the calendar
    const handleDateClick = (day: Date) => {
        setChosenDay(day); // Update the context with the new selected date
        setIsCalendar(false); // Close the calendar
    };

    // Function to get the next day
    const getNextDay = () => {
        setChosenDay(addDays(chosenDay, 1)); // Update context with the next day
    };

    // Function to get the previous day
    const getPreviousDay = () => {
        setChosenDay(addDays(chosenDay, -1)); // Update context with the previous day
    };

    // Format the day string for display
    const displayDay = chosenDay ? format(chosenDay, "dd/MM/yyyy") : "Today";

    return (
        <div >
            {/* Calendar Popup */}
            {isCalendar && (
                <div>
                    <div className="overlay" onClick={() => setIsCalendar(false)}></div>
                    <div className="popup lt-sm:w-full lt-sm:h-[70vh] lt-sm:bottom-0">
                        <OurCalendar onClick={handleDateClick} />
                    </div>
                </div>
            )}

            {/* Date Selection Controls */}
            <div className={`  flex ml-[0vw] gap-4 lt-sm:m-0 btn`}>
                {/* Previous Day Button */}
                <button
                    className="p-1 w-8 rounded-[10px] hover:bg-softgreytheme lt-sm:hidden"
                    onClick={getPreviousDay}
                >
                    {"<"}
                </button>

                {/* Current Day / Calendar Button */}
                <button
                    onClick={() => setIsCalendar(true)}
                    className="py-1 rounded-[10px] w-[15em] px-3 lt-sm:w-[6em] lt-sm:p-0 hover:bg-softgreytheme"
                >
                    {displayDay === format(startOfToday(), "dd/MM/yyyy") ? t('header.date.today') : (displayDay === format(addDays(startOfToday(), 1), "dd/MM/yyyy") ? t('header.date.tomorrow') : (displayDay === format(addDays(startOfToday(), -1), "dd/MM/yyyy") ? t('header.date.yesterday') : displayDay))}
                </button>

                {/* Next Day Button */}
                <button
                    className="p-1 w-8 rounded-[10px] hover:bg-softgreytheme lt-sm:hidden"
                    onClick={getNextDay}
                >
                    {">"}
                </button>
            </div>
        </div>
    );
};

export default DateSelection;
