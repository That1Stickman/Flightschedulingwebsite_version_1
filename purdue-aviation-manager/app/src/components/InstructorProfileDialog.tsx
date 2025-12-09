import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Phone, Mail, Plane } from 'lucide-react';
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
      <DialogContent className="max-w-2xl max-h-[90vh]" aria-describedby="instructor-profile-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">{instructor.name}</DialogTitle>
          <DialogDescription id="instructor-profile-description">
            Instructor certifications, contact information, and training capabilities
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Certifications */}
            <div>
              <h3 className="font-semibold mb-3">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {instructor.certifications.map(cert => (
                  <Badge key={cert} variant="secondary" className="text-sm px-3 py-1">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              {instructor.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500" />
                  <span>{instructor.phone}</span>
                </div>
              )}
              {instructor.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <span>{instructor.email}</span>
                </div>
              )}
            </div>

            {/* Training Capabilities */}
            {instructor.trainingCapabilities && instructor.trainingCapabilities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Training Capabilities</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {instructor.trainingCapabilities.map((capability, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-sm text-slate-700">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authorized Aircraft */}
            {instructor.authorizedAircraft && instructor.authorizedAircraft.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Authorized Aircraft
                </h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {instructor.authorizedAircraft.map((aircraft, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {aircraft}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}