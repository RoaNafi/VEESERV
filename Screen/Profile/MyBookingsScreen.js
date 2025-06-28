
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
  TextInput,

  TouchableWithoutFeedback,
  Keyboard,
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
const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
const [rating, setRating] = useState(0);
const [feedbackText, setFeedbackText] = useState('');
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

// 🧠 FEEDBACK SUBMIT HANDLER
const handleSubmitFeedback = async () => {
  if (!selectedBooking || !rating || !feedbackText) {
    alert("Please provide both a rating and a comment");
    return;
  }
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await axios.post('http://176.119.254.225:80/review/review', {
      workshopId: selectedBooking.workshop_id,
      serviceId: selectedBooking.services[0]?.service_id || selectedBooking.service_id,
      rating,
      comment: feedbackText,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
     console.log('Feedback submitted:', res.data);
    alert("Thank you for your feedback!");
    setFeedbackModalVisible(false);
    setFeedbackText('');
    setRating(0);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert("Failed to submit feedback");
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

      {(item.booking_status === 'complete paid') && (
        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={() => {
            setSelectedBooking(item);
            setFeedbackModalVisible(true);
          }}
        >
          <Text style={styles.feedbackText}>Leave Feedback</Text>
        </TouchableOpacity>
      )}
      {(item.booking_status !== 'complete paid' || item.booking_status === 'pending' || item.status_name === 'not started') && (
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.editText}>Edit Booking</Text>
        </TouchableOpacity>
      )}
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

    <Modal visible={modalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit Date & Time</Text>

          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerButtonText}>Pick Date</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.pickerButtonText}>Pick Time</Text>
          </TouchableOpacity>

          <Text style={styles.selectedDateText}>Selected: {newDate.toLocaleString()}</Text>

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

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    <Modal
      visible={isFeedbackModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setFeedbackModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Rate your Experience</Text>

          <TextInput
            placeholder="Write your feedback..."
            style={styles.commentInput}
            multiline
            value={feedbackText}
            onChangeText={setFeedbackText}
          />

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={30}
                  color={star <= rating ? '#FFD700' : '#aaa'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setFeedbackModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </SafeAreaView>
);

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: '#f5f8fa', // خفيف وحلو للباكجراوند
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#086189",
    marginBottom: 12,
    paddingLeft: 8,
    letterSpacing: 1, // راحة بالعين
  },

  headerDivider: {
    height: 1,
    backgroundColor: '#d1d9e6', // فاتح شوي أكتر عشان نظيف
    marginBottom: 20,
    width: '100%',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0', // هادي وناعمة
  },

  image: {
    width: 95,
    height: 95,
    borderRadius: 18,
    marginRight: 18,
    resizeMode: 'cover',
  },

  details: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontWeight: '700',
    fontSize: 22,
    color: '#086189',
    letterSpacing: 0.5,
  },

  car: {
    color: '#444',
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 6,
  },

  serviceText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
  },

  status: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#228B22',
    letterSpacing: 0.3,
  },

  date: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },

  payNowButton: {
    marginTop: 14,
    backgroundColor: '#086189',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#086189',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  payNowText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.8,
  },

  feedbackButton: {
    marginTop: 12,
    backgroundColor: '#086189',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#086189',
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  feedbackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  editButton: {
    marginTop: 14,
    backgroundColor: '#086189',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#086189',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },

  editText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)', // أغمق شوي للتركيز
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#086189',
    letterSpacing: 0.6,
  },

  commentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 90,
    fontSize: 16,
  },

  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 22,
  },

  submitButton: {
    backgroundColor: '#086189',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#086189',
    shadowOpacity: 0.5,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },

  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.6,
  },

  cancelButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#dc3545',
    shadowOpacity: 0.5,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
  },

  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.6,
  },

  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
  selectedDateText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

});

export default MyBookingsScreen;
