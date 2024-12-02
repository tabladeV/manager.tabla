import { createContext, useContext, useState } from "react";

// Create the context
interface DarkContextType {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DarkContext = createContext<DarkContextType | undefined>(undefined);

// Define the types for the provider props
interface DarkProviderProps {
    children: React.ReactNode;
}

// Provider component
export const DarkProvider: React.FC<DarkProviderProps> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    return (
        <DarkContext.Provider value={{darkMode,setDarkMode}}>
            {children}
        </DarkContext.Provider>
    );
};

export const useDarkContext = () => useContext(DarkContext);
