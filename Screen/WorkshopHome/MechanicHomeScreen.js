import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal, Pressable,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import Colors from '../../Components/Colors/Colors';
import api from '../../api'; // Adjust the import based on your project structure
import { LinearGradient } from 'expo-linear-gradient';

// Responsive values
const { width, height } = Dimensions.get('window');
const responsiveHorizontalPadding = width * 0.05;
const responsiveVerticalPadding = height * 0.02;
const responsiveMargin = width * 0.03;
const responsiveButtonHeight = height * 0.06;
const responsiveBottomPadding = height * 0.1;
const responsiveFontSize = width * 0.04;

const PRIMARY_COLOR = '#086189';

const delayOptions = [5, 10, 15, 30, 35, 40, 45, 50, 55, 60]; // بالدقائق

const CARD_WIDTH = width * 0.85;
const ACTION_BUTTON_SIZE = width * 0.28;
const STAT_CARD_WIDTH = width * 0.22;
const STAT_CARD_HEIGHT = height * 0.12;

const MechanicHomeScreen = () => {
  const [workshopData, setWorkshopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [delayModalVisible, setDelayModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const animatedValues = useRef({}).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
const [services, setServices] = useState([]); // قائمة الخدمات المتاحة للورشة
const [modalVisible, setModalVisible] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
const [token, setToken] = useState('');
const [selectedServices, setSelectedServices] = useState([]); // خدمات مختارة في المودال
  const [reportText, setReportText] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [actionsModalVisible, setActionsModalVisible] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const userId = await AsyncStorage.getItem('userId');

          if (!token || !userId) {
            console.error('Missing token or user ID');
            return;
          }

          // Fetch workshop details
          const response = await axios.get('http://176.119.254.225:80/mechanic/home-me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          setWorkshopData(response.data);

          // Fetch today's bookings
          await fetchTodayBookings();
          
          // Fetch emergency bookings
          await fetchEmergencyBookings();

        } catch (error) {
          console.error('Failed to fetch data:', error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

// Move fetchTodayBookings outside useEffect
const fetchTodayBookings = useCallback(async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await axios.get('http://176.119.254.225:80/booking/Mechanic/bookings/today', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // جمع الخدمات لكل booking_id
    const grouped = {};
    res.data.bookings.forEach(item => {
      const id = item.booking_id.toString();
      if (!grouped[id]) {
        grouped[id] = {
          id,
          booking_id: item.booking_id,
          scheduled_time: item.scheduled_time,
          scheduled_date: item.scheduled_date,
          city: item.city,
          street: item.street,
          price: 0, // نجمع السعر بعدين
          time: item.scheduled_time,
          customer: `${item.first_name} ${item.last_name}`,
          car: `${item.make} ${item.model} (${item.year})`,
          services: [],  // مصفوفة الخدمات
          status: item.status_name,
          notes: item.notes || '', // لو موجود
          workshop_id : item.workshop_id,
        };
      }
      // نجمع الأسعار للخدمات كلها
      grouped[id].price += item.price;
      // نجمع أسماء الخدمات
      if (!grouped[id].services.some(s => s.name === item.service_name)) {
        grouped[id].services.push({
          name: item.service_name,
          status: item.service_status,
        });
      }
    });
    // نحول المجموع لكائنات مصفوفة 
    const formatted = Object.values(grouped);
    setAppointments(formatted);
    console.log('Fetched and grouped bookings:', formatted);
  } catch (error) {
    console.error('Error fetching today\'s bookings:', error);
  } finally {
    setLoading(false);
  }
}, []);

// useEffect to fetch on mount - removed since it's now handled in useFocusEffect

const onCancel = async (bookingId, cancellationReason = '') => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`http://176.119.254.225:80/booking/mechanic/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancellation_reason: cancellationReason }),
    });

    if (response.ok) {
      alert('Booking cancelled successfully.');
      fetchTodayBookings(); // حدث قائمة الحجوزات بعد الإلغاء
    } else {
      const errorData = await response.json();
      alert('Failed to cancel booking: ' + errorData.message);
    }
  } catch (error) {
    console.error('Cancel booking error:', error);
    alert('An error occurred while cancelling the booking.');
  }
};

   const fetchServices = async (id, token) => {
    try {
      const response = await api.get(`/service/workshops/${id}/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      console.error("🚫 Failed to fetch services:", error);
      Alert.alert('Error', 'Failed to fetch services.');
    }
  };

 const showModal = () => {
    setDelayModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setDelayModalVisible(false);
    });
  };

  const onDelay = (item) => {
    setSelectedAppointment(item);
    showModal();
  };

  const onSelectDelay = async (minutes) => {
    try {
      hideModal();
      console.log(`Delay appointment ${selectedAppointment.id} by ${minutes} minutes`);

      const token = await AsyncStorage.getItem('accessToken'); 

      const response = await fetch(`http://176.119.254.225:80/booking/Mechanic/bookings/${selectedAppointment.id}/delay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ delayMinutes: minutes }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Appointment delayed successfully');
        fetchTodayBookings();
      } else {
        console.error('Server error:', data.message);
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Delay error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
 const updateBookingStatus = async (status, bookingId) => {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const response = await axios.patch(
      `http://176.119.254.225:80/booking/update/status/${bookingId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Alert.alert("Success", response.data.message);
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    Alert.alert("Error", error?.response?.data?.message || "Something went wrong");
  }
};

const onEditbookStatus = (item) => {
  Alert.alert(
    "Update Status",
    "Choose booking status",
    [
      {
        text: "Completed",
        onPress: () => updateBookingStatus("completed", item.booking_id),
      },
      {
        text: "In Progress",
        onPress: () => updateBookingStatus("in progress", item.booking_id),
      },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true }
  );
};



const getAnimatedValue = (id) => {
  if (!animatedValues[id]) {
    animatedValues[id] = new Animated.Value(0);
  }
  return animatedValues[id];
};

const toggleExpand = (id) => {
  const animatedValue = getAnimatedValue(id);
  const isExpanded = expandedCard === id;
  
  Animated.timing(animatedValue, {
    toValue: isExpanded ? 0 : 1,
    duration: 300,
    useNativeDriver: false,
  }).start();

  setExpandedCard(isExpanded ? null : id);
};
const addServiceToBooking = 
  async () => {
  if (selectedServices.length === 0) {
    Alert.alert('Please select at least one service!');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert('Error', 'User token is missing');
      return;
    }

    const bookingId = selectedBooking?.booking_id;
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing');
      return;
    }

    // جهزي الداتا المطلوبة
    const servicesPayload = selectedServices.map(service => ({
      service_id: service.service_id, // أو service.id حسب الشكل
      price: service.price,
    }));

    // ابعتيها للباكند
    const response = await axios.patch(
      `http://176.119.254.225:80/booking/update/services/${bookingId}`,
      { services: servicesPayload },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✅ Services added:', response.data);
    Alert.alert('Success', 'Services added to booking');
    setModalVisible(false);
    fetchTodayBookings();
  } catch (error) {
    console.error('🚫 Error adding services:', error);
    Alert.alert('Error', 'Failed to add services');
  }
}

const onAddService = async (booking) => {
  setSelectedBooking(booking);
  setSelectedServices([]); // مسح الاختيارات القديمة

  const token = await AsyncStorage.getItem('accessToken'); // جيب التوكن هنا
  if (!token) {
    Alert.alert('Error', 'User token is missing');
    return;
  }

  if (!booking.workshop_id) {
    Alert.alert('Error', 'Workshop ID missing in booking');
    return;
  }

  await fetchServices(booking.workshop_id, token); // مرر الـ token صح
  console.log('Fetched services for workshop:', booking.workshop_id);
  console.log('Available services:', services);
  setModalVisible(true);
};
 const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'green';
    case 'requested':
      return 'orange';
    case 'rejected':
      return 'red';
    case 'completed':
      return 'blue';
    default:
      return 'gray';
  }
};

  
  const [emergencyBookings, setEmergencyBookings] = useState([]);

const fetchEmergencyBookings = useCallback(async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const res = await axios.get('http://176.119.254.225:80/emergency/workshop/emergencyBookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEmergencyBookings(res.data.bookings);
    console.log('Fetched emergency bookings:', res.data.bookings);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to fetch bookings');
  }
}, []);

// useEffect for emergency bookings - removed since it's now handled in useFocusEffect

const handleAccept = async (id) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    await axios.post(`http://176.119.254.225:80/emergency/emergencyBooking/respond/${id}`, { action: 'accept' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    Alert.alert('Success', 'Booking accepted');
    fetchEmergencyBookings(); // تحدث القائمة
  } catch (error) {
  console.log('API error:', error.response ? error.response.data : error.message);
  Alert.alert('Error', 'Failed to accept booking');
}

};

const handleReject = async (id) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    await axios.post(`http://176.119.254.225:80/emergency/emergencyBooking/respond/${id}`, { action: 'reject' }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    Alert.alert('Success', 'Booking rejected');
    fetchEmergencyBookings(); // تحدث القائمة
  } catch (error) {
    Alert.alert('Error', 'Failed to reject booking');
  }
};



const renderEmergencyBooking = ({ item }) => {
  // 👇 فك الـ user_address مرة وحدة بأول الريندر
  let parsedAddress = {};
  try {
    parsedAddress = JSON.parse(item.user_address);
  } catch (err) {
    parsedAddress = { road: 'Unknown', city: '' };
  }

  return (
    <View style={{
      backgroundColor: '#FBE9E7',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: '#FFCCBC',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    }}>
      <Text style={{ fontSize: 17, fontWeight: '600', color: '#4E342E', marginBottom: 6 }}>
        {item.customer_name} ({item.customer_phone})
      </Text>

      <Text style={{ fontSize: 15, color: '#5D4037', marginBottom: 6 }}>
        Service: <Text style={{ fontWeight: 'bold', color: '#BF360C' }}>{item.service_name}</Text> —
        <Text style={{ color: '#1B5E20' }}> ₪{item.price}</Text>
      </Text>

      <Text style={{ fontSize: 15, color: '#5D4037', marginBottom: 6 }}>
        Car: {item.vehicle_make} {item.vehicle_model}
      </Text>

      {/* 🧭 العنوان بعد فك الـ JSON */}
      <Text style={{ fontSize: 15.5, color: '#6A1B1A', marginBottom: 6 }}>
        Address: {parsedAddress.road}, {parsedAddress.city}
      </Text>

     <Text>
  Requested at: {item.requested_datetime}
</Text>


      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        color:
          item.status === 'Waiting' ? '#FF6F00' :
          item.status === 'Confirmed' ? '#388E3C' :
          item.status === 'Cancelled' ? '#D32F2F' :
          '#616161'
      }}>
        Status: {item.status}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={() => handleAccept(item.emergency_request_id)}
          style={{
            backgroundColor: '#388E3C',
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleReject(item.emergency_request_id)}
          style={{
            backgroundColor: '#D32F2F',
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!workshopData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load workshop data.</Text>
      </View>
    );
  }

 return (
    <View style={styles.mainContainer}>
      <View style={styles.fixedHeader}>
        <View style={styles.headerContainer}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{workshopData.workshop_name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.locationText}>{workshopData.street}, {workshopData.city}</Text>
            </View>
          </View>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: workshopData.is_open ? '#E8F5E9' : '#FFEBEE' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: workshopData.is_open ? '#2E7D32' : '#C62828' }
            ]}>
              {workshopData.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
<Modal visible={modalVisible} animationType="slide" transparent>
  <View style={{ flex:1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
    <View style={{ backgroundColor: 'white', borderRadius: 10, maxHeight: '80%' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', padding: 15 }}>Select Services</Text>
      <FlatList
        data={services}
        keyExtractor={item => item.service_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if(selectedServices.some(s => s.service_id === item.service_id)) {
                setSelectedServices(selectedServices.filter(s => s.service_id !== item.service_id));
              } else {
                setSelectedServices([...selectedServices, item]);
              }
            }}
            style={{
              padding: 15,
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderColor: '#eee'
            }}
          >
            <Text>{item.service_name}</Text>
            <Text> {item.price} NIS</Text>
            {selectedServices.some(s => s.service_id === item.service_id) && <Text style={{ fontSize: 18 }}>✅</Text>}
          </TouchableOpacity>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 15 }}>
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={{ padding: 10, backgroundColor: '#ccc', borderRadius: 8, width: '40%' }}
        >
          <Text style={{ textAlign: 'center' }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            addServiceToBooking(); // استدعاء الدالة لإضافة الخدمات
            // هنا حط كود إضافة الخدمات للبوكينغ
            setModalVisible(false);
          }}
          style={{ padding: 10, backgroundColor: PRIMARY_COLOR, borderRadius: 8, width: '40%' }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Add Services</Text>
        </TouchableOpacity>
        
      </View>
    </View>
  </View>
</Modal>

      <ScrollView style={{ backgroundColor: '#f7fafd' }} contentContainerStyle={styles.scrollContentContainer}>
        <Text style={[styles.sectionTitle, { marginHorizontal: 20 }]}>Today's Appointments</Text>
        <View style={styles.separator} />
        <FlatList
          data={appointments.length > 0 ? appointments : [{ id: 'no-appointments', isPlaceholder: true }]}
          keyExtractor={(item) => item.id+ '-' + item.scheduled_time}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.appointmentsContainer}
          renderItem={({ item }) => {
            if (item.isPlaceholder) {
              return (
                <View style={[styles.appointmentCard, { width: CARD_WIDTH }]}>
                  <View style={styles.appointmentInfo}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentTime}>📅 Today</Text>
                    </View>
                    <View style={styles.appointmentDetails}>
                      <Text style={[styles.appointmentText, { textAlign: 'center', color: '#666' }]}>
                        No appointments scheduled for today
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }

            const animatedValue = getAnimatedValue(item.id);

            return (
              <TouchableOpacity 
                style={[styles.appointmentCard, { width: CARD_WIDTH }]}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentInfo}>
                  <View style={styles.appointmentHeader}>
                    <Text style={styles.appointmentTime}>🕒 {item.time}</Text>
                    <View style={styles.headerRight}>
                      <Text style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            item.status === 'Completed' ? '#C8E6C9' :
                            item.status === 'In Progress' ? '#FFECB3' :
                            item.status === 'Not Started' ? '#BBDEFB' :
                            '#FFCDD2',
                          color:
                            item.status === 'Completed' ? '#388E3C' :
                            item.status === 'In Progress' ? '#FF9800' :
                            item.status === 'Not Started' ? '#1976D2' :
                            '#D32F2F',
                        }
                      ]}>
                        {item.status}
                      </Text>
                      <Animated.View style={{
                        transform: [{
                          rotate: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg']
                          })
                        }]
                      }}>
                        <Ionicons 
                          name="chevron-down" 
                          size={16} 
                          color="#2196F3"
                        />
                      </Animated.View>
                    </View>
                  </View>
                  
                  <View style={styles.appointmentDetails}>
                    <Text style={styles.appointmentText}>{item.customer}</Text>
                    <Text style={styles.appointmentText}>{item.car}</Text>
                 </View>

                {/* Expanded content always visible, no animated height */}
                {expandedCard === item.id && (
                  <View style={[
                    styles.expandedContent,
                    {
                      opacity: 1,
                      overflow: 'visible',
                      padding: 10,
                      backgroundColor: '#F9F9F9',
                      borderTopWidth: 1,
                      borderTopColor: '#EEE',
                      borderRadius: 8,
                    }
                  ]}>
                    {/* التفاصيل الأساسية */}
                    <Text style={styles.detailText}>📍 Location: {item.city} {item.street}  no address </Text>
                    <Text style={styles.detailText}>💰 Total: {item.price} NIS</Text> 
                    <Text style={styles.detailText}>📋 Notes: {item.notes || 'No additional notes'}</Text>
                    <View style={{ marginTop: 5 }}>
                      <Text style={styles.appointmentText}>Services:</Text>
                      {item.services.length > 0 ? (
                        item.services.map((service, index) => (
                          <Text key={index} style={[styles.appointmentText, { marginLeft: 10 }]}> 
                            • {service.name} 
                            <Text style={{ color: getStatusColor(service.status) }}>
                              {` (${service.status})`}
                            </Text>
                          </Text>
                        ))
                      ) : (
                        <Text style={[styles.appointmentText, { marginLeft: 10 }]}> 
                          No services listed
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* زر Actions مستطيل بعرض الكارد */}
                <View style={{ marginTop: 10, marginHorizontal: 0 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#086189',
                      borderRadius: 16,
                      paddingVertical: 8,
                      width: '100%',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedAppointment(item);
                      setActionsModalVisible(true);
                    }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Actions</Text>
                  </TouchableOpacity>
                </View>


                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Requests & Appointments Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionSubtitle}>MANAGE</Text>
          <Text style={styles.sectionTitle}>Requests & Appointments</Text>
          <View style={styles.actionsRow}>
            <CircleActionButton
              icon="time-outline"
              label="Pending"
              onPress={() => navigation.navigate('PindingRequests', { status: 'PENDING' })}
            />
            <CircleActionButton
              icon="clipboard-outline"
              label="Appointments"
              onPress={() => navigation.navigate('Appointments')}
            />
            <CircleActionButton
              icon="calendar-outline"
              label="Today's Schedule"
              onPress={() => navigation.navigate('TodaySchedule', { workshopId: workshopData?.workshop_id })}
            />
          </View>
        </View>

        {/* Workshop Management Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionSubtitle}>WORKSHOP</Text>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.actionsRow}>
            <CircleActionButton
              icon="construct-outline"
              label="Services"
              onPress={() => navigation.push('Service', { workshopId: workshopData?.workshop_id })}
            />
            <CircleActionButton
              icon="star-outline"
              label="Specialization"
              onPress={() => navigation.navigate('WorkshopSpecializations', { userId: workshopData?.user_id || workshopData?.owner_id })}
            />
            <CircleActionButton
              icon="medal-outline"
              label="Certifications"
              onPress={() => navigation.navigate('CertificationScreen')}
            />
            <CircleActionButton
              icon="alert"
              label="Emergency"
              onPress={() => navigation.navigate('EmergencyService')}
            />
          </View>
        </View>

        {/* Emergency Section */}
  
  
<View style={[styles.sectionCard, styles.emergencySectionCard, {
  backgroundColor: '#FBE9EB',
  borderRadius: 20,
  padding: 24
}]}>
  <Text style={[styles.sectionTitle, {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8B0014',
    marginBottom: 16,
    textAlign: 'center'
  }]}>
    Emergency Requests 🚨
  </Text>

  {loading ? (
    <ActivityIndicator size="large" color="#E57373" />
  ) : emergencyBookings.length === 0 ? (
    <Text style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>
      No emergency bookings at the moment.
    </Text>
  ) : (
    <FlatList
      data={emergencyBookings}
      keyExtractor={item => item.emergency_booking_id.toString()}
      renderItem={renderEmergencyBooking}
      contentContainerStyle={{ paddingBottom: 20 }}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      showsVerticalScrollIndicator={false}
    />
  )}
</View>


        <View style={styles.sectionSeparator}>
          <View style={styles.horizontalLine} />
        </View>
        <View style={styles.statsRow}>
          <StatCard 
            icon="calendar" 
            label="Bookings" 
            value="12"
            iconColor="#2196F3"
          />
          <StatCard 
            icon="money-bill" 
            label="Earnings" 
            value="$870"
            iconColor="#4CAF50"
          />
          <StatCard 
            icon="star" 
            label="Rating" 
            value={workshopData.rate ? `${workshopData.rate}` : 'N/A'}
            iconColor="#FF9800"
          />
        </View>
      </ScrollView>

      {/* Delay Modal */}
      <Modal
        visible={delayModalVisible}
        transparent
        animationType="none"
        onRequestClose={hideModal}
      >
        <Animated.View style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
          }
        ]}>
          <Animated.View style={[
            styles.modalContent,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}>
            {/* Row: title left, X icon right */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, width: '100%' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#086189' }}>Delay by...</Text>
              <TouchableOpacity onPress={hideModal} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color="#f44336" />
              </TouchableOpacity>
            </View>
            <View style={styles.delayOptionsContainer}>
              {delayOptions.map((minutes) => (
                <Pressable
                  key={minutes}
                  style={styles.delayOption}
                  onPress={() => onSelectDelay(minutes)}
                >
                  <Text style={styles.delayOptionText}>{minutes} minutes</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ alignItems: 'flex-end', marginTop: 12 }}>
              <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic', textAlign: 'right' }}>
                You can delay just 2 times
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Modal for actions */}
      <Modal
        visible={actionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setActionsModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%', alignItems: 'stretch' }}>
                {/* Row: X icon left, title right */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#086189', textAlign: 'left', flex: 1 }}>
                    Choose Action
                  </Text>
                  <TouchableOpacity
                    onPress={() => setActionsModalVisible(false)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close" size={26} color={Colors.red} />
                  </TouchableOpacity>
                  
                </View>
                <TouchableOpacity
                  style={{ backgroundColor: '#2196F3', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
                  onPress={() => {
                    setActionsModalVisible(false);
                    onDelay(selectedAppointment);
                  }}
                >
                  <Ionicons name="time-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Delay</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#388E3C', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
                  onPress={() => {
                    setActionsModalVisible(false);
                    onAddService(selectedAppointment);
                  }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Add Service</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#1976D2', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
                  onPress={() => {
                    setActionsModalVisible(false);
                    onEditbookStatus(selectedAppointment);
                  }}
                >
                  <Ionicons name="sync-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>In Progress / Completed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#F57C00', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
                  onPress={() => {
                    setActionsModalVisible(false);
                    navigation.navigate('GenerateReportScreen', { booking: selectedAppointment });
                  }}
                >
                  <Ionicons name="document-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Generate Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#FF5252', padding: 12, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}
                  onPress={() => {
                    setActionsModalVisible(false);
                    Alert.alert(
                      'Cancel Booking',
                      'Are you sure you want to cancel this booking?',
                      [
                        { text: 'No', style: 'cancel' },
                        { text: 'Yes', style: 'destructive', onPress: () => onCancel(selectedAppointment.booking_id) },
                      ]
                    );
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
);

};

const CircleActionButton = ({ icon, label, onPress, style, iconColor = '#086189', iconSize = 28, labelStyle }) => (
  <TouchableOpacity style={[styles.circleButton, style]} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.circleIconWrapper}>
      <Ionicons name={icon} size={iconSize} color={iconColor} />
    </View>
    <Text style={[styles.circleButtonLabel, labelStyle]}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ icon, label, value, iconColor }) => (
  <View style={[styles.statCard, { width: STAT_CARD_WIDTH, height: STAT_CARD_HEIGHT }]}>
    <FontAwesome5 name={icon} size={width * 0.045} color={iconColor} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default MechanicHomeScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#fff',
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    flex: 1,
    paddingTop: height * 0.15, // Adjust this value based on your header height
  },
  contentContainer: {
    padding: responsiveHorizontalPadding * 0.2,
    paddingBottom: responsiveBottomPadding,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveHorizontalPadding * 0.8,
  },
  greeting: {
    fontSize: width * 0.055,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: height * 0.02,
  },
  card: {
    padding: width * 0.05,
    marginBottom: height * 0.02,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 0,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#b0b8c1',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#086189',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  actionsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap', // 🔥 يخلي الأزرار تنزل للسطر اللي بعده تلقائيًا
  justifyContent: 'space-between', // توزيع حلو للأزرار
  gap: 16, // مسافة بين الأزرار (React Native 0.71+)
  marginTop: 20,
},

  circleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    marginHorizontal: 0,
  },
  circleIconWrapper: {
    backgroundColor: '#eaf3fa',
    borderRadius: 50,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#086189',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  circleButtonLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
    textAlign: 'center',
  },
  emergencySectionCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#ffcccc',
    borderWidth: 1,
  },
  emergencySubtitle: {
    color: '#ff5252',
  },
  emergencyTitle: {
    color: '#d32f2f',
  },
  emergencyGlow: {
    borderRadius: 50,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff5252',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  emergencyButton: {
    backgroundColor: '#fff',
    borderWidth: 0,
    shadowColor: '#ff1744',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyButtonLabel: {
    color: '#ff1744',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'black',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  appointmentsContainer: {
    paddingLeft: responsiveHorizontalPadding * 0.8,
    paddingBottom: responsiveVerticalPadding * 0.5,
    paddingTop: responsiveVerticalPadding * 0.5,
  },
  appointmentCard: {
    flex:1,
    backgroundColor: '#fff',
    borderRadius: width * 0.03,
    padding: responsiveHorizontalPadding * 0.7,
    marginRight: width * 0.03,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: responsiveVerticalPadding * 0.5,
    gap: width * 0.02,
  },
  statCard: {
    alignItems: 'center',
    padding: responsiveHorizontalPadding * 0.4,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: responsiveFontSize * 0.9,
    fontWeight: '700',
    color: Colors.mediumGray,
    marginTop: responsiveVerticalPadding * 0.2,
  },
  statLabel: {
    fontSize: responsiveFontSize * 0.7,
    marginTop: responsiveVerticalPadding * 0.08,
    textAlign: 'center',
    color: Colors.mediumGray,
    fontWeight: '500',
  },
 


  errorText: {
    color: 'red',
  },
  appointmentInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveVerticalPadding * 0.6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  appointmentDetails: {
    gap: responsiveVerticalPadding * 0.2,
    marginBottom: responsiveVerticalPadding * 0.4,
  },
  appointmentTime: {
    fontSize: responsiveFontSize * 0.95,
    fontWeight: '600',
    color: '#2196F3',
  },
  appointmentText: {
    fontSize: responsiveFontSize * 0.9,
    color: '#333',
    fontWeight: '500',
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: responsiveFontSize * 0.8,
    fontWeight: '600',
  },
  expandedContent: {
    paddingTop: responsiveVerticalPadding * 0.7,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#086189',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: responsiveFontSize * 1.1,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#086189',
  },
  delayOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    rowGap: 12,
    marginBottom: 20,
  },
  delayOption: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  delayOptionText: {
    fontSize: responsiveFontSize * 0.8,
    color: '#00796B',
  },
  cancelButton1: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f44336',
    borderRadius: 12,
  },
  cancelButtonText1: {
    color: '#fff',
    fontSize: responsiveFontSize * 0.9,
    fontWeight: 'bold',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: height * 0.005,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.01,
  },
  locationText: {
    fontSize: responsiveFontSize,
    color: '#666',
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: responsiveHorizontalPadding * 0.6,
    paddingVertical: responsiveVerticalPadding * 0.3,
    borderRadius: 20,
    marginLeft: width * 0.02,
  },
  statusText: {
    fontSize: responsiveFontSize * 0.8,
    fontWeight: '600',
  },
  sectionSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: responsiveVerticalPadding,
    paddingHorizontal: responsiveHorizontalPadding * 0.8,
  },
  horizontalLine: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.mediumGray,
    opacity: 0.3,
  },
  detailText: {
    fontSize: responsiveFontSize * 0.8,
    color: '#444',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton2: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  updateBooking: {
    backgroundColor: '#1976D2', // أزرق
  },
  updateService: {
    backgroundColor: '#0288D1', // أزرق أفتح
  },
  addService: {
    backgroundColor: '#388E3C', // أخضر
  },
  viewReport: {
    backgroundColor: '#F57C00', // برتقالي
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveHorizontalPadding * 0.8,
  },
  scrollContentContainer: {
    paddingTop: height * 0.15, // match header height so content starts below it
    paddingBottom: 32,
  },
});

