// OurCalendar.d.ts
import React from 'react';
import { AvailableDate } from '../reservation/ReservationProcess';

interface OurCalendarProps {
  onClick?: (day: Date) => void;
  onMonthChange?: (month: string) => void;
  forbidden?: boolean;
  loading?: boolean;
  availableDays?: AvailableDate[];
  value?: Date | null;
}

declare const OurCalendar: React.FC<OurCalendarProps>;
export default OurCalendar;
