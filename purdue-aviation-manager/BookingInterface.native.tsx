// @ts-nocheck
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import type { Aircraft, Instructor, Flight } from "./app/src/App.native";

interface BookingInterfaceProps {
  selectedDate: Date;
  aircraft: Aircraft[];
  instructors: Instructor[];
  flights: Flight[];
  onOpenMasterSchedule: () => void;
  onOpenScheduleDialog: () => void;
  onTimeSlotClick?: (startTime: string, endTime: string, aircraftId?: string, instructorIds?: string[]) => void;
  onFilterChange?: (aircraftIds: string[], instructorIds: string[]) => void;
}

export function BookingInterface({
  selectedDate,
  aircraft,
  instructors,
  flights,
  onOpenMasterSchedule,
  onOpenScheduleDialog,
  onTimeSlotClick,
  onFilterChange,
}: BookingInterfaceProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredAircraftIds, setFilteredAircraftIds] = useState<string[]>([]);
  const [filteredInstructorIds, setFilteredInstructorIds] = useState<string[]>([]);

  const hasActiveFilters = filteredAircraftIds.length > 0 || filteredInstructorIds.length > 0;

  const formattedDateShort = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
    [selectedDate]
  );

  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 6; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const isResourceAvailable = (slotTime: string, resourceId: string, resourceType: "aircraft" | "instructor") => {
    const slotMinutes = timeToMinutes(slotTime);
    const dayFlights = flights.filter(
      (f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"
    );

    const resourceFlights = dayFlights.filter((flight) => {
      if (resourceType === "aircraft") {
        return flight.aircraft === resourceId;
      } else {
        const instructor = instructors.find((i) => i.id === resourceId);
        return flight.instructor === instructor?.name;
      }
    });

    return !resourceFlights.some((flight) => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  const availableTimeSlots = useMemo(() => {
    if (!hasActiveFilters) return [];

    const timeSlots = generateTimeSlots();
    const availableSlots: { startTime: string; endTime: string; duration: number }[] = [];

    for (const slot of timeSlots) {
      const allAircraftAvailable =
        filteredAircraftIds.length === 0 ||
        filteredAircraftIds.every((aircraftId) => isResourceAvailable(slot, aircraftId, "aircraft"));

      const allInstructorsAvailable =
        filteredInstructorIds.length === 0 ||
        filteredInstructorIds.every((instructorId) => isResourceAvailable(slot, instructorId, "instructor"));

      if (allAircraftAvailable && allInstructorsAvailable) {
        const slotMinutes = timeToMinutes(slot);
        const endMinutes = slotMinutes + 120;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

        availableSlots.push({ startTime: slot, endTime, duration: 2 });
      }
    }

    return availableSlots;
  }, [filteredAircraftIds, filteredInstructorIds, flights, hasActiveFilters, selectedDate]);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const toggleAircraft = (id: string) => {
    setFilteredAircraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleInstructor = (id: string) => {
    setFilteredInstructorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setFilteredAircraftIds([]);
    setFilteredInstructorIds([]);
    onFilterChange?.([], []);
    setIsFilterOpen(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!hasActiveFilters ? (
        <View style={styles.stack}>
          <PrimaryButton label={`Find Opening ${formattedDateShort}`} onPress={() => setIsFilterOpen(true)} />
          <Divider label="or" />
          <SecondaryButton label="View Master Schedule" onPress={onOpenMasterSchedule} />
        </View>
      ) : (
        <View style={styles.stack}>
          <Text style={styles.sectionTitle}>Available Openings</Text>
          {availableTimeSlots.length === 0 && (
            <Text style={styles.muted}>No openings match the selected resources.</Text>
          )}
          {availableTimeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.startTime}
              style={styles.slotCard}
              onPress={() => onTimeSlotClick?.(slot.startTime, slot.endTime, filteredAircraftIds[0], filteredInstructorIds)}
            >
              <Text style={styles.slotTime}>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</Text>
              <Text style={styles.muted}>{slot.duration} hr block • {formattedDateShort}</Text>
            </TouchableOpacity>
          ))}
          <SecondaryButton label="Clear filters" onPress={clearFilters} />
        </View>
      )}

      {/* Simple inline filter sheet */}
      {isFilterOpen && (
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Filter resources</Text>
          <Text style={styles.sheetSubtitle}>Select aircraft and/or instructors</Text>

          <Text style={styles.sheetLabel}>Aircraft</Text>
          <View style={styles.chipWrap}>
            {aircraft.map((plane) => (
              <Chip
                key={plane.id}
                label={plane.registration}
                active={filteredAircraftIds.includes(plane.id)}
                onPress={() => toggleAircraft(plane.id)}
              />
            ))}
          </View>

          <Text style={[styles.sheetLabel, { marginTop: 12 }]}>Instructors</Text>
          <View style={styles.chipWrap}>
            {instructors.map((inst) => (
              <Chip
                key={inst.id}
                label={inst.name}
                active={filteredInstructorIds.includes(inst.id)}
                onPress={() => toggleInstructor(inst.id)}
              />
            ))}
          </View>

          <View style={styles.sheetActions}>
            <SecondaryButton label="Cancel" onPress={() => setIsFilterOpen(false)} />
            <PrimaryButton
              label="Apply filters"
              onPress={() => {
                onFilterChange?.(filteredAircraftIds, filteredInstructorIds);
                setIsFilterOpen(false);
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.secondaryBtn} onPress={onPress}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <View style={styles.dividerWrap}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  stack: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  muted: {
    color: "#6b7280",
    fontSize: 14,
  },
  slotCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  sheet: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#475569",
  },
  sheetLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },
  chipActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#1d4ed8",
  },
  chipText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#1d4ed8",
  },
  sheetActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#cbd5e1",
  },
  dividerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
  },
});
export default BookingInterface;