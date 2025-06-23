
import React, { useState, useEffect } from 'react';
 import book from '../../assets/booki.png';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const navigation = useNavigation();
 const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null); // can be string like "10:00 AM" or time string from picker
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [disabledSlots, setDisabledSlots] = useState([]); // Add this state for disabled slots
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [newDate, setNewDate] = useState(new Date());

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

  const handleEdit = (booking) => {
    const datetime = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
    const now = new Date();
    const diffHours = (datetime - now) / (1000 * 60 * 60);
    if (diffHours <= 12) {
      Alert.alert('Cannot edit', 'You can only edit bookings 12+ hours in advance.');
      return;
    }
    setSelectedBooking(booking);
    setNewDate(datetime);
    setModalVisible(true);
  };

  const saveChanges = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    await axios.patch(`http://176.119.254.225:80/booking/update/${selectedBooking.booking_id}`, {
      scheduled_date: newDate.toISOString().split('T')[0],
      scheduled_time: newDate.toTimeString().split(' ')[0].slice(0, 5) + ':00'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setModalVisible(false);
    Alert.alert('Success', 'Booking updated successfully.');
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to update booking.');
  }
};

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
              workshop_name: item.workshop_name,
              bookingId: item.booking_id,
              bookings: item.services,
              totalPrice: item.services.reduce((total, s) => total + s.price, 0),
              address: item.address,
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

      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
        <Text style={styles.editText}>Edit Booking</Text>
      </TouchableOpacity>
    </View>
  </View>
);
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

    {/* Modal */}
  <Modal visible={modalVisible} transparent animationType="slide">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
    <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Edit Date & Time</Text>

      <TouchableOpacity
        style={{
          padding: 12,
          backgroundColor: '#086189',
          borderRadius: 8,
          marginBottom: 10,
          alignItems: 'center',
        }}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Pick Date</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          padding: 12,
          backgroundColor: '#086189',
          borderRadius: 8,
          marginBottom: 20,
          alignItems: 'center',
        }}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>Pick Time</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', marginBottom: 10, fontWeight: '500' }}>
        Selected: {newDate.toLocaleString()}
      </Text>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        date={newDate}
        onConfirm={(d) => {
          const updatedDate = new Date(newDate);
          updatedDate.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
          setNewDate(updatedDate);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        themeVariant="light"
      />

      <DateTimePickerModal
        isVisible={showTimePicker}
        mode="time"
        is24Hour
        date={newDate}
        onConfirm={(t) => {
          const updatedDate = new Date(newDate);
          updatedDate.setHours(t.getHours(), t.getMinutes());
          setNewDate(updatedDate);
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
        themeVariant="light"
      />
<View style={styles.modalButtonRow}>
  <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
    <Text style={styles.saveButtonText}>Save Changes</Text>
  </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#ccc',
          alignItems: 'center',
        }}
      >
        <Text>Close</Text>
      </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

  </SafeAreaView>
);
};

const styles = StyleSheet.create({
 
  
  
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  serviceText: {
    fontSize: 14,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: '#086189',
    paddingVertical: 8,
    borderRadius: 5,
  },
  editText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
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
saveButton : {
  marginTop: 10,
  backgroundColor: '#086189',
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: 'center',
      width: '50%',

},
saveButtonText: {
  color: '#fff',  
  fontWeight: 'bold',
  fontSize: 16,
},
  cancelButton: {
    marginTop: 10,
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#333',
    fontSize: 16,
  },
  selectedDateText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
modalButtonRow : {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,    

},
dateText: {
    color: "#086189",
    fontWeight: "bold",
    fontSize: 16,
  },
  timeRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 4,
    minWidth: 90,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedSlot: {
    backgroundColor: "#086189",
    borderColor: "#086189",
  },
  timeText: {
    color: "#444",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
pickerButton: {
  backgroundColor: "#086189",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginVertical: 8,
  alignItems: "center",
},
pickerButtonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 16,
},


});

export default MyBookingsScreen;
