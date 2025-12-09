// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import type { Flight, Aircraft, Instructor } from "./app/src/App.native";

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
  filteredAircraftIds?: string[];
  filteredInstructorIds?: string[];
  setFilteredAircraftIds?: (ids: string[]) => void;
  setFilteredInstructorIds?: (ids: string[]) => void;
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
  filteredAircraftIds = [],
  filteredInstructorIds = [],
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedAircraft, setSelectedAircraft] = useState<string>("");
  const [selectedInstructor, setSelectedInstructor] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [duration, setDuration] = useState<string>("2");
  const [flightType, setFlightType] = useState<"dual" | "solo" | "checkride">("dual");
  const [flightCategory, setFlightCategory] = useState<string>("standard");

  const dateOptions = useMemo(() => {
    const start = preselectedDate ?? new Date();
    const base = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [preselectedDate]);

  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    return (durationMinutes / 60).toString();
  };

  const calculateEndTime = (start: string, durationHours: string) => {
    const durationNum = parseFloat(durationHours);
    const [hours, minutes] = start.split(":").map(Number);
    const endHours = hours + Math.floor(durationNum);
    const endMinutes = minutes + (durationNum % 1) * 60;
    return `${String(endHours + Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const isInstructorAvailableForTimeBlock = (instructorName: string, start: string, end: string, selectedDate: Date) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const dayFlights = existingFlights.filter(
      (f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"
    );
    const instructorFlights = dayFlights.filter((flight) => flight.instructor === instructorName);
    return !instructorFlights.some((flight) => {
      const flightStartMinutes = timeToMinutes(flight.startTime);
      const flightEndMinutes = timeToMinutes(flight.endTime);
      return startMinutes < flightEndMinutes && endMinutes > flightStartMinutes;
    });
  };

  const isAircraftAvailableForTimeBlock = (aircraftReg: string, start: string, end: string, selectedDate: Date) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const dayFlights = existingFlights.filter(
      (f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"
    );
    const aircraftFlights = dayFlights.filter((flight) => flight.aircraft === aircraftReg);
    return !aircraftFlights.some((flight) => {
      const flightStartMinutes = timeToMinutes(flight.startTime);
      const flightEndMinutes = timeToMinutes(flight.endTime);
      return startMinutes < flightEndMinutes && endMinutes > flightStartMinutes;
    });
  };

  useEffect(() => {
    if (preselectedDate) setDate(preselectedDate);
  }, [preselectedDate]);

  useEffect(() => {
    if (preselectedTime) setStartTime(preselectedTime);
  }, [preselectedTime]);

  useEffect(() => {
    if (preselectedTime && preselectedEndTime) {
      const calculatedDuration = calculateDuration(preselectedTime, preselectedEndTime);
      setDuration(calculatedDuration);
    }
  }, [preselectedTime, preselectedEndTime]);

  useEffect(() => {
    if (!open) {
      setSelectedAircraft("");
      setSelectedInstructor("");
      setStartTime("09:00");
      setDuration("2");
      setFlightType("dual");
      setFlightCategory("standard");
    }
  }, [open]);

  const currentEndTime = calculateEndTime(startTime, duration);

  const availableAircraft = useMemo(() => {
    const base = filteredAircraftIds.length
      ? aircraft.filter((a) => a.status === "available" && filteredAircraftIds.includes(a.registration))
      : aircraft.filter((a) => a.status === "available");
    if (!date) return base;
    return base.filter((a) => isAircraftAvailableForTimeBlock(a.registration, startTime, currentEndTime, date));
  }, [aircraft, currentEndTime, date, filteredAircraftIds, startTime]);

  const availableInstructors = useMemo(() => {
    const base = filteredInstructorIds.length
      ? instructors.filter((i) => i.available && filteredInstructorIds.includes(i.id))
      : instructors.filter((i) => i.available);
    if (!date) return base;
    return base.filter((i) => {
      const isAvailable = isInstructorAvailableForTimeBlock(i.name, startTime, currentEndTime, date);
      if (selectedAircraft && i.authorizedAircraft) {
        return isAvailable && i.authorizedAircraft.includes(selectedAircraft);
      }
      return isAvailable;
    });
  }, [currentEndTime, date, filteredInstructorIds, instructors, selectedAircraft, startTime]);

  const handleSchedule = () => {
    if (!date || !selectedAircraft || !selectedInstructor) {
      return;
    }
    const durationHours = parseFloat(duration);
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + Math.floor(durationHours);
    const endMinutes = minutes + (durationHours % 1) * 60;
    const endTime = `${String(endHours + Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

    const newFlight: Flight = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      aircraft: selectedAircraft,
      instructor: selectedInstructor,
      student: "You",
      type: flightType,
      status: "scheduled",
      flightCategory: flightCategory as any,
    };
    onSchedule(newFlight);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => onOpenChange(false)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Schedule a Flight</Text>
              <Text style={styles.subtitle}>Book your training session</Text>
            </View>
            <TouchableOpacity onPress={() => onOpenChange(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {(filteredAircraftIds.length > 0 || filteredInstructorIds.length > 0) && (
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>Selected block</Text>
              <Text style={styles.bannerText}>
                {formatTime(startTime)} - {formatTime(currentEndTime)}
              </Text>
              {filteredAircraftIds.length > 0 && (
                <Text style={styles.bannerText}>Aircraft: {filteredAircraftIds.join(", ")}</Text>
              )}
              {filteredInstructorIds.length > 0 && (
                <Text style={styles.bannerText}>
                  Instructors: {filteredInstructorIds.map((id) => instructors.find((i) => i.id === id)?.name).join(", ")}
                </Text>
              )}
            </View>
          )}

          <ScrollView contentContainerStyle={styles.content}>
            <Field label="Flight Category">
              <PillPicker
                value={flightCategory}
                onChange={setFlightCategory}
                options={[
                  "h6-operations",
                  "new-student",
                  "photo-flight",
                  "standard",
                  "unavailable",
                  "ground-instruction",
                  "aircraft-checkout",
                  "down-time",
                  "in-office",
                  "checkride-category",
                  "groundschool",
                  "maintenance",
                  "bfr",
                  "meeting",
                  "spin-training",
                ]}
              />
            </Field>

            <Field label="Date">
              <View style={styles.pillWrap}>
                {dateOptions.map((optionDate, idx) => {
                  const label = (() => {
                    const today = new Date();
                    const tomorrow = new Date();
                    tomorrow.setDate(today.getDate() + 1);
                    if (optionDate.toDateString() === today.toDateString()) return "Today";
                    if (optionDate.toDateString() === tomorrow.toDateString()) return "Tomorrow";
                    return optionDate.toLocaleDateString();
                  })();
                  const isActive = date && optionDate.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={`${optionDate.toDateString()}-${idx}`}
                      style={[styles.pill, styles.datePill, isActive && styles.pillActive]}
                      onPress={() => setDate(new Date(optionDate))}
                    >
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            <View style={styles.rowTwo}>
              <Field label="Start Time">
                <PillPicker
                  value={startTime}
                  onChange={setStartTime}
                  options={Array.from({ length: 13 }, (_, i) => i + 6).flatMap((hour) => [
                    `${String(hour).padStart(2, "0")}:00`,
                    `${String(hour).padStart(2, "0")}:30`,
                  ])}
                />
              </Field>
              <Field label="Duration (hrs)">
                <PillPicker value={duration} onChange={setDuration} options={["0.5", "1", "1.5", "2", "2.5", "3"]} />
              </Field>
            </View>

            <Field label="Instructor">
              <PickerList
                value={selectedInstructor}
                placeholder="Select instructor"
                onChange={setSelectedInstructor}
                options={availableInstructors.map((i) => ({ value: i.name, label: `${i.name} - ${i.certifications.join(", ")}` }))}
                emptyLabel="No instructors available"
              />
            </Field>

            <Field label="Aircraft">
              <PickerList
                value={selectedAircraft}
                placeholder="Select aircraft"
                onChange={setSelectedAircraft}
                options={availableAircraft.map((a) => ({ value: a.registration, label: `${a.registration} - ${a.type}` }))}
                emptyLabel="No aircraft available"
              />
            </Field>

            <Field label="Flight Type">
              <PillPicker value={flightType} onChange={setFlightType} options={["dual", "solo", "checkride"]} />
            </Field>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => onOpenChange(false)}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSchedule}>
              <Text style={styles.primaryText}>Schedule Flight</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function PillPicker({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <View style={styles.pillWrap}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.pill, value === opt && styles.pillActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.pillText, value === opt && styles.pillTextActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PickerList({
  value,
  placeholder,
  options,
  onChange,
  emptyLabel,
}: {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  emptyLabel: string;
}) {
  if (!options.length) {
    return <Text style={styles.emptyText}>{emptyLabel}</Text>;
  }
  return (
    <View style={styles.listBox}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.listRow, value === opt.value && styles.listRowActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.listText, value === opt.value && styles.listTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  banner: {
    backgroundColor: "#e0f2fe",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 4,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  bannerText: {
    fontSize: 13,
    color: "#1d4ed8",
  },
  content: {
    gap: 12,
    paddingBottom: 20,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  rowTwo: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
  },
  inputText: {
    fontSize: 14,
    color: "#0f172a",
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  datePill: {
    flexBasis: "13%",
    flexGrow: 0,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  pillActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#1d4ed8",
  },
  pillText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#1d4ed8",
  },
  listBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  listRow: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  listRowActive: {
    backgroundColor: "#eef2ff",
  },
  listText: {
    fontSize: 14,
    color: "#0f172a",
  },
  listTextActive: {
    color: "#4338ca",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    alignItems: "center",
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#fff",
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
});
