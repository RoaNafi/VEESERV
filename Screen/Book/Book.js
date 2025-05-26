import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Colors from '../../Components/Colors/Colors';
import * as Location from 'expo-location'; // Import Location API
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useActionSheet } from '@expo/react-native-action-sheet';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05; // 5% of screen width
const responsiveVerticalPadding = height * 0.02; // 2% of screen height
const responsiveMargin = width * 0.03; // 3% of screen width
const responsiveButtonHeight = height * 0.06; // 6% of screen height
const responsiveBottomPadding = height * 0.1; // 10% of screen height
const responsiveFontSize = width * 0.04; // 4% of screen width


const Book = ({ route, navigation }) => {
  const { workshopData, date, timeSlots, selectedCar: initialCar } = route.params;
  const { service_name, workshop_name, price, service_id, workshop_id } = workshopData;

  console.log("Workshop Data:", workshopData);
  console.log("Date:", date);
  console.log("Time Slots:", timeSlots);
  console.log("Initial Car:", initialCar);

  // Initialize with service from route params
  const [selectedServices, setSelectedServices] = useState([
    { 
      id: service_id,
      service_id: service_id,
      name: service_name,
      price: price
    }
  ]);
  const { showActionSheetWithOptions } = useActionSheet();

  const [scheduledDate, setScheduledDate] = useState(new Date(date));
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedCar, setSelectedCar] = useState(initialCar);
  const [allCars, setAllCars] = useState([]);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Address state
  const [address, setAddress] = useState({
    street: '',
    city: '',
    latitude: '',
    longitude: '',
  });
  
  // Loading state for location
  const [loadingLocation, setLoadingLocation] = useState(false);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    // If no car is selected, fetch the default car
    if (!selectedCar) {
      fetchDefaultCar();
    }
    // Also fetch all cars for the picker
    fetchAllCars();
  }, []);

  const fetchDefaultCar = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');

      const res = await axios.get(`http://176.119.254.225:80/vehicle/vehicles/default/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setSelectedCar(res.data);
      }
    } catch (err) {
      console.error('Error fetching default car:', err);
      Alert.alert('Error', 'Could not fetch default car. Please select a car manually.');
    }
  };

  const fetchAllCars = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userId = await AsyncStorage.getItem('userId');
      
      const res = await axios.get(`http://176.119.254.225:80/vehicle/vehicles/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setAllCars(res.data);
    } catch (err) {
      console.error('Error fetching all cars:', err);
    }
  };

  const handleOpenCarPicker = async () => {
    if (allCars.length === 0) {
      await fetchAllCars();
    }

    const options = allCars.map(car => `${car.make} ${car.model} (${car.year})`);
    options.push('Cancel');

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Select a Car',
      },
      selectedIndex => {
        if (selectedIndex !== undefined && selectedIndex !== options.length - 1) {
          setSelectedCar(allCars[selectedIndex]);
        }
      }
    );
  };

  // Handle get current location functionality
  const handleGetLocation = async () => {
    setLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission not granted.');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      console.log("Latitude:", latitude, "Longitude:", longitude);

      let suburb = "Unknown Area";
      let city = "Unknown City";

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          {
            headers: {
              'User-Agent': 'veeserv-app/1.0',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Use suburb (e.g., Bab al-Amari) instead of road
          suburb = data.address?.suburb || data.address?.residential || "Unknown Area";
          city = data.address?.city || data.address?.town || data.address?.village || "Unknown City";

          console.log("Address data:", data.address);
        } else {
          console.warn("🌐 API response not OK, using fallback address.");
        }
      } catch (apiError) {
        console.warn("🌐 API fetch failed, using fallback address:", apiError);
      }

      if (latitude && longitude) {
        setAddress({
          street: suburb,  // 👈 here we're using suburb as the 'street'
          city: city,
          latitude: latitude,
          longitude: longitude,
        });

        console.log("Set address:", {
          street: suburb,
          city: city,
          latitude,
          longitude,
        });

      } else {
        Alert.alert('Error', 'Could not determine coordinates.');
      }

    } catch (error) {
      Alert.alert('Error', `Location error: ${error.message}`);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleRemoveService = (id) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== id));
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    setScheduledDate(date);
    hideDatePicker();
  };

  useEffect(() => {
    if (workshopData?.workshop_id) {
      fetchServices(workshopData.workshop_id);
    }
  }, [workshopData]);

  // Fetch services for this workshop
  const fetchServices = async (workshopId) => {
    try {
      const res = await axios.get(`http://176.119.254.225:80/service/workshops/${workshopId}/services`);
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Replace your current handleAddService:
  const handleAddService = () => {
    setModalVisible(true);
  };

  // New: when user taps one in the list
  const handleSelectService = (service) => {
    // only add if not already selected
    if (!selectedServices.some(s => s.service_id === service.service_id)) {
      setSelectedServices([...selectedServices, {
        id: service.service_id,
        name: service.service_name,
        price: service.price,
        service_id: service.service_id
      }]);
    }
    setModalVisible(false);
  };

  const groupServicesByWorkshop = (services) => {
    return [{
      workshop_id: workshopData.workshop_id,
      services,
      scheduled_date: date,
      time: timeSlots,
      location: `${address.street}, ${address.city}`,
      coordinates: {
        latitude: address.latitude,
        longitude: address.longitude
      }
    }];
  };
  const serviceDisplayData = selectedServices.map(s => ({
    name: s.service_name || s.name, // تأكد إنك تقدر تجيب الاسم من أي مفتاح موجود
    price: s.price,
  }));
  const handleConfirmBooking = async () => {
    const bookingGroups = groupServicesByWorkshop(selectedServices);

    const payload = bookingGroups.map(group => ({
      workshop_id: group.workshop_id,
      vehicle_id: selectedCar?.vehicle_id, // ✅ أضفنا الـ vehicle_id

      services: group.services.map(service => ({
        service_id: service.id,
        price: service.price
      })),
      scheduled_date: group.scheduled_date,
      time: group.time,
      location: group.location,
      coordinates: group.coordinates
    }));

    console.log('📦 Booking payload:', JSON.stringify({ bookings: payload }, null, 2));

    const token = await AsyncStorage.getItem('accessToken');

    try {
      const response = await fetch('http://176.119.254.225:80/booking/multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      body: JSON.stringify({
        bookings: payload,
        address,
        temporary: true, // or false if you have saved addresses
        totalPrice
      })
      });

      const result = await response.json();
      if (response.ok) {
        console.log('✅ Booking confirmed:', result);
        Alert.alert('Booking Confirmed', 'Your booking has been confirmed successfully!');
        
        navigation.navigate('Payment', {
          bookings: payload,
          totalPrice,
          workshop_name,
          address,
          date: scheduledDate,
          time: timeSlots,
          services: serviceDisplayData
        });
      } else {
        console.error('❌ Booking failed:', result);
        Alert.alert('Booking Failed', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('🔥 Error confirming booking:', error);
      Alert.alert('Error', 'Could not confirm booking. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.innercard}>
          <Text style={styles.label}>Car</Text>

          <Text style={styles.value}>
            {selectedCar ? `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})` : 'No car selected'}
          </Text>

          <TouchableOpacity style={styles.changeButton} onPress={handleOpenCarPicker}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.innercard}>
          <Text style={styles.label}>Workshop</Text>
          <Text style={styles.value}>{workshop_name}</Text>
        </View>
        
        <View style={styles.innercard}>
          <Text style={styles.label}>Services</Text>
          {selectedServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <Text style={styles.serviceText}>
                {service.name} - {service.price}₪
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.innercard}>
          <Text style={styles.label}>Date & time </Text>
          <Text style={styles.value}>{date} {timeSlots}</Text>
        </View>

        <View style={styles.innercard}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {address.street} {address.city}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.secondaryButton, loadingLocation && styles.disabledButton]}
            onPress={handleGetLocation}
            disabled={loadingLocation}
          >
            <Text style={styles.secondaryButtonText}>
              {loadingLocation ? 'Getting Location...' : 'Use My Current Location'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Add bottom padding to prevent content from being hidden behind footer */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Fixed footer with price and confirm button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>{totalPrice}₪</Text>
        </View>
        
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
      <Modal
  visible={modalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Select a Service</Text>
      <ScrollView>
        {services.map(service => (
          <TouchableOpacity
            key={service.service_id}
            style={styles.modalServiceItem}
            onPress={() => handleSelectService(service)}
          >
            <View>
              <Text style={styles.serviceName}>{service.service_name}</Text>
              <Text style={styles.serviceDescription}>{service.service_description}</Text>
            </View>
            <Text style={styles.servicePrice}>{service.price}₪</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={styles.modalCloseButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.modalCloseText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
};


// Updated styles snippet only (reuse your JSX layout)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Softer background
  },
  container: {
    padding: responsiveHorizontalPadding,
  },
  innercard: {
    backgroundColor: Colors.white,
    padding: responsiveHorizontalPadding * 1.1,
    borderRadius: width * 0.035,
    marginBottom: responsiveMargin * 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: responsiveFontSize * 1.2,
    color: '#086189',
    fontWeight: '700',
    marginBottom: responsiveMargin * 0.6,
  },
  value: {
    fontSize: responsiveFontSize * 1.05,
    color: Colors.black,
    fontWeight: '600',
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0F4F8',
    padding: responsiveHorizontalPadding * 0.8,
    borderRadius: width * 0.03,
    marginVertical: responsiveMargin * 0.4,
    alignItems: 'center',
  },
  serviceText: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '500',
  },
  addressText: {
    fontSize: responsiveFontSize,
    color: '#444',
    fontWeight: '500',
  },
  secondaryButton: {
    marginTop: responsiveMargin,
    backgroundColor: '#08618910',
    paddingVertical: responsiveVerticalPadding,
    borderRadius: width * 0.03,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#086189',
    fontWeight: '600',
    fontSize: responsiveFontSize,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveHorizontalPadding,
    paddingTop: responsiveVerticalPadding,
    paddingBottom: responsiveVerticalPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: responsiveFontSize * 0.9,
    color: '#888',
  },
  priceValue: {
    fontSize: responsiveFontSize * 1.4,
    fontWeight: 'bold',
    color: '#111',
  },
  confirmButton: {
    backgroundColor: '#086189',
    paddingVertical: responsiveVerticalPadding,
    paddingHorizontal: responsiveHorizontalPadding * 1.2,
    borderRadius: width * 0.035,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: responsiveMargin,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize,
    fontWeight: 'bold',
  },
 

changeText: {
  color: '#fff',
  fontWeight: '600',
},
changeButton: {
  marginTop: 8,
  alignSelf: 'flex-start',
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: '#086189',
  borderRadius: 8,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '90%',
  maxHeight: '70%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
},
modalTitle: {
  fontSize: responsiveFontSize * 1.1,
  fontWeight: '700',
  color: '#086189',
  marginBottom: 12,
},
modalServiceItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: '#eee',
},
serviceName: {
  fontSize: responsiveFontSize,
  fontWeight: '600',
},
serviceDescription: {
  fontSize: responsiveFontSize * 0.85,
  color: '#666',
},
servicePrice: {
  fontSize: responsiveFontSize,
  fontWeight: '600',
  color: '#086189',
},
modalCloseButton: {
  marginTop: 16,
  backgroundColor: '#086189',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
modalCloseText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: responsiveFontSize,
},


});
export default Book;