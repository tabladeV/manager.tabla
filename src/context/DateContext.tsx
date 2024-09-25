import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfToday } from 'date-fns';

// Create the context
const DateContext = createContext<any>(null);

// Define the types for the provider props
interface DateProviderProps {
    children: ReactNode;
}

// Provider component
export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
    const today = startOfToday();
    const [chosenDay, setChosenDay] = useState<Date>(today); // Define chosenDay and setChosenDay

    return (
        <DateContext.Provider value={{ chosenDay, setChosenDay }}>
            {children}
        </DateContext.Provider>
    );
};

// Custom hook to access the date context
export const useDateContext = () => useContext(DateContext);
