import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { ArrowRight, MoveRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import type { Aircraft, Instructor, Flight } from '../App';

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aircraft: Aircraft[];
  instructors: Instructor[];
  flights: Flight[];
  selectedDate: Date;
  currentUser: string;
  onApplyFilter: (selectedAircraft: string[], selectedInstructors: string[]) => void;
}

type FilterMode = 'aircraft-first' | 'instructor-first' | null;
type Step = 'select-mode' | 'select-primary' | 'select-secondary';

export function FilterDialog({ 
  open, 
  onOpenChange, 
  aircraft, 
  instructors, 
  flights,
  selectedDate,
  currentUser,
  onApplyFilter
}: FilterDialogProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>(null);
  const [step, setStep] = useState<Step>('select-mode');
  const [selectedAircraft, setSelectedAircraft] = useState<string[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);

  const handleReset = () => {
    setFilterMode(null);
    setStep('select-mode');
    setSelectedAircraft([]);
    setSelectedInstructors([]);
  };

  const handleModeSelect = (mode: FilterMode) => {
    setFilterMode(mode);
    setStep('select-primary');
  };

  const handlePrimaryNext = () => {
    if (filterMode === 'aircraft-first' && selectedAircraft.length > 0) {
      // Filter instructors who can fly the selected aircraft
      const availableInstructors = instructors.filter(instructor => 
        instructor.authorizedAircraft?.some(reg => selectedAircraft.includes(reg))
      );
      setStep('select-secondary');
    } else if (filterMode === 'instructor-first' && selectedInstructors.length > 0) {
      // Filter aircraft that selected instructors can fly
      const availableAircraft = aircraft.filter(ac => 
        selectedInstructors.some(instructorId => {
          const instructor = instructors.find(i => i.id === instructorId);
          return instructor?.authorizedAircraft?.includes(ac.registration);
        })
      );
      setStep('select-secondary');
    }
  };

  const handleApply = () => {
    onApplyFilter(selectedAircraft, selectedInstructors);
    onOpenChange(false);
    handleReset();
  };

  const handleCancel = () => {
    onOpenChange(false);
    handleReset();
  };

  const toggleAircraftSelection = (registration: string) => {
    if (selectedAircraft.includes(registration)) {
      setSelectedAircraft(selectedAircraft.filter(r => r !== registration));
    } else {
      setSelectedAircraft([...selectedAircraft, registration]);
    }
  };

  const toggleInstructorSelection = (id: string) => {
    if (selectedInstructors.includes(id)) {
      setSelectedInstructors(selectedInstructors.filter(i => i !== id));
    } else {
      setSelectedInstructors([...selectedInstructors, id]);
    }
  };

  // Get available items based on mode and step
  const getAvailableAircraft = () => {
    if (step === 'select-secondary' && filterMode === 'instructor-first') {
      // Filter aircraft that selected instructors can fly
      return aircraft.filter(ac => 
        selectedInstructors.some(instructorId => {
          const instructor = instructors.find(i => i.id === instructorId);
          return instructor?.authorizedAircraft?.includes(ac.registration);
        })
      );
    }
    return aircraft;
  };

  const getAvailableInstructors = () => {
    if (step === 'select-secondary' && filterMode === 'aircraft-first') {
      // Filter instructors who can fly the selected aircraft
      return instructors.filter(instructor => 
        instructor.authorizedAircraft?.some(reg => selectedAircraft.includes(reg))
      );
    }
    return instructors;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto" aria-describedby="filter-dialog-description">
        <DialogHeader>
          <DialogTitle>Find an Opening</DialogTitle>
          <DialogDescription id="filter-dialog-description">
            {step === 'select-mode' && 'Choose whether to filter by aircraft or instructors first'}
            {step === 'select-primary' && filterMode === 'aircraft-first' && 'Select aircraft you want to view'}
            {step === 'select-primary' && filterMode === 'instructor-first' && 'Select instructors you want to view'}
            {step === 'select-secondary' && filterMode === 'aircraft-first' && 'Select instructors for the chosen aircraft'}
            {step === 'select-secondary' && filterMode === 'instructor-first' && 'Select aircraft for the chosen instructors'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Select Filter Mode */}
          {step === 'select-mode' && (
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => handleModeSelect('aircraft-first')}
              >
                <CardHeader>
                  <CardTitle className="text-center">Filter by Aircraft First</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-slate-600">
                  Select aircraft, then see available instructors
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => handleModeSelect('instructor-first')}
              >
                <CardHeader>
                  <CardTitle className="text-center">Filter by Instructors First</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-slate-600">
                  Select instructors, then see available aircraft
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2 & 3: Selection Tables */}
          {(step === 'select-primary' || step === 'select-secondary') && (
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
              {/* Available Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {step === 'select-primary' && filterMode === 'aircraft-first' && 'Available Aircraft'}
                    {step === 'select-primary' && filterMode === 'instructor-first' && 'Available Instructors'}
                    {step === 'select-secondary' && filterMode === 'aircraft-first' && 'Available Instructors'}
                    {step === 'select-secondary' && filterMode === 'instructor-first' && 'Available Aircraft'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto border-t">
                    {/* Aircraft Selection (Primary or Secondary) */}
                    {((step === 'select-primary' && filterMode === 'aircraft-first') || 
                      (step === 'select-secondary' && filterMode === 'instructor-first')) && (
                      <table className="w-full">
                        <tbody>
                          {getAvailableAircraft().map(ac => (
                            <tr 
                              key={ac.id}
                              className={`cursor-pointer hover:bg-slate-100 border-b transition-colors ${
                                selectedAircraft.includes(ac.registration) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleAircraftSelection(ac.registration)}
                            >
                              <td className="px-4 py-2 text-sm">{ac.registration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Instructor Selection (Primary or Secondary) */}
                    {((step === 'select-primary' && filterMode === 'instructor-first') || 
                      (step === 'select-secondary' && filterMode === 'aircraft-first')) && (
                      <table className="w-full">
                        <tbody>
                          {getAvailableInstructors().map(instructor => (
                            <tr 
                              key={instructor.id}
                              className={`cursor-pointer hover:bg-slate-100 border-b transition-colors ${
                                selectedInstructors.includes(instructor.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleInstructorSelection(instructor.id)}
                            >
                              <td className="px-4 py-2 text-sm">{instructor.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Arrow Indicator */}
              <div className="flex items-center justify-center">
                <MoveRight className="w-6 h-6 text-slate-400" />
              </div>

              {/* Selected Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {step === 'select-primary' && filterMode === 'aircraft-first' && 'Selected Aircraft'}
                    {step === 'select-primary' && filterMode === 'instructor-first' && 'Selected Instructors'}
                    {step === 'select-secondary' && filterMode === 'aircraft-first' && 'Selected Instructors'}
                    {step === 'select-secondary' && filterMode === 'instructor-first' && 'Selected Aircraft'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-80 overflow-y-auto border-t">
                    {/* Selected Aircraft Display */}
                    {((step === 'select-primary' && filterMode === 'aircraft-first') || 
                      (step === 'select-secondary' && filterMode === 'instructor-first')) && (
                      <table className="w-full">
                        <tbody>
                          {selectedAircraft.length === 0 ? (
                            <tr>
                              <td className="px-4 py-8 text-center text-sm text-slate-400">
                                No aircraft selected
                              </td>
                            </tr>
                          ) : (
                            selectedAircraft.map(registration => {
                              const ac = aircraft.find(a => a.registration === registration);
                              return (
                                <tr 
                                  key={registration}
                                  className="cursor-pointer hover:bg-slate-100 border-b transition-colors"
                                  onClick={() => toggleAircraftSelection(registration)}
                                >
                                  <td className="px-4 py-2 text-sm">{ac?.registration}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    )}

                    {/* Selected Instructors Display */}
                    {((step === 'select-primary' && filterMode === 'instructor-first') || 
                      (step === 'select-secondary' && filterMode === 'aircraft-first')) && (
                      <table className="w-full">
                        <tbody>
                          {selectedInstructors.length === 0 ? (
                            <tr>
                              <td className="px-4 py-8 text-center text-sm text-slate-400">
                                No instructors selected
                              </td>
                            </tr>
                          ) : (
                            selectedInstructors.map(id => {
                              const instructor = instructors.find(i => i.id === id);
                              return (
                                <tr 
                                  key={id}
                                  className="cursor-pointer hover:bg-slate-100 border-b transition-colors"
                                  onClick={() => toggleInstructorSelection(id)}
                                >
                                  <td className="px-4 py-2 text-sm">{instructor?.name}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'select-mode' && (
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          )}
          
          {step === 'select-primary' && (
            <>
              <Button variant="outline" onClick={handleReset}>Back</Button>
              <Button 
                onClick={handlePrimaryNext}
                disabled={
                  (filterMode === 'aircraft-first' && selectedAircraft.length === 0) ||
                  (filterMode === 'instructor-first' && selectedInstructors.length === 0)
                }
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === 'select-secondary' && (
            <>
              <Button variant="outline" onClick={() => setStep('select-primary')}>Back</Button>
              <Button onClick={handleApply}>
                Apply Filter
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}