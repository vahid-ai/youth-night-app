'use client';

import React, { useState } from 'react';
import styles from './Calendar.module.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className={styles['calendar-container']}>
      <div className={styles.calendar}>
        <div className="calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}
          {days.map(day => (
            <div key={day} className="calendar-day">{day}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
