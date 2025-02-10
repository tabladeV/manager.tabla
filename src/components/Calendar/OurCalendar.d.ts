// OurCalendar.d.ts
import React from 'react';

interface OurCalendarProps {
  onClick?: (day: Date) => void;
  forbidden?: boolean;
}

declare const OurCalendar: React.FC<OurCalendarProps>;
export default OurCalendar;
