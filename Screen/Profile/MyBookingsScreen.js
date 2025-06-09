import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons'; // icons!
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import book from '../../assets/booki.png';
import { useNavigation } from '@react-navigation/native';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await axios.get('http://176.119.254.225:80/booking/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
        console.log(res.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);


 const groupedBookings = bookings.reduce((acc, booking) => {
  const key = `${booking.vehicle_id}-${booking.scheduled_date}-${booking.workshop_name}`;

  if (!acc[key]) {
    acc[key] = {
      ...booking,
      services: [{
        service_name: booking.service_name,
        price: booking.price,
        scheduled_time: booking.scheduled_time
      }],
    };
  } else {
    acc[key].services.push({
      service_name: booking.service_name,
      price: booking.price,
      scheduled_time: booking.scheduled_time
    });
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
            {service.service_name} - {service.price}₪ at {service.scheduled_time}
          </Text>
        </View>
      ))}

      <Text style={styles.status}>Status: {item.booking_status}</Text>
      <Text style={styles.date}>Scheduled: {item.scheduled_date}</Text>

      {item.booking_status === 'accepted' && (
        <TouchableOpacity
          style={styles.payNowButton}
          onPress={() => {
            navigation.navigate('Payment', {
              workshop_name:item.workshop_name,
              bookingId:item.booking_id,
              bookings: item.services,
              totalPrice: item.services.reduce((total, s) => total + s.price, 0),
              address: item.address,  // Optional: make sure it's available
              selectedCar: {
                make: item.make,
                model: item.model,
                year: item.year,
                vehicle_id: item.vehicle_id,
              },
              date: item.scheduled_date,
              timeSlots: item.services.map(s => s.scheduled_time),
            });
          }}
        >
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);


  if (loading) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>My Bookings</Text>
      <View style={styles.headerDivider} />
      <ActivityIndicator size="large" color="#086189" style={{ flex: 1 }} />
    </SafeAreaView>
  );

  if (bookingsArray.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerDivider} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubText}>Once you book a service, it'll show up here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>My Bookings</Text>
      <View style={styles.headerDivider} />
      <FlatList
        data={bookingsArray}
        keyExtractor={item => `${item.booking_id}-${item.scheduled_date}-${item.scheduled_time}`}
        renderItem={renderBooking}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#086189",
    marginBottom: 12,
    paddingLeft: 8,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
    width: '100%',
  },
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
  payNowButton: {
  marginTop: 10,
  backgroundColor: '#086189',
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: 'center',
},

payNowText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});


export default MyBookingsScreen;