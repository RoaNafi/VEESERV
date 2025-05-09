import React, { useState } from 'react';
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
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Colors from '../../Components/Colors/Colors';
import * as Location from 'expo-location'; // Import Location API

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05; // 5% of screen width
const responsiveVerticalPadding = height * 0.02; // 2% of screen height
const responsiveMargin = width * 0.03; // 3% of screen width
const responsiveButtonHeight = height * 0.06; // 6% of screen height
const responsiveBottomPadding = height * 0.1; // 10% of screen height
const responsiveFontSize = width * 0.04; // 4% of screen width

const MOCK_SERVICES = [
  { id: 2, name: 'Tire Rotation', price: 20 },
  { id: 3, name: 'Engine Check', price: 40 },
  { id: 4, name: 'Battery Replacement', price: 35 },
];

const Book = ({ route, navigation }) => {
  const { serviceData } = route.params;
  
  const { 
    service_name,
    workshop_name,
    price,
  } = serviceData;

  // Initialize with service from route params
  const [selectedServices, setSelectedServices] = useState([
    { id: 1, name: service_name || 'Service', price: price || 0 }
  ]);
  
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  // Address state
  const [address, setAddress] = useState({
    street: 'Al-Tireh Street',
    city: 'Ramallah',
    latitude: '',
    longitude: '',
  });
  
  // Loading state for location
  const [loadingLocation, setLoadingLocation] = useState(false);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

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

      let road = "Unknown Street";
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
          road = data.address?.road || "Unknown Street";
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
          street: road,
          city: city,
          latitude: latitude,
          longitude: longitude,
        });
        
        // Show success message
       // Alert.alert('Success', 'Location updated successfully!');
      } else {
        Alert.alert('Error', 'Could not determine coordinates.');
      }

    } catch (error) {
      Alert.alert('Error', `Location error: ${error.message}`);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleAddService = () => {
    const available = MOCK_SERVICES.filter(
      (s) => !selectedServices.some((sel) => sel.id === s.id)
    );
    if (available.length > 0) {
      setSelectedServices([...selectedServices, available[0]]);
    } else {
      alert('No more services to add.');
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

  const handleConfirmBooking = () => {
    navigation.navigate('Payment', {
      workshop_name,
      scheduledDate: scheduledDate.toISOString(), 
      location: `${address.street}, ${address.city}`,
      services: selectedServices,
      totalPrice,
      coordinates: {
        latitude: address.latitude,
        longitude: address.longitude
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
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
              <TouchableOpacity onPress={() => handleRemoveService(service.id)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddService}>
            <Text style={styles.addButtonText}>+ Add Another Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.innercard}>
          <Text style={styles.label}>Choose Date</Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.datePicker}>
            <Text style={styles.dateText}>{scheduledDate.toLocaleString()}</Text>
          </TouchableOpacity>
          
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            textColor={Platform.OS === 'ios' ? 'black' : undefined} // iOS only
            minimumDate={new Date()} // Prevent selecting past dates
          />
        </View>

        <View style={styles.innercard}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>
              {address.street}, {address.city}
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
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    padding: responsiveHorizontalPadding,
    backgroundColor: Colors.white,
  },
  innercard: {
    backgroundColor: Colors.lightGray,
    padding: responsiveHorizontalPadding,
    borderRadius: width * 0.03, // responsive border radius
    marginBottom: responsiveMargin,
  },
  line: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: responsiveMargin * 0.5,
  },
  title: {
    fontSize: responsiveFontSize * 1.4,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: responsiveMargin * 1.2,
    textAlign: 'center',
  },
  label: {
    fontSize: responsiveFontSize * 1.1,
    color: Colors.darkGray,
    marginBottom: responsiveMargin * 0.5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: responsiveFontSize,
    fontWeight: '600',
    color: Colors.black,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: responsiveHorizontalPadding * 0.6,
    borderRadius: width * 0.025,
    marginVertical: responsiveMargin * 0.4,
    alignItems: 'center',
  },
  serviceText: {
    fontSize: responsiveFontSize * 0.9,
    color: Colors.black,
  },
  removeText: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: responsiveFontSize * 1.2,
  },
  addButton: {
    marginTop: responsiveMargin * 0.6,
    backgroundColor: '#ddd',
    paddingVertical: responsiveVerticalPadding * 0.8,
    borderRadius: width * 0.025,
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.darkGray,
    fontWeight: 'bold',
    fontSize: responsiveFontSize * 0.9,
  },
  datePicker: {
    backgroundColor: Colors.lightGray,
    borderRadius: width * 0.02,
  },
  dateText: {
    fontSize: responsiveFontSize,
    color: Colors.green,
  },
  addressContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: width * 0.02,
  },
  addressText: {
    fontSize: responsiveFontSize,
    color: Colors.green,
  },

  input: {
    backgroundColor: Colors.white,
    padding: responsiveHorizontalPadding * 0.6,
    borderRadius: width * 0.02,
    marginTop: responsiveMargin * 0.6,
  },
  secondaryButton: {
    marginTop: responsiveMargin,
    backgroundColor: '#ddd',
    paddingVertical: responsiveVerticalPadding * 0.8,
    borderRadius: width * 0.025,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: responsiveFontSize * 0.9,
  },
  bottomPadding: {
    height: responsiveBottomPadding,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveHorizontalPadding,
    paddingTop: responsiveVerticalPadding,
    paddingBottom: responsiveVerticalPadding* 1.5,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    elevation: 8, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  priceContainer: {
    marginLeft: responsiveMargin,
    flex: 1,
    alignItems: 'flex-center',
  },
  priceLabel: {
    fontSize: responsiveFontSize * 0.9,
    color: Colors.darkGray,
  },
  priceValue: {
    fontSize: responsiveFontSize * 1.4,
    fontWeight: 'bold',
    color: Colors.black,
  },
  confirmButton: {
    backgroundColor: Colors.blue,
    paddingVertical: responsiveVerticalPadding,
    paddingHorizontal: responsiveHorizontalPadding,
    borderRadius: width * 0.03,
    flex: 1.5,
    alignItems: 'center',
    marginLeft: responsiveMargin,
    height: responsiveButtonHeight,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: responsiveFontSize,
    fontWeight: 'bold',
  },
});

export default Book;