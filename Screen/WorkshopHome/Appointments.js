import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Appointments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get('http://176.119.254.225:80/booking/Mechanic/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(res.data.bookings);
console.log('Bookings fetched successfully:', res.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{item.first_name}{item.last_name}</Text>
        <Text style={styles.title}>{item.service_name}</Text>
        <Text style={styles.subtitle}>{item.make} {item.model} ({item.year})</Text>
        <Text style={styles.dateTime}>
          {new Date(item.booking_date).toLocaleDateString()} at {item.scheduled_time}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item.booking_status) }]}>
          {item.booking_status.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#086189" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
keyExtractor={(item) => `${item.booking_id}-${item.service_id}`}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'accepted':
      return '#28a745';  // green
    case 'rejected':
      return '#dc3545';  // red
    case 'completed':
      return '#17a2b8';  // blue
    case 'cancelled':
      return '#6c757d';  // gray
    default:
      return '#ffc107';  // amber for pending
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#086189',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#086189',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
  },
  dateTime: {
    fontSize: 13,
    color: '#666',
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default Appointments;
