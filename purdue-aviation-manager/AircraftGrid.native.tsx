// @ts-nocheck
import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import type { Aircraft } from "./app/src/App.native";

interface AircraftGridProps {
  aircraft: Aircraft[];
}

export function AircraftGrid({ aircraft }: AircraftGridProps) {
  const sortedGroups = useMemo(() => {
    const grouped = aircraft.reduce((acc, plane) => {
      const isPPI = plane.registration?.includes("-PPI");
      const key = isPPI ? "PPI Aircraft" : plane.name || plane.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(plane);
      return acc;
    }, {} as Record<string, Aircraft[]>);

    return Object.entries(grouped).sort(([a], [b]) => {
      if (a === "PPI Aircraft") return 1;
      if (b === "PPI Aircraft") return -1;
      return a.localeCompare(b);
    });
  }, [aircraft]);

  if (!aircraft?.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>No aircraft available</Text>
        <Text style={styles.emptySubtitle}>Add aircraft to see them listed here.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.title}>Aircraft Fleet</Text>
        <Text style={styles.subtitle}>Available aircraft for training</Text>
      </View>

      <View style={styles.groupStack}>
        {sortedGroups.map(([groupName, planes]) => (
          <View key={groupName} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{groupName}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.planeList}>
              {planes.map((plane) => (
                <View key={plane.id} style={styles.planeRow}>
                  <View style={styles.planeMeta}>
                    <Text style={styles.planeReg}>{plane.registration}</Text>
                    <Text style={styles.planeType}>{plane.type}</Text>
                  </View>
                  <Badge tone={plane.status || "available"} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Badge({ tone }: { tone: string }) {
  const palette: Record<string, { bg: string; fg: string; label: string }> = {
    available: { bg: "#dcfce7", fg: "#166534", label: "Available" },
    maintenance: { bg: "#fef9c3", fg: "#854d0e", label: "Maintenance" },
    unavailable: { bg: "#fee2e2", fg: "#991b1b", label: "Unavailable" },
  };
  const colors = palette[tone] || { bg: "#e5e7eb", fg: "#111827", label: tone || "Unknown" };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}> 
      <Text style={[styles.badgeText, { color: colors.fg }]}>{colors.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  header: {
    gap: 4,
    marginBottom: 8,
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
  groupStack: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    paddingVertical: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  planeList: {
    gap: 10,
  },
  planeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planeMeta: {
    gap: 2,
  },
  planeReg: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  planeType: {
    fontSize: 13,
    color: "#6b7280",
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
  emptyWrap: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
