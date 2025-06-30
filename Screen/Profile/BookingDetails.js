
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
ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LinearGradient } from 'expo-linear-gradient';

const BookingDetailsScreen = ({ route, navigation }) => {
  const { booking } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
const [newDate, setNewDate] = useState(new Date());
const [reviewModalVisible, setReviewModalVisible] = useState(false);
const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
const [feedbackText, setFeedbackText] = useState('');
const [rating, setRating] = useState(0);
const [selectedService, setSelectedService] = useState(null);
const [selectedBooking, setSelectedBooking] = useState(booking);

 const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [disabledSlots, setDisabledSlots] = useState([]); // Add this state for disabled slots
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [cancelModalVisible, setCancelModalVisible] = useState(false);
const [cancelReason, setCancelReason] = useState('');
const [bookingToCancel, setBookingToCancel] = useState(null);

const handleCancelPress = (booking) => {
  setBookingToCancel(booking);
  setCancelModalVisible(true);
  setCancelReason('');
};
const confirmCancel = async () => {
  if (!cancelReason.trim()) {
    alert("Please provide a reason for cancellation.");
    return;
  }
  try {
    const token = await AsyncStorage.getItem('accessToken');
    await axios.patch(`http://176.119.254.225:80/booking/user/cancel/${bookingToCancel.booking_id}`, {
      cancellation_reason: cancelReason  // هنا غيرت reason لـ cancellation_reason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Booking canceled successfully.');
    setCancelModalVisible(false);
    // هنا فعل تحديث البيانات أو إعادة جلب الحجز
  } catch (error) {
    alert('Failed to cancel booking.');
    console.error(error);
  }
};


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
const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return '#28a745'; // أخضر
    case 'rejected':
      return '#dc3545'; // أحمر
    case 'completed':
      return '#007bff'; // أزرق
    case 'requested':
      return '#ffc107'; // أصفر
    default:
      return '#888'; // رمادي
  }
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

const handleServiceRequestReview = (service, bookingId) => {
  // 1. حفظ الخدمة مع رقم الحجز في حالة جديدة
  setSelectedService({ ...service, bookingId });

  // 2. إغلاق مودال التفاصيل (المودال الأول)
  setSelectedBooking(null);

  // 3. بعد تأخير بسيط، افتح مودال المراجعة
  setTimeout(() => {
    setReviewModalVisible(true);
  }, 300);
};

const respondToServiceRequest = async (approve) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`http://176.119.254.225:80/booking/user/approve/service/${selectedService.bookingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: selectedService.service_id,
        approve: approve,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      setReviewModalVisible(false);
      // 💡 ري فرش للبيانات إذا بدك
    } else {
      alert(data.message || 'Something went wrong');
    }
  } catch (err) {
    console.error('Error responding to service request:', err);
    alert('Error sending request');
  }
};
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth()+1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { bg: '#fff3cd', color: '#856404' };
    case 'accepted':
      return { bg: '#d4edda', color: '#155724' };
    case 'complete paid':
      return { bg: '#cce5ff', color: '#004085' };
    case 'complete partially paid':
      return { bg: '#ffeeba', color: '#856404' };
    case 'cancelled':
      return { bg: '#f8d7da', color: '#721c24' };
    default:
      return { bg: '#e2e3e5', color: '#383d41' };
  }
};

return (
  <SafeAreaView style={styles.container}>
  <ScrollView contentContainerStyle={{ padding: 16 }}>
    <Text style={styles.modalTitle}>{booking.workshop_name}</Text>
    <Text style={styles.modalCar}>
      {booking.make} {booking.model} ({booking.year})
    </Text>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Scheduled Time</Text>
      <Text style={styles.sectionValue}>
        {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
      </Text>
    </View>

    <Text style={styles.serviceStatus}>{booking.status_name}</Text>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Services</Text>
      {booking.services?.map((service, index) => (
        <View key={index} style={styles.serviceLine}>
          <Text style={styles.serviceText}>{service.service_name}</Text>
          <Text style={styles.servicePrice}>{service.price}₪</Text>
          <Text style={[styles.serviceStatus, { color: getStatusColor(service.service_status) }]}>
            {service.service_status}
          </Text>

          {service.service_status === 'requested' && (
            <TouchableOpacity
              style={styles.requestTag}
              onPress={() => handleServiceRequestReview(service, booking.booking_id)}
            >
              <Text style={styles.requestTagText}>Review</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>

    {booking.booking_status === 'accepted' && (
      <TouchableOpacity style={styles.primaryButton} onPress={() => handlePayment(booking)}>
        <Text style={styles.primaryButtonText}>Pay Partial</Text>
      </TouchableOpacity>
    )}

    {booking.booking_status === 'complete partially paid' && (
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => handleReportReview(booking)}>
          <Text style={styles.secondaryButtonText}>Review Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={() => handlePayment(booking)}>
          <Text style={styles.primaryButtonText}>Pay Remaining</Text>
        </TouchableOpacity>
      </View>
    )}

    {booking.booking_status === 'complete paid' && !booking.feedback_given && (
      <TouchableOpacity style={styles.primaryButton} onPress={() => setFeedbackModalVisible(true)}>
        <Text style={styles.primaryButtonText}>Leave Feedback</Text>
      </TouchableOpacity>
    )}

    {(booking.booking_status === 'pending' || booking.status_name?.toLowerCase() === 'not started') && (
      <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(booking)}>
        <Text style={styles.editText}>Edit Booking</Text>
      </TouchableOpacity>
    )}
   {booking.status_name?.toLowerCase() === 'not started' && (
  <TouchableOpacity style={styles.editButton} onPress={() => handleCancelPress(booking)}>
    <Text style={styles.editText}>Cancel Booking</Text>
  </TouchableOpacity>
)}
  </ScrollView>

 

    {/* مودال التعديل */}
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

    {/* مودال الريفيو للخدمات */}
    <Modal visible={reviewModalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Review Requested Service</Text>

          {selectedService && (
            <>
              <Text style={styles.modalText}>Do you want to approve the following service?</Text>
              <Text style={styles.modalTextBold}>
                {selectedService.service_name} - {selectedService.price}₪
              </Text>
            </>
          )}

          <View style={styles.modalButtonRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'green' }]} onPress={() => respondToServiceRequest(true)}>
              <Text style={styles.actionText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'red' }]} onPress={() => respondToServiceRequest(false)}>
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setReviewModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* مودال التقييم */}
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
    
<Modal visible={cancelModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Cancellation Reason</Text>
      <Text>Please tell us why you want to cancel your booking.</Text>

      <TextInput
        style={styles.textInput}
        multiline
        placeholder="Type your reason here..."
        value={cancelReason}
        onChangeText={setCancelReason}
      />

      <View style={styles.modalButtonRow}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirmCancel}>
          <Text style={styles.confirmText}>Confirm </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(false)}>
          <Text style={styles.cancelText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
  </SafeAreaView>
);
};

export default BookingDetailsScreen;

const styles = StyleSheet.create({
  detailsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },
  modalCar: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  sectionValue: {
    fontSize: 15,
    color: '#444',
  },
  serviceStatus: {
    fontSize: 14,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  serviceLine: {
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  serviceText: {
    fontSize: 16,
    color: '#222',
  },
  servicePrice: {
    fontSize: 14,
    color: '#444',
  },
  requestTag: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  requestTagText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  backButton: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    color: '#333',
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
  shadowOpacity: 0.2,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},

  feedbackText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
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

confirmButton: {
backgroundColor: '#d4edda', // أخضر فاتح
  borderWidth: 1,
  borderColor: '#28a745',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: 'center',    // لمحاذاة أفقي
  justifyContent: 'center', // لمحاذاة عمودي
  shadowOpacity: 0.5,
    shadowRadius: 7,

  width: '48%',
},

cancelButton: {
backgroundColor: '#f8d7da', // وردي فاتح
  borderWidth: 1,
  borderColor: '#dc3545',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: 'center',    // لمحاذاة أفقي
  justifyContent: 'center', // لمحاذاة عمودي
  shadowOpacity: 0.5,
  shadowRadius: 7,
  width: '48%',
},

textInput: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 12,
  marginVertical: 16,
  minHeight: 80,
  textAlignVertical: 'top', // عشان يظل النص فوق لما يكتب
  backgroundColor: '#fff',
},
cancelText: {
  color: '#dc3545',
  fontWeight: '700',
  fontSize: 16,
},
confirmText: {
  color: '#28a745',
  fontWeight: '700',
  fontSize: 16,
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
 
  
modalText: {
  fontSize: 16,
  marginVertical: 8,
  textAlign: 'center',
},
modalTextBold: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 12,
  textAlign: 'center',
},
actionButton: {
  padding: 10,
  borderRadius: 8,
  marginHorizontal: 10,
  flex: 1,
  alignItems: 'center',
},
actionText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContent: {
  backgroundColor: '#fff',
  width: '90%',
  borderRadius: 16,
  padding: 20,
  maxHeight: '80%',
},





statusTag: {
  backgroundColor: '#e0f7fa',  // لون هادي وأنيق (سماوي فاتح)
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 20,
  alignSelf: 'flex-start',
  marginTop: 6,
},

statusText: {
  color: '#007B8A',  // أزرق أخضر غامق
  fontWeight: 'bold',
  fontSize: 13,
  letterSpacing: 0.5,
},


 

  modalDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
  },
  modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#086189',
  marginBottom: 5,
},

modalCar: {
  fontSize: 16,
  color: '#666',
  marginBottom: 10,
},

section: {
  marginBottom: 15,
},

sectionTitle: {
  fontSize: 15,
  fontWeight: '600',
  color: '#086189',
  marginBottom: 5,
},

sectionValue: {
  fontSize: 14,
  color: '#333',
},

serviceLine: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 6,
  borderBottomWidth: 0.5,
  borderColor: '#ddd',
},

serviceText: {
  fontSize: 14,
  flex: 2,
  color: '#333',
},

servicePrice: {
  fontSize: 14,
  flex: 1,
  textAlign: 'right',
  color: '#444',
},

serviceStatus: {
  fontSize: 13,
  flex: 1,
  textAlign: 'right',
  fontWeight: '600',
},

requestTag: {
  backgroundColor: '#ffeeba',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 12,
  marginLeft: 10,
},

requestTagText: {
  fontSize: 12,
  color: '#856404',
  fontWeight: '600',
},

primaryButton: {
  backgroundColor: '#086189',
  padding: 10,
  borderRadius: 10,
  marginTop: 15,
  alignItems: 'center',
},

primaryButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},

secondaryButton: {
  backgroundColor: '#e0f7fa',
  padding: 10,
  borderRadius: 10,
  marginTop: 10,
  alignItems: 'center',
},

secondaryButtonText: {
  color: '#086189',
  fontWeight: '600',
},

buttonGroup: {
  marginTop: 10,
  gap: 10,
},

editButton: {
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  borderColor: '#086189',
  borderWidth: 1,
  alignItems: 'center',
},

editText: {
  color: '#086189',
  fontWeight: '600',
},

closeModal: {
  marginTop: 20,
  alignItems: 'center',
},

closeText: {
  color: '#888',
  fontSize: 14,
},


});
