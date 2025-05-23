import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons'; // icons!
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import book from '../assets/booki.png';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get('http://176.119.254.225:80/booking/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);


  // Group bookings by vehicle_id + scheduled_date + scheduled_time
  const groupedBookings = bookings.reduce((acc, booking) => {
    const key = `${booking.vehicle_id}-${booking.scheduled_date}-${booking.scheduled_time}`;

    if (!acc[key]) {
      acc[key] = {
        ...booking,
        services: [{ service_name: booking.service_name, price: booking.price }],
      };
    } else {
      acc[key].services.push({ service_name: booking.service_name, price: booking.price });
    }

    return acc;
  }, {});

  const bookingsArray = Object.values(groupedBookings);

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
     <Image source={book} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.title}>{item.workshop_name}</Text>
        <Text style={styles.car}>{item.make} {item.model} ({item.year})</Text>

        {item.services.map((service, index) => (
          <View key={index} style={styles.serviceRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#086189" />
            <Text style={styles.serviceText}>
              {service.service_name} - {service.price}₪
            </Text>
          </View>
        ))}

        <Text style={styles.status}>Status: {item.booking_status}</Text>
        <Text style={styles.date}>Scheduled: {item.scheduled_date} {item.scheduled_time}</Text>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#086189" style={{ flex: 1 }} />;

  if (bookingsArray.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bookings yet</Text>
        <Text style={styles.emptySubText}>Once you book a service, it’ll show up here.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={bookingsArray}
      keyExtractor={item => `${item.booking_id}-${item.scheduled_date}-${item.scheduled_time}`}
      renderItem={renderBooking}
  contentContainerStyle={{ padding: 16, paddingTop: 75 }}  // <-- extra top padding here
    />
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 16,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
    color: '#086189',
  },
  car: {
    color: '#333',
    marginTop: 6,
    fontSize: 15,
    fontWeight: '500',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  serviceText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
    fontWeight: '400',
  },
  status: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#228B22',  // green for active or good vibes, can adjust dynamically
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
   emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#086189',
  },
  emptySubText: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});


export default MyBookingsScreen;