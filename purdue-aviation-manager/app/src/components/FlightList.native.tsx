// @ts-nocheck
import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import type { Flight } from '../App';

interface FlightListProps {
  flights: Flight[];
  onCancelFlight: (id: string, reason: string, comments: string) => void;
  onUpdateFlight: (flight: Flight) => void;
  currentUser?: string;
}

export function FlightList({ flights, onCancelFlight, onUpdateFlight, currentUser = 'You' }: FlightListProps) {
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [cancelingFlight, setCancelingFlight] = useState<Flight | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelComments, setCancelComments] = useState('');
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [previousExperience, setPreviousExperience] = useState(0);
  const [editedHobbsTimes, setEditedHobbsTimes] = useState<Record<string, number>>({});

  const upcomingFlights = flights
    .filter(f => f.date >= new Date(new Date().setHours(0, 0, 0, 0)) && f.status === 'scheduled')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastFlights = flights
    .filter(f => f.date < new Date(new Date().setHours(0, 0, 0, 0)) || f.status !== 'scheduled')
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalHours = pastFlights
    .filter(f => f.status === 'completed')
    .reduce((sum, f) => sum + (f.hobbsTime || 0), 0) + previousExperience;

  const handleCancelClick = (flight: Flight) => {
    setCancelingFlight(flight);
    setCancelReason('');
    setCancelComments('');
  };

  const handleCancelSubmit = () => {
    if (!cancelReason) return;
    setShowConfirmCancel(true);
  };

  const handleConfirmCancel = () => {
    if (cancelingFlight) {
      onCancelFlight(cancelingFlight.id, cancelReason, cancelComments);
      setCancelingFlight(null);
      setCancelReason('');
      setCancelComments('');
      setShowConfirmCancel(false);
    }
  };

  const handleEditClick = (flight: Flight) => {
    setEditingFlight({ ...flight });
  };

  const handleEditSave = () => {
    if (editingFlight) {
      onUpdateFlight(editingFlight);
      setEditingFlight(null);
    }
  };

  const handleHobbsChange = (flightId: string, value: string) => {
    const hobbsTime = parseFloat(value) || 0;
    setEditedHobbsTimes(prev => ({ ...prev, [flightId]: hobbsTime }));
    const flight = flights.find(f => f.id === flightId);
    if (flight) {
      onUpdateFlight({ ...flight, hobbsTime });
    }
  };

  const renderBadge = (text: string, color: string) => (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Upcoming Flights</Text>
      {upcomingFlights.length ? (
        upcomingFlights.map((flight) => (
          <View key={flight.id} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {flight.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={styles.muted}>{flight.startTime} - {flight.endTime}</Text>
                <Text style={styles.muted}>Aircraft: {flight.aircraft}</Text>
                <Text style={styles.muted}>Instructor: {flight.instructor}</Text>
              </View>
              {renderBadge(flight.type, flight.type === 'dual' ? '#dbeafe' : flight.type === 'solo' ? '#e2e8f0' : '#fee2e2')}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => handleEditClick(flight)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostButton} onPress={() => handleCancelClick(flight)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.muted}>No upcoming flights scheduled</Text>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Flight History</Text>
      {pastFlights.length ? (
        pastFlights.map((flight) => (
          <View key={flight.id} style={[styles.card, flight.status === 'cancelled' && styles.cardCancelled]}>
            <View style={styles.cardRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, flight.status === 'cancelled' && styles.lineThrough]}>
                  {flight.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={[styles.muted, flight.status === 'cancelled' && styles.lineThrough]}>
                  {flight.startTime} - {flight.endTime}
                </Text>
                <Text style={[styles.muted, flight.status === 'cancelled' && styles.lineThrough]}>
                  Aircraft: {flight.aircraft}
                </Text>
                <Text style={[styles.muted, flight.status === 'cancelled' && styles.lineThrough]}>
                  Instructor: {flight.instructor}
                </Text>
              </View>
              {renderBadge(flight.type, flight.type === 'dual' ? '#dbeafe' : flight.type === 'solo' ? '#e2e8f0' : '#fee2e2')}
            </View>
            {flight.status === 'completed' && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Hobbs Time</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={String(editedHobbsTimes[flight.id] ?? flight.hobbsTime ?? '')}
                  onChangeText={(text) => handleHobbsChange(flight.id, text)}
                  placeholder="0.0"
                />
              </View>
            )}
            {renderBadge(flight.status, flight.status === 'completed' ? '#dbeafe' : '#e2e8f0')}
          </View>
        ))
      ) : (
        <Text style={styles.muted}>No flight history</Text>
      )}

      <View style={[styles.card, { marginTop: 24 }]}>
        <Text style={styles.cardTitle}>Total Hours</Text>
        <Text style={styles.totalHours}>{totalHours.toFixed(1)}</Text>
        <Text style={styles.muted}>Flight Hours</Text>
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Add Previous Experience</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={previousExperience ? String(previousExperience) : ''}
            onChangeText={(text) => setPreviousExperience(parseFloat(text) || 0)}
            placeholder="0.0"
          />
        </View>
      </View>

      <Modal visible={!!editingFlight} transparent animationType="slide" onRequestClose={() => setEditingFlight(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Flight</Text>
            {editingFlight && (
              <>
                <Text style={styles.label}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  value={editingFlight.startTime}
                  onChangeText={(text) => setEditingFlight({ ...editingFlight, startTime: text })}
                  placeholder="HH:MM"
                />
                <Text style={[styles.label, { marginTop: 8 }]}>End Time</Text>
                <TextInput
                  style={styles.input}
                  value={editingFlight.endTime}
                  onChangeText={(text) => setEditingFlight({ ...editingFlight, endTime: text })}
                  placeholder="HH:MM"
                />
              </>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.ghostButton} onPress={() => setEditingFlight(null)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleEditSave}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!cancelingFlight} transparent animationType="slide" onRequestClose={() => setCancelingFlight(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Flight</Text>
            <Text style={styles.muted}>Please provide a reason</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Reason</Text>
            <TextInput
              style={styles.input}
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="Reason"
            />
            <Text style={[styles.label, { marginTop: 8 }]}>Comments</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={cancelComments}
              onChangeText={setCancelComments}
              placeholder="Optional"
              multiline
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.ghostButton} onPress={() => setCancelingFlight(null)}>
                <Text style={styles.buttonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, !cancelReason && styles.disabledButton]} onPress={handleCancelSubmit} disabled={!cancelReason}>
                <Text style={styles.buttonText}>Cancel Flight</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirmCancel} transparent animationType="fade" onRequestClose={() => setShowConfirmCancel(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.muted}>This will cancel your flight reservation.</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.ghostButton} onPress={() => setShowConfirmCancel(false)}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmCancel}>
                <Text style={styles.buttonText}>Yes, Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#0f172a' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  cardCancelled: { opacity: 0.6, backgroundColor: '#e2e8f0' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  muted: { color: '#475569', fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryButton: { flex: 1, backgroundColor: '#1d4ed8', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButton: { flex: 1, backgroundColor: '#e0f2fe', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  ghostButton: { flex: 1, backgroundColor: '#e2e8f0', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: '#0f172a', fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { color: '#0f172a', fontSize: 12, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 14, backgroundColor: '#fff' },
  totalHours: { fontSize: 32, fontWeight: '800', color: '#2563eb', marginTop: 8 },
  lineThrough: { textDecorationLine: 'line-through' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
});
