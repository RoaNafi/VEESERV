import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal, Pressable,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

const PRIMARY_COLOR = '#086189';

const delayOptions = [5, 10, 15, 30,35,40,45,50,55 ,60]; // بالدقائق


const MechanicHomeScreen = () => {
  const [workshopData, setWorkshopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [delayModalVisible, setDelayModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
 
 const onDelay = (item) => {
    setSelectedAppointment(item);
    setDelayModalVisible(true);
  };

const onSelectDelay = async (minutes) => {
  try {
    console.log(`Delay appointment ${selectedAppointment.id} by ${minutes} minutes`);
    setDelayModalVisible(false);

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
      // إعادة تحميل أو تحديث القائمة
      fetchTodayBookings(); // لو عندك دالة fetchAppointments
    } else {
      console.error('Server error:', data.message);
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Delay error:', error);
    Alert.alert('Error', 'Something went wrong');
  }
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
  <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 70 }}>
    <Text style={styles.greeting}>
      Welcome back{workshopData?.user_name ? `, ${workshopData.user_name.split(' ')[0]}` : ''} 👋
    </Text>

  <Card style={styles.card}>
  <View style={styles.cardContent}>
    <View style={styles.infoRow}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{workshopData.workshop_name}</Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Status:</Text>
      <Text style={[styles.value, { color: workshopData.is_open ? '#4CAF50' : '#F44336' }]}>
        {workshopData.is_open ? 'Open ✅' : 'Closed ❌'}
      </Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Location:</Text>
      <Text style={styles.value}>📍 {workshopData.street}, {workshopData.city}</Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Rating:</Text>
      <Text style={styles.value}>⭐ {workshopData.rate ?? 'N/A'}</Text>
    </View>
  </View>
</Card>

<Text style={styles.sectionTitle}>Today's Appointments</Text>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingBottom: 10 }}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentTime}>🕒 {item.time}</Text>
              <Text style={styles.appointmentText}>{item.customer}'s {item.car}</Text>
              <Text style={styles.appointmentText}>{item.service}</Text>
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
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
               <TouchableOpacity style={[styles.cancelButton]}
               onPress={() => onCancel(item.booking_id)}>
  <Text>Cancel </Text>
</TouchableOpacity>


                <TouchableOpacity
                  style={[styles.delayButton]}
                  onPress={() => onDelay(item)}
                >
                  <Text style={styles.buttonText}>Delay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
 {/* Modal اختيار وقت التأجيل */}
     <Modal
  visible={delayModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setDelayModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select Delay Time</Text>

      <View style={styles.delayOptionsContainer}>
        {delayOptions.map((minutes) => (
          <Pressable
            key={minutes}
            style={styles.delayOption}
            onPress={() => onSelectDelay(minutes)}
          >
            <Text style={styles.delayOptionText}> {minutes} minutes</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.cancelButton1}
        onPress={() => setDelayModalVisible(false)}
      >
        <Text style={styles.cancelButtonText1}>Cancel</Text>
      </Pressable>
    </View>
  </View>
</Modal>

    <Text style={styles.sectionTitle}>Quick Actions</Text>
<View style={styles.actionsRow}>

<QuickActionButton
    icon="clipboard-list"
    label="Add Service"
    onPress={() => navigation.navigate('workshopBooking')}
  />
  <QuickActionButton
    icon="plus"
    label="Add Service"
    onPress={() => navigation.navigate('ProfileNavigator', { screen: 'Service' })}
  />
  <QuickActionButton
    icon="tools"
    label="Specializations"
    onPress={() =>
      navigation.navigate('ProfileNavigator', { screen: 'WorkshopSpecializations' })
    }
  />
</View>


    <Text style={styles.sectionTitle}>Stats Summary</Text>
    <View style={styles.statsRow}>
      <StatCard label="Bookings" value="12" icon="calendar" />
      <StatCard label="Earnings" value="$870" icon="money-bill" />
      <StatCard label="Rating" value="4.8" icon="star" />
    </View>
  </ScrollView>
);

};

const QuickActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <FontAwesome5 name={icon} size={22} color={PRIMARY_COLOR} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);


const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <FontAwesome5 name={icon} size={20} color={PRIMARY_COLOR} style={{ marginBottom: 6 }} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default MechanicHomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 20,
  },
 
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workshopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginVertical: 4,
  },
  location: {
    fontSize: 14,
    color: '#555',
  },
  rating: {
    fontSize: 14,
    color: '#555',
  },
 
    appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  appointmentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  actionButton: {
    alignItems: 'center',
    width: 70,
  },
  actionLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
 
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
  },
 

appointmentInfo: {
  flexDirection: 'column',
   gap: 4,
fontWeight: '700',
},
 customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
  },
appointmentTime: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginBottom: 6,
},

statusChip: {
  marginTop: 8,
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 20,
  fontSize: 12,
  alignSelf: 'flex-start',
  overflow: 'hidden',
  fontWeight: '600',

},

actionButton: {
  alignItems: 'center',
  backgroundColor: '#f1f9fd',
  padding: 12,
  borderRadius: 12,
  width: 120,
  height: 120,
  justifyContent: 'center',
  marginHorizontal: 4,
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},

statCard: {
  alignItems: 'center',
  padding: 14,
  borderRadius: 12,
  backgroundColor: '#f9f9f2',
  width: '30%',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,
  elevation: 2,
},

 sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 16,
    marginVertical: 10,
    color: '#086189',
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


workshopName: {
  fontSize: 20,
  fontWeight: '700',
  color: '#333',
},

status: {
  fontSize: 14,
  marginTop: 6,
  fontWeight: '600',
},

location: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
},
cancelButton: {
  backgroundColor: '#FF5252',
  marginRight: 10,
  width: 60,
  height: 30,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},

delayButton: {
  backgroundColor: '#2196F3',
  width: 60,
  height: 30,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},

rating: {
  fontSize: 14,
  color: '#666',
  marginTop: 2,
},
card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
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
  width: '100%',
  marginBottom: 20,
},
delayOptionText: {
  fontSize: 14,
  color: '#00796B',
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
  width: '30%', // تقريباً 3 أزرار في الصف
  paddingVertical: 12,
  backgroundColor: '#E0F7FA',
  borderRadius: 12,
  alignItems: 'center',
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

});
