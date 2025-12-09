import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FilterDialog } from './FilterDialog';
import { FilteredAvailabilityView } from './FilteredAvailabilityView';
import { useState } from 'react';
import { Table, CalendarDays, Filter } from 'lucide-react';
import type { Aircraft, Instructor, Flight } from '../App';

interface BookingInterfaceProps {
  selectedDate: Date;
  aircraft: Aircraft[];
  instructors: Instructor[];
  flights: Flight[];
  onOpenMasterSchedule: () => void;
  onOpenScheduleDialog: () => void;
  onTimeSlotClick?: (startTime: string, endTime: string, aircraftId?: string, instructorIds?: string[]) => void;
  onFilterChange?: (aircraftIds: string[], instructorIds: string[]) => void;
}

export function BookingInterface({
  selectedDate,
  aircraft,
  instructors,
  flights,
  onOpenMasterSchedule,
  onOpenScheduleDialog,
  onTimeSlotClick,
  onFilterChange
}: BookingInterfaceProps) {
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filteredAircraftIds, setFilteredAircraftIds] = useState<string[]>([]);
  const [filteredInstructorIds, setFilteredInstructorIds] = useState<string[]>([]);

  const handleFilterApply = (aircraftIds: string[], instructorIds: string[]) => {
    setFilteredAircraftIds(aircraftIds);
    setFilteredInstructorIds(instructorIds);
    if (onFilterChange) {
      onFilterChange(aircraftIds, instructorIds);
    }
    setIsFilterDialogOpen(false);
  };

  const handleFilterClear = () => {
    setFilteredAircraftIds([]);
    setFilteredInstructorIds([]);
    if (onFilterChange) {
      onFilterChange([], []);
    }
  };

  const hasActiveFilters = filteredAircraftIds.length > 0 || filteredInstructorIds.length > 0;

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedDateShort = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Generate time slots from 6:00 AM to 10:00 PM
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

  // Convert time string to minutes
  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if a resource is available at a given time
  const isResourceAvailable = (slotTime: string, resourceId: string, resourceType: 'aircraft' | 'instructor') => {
    const slotMinutes = timeToMinutes(slotTime);
    const dayFlights = flights.filter(f => f.date.toDateString() === selectedDate.toDateString() && f.status !== 'cancelled');
    
    const resourceFlights = dayFlights.filter(flight => {
      if (resourceType === 'aircraft') {
        return flight.aircraft === resourceId;
      } else {
        const instructor = instructors.find(i => i.id === resourceId);
        return flight.instructor === instructor?.name;
      }
    });

    return !resourceFlights.some(flight => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  // Get available time slots for filtered resources
  const getAvailableTimeSlots = () => {
    if (!hasActiveFilters) return [];

    const timeSlots = generateTimeSlots();
    const availableSlots: { startTime: string; endTime: string; duration: number }[] = [];

    for (const slot of timeSlots) {
      // Check if all filtered aircraft are available
      const allAircraftAvailable = filteredAircraftIds.length === 0 || filteredAircraftIds.every(aircraftId =>
        isResourceAvailable(slot, aircraftId, 'aircraft')
      );

      // Check if all filtered instructors are available
      const allInstructorsAvailable = filteredInstructorIds.length === 0 || filteredInstructorIds.every(instructorId =>
        isResourceAvailable(slot, instructorId, 'instructor')
      );

      if (allAircraftAvailable && allInstructorsAvailable) {
        // Calculate end time (2 hours default)
        const slotMinutes = timeToMinutes(slot);
        const endMinutes = slotMinutes + 120; // 2 hours
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

        availableSlots.push({
          startTime: slot,
          endTime: endTime,
          duration: 2
        });
      }
    }

    return availableSlots;
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {!hasActiveFilters ? (
        <div className="space-y-3 sm:space-y-4">
          <Button 
            onClick={() => setIsFilterDialogOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-black border-2 border-black h-12 sm:h-14 text-base sm:text-lg font-bold shadow-md"
            size="lg"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden xs:inline">Find an Opening on {formattedDateShort}</span>
            <span className="xs:hidden">Find Opening {formattedDateShort}</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-black font-bold">or</span>
            </div>
          </div>

          <div className="grid gap-2 sm:gap-3">
            <Button 
              onClick={onOpenMasterSchedule}
              variant="outline"
              className="w-full h-10 sm:h-12 border border-black font-bold text-sm sm:text-base"
              size="lg"
            >
              <Table className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              View Master Schedule
            </Button>
          </div>
        </div>
      ) : (
        <FilteredAvailabilityView
          selectedDate={selectedDate}
          filteredAircraftIds={filteredAircraftIds}
          filteredInstructorIds={filteredInstructorIds}
          aircraft={aircraft}
          instructors={instructors}
          flights={flights}
          onTimeSlotSelect={(startTime, endTime, aircraftId, instructorIds) => {
            if (onTimeSlotClick) {
              onTimeSlotClick(startTime, endTime, aircraftId, instructorIds);
            }
          }}
          onClose={handleFilterClear}
        />
      )}

      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        aircraft={aircraft}
        instructors={instructors}
        flights={flights}
        selectedDate={selectedDate}
        currentUser="You"
        onApplyFilter={handleFilterApply}
      />
    </div>
  );
}