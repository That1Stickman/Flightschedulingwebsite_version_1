import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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
  preselectedAircraft?: string;
  preselectedInstructor?: string;
  filteredAircraftIds?: string[];
  filteredInstructorIds?: string[];
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
  preselectedAircraft,
  preselectedInstructor,
  filteredAircraftIds = [],
  filteredInstructorIds = []
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedAircraft, setSelectedAircraft] = useState<string>('');
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [flightCategory, setFlightCategory] = useState<string>('standard');

  const startTime = preselectedTime || '09:00';
  const endTime = preselectedEndTime || '11:00';

  const calculateDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em - sh * 60 - sm) / 60).toFixed(1);
  };

  const duration = calculateDuration(startTime, endTime);

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${dh}:${String(m).padStart(2, '0')} ${period}`;
  };

  useEffect(() => { if (preselectedDate) setDate(preselectedDate); }, [preselectedDate]);
  useEffect(() => { if (preselectedAircraft && open) setSelectedAircraft(preselectedAircraft); }, [preselectedAircraft, open]);
  useEffect(() => { if (preselectedInstructor && open) setSelectedInstructor(preselectedInstructor); }, [preselectedInstructor, open]);
  useEffect(() => {
    if (!open) {
      setSelectedAircraft('');
      setSelectedInstructor('');
      setFlightCategory('standard');
    }
  }, [open]);

  const handleSchedule = () => {
    if (!date || !selectedAircraft || !selectedInstructor) {
      alert('Please fill in all required fields');
      return;
    }
    onSchedule({
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      aircraft: selectedAircraft,
      instructor: selectedInstructor,
      student: 'You',
      type: 'dual',
      status: 'scheduled',
      flightCategory: flightCategory as any,
    });
  };

  const isSelectingInstructor = preselectedAircraft !== undefined;
  const isSelectingAircraft = preselectedInstructor !== undefined;
  const isFromFilteredView = preselectedAircraft !== undefined &&
    preselectedTime !== undefined &&
    preselectedEndTime !== undefined &&
    filteredInstructorIds.length > 0;

  const availableInstructors = filteredInstructorIds.length > 0
    ? instructors.filter(i => filteredInstructorIds.includes(i.id))
    : instructors.filter(i => i.available);

  const availableAircraft = isFromFilteredView
    ? aircraft.filter(a => a.registration === preselectedAircraft)
    : filteredAircraftIds.length > 0
    ? aircraft.filter(a => filteredAircraftIds.includes(a.registration))
    : aircraft.filter(a => a.available);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl" aria-describedby="schedule-dialog-description">
        <DialogHeader className="pb-2">
          <DialogTitle>Schedule a Flight</DialogTitle>
          <DialogDescription id="schedule-dialog-description" className="sr-only">
            Book your flight training session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Compact info bar */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm">
            <span className="text-blue-800 font-medium">
              {formatTime(startTime)} – {formatTime(endTime)}
              <span className="ml-2 text-blue-600 font-normal">({duration} hr)</span>
            </span>
            {preselectedAircraft && (
              <span className="text-blue-700 font-semibold">{preselectedAircraft}</span>
            )}
          </div>

          {/* Date + Flight Category side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start h-9 text-sm font-normal">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    {date ? date.toLocaleDateString() : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Flight Category</Label>
              <Select value={flightCategory} onValueChange={setFlightCategory}>
                <SelectTrigger className="h-9 text-sm">
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
          </div>

          {/* Time display row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Start Time</Label>
              <div className="border rounded-md px-3 py-2 bg-slate-50 text-sm text-slate-700 h-9 flex items-center">
                {formatTime(startTime)}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">End Time</Label>
              <div className="border rounded-md px-3 py-2 bg-slate-50 text-sm text-slate-700 h-9 flex items-center">
                {formatTime(endTime)}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Duration</Label>
              <div className="border rounded-md px-3 py-2 bg-slate-50 text-sm text-slate-700 h-9 flex items-center">
                {duration} hrs
              </div>
            </div>
          </div>

          {/* Instructor / Aircraft selector */}
          {isFromFilteredView && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Available Instructors</Label>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {availableInstructors.map(i => (
                    <SelectItem key={i.id} value={i.name}>
                      {i.name} — {i.certifications.join(', ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableInstructors.length === 0 && (
                <p className="text-xs text-amber-600">No instructors currently available</p>
              )}
            </div>
          )}

          {!isFromFilteredView && isSelectingInstructor && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Available Instructors</Label>
              <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select an instructor" />
                </SelectTrigger>
                <SelectContent>
                  {availableInstructors.map(i => (
                    <SelectItem key={i.id} value={i.name}>
                      {i.name} — {i.certifications.join(', ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableInstructors.length === 0 && (
                <p className="text-xs text-amber-600">No instructors currently available</p>
              )}
            </div>
          )}

          {!isFromFilteredView && isSelectingAircraft && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Available Aircraft</Label>
              <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select an aircraft" />
                </SelectTrigger>
                <SelectContent>
                  {availableAircraft.map(a => (
                    <SelectItem key={a.id} value={a.registration}>
                      {a.registration} — {a.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableAircraft.length === 0 && (
                <p className="text-xs text-amber-600">No aircraft currently available</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSchedule} className="bg-[#CFB991] hover:bg-[#B8A57E] text-black">
            Schedule Flight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
