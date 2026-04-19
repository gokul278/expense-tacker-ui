import React, { createContext, useContext, useState } from 'react';

type DateContextType = {
  month: string;
  year: number;
  setMonth: (m: string) => void;
  setYear: (y: number) => void;
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentMonth = MONTHS[new Date().getMonth()];
const currentYear = new Date().getFullYear();

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  return (
    <DateContext.Provider value={{ month, year, setMonth, setYear }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) throw new Error('useDate must be used within DateProvider');
  return context;
};
