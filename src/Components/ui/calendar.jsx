import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";

function Calendar({ selectedDate, onSelectDate, className }) {
  const [currentDate, setCurrentDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date()
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.preventDefault();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isSelected = (day) => {
    if (!day || !selectedDate) return false;
    const sel = new Date(selectedDate);
    return (
      sel.getDate() === day &&
      sel.getMonth() === month &&
      sel.getFullYear() === year
    );
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    if (onSelectDate) onSelectDate(dateStr);
  };

  return (
    <div className={cn("p-4 bg-white rounded-xl border border-slate-200 shadow-sm w-72 space-y-3", className)}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={handlePrevMonth}
          className="h-8 w-8 rounded-full bg-[#edebe9] hover:bg-[#00754A] hover:text-white flex items-center justify-center text-slate-700 transition"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="font-bold text-sm text-[#006241]">
          {monthNames[month]} {year}
        </span>

        <button
          onClick={handleNextMonth}
          className="h-8 w-8 rounded-full bg-[#edebe9] hover:bg-[#00754A] hover:text-white flex items-center justify-center text-slate-700 transition"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#1E3932]/70 uppercase tracking-wider border-b border-slate-100 pb-1.5">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-8 w-8" />;
          }

          const selected = isSelected(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center font-semibold transition-all active:scale-90 cursor-pointer",
                selected
                  ? "bg-[#00754A] text-white font-bold shadow-md ring-2 ring-[#00754A]/30"
                  : "text-slate-700 hover:bg-[#edebe9] hover:text-[#006241]"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
