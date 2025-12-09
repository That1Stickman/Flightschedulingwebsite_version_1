import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plane } from 'lucide-react';
import type { Aircraft } from '../App';

interface AircraftGridProps {
  aircraft: Aircraft[];
}

export function AircraftGrid({ aircraft }: AircraftGridProps) {
  // Group aircraft by type/model
  const groupedAircraft = aircraft.reduce((acc, plane) => {
    // Separate PPI aircraft
    const isPPI = plane.registration.includes('-PPI');
    const key = isPPI ? 'PPI Aircraft' : plane.name;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(plane);
    return acc;
  }, {} as Record<string, Aircraft[]>);

  // Sort the groups - PPI at the end
  const sortedGroups = Object.entries(groupedAircraft).sort(([a], [b]) => {
    if (a === 'PPI Aircraft') return 1;
    if (b === 'PPI Aircraft') return -1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl mb-2">Aircraft Fleet</h2>
        <p className="text-sm sm:text-base text-slate-600">Available aircraft for training</p>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {sortedGroups.map(([groupName, planes]) => (
          <Card key={groupName}>
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 py-3 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                {groupName}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-2">
                {planes.map(plane => (
                  <div
                    key={plane.id}
                    className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-2 sm:py-3 px-3 sm:px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors gap-1 xs:gap-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Plane className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                      <div className="flex flex-col xs:flex-row xs:items-center gap-0 xs:gap-2">
                        <span className="font-medium text-slate-900 text-sm sm:text-base">
                          {plane.registration}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500">
                          {plane.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}