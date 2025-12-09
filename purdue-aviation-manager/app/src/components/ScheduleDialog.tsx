import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CalendarIcon } from 'lucide-react';
import type { Flight, Aircraft, Instructor } from '../App';

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchedule: (flight: Flight) => void;
  aircraft: Aircraft[];
  instructors: Instructor[];
  existingFlights: Flight[];
  preselectedDate?: Date;
  preselectedTime?: string;
  preselectedEndTime?: string;
  filteredAircraftIds?: string[];
  filteredInstructorIds?: string[];
  setFilteredAircraftIds?: (ids: string[]) => void;
  setFilteredInstructorIds?: (ids: string[]) => void;
}

export function ScheduleDialog({ 
  open, 
  onOpenChange, 
  onSchedule, 
  aircraft, 
  instructors,
  existingFlights,
  preselectedDate,
  preselectedTime,
  preselectedEndTime,
  filteredAircraftIds = [],
  filteredInstructorIds = [],
  setFilteredAircraftIds,
  setFilteredInstructorIds
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedAircraft, setSelectedAircraft] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [duration, setDuration] = useState<string>('2');
  const [flightType, setFlightType] = useState<'dual' | 'solo' | 'checkride'>('dual');
  const [flightCategory, setFlightCategory] = useState<string>('standard');

  // Helper to calculate duration from start and end times
  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return (durationMinutes / 60).toString();
  };

  // Convert time string to minutes
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Format time for display (e.g., "09:00" -> "9:00 AM")
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Calculate end time from start time and duration
  const calculateEndTime = (start: string, durationHours: string) => {
    const durationNum = parseFloat(durationHours);
    const [hours, minutes] = start.split(':').map(Number);
    const endHours = hours + Math.floor(durationNum);
    const endMinutes = minutes + (durationNum % 1) * 60;
    return `${String(endHours + Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;
  };

  // Check if instructor is available during the entire time block
  const isInstructorAvailableForTimeBlock = (instructorName: string, start: string, end: string, selectedDate: Date) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    const dayFlights = existingFlights.filter(f => 
      f.date.toDateString() === selectedDate.toDateString() && 
      f.status !== 'cancelled'
    );

    const instructorFlights = dayFlights.filter(flight => flight.instructor === instructorName);

    // Check if any instructor flight overlaps with our time block
    return !instructorFlights.some(flight => {
      const flightStartMinutes = timeToMinutes(flight.startTime);
      const flightEndMinutes = timeToMinutes(flight.endTime);
      
      // Check for overlap
      return (startMinutes < flightEndMinutes && endMinutes > flightStartMinutes);
    });
  };

  // Check if aircraft is available during the entire time block
  const isAircraftAvailableForTimeBlock = (aircraftReg: string, start: string, end: string, selectedDate: Date) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    const dayFlights = existingFlights.filter(f => 
      f.date.toDateString() === selectedDate.toDateString() && 
      f.status !== 'cancelled'
    );

    const aircraftFlights = dayFlights.filter(flight => flight.aircraft === aircraftReg);

    // Check if any aircraft flight overlaps with our time block
    return !aircraftFlights.some(flight => {
      const flightStartMinutes = timeToMinutes(flight.startTime);
      const flightEndMinutes = timeToMinutes(flight.endTime);
      
      // Check for overlap
      return (startMinutes < flightEndMinutes && endMinutes > flightStartMinutes);
    });
  };

  // Update date and time when preselected values change
  useEffect(() => {
    if (preselectedDate) {
      setDate(preselectedDate);
    }
  }, [preselectedDate]);

  useEffect(() => {
    if (preselectedTime) {
      setStartTime(preselectedTime);
    }
  }, [preselectedTime]);

  useEffect(() => {
    if (preselectedTime && preselectedEndTime) {
      const calculatedDuration = calculateDuration(preselectedTime, preselectedEndTime);
      setDuration(calculatedDuration);
    }
  }, [preselectedTime, preselectedEndTime]);

  // Auto-select aircraft if only one is in the filtered list
  useEffect(() => {
    if (filteredAircraftIds.length === 1 && !selectedAircraft) {
      setSelectedAircraft(filteredAircraftIds[0]);
    }
  }, [filteredAircraftIds, selectedAircraft]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedAircraft('');
      setSelectedInstructor('');
      setStartTime('09:00');
      setDuration('2');
      setFlightType('dual');
      setFlightCategory('standard');
    }
  }, [open]);

  const handleSchedule = () => {
    if (!date || !selectedAircraft || !selectedInstructor) {
      alert('Please fill in all required fields');
      return;
    }

    const durationHours = parseFloat(duration);
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + Math.floor(durationHours);
    const endMinutes = minutes + (durationHours % 1) * 60;
    
    const endTime = `${String(endHours + Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    const newFlight: Flight = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      aircraft: selectedAircraft,
      instructor: selectedInstructor,
      student: 'You',
      type: flightType,
      status: 'scheduled',
      flightCategory: flightCategory as any,
    };

    onSchedule(newFlight);
  };

  // Filter aircraft and instructors based on the active filter
  const displayedAircraft = filteredAircraftIds.length > 0
    ? aircraft.filter(a => a.available && filteredAircraftIds.includes(a.registration))
    : aircraft.filter(a => a.available);

  const displayedInstructors = filteredInstructorIds.length > 0
    ? instructors.filter(i => i.available && filteredInstructorIds.includes(i.id))
    : instructors.filter(i => i.available);

  // Calculate current end time based on start time and duration
  const currentEndTime = calculateEndTime(startTime, duration);

  // If we have filtered aircraft (coming from filtered view), trust that selection
  // Otherwise, further filter aircraft to only show those available during the selected time block
  const availableAircraftForTimeBlock = (filteredAircraftIds.length > 0 && preselectedTime) 
    ? displayedAircraft // Trust the filtered selection from the grid
    : date 
      ? displayedAircraft.filter(a => isAircraftAvailableForTimeBlock(a.registration, startTime, currentEndTime, date))
      : displayedAircraft;

  // If we have filtered instructors (coming from filtered view), trust that selection
  // Otherwise, further filter instructors to only show those available during the selected time block
  const availableInstructorsForTimeBlock = (filteredInstructorIds.length > 0 && preselectedTime)
    ? displayedInstructors.filter(i => {
        // Still check aircraft authorization if one is selected
        if (selectedAircraft && i.authorizedAircraft) {
          return i.authorizedAircraft.includes(selectedAircraft);
        }
        return true;
      })
    : date 
      ? displayedInstructors.filter(i => {
          // Check time availability
          const isAvailable = isInstructorAvailableForTimeBlock(i.name, startTime, currentEndTime, date);
          
          // If an aircraft is selected, check authorization
          if (selectedAircraft && i.authorizedAircraft) {
            const isAuthorized = i.authorizedAircraft.includes(selectedAircraft);
            return isAvailable && isAuthorized;
          }
          
          return isAvailable;
        })
      : displayedInstructors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="schedule-dialog-description">
        <DialogHeader>
          <DialogTitle>Schedule a Flight</DialogTitle>
          <DialogDescription id="schedule-dialog-description">
            Book your flight training session with an instructor and aircraft
          </DialogDescription>
        </DialogHeader>

        {(filteredAircraftIds.length > 0 || filteredInstructorIds.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 -mt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Selected Time Block:</span>
                <span className="text-sm font-semibold text-blue-700">
                  {formatTime(startTime)} - {formatTime(currentEndTime)}
                </span>
              </div>
              {filteredAircraftIds.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Aircraft:</span>
                  <span className="text-sm font-semibold text-blue-700">
                    {filteredAircraftIds.join(', ')}
                  </span>
                </div>
              )}
              {filteredInstructorIds.length > 0 && (
                <div className="text-xs text-blue-700">
                  Available Instructors: {filteredInstructorIds.map(id => {
                    const instructor = instructors.find(i => i.id === id);
                    return instructor?.name;
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Flight Category</Label>
            <Select value={flightCategory} onValueChange={setFlightCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h6-operations">H6 Operations</SelectItem>
                <SelectItem value="new-student">New Students</SelectItem>
                <SelectItem value="photo-flight">Photo Flight</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="unavailable">Temporarily Unavailable</SelectItem>
                <SelectItem value="ground-instruction">Ground Instruction</SelectItem>
                <SelectItem value="aircraft-checkout">Aircraft Checkout</SelectItem>
                <SelectItem value="down-time">Down Time</SelectItem>
                <SelectItem value="in-office">In Office</SelectItem>
                <SelectItem value="checkride-category">Checkride</SelectItem>
                <SelectItem value="groundschool">Groundschool</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="bfr">BFR</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="spin-training">Spin Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? date.toLocaleDateString() : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => i + 6).flatMap(hour => [
                    <SelectItem key={`${hour}:00`} value={`${String(hour).padStart(2, '0')}:00`}>
                      {hour}:00 {hour < 12 ? 'AM' : 'PM'}
                    </SelectItem>,
                    <SelectItem key={`${hour}:30`} value={`${String(hour).padStart(2, '0')}:30`}>
                      {hour}:30 {hour < 12 ? 'AM' : 'PM'}
                    </SelectItem>
                  ])}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration (hours)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5 hours</SelectItem>
                  <SelectItem value="1">1.0 hours</SelectItem>
                  <SelectItem value="1.5">1.5 hours</SelectItem>
                  <SelectItem value="2">2.0 hours</SelectItem>
                  <SelectItem value="2.5">2.5 hours</SelectItem>
                  <SelectItem value="3">3.0 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instructor</Label>
            <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
              <SelectTrigger>
                <SelectValue placeholder="Select an instructor" />
              </SelectTrigger>
              <SelectContent>
                {availableInstructorsForTimeBlock.map(i => (
                  <SelectItem key={i.id} value={i.name}>
                    {i.name} - {i.certifications.join(', ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableInstructorsForTimeBlock.length === 0 && (
              <p className="text-sm text-amber-600">No instructors currently available</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} className="bg-amber-500 hover:bg-amber-600">
            Schedule Flight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}