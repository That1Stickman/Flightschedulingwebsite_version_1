// @ts-nocheck
import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import type { Flight, Aircraft, Instructor } from "../App.native";

interface MasterScheduleProps {
  selectedDate: Date;
  flights: Flight[];
  aircraft: Aircraft[];
  instructors: Instructor[];
  currentUser?: string;
  onDateChange?: (date: Date) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  standard: { bg: "#3b82f6", fg: "#fff" },
  unavailable: { bg: "#9ca3af", fg: "#fff" },
  "spin-training": { bg: "#22c55e", fg: "#fff" },
  "photo-flight": { bg: "#ec4899", fg: "#fff" },
  "new-student": { bg: "#e5e7eb", fg: "#111827" },
  meeting: { bg: "#374151", fg: "#fff" },
  maintenance: { bg: "#dc2626", fg: "#fff" },
  "in-office": { bg: "#fef3c7", fg: "#78350f" },
  "h6-operations": { bg: "#f97316", fg: "#fff" },
  groundschool: { bg: "#a855f7", fg: "#fff" },
  "ground-instruction": { bg: "#facc15", fg: "#1f2937" },
  "aircraft-checkout": { bg: "#14b8a6", fg: "#fff" },
  "down-time": { bg: "#cbd5e1", fg: "#1f2937" },
  "checkride-category": { bg: "#4f46e5", fg: "#fff" },
  bfr: { bg: "#06b6d4", fg: "#fff" },
};

const LEGEND_ITEMS = [
  { key: "standard", label: "Standard" },
  { key: "unavailable", label: "Unavailable" },
  { key: "spin-training", label: "Spin Training" },
  { key: "photo-flight", label: "Photo Flight" },
  { key: "new-student", label: "New Student" },
  { key: "meeting", label: "Meeting" },
  { key: "maintenance", label: "Maintenance" },
  { key: "in-office", label: "In Office" },
  { key: "ground-instruction", label: "Ground Instruction" },
  { key: "checkride-category", label: "Checkride" },
];

export function MasterSchedule({ selectedDate, flights, aircraft, instructors }: MasterScheduleProps) {
  const dayFlights = useMemo(
    () => flights.filter((f) => f.date.toDateString() === selectedDate.toDateString() && f.status !== "cancelled"),
    [flights, selectedDate]
  );

  const flightsByAircraft = useMemo(() => {
    const map: Record<string, Flight[]> = {};
    dayFlights.forEach((f) => {
      if (!map[f.aircraft]) map[f.aircraft] = [];
      map[f.aircraft].push(f);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)));
    return map;
  }, [dayFlights]);

  const flightsByInstructor = useMemo(() => {
    const map: Record<string, Flight[]> = {};
    dayFlights.forEach((f) => {
      if (!map[f.instructor]) map[f.instructor] = [];
      map[f.instructor].push(f);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)));
    return map;
  }, [dayFlights]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Master Schedule</Text>
      <Text style={styles.subtitle}>
        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
      </Text>

      <View style={styles.legend}>
        {LEGEND_ITEMS.map((item) => {
          const palette = CATEGORY_COLORS[item.key] || { bg: "#e5e7eb", fg: "#111827" };
          return (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: palette.bg }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      <Section title="By Aircraft">
        <View style={styles.listStack}>
          {aircraft.map((plane) => {
            const list = flightsByAircraft[plane.registration] || [];
            return (
              <View key={plane.id} style={styles.card}>
                <Text style={styles.cardTitle}>{plane.registration}</Text>
                <Text style={styles.cardSubtitle}>{plane.type}</Text>
                {list.length === 0 ? (
                  <Text style={styles.muted}>No flights</Text>
                ) : (
                  list.map((flight) => <FlightRow key={flight.id} flight={flight} />)
                )}
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="By Instructor">
        <View style={styles.listStack}>
          {instructors.map((inst) => {
            const list = flightsByInstructor[inst.name] || [];
            return (
              <View key={inst.id} style={styles.card}>
                <Text style={styles.cardTitle}>{inst.name}</Text>
                <Text style={styles.cardSubtitle}>{inst.certifications?.join(", ")}</Text>
                {list.length === 0 ? (
                  <Text style={styles.muted}>No flights</Text>
                ) : (
                  list.map((flight) => <FlightRow key={flight.id} flight={flight} />)
                )}
              </View>
            );
          })}
        </View>
      </Section>
    </ScrollView>
  );
}

function FlightRow({ flight }: { flight: Flight }) {
  const palette = CATEGORY_COLORS[flight.flightCategory || "standard"] || CATEGORY_COLORS.standard;
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: palette.bg }]}>
        <Text style={[styles.badgeText, { color: palette.fg }]}>{flight.type}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>
          {formatTime(flight.startTime)} - {formatTime(flight.endTime)}
        </Text>
        <Text style={styles.rowSubtitle}>
          Student: {flight.student} • Instructor: {flight.instructor}
        </Text>
      </View>
    </View>
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

const timeToMinutes = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendSwatch: {
    width: 14,
    height: 10,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: "#0f172a",
  },
  section: {
    gap: 8,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  listStack: {
    gap: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#475569",
  },
  muted: {
    fontSize: 13,
    color: "#94a3b8",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
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
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
