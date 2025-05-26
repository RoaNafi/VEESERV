import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Ionicons } from "@expo/vector-icons"; // Expo
import Colors from "../../Components/Colors/Colors";
import { CommonActions } from '@react-navigation/native';

const SplitBookingPage = ({ route, navigation }) => {
  const { splitMatches, date, timeSlots } = route.params;
  console.log("Split Matches:", splitMatches);
  const [bookings, setBookings] = useState(splitMatches);

  const [selectedCar, setSelectedCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    latitude: '',
    longitude: '',
  });

  const { showActionSheetWithOptions } = useActionSheet();

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

      if (!address) {
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

      console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        "http://176.119.254.225:80/booking/multiple",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
Alert.alert("Success ✅", "Booking done! Now sit tight while the mechanic checks and responds 👨‍🔧💬");
        // navigation.navigate("Payment", {
        //   bookings,
        //   totalPrice,
        //   address,
        //   selectedCar,
        //   date,
        //   timeSlots,
        // });
        navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainTabs',
                    state: {
                      routes: [{ name: 'Home' }],
                      index: 0,
                    },
                  },
                ],
              })
            );
      }
    } catch (err) {
      console.error("❌ Booking failed:", err.response?.data || err.message);
      Alert.alert(
        "Booking failed",
        err.response?.data?.error || "Unknown error"
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Car Selection Box */}
        <View style={styles.selectionBox}>
          <Text style={styles.selectionText}>
            {selectedCar ? (
              <Text>
                {selectedCar.make} {selectedCar.model} ({selectedCar.year})
              </Text>
            ) : (
              <Text>No car selected</Text>
            )}
          </Text>
          <TouchableOpacity onPress={handleOpenCarPicker} style={styles.btn}>
            <Text style={styles.btnText}>Choose a Car</Text>
          </TouchableOpacity>
        </View>

        {/* Bookings List */}
        {bookings.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.workshopName}>{item.workshop_name}</Text>

            <Text style={styles.detail}>
              <Text style={styles.label}>Service:</Text> {item.service?.name}
            </Text>

            <Text style={styles.detail}>
              <Text style={styles.label}>Price:</Text> {item.service?.price} ₪
            </Text>

            <Text style={styles.detail}>
              <Text style={styles.label}>Date:</Text> {date}
            </Text>

            <Text style={styles.detail}>
              <Text style={styles.label}>Time:</Text> {item.time || timeSlots}
            </Text>
          </View>
        ))}

        {/* Address Selection Box */}
        <View style={styles.selectionBox}>
          <Text style={styles.selectionLabel}>Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {address.street ? (
                <Text>
                  {address.street}
                  {address.city ? `, ${address.city}` : ''}
                </Text>
              ) : (
                <Text>No address set</Text>
              )}
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.bottomBar}>
          <View style={styles.priceWrapper}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalPrice}>{totalPrice} ₪</Text>
          </View>
          <TouchableOpacity
            onPress={handleConfirmBooking}
            style={styles.confirmBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f9fc",
  },
  header: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 25,
    color: "#086189",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
  },
  workshopName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#086189",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 30,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.blue,
  },
 

  selectionBox: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  selectionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#086189",
    marginBottom: 8,
  },
  selectionText: {
    fontSize: 18,
    color: "#555",
    marginBottom: 12,
    fontWeight: "800",
    alignContent: "center",
    textAlign: "center",
  },
  btn: {
    
    backgroundColor: "#086189",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 15,
    
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

fixedButtonContainer: {
  position: "absolute",
  bottom: 0, // Flush with bottom
  left: 0,
  right: 0,
},
bottomBar: {
 flexDirection: "row",
  backgroundColor: "#fff",
  paddingBottom: 20,
  paddingTop: 10,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "space-between",
  shadowColor: "#000",
  shadowOpacity: 0.3,         // Increased from 0.1
  shadowOffset: { width: 0, height: 10 }, // Deeper shadow
  shadowRadius: 12,            // Softer blur spread
  elevation: 12,    
},
priceWrapper: {
  flexDirection: "column",
  justifyContent: "center",
},

confirmBtn: {
  backgroundColor: "#086189",
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  height:"100%",
  shadowColor: "#086189",
},

confirmBtnText: {
  color: "white",
  fontSize: 16,
  fontWeight: "800",
  letterSpacing: 1,
},

addressContainer: {
  backgroundColor: '#F0F4F8',
  padding: 12,
  borderRadius: 8,
  marginBottom: 12,
},
addressText: {
  fontSize: 16,
  color: '#444',
  fontWeight: '500',
},
secondaryButton: {
  backgroundColor: '#08618910',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
secondaryButtonText: {
  color: '#086189',
  fontWeight: '600',
  fontSize: 16,
},
disabledButton: {
  opacity: 0.7,
},

});

export default SplitBookingPage;
