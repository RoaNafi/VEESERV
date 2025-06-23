import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const PindingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetched token:', token); // تحقق من صحة التوكن

      const res = await axios.get('http://176.119.254.225:80/booking/Mechanic/bookings/pending', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(res.data.bookings);
      console.log('Fetched bookings:', res.data.bookings); // تحقق من البيانات المسترجعة      
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetched token:', token); // تحقق من صحة التوكن

      await axios.put(`http://176.119.254.225:80/booking/${bookingId}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

   const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.subtitle}>Phone: {item.phone_number}</Text>
        <Text style={styles.title}>Service: {item.service_name}</Text>
        <Text style={styles.subtitle}>Car: {item.make} {item.model} ({item.year})</Text>
        <Text style={styles.subtitle}>Booking Date: {new Date(item.scheduled_date).toLocaleDateString()}</Text>
        <Text style={styles.statusText}>
          Status: 
          <Text style={{ fontWeight: '700', color: getStatusColor(item.booking_status) }}> {item.booking_status.toUpperCase()}</Text>
        </Text>
      </View>

      {item.booking_status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => updateStatus(item.booking_id, 'accepted')}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            onPress={() => updateStatus(item.booking_id, 'rejected')}
          >
            <Ionicons name="close-circle-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    // subtle shadow for iOS
    shadowColor: '#086189',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // elevation for Android
    elevation: 5,
  },
  info: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#086189',
  },
  subtitle: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  statusText: {
    marginTop: 6,
    fontSize: 15,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
    elevation: 2,
  },
  acceptButton: {
    backgroundColor: '#086189',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },
});
export default PindingRequests;
