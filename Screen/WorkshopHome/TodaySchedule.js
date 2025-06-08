import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../Components/Colors/Colors';

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM"
];

const TodaySchedule = ({ route, navigation }) => {
  const { workshopId, appointments } = route.params;
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(
        `http://176.119.254.225:80/mechanic/schedule/${workshopId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Process the schedule data
      const booked = appointments.map(apt => apt.time);
      const blocked = response.data.blockedSlots || [];
      
      setBookedSlots(booked);
      setBlockedSlots(blocked);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      Alert.alert('Error', 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotStatus = async (timeSlot) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const isBlocked = blockedSlots.includes(timeSlot);
      
      const response = await axios.post(
        `http://176.119.254.225:80/mechanic/schedule/${workshopId}/toggle-slot`,
        {
          timeSlot,
          action: isBlocked ? 'unblock' : 'block'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setBlockedSlots(prev => 
          isBlocked 
            ? prev.filter(slot => slot !== timeSlot)
            : [...prev, timeSlot]
        );
      }
    } catch (error) {
      console.error('Error toggling slot:', error);
      Alert.alert('Error', 'Failed to update slot status');
    }
  };

  const getSlotStatus = (timeSlot) => {
    if (bookedSlots.includes(timeSlot)) return 'booked';
    if (blockedSlots.includes(timeSlot)) return 'blocked';
    return 'available';
  };

  const getSlotStyle = (status) => {
    switch (status) {
      case 'booked':
        return styles.bookedSlot;
      case 'blocked':
        return styles.blockedSlot;
      default:
        return styles.availableSlot;
    }
  };

  const getSlotTextStyle = (status) => {
    switch (status) {
      case 'booked':
        return styles.bookedText;
      case 'blocked':
        return styles.blockedText;
      default:
        return styles.availableText;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.shineBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={20} color={Colors.shineBlue} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
      </View>

      <ScrollView style={styles.scheduleContainer}>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.availableSlot]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.bookedSlot]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.blockedSlot]} />
            <Text style={styles.legendText}>Blocked</Text>
          </View>
        </View>

        <View style={styles.timeSlotsContainer}>
          {TIME_SLOTS.map((timeSlot) => {
            const status = getSlotStatus(timeSlot);
            const isBooked = status === 'booked';

            return (
              <TouchableOpacity
                key={timeSlot}
                style={[styles.timeSlot, getSlotStyle(status)]}
                onPress={() => !isBooked && toggleSlotStatus(timeSlot)}
                disabled={isBooked}
              >
                <Text style={[styles.timeText, getSlotTextStyle(status)]}>
                  {timeSlot}
                </Text>
                {isBooked && (
                  <FontAwesome5 name="lock" size={14} color="#fff" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.shineBlue,
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableSlot: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  bookedSlot: {
    backgroundColor: '#2196F3',
  },
  blockedSlot: {
    backgroundColor: '#FFCDD2',
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  availableText: {
    color: '#2E7D32',
  },
  bookedText: {
    color: '#fff',
  },
  blockedText: {
    color: '#C62828',
  },
});

export default TodaySchedule; 