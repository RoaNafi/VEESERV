import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

const EBookingDetails = () => {
  const route = useRoute();
  const { booking } = route.params;

  const handleDelay = () => {
    Alert.alert('Delayed', 'You have delayed the response by 5 minutes.');
    // Optionally: Call backend to delay
  };

  const handleNextWorkshop = () => {
    Alert.alert('Moved', 'Request sent to next workshop.');
    // Optionally: Call backend to move to next workshop
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Emergency Booking Details</Text>

      <View style={styles.card}>
        <DetailRow label="Workshop" value={booking.workshop_name || 'N/A'} />
        <DetailRow label="Service" value={booking.service_name} />
        <DetailRow label="Price" value={`${booking.price ?? 0}₪`} />
        <DetailRow label="Requested At" value={new Date(booking.requested_datetime).toLocaleString()} />
        <DetailRow label="Vehicle" value={`${booking.vehicle_make} ${booking.vehicle_model}`} />

        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
        </View>

        {booking.status.toLowerCase() === 'pending' && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDelay}>
              <Text style={styles.actionText}>Delay 5 Minutes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.redBtn]} onPress={handleNextWorkshop}>
              <Text style={styles.actionText}>Move to Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#086189',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    color: '#555',
  },
  statusBox: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#086189',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  redBtn: {
    backgroundColor: '#dc3545',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EBookingDetails;
