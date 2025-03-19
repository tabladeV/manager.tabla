import { createContext, useContext, useState, useEffect } from "react";

// Create the context
interface DarkContextType {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDarkMode: () => void;
}

const DarkContext = createContext<DarkContextType | undefined>(undefined);

// Define the types for the provider props
interface DarkProviderProps {
  children: React.ReactNode;
}

// Provider component
export const DarkProvider: React.FC<DarkProviderProps> = ({ children }) => {
  // Initialize state from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const storedDarkMode = localStorage.getItem('darkMode');
      return storedDarkMode === 'true';
    } catch (error) {
      // In case localStorage is not available
      return false;
    }
  });

  // Toggle function for easier dark mode switching
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Effect to handle theme application and localStorage sync
  useEffect(() => {
    try {
      // Update localStorage
      localStorage.setItem('darkMode', darkMode.toString());
      
      // Apply or remove dark class from document
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Failed to update dark mode settings:', error);
    }
  }, [darkMode]);

  return (
    <DarkContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode }}>
      {children}
    </DarkContext.Provider>
  );
};

// Custom hook for using the context
export const useDarkContext = () => {
  const context = useContext(DarkContext);
  if (context === undefined) {
    throw new Error('useDarkContext must be used within a DarkProvider');
  }
  return context;
};
