import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Clock, X } from 'lucide-react';
import type { Aircraft, Instructor, Flight } from '../App';

interface FilteredAvailabilityViewProps {
  selectedDate: Date;
  filteredAircraftIds: string[];
  filteredInstructorIds: string[];
  aircraft: Aircraft[];
  instructors: Instructor[];
  flights: Flight[];
  onTimeSlotSelect: (startTime: string, endTime: string, aircraftId: string, instructorIds: string[]) => void;
  onClose: () => void;
}

export function FilteredAvailabilityView({
  selectedDate,
  filteredAircraftIds,
  filteredInstructorIds,
  aircraft,
  instructors,
  flights,
  onTimeSlotSelect,
  onClose
}: FilteredAvailabilityViewProps) {
  const [dragStart, setDragStart] = useState<{ aircraft: string; time: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ aircraft: string; time: string } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ aircraft: string; startTime: string; endTime: string } | null>(null);

  // Generate time slots from 6:00 AM to 10:00 PM (30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Convert time string to minutes
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to time string
  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Check if aircraft is available at a given time
  const isAircraftAvailable = (aircraftId: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime);
    const dayFlights = flights.filter(f => 
      f.date.toDateString() === selectedDate.toDateString() && 
      f.status !== 'cancelled'
    );
    
    const aircraftFlights = dayFlights.filter(flight => flight.aircraft === aircraftId);

    return !aircraftFlights.some(flight => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Get available instructors for a time slot and aircraft
  const getAvailableInstructors = (aircraftId: string, slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime);
    const dayFlights = flights.filter(f => 
      f.date.toDateString() === selectedDate.toDateString() && 
      f.status !== 'cancelled'
    );

    return filteredInstructorIds.filter(instructorId => {
      const instructor = instructors.find(i => i.id === instructorId);
      if (!instructor) return false;

      // Check if instructor is authorized for this aircraft
      if (!instructor.authorizedAircraft?.includes(aircraftId)) return false;

      // Check if instructor is available at this time
      const instructorFlights = dayFlights.filter(flight => flight.instructor === instructor.name);
      
      const isAvailable = !instructorFlights.some(flight => {
        const startMinutes = timeToMinutes(flight.startTime);
        const endMinutes = timeToMinutes(flight.endTime);
        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
      });

      return isAvailable;
    });
  };

  // Handle mouse down to start dragging
  const handleMouseDown = (aircraftId: string, timeSlot: string) => {
    if (!isAircraftAvailable(aircraftId, timeSlot)) return;
    const availableInstructors = getAvailableInstructors(aircraftId, timeSlot);
    if (availableInstructors.length === 0) return;

    setDragStart({ aircraft: aircraftId, time: timeSlot });
    setDragEnd({ aircraft: aircraftId, time: timeSlot });
    setSelectedSlot(null);
  };

  // Handle mouse enter while dragging
  const handleMouseEnter = (aircraftId: string, timeSlot: string) => {
    if (!dragStart || dragStart.aircraft !== aircraftId) return;
    setDragEnd({ aircraft: aircraftId, time: timeSlot });
  };

  // Handle mouse up to finish dragging
  const handleMouseUp = () => {
    if (!dragStart || !dragEnd) return;

    const startMinutes = timeToMinutes(dragStart.time);
    const endMinutes = timeToMinutes(dragEnd.time);
    
    const actualStart = Math.min(startMinutes, endMinutes);
    const actualEnd = Math.max(startMinutes, endMinutes) + 30; // Add 30 minutes to include the end slot

    const startTime = minutesToTime(actualStart);
    const endTime = minutesToTime(actualEnd);

    setSelectedSlot({
      aircraft: dragStart.aircraft,
      startTime,
      endTime
    });

    setDragStart(null);
    setDragEnd(null);
  };

  // Check if a cell is in the drag selection
  const isInDragSelection = (aircraftId: string, timeSlot: string) => {
    if (!dragStart || !dragEnd || dragStart.aircraft !== aircraftId) return false;

    const slotMinutes = timeToMinutes(timeSlot);
    const startMinutes = timeToMinutes(dragStart.time);
    const endMinutes = timeToMinutes(dragEnd.time);

    const minMinutes = Math.min(startMinutes, endMinutes);
    const maxMinutes = Math.max(startMinutes, endMinutes);

    return slotMinutes >= minMinutes && slotMinutes <= maxMinutes;
  };

  // Handle confirming the selection
  const handleConfirmSelection = () => {
    if (!selectedSlot) return;

    // Get available instructors for the entire time range
    const availableInstructors = getAvailableInstructorsForRange(
      selectedSlot.aircraft,
      selectedSlot.startTime,
      selectedSlot.endTime
    );

    onTimeSlotSelect(
      selectedSlot.startTime,
      selectedSlot.endTime,
      selectedSlot.aircraft,
      availableInstructors
    );
  };

  // Get instructors available for entire time range
  const getAvailableInstructorsForRange = (aircraftId: string, startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    return filteredInstructorIds.filter(instructorId => {
      const instructor = instructors.find(i => i.id === instructorId);
      if (!instructor || !instructor.authorizedAircraft?.includes(aircraftId)) return false;

      // Check every 30-minute slot in the range
      for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const timeSlot = minutesToTime(minutes);
        const availableAtSlot = getAvailableInstructors(aircraftId, timeSlot).includes(instructorId);
        if (!availableAtSlot) return false;
      }

      return true;
    });
  };

  const filteredAircraft = aircraft.filter(a => filteredAircraftIds.includes(a.registration));

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Filtered Availability - {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Click and drag on a time slot to select your flight duration
        </p>
      </CardHeader>
      <CardContent>
        {selectedSlot && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-900">
                  Selected: {selectedSlot.aircraft} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Available Instructors: {getAvailableInstructorsForRange(selectedSlot.aircraft, selectedSlot.startTime, selectedSlot.endTime)
                    .map(id => instructors.find(i => i.id === id)?.name)
                    .join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleConfirmSelection} className="bg-green-600 hover:bg-green-700">
                  Book Flight
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedSlot(null)}>
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-auto max-h-[600px] border rounded-lg">
          <table className="w-full border-collapse" onMouseLeave={() => { setDragStart(null); setDragEnd(null); }}>
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr>
                <th className="border p-2 text-left font-medium text-sm w-24 bg-slate-100">Time</th>
                {filteredAircraft.map(ac => (
                  <th key={ac.id} className="border p-2 text-center font-medium text-sm min-w-[120px] bg-slate-100">
                    <div>{ac.registration}</div>
                    <div className="text-xs text-slate-600 font-normal">{ac.type}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(timeSlot => (
                <tr key={timeSlot}>
                  <td className="border p-2 text-sm font-medium bg-slate-50 sticky left-0 z-[5]">
                    {formatTime(timeSlot)}
                  </td>
                  {filteredAircraft.map(ac => {
                    const aircraftAvailable = isAircraftAvailable(ac.registration, timeSlot);
                    const availableInstructors = getAvailableInstructors(ac.registration, timeSlot);
                    const hasAvailableInstructors = availableInstructors.length > 0;
                    const isSelectable = aircraftAvailable && hasAvailableInstructors;
                    const isInSelection = isInDragSelection(ac.registration, timeSlot);

                    return (
                      <td
                        key={ac.id}
                        className={`border p-1 text-center text-xs cursor-pointer transition-colors select-none ${
                          isInSelection
                            ? 'bg-blue-200 border-blue-400'
                            : isSelectable
                            ? 'bg-green-50 hover:bg-green-100'
                            : 'bg-red-50'
                        }`}
                        onMouseDown={() => handleMouseDown(ac.registration, timeSlot)}
                        onMouseEnter={() => handleMouseEnter(ac.registration, timeSlot)}
                        onMouseUp={handleMouseUp}
                      >
                        {isSelectable ? (
                          <div className="space-y-0.5">
                            {availableInstructors.map(instructorId => {
                              const instructor = instructors.find(i => i.id === instructorId);
                              return (
                                <div key={instructorId} className="text-green-700 font-medium">
                                  {instructor?.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              );
                            })}
                          </div>
                        ) : !aircraftAvailable ? (
                          <div className="text-red-600">Aircraft Busy</div>
                        ) : (
                          <div className="text-amber-600">No Instructors</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-slate-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border border-slate-300 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
