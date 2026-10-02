import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Phone, Mail, Plane, Award } from 'lucide-react';
import type { Instructor } from '../App';

interface InstructorProfileDialogProps {
  instructor: Instructor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstructorProfileDialog({ instructor, open, onOpenChange }: InstructorProfileDialogProps) {
  if (!instructor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" aria-describedby="instructor-profile-description">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{instructor.name}</DialogTitle>
              <DialogDescription id="instructor-profile-description" className="sr-only">
                Instructor profile
              </DialogDescription>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {instructor.certifications.map(cert => (
                  <Badge key={cert} className="bg-[#CFB991] text-black hover:bg-[#B8A57E] text-xs px-2 py-0.5">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right text-sm text-slate-600 space-y-1 shrink-0">
              {instructor.phone && (
                <div className="flex items-center gap-1.5 justify-end">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{instructor.phone}</span>
                </div>
              )}
              {instructor.email && (
                <div className="flex items-center gap-1.5 justify-end">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{instructor.email}</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5 pt-1">
          {/* Training Capabilities */}
          {instructor.trainingCapabilities && instructor.trainingCapabilities.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Training Capabilities</h3>
              </div>
              <ul className="space-y-1">
                {instructor.trainingCapabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-sm text-slate-700">
                    <span className="text-[#CFB991] mt-1 shrink-0 text-xs">▸</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Authorized Aircraft */}
          {instructor.authorizedAircraft && instructor.authorizedAircraft.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Plane className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Authorized Aircraft</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {instructor.authorizedAircraft.map((reg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 font-mono"
                  >
                    {reg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
