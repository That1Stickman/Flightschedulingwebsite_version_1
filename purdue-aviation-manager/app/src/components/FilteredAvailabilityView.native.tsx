// @ts-nocheck
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import type { Aircraft, Instructor, Flight } from "../App.native";

interface FilteredAvailabilityViewProps {
  selectedDate: Date;
  filteredAircraftIds: string[];
  filteredInstructorIds: string[];
  aircraft: Aircraft[];
  instructors: Instructor[];
  flights: Flight[];
  onTimeSlotSelect: (startTime: string, endTime: string, aircraftId: string, instructorIds: string[]) => void;
  onClose: () => void;
}

export function FilteredAvailabilityView({
  selectedDate,
  filteredAircraftIds,
  filteredInstructorIds,
  aircraft,
  instructors,
  flights,
  onTimeSlotSelect,
  onClose,
}: FilteredAvailabilityViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<{ aircraft: string; startTime: string; endTime: string } | null>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const filteredAircraft = useMemo(
    () => aircraft.filter((a) => filteredAircraftIds.includes(a.registration)),
    [aircraft, filteredAircraftIds]
  );

  const availableGrid = useMemo(() => {
    return timeSlots.map((slot) => {
      const rows = filteredAircraft.map((ac) => {
        const aircraftAvailable = isAircraftAvailable(ac.registration, slot, flights, selectedDate);
        const availableInstructors = getAvailableInstructors(
          ac.registration,
          slot,
          instructors,
          filteredInstructorIds,
          flights,
          selectedDate
        );
        const isSelectable = aircraftAvailable && availableInstructors.length > 0;
        return {
          aircraftId: ac.registration,
          aircraftLabel: `${ac.registration} • ${ac.type}`,
          isSelectable,
          availableInstructors,
        };
      });
      return { slot, rows };
    });
  }, [filteredAircraft, filteredInstructorIds, flights, instructors, selectedDate, timeSlots]);

  const handleSelect = (slot: string, ac: string, instructorsList: string[]) => {
    const end = addMinutes(slot, 120);
    setSelectedSlot({ aircraft: ac, startTime: slot, endTime: end });
    onTimeSlotSelect(slot, end, ac, instructorsList);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Filtered Availability</Text>
          <Text style={styles.subtitle}>
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>

      {selectedSlot && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>
            {selectedSlot.aircraft} • {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
          </Text>
          <TouchableOpacity onPress={() => setSelectedSlot(null)}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {availableGrid.map(({ slot, rows }) => (
          <View key={slot} style={styles.slotCard}>
            <Text style={styles.slotTime}>{formatTime(slot)}</Text>
            <View style={styles.slotRows}>
              {rows.map((row) => (
                <TouchableOpacity
                  key={row.aircraftId}
                  style={[styles.row, row.isSelectable ? styles.rowAvailable : styles.rowUnavailable]}
                  disabled={!row.isSelectable}
                  onPress={() => handleSelect(slot, row.aircraftId, row.availableInstructors)}
                >
                  <View>
                    <Text style={styles.rowTitle}>{row.aircraftLabel}</Text>
                    <Text style={styles.rowSubtitle}>
                      {row.isSelectable
                        ? `${row.availableInstructors.length} instructor${row.availableInstructors.length === 1 ? "" : "s"} available`
                        : "Unavailable"}
                    </Text>
                  </View>
                  <Text style={[styles.badge, row.isSelectable ? styles.badgeOk : styles.badgeNo]}>
                    {row.isSelectable ? "Select" : "Busy"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Helpers
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

const timeToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const addMinutes = (time: string, mins: number) => minutesToTime(timeToMinutes(time) + mins);

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const isAircraftAvailable = (aircraftId: string, slotTime: string, flights: Flight[], selectedDate: Date) => {
  const slotMinutes = timeToMinutes(slotTime);
  const dayFlights = flights.filter(
    (f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"
  );
  const aircraftFlights = dayFlights.filter((flight) => flight.aircraft === aircraftId);
  return !aircraftFlights.some((flight) => {
    const startMinutes = timeToMinutes(flight.startTime);
    const endMinutes = timeToMinutes(flight.endTime);
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
};

const getAvailableInstructors = (
  aircraftId: string,
  slotTime: string,
  instructors: Instructor[],
  filteredInstructorIds: string[],
  flights: Flight[],
  selectedDate: Date
) => {
  const slotMinutes = timeToMinutes(slotTime);
  const dayFlights = flights.filter(
    (f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"
  );

  return filteredInstructorIds.filter((instructorId) => {
    const instructor = instructors.find((i) => i.id === instructorId);
    if (!instructor) return false;
    if (!instructor.authorizedAircraft?.includes(aircraftId)) return false;

    const instructorFlights = dayFlights.filter((flight) => flight.instructor === instructor.name);
    const isAvailable = !instructorFlights.some((flight) => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });

    return isAvailable;
  });
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  selectedCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ecfdf3",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#166534",
  },
  clearText: {
    color: "#166534",
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  slotCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  slotRows: {
    gap: 8,
  },
  row: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowAvailable: {
    backgroundColor: "#ecfdf3",
    borderColor: "#bbf7d0",
  },
  rowUnavailable: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#475569",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  badgeOk: {
    color: "#166534",
    backgroundColor: "#d1fae5",
  },
  badgeNo: {
    color: "#b91c1c",
    backgroundColor: "#fee2e2",
  },
});
