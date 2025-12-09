// @ts-nocheck
import React from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import type { Instructor } from "./app/src/App.native";

interface InstructorProfileDialogProps {
  instructor: Instructor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstructorProfileDialog({ instructor, open, onOpenChange }: InstructorProfileDialogProps) {
  if (!instructor) return null;

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={() => onOpenChange(false)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{instructor.name}</Text>
              <Text style={styles.subtitle}>Certifications, contact info, and training capabilities</Text>
            </View>
            <TouchableOpacity onPress={() => onOpenChange(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Section title="Certifications">
              <View style={styles.badgeWrap}>
                {instructor.certifications.map((cert) => (
                  <View key={cert} style={styles.badge}>
                    <Text style={styles.badgeText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </Section>

            {(instructor.phone || instructor.email) && (
              <Section title="Contact Information">
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
              </Section>
            )}

            {instructor.trainingCapabilities?.length ? (
              <Section title="Training Capabilities">
                <View style={styles.listWrap}>
                  {instructor.trainingCapabilities.map((capability, idx) => (
                    <Text key={idx} style={styles.bulletItem}>
                      • {capability}
                    </Text>
                  ))}
                </View>
              </Section>
            ) : null}

            {instructor.authorizedAircraft?.length ? (
              <Section title="Authorized Aircraft">
                <View style={styles.badgeWrap}>
                  {instructor.authorizedAircraft.map((aircraft, idx) => (
                    <View key={idx} style={[styles.badge, styles.badgeOutline]}>
                      <Text style={[styles.badgeText, styles.badgeTextDark]}>{aircraft}</Text>
                    </View>
                  ))}
                </View>
              </Section>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "85%",
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
  content: {
    paddingBottom: 20,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
  badgeOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badgeTextDark: {
    color: "#0f172a",
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
  listWrap: {
    gap: 6,
  },
  bulletItem: {
    fontSize: 13,
    color: "#0f172a",
  },
});
