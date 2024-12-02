import React, { createContext, useContext, useState, ReactNode } from 'react';

const PowerContext = createContext<any>(null);

interface PowerPorviderProps {
    children: ReactNode;
}


export const PowerProvider: React.FC<PowerPorviderProps> = ({ children }) => {
    const [power, setPower] = useState<boolean>(false);
    return (
        <PowerContext.Provider value={{ power, setPower }}>
            {children}
        </PowerContext.Provider>
    );
};

// Custom hook to access the date context
export const usePowerContext = () => useContext(PowerContext);
