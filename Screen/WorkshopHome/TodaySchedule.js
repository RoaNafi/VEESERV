
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../Components/Colors/Colors';

const TodaySchedule = ({ navigation, route }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { workshopId } = route.params;


  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.get(
        `http://176.119.254.225:80/mechanic/today/schedule?date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSchedule(response.data.schedule);
    } catch (err) {
      console.error('Error fetching workshop schedule:', err);
      Alert.alert('Error', 'Failed to fetch schedule.');
    } finally {
      setLoading(false);
    }
  };

  // تحويل الوقت إلى دقائق
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // دالة لإضافة وقت مشغول عبر API
  const markSlotBusy = async () => {
    if (!selectedSlot) return;
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('Fetched workshopId:', workshopId); // تحقق من صحة workshopId
      // نستخدم نفس الوقت كبداية ونهاية بـ 30 دقيقة (مثلا)
      const date = today;
      const time_start = `${selectedSlot}:00`;
      const startMinutes = timeToMinutes(selectedSlot);
      const endMinutes = startMinutes + 30;
      const hours = String(Math.floor(endMinutes / 60)).padStart(2, '0');
      const minutes = String(endMinutes % 60).padStart(2, '0');
      const time_end = `${hours}:${minutes}:00`;

      const res = await axios.post(
        `http://176.119.254.225:80/mechanic/availability-exception`,
        {
          date,
          time_start,
          time_end,
          status: 'unavailable', // أو 'closed' حسب اختيارك
          workshop_id: workshopId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Sending availability exception:', {
        date,
        time_start,
        time_end,
        status: 'unavailable',
        workshop_id: workshopId,
      });

      Alert.alert('Success', 'Time slot marked as busy!');
      setModalVisible(false);
      setSelectedSlot(null);
      fetchSchedule();
    } catch (err) {
      console.error('Error marking slot busy:', err);
      Alert.alert('Error', 'Failed to mark slot as busy.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#086189" />
      </View>
    );
  }

  return (
    <View style={styles.container}>


      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color="#A4C8E1" label="Available" />
        <LegendItem color={Colors.mediumGray} label="Busy" />
      </View>

      {/* Slots */}
      <ScrollView contentContainerStyle={styles.slotsContainer}>
        {schedule.map(({ time, status }, index) => {
          const isSelected = selectedSlot === time;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.slotBox,
                status === 'available' ? styles.availableSlot : styles.busySlot,
                isSelected && styles.selectedSlot,
              ]}
              disabled={status === 'busy'}
              onPress={() => {
                if (status === 'available') {
                  setSelectedSlot(time);
                  setModalVisible(true);
                }
              }}
            >
              <Text style={styles.availableText}>
                {time}
              </Text>
              {status === 'busy' && <FontAwesome5 name="lock" size={16} color={Colors.darkGray} />}
              {isSelected && <FontAwesome5 name="check-circle" size={20} color="#086189" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal لتأكيد وضع الوقت busy */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Mark {selectedSlot} as Busy?</Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalConfirmBtn]} onPress={markSlotBusy}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const LegendItem = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
    <View style={{ width: 20, height: 20, backgroundColor: color, marginRight: 6, borderRadius: 5, elevation: 3 }} />
    <Text style={{ color: '#333', fontWeight: '600', fontSize: 14 }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#086189',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  backBtn: { marginRight: 15 },
  headerText: { fontSize: 22, color: '#fff', fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  slotsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotBox: {
    width: '30%',
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  availableSlot: {
    backgroundColor: '#A4C8E1',
    borderColor: '#003B5C',
    borderWidth: 1.5,
  },
  busySlot: {
    backgroundColor: Colors.mediumGray,
    borderColor: '#003B5C',
    borderWidth: 1.5,
  },
  selectedSlot: {
    borderColor: '#086189',
    borderWidth: 2.5,
  },
  availableText: {
    color: '#003B5C',
    fontWeight: '600',
    fontSize: 16,
  },
  busyText: {
    color: '#512DA8',
    fontWeight: '600',
    fontSize: 16,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 25,
    elevation: 7,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 7,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  modalConfirmBtn: {
    backgroundColor: '#086189',
  },
  modalBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
});

export default TodaySchedule;
