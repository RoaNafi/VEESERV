import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Ionicons } from "@expo/vector-icons"; // Expo
import Colors from "../../Components/Colors/Colors";
import { CommonActions, useNavigation } from '@react-navigation/native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05;
const responsiveVerticalPadding = height * 0.02;
const responsiveMargin = width * 0.03;
const responsiveButtonHeight = height * 0.06;
const responsiveBottomPadding = height * 0.1;
const responsiveFontSize = width * 0.04;

const SplitBookingPage = ({ route, navigation }) => {
  const { splitMatches, date, timeSlots } = route.params;
  console.log("Split Matches:", splitMatches);
  const [bookings, setBookings] = useState(splitMatches);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    latitude: '',
    longitude: '',
  });

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    if (showConfirmation) {
      // Disable back gesture and button
      navigation.setOptions({
        headerLeft: () => null,
        gestureEnabled: false,
      });

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

  // جلب السيارة الافتراضية عند فتح الصفحة
  useEffect(() => {
    const fetchDefaultCar = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const userId = await AsyncStorage.getItem("userId");

        const res = await axios.get(
          `http://176.119.254.225:80/vehicle/vehicles/default/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSelectedCar(res.data);
      } catch (err) {
        console.error("Error fetching default car:", err);
      }
    };

    fetchDefaultCar();
  }, []);

  // دالة عرض اختيار السيارة
  const handleOpenCarPicker = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const res = await axios.get(
        `http://176.119.254.225:80/vehicle/vehicles/${userId}`
      );

      setAllCars(res.data);

      const options = res.data.map(
        (car) => `${car.make} ${car.model} (${car.year})`
      );
      options.push("Cancel");

      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: "Select a Car",
        },
        (selectedIndex) => {
          if (
            selectedIndex !== undefined &&
            selectedIndex !== options.length - 1
          ) {
            setSelectedCar(res.data[selectedIndex]);
          }
        }
      );
    } catch (err) {
      console.error("Error fetching all vehicles:", err);
    }
  };

  // دالة جلب الموقع الحالي والعنوان
  const handleGetLocation = async () => {
    setLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission not granted.");
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      console.log("Latitude:", latitude, "Longitude:", longitude);

      let suburb = "";
      let city = "";

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          {
            headers: { "User-Agent": "veeserv-app/1.0" },
          }
        );

        if (response.ok) {
          const data = await response.json();

          // Use suburb (e.g., Bab al-Amari) instead of road
          suburb = data.address?.suburb || data.address?.residential || "";
          city = data.address?.city || data.address?.town || data.address?.village || "";

          console.log("Address data:", data.address);
        } else {
          console.warn("🌐 API response not OK, using fallback address.");
        }
      } catch (apiError) {
        console.warn("🌐 API fetch failed, using fallback address:", apiError);
      }

      if (latitude && longitude) {
        setAddress({
          street: suburb,
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
      console.log("Location error:", error);
      Alert.alert("Error", `Location error: ${error.message}`);
    } finally {
      setLoadingLocation(false);
    }
  };

  // حساب السعر الكلي
  const totalPrice = bookings.reduce(
    (acc, item) => acc + item.service?.price,
    0
  );

  const handleConfirmBooking = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!selectedCar) {
        Alert.alert("Please select a car first");
        return;
      }

      if (!address.street) {
        Alert.alert("Please provide a location");
        return;
      }

      const userId = await AsyncStorage.getItem("userId");
      const payload = {
        bookings: bookings.map((item) => ({
          workshop_id: item.workshop_id,
          scheduled_date: date,
          time: item.time || timeSlots[item.workshop_id],
          vehicle_id: selectedCar?.vehicle_id,
          services: Array.isArray(item.services)
            ? item.services.map((service) => ({
                service_id: service.id || service.service_id,
                price: service.price,
              }))
            : [
                {
                  service_id: item.service?.id || item.service?.service_id,
                  price: item.service?.price,
                },
              ],
        })),
        totalPrice: totalPrice,
        address: {
          address_id: address?.address_id,
          street: address?.street,
          city: address?.city,
        },
        temporary: true,
      };

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
                Your booking request has been sent to the workshops. Please wait for their confirmation before proceeding with payment.
              </Text>
            </View>
          </Animated.View>
        )}

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

        {/* Bookings List */}
        <View style={styles.sectionTitle}>
          <Ionicons name="list-outline" size={20} color="#086189" />
          <Text style={styles.sectionTitleText}>Booking Summary</Text>
        </View>

        {bookings.map((item, index) => (
          <View key={index} style={[styles.bookingCard, showConfirmation && styles.disabledButton]}>
            <View style={styles.workshopHeader}>
              <Ionicons name="business-outline" size={20} color="#086189" />
              <Text style={styles.workshopName}>{item.workshop_name}</Text>
            </View>

            <View style={styles.serviceDetailsRow}>
              <View style={styles.serviceNameCell}>
                <Text style={styles.serviceNameText}>{item.service?.name}</Text>
              </View>
              <View style={styles.servicePriceCell}>
                <Text style={styles.servicePrice}>{item.service?.price}₪</Text>
              </View>
            </View>

            <View style={styles.bookingDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#086189" />
                <Text style={styles.detailText}>{date}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color="#086189" />
                <Text style={styles.detailText}>{item.time || timeSlots[item.workshop_id]}</Text>
              </View>
            </View>
          </View>
        ))}

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
  container: {
    padding: responsiveHorizontalPadding,
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
  bookingCard: {
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
  workshopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: responsiveVerticalPadding * 0.8,
  },
  workshopName: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '600',
  },
  serviceDetailsRow: {
    flexDirection: 'row',
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
  servicePrice: {
    fontSize: responsiveFontSize,
    color: '#086189',
    fontWeight: '600',
  },
  bookingDetails: {
    marginTop: responsiveVerticalPadding * 0.8,
    gap: 8,
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
    textAlign: "center",
  },
  confirmationText: {
    fontSize: responsiveFontSize * 0.9,
    color: '#666',
    textAlign: 'center',
    lineHeight: responsiveFontSize * 1.4,
  },
});

export default SplitBookingPage;
