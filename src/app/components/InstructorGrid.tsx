import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Phone, Mail } from 'lucide-react';
import { useState } from 'react';
import { InstructorProfileDialog } from './InstructorProfileDialog';
import type { Instructor } from '../App';

interface InstructorGridProps {
  instructors: Instructor[];
}

export function InstructorGrid({ instructors }: InstructorGridProps) {
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const handleInstructorClick = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-1.5">Certified Flight Instructors</h2>
        <p className="text-sm sm:text-base text-slate-600">Click on an instructor to view their full profile</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {instructors.map(instructor => (
          <Card 
            key={instructor.id} 
            className="cursor-pointer hover:shadow-md transition-all shadow-sm"
            onClick={() => handleInstructorClick(instructor)}
          >
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                  <AvatarFallback className="text-xs sm:text-sm bg-primary/10 text-primary">{getInitials(instructor.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg font-semibold">{instructor.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1.5 sm:mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {instructor.certifications.map(cert => (
                      <Badge key={cert} variant="secondary" className="text-xs">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {instructor.phone && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-700">{instructor.phone}</span>
                  </div>
                )}

                {instructor.email && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-700 truncate">{instructor.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <InstructorProfileDialog
        instructor={selectedInstructor}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}