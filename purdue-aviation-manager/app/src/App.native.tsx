// @ts-nocheck
import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from "react-native";
import { FlightList } from "../../FlightList.native";
import { TimelineView } from "../../TimelineView.native";
import { ScheduleDialog } from "../../ScheduleDialog.native";

export interface Flight {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  aircraft: string;
  instructor: string;
  student: string;
  type: "dual" | "solo" | "checkride" | "spin" | "photo" | "meeting" | "maintenance" | "ground";
  status: "scheduled" | "completed" | "cancelled";
  hobbsTime?: number;
  cancelReason?: string;
  cancelComments?: string;
  flightCategory?:
    | "standard"
    | "unavailable"
    | "spin-training"
    | "photo-flight"
    | "new-student"
    | "meeting"
    | "maintenance"
    | "in-office"
    | "h6-operations"
    | "groundschool"
    | "ground-instruction"
    | "aircraft-checkout"
    | "down-time"
    | "checkride-category"
    | "bfr";
}

export interface Aircraft {
  id: string;
  name: string;
  type: string;
  registration: string;
  status: "available" | "maintenance" | "unavailable";
  hobbsTime?: number;
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

const mockFlights: Flight[] = [
  {
    id: "f1",
    date: new Date(),
    startTime: "09:00",
    endTime: "11:00",
    aircraft: "N172PA",
    instructor: "Justin Marvin",
    student: "Alex",
    type: "dual",
    status: "scheduled",
  },
  {
    id: "f2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    startTime: "13:00",
    endTime: "14:30",
    aircraft: "N63366",
    instructor: "Ciara Hoyt",
    student: "Casey",
    type: "solo",
    status: "completed",
    hobbsTime: 1.4,
  },
  {
    id: "f3",
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    startTime: "08:30",
    endTime: "10:00",
    aircraft: "N51204",
    instructor: "Rocco Thomas",
    student: "Taylor",
    type: "checkride",
    status: "scheduled",
  },
];

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
  }
];

export default function App() {
  const [flights, setFlights] = useState<Flight[]>(() => mockFlights);
  const [aircraft] = useState<Aircraft[]>(mockAircraft);
  const [instructors] = useState<Instructor[]>(mockInstructors);
  const [selectedDate] = useState<Date>(new Date());
  const [filteredAircraftIds, setFilteredAircraftIds] = useState<string[]>([]);
  const [filteredInstructorIds, setFilteredInstructorIds] = useState<string[]>([]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>(undefined);
  const [preselectedEndTime, setPreselectedEndTime] = useState<string | undefined>(undefined);

  const stats = useMemo(() => {
    const completed = flights.filter((f) => f.status === "completed").length;
    const scheduled = flights.filter((f) => f.status === "scheduled").length;
    const cancelled = flights.filter((f) => f.status === "cancelled").length;
    return { completed, scheduled, cancelled };
  }, [flights]);

  const handleCancelFlight = (id: string, reason: string, comments: string) => {
    setFlights((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "cancelled", cancelReason: reason, cancelComments: comments } : f))
    );
  };

  const handleUpdateFlight = (updated: Flight) => {
    setFlights((prev) => prev.map((f) => (f.id === updated.id ? { ...f, ...updated } : f)));
  };

  const handleTimeSlotClick = (startTime: string, endTime?: string) => {
    setPreselectedTime(startTime);
    setPreselectedEndTime(endTime);
    setScheduleOpen(true);
  };

  const handleScheduleFlight = (flight: Flight) => {
    setFlights((prev) => [...prev, flight]);
  };

  const handleFilterChange = (aircraftIds: string[], instructorIds: string[]) => {
    setFilteredAircraftIds(aircraftIds);
    setFilteredInstructorIds(instructorIds);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Purdue Aviation Manager</Text>
          <Text style={styles.subtitle}>Lightweight mobile-friendly overview</Text>
          <View style={styles.statRow}>
            <StatPill label="Scheduled" value={stats.scheduled} color="#1d4ed8" />
            <StatPill label="Completed" value={stats.completed} color="#16a34a" />
            <StatPill label="Cancelled" value={stats.cancelled} color="#dc2626" />
          </View>
        </View>

        <Section title="Timeline">
          <TimelineView
            selectedDate={selectedDate}
            flights={flights}
            aircraft={aircraft}
            instructors={instructors}
            onTimeSlotClick={handleTimeSlotClick}
            onFilterChange={handleFilterChange}
          />
        </Section>

        <FlightList flights={flights} onCancelFlight={handleCancelFlight} onUpdateFlight={handleUpdateFlight} />

        <Section title="Aircraft">
          <View style={styles.rowWrap}>
            {aircraft.map((plane) => (
              <View key={plane.id} style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardTitle}>{plane.registration}</Text>
                <Text style={styles.muted}>{plane.name}</Text>
                <Text style={styles.muted}>{plane.type}</Text>
                <Badge text={plane.status === "available" ? "Available" : plane.status} tone={plane.status} />
              </View>
            ))}
          </View>
        </Section>

        <Section title="Instructors">
          <View style={styles.rowWrap}>
            {instructors.map((inst) => (
              <View key={inst.id} style={[styles.card, styles.halfCard]}>
                <Text style={styles.cardTitle}>{inst.name}</Text>
                <Text style={styles.muted}>{inst.certifications.join(", ")}</Text>
                <Badge text={inst.available ? "Available" : "Booked"} tone={inst.available ? "available" : "unavailable"} />
              </View>
            ))}
          </View>
        </Section>
      </ScrollView>

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        onSchedule={handleScheduleFlight}
        aircraft={aircraft}
        instructors={instructors}
        existingFlights={flights}
        preselectedDate={selectedDate}
        preselectedTime={preselectedTime}
        preselectedEndTime={preselectedEndTime}
        filteredAircraftIds={filteredAircraftIds}
        filteredInstructorIds={filteredInstructorIds}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statPill, { backgroundColor: color + "11", borderColor: color + "33" }]}> 
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function Badge({ text, tone }: { text: string; tone: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    available: { bg: "#dcfce7", fg: "#166534" },
    maintenance: { bg: "#fef9c3", fg: "#854d0e" },
    unavailable: { bg: "#fee2e2", fg: "#991b1b" },
    default: { bg: "#e5e7eb", fg: "#111827" },
  };
  const palette = colors[tone] || colors.default;
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}> 
      <Text style={[styles.badgeText, { color: palette.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 4,
  },
  halfCard: {
    width: "48%",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  muted: {
    color: "#6b7280",
    fontSize: 14,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: "700",
    fontSize: 12,
  },
});
