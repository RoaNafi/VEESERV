import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { config } from '../../../config'; // for API URL
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
        isDefault: false,
      }));

      setCars(carsFormatted);
    } catch (err) {
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCar = async (vehicleId) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      await axios.delete(`${config.apiUrl}/vehicle/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the deleted car from the state
      setCars((prevCars) => prevCars.filter((car) => car.id !== vehicleId));
    } catch (err) {
      console.error('Error deleting car:', err);
    }
  };

  const confirmDelete = (vehicleId) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteCar(vehicleId),
        },
      ]
    );
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#086189" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cars.length === 0 ? (
            <Text style={styles.noCarText}>No cars yet 🧍‍♂️</Text>
          ) : (
            cars.map((car) => (
              <View key={car.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.carInfo}>
                    <Ionicons name="car-outline" size={32} color="#086189" style={styles.carIcon} />
                    <View>
                      <Text style={styles.carTitle}>
                        {car.name} <Text style={styles.carYear}>({car.year})</Text>
                      </Text>
                      <Text style={styles.carDetails}>{car.engine}</Text>
                    </View>
                  </View>
                  {car.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity>
                    <Ionicons
                      name={car.isDefault ? 'star' : 'star-outline'}
                      size={24}
                      color={car.isDefault ? '#FFD700' : '#888'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(car.id)}>
                    <MaterialIcons name="delete" size={24} color="#e74c3c" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  carIcon: {
    marginRight: 8,
    fontSize: 40,
    color: '#086189',
  },
  carTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#086189',
  },
  carYear: {
    fontSize: 16,
    color: '#555',
  },
  carDetails: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: '#d1f2eb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 13,
    color: '#086189',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 20,
  },
  noCarText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#086189',
    borderRadius: 30,
    padding: 16,
    elevation: 4,
  },
});
