// @ts-nocheck
import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import type { Aircraft, Instructor, Flight } from "./app/src/App.native";

type FilterMode = "aircraft-first" | "instructor-first" | null;
type Step = "select-mode" | "select-primary" | "select-secondary";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aircraft: Aircraft[];
  instructors: Instructor[];
  flights: Flight[];
  selectedDate: Date;
  currentUser: string;
  onApplyFilter: (selectedAircraft: string[], selectedInstructors: string[]) => void;
}

export function FilterDialog({
  open,
  onOpenChange,
  aircraft,
  instructors,
  flights,
  selectedDate,
  currentUser,
  onApplyFilter,
}: FilterDialogProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>(null);
  const [step, setStep] = useState<Step>("select-mode");
  const [selectedAircraft, setSelectedAircraft] = useState<string[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);

  const handleReset = () => {
    setFilterMode(null);
    setStep("select-mode");
    setSelectedAircraft([]);
    setSelectedInstructors([]);
  };

  const handleModeSelect = (mode: FilterMode) => {
    setFilterMode(mode);
    setStep("select-primary");
  };

  const handlePrimaryNext = () => {
    if (filterMode === "aircraft-first" && selectedAircraft.length > 0) {
      setStep("select-secondary");
    } else if (filterMode === "instructor-first" && selectedInstructors.length > 0) {
      setStep("select-secondary");
    }
  };

  const handleApply = () => {
    onApplyFilter(selectedAircraft, selectedInstructors);
    onOpenChange(false);
    handleReset();
  };

  const handleCancel = () => {
    onOpenChange(false);
    handleReset();
  };

  const toggleAircraftSelection = (registration: string) => {
    setSelectedAircraft((prev) =>
      prev.includes(registration) ? prev.filter((r) => r !== registration) : [...prev, registration]
    );
  };

  const toggleInstructorSelection = (id: string) => {
    setSelectedInstructors((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const getAvailableAircraft = useMemo(() => {
    if (step === "select-secondary" && filterMode === "instructor-first") {
      return aircraft.filter((ac) =>
        selectedInstructors.some((instructorId) => {
          const instructor = instructors.find((i) => i.id === instructorId);
          return instructor?.authorizedAircraft?.includes(ac.registration);
        })
      );
    }
    return aircraft;
  }, [aircraft, filterMode, instructors, selectedInstructors, step]);

  const getAvailableInstructors = useMemo(() => {
    if (step === "select-secondary" && filterMode === "aircraft-first") {
      return instructors.filter((instructor) =>
        instructor.authorizedAircraft?.some((reg) => selectedAircraft.includes(reg))
      );
    }
    return instructors;
  }, [filterMode, instructors, selectedAircraft, step]);

  if (!open) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Find an Opening</Text>
        <Text style={styles.subtitle}>
          {step === "select-mode" && "Choose whether to filter by aircraft or instructors first"}
          {step === "select-primary" && filterMode === "aircraft-first" && "Select aircraft you want to view"}
          {step === "select-primary" && filterMode === "instructor-first" && "Select instructors you want to view"}
          {step === "select-secondary" && filterMode === "aircraft-first" && "Select instructors for the chosen aircraft"}
          {step === "select-secondary" && filterMode === "instructor-first" && "Select aircraft for the chosen instructors"}
        </Text>

        <ScrollView contentContainerStyle={styles.content}>
          {step === "select-mode" && (
            <View style={styles.row}>
              <SelectableCard
                label="Filter by Aircraft First"
                description="Select aircraft, then see available instructors"
                onPress={() => handleModeSelect("aircraft-first")}
                active={filterMode === "aircraft-first"}
              />
              <SelectableCard
                label="Filter by Instructors First"
                description="Select instructors, then see available aircraft"
                onPress={() => handleModeSelect("instructor-first")}
                active={filterMode === "instructor-first"}
              />
            </View>
          )}

          {(step === "select-primary" || step === "select-secondary") && (
            <View style={styles.column}>
              <Text style={styles.sectionHeader}>
                {(step === "select-primary" && filterMode === "aircraft-first" && "Available Aircraft") ||
                  (step === "select-primary" && filterMode === "instructor-first" && "Available Instructors") ||
                  (step === "select-secondary" && filterMode === "aircraft-first" && "Available Instructors") ||
                  (step === "select-secondary" && filterMode === "instructor-first" && "Available Aircraft")}
              </Text>

              {/* Available list */}
              {((step === "select-primary" && filterMode === "aircraft-first") ||
                (step === "select-secondary" && filterMode === "instructor-first")) && (
                <CardList
                  items={getAvailableAircraft}
                  renderLabel={(ac) => ac.registration}
                  isSelected={(ac) => selectedAircraft.includes(ac.registration)}
                  onToggle={(ac) => toggleAircraftSelection(ac.registration)}
                />
              )}

              {((step === "select-primary" && filterMode === "instructor-first") ||
                (step === "select-secondary" && filterMode === "aircraft-first")) && (
                <CardList
                  items={getAvailableInstructors}
                  renderLabel={(i) => i.name}
                  isSelected={(i) => selectedInstructors.includes(i.id)}
                  onToggle={(i) => toggleInstructorSelection(i.id)}
                />
              )}

              <Text style={styles.sectionHeader}>
                {(step === "select-primary" && filterMode === "aircraft-first" && "Selected Aircraft") ||
                  (step === "select-primary" && filterMode === "instructor-first" && "Selected Instructors") ||
                  (step === "select-secondary" && filterMode === "aircraft-first" && "Selected Instructors") ||
                  (step === "select-secondary" && filterMode === "instructor-first" && "Selected Aircraft")}
              </Text>

              {((step === "select-primary" && filterMode === "aircraft-first") ||
                (step === "select-secondary" && filterMode === "instructor-first")) && (
                <SelectedList
                  items={selectedAircraft}
                  emptyLabel="No aircraft selected"
                  onToggle={toggleAircraftSelection}
                />
              )}

              {((step === "select-primary" && filterMode === "instructor-first") ||
                (step === "select-secondary" && filterMode === "aircraft-first")) && (
                <SelectedList
                  items={selectedInstructors.map((id) => instructors.find((i) => i.id === id)?.name || id)}
                  emptyLabel="No instructors selected"
                  onToggle={(name) => {
                    const inst = instructors.find((i) => i.name === name || i.id === name);
                    if (inst) toggleInstructorSelection(inst.id);
                  }}
                />
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step === "select-mode" && <SecondaryButton label="Cancel" onPress={handleCancel} />}

          {step === "select-primary" && (
            <View style={styles.footerRow}>
              <SecondaryButton label="Back" onPress={handleReset} />
              <PrimaryButton
                label="Next"
                disabled={
                  (filterMode === "aircraft-first" && selectedAircraft.length === 0) ||
                  (filterMode === "instructor-first" && selectedInstructors.length === 0)
                }
                onPress={handlePrimaryNext}
              />
            </View>
          )}

          {step === "select-secondary" && (
            <View style={styles.footerRow}>
              <SecondaryButton label="Back" onPress={() => setStep("select-primary")} />
              <PrimaryButton label="Apply" onPress={handleApply} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function SelectableCard({ label, description, onPress, active }: { label: string; description: string; onPress: () => void; active: boolean }) {
  return (
    <TouchableOpacity style={[styles.card, active && styles.cardActive]} onPress={onPress}>
      <Text style={styles.cardTitle}>{label}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </TouchableOpacity>
  );
}

function CardList<T>({ items, renderLabel, isSelected, onToggle }: { items: T[]; renderLabel: (item: T) => string; isSelected: (item: T) => boolean; onToggle: (item: T) => void }) {
  return (
    <View style={styles.listBox}>
      {items.map((item, idx) => {
        const active = isSelected(item);
        const label = renderLabel(item);
        return (
          <TouchableOpacity key={idx} style={[styles.listRow, active && styles.listRowActive]} onPress={() => onToggle(item)}>
            <Text style={[styles.listText, active && styles.listTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SelectedList({ items, emptyLabel, onToggle }: { items: string[]; emptyLabel: string; onToggle: (id: string) => void }) {
  if (!items.length) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }
  return (
    <View style={styles.listBox}>
      {items.map((id, idx) => (
        <TouchableOpacity key={idx} style={styles.listRow} onPress={() => onToggle(id)}>
          <Text style={styles.listText}>{id}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity style={[styles.primaryBtn, disabled && styles.primaryBtnDisabled]} onPress={disabled ? undefined : onPress} disabled={disabled}>
      <Text style={[styles.primaryBtnText, disabled && styles.primaryBtnTextDisabled]}>{label}</Text>
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

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    maxHeight: "90%",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    gap: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    gap: 6,
  },
  cardActive: {
    borderColor: "#1d4ed8",
    backgroundColor: "#dbeafe",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardDescription: {
    fontSize: 13,
    color: "#475569",
  },
  listBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  listRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  listRowActive: {
    backgroundColor: "#f1f5f9",
  },
  listText: {
    fontSize: 14,
    color: "#0f172a",
  },
  listTextActive: {
    color: "#1d4ed8",
    fontWeight: "700",
  },
  emptyBox: {
    padding: 12,
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  footer: {
    marginTop: 12,
    gap: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  primaryBtnText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtnTextDisabled: {
    color: "#e2e8f0",
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
  },
});
