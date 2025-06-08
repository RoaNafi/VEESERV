import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { config } from '../../../config';
import { useFocusEffect } from '@react-navigation/native';
import styles from './GarageStyle';
import Colors from '../../../Components/Colors/Colors';

const Garage = ({ navigation }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCars = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');

      const res = await axios.get(`${config.apiUrl}/vehicle/vehicles/${userId}?type=customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const carsFormatted = res.data.map(car => ({
        id: car.vehicle_id,
        name: `${car.make} ${car.model}`,
        year: car.year,
        engine: `${car.transmission?.toUpperCase()} | ${car.fuel_type?.toUpperCase()}`,
        quantity: car.quantity,
        isDefault: car.isdefault,
      }));

      setCars(carsFormatted);
      console.log('Cars fetched successfully:', carsFormatted);
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };
 const setDefaultCar = async (vehicleId) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    // لو عندك طريقة تفكيك التوكن لاستخراج userId، استخدمها هنا
    // فرضًا عندك userId مخزن مثلاً:
    const userId = await AsyncStorage.getItem('userId');

    await axios.put(
      `http://176.119.254.225:80/vehicle/vehicles/default/${vehicleId}`,
      { userId },  // هادي المهمة عشان توصل للسيرفر
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    Alert.alert('Success', 'Default car has been updated');
    fetchCars();
  } catch (err) {
    console.error('Error setting default car:', err);
    Alert.alert('Error', 'Failed to set default car');
  }
};




 const deleteCar = async (vehicleId) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    await axios.delete(`${config.apiUrl}/vehicle/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCars(prevCars => prevCars.filter(car => car.id !== vehicleId));
  } catch (err) {
    console.error('Error deleting car:', err);

const errorMsg = err.response?.data?.error || err.response?.data;
console.log('Error response:', err.response?.data);

   if (typeof errorMsg === 'string' && errorMsg.includes('Cannot delete vehicle with active or upcoming bookings')) {
  Alert.alert(
    'Cannot Delete Vehicle',
    'This vehicle has active or upcoming bookings. Please complete or cancel them first.'
  );
} else {
  Alert.alert('Error', 'Failed to delete car');
}
  }
};

  const confirmDelete = (vehicleId) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteCar(vehicleId) }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.shineBlue} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cars.length === 0 ? (
            <Text style={styles.noCarText}>No cars yet 🧍‍♂️</Text>
          ) : (
            cars.map((car) => (
              <View key={car.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.carInfo}>
                    <Text style={styles.carTitle}>
                      {car.name} <Text style={styles.carYear}>({car.year})</Text>
                    </Text>
                    <Text style={styles.carDetails}>{car.engine}</Text>
                    <Text style={styles.carDetails}>Quantity: {car.quantity}</Text>
                  </View>
                  {car.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, car.isDefault && styles.activeButton]} 
                    onPress={() => setDefaultCar(car.id)}
                  >
                    <Text style={[styles.actionButtonText, car.isDefault && styles.activeButtonText]}>
                      {car.isDefault ? 'Default' : 'Set as Default'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]} 
                    onPress={() => confirmDelete(car.id)}
                  >
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCar')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Garage;

