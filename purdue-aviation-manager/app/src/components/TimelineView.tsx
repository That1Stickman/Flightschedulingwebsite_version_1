import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Plane, User, Filter, CalendarClock, X, MousePointerClick } from 'lucide-react';
import { FilterDialog } from './FilterDialog';
import type { Flight, Aircraft, Instructor } from '../App';

interface TimelineViewProps {
  selectedDate: Date;
  flights: Flight[];
  aircraft: Aircraft[];
  instructors: Instructor[];
  onTimeSlotClick: (startTime: string, endTime?: string) => void;
  onFilterChange?: (aircraftIds: string[], instructorIds: string[]) => void;
}

type ViewMode = 'combined' | 'aircraft' | 'instructor';

interface SelectedRange {
  start: string;
  end: string;
}

export function TimelineView({ selectedDate, flights, aircraft, instructors, onTimeSlotClick, onFilterChange }: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [selectedAircraftFilter, setSelectedAircraftFilter] = useState<string[]>([]);
  const [selectedInstructorFilter, setSelectedInstructorFilter] = useState<string[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [dragCurrent, setDragCurrent] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);

  // Generate time slots from 6:00 AM to 10:00 PM (every 30 minutes for internal tracking)
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

  // Generate hour markers (major time divisions)
  const generateHourMarkers = () => {
    const hours = [];
    for (let hour = 6; hour <= 22; hour++) {
      hours.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return hours;
  };

  const timeSlots = generateTimeSlots();
  const hourMarkers = generateHourMarkers();

  // Get flights for the selected date
  const dayFlights = flights.filter(
    f => f.date.toDateString() === selectedDate.toDateString() && f.status !== 'cancelled'
  );

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if a time slot is in the past
  const isTimeSlotInPast = (slotTime: string) => {
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hours, minutes] = slotTime.split(':').map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < now;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    if (minutes === 0) {
      return `${displayHours}:00 ${period}`;
    }
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Check if a time slot is within the drag selection or confirmed selection
  const isInRange = (slotTime: string, start: string | null, end: string | null) => {
    if (!start || !end) return false;
    const slotMinutes = timeToMinutes(slotTime);
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const min = Math.min(startMinutes, endMinutes);
    const max = Math.max(startMinutes, endMinutes);
    return slotMinutes >= min && slotMinutes < max;
  };

  const isInDragRange = (slotTime: string) => {
    return isInRange(slotTime, dragStart, dragCurrent);
  };

  const isInSelectedRange = (slotTime: string) => {
    if (!selectedRange) return false;
    return isInRange(slotTime, selectedRange.start, selectedRange.end);
  };

  // Check if slot is the first in selected range (to show the message)
  const isFirstInSelectedRange = (slotTime: string) => {
    if (!selectedRange) return false;
    return slotTime === selectedRange.start;
  };

  // Handle mouse down on a time slot
  const handleMouseDown = (slotTime: string, event: React.MouseEvent) => {
    // Don't allow selecting past time slots
    if (isTimeSlotInPast(slotTime)) {
      event.preventDefault();
      return;
    }
    
    // If clicking on an already selected range, don't start dragging
    if (selectedRange && isInSelectedRange(slotTime)) {
      event.preventDefault();
      return;
    }
    
    // Clear any existing selection and start dragging
    setSelectedRange(null);
    setIsDragging(true);
    setDragStart(slotTime);
    setDragCurrent(slotTime);
  };

  // Handle mouse enter on a time slot during drag
  const handleMouseEnter = (slotTime: string) => {
    if (isDragging && dragStart) {
      setDragCurrent(slotTime);
    }
  };

  // Handle mouse up - complete the selection
  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart && dragCurrent) {
      const startMinutes = timeToMinutes(dragStart);
      const currentMinutes = timeToMinutes(dragCurrent);
      
      // Determine the actual start and end (in case user dragged upward)
      const actualStart = startMinutes <= currentMinutes ? dragStart : dragCurrent;
      const actualEndSlot = startMinutes <= currentMinutes ? dragCurrent : dragStart;
      
      // Calculate end time by adding 30 minutes to the last selected slot
      const actualEndMinutes = timeToMinutes(actualEndSlot) + 30;
      const endHours = Math.floor(actualEndMinutes / 60);
      const endMins = actualEndMinutes % 60;
      const calculatedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
      
      // Set the selected range
      setSelectedRange({
        start: actualStart,
        end: calculatedEndTime
      });
      
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
    }
  }, [isDragging, dragStart, dragCurrent]);

  // Add global mouse up listener
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Handle click on selected range to open dialog
  const handleSelectedRangeClick = () => {
    if (selectedRange) {
      onTimeSlotClick(selectedRange.start, selectedRange.end);
      setSelectedRange(null);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedRange(null);
  };

  // Check if resource is available at a given time
  const isResourceAvailable = (slotTime: string, resourceId: string, resourceType: 'aircraft' | 'instructor') => {
    const slotMinutes = timeToMinutes(slotTime);
    const resourceFlights = dayFlights.filter(flight => {
      if (resourceType === 'aircraft') {
        return flight.aircraft === resourceId;
      } else {
        return flight.instructor === resourceId;
      }
    });

    return !resourceFlights.some(flight => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Get flight at a specific time for a resource
  const getResourceFlight = (slotTime: string, resourceId: string, resourceType: 'aircraft' | 'instructor') => {
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

  // Check if a time slot is the start of a flight
  const isFlightStart = (slotTime: string, flight: Flight) => {
    return slotTime === flight.startTime;
  };

  // Calculate how many 30-minute slots a flight spans
  const getFlightDuration = (flight: Flight) => {
    const startMinutes = timeToMinutes(flight.startTime);
    const endMinutes = timeToMinutes(flight.endTime);
    return (endMinutes - startMinutes) / 30;
  };

  // Filter aircraft and instructors
  const filteredAircraft = selectedAircraftFilter.length === 0 
    ? aircraft 
    : aircraft.filter(a => selectedAircraftFilter.includes(a.registration));

  const filteredInstructors = selectedInstructorFilter.length === 0
    ? instructors
    : instructors.filter(i => selectedInstructorFilter.includes(i.id));

  const handleApplyFilter = (aircraftReg: string[], instructorIds: string[]) => {
    setSelectedAircraftFilter(aircraftReg);
    setSelectedInstructorFilter(instructorIds);
    
    // Automatically switch to the appropriate view
    if (aircraftReg.length > 0 && instructorIds.length === 0) {
      setViewMode('aircraft');
    } else if (instructorIds.length > 0 && aircraftReg.length === 0) {
      setViewMode('instructor');
    } else if (aircraftReg.length > 0 && instructorIds.length > 0) {
      // Both selected - default to aircraft view
      setViewMode('aircraft');
    }

    // Call the onFilterChange callback if provided
    if (onFilterChange) {
      onFilterChange(aircraftReg, instructorIds);
    }
  };

  const clearFilters = () => {
    setSelectedAircraftFilter([]);
    setSelectedInstructorFilter([]);
    setViewMode('combined');
  };

  const hasActiveFilters = selectedAircraftFilter.length > 0 || selectedInstructorFilter.length > 0;

  // Render combined view (original view)
  const renderCombinedView = () => {
    const getFlightsAtTime = (slotTime: string) => {
      const slotMinutes = timeToMinutes(slotTime);
      return dayFlights.filter(flight => {
        const startMinutes = timeToMinutes(flight.startTime);
        const endMinutes = timeToMinutes(flight.endTime);
        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
      });
    };

    return (
      <div className="select-none relative">
        {hourMarkers.map((hourTime, hourIndex) => {
          const halfHourTime = `${hourTime.split(':')[0]}:30`;
          const hourSlot = hourTime;
          const halfHourSlot = halfHourTime;
          
          const hourFlightsAtTime = getFlightsAtTime(hourSlot);
          const halfHourFlightsAtTime = getFlightsAtTime(halfHourSlot);
          
          const hourFlightStarts = dayFlights.filter(f => isFlightStart(hourSlot, f));
          const halfHourFlightStarts = dayFlights.filter(f => isFlightStart(halfHourSlot, f));

          const hourInDragRange = isInDragRange(hourSlot);
          const halfHourInDragRange = isInDragRange(halfHourSlot);
          
          const hourInSelectedRange = isInSelectedRange(hourSlot);
          const halfHourInSelectedRange = isInSelectedRange(halfHourSlot);
          
          const hourIsFirstInSelectedRange = isFirstInSelectedRange(hourSlot);
          const halfHourIsFirstInSelectedRange = isFirstInSelectedRange(halfHourSlot);

          return (
            <div key={hourTime} className="border-t border-slate-200">
              {/* Hour slot */}
              <div className="relative">
                {hourFlightStarts.length > 0 ? (
                  <div>
                    {hourFlightStarts.map(flight => {
                      const duration = getFlightDuration(flight);
                      const height = duration * 32; // 32px per 30-min slot
                      
                      return (
                        <div
                          key={flight.id}
                          className="border-l-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 px-4 py-2"
                          style={{ height: `${height}px`, minHeight: '64px' }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <CalendarClock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <span className="font-medium text-sm">
                                  {formatTime(flight.startTime)} - {formatTime(flight.endTime)}
                                </span>
                                <Badge 
                                  variant={
                                    flight.type === 'dual' ? 'default' : 
                                    flight.type === 'solo' ? 'secondary' : 
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {flight.type.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="space-y-0.5 text-sm">
                                <p className="flex items-center gap-2">
                                  <Plane className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                  <span className="text-slate-700">{flight.aircraft}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                  <span className="text-slate-700">{flight.instructor}</span>
                                </p>
                                <p className="text-slate-600 pl-5">
                                  {flight.student}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : !hourFlightsAtTime.length ? (
                  <div
                    onMouseDown={(e) => !isTimeSlotInPast(hourSlot) && handleMouseDown(hourSlot, e)}
                    onMouseEnter={() => !isTimeSlotInPast(hourSlot) && handleMouseEnter(hourSlot)}
                    onClick={hourInSelectedRange && !isTimeSlotInPast(hourSlot) ? handleSelectedRangeClick : undefined}
                    className={`w-full text-left px-4 py-2 transition-all flex items-center justify-between group h-8 ${
                      isTimeSlotInPast(hourSlot)
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : hourInSelectedRange
                          ? 'bg-blue-100 border-l-2 border-blue-500 cursor-pointer'
                          : hourInDragRange 
                            ? 'bg-amber-50 border-l-2 border-amber-400 cursor-pointer' 
                            : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      isTimeSlotInPast(hourSlot) ? 'text-slate-400' : 'text-slate-700'
                    }`}>
                      {formatTime(hourSlot)}
                    </span>
                    {!isTimeSlotInPast(hourSlot) && hourIsFirstInSelectedRange && (
                      <span className="text-sm text-blue-700 font-medium flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4" />
                        Click to schedule
                      </span>
                    )}
                    {!isTimeSlotInPast(hourSlot) && !hourInSelectedRange && !hourInDragRange && (
                      <span className="text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to schedule →
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Half-hour divider and slot */}
              {hourIndex < hourMarkers.length && (
                <div className="relative border-t border-slate-100">
                  {halfHourFlightStarts.length > 0 ? (
                    <div>
                      {halfHourFlightStarts.map(flight => {
                        const duration = getFlightDuration(flight);
                        const height = duration * 32;
                        
                        return (
                          <div
                            key={flight.id}
                            className="border-l-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 px-4 py-2"
                            style={{ height: `${height}px`, minHeight: '64px' }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <CalendarClock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <span className="font-medium text-sm">
                                    {formatTime(flight.startTime)} - {formatTime(flight.endTime)}
                                  </span>
                                  <Badge 
                                    variant={
                                      flight.type === 'dual' ? 'default' : 
                                      flight.type === 'solo' ? 'secondary' : 
                                      'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {flight.type.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="space-y-0.5 text-sm">
                                  <p className="flex items-center gap-2">
                                    <Plane className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                    <span className="text-slate-700">{flight.aircraft}</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                    <span className="text-slate-700">{flight.instructor}</span>
                                  </p>
                                  <p className="text-slate-600 pl-5">
                                    {flight.student}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : !halfHourFlightsAtTime.length ? (
                    <div
                      onMouseDown={(e) => !isTimeSlotInPast(halfHourSlot) && handleMouseDown(halfHourSlot, e)}
                      onMouseEnter={() => !isTimeSlotInPast(halfHourSlot) && handleMouseEnter(halfHourSlot)}
                      onClick={halfHourInSelectedRange && !isTimeSlotInPast(halfHourSlot) ? handleSelectedRangeClick : undefined}
                      className={`w-full text-left px-4 py-2 transition-all flex items-center justify-end group h-8 ${
                        isTimeSlotInPast(halfHourSlot)
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : halfHourInSelectedRange
                            ? 'bg-blue-100 border-l-2 border-blue-500 cursor-pointer'
                            : halfHourInDragRange 
                              ? 'bg-amber-50 border-l-2 border-amber-400 cursor-pointer' 
                              : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {!isTimeSlotInPast(halfHourSlot) && halfHourIsFirstInSelectedRange && (
                        <span className="text-sm text-blue-700 font-medium flex items-center gap-1">
                          <MousePointerClick className="w-4 h-4" />
                          Click to schedule
                        </span>
                      )}
                      {!isTimeSlotInPast(halfHourSlot) && !halfHourInSelectedRange && !halfHourInDragRange && (
                        <span className="text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to schedule →
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render aircraft availability view
  const renderAircraftView = () => {
    // Helper to get available instructors at a given time
    const getAvailableInstructors = (slotTime: string) => {
      return filteredInstructors.filter(instructor => 
        isResourceAvailable(slotTime, instructor.name, 'instructor')
      );
    };

    return (
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full select-none">
          <div className="w-32 flex-shrink-0 border-r border-slate-200">
            <div className="sticky top-0 bg-slate-50 z-10 p-3 border-b border-slate-200 h-16 flex items-center">
              <span className="font-medium text-slate-700">Time</span>
            </div>
            {hourMarkers.map((hourTime, index) => (
              <div key={hourTime}>
                <div className="px-3 py-2 h-8 border-t border-slate-200 flex items-center bg-slate-50/50">
                  <span className="text-sm text-slate-700 font-medium">{formatTime(hourTime)}</span>
                </div>
                {index < hourMarkers.length && (
                  <div className="px-3 py-2 h-8 border-t border-slate-100 bg-slate-50/50" />
                )}
              </div>
            ))}
          </div>
          {filteredAircraft.map(plane => (
            <div key={plane.id} className="flex-1 min-w-[240px] border-l border-slate-200">
              <div className="sticky top-0 bg-white z-10 p-3 border-b border-slate-200 h-16">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">{plane.registration}</p>
                    <p className="text-xs text-slate-500">{plane.type} • {plane.name}</p>
                  </div>
                </div>
              </div>
              {hourMarkers.map((hourTime, index) => {
                const halfHourTime = `${hourTime.split(':')[0]}:30`;
                const hourFlight = getResourceFlight(hourTime, plane.registration, 'aircraft');
                const halfHourFlight = getResourceFlight(halfHourTime, plane.registration, 'aircraft');
                const hourIsStart = hourFlight && isFlightStart(hourTime, hourFlight);
                const halfHourIsStart = halfHourFlight && isFlightStart(halfHourTime, halfHourFlight);
                
                const hourInDragRange = isInDragRange(hourTime);
                const halfHourInDragRange = isInDragRange(halfHourTime);
                const hourInSelectedRange = isInSelectedRange(hourTime);
                const halfHourInSelectedRange = isInSelectedRange(halfHourTime);
                
                const hourIsFirstInSelectedRange = isFirstInSelectedRange(hourTime);
                const halfHourIsFirstInSelectedRange = isFirstInSelectedRange(halfHourTime);

                const hourAvailableInstructors = !hourFlight ? getAvailableInstructors(hourTime) : [];
                const halfHourAvailableInstructors = !halfHourFlight ? getAvailableInstructors(halfHourTime) : [];

                return (
                  <div key={hourTime}>
                    {hourIsStart && hourFlight ? (
                      <div className="relative">
                        <div
                          className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500"
                          style={{ height: `${getFlightDuration(hourFlight) * 32}px` }}
                        >
                          <div className="text-sm space-y-1">
                            <p className="font-medium text-slate-900 flex items-start gap-1.5">
                              <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{hourFlight.instructor}</span>
                            </p>
                            <p className="text-slate-600 text-xs pl-5">{hourFlight.student}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {hourFlight.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : !hourFlight ? (
                      <>
                        <div
                          onMouseDown={(e) => handleMouseDown(hourTime, e)}
                          onMouseEnter={() => handleMouseEnter(hourTime)}
                          onClick={hourInSelectedRange ? handleSelectedRangeClick : undefined}
                          className={`w-full h-8 border-t border-slate-200 px-2 py-1 transition-colors cursor-pointer group flex items-center justify-between ${
                            hourInSelectedRange
                              ? 'bg-blue-100 border-l-2 border-blue-500'
                              : hourInDragRange
                                ? 'bg-amber-50 border-l-2 border-amber-400'
                                : hourAvailableInstructors.length > 0 
                                  ? 'bg-green-50/40 hover:bg-green-100'
                                  : 'bg-red-50/40 hover:bg-red-100'
                          }`}
                        >
                          {hourIsFirstInSelectedRange ? (
                            <span className="text-xs text-blue-700 font-medium">
                              Click to schedule
                            </span>
                          ) : !hourInSelectedRange && !hourInDragRange && hasActiveFilters ? (
                            hourAvailableInstructors.length > 0 ? (
                              <span className="text-xs text-slate-600 truncate">
                                {hourAvailableInstructors.map(i => i.name.split(' ').pop()).join(', ')}
                              </span>
                            ) : (
                              <span className="text-xs text-red-600">No instructors</span>
                            )
                          ) : null}
                          {!hourInSelectedRange && !hourInDragRange && !hasActiveFilters && (
                            <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100">
                              Click
                            </span>
                          )}
                        </div>
                        {index < hourMarkers.length && (
                          halfHourIsStart && halfHourFlight ? (
                            <div className="relative">
                              <div
                                className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500"
                                style={{ height: `${getFlightDuration(halfHourFlight) * 32}px` }}
                              >
                                <div className="text-sm space-y-1">
                                  <p className="font-medium text-slate-900 flex items-start gap-1.5">
                                    <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{halfHourFlight.instructor}</span>
                                  </p>
                                  <p className="text-slate-600 text-xs pl-5">{halfHourFlight.student}</p>
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {halfHourFlight.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              onMouseDown={(e) => handleMouseDown(halfHourTime, e)}
                              onMouseEnter={() => handleMouseEnter(halfHourTime)}
                              onClick={halfHourInSelectedRange ? handleSelectedRangeClick : undefined}
                              className={`w-full h-8 border-t border-slate-100 px-2 py-1 transition-colors cursor-pointer group flex items-center justify-between ${
                                halfHourInSelectedRange
                                  ? 'bg-blue-100 border-l-2 border-blue-500'
                                  : halfHourInDragRange
                                    ? 'bg-amber-50 border-l-2 border-amber-400'
                                    : halfHourAvailableInstructors.length > 0
                                      ? 'bg-green-50/40 hover:bg-green-100'
                                      : 'bg-red-50/40 hover:bg-red-100'
                              }`}
                            >
                              {halfHourIsFirstInSelectedRange ? (
                                <span className="text-xs text-blue-700 font-medium">
                                  Click to schedule
                                </span>
                              ) : !halfHourInSelectedRange && !halfHourInDragRange && hasActiveFilters ? (
                                halfHourAvailableInstructors.length > 0 ? (
                                  <span className="text-xs text-slate-600 truncate">
                                    {halfHourAvailableInstructors.map(i => i.name.split(' ').pop()).join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-xs text-red-600">No instructors</span>
                                )
                              ) : null}
                              {!halfHourInSelectedRange && !halfHourInDragRange && !hasActiveFilters && (
                                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100">
                                  Click
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      <div className="h-8 border-t border-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render instructor availability view
  const renderInstructorView = () => {
    return (
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full select-none">
          <div className="w-32 flex-shrink-0 border-r border-slate-200">
            <div className="sticky top-0 bg-slate-50 z-10 p-3 border-b border-slate-200 h-16 flex items-center">
              <span className="font-medium text-slate-700">Time</span>
            </div>
            {hourMarkers.map((hourTime, index) => (
              <div key={hourTime}>
                <div className="px-3 py-2 h-8 border-t border-slate-200 flex items-center bg-slate-50/50">
                  <span className="text-sm text-slate-700 font-medium">{formatTime(hourTime)}</span>
                </div>
                {index < hourMarkers.length && (
                  <div className="px-3 py-2 h-8 border-t border-slate-100 bg-slate-50/50" />
                )}
              </div>
            ))}
          </div>
          {filteredInstructors.map(instructor => (
            <div key={instructor.id} className="flex-1 min-w-[240px] border-l border-slate-200">
              <div className="sticky top-0 bg-white z-10 p-3 border-b border-slate-200 h-16">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-900">{instructor.name}</p>
                    <p className="text-xs text-slate-500">{instructor.certifications.join(', ')}</p>
                  </div>
                </div>
              </div>
              {hourMarkers.map((hourTime, index) => {
                const halfHourTime = `${hourTime.split(':')[0]}:30`;
                const hourFlight = getResourceFlight(hourTime, instructor.name, 'instructor');
                const halfHourFlight = getResourceFlight(halfHourTime, instructor.name, 'instructor');
                const hourIsStart = hourFlight && isFlightStart(hourTime, hourFlight);
                const halfHourIsStart = halfHourFlight && isFlightStart(halfHourTime, halfHourFlight);
                
                const hourInDragRange = isInDragRange(hourTime);
                const halfHourInDragRange = isInDragRange(halfHourTime);
                const hourInSelectedRange = isInSelectedRange(hourTime);
                const halfHourInSelectedRange = isInSelectedRange(halfHourTime);
                
                const hourIsFirstInSelectedRange = isFirstInSelectedRange(hourTime);
                const halfHourIsFirstInSelectedRange = isFirstInSelectedRange(halfHourTime);

                return (
                  <div key={hourTime}>
                    {hourIsStart && hourFlight ? (
                      <div className="relative">
                        <div
                          className="px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500"
                          style={{ height: `${getFlightDuration(hourFlight) * 32}px` }}
                        >
                          <div className="text-sm space-y-0.5">
                            <p className="font-medium text-slate-900 flex items-center gap-1">
                              <Plane className="w-3.5 h-3.5" />
                              {hourFlight.aircraft}
                            </p>
                            <p className="text-slate-600 text-xs">{hourFlight.student}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {hourFlight.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : !hourFlight ? (
                      <>
                        <div
                          onMouseDown={(e) => handleMouseDown(hourTime, e)}
                          onMouseEnter={() => handleMouseEnter(hourTime)}
                          onClick={hourInSelectedRange ? handleSelectedRangeClick : undefined}
                          className={`w-full h-8 border-t border-slate-200 px-3 py-2 transition-colors cursor-pointer group flex items-center justify-center ${
                            hourInSelectedRange
                              ? 'bg-blue-100 border-l-2 border-blue-500'
                              : hourInDragRange
                                ? 'bg-amber-50 border-l-2 border-amber-400'
                                : 'bg-green-50/40 hover:bg-green-100'
                          }`}
                        >
                          {hourIsFirstInSelectedRange && (
                            <span className="text-xs text-blue-700 font-medium">
                              Click to schedule
                            </span>
                          )}
                          {!hourInSelectedRange && !hourInDragRange && (
                            <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100">
                              Click
                            </span>
                          )}
                        </div>
                        {index < hourMarkers.length && (
                          halfHourIsStart && halfHourFlight ? (
                            <div className="relative">
                              <div
                                className="px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500"
                                style={{ height: `${getFlightDuration(halfHourFlight) * 32}px` }}
                              >
                                <div className="text-sm space-y-0.5">
                                  <p className="font-medium text-slate-900 flex items-center gap-1">
                                    <Plane className="w-3.5 h-3.5" />
                                    {halfHourFlight.aircraft}
                                  </p>
                                  <p className="text-slate-600 text-xs">{halfHourFlight.student}</p>
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {halfHourFlight.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div
                              onMouseDown={(e) => handleMouseDown(halfHourTime, e)}
                              onMouseEnter={() => handleMouseEnter(halfHourTime)}
                              onClick={halfHourInSelectedRange ? handleSelectedRangeClick : undefined}
                              className={`w-full h-8 border-t border-slate-100 px-3 py-2 transition-colors cursor-pointer group flex items-center justify-center ${
                                halfHourInSelectedRange
                                  ? 'bg-blue-100 border-l-2 border-blue-500'
                                  : halfHourInDragRange
                                    ? 'bg-amber-50 border-l-2 border-amber-400'
                                    : 'bg-green-50/40 hover:bg-green-100'
                              }`}
                            >
                              {halfHourIsFirstInSelectedRange && (
                                <span className="text-xs text-blue-700 font-medium">
                                  Click to schedule
                                </span>
                              )}
                              {!halfHourInSelectedRange && !halfHourInDragRange && (
                                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100">
                                  Click
                                </span>
                              )}
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      <div className="h-8 border-t border-slate-200" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-6 h-6" />
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
            <CardDescription className="mt-1">
              {selectedRange 
                ? `Selected: ${formatTime(selectedRange.start)} - ${formatTime(selectedRange.end)} • Click the highlighted area to schedule`
                : 'Click and drag across time slots to select a time range'}
            </CardDescription>
          </div>
          {selectedRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Selection
            </Button>
          )}
        </div>
        
        {/* View Mode Selector */}
        <div className="flex flex-col gap-4 pt-4 border-t mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label className="flex items-center gap-2 text-slate-700">
                <Filter className="w-4 h-4" />
                Filter by:
              </Label>
            </div>
            
            <div className="flex gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsFilterDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Advanced Filter
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <span className="text-slate-600">Active filters:</span>
              {selectedAircraftFilter.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Plane className="w-3 h-3" />
                  {selectedAircraftFilter.length} Aircraft
                </Badge>
              )}
              {selectedInstructorFilter.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <User className="w-3 h-3" />
                  {selectedInstructorFilter.length} Instructors
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-[700px] pr-2">
          {viewMode === 'combined' && renderCombinedView()}
          {viewMode === 'aircraft' && renderAircraftView()}
          {viewMode === 'instructor' && renderInstructorView()}
        </ScrollArea>
      </CardContent>

      {/* Filter Dialog */}
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        aircraft={aircraft}
        instructors={instructors}
        flights={flights}
        selectedDate={selectedDate}
        currentUser="You"
        onApplyFilter={handleApplyFilter}
      />
    </Card>
  );
}