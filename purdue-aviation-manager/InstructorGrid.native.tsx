// @ts-nocheck
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import type { Instructor } from "./app/src/App.native";
import { InstructorProfileDialog } from "./InstructorProfileDialog.native";

interface InstructorGridProps {
  instructors: Instructor[];
}

export function InstructorGrid({ instructors }: InstructorGridProps) {
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const items = useMemo(() => instructors, [instructors]);

  const handleInstructorClick = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsDialogOpen(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Certified Flight Instructors</Text>
        <Text style={styles.subtitle}>Tap an instructor to view their profile</Text>
      </View>

      <View style={styles.grid}>
        {items.map((instructor) => (
          <TouchableOpacity key={instructor.id} style={styles.card} onPress={() => handleInstructorClick(instructor)}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(instructor.name)}</Text>
              </View>
              <Text style={styles.cardTitle}>{instructor.name}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Certifications</Text>
              <View style={styles.badgeWrap}>
                {instructor.certifications.map((cert) => (
                  <View key={cert} style={styles.badge}>
                    <Text style={styles.badgeText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>

            {instructor.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{instructor.phone}</Text>
              </View>
            )}

            {instructor.email && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{instructor.email}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <InstructorProfileDialog instructor={selectedInstructor} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </ScrollView>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
    marginBottom: 4,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    flexWrap: "wrap",
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "700",
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
  },
  badgeText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: "#475569",
  },
  infoValue: {
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "700",
  },
});
