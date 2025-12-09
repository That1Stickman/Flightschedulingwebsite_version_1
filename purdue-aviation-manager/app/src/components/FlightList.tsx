import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Clock } from 'lucide-react';
import type { Flight } from '../App';

interface FlightListProps {
  flights: Flight[];
  onCancelFlight: (id: string, reason: string, comments: string) => void;
  onUpdateFlight: (flight: Flight) => void;
  currentUser?: string;
}

export function FlightList({ flights, onCancelFlight, onUpdateFlight, currentUser = 'You' }: FlightListProps) {
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [cancelingFlight, setCancelingFlight] = useState<Flight | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComments, setCancelComments] = useState('');
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [previousExperience, setPreviousExperience] = useState(0);
  const [editedHobbsTimes, setEditedHobbsTimes] = useState<Record<string, number>>({});

  const upcomingFlights = flights
    .filter(f => f.date >= new Date(new Date().setHours(0, 0, 0, 0)) && f.status === 'scheduled')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastFlights = flights
    .filter(f => f.date < new Date(new Date().setHours(0, 0, 0, 0)) || f.status !== 'scheduled')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalHours = pastFlights
    .filter(f => f.status === 'completed')
    .reduce((sum, f) => sum + (f.hobbsTime || 0), 0) + previousExperience;

  const handleCancelClick = (flight: Flight) => {
    setCancelingFlight(flight);
    setCancelReason('');
    setCancelComments('');
  };

  const handleCancelSubmit = () => {
    if (!cancelReason) return;
    setShowConfirmCancel(true);
  };

  const handleConfirmCancel = () => {
    if (cancelingFlight) {
      onCancelFlight(cancelingFlight.id, cancelReason, cancelComments);
      setCancelingFlight(null);
      setCancelReason('');
      setCancelComments('');
      setShowConfirmCancel(false);
    }
  };

  const handleEditClick = (flight: Flight) => {
    setEditingFlight({ ...flight });
  };

  const handleEditSave = () => {
    if (editingFlight) {
      onUpdateFlight(editingFlight);
      setEditingFlight(null);
    }
  };

  const handleHobbsChange = (flightId: string, value: string) => {
    const hobbsTime = parseFloat(value) || 0;
    setEditedHobbsTimes(prev => ({ ...prev, [flightId]: hobbsTime }));
    
    // Update the flight with hobbs time
    const flight = flights.find(f => f.id === flightId);
    if (flight) {
      onUpdateFlight({ ...flight, hobbsTime });
    }
  };

  const cancelReasons = [
    'Change of Plans',
    'Checkride',
    'Instructor Sick',
    'Instructor Unavailable',
    'Maintenance',
    'Student No-Show',
    'Student Sick',
    'Weather'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 sm:gap-6">
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Upcoming Flights</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your scheduled flight training sessions</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {upcomingFlights.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Aircraft</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingFlights.map(flight => (
                        <TableRow key={flight.id}>
                          <TableCell>
                            {flight.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell>{flight.startTime} - {flight.endTime}</TableCell>
                          <TableCell>{flight.aircraft}</TableCell>
                          <TableCell>{flight.instructor}</TableCell>
                          <TableCell>
                            <Badge variant={
                              flight.type === 'dual' ? 'default' : 
                              flight.type === 'solo' ? 'secondary' : 
                              'destructive'
                            }>
                              {flight.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(flight)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCancelClick(flight)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {upcomingFlights.map(flight => (
                    <div key={flight.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {flight.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-slate-600">{flight.startTime} - {flight.endTime}</div>
                        </div>
                        <Badge variant={
                          flight.type === 'dual' ? 'default' : 
                          flight.type === 'solo' ? 'secondary' : 
                          'destructive'
                        } className="text-xs">
                          {flight.type}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs mb-2">
                        <div><span className="text-slate-500">Aircraft:</span> {flight.aircraft}</div>
                        <div><span className="text-slate-500">Instructor:</span> {flight.instructor}</div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleEditClick(flight)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => handleCancelClick(flight)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 sm:py-12 text-slate-500 text-sm sm:text-base">
                <p>No upcoming flights scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Flight History</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Past and cancelled flights</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {pastFlights.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Aircraft</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Hobbs</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastFlights.map(flight => (
                        <TableRow 
                          key={flight.id}
                          className={flight.status === 'cancelled' ? 'opacity-50' : ''}
                        >
                          <TableCell className={flight.status === 'cancelled' ? 'line-through' : ''}>
                            {flight.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </TableCell>
                          <TableCell className={flight.status === 'cancelled' ? 'line-through' : ''}>
                            {flight.startTime} - {flight.endTime}
                          </TableCell>
                          <TableCell className={flight.status === 'cancelled' ? 'line-through' : ''}>
                            {flight.aircraft}
                          </TableCell>
                          <TableCell className={flight.status === 'cancelled' ? 'line-through' : ''}>
                            {flight.instructor}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              flight.type === 'dual' ? 'default' : 
                              flight.type === 'solo' ? 'secondary' : 
                              'destructive'
                            }>
                              {flight.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {flight.status === 'completed' ? (
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="0.0"
                                value={editedHobbsTimes[flight.id] ?? flight.hobbsTime ?? ''}
                                onChange={(e) => handleHobbsChange(flight.id, e.target.value)}
                                className="w-20"
                              />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={flight.status === 'completed' ? 'default' : 'secondary'}>
                              {flight.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3">
                  {pastFlights.map(flight => (
                    <div key={flight.id} className={`border border-slate-200 rounded-lg p-3 ${flight.status === 'cancelled' ? 'opacity-50 bg-slate-100' : 'bg-slate-50'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${flight.status === 'cancelled' ? 'line-through' : ''}`}>
                            {flight.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className={`text-xs text-slate-600 ${flight.status === 'cancelled' ? 'line-through' : ''}`}>
                            {flight.startTime} - {flight.endTime}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge variant={
                            flight.type === 'dual' ? 'default' : 
                            flight.type === 'solo' ? 'secondary' : 
                            'destructive'
                          } className="text-xs">
                            {flight.type}
                          </Badge>
                          <Badge variant={flight.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {flight.status}
                          </Badge>
                        </div>
                      </div>
                      <div className={`space-y-1 text-xs ${flight.status === 'cancelled' ? 'line-through' : ''}`}>
                        <div><span className="text-slate-500">Aircraft:</span> {flight.aircraft}</div>
                        <div><span className="text-slate-500">Instructor:</span> {flight.instructor}</div>
                      </div>
                      {flight.status === 'completed' && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <Label className="text-xs">Hobbs Time</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={editedHobbsTimes[flight.id] ?? flight.hobbsTime ?? ''}
                            onChange={(e) => handleHobbsChange(flight.id, e.target.value)}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 sm:py-12 text-slate-500 text-sm sm:text-base">
                <p>No flight history</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Total Hours Card */}
      <div>
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{totalHours.toFixed(1)}</div>
                <p className="text-sm text-slate-600 mt-1">Flight Hours</p>
              </div>
              
              <div className="border-t pt-4">
                <Label htmlFor="prevExp" className="text-sm">Add Previous Experience</Label>
                <Input
                  id="prevExp"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={previousExperience || ''}
                  onChange={(e) => setPreviousExperience(parseFloat(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingFlight} onOpenChange={(open) => !open && setEditingFlight(null)}>
        <DialogContent aria-describedby="edit-flight-description">
          <DialogHeader>
            <DialogTitle>Edit Flight</DialogTitle>
            <DialogDescription id="edit-flight-description">
              Modify the details of your scheduled flight
            </DialogDescription>
          </DialogHeader>
          {editingFlight && (
            <div className="space-y-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={editingFlight.startTime}
                  onChange={(e) => setEditingFlight({ ...editingFlight, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={editingFlight.endTime}
                  onChange={(e) => setEditingFlight({ ...editingFlight, endTime: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFlight(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelingFlight} onOpenChange={(open) => !open && setCancelingFlight(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Flight</DialogTitle>
            <DialogDescription>Please provide a reason for cancelling this flight</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Cancelling</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancelReasons.map(reason => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Comments / Explanation</Label>
              <Textarea
                value={cancelComments}
                onChange={(e) => setCancelComments(e.target.value)}
                placeholder="Optional additional details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelingFlight(null)}>Back</Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelSubmit}
              disabled={!cancelReason}
            >
              Cancel Flight
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you would like to cancel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your flight reservation and remove it from the schedule for all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirmCancel(false)}>No</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>Yes, Cancel Flight</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}