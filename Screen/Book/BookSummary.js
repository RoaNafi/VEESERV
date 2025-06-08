import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import Colors from '../../Components/Colors/Colors';
import * as Location from 'expo-location'; // Import Location API
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';

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
  const { data, date, timeSlots } = route.params;
  const { service_name, workshop_name, price, service_id, workshop_id } = data;
  const [showConfirmation, setShowConfirmation] = useState(false);

  //console.log("Workshop Data:", data);
  //console.log("Date:", date);
  //console.log("Time Slots:", timeSlots);
  console.log("Initial Car:", selectedCar);

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
  const [selectedCar, setSelectedCar] = useState(null);
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Always fetch the default car first
    fetchDefaultCar();
    // Also fetch all cars for the picker
    fetchAllCars();
  }, []);

  useEffect(() => {
    if (showConfirmation) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      pulseAnim.setValue(1);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    }
  }, [showConfirmation]);

  useEffect(() => {
    if (showConfirmation) {
      // Disable back gesture and button
      navigation.setOptions({
        headerLeft: () => null,
        gestureEnabled: false,
      });
    }
  }, [showConfirmation]);

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
    if (data?.workshop_id) {
      fetchServices(data.workshop_id);
    }
  }, [data]);

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
      workshop_id: data.workshop_id,
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
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!selectedCar) {
        Alert.alert("Please select a car first");
        return;
      }

      // if (!address.street) {
      //   Alert.alert("Please provide a location");
      //   return;
      // }

      const payload = {
        bookings: [{
          workshop_id: data.workshop_id,
          scheduled_date: date,
          time: timeSlots,
          vehicle_id: selectedCar?.vehicle_id,
          services: data.services.map(service => ({
            service_id: service.service_id,
            price: service.price
          }))
        }],
        totalPrice: totalPrice,
        address: {
          address_id: address?.address_id,
          street: address?.street,
          city: address?.city,
        },
        temporary: true,
      };

      console.log('📦 Booking Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "http://176.119.254.225:80/booking/multiple",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setShowConfirmation(true);
      }
    } catch (err) {
      console.error("❌ Booking failed:", err.response?.data || err.message);
      Alert.alert(
        "Booking failed",
        err.response?.data?.error || "Unknown error"
      );
    }
  };

  const handleGoToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Home' }], index: 0 } }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {showConfirmation && (
          <Animated.View 
            style={[
              styles.confirmationCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.confirmationContent}>
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <Ionicons name="time-outline" size={50} color={Colors.green} />
              </Animated.View>
              <Text style={styles.confirmationTitle}>Waiting for Workshop Confirmation</Text>
              <Text style={styles.confirmationText}>
                Your booking request has been sent to the workshop. Please wait for their confirmation before proceeding with payment.
              </Text>
            </View>
          </Animated.View>
        )}
<View style={styles.sectionTitle}>
          <Ionicons name="list" size={20} color="#086189" />
          <Text style={styles.sectionTitleText}>Summary</Text>
        </View>

        {/* Booking Summary */}
        <View style={[styles.summaryCard, showConfirmation && styles.disabledButton]}>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="business-outline" size={20} color="#086189" />
                <Text style={styles.summaryLabel}>Workshop</Text>
              </View>
              <Text style={styles.summaryValue}>{workshop_name}</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="construct-outline" size={20} color="#086189" />
                <Text style={styles.summaryLabel}>Service</Text>
              </View>
            </View>
            {data.services && data.services.map((service, index) => (
              <View key={index} style={styles.serviceDetailsRow}>
                <View style={styles.serviceNameCell}>
                  <Text style={styles.serviceNameText}>
                    {service.service_name || service.name}
                  </Text>
                </View>
                <View style={styles.servicePriceCell}>
                  <Text style={styles.servicePrice}>{service.price}₪</Text>
                </View>
              </View>
            ))}

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="calendar-outline" size={20} color="#086189" />
                <Text style={styles.summaryLabel}>Date & Time</Text>
              </View>
            </View>
            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#086189" />
                <Text style={styles.detailText}>{date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#086189" />
                <Text style={styles.detailText}>{timeSlots}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={styles.sectionTitle}>
          <Ionicons name="car-outline" size={20} color="#086189" />
          <Text style={styles.sectionTitleText}>Vehicle</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.vehicleButton, showConfirmation && styles.disabledButton]} 
          onPress={handleOpenCarPicker}
          disabled={showConfirmation}
        >
          {selectedCar ? (
            <View style={styles.vehicleInfo}>
              <Text style={[styles.vehicleText, showConfirmation && styles.disabledText]}>
                {selectedCar.make} {selectedCar.model} ({selectedCar.year})
              </Text>
              {!showConfirmation && <Ionicons name="chevron-forward" size={20} color="#666" />}
            </View>
          ) : (
            <View style={styles.vehicleInfo}>
              <Text style={[styles.selectVehicleText, showConfirmation && styles.disabledText]}>
                Select Vehicle
              </Text>
              {!showConfirmation && <Ionicons name="chevron-forward" size={20} color="#666" />}
            </View>
          )}
        </TouchableOpacity>

        {/* Location Selection */}
        <View style={styles.sectionTitle}>
          <Ionicons name="location-outline" size={20} color="#086189" />
          <Text style={styles.sectionTitleText}>My Address</Text>
        </View>

        <View style={[styles.locationCard, showConfirmation && styles.disabledButton]}>
          <View style={styles.locationContent}>
            <Text style={[styles.locationText, showConfirmation && styles.disabledText]}>
              {address.street} {address.city}
            </Text>
            <TouchableOpacity 
              style={[styles.locationButton, (loadingLocation || showConfirmation) && styles.disabledButton]}
              onPress={handleGetLocation}
              disabled={loadingLocation || showConfirmation}
            >
              <Ionicons name="locate-outline" size={20} color={showConfirmation ? "#999" : "#086189"} />
              <Text style={[styles.locationButtonText, showConfirmation && styles.disabledText]}>
                {loadingLocation ? 'Getting Location...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {showConfirmation ? (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={handleGoToHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
            <Ionicons name="home-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirmBooking}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#086189',
    paddingVertical: responsiveVerticalPadding,
    paddingHorizontal: responsiveHorizontalPadding,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: responsiveFontSize * 1.1,
    fontWeight: '700',
  },
  container: {
    padding: responsiveHorizontalPadding,
  },
  serviceCard: {
    backgroundColor: '#086189',
    borderRadius: width * 0.035,
    marginBottom: responsiveMargin * 1.5,
    overflow: 'hidden',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: responsiveHorizontalPadding,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  serviceTitle: {
    color: '#fff',
    fontSize: responsiveFontSize * 1.1,
    fontWeight: '700',
  },
  serviceContent: {
    padding: responsiveHorizontalPadding,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveVerticalPadding * 0.8,
  },
  serviceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: responsiveFontSize * 0.9,
  },
  serviceValue: {
    color: '#fff',
    fontSize: responsiveFontSize * 0.9,
    fontWeight: '500',
  },
  priceContainer: {
    marginTop: responsiveVerticalPadding,
    paddingTop: responsiveVerticalPadding,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#fff',
    fontSize: responsiveFontSize,
    fontWeight: '600',
  },
  priceValue: {
    color: '#fff',
    fontSize: responsiveFontSize * 1.2,
    fontWeight: '700',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: responsiveVerticalPadding * 0.8,
    marginTop: responsiveVerticalPadding,
  },
  sectionTitleText: {
    fontSize: responsiveFontSize,
    color: '#086189',
    fontWeight: '600',
  },
  vehicleButton: {
    backgroundColor: '#fff',
    borderRadius: width * 0.025,
    padding: responsiveHorizontalPadding,
    marginBottom: responsiveMargin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '500',
  },
  selectVehicleText: {
    fontSize: responsiveFontSize,
    color: '#086189',
    fontWeight: '500',
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: width * 0.025,
    padding: responsiveHorizontalPadding,
    marginBottom: responsiveMargin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  locationContent: {
    gap: responsiveVerticalPadding * 0.8,
  },
  locationText: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '500',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F8',
    paddingVertical: responsiveVerticalPadding * 0.8,
    borderRadius: width * 0.025,
    gap: 8,
  },
  locationButtonText: {
    color: '#086189',
    fontSize: responsiveFontSize * 0.9,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
   // backgroundColor: Colors.lightGray,
  },
  disabledText: {
    color: '#999',
  },
  bottomPadding: {
    height: height * 0.15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: responsiveHorizontalPadding,
    paddingBottom: responsiveVerticalPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: '#086189',
    paddingVertical: responsiveVerticalPadding,
    borderRadius: width * 0.035,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: width * 0.035,
    marginBottom: responsiveMargin * 1.2,
    marginTop: responsiveMargin * 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  
  summaryContent: {
    padding: responsiveHorizontalPadding,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveVerticalPadding * 0.6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: responsiveFontSize * 0.9,
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  summaryValueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  summaryValue: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  servicePrice: {
    fontSize: responsiveFontSize,
    color: '#086189',
    fontWeight: '600',
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    paddingHorizontal: responsiveHorizontalPadding,
    paddingVertical: responsiveVerticalPadding * 0.6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceNameCell: {
    flex: 1,
  },
  serviceNameText: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '500',
  },
  servicePriceCell: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  confirmationCard: {
    backgroundColor: '#F8FFF8',
    borderRadius: width * 0.035,
    marginBottom: responsiveMargin * 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 0, 0.1)',
  },
  confirmationContent: {
    padding: responsiveHorizontalPadding * 1.2,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: responsiveFontSize * 1.2,
    fontWeight: '600',
    color: Colors.green,
    marginTop: responsiveVerticalPadding * 0.8,
    marginBottom: responsiveVerticalPadding * 0.4,
    textAlign:"center",
  },
  confirmationText: {
    fontSize: responsiveFontSize * 0.9,
    color: '#666',
    textAlign: 'center',
    lineHeight: responsiveFontSize * 1.4,
  },
  homeButton: {
    backgroundColor: Colors.green,
    paddingVertical: responsiveVerticalPadding,
    borderRadius: width * 0.035,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize,
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginTop: responsiveVerticalPadding * 0.8,
    gap: 8,
    paddingHorizontal: responsiveHorizontalPadding,
    paddingBottom: responsiveVerticalPadding * 0.6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: responsiveFontSize * 0.9,
    color: '#666',
  },
});

export default Book;