
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
const [selectedService, setSelectedService] = useState(null);
const [reviewModalVisible, setReviewModalVisible] = useState(false);
const [detailsModalVisible, setDetailsModalVisible] = useState(false);
const [serviceToReview, setServiceToReview] = useState(null); // الخدمة اللي براجعها
const [modalView, setModalView] = useState('details'); // 'details' أو 'review' أو 'feedback'
const [emergencyBooking, setEmergencyBooking] = useState([]); // تعريف صحيح
const [allBookings, setAllBookings] = useState([]);

// 📌 Format Date
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// 🟩 Group Regular Bookings
const groupedBookings = bookings.reduce((acc, booking) => {
  const key = `${booking.vehicle_id}-${booking.scheduled_date}-${booking.workshop_name}`;
  if (!acc[key]) {
    acc[key] = {
      ...booking,
      services: [{
        service_name: booking.service_name,
        price: booking.price,
        scheduled_time: booking.scheduled_time,
        service_status: booking.service_status,
        service_id: booking.service_id,
      }],
    };
  } else {
    acc[key].services.push({
      service_name: booking.service_name,
      price: booking.price,
      scheduled_time: booking.scheduled_time,
      service_status: booking.service_status,
      service_id: booking.service_id,
    });
  }
  return acc;
}, {});

// 🟥 Group Emergency Bookings
const groupedEmergencyBookings = emergencyBooking.reduce((acc, booking) => {
  const key = `${booking.vehicle_make} ${booking.vehicle_model}-${booking.requested_datetime}`;
  if (!acc[key]) {
    acc[key] = {
      ...booking,
      services: [{
        service_name: booking.service_name,
        price: booking.price,
        status: booking.status,
      }],
    };
  }
  return acc;
}, {});

// 🔁 Merge All Bookings
useEffect(() => {
  const merged = [
    ...Object.values(groupedBookings).map(b => ({ ...b, isEmergency: false })),
    ...Object.values(groupedEmergencyBookings).map(b => ({ ...b, isEmergency: true })),
  ];
  setAllBookings(merged);
}, [bookings, emergencyBooking]);

// 🔃 Fetch Regular Bookings
useEffect(() => {
  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get('http://176.119.254.225:80/booking/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
      //console.log('📘 Regular bookings:', res.data);
    } catch (err) {
      console.error('Error fetching regular bookings:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchBookings();
}, []);

// 🚨 Fetch Emergency Bookings
useEffect(() => {
  const fetchEmergencyBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get('http://176.119.254.225:80/emergency/emergencyBookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmergencyBooking(res.data.bookings || []);
      console.log('🚨 Emergency bookings:', res.data.bookings);
    } catch (err) {
      console.error('Error fetching emergency bookings:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchEmergencyBookings();
}, []);

const renderBooking = ({ item }) => (
  <TouchableOpacity onPress={() => navigation.navigate('BookingDetails', { booking: item })}>
    <LinearGradient
      colors={['#ffffff', '#f2f6f9']}
      style={styles.card}
    >
              <Image source={book} style={styles.image} />

      <View style={styles.details}>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.workshop_name}</Text>

          {item.services && item.services.length > 0 ? (
            <Text style={styles.cardService}>
              {item.services[0].service_name} - {item.services[0].price}₪
              {item.services.length > 1 && (
                <Text style={styles.cardExtra}>  +{item.services.length - 1} more</Text>
              )}
            </Text>
          ) : (
            <Text style={styles.cardService}>No services</Text>
          )}
        </View>
        <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scheduled Time : </Text>
              <Text style={styles.sectionValue}>
                {formatDate(item.scheduled_date)} at {item.scheduled_time}
              </Text>
            </View>
            
            <View style={{ 
              backgroundColor: '#e0f7fa', 
              paddingVertical: 4, 
              paddingHorizontal: 10, 
              borderRadius: 10, 
              alignSelf: 'flex-start',
              marginTop: 10 
            }}>
              <Text style={{ fontSize: 13, color: '#086189', fontWeight: '700' }}>
                {item.booking_status.toUpperCase()}
              </Text>
            </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);


const renderEmergencyBooking = ({ item }) => (
  console.log(item),
  <TouchableOpacity onPress={() => navigation.navigate('EBookingDetails', { booking: item })}>
    <LinearGradient
      colors={['#ffe5e5', '#ffcccc']}  // تدرج أحمر فاتح
      style={styles.card}
    >
      <Image source={book} style={styles.image} />

      <View style={styles.details}>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.workshop_name}</Text>

         
    <Text style={styles.cardService}>
  {item.service_name} - {item.price ?? 0}₪
</Text>

           
      
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requested Time : </Text>
          <Text style={styles.sectionValue}>
            {formatDate(item.requested_datetime)}
          </Text>
        </View>

        <View style={{
          backgroundColor: '#f8d7da', // لون خلفية فاتح أحمر (مثلاً)
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 10,
          alignSelf: 'flex-start',
          marginTop: 10
        }}>
          <Text style={{ fontSize: 13, color: '#721c24', fontWeight: '700' }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);



// لو عندك نوع بالحجز
const renderItem = ({ item }) => {
  if (item.isEmergency) {
    return renderEmergencyBooking({ item });
  } else {
    return renderBooking({ item });
  }
};

return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.headerTitle}>My Bookings</Text>
    <View style={styles.headerDivider} />
    <FlatList
      data={allBookings}  // خليها تجمع كل الحجوزات العادية والطوارئ هنا
      keyExtractor={item => item.isEmergency ? `emergency-${item.emergency_booking_id}` : `normal-${item.booking_id}`}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  </SafeAreaView>
);

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    //backgroundColor: '#f5f8fa', // خفيف وحلو للباكجراوند
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
   // marginBottom: 20,
    width: '100%',
  },

card: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderRadius: 20,
  marginBottom: 10,
  padding: 20,
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
  borderWidth: 1,
  borderColor: '#e2e8f0',
  // جديد:
  //backgroundColor: 'linear-gradient(135deg, #ffffff, #f0f4f8)', // إذا كنت تستخدم مكتبة دعم للتدرجات مثل react-native-linear-gradient
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

textContainer: {
  flex: 1,
  justifyContent: 'center',
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

export default MyBookingsScreen;
