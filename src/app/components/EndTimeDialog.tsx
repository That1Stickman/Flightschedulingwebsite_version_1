import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface EndTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTime?: string;
  onConfirm: (endTime: string) => void;
  resourceName?: string;
  resourceType?: 'aircraft' | 'instructor';
}

export function EndTimeDialog({
  open,
  onOpenChange,
  startTime,
  onConfirm,
  resourceName,
  resourceType
}: EndTimeDialogProps) {
  const [endTime, setEndTime] = useState('');

  const generateEndTimes = () => {
    if (!startTime) return [];
    const [sh, sm] = startTime.split(':').map(Number);
    const startTotal = sh * 60 + sm;
    const times = [];
    for (let m = startTotal + 30; m <= 22 * 60; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      times.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
    return times;
  };

  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${dh}:${String(m).padStart(2, '0')} ${period}`;
  };

  const handleConfirm = () => {
    if (endTime) {
      onConfirm(endTime);
      setEndTime('');
    }
  };

  const endTimes = generateEndTimes();

  if (!startTime || !resourceName || !resourceType) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs" aria-describedby="end-time-dialog-description">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Select End Time</DialogTitle>
          <DialogDescription id="end-time-dialog-description" className="text-xs text-slate-600 space-y-0.5">
            <span className="font-medium">{resourceType === 'aircraft' ? 'Aircraft' : 'Instructor'}:</span> {resourceName}
            <br />
            <span className="font-medium">Start:</span> {fmt(startTime)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-1">
          <Label className="text-xs font-medium text-slate-600">End Time</Label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full h-9 px-3 border border-slate-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CFB991] focus:border-transparent"
          >
            <option value="">Select end time…</option>
            {endTimes.map(t => (
              <option key={t} value={t}>{fmt(t)}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setEndTime(''); onOpenChange(false); }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!endTime}
            className="bg-[#CFB991] hover:bg-[#B8A57E] text-black disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
