import { useState, useEffect } from 'react';
import { Calendar } from './components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { ScheduleDialog } from './components/ScheduleDialog';
import { FlightList } from './components/FlightList';
import { AircraftGrid } from './components/AircraftGrid';
import { InstructorGrid } from './components/InstructorGrid';
import { BookingInterface } from './components/BookingInterface';
import { MasterSchedule } from './components/MasterSchedule';
import { EndTimeDialog } from './components/EndTimeDialog';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Plane, Calendar as CalendarIcon, Users, BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import logo from 'figma:asset/6ef1e3d2e65cbd6e5803269fdc27cc1e9b913d87.png';

export interface Flight {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  aircraft: string;
  instructor: string;
  student: string;
  type: 'dual' | 'solo' | 'checkride' | 'spin' | 'photo' | 'meeting' | 'maintenance' | 'ground';
  status: 'scheduled' | 'completed' | 'cancelled';
  hobbsTime?: number;
  cancelReason?: string;
  cancelComments?: string;
  flightCategory?: 'standard' | 'unavailable' | 'spin-training' | 'photo-flight' | 'new-student' | 'meeting' | 'maintenance' | 'in-office' | 'h6-operations' | 'groundschool' | 'ground-instruction' | 'aircraft-checkout' | 'down-time' | 'checkride-category' | 'bfr';
}

export interface Aircraft {
  id: string;
  name: string;
  type: string;
  registration: string;
  available: boolean;
  hobbsTime: number;
}

export interface Instructor {
  id: string;
  name: string;
  certifications: string[];
  available: boolean;
  phone?: string;
  email?: string;
  trainingCapabilities?: string[];
  authorizedAircraft?: string[];
}

// Mock data
const mockAircraft: Aircraft[] = [
  { id: '1', registration: 'N94286', type: 'Cessna 152', name: 'Cessna 152', status: 'available' },
  { id: '2', registration: 'N51204', type: 'Cessna 172P', name: 'Skyhawk', status: 'available' },
  { id: '3', registration: 'N63366', type: 'Cessna 172P', name: 'Skyhawk', status: 'available' },
  { id: '4', registration: 'N5331D', type: 'Cessna 172N', name: 'Cessna 172N', status: 'available' },
  { id: '5', registration: 'N5724J', type: 'Cessna 172N', name: 'Cessna 172N', status: 'available' },
  { id: '6', registration: 'N6665G', type: 'Cessna 172N', name: 'Cessna 172N', status: 'available' },
  { id: '7', registration: 'N73719', type: 'Cessna 172N', name: 'Cessna 172N', status: 'available' },
  { id: '8', registration: 'N35063', type: 'Cessna 172SP', name: 'Cessna 172SP', status: 'available' },
  { id: '9', registration: 'N651PA', type: 'Cessna 172S', name: 'Cessna 172S', status: 'available' },
  { id: '10', registration: 'N652PA', type: 'Cessna 172S', name: 'Cessna 172S', status: 'available' },
  { id: '11', registration: 'N653PA', type: 'Cessna 172S', name: 'Cessna 172S', status: 'available' },
  { id: '12', registration: 'N654PA', type: 'Cessna 172S', name: 'Cessna 172S', status: 'available' },
  { id: '13', registration: 'N665CS', type: 'Cessna 172S', name: 'Cessna 172S', status: 'available' },
  { id: '14', registration: 'N422LS', type: 'Cessna 172S', name: 'Cessna 172S', status: 'available' },
  { id: '15', registration: 'N2884L', type: 'Piper Warrior II', name: 'Warrior II', status: 'available' },
  { id: '16', registration: 'N560PU', type: 'Piper Warrior III', name: 'Warrior III', status: 'available' },
  { id: '17', registration: 'N273ND', type: 'Piper Warrior III', name: 'Warrior III', status: 'available' },
  { id: '18', registration: 'N6605F', type: 'Piper Warrior I', name: 'Warrior I', status: 'available' },
  { id: '19', registration: 'N767PA', type: 'Piper Seminole', name: 'Seminole', status: 'available' },
  { id: '20', registration: 'N3033T-PPI', type: 'Piper Warrior II', name: 'Warrior II', status: 'available' },
  { id: '21', registration: 'N4347G-PPI', type: 'Piper Warrior II', name: 'Warrior II', status: 'available' },
  { id: '22', registration: 'Conf Rm AD', type: 'Conference Room', name: 'Elite Administrative Wing', status: 'available' },
  { id: '23', registration: 'Conf Rm 2', type: 'Conference Room', name: 'Diamond Hallway', status: 'available' },
];

const mockInstructors: Instructor[] = [
  { 
    id: '1', 
    name: 'Justin Marvin', 
    certifications: ['CFI', 'CFII', 'CFMEI'], 
    available: true, 
    phone: '765-418-5504',
    email: 'jmarvin@purdueaviationllc.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'High Performance Endorsements', 'Multi Engine Rating', 'Instrument Rating', 'Instrument Proficiency Checks (IPC)', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts', 'Spin Training/Spin Endorsement'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '2', 
    name: 'Jason Snow', 
    certifications: ['CFI'], 
    available: true, 
    phone: '937-371-3200',
    email: 'jason.d.snow@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '3', 
    name: 'Jamie Redman', 
    certifications: ['CFI'], 
    available: true, 
    phone: '901-871-6504',
    email: 'jhredman@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '4', 
    name: 'William DePoortere', 
    certifications: ['CFI', 'CFII', 'MEI'], 
    available: true, 
    phone: '(336) 580-1430',
    email: 'will.depoortere.2@gmail.com',
    trainingCapabilities: ['Spin Training', 'Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Multi Engine Rating', 'High-Performance and Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'CFI Initial', 'CFII', 'MEI', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '5', 
    name: 'Jake Peterson', 
    certifications: ['CFI'], 
    available: true, 
    phone: '219-816-2210',
    email: 'jakepete1210@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Spin Training', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '6', 
    name: 'Chip Stembler', 
    certifications: ['CFI'], 
    available: true, 
    phone: '443-520-0080',
    email: 'chip.stembler@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '7', 
    name: 'Louis Marnat', 
    certifications: ['CFI', 'CFII', 'MEI'], 
    available: true, 
    phone: '248-320-8338',
    email: 'lmarnat@purdue.edu',
    trainingCapabilities: ['Multi Engine Rating', 'Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '8', 
    name: 'Andrew Sidhom', 
    certifications: ['CFI'], 
    available: true, 
    phone: '(818) 392-0372',
    email: 'andrewesidhom@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'High Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '9', 
    name: 'Rocco Thomas', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '970-692-3548',
    email: 'roccothoms@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Pilot', 'Commercial Pilot', 'Complex Endorsements', 'CFII', 'Biennial Flight Reviews (BFR)', 'IPC', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '10', 
    name: 'Ciara Hoyt', 
    certifications: ['CFI', 'CFII', 'MEI'], 
    available: true, 
    phone: '774-563-5044',
    email: 'ciarahoyt27@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Multi Engine Rating', 'CFI-I', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Check (IPC)', 'Complex Endorsements', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '11', 
    name: 'Amal Shah', 
    certifications: ['CFI'], 
    available: true, 
    phone: '858-247-9547',
    email: 'amalshah757@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'CFI Training', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '12', 
    name: 'Mitchell Ferrario', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '803-873-5544',
    email: 'mitchferrario@gmail.com',
    trainingCapabilities: ['CFI Initial and Spin Training', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Discovery Flight', 'Photo Flights', 'Biennial Flight Reviews', 'Instrument Proficiency Checks (IPC)', 'G1000/NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '13', 
    name: 'Jin Peng', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '765-337-9738',
    email: 'old8pilot@hotmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Complex Endorsements', 'High-Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Checks (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '14', 
    name: 'Cyrus Kelawala', 
    certifications: ['CFI', 'CFII', 'MEI'], 
    available: true, 
    phone: '808-292-7221',
    email: 'cyruskelawala@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Ratings', 'Commercial Pilot', 'Multiengine Ratings', 'Initial CFI', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm 2']
  },
  { 
    id: '15', 
    name: 'Tucker Bolander', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '(650) 452-8161',
    email: 'wtbolander@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'CFI/CFI-I', 'Biennial Flight Reviews (BFR)', 'IPC', 'Spin Training', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '16', 
    name: 'Victor Walls II', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '678-760-9871',
    email: 'vwalls@purdue.edu',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Complex Endorsements', 'High-Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Checks (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '17', 
    name: 'Harry Linsenmayer', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '713-562-0920',
    email: 'harrylflight@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Pilot', 'Commercial Pilot', 'CFII', 'Biennial Flight Reviews (BFR)', 'IPC', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '18', 
    name: 'Olivia Olson', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '773-673-4535',
    email: 'olivia@olsonhouse.us',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Instrument Rating', 'Complex Endorsements', 'High Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts', 'Spin Training/Spin Endorsements'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '19', 
    name: 'William Genetti', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '(832) 655-2632',
    email: 'wgenetti@purdue.edu',
    trainingCapabilities: ['Private Pilot', 'Commercial Pilot', 'Instrument Rating', 'Biennial Flight Reviews', 'Instrument Proficiency Checks', 'Discovery Flights', 'Photo Flights', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '20', 
    name: 'Trevor Allen', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '470-494-3989',
    email: 'tallen6122@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'High Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '21', 
    name: 'Kaitlyn Jarrett', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '765-237-2557',
    email: 'kaitlyn_jarrett@yahoo.com',
    trainingCapabilities: ['Discovery Flight', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Initial CFI', 'CFII', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Checks (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '22', 
    name: 'Josh Cataldo', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '847-797-4241',
    email: 'Jcataldo@purdue.edu',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'High Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '23', 
    name: 'Nicholas Clark', 
    certifications: ['CFI', 'CFII', 'MEI'], 
    available: true, 
    phone: '219-242-9863',
    email: 'nickclark66@live.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Multi-Engine Rating', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Check (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '24', 
    name: 'Timothy Downing', 
    certifications: ['CFI', 'CFII', 'MEI'], 
    available: true, 
    phone: '765-637-5384',
    email: 'timdowningdds@gmail.com',
    trainingCapabilities: ['Spin Training', 'Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Multi Engine Rating', 'High-Performance and Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'CFII', 'MEI', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '25', 
    name: 'Rudy Ahlersmeyer', 
    certifications: ['CFI'], 
    available: true, 
    phone: '765-464-9886',
    email: 'budruffles@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts', 'Spin Training/Spin Endorsement'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '26', 
    name: 'Rosemary Likens', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '765-623-0402',
    email: 'rlikens927@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'High Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts', 'Spin Training/Spin Endorsement'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '27', 
    name: 'Nathaniel Bobek', 
    certifications: ['CFI'], 
    available: true, 
    phone: '317-935-3474',
    email: 'nbobek@purdue.edu',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'CFII', 'Biennial Flight Reviews (BFR)', 'IPC', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '28', 
    name: 'Mercedes Disinger', 
    certifications: ['CFI'], 
    available: true, 
    phone: '765-337-7344',
    email: 'dinomercedes73@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '29', 
    name: 'Drew Watne', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '704-293-3990',
    email: 'dnwatne2@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Complex Endorsements', 'High-Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Checks (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '30', 
    name: 'Annika Bobek', 
    certifications: ['CFI'], 
    available: true, 
    phone: '317-440-0442',
    email: 'annikamb13@gmail.com',
    trainingCapabilities: ['Spin Training', 'Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '31', 
    name: 'Gavin Bramel', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '317-719-7323',
    email: 'gavin.bramel@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Complex Endorsements', 'High-Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Checks (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '32', 
    name: 'Aiden Costello', 
    certifications: ['CFI', 'CFII'], 
    available: true, 
    phone: '410-456-6120',
    email: 'aiden_costello@yahoo.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Instrument Rating', 'Commercial Pilot', 'Complex Endorsements', 'High-Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'Instrument Proficiency Checks (IPC)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
  { 
    id: '33', 
    name: 'Ryan Leung', 
    certifications: ['CFI'], 
    available: true, 
    phone: '925-900-8838',
    email: 'lw.ryan.leung@gmail.com',
    trainingCapabilities: ['Discovery Flight', 'Photo Flights', 'Private Pilot', 'Commercial Pilot', 'Complex Endorsements', 'High-Performance Endorsements', 'Biennial Flight Reviews (BFR)', 'G1000/G1000NXI Checkouts'],
    authorizedAircraft: ['N94286', 'N51204', 'N63366', 'N5331D', 'N5724J', 'N6665G', 'N73719', 'N35063', 'N651PA', 'N652PA', 'N653PA', 'N654PA', 'N665CS', 'N422LS', 'N2884L', 'N560PU', 'N273ND', 'N6605F', 'N767PA', 'N3033T-PPI', 'N4347G-PPI', 'Conf Rm AD', 'Conf Rm 2']
  },
];

const mockFlights: Flight[] = [];

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [flights, setFlights] = useState<Flight[]>(mockFlights);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMasterScheduleOpen, setIsMasterScheduleOpen] = useState(false);
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>(undefined);
  const [preselectedEndTime, setPreselectedEndTime] = useState<string | undefined>(undefined);
  const [filteredAircraftIds, setFilteredAircraftIds] = useState<string[]>([]);
  const [filteredInstructorIds, setFilteredInstructorIds] = useState<string[]>([]);
  const [preselectedAircraft, setPreselectedAircraft] = useState<string | undefined>(undefined);
  const [preselectedInstructors, setPreselectedInstructors] = useState<string[]>([]);
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // For master schedule clicks
  const [isEndTimeDialogOpen, setIsEndTimeDialogOpen] = useState(false);
  const [masterScheduleClickData, setMasterScheduleClickData] = useState<{
    date: Date;
    startTime: string;
    resourceType: 'aircraft' | 'instructor';
    resourceId: string;
    resourceName: string;
  } | null>(null);

  // Helper function to convert time to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if a resource is available during an entire time block
  const isResourceAvailable = (
    resourceId: string,
    resourceType: 'aircraft' | 'instructor',
    startTime: string,
    endTime: string,
    date: Date
  ) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    const conflictingFlights = flights.filter(flight => {
      if (flight.status === 'cancelled') return false;
      if (flight.date.toDateString() !== date.toDateString()) return false;
      
      const flightStartMinutes = timeToMinutes(flight.startTime);
      const flightEndMinutes = timeToMinutes(flight.endTime);
      
      // Check if there's any overlap
      const hasOverlap = !(flightEndMinutes <= startMinutes || flightStartMinutes >= endMinutes);
      
      if (resourceType === 'aircraft') {
        return flight.aircraft === resourceId && hasOverlap;
      } else {
        return flight.instructor === resourceId && hasOverlap;
      }
    });
    
    return conflictingFlights.length === 0;
  };

  // Get available resources for a time block
  const getAvailableResources = (
    resourceType: 'aircraft' | 'instructor',
    startTime: string,
    endTime: string,
    date: Date
  ) => {
    if (resourceType === 'aircraft') {
      // Return available instructor IDs (not names)
      return mockInstructors.filter(instructor =>
        isResourceAvailable(instructor.name, 'instructor', startTime, endTime, date)
      ).map(i => i.id);
    } else {
      // Return available aircraft registrations
      return mockAircraft.filter(aircraft =>
        isResourceAvailable(aircraft.registration, 'aircraft', startTime, endTime, date)
      ).map(a => a.registration);
    }
  };

  const handleMasterScheduleCellClick = (data: {
    date: Date;
    startTime: string;
    resourceType: 'aircraft' | 'instructor';
    resourceId: string;
    resourceName: string;
  }) => {
    setMasterScheduleClickData(data);
    setIsEndTimeDialogOpen(true);
  };

  const handleEndTimeConfirm = (endTime: string) => {
    if (!masterScheduleClickData) return;
    
    const { date, startTime, resourceType, resourceId } = masterScheduleClickData;
    
    // Get available resources for this time block
    const availableResources = getAvailableResources(resourceType, startTime, endTime, date);
    
    // Set the preselected data based on what was clicked
    setSelectedDate(date);
    setPreselectedTime(startTime);
    setPreselectedEndTime(endTime);
    
    if (resourceType === 'aircraft') {
      // Clicked on aircraft - preselect aircraft and filter instructors
      setPreselectedAircraft(resourceId);
      setFilteredInstructorIds(availableResources);
      setPreselectedInstructors([]);
      setFilteredAircraftIds([]);
    } else {
      // Clicked on instructor - preselect instructor and filter aircraft
      // resourceId is the instructor name, we need to convert it to ID
      const instructor = mockInstructors.find(i => i.name === resourceId);
      if (instructor) {
        setPreselectedInstructors([instructor.id]);
      }
      setFilteredAircraftIds(availableResources);
      setPreselectedAircraft(undefined);
      setFilteredInstructorIds([]);
    }
    
    setIsEndTimeDialogOpen(false);
    setIsDialogOpen(true);
    setMasterScheduleClickData(null);
  };

  const handleScheduleFlight = (flight: Flight) => {
    // Check if the flight is in the past
    const now = new Date();
    const flightDate = new Date(flight.date);
    const [hours, minutes] = flight.startTime.split(':').map(Number);
    flightDate.setHours(hours, minutes, 0, 0);
    
    if (flightDate < now) {
      alert('Cannot schedule a flight in the past. Please select a future time.');
      return;
    }
    
    setFlights([...flights, flight]);
    setIsDialogOpen(false);
    setPreselectedTime(undefined);
    setPreselectedEndTime(undefined);
  };

  const handleCancelFlight = (id: string, reason: string, comments: string) => {
    setFlights(flights.map(f => f.id === id ? { ...f, status: 'cancelled' as const, cancelReason: reason, cancelComments: comments } : f));
  };

  const handleUpdateFlight = (updatedFlight: Flight) => {
    setFlights(flights.map(f => f.id === updatedFlight.id ? updatedFlight : f));
  };

  const handleTimeSlotClick = (startTime: string, endTime?: string) => {
    setPreselectedTime(startTime);
    setPreselectedEndTime(endTime);
    setIsDialogOpen(true);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 80));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const zoomScale = zoomLevel / 100;

  // Apply zoom to root element for portals
  useEffect(() => {
    const root = document.getElementById('app-root');
    console.log('Zoom effect triggered. zoomScale:', zoomScale, 'root found:', !!root);
    if (root) {
      root.style.transform = `scale(${zoomScale})`;
      root.style.transformOrigin = 'top left';
      root.style.width = `${100 / zoomScale}%`;
      root.style.minHeight = `${100 / zoomScale}vh`;
      console.log('Applied transform to root:', root.style.transform);
    } else {
      console.error('app-root element not found!');
    }
    
    return () => {
      if (root) {
        root.style.transform = '';
        root.style.transformOrigin = '';
        root.style.width = '';
        root.style.minHeight = '';
      }
    };
  }, [zoomScale]);

  return (
    <>
      <div id="app-root" className="min-h-screen bg-background overflow-x-auto relative">
        {/* Header */}
        <header className="bg-primary shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <ImageWithFallback 
                src={logo} 
                alt="Purdue Aviation Logo" 
                className="h-10 sm:h-12 md:h-16 w-auto"
              />
            </div>
          </div>
        </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-6 sm:mb-8 h-auto bg-white shadow-sm border">
            <TabsTrigger value="schedule" className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Schedule</span>
              <span className="xs:hidden">Sched</span>
            </TabsTrigger>
            <TabsTrigger value="flights" className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">My Flights</span>
              <span className="xs:hidden">Flights</span>
            </TabsTrigger>
            <TabsTrigger value="aircraft" className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Aircraft</span>
              <span className="xs:hidden">Planes</span>
            </TabsTrigger>
            <TabsTrigger value="instructors" className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Instructors</span>
              <span className="xs:hidden">Instrs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-0">
            <div className={`grid grid-cols-1 gap-6 transition-all duration-300 ${
              isCalendarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-[300px_1fr]'
            }`}>
              {!isCalendarCollapsed && (
                <div className="h-fit">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">Select a Date</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCalendarCollapsed(true)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-lg border shadow-sm bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="relative">
                {isCalendarCollapsed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCalendarCollapsed(false)}
                    className="absolute -left-3 top-4 z-10 h-10 w-10 p-0 rounded-full shadow-md bg-white hover:bg-slate-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                
                {selectedDate ? (
                  <BookingInterface
                    selectedDate={selectedDate}
                    aircraft={mockAircraft}
                    instructors={mockInstructors}
                    flights={flights}
                    onOpenMasterSchedule={() => setIsMasterScheduleOpen(true)}
                    onOpenScheduleDialog={() => setIsDialogOpen(true)}
                    onTimeSlotClick={(startTime, endTime, aircraftId, instructorIds) => {
                      setPreselectedTime(startTime);
                      setPreselectedEndTime(endTime);
                      setPreselectedAircraft(aircraftId);
                      setPreselectedInstructors(instructorIds || []);
                      setIsDialogOpen(true);
                    }}
                    onFilterChange={(aircraftReg, instructorIds) => {
                      setFilteredAircraftIds(aircraftReg);
                      setFilteredInstructorIds(instructorIds);
                    }}
                  />
                ) : (
                  <Card className="shadow-sm">
                    <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                      <p className="text-center text-slate-500">Please select a date</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flights" className="mt-0">
            <FlightList 
              flights={flights} 
              onCancelFlight={handleCancelFlight}
              onUpdateFlight={handleUpdateFlight}
              currentUser="You"
            />
          </TabsContent>

          <TabsContent value="aircraft" className="mt-0">
            <AircraftGrid aircraft={mockAircraft} />
          </TabsContent>

          <TabsContent value="instructors" className="mt-0">
            <InstructorGrid instructors={mockInstructors} />
          </TabsContent>
        </Tabs>
      </div>

      </div>

      {/* Dialogs rendered outside #app-root so CSS transform on the scaled container
          does not break position:fixed centering on the physical viewport */}
      <ScheduleDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setPreselectedTime(undefined);
            setPreselectedEndTime(undefined);
            setPreselectedAircraft(undefined);
            setPreselectedInstructors([]);
            setFilteredAircraftIds([]);
            setFilteredInstructorIds([]);
          }
        }}
        onSchedule={handleScheduleFlight}
        aircraft={mockAircraft}
        instructors={mockInstructors}
        existingFlights={flights}
        preselectedDate={selectedDate}
        preselectedTime={preselectedTime}
        preselectedEndTime={preselectedEndTime}
        preselectedAircraft={preselectedAircraft}
        preselectedInstructor={preselectedInstructors.length > 0 ? mockInstructors.find(i => i.id === preselectedInstructors[0])?.name : undefined}
        filteredAircraftIds={filteredAircraftIds}
        filteredInstructorIds={filteredInstructorIds.length > 0 ? filteredInstructorIds : preselectedInstructors}
      />

      <Dialog open={isMasterScheduleOpen} onOpenChange={setIsMasterScheduleOpen}>
        <DialogContent
          className="!max-w-none p-0 gap-0 overflow-hidden flex flex-col !m-0 !translate-x-0 !translate-y-0 !left-0 !top-0 !rounded-none !border-0 !inset-0 [&>button]:hidden"
          style={{
            width: '100vw',
            height: '100vh'
          }}
          aria-describedby="master-schedule-description">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-slate-50 flex-shrink-0 min-h-fit relative">
            <DialogTitle className="text-base sm:text-lg pr-10">Master Schedule - {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</DialogTitle>
            <DialogDescription id="master-schedule-description" className="text-xs text-slate-600">
              Complete schedule view for all aircraft and instructors
            </DialogDescription>
            <Button
              onClick={() => setIsMasterScheduleOpen(false)}
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full opacity-70 hover:opacity-100 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden w-full">
            {selectedDate && (
              <MasterSchedule
                selectedDate={selectedDate}
                flights={flights}
                aircraft={mockAircraft}
                instructors={mockInstructors}
                currentUser="You"
                onDateChange={setSelectedDate}
                onCellClick={handleMasterScheduleCellClick}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EndTimeDialog
        open={isEndTimeDialogOpen}
        onOpenChange={setIsEndTimeDialogOpen}
        onConfirm={handleEndTimeConfirm}
        startTime={masterScheduleClickData?.startTime}
        resourceType={masterScheduleClickData?.resourceType}
        resourceName={masterScheduleClickData?.resourceName}
      />

      {/* Zoom Controls - Always on top, outside scaled container */}
      {!isMasterScheduleOpen && (
        <div 
          className="fixed top-4 right-4 z-[9999] flex items-center gap-1.5 bg-white border rounded-lg shadow-lg p-1.5"
        >
          <Button
            onClick={handleZoomOut}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100"
            title="Zoom Out"
            disabled={zoomLevel <= 80}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="text-center text-xs py-1 px-2.5 bg-slate-50 rounded min-w-[50px]">
            {zoomLevel}%
          </div>
          <Button
            onClick={handleZoomIn}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100"
            title="Zoom In"
            disabled={zoomLevel >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleZoomReset}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:bg-slate-100"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}