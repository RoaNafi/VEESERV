import React, { useEffect, useState, useCallback, useRef } from 'react';
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

const PRIMARY_COLOR = '#086189';

const delayOptions = [5, 10, 15, 30, 35, 40, 45, 50, 55, 60]; // بالدقائق

const { width, height } = Dimensions.get('window');
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

  useFocusEffect(
    useCallback(() => {
      const fetchWorkshopDetails = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const userId = await AsyncStorage.getItem('userId');

          if (!token || !userId) {
            console.error('Missing token or user ID');
            return;
          }

          const response = await axios.get('http://176.119.254.225:80/mechanic/home-me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          setWorkshopData(response.data);
          console.log('Workshop data:', response.data);
        } catch (error) {
          console.error('Failed to fetch workshop details:', error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchWorkshopDetails();
    }, [])
  );

 const fetchTodayBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const res = await axios.get('http://176.119.254.225:80/booking/Mechanic/bookings/today', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Map your backend data to the frontend format expected by your UI
      const formatted = res.data.bookings.map(item => ({
        id: item.booking_id.toString(),
        time: item.scheduled_time,
        customer: `${item.first_name}  ${item.last_name}`, // replace with real customer name if you have it
        car: `${item.make} ${item.model} (${item.year})`,
        service: item.service_name,
        status: item.status_name ,
      }));

      setAppointments(formatted);
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error);
    } finally {
      setLoading(false);
    }
  };

 const onCancel = async (bookingId) => {
  try {
     const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`http://176.119.254.225:80/booking/mechanic/bookings/${selectedAppointment.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // لازم تمرر التوكن
        'Content-Type': 'application/json',
      },
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
useEffect(() => {
    fetchTodayBookings();
  }, []);
 
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

      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        <View style={styles.separator} />
        <FlatList
          data={appointments.length > 0 ? appointments : [{ id: 'no-appointments', isPlaceholder: true }]}
          keyExtractor={(item) => item.id}
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
            const height = animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 60]
            });

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
                    <Text style={styles.appointmentText}>{item.service}</Text>
                  </View>

                  <Animated.View style={[
                    styles.expandedContent,
                    {
                      height,
                      opacity: animatedValue,
                      overflow: 'hidden'
                    }
                  ]}>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => onCancel(item.booking_id)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.delayButton}
                        onPress={() => onDelay(item)}
                      >
                        <Text style={styles.buttonText}>Delay</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.separator} />
        <View style={styles.actionsRow}>
          <QuickActionButton
            icon="clock"
            label="Pending Requests"
            onPress={() => navigation.navigate('PindingRequests', { status: 'PENDING' })}
          />

          <QuickActionButton
            icon="clipboard-list"
            label="Appointments"
            onPress={() => navigation.navigate('Appointments')}
          />

          <QuickActionButton
            icon="calendar-alt"
            label="Today's Schedule"
            onPress={() => navigation.navigate('TodaySchedule', { 
              workshopId: workshopData?.workshop_id,
              appointments: appointments 
            })}
          />
        </View>

        <View style={[styles.actionsRow, { justifyContent: 'flex-start' }]}>
          <QuickActionButton
            icon="plus"
            label="Add Service"
            onPress={() => navigation.push('Service', { 
              workshopId: workshopData?.workshop_id 
            })}
          />
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
            <Text style={styles.modalTitle}>Select Delay Time</Text>

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

            <Pressable
              style={styles.cancelButton1}
              onPress={hideModal}
            >
              <Text style={styles.cancelButtonText1}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
);

};

const QuickActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity 
    style={[styles.actionButton, { width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }]} 
    onPress={onPress}
  >
    <FontAwesome5 name={icon} size={width * 0.06} color={PRIMARY_COLOR} />
    <Text style={styles.actionLabel}>{label}</Text>
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
    padding: width * 0.01,
    paddingBottom: height * 0.1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  separator: {
    height: 1,             // Thin line
    backgroundColor: 'black',  // Black color
    marginBottom: 10, 
    marginHorizontal: 20,  // Adds space to the left and right of the line
        // Spacing after the line (you can adjust this)
  },
  appointmentsContainer: {
    paddingLeft: width * 0.04,
    paddingBottom: height * 0.01,
    paddingTop: height * 0.01,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: width * 0.035,
    marginRight: width * 0.03,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    gap: width * 0.02,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: width * 0.04,
    borderRadius: 16,
    justifyContent: 'center',
    marginHorizontal: width * 0.01,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    position: 'relative',
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
  },
  actionLabel: {
    fontSize: width * 0.032,
    marginTop: height * 0.01,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.01,
    gap: width * 0.02,
  },
  statCard: {
    alignItems: 'center',
    padding: width * 0.02,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: width * 0.035,
    fontWeight: '700',
    color: Colors.mediumGray,
    marginTop: height * 0.005,
  },
  statLabel: {
    fontSize: width * 0.028,
    marginTop: height * 0.002,
    textAlign: 'center',
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: width * 0.02,
    paddingHorizontal: width * 0.02,
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 20,
    flex: 0.48,
    alignItems: 'center',
  },
  delayButton: {
    backgroundColor: '#2196F3',
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
    borderRadius: 20,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: width * 0.032,
  },
  cardContent: {
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80, // fixed width for alignment
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flexShrink: 1,
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
    marginBottom: height * 0.012,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
  },
  appointmentDetails: {
    gap: height * 0.004,
    marginBottom: height * 0.008,
  },
  appointmentTime: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#2196F3',
  },
  appointmentText: {
    fontSize: width * 0.035,
    color: '#333',
    fontWeight: '500',
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: width * 0.03,
    fontWeight: '600',
  },
  expandedContent: {
    paddingTop: height * 0.015,
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
    fontSize: 20,
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
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: '#086189',
    marginBottom: height * 0.005,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.01,
  },
  locationText: {
    fontSize: width * 0.035,
    color: '#666',
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.006,
    borderRadius: 20,
    marginLeft: width * 0.02,
  },
  statusText: {
    fontSize: width * 0.032,
    fontWeight: '600',
  },
  sectionSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
  },
  horizontalLine: {
    height: 1,
    width: '100%',
    backgroundColor: Colors.mediumGray,
    opacity: 0.3,
  },
});

