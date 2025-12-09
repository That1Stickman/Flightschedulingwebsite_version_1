// @ts-nocheck
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { FilterDialog } from "./FilterDialog.native";
import type { Flight, Aircraft, Instructor } from "../App.native";

type ViewMode = "combined" | "aircraft" | "instructor";

interface TimelineViewProps {
  selectedDate: Date;
  flights: Flight[];
  aircraft: Aircraft[];
  instructors: Instructor[];
  onTimeSlotClick: (startTime: string, endTime?: string) => void;
  onFilterChange?: (aircraftIds: string[], instructorIds: string[]) => void;
}

interface SelectedRange {
  start: string;
  end: string;
}

export function TimelineView({
  selectedDate,
  flights,
  aircraft,
  instructors,
  onTimeSlotClick,
  onFilterChange,
}: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("combined");
  const [selectedAircraftFilter, setSelectedAircraftFilter] = useState<string[]>([]);
  const [selectedInstructorFilter, setSelectedInstructorFilter] = useState<string[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      }
    }
    return slots;
  }, []);

  const dayFlights = useMemo(
    () => flights.filter((f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"),
    [flights, selectedDate]
  );

  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const addMinutes = (timeString: string, minutesToAdd: number) => {
    const total = timeToMinutes(timeString) + minutesToAdd;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  const isTimeSlotInPast = (slotTime: string) => {
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hours, minutes] = slotTime.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < now;
  };

  const isSlotInRange = (slot: string, range: SelectedRange | null) => {
    if (!range) return false;
    const slotMinutes = timeToMinutes(slot);
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end);
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  };

  const getFlightsAtTime = (slotTime: string) => {
    const slotMinutes = timeToMinutes(slotTime);
    return dayFlights.filter((flight) => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  const getResourceFlight = (slotTime: string, resourceId: string, resourceType: "aircraft" | "instructor") => {
    const slotMinutes = timeToMinutes(slotTime);
    const resourceFlights = dayFlights.filter((flight) =>
      resourceType === "aircraft" ? flight.aircraft === resourceId : flight.instructor === resourceId
    );

    return resourceFlights.find((flight) => {
      const startMinutes = timeToMinutes(flight.startTime);
      const endMinutes = timeToMinutes(flight.endTime);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });
  };

  const isResourceAvailable = (slotTime: string, resourceId: string, resourceType: "aircraft" | "instructor") => {
    return !getResourceFlight(slotTime, resourceId, resourceType);
  };

  const filteredAircraft = useMemo(
    () => (selectedAircraftFilter.length ? aircraft.filter((a) => selectedAircraftFilter.includes(a.registration)) : aircraft),
    [aircraft, selectedAircraftFilter]
  );

  const filteredInstructors = useMemo(
    () => (selectedInstructorFilter.length ? instructors.filter((i) => selectedInstructorFilter.includes(i.id)) : instructors),
    [instructors, selectedInstructorFilter]
  );

  const handleApplyFilter = (aircraftReg: string[], instructorIds: string[]) => {
    setSelectedAircraftFilter(aircraftReg);
    setSelectedInstructorFilter(instructorIds);

    if (aircraftReg.length > 0 && instructorIds.length === 0) setViewMode("aircraft");
    else if (instructorIds.length > 0 && aircraftReg.length === 0) setViewMode("instructor");
    else setViewMode("combined");

    onFilterChange?.(aircraftReg, instructorIds);
  };

  const clearFilters = () => {
    setSelectedAircraftFilter([]);
    setSelectedInstructorFilter([]);
    setViewMode("combined");
  };

  const clearSelection = () => {
    setPendingStart(null);
    setSelectedRange(null);
  };

  const handleSlotPress = (slotTime: string) => {
    if (isTimeSlotInPast(slotTime)) return;

    if (!pendingStart) {
      setPendingStart(slotTime);
      setSelectedRange({ start: slotTime, end: addMinutes(slotTime, 30) });
      return;
    }

    const startMinutes = timeToMinutes(pendingStart);
    const endMinutes = timeToMinutes(slotTime);
    const actualStart = startMinutes <= endMinutes ? pendingStart : slotTime;
    const actualEndBase = startMinutes <= endMinutes ? slotTime : pendingStart;
    const actualEnd = addMinutes(actualEndBase, 30);

    setSelectedRange({ start: actualStart, end: actualEnd });
    setPendingStart(null);
    onTimeSlotClick(actualStart, actualEnd);
  };

  const hasActiveFilters = selectedAircraftFilter.length > 0 || selectedInstructorFilter.length > 0;

  const renderCombinedView = () => (
    <View style={styles.sectionBox}>
      {timeSlots.map((slot) => {
        const flightsAtSlot = getFlightsAtTime(slot);
        const inRange = isSlotInRange(slot, selectedRange);
        const inPast = isTimeSlotInPast(slot);
        const availableAircraftCount = filteredAircraft.filter((a) => isResourceAvailable(slot, a.registration, "aircraft")).length;
        const availableInstructorCount = filteredInstructors.filter((i) => isResourceAvailable(slot, i.name, "instructor")).length;

        return (
          <TouchableOpacity
            key={slot}
            onPress={() => handleSlotPress(slot)}
            disabled={inPast}
            style={[styles.slotRow, inRange && styles.slotRowActive, inPast && styles.slotRowDisabled]}
          >
            <View style={styles.slotLeft}>
              <Text style={[styles.timeText, inPast && styles.textMuted]}>{formatTime(slot)}</Text>
              <Text style={styles.subtleText}>
                {availableAircraftCount} aircraft • {availableInstructorCount} instructors
              </Text>
            </View>
            <View style={styles.slotRight}>
              {flightsAtSlot.length === 0 ? (
                <Text style={styles.availableText}>Open</Text>
              ) : (
                <View style={styles.flightTags}>
                  {flightsAtSlot.slice(0, 2).map((f) => (
                    <Text key={f.id} style={styles.flightTag}>{`${f.aircraft} • ${f.instructor}`}</Text>
                  ))}
                  {flightsAtSlot.length > 2 && <Text style={styles.flightTag}>+{flightsAtSlot.length - 2} more</Text>}
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderResourceBlock = (
    items: (Aircraft | Instructor)[],
    resourceType: "aircraft" | "instructor",
    renderHeader: (item: any) => React.ReactNode
  ) => (
    <View style={styles.sectionBox}>
      {items.map((item) => {
        const id = resourceType === "aircraft" ? (item as Aircraft).registration : (item as Instructor).name;
        const resourceFlights = dayFlights
          .filter((f) => (resourceType === "aircraft" ? f.aircraft === id : f.instructor === id))
          .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

        const firstOpen = timeSlots.find(
          (slot) => isResourceAvailable(slot, id, resourceType) && !isTimeSlotInPast(slot)
        );

        return (
          <View key={id} style={styles.card}>
            {renderHeader(item)}
            <View style={styles.cardBody}>
              {resourceFlights.length === 0 ? (
                <Text style={styles.subtleText}>No flights scheduled</Text>
              ) : (
                resourceFlights.map((flight) => (
                  <View key={flight.id} style={styles.flightRow}>
                    <Text style={styles.flightTime}>{`${formatTime(flight.startTime)} - ${formatTime(flight.endTime)}`}</Text>
                    <Text style={styles.flightMeta}>
                      {resourceType === "aircraft" ? flight.instructor : flight.aircraft} • {flight.student}
                    </Text>
                  </View>
                ))
              )}
              {firstOpen && (
                <TouchableOpacity style={styles.quickBtn} onPress={() => handleSlotPress(firstOpen)}>
                  <Text style={styles.quickBtnText}>Next open: {formatTime(firstOpen)}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Timeline</Text>
          <Text style={styles.subtitle}>
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </Text>
          <Text style={styles.helper}>
            {pendingStart
              ? "Tap another time to set the end of your range."
              : "Tap a time to start a selection, then tap again to set the end."}
          </Text>
          {selectedRange && (
            <Text style={styles.selectionText}>
              Selected: {formatTime(selectedRange.start)} - {formatTime(selectedRange.end)}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.smallBtn} onPress={() => setIsFilterDialogOpen(true)}>
          <Text style={styles.smallBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.pillGroup}>
          {["combined", "aircraft", "instructor"].map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setViewMode(mode as ViewMode)}
              style={[styles.pill, viewMode === mode && styles.pillActive]}
            >
              <Text style={[styles.pillText, viewMode === mode && styles.pillTextActive]}>{mode}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.toolbarRight}>
          {hasActiveFilters && (
            <TouchableOpacity style={styles.linkBtn} onPress={clearFilters}>
              <Text style={styles.linkText}>Clear filters</Text>
            </TouchableOpacity>
          )}
          {selectedRange && (
            <TouchableOpacity style={styles.linkBtn} onPress={clearSelection}>
              <Text style={styles.linkText}>Clear selection</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {viewMode === "combined" && renderCombinedView()}
        {viewMode === "aircraft" && renderResourceBlock(filteredAircraft, "aircraft", (plane: Aircraft) => (
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{plane.registration}</Text>
            <Text style={styles.cardSubtitle}>{plane.type} • {plane.name}</Text>
          </View>
        ))}
        {viewMode === "instructor" && renderResourceBlock(filteredInstructors, "instructor", (inst: Instructor) => (
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{inst.name}</Text>
            <Text style={styles.cardSubtitle}>{inst.certifications.join(", ")}</Text>
          </View>
        ))}
      </ScrollView>

      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        aircraft={aircraft}
        instructors={instructors}
        flights={flights}
        selectedDate={selectedDate}
        currentUser="You"
        onApplyFilter={handleApplyFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
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
  helper: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  selectionText: {
    fontSize: 13,
    color: "#0f172a",
    marginTop: 6,
    fontWeight: "600",
  },
  smallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0ea5e9",
  },
  smallBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  pillGroup: {
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
  pillActive: {
    backgroundColor: "#e0f2fe",
    borderColor: "#0ea5e9",
  },
  pillText: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#0ea5e9",
  },
  toolbarRight: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  linkBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  linkText: {
    color: "#0ea5e9",
    fontSize: 13,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  slotRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotRowActive: {
    backgroundColor: "#e0f2fe",
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5e9",
  },
  slotRowDisabled: {
    backgroundColor: "#f1f5f9",
  },
  slotLeft: {
    flex: 1,
    gap: 2,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtleText: {
    fontSize: 13,
    color: "#64748b",
  },
  slotRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  availableText: {
    color: "#16a34a",
    fontWeight: "700",
  },
  flightTags: {
    alignItems: "flex-end",
    gap: 4,
  },
  flightTag: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#0f172a",
    fontSize: 12,
  },
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
    padding: 14,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#475569",
  },
  cardBody: {
    gap: 8,
  },
  flightRow: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  flightTime: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  flightMeta: {
    fontSize: 13,
    color: "#475569",
    marginTop: 4,
  },
  quickBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  quickBtnText: {
    color: "#92400e",
    fontWeight: "700",
    fontSize: 13,
  },
  textMuted: {
    color: "#94a3b8",
  },
});
