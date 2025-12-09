import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Flight, Aircraft, Instructor } from '../App';

interface MasterScheduleProps {
  selectedDate: Date;
  flights: Flight[];
  aircraft: Aircraft[];
  instructors: Instructor[];
  currentUser?: string;
  onDateChange?: (date: Date) => void;
}

const CATEGORY_COLORS = {
  'standard': 'bg-blue-500',
  'unavailable': 'bg-gray-400',
  'spin-training': 'bg-green-500',
  'photo-flight': 'bg-pink-400',
  'new-student': 'bg-white border border-slate-300',
  'meeting': 'bg-gray-700',
  'maintenance': 'bg-red-600',
  'in-office': 'bg-amber-100 text-slate-800',
  'h6-operations': 'bg-orange-500',
  'groundschool': 'bg-purple-500',
  'ground-instruction': 'bg-yellow-400 text-slate-800',
  'aircraft-checkout': 'bg-teal-500',
  'down-time': 'bg-slate-300',
  'checkride-category': 'bg-indigo-600',
  'bfr': 'bg-cyan-500'
} as const;

const LEGEND_ITEMS = [
  { key: 'standard', label: 'Standard', color: 'bg-blue-500' },
  { key: 'unavailable', label: 'Unavailable', color: 'bg-gray-400' },
  { key: 'spin-training', label: 'Spin Training', color: 'bg-green-500' },
  { key: 'photo-flight', label: 'Photo Flight', color: 'bg-pink-400' },
  { key: 'new-student', label: 'New Student', color: 'bg-white border border-slate-300' },
  { key: 'meeting', label: 'Meeting', color: 'bg-gray-700' },
  { key: 'maintenance', label: 'Maintenance', color: 'bg-red-600' },
  { key: 'in-office', label: 'In Office', color: 'bg-amber-100 text-slate-800 border border-amber-200' },
  { key: 'h6-operations', label: 'H6 Operations', color: 'bg-orange-500' },
  { key: 'groundschool', label: 'Groundschool', color: 'bg-purple-500' },
  { key: 'ground-instruction', label: 'Ground Instruction', color: 'bg-yellow-400 text-slate-800' },
];

export function MasterSchedule({ 
  selectedDate, 
  flights, 
  aircraft, 
  instructors, 
  currentUser = 'You',
  onDateChange 
}: MasterScheduleProps) {
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [localDate, setLocalDate] = useState(selectedDate);
  const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(true);

  // Generate time slots from 6:00 AM to 10:00 PM (every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get flights for the selected date
  const dayFlights = flights.filter(
    f => f.date.toDateString() === localDate.toDateString() && f.status !== 'cancelled'
  );

  // Format time for display (ultra compact)
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Only show labels for on-the-hour times
    if (minutes !== 0) {
      return '';
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:00 ${period}`;
  };

  // Abbreviate instructor name (more compact)
  const abbreviateName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      const firstName = parts[0];
      const lastName = parts[parts.length - 1];
      // Use first initial + last name if first name is long
      if (firstName.length > 6) {
        return `${firstName.charAt(0)}. ${lastName}`;
      }
      return `${firstName} ${lastName.charAt(0)}.`;
    }
    return name;
  };

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if a resource is reserved at a given time
  const getReservation = (slotTime: string, resourceId: string, resourceType: 'aircraft' | 'instructor') => {
    const slotMinutes = timeToMinutes(slotTime);
    const resourceFlights = dayFlights.filter(flight => {
      if (resourceType === 'aircraft') {
        return flight.aircraft === resourceId;
      } else {
        return flight.instructor === resourceId;
      }
    });

    return resourceFlights.find(flight => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Check if this is the first slot of a reservation
  const isFirstSlotOfReservation = (slotTime: string, flight: Flight) => {
    return slotTime === flight.startTime;
  };

  // Calculate how many 30-minute slots a flight spans
  const getFlightSpanSlots = (flight: Flight) => {
    const startMinutes = timeToMinutes(flight.startTime);
    const endMinutes = timeToMinutes(flight.endTime);
    return Math.ceil((endMinutes - startMinutes) / 30);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setLocalDate(date);
      if (onDateChange) {
        onDateChange(date);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 h-full w-full min-h-0 p-2 sm:p-3 md:p-4">
      {/* Mobile: Calendar and Legend in collapsible cards */}
      <div className="lg:hidden space-y-2 flex-shrink-0">
        {/* Toggle Button */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 rounded-md border border-slate-200 hover:bg-slate-200 transition-colors"
          >
            <span className="text-xs font-medium">Calendar and Legend</span>
            {isCalendarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Calendar and Legend */}
        {!isCalendarCollapsed && (
          <div className="flex gap-2">
            <Card className="flex-shrink-0">
              <CardContent className="p-1">
                <div className="flex items-center justify-center -m-2">
                  <Calendar
                    mode="single"
                    selected={localDate}
                    onSelect={handleDateChange}
                    className="rounded-md scale-[0.65]"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-2">
                <div className="grid grid-cols-2 gap-1.5">
                  {LEGEND_ITEMS.map(item => (
                    <div key={item.key} className="flex items-center gap-1.5 text-[10px]">
                      <div className={`w-4 h-3 rounded flex-shrink-0 ${item.color}`} />
                      <span className="leading-tight truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Desktop: Sidebar Layout */}
      <div className="hidden lg:flex gap-2 h-full min-h-0">
        {/* Calendar and Legend Sidebar - Combined in one Card */}
        {!isCalendarCollapsed && (
          <Card className="flex-shrink-0 w-auto">
            <CardContent className="p-0 flex flex-col">
              {/* Calendar Section */}
              <div className="flex justify-between items-center px-1.5 pt-1 pb-0">
                <h3 className="font-semibold text-[10px]">Date</h3>
                <button
                  onClick={() => setIsCalendarCollapsed(true)}
                  className="p-0.5 hover:bg-slate-100 rounded transition-colors"
                  title="Collapse calendar"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-start justify-center -mb-2">
                <Calendar
                  mode="single"
                  selected={localDate}
                  onSelect={handleDateChange}
                  className="rounded-md scale-[0.72]"
                />
              </div>

              {/* Legend Section */}
              <div className="border-t border-slate-200 mt-1 pt-1.5 px-1.5 pb-1.5">
                <h3 className="font-semibold mb-1 text-[10px]">Legend</h3>
                <div className="space-y-0.5">
                  {LEGEND_ITEMS.map(item => (
                    <div key={item.key} className="flex items-center gap-1 text-[9px]">
                      <div className={`w-3 h-2.5 rounded flex-shrink-0 ${item.color}`} />
                      <span className="leading-tight">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collapsed Calendar Button */}
        {isCalendarCollapsed && (
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsCalendarCollapsed(false)}
              className="h-full px-3 py-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors flex flex-col items-center gap-2 min-h-[200px]"
              title="Show calendar and legend"
            >
              <ChevronDown className="w-5 h-5" />
              <div className="text-xs font-medium whitespace-nowrap transform -rotate-0 writing-mode-vertical">
                <div className="flex flex-col gap-1 text-center">
                  <span>Calendar</span>
                  <span className="text-[10px] text-slate-600">
                    {localDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Schedule Grid - Desktop */}
        <div className="flex-1 overflow-hidden min-w-0 h-full min-h-0">
          <Card className="h-full w-full flex flex-col">
            <CardContent className="p-0 flex-1 overflow-hidden w-full flex flex-col min-h-0">
              <div className="flex-1 overflow-auto border border-slate-200 rounded scrollbar-thin min-h-0">
                <div className="inline-block min-w-full align-top">
                  <table className="border-collapse text-xs w-full">
                    <thead className="sticky top-0 bg-white z-20">
                      <tr>
                        <th className="border border-slate-300 bg-slate-100 p-1 text-left font-semibold sticky left-0 z-30 min-w-[64px] text-[9px]">
                          TIMES
                        </th>
                        {timeSlots.map((time, index) => {
                          const [hours, minutes] = time.split(':').map(Number);
                          const isOnTheHour = minutes === 0;
                          
                          // Skip rendering this cell if it's a :30 slot (it will be covered by the previous cell's colspan)
                          if (minutes === 30) {
                            return null;
                          }
                          
                          return (
                            <th 
                              key={time} 
                              colSpan={2}
                              className={`border border-slate-300 p-0.5 font-bold min-w-[64px] text-[9px] text-black text-center transition-colors ${
                                hoveredColumn === time || hoveredColumn === timeSlots[index + 1] ? 'bg-blue-200' : 'bg-slate-100'
                              }`}
                              onMouseEnter={() => setHoveredColumn(time)}
                              onMouseLeave={() => setHoveredColumn(null)}
                            >
                              <div className="whitespace-nowrap">{formatTime(time)}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Aircraft Section */}
                      <tr>
                        <td 
                          colSpan={timeSlots.length + 1} 
                          className="border border-slate-300 bg-blue-50 p-1 font-semibold text-blue-900 text-[9px]"
                        >
                          AIRCRAFT
                        </td>
                      </tr>
                      {aircraft.map((plane) => (
                        <tr key={plane.id}>
                          <td 
                            className={`border border-slate-300 p-1 sticky left-0 z-10 font-medium text-[8px] whitespace-nowrap min-w-[64px] transition-colors ${
                              hoveredRow === `aircraft-${plane.id}` ? 'bg-blue-100' : 'bg-slate-50'
                            }`}
                            onMouseEnter={() => setHoveredRow(`aircraft-${plane.id}`)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            {plane.registration}
                          </td>
                          {timeSlots.map((time) => {
                            const reservation = getReservation(time, plane.registration, 'aircraft');
                            
                            // If this slot is part of a reservation but not the first slot, skip it
                            if (reservation && !isFirstSlotOfReservation(time, reservation)) {
                              return null;
                            }
                            
                          const isUserReservation = reservation && reservation.student === currentUser;
                          const category = reservation?.flightCategory || 'standard';
                          const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-purple-500';
                          const isColumnHovered = hoveredColumn === time;
                            const isRowHovered = hoveredRow === `aircraft-${plane.id}`;
                            const spanSlots = reservation ? getFlightSpanSlots(reservation) : 1;
                            
                            return (
                              <td 
                                key={time}
                                colSpan={spanSlots}
                                className={`border border-slate-300 p-0.5 text-center text-[7px] transition-colors min-w-[32px] ${
                                  reservation ? colorClass : ((isColumnHovered || isRowHovered) ? 'bg-blue-100' : 'bg-white')
                                } ${(isColumnHovered || isRowHovered) && reservation ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                                onMouseEnter={() => {
                                  setHoveredColumn(time);
                                  setHoveredRow(`aircraft-${plane.id}`);
                                }}
                                onMouseLeave={() => {
                                  setHoveredColumn(null);
                                  setHoveredRow(null);
                                }}
                              >
                                {reservation && (
                                  <div className={`font-medium leading-none overflow-hidden ${
                                    category === 'in-office' || category === 'ground-instruction' || category === 'new-student' 
                                      ? 'text-slate-800' 
                                      : 'text-white'
                                  }`}>
                                    {isUserReservation ? 'You' : category === 'unavailable' ? 'N/A' : 'Res'}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      
                      {/* Time Row for Instructors */}
                      <tr>
                        <td className="border border-slate-300 bg-slate-100 p-1 text-left font-semibold sticky left-0 z-10 min-w-[64px] text-[9px]">
                          TIMES
                        </td>
                        {timeSlots.map((time, index) => {
                          const [hours, minutes] = time.split(':').map(Number);
                          
                          // Skip rendering this cell if it's a :30 slot
                          if (minutes === 30) {
                            return null;
                          }
                          
                          return (
                            <td 
                              key={time} 
                              colSpan={2}
                              className="border border-slate-300 p-0.5 font-bold text-center min-w-[64px] text-[9px] text-black bg-slate-100"
                            >
                              <div className="whitespace-nowrap">{formatTime(time)}</div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Instructors Section */}
                      <tr>
                        <td 
                          colSpan={timeSlots.length + 1} 
                          className="border border-slate-300 bg-purple-50 p-1 font-semibold text-purple-900 text-[9px]"
                        >
                          INSTRUCTORS
                        </td>
                      </tr>
                      {instructors.map((instructor) => (
                        <tr key={instructor.id}>
                          <td 
                            className={`border border-slate-300 p-1 sticky left-0 z-10 font-medium text-[8px] whitespace-nowrap min-w-[64px] transition-colors ${
                              hoveredRow === `instructor-${instructor.id}` ? 'bg-blue-100' : 'bg-slate-50'
                            }`}
                            onMouseEnter={() => setHoveredRow(`instructor-${instructor.id}`)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            {abbreviateName(instructor.name)}
                          </td>
                          {timeSlots.map((time) => {
                            const reservation = getReservation(time, instructor.name, 'instructor');
                            
                            // If this slot is part of a reservation but not the first slot, skip it
                            if (reservation && !isFirstSlotOfReservation(time, reservation)) {
                              return null;
                            }
                            
                            const isUserReservation = reservation && reservation.student === currentUser;
                            const category = reservation?.flightCategory || 'standard';
                            const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-blue-500';
                            const isColumnHovered = hoveredColumn === time;
                            const isRowHovered = hoveredRow === `instructor-${instructor.id}`;
                            const spanSlots = reservation ? getFlightSpanSlots(reservation) : 1;
                            
                            return (
                              <td 
                                key={time}
                                colSpan={spanSlots}
                                className={`border border-slate-300 p-0.5 text-center text-[7px] transition-colors min-w-[32px] ${
                                  reservation ? colorClass : ((isColumnHovered || isRowHovered) ? 'bg-blue-100' : 'bg-white')
                                } ${(isColumnHovered || isRowHovered) && reservation ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                                onMouseEnter={() => {
                                  setHoveredColumn(time);
                                  setHoveredRow(`instructor-${instructor.id}`);
                                }}
                                onMouseLeave={() => {
                                  setHoveredColumn(null);
                                  setHoveredRow(null);
                                }}
                              >
                                {reservation && (
                                  <div className={`font-medium leading-none overflow-hidden ${
                                    category === 'in-office' || category === 'ground-instruction' || category === 'new-student' 
                                      ? 'text-slate-800' 
                                      : 'text-white'
                                  }`}>
                                    {isUserReservation ? 'You' : category === 'unavailable' ? 'N/A' : 'Res'}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile: Schedule Grid */}
      <div className="lg:hidden flex-1 overflow-hidden min-w-0 h-full min-h-0">
        <Card className="h-full w-full flex flex-col">
          <CardContent className="p-0 flex-1 overflow-hidden w-full flex flex-col min-h-0">
            <div className="flex-1 overflow-auto border border-slate-200 rounded min-h-0">
              {/* Wrapper to enable horizontal scroll */}
              <div className="overflow-x-auto overflow-y-auto h-full">
                <table className="border-collapse w-auto min-w-full">
                  <thead className="sticky top-0 bg-white z-20">
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-1.5 sm:p-1 text-left font-semibold sticky left-0 z-30 min-w-[56px] sm:min-w-[64px] text-[10px] sm:text-[9px]">
                        TIMES
                      </th>
                      {timeSlots.map((time, index) => {
                        const [hours, minutes] = time.split(':').map(Number);
                        
                        // Skip rendering this cell if it's a :30 slot
                        if (minutes === 30) {
                          return null;
                        }
                        
                        return (
                          <th 
                            key={time} 
                            colSpan={2}
                            className="border border-slate-300 p-1 sm:p-0.5 font-bold min-w-[72px] sm:min-w-[64px] text-[10px] sm:text-[9px] text-black bg-slate-100"
                          >
                            <div className="whitespace-nowrap">{formatTime(time)}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Aircraft Section */}
                    <tr>
                      <td 
                        colSpan={timeSlots.length + 1} 
                        className="border border-slate-300 bg-blue-50 p-1.5 sm:p-1 font-semibold text-blue-900 text-[10px] sm:text-[9px]"
                      >
                        AIRCRAFT
                      </td>
                    </tr>
                    {aircraft.map((plane) => (
                      <tr key={plane.id}>
                        <td 
                          className="border border-slate-300 p-1.5 sm:p-1 sticky left-0 z-10 bg-slate-50 font-medium text-[9px] sm:text-[8px] whitespace-nowrap min-w-[56px] sm:min-w-[64px]"
                        >
                          {plane.registration}
                        </td>
                        {timeSlots.map((time) => {
                          const reservation = getReservation(time, plane.registration, 'aircraft');
                          const isUserReservation = reservation && reservation.student === currentUser;
                          const category = reservation?.flightCategory || 'standard';
                          const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-blue-500';
                          
                          return (
                            <td 
                              key={time} 
                              className={`border border-slate-300 p-1 sm:p-0.5 text-center text-[8px] sm:text-[7px] min-w-[36px] sm:min-w-[32px] ${
                                reservation ? colorClass : 'bg-white'
                              }`}
                            >
                              {reservation && (
                                <div className={`font-medium leading-none overflow-hidden ${
                                  category === 'in-office' || category === 'ground-instruction' || category === 'new-student' 
                                    ? 'text-slate-800' 
                                    : 'text-white'
                                }`}>
                                  {isUserReservation ? 'You' : category === 'unavailable' ? 'N/A' : 'Res'}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Spacer Row */}
                    <tr>
                      <td 
                        colSpan={timeSlots.length + 1} 
                        className="border border-slate-300 bg-slate-100 p-1 font-medium text-slate-600 text-[9px] sm:text-[8px]"
                      >
                        Time →
                      </td>
                    </tr>

                    {/* Instructors Section */}
                    <tr>
                      <td 
                        colSpan={timeSlots.length + 1} 
                        className="border border-slate-300 bg-purple-50 p-1.5 sm:p-1 font-semibold text-purple-900 text-[10px] sm:text-[9px]"
                      >
                        INSTRUCTORS
                      </td>
                    </tr>
                    {instructors.map((instructor) => (
                      <tr key={instructor.id}>
                        <td 
                          className="border border-slate-300 p-1.5 sm:p-1 sticky left-0 z-10 bg-slate-50 font-medium text-[9px] sm:text-[8px] whitespace-nowrap min-w-[56px] sm:min-w-[64px]"
                        >
                          {abbreviateName(instructor.name)}
                        </td>
                        {timeSlots.map((time) => {
                          const reservation = getReservation(time, instructor.name, 'instructor');
                          const isUserReservation = reservation && reservation.student === currentUser;
                          const category = reservation?.flightCategory || 'standard';
                          const colorClass = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-blue-500';
                          
                          return (
                            <td 
                              key={time} 
                              className={`border border-slate-300 p-1 sm:p-0.5 text-center text-[8px] sm:text-[7px] min-w-[36px] sm:min-w-[32px] ${
                                reservation ? colorClass : 'bg-white'
                              }`}
                            >
                              {reservation && (
                                <div className={`font-medium leading-none overflow-hidden ${
                                  category === 'in-office' || category === 'ground-instruction' || category === 'new-student' 
                                    ? 'text-slate-800' 
                                    : 'text-white'
                                }`}>
                                  {isUserReservation ? 'You' : category === 'unavailable' ? 'N/A' : 'Res'}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}