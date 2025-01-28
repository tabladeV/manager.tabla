import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LoggedContextProps {
    isLoggedIn: boolean;
    login: () => void;
    logout: () => void;
}

const LoggedContext = createContext<LoggedContextProps | undefined>(undefined);

export const LoggedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = () => setIsLoggedIn(true);
    const logout = () => setIsLoggedIn(false);

    return (
        <LoggedContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </LoggedContext.Provider>
    );
};

export const useLogged = (): LoggedContextProps => {
    const context = useContext(LoggedContext);
    if (!context) {
        throw new Error('useLogged must be used within a LoggedProvider');
    }
    return context;
};