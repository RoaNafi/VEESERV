import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, TextInput, ActivityIndicator } from 'react-native'
import React, { useState , useEffect} from 'react'
import Colors from '../../Components/Colors/Colors';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import api from '../../api'; // Adjust the import based on your project structure



const EmergencyServices = ({ route }) => {
  const { type  } = route.params || {};
  const navigation = useNavigation();
const [servicesByType, setServicesByType] = useState({});

  // Address modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [address, setAddress] = useState(userAddress || '');
  const [loadingLocation, setLoadingLocation] = useState(false);
const fetchEmergencyServices = async () => {
  try {
    const res = await api.get('/emergency/emergencyService');
    const services = res.data.emergencyServices;

    // تصنيف الخدمات حسب category
    const grouped = services.reduce((acc, service) => {
      const category = service.category?.toLowerCase() || 'other';
      //console.log(`Service: ${service.name}, Category: ${category}`); // 👈 اطبعي كل خدمة مع تصنيفها
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        name: service.name,
        description: service.description,
        emergency_service_id: service.emergency_service_id, 
      });
      return acc;
    }, {});


    setServicesByType(grouped);
    //console.log("Fetched Emergency Services:", grouped); // 👈 اطبعيهم هون
  } catch (err) {
    console.error('Error fetching emergency services:', err);
    Alert.alert('Error', 'Failed to load emergency services');
  }
};

// استدعِ الدالة عند التحميل الأول
useEffect(() => {
  fetchEmergencyServices();
}, []);
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
      let street = 'Unknown Street';
      let city = 'Unknown City';
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
          headers: { 'User-Agent': 'veeserv-app/1.0' },
        });
        if (response.ok) {
          const data = await response.json();
          const road = data.address?.road || data.address?.street || data.address?.suburb || 'Unknown Street';
          const cityName = data.address?.city || data.address?.town || data.address?.village || 'Unknown City';
          const latitude = data.lat || latitude;
          const longitude = data.lon || longitude;
          //console.log(`Location: ${road}, ${cityName} (Lat: ${latitude}, Lon: ${longitude})`);
          setAddress(`${road}, ${cityName} (Lat: ${latitude}, Lon: ${longitude})`);
          setUserAddress({
            road: road,
            city: cityName,
            latitude: latitude,
            longitude: longitude
          });

        } else {
          setAddress('Address lookup failed');
        }
      } catch (apiError) {
        setAddress('Location service unavailable');
      }
    } catch (error) {
      Alert.alert('Error', `Could not get your location: ${error.message}`);
    } finally {
      setLoadingLocation(false);
    }
  };

const [userAddress, setUserAddress] = useState(null);
  const handleBook = (service) => {
    setModalVisible(true);
    setAddress(userAddress || '');
    // Save selected service for next
    setSelectedService(service);
  };

  const [selectedService, setSelectedService] = useState(null);

  const handleNext = () => {
    setModalVisible(false);
    navigation.navigate('AvailableEmargencyMechanics', { service: selectedService, userAddress: userAddress });
  };

  const renderService = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.serviceInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBook(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>Request Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter Your Address First</Text>
            <TextInput
              style={styles.addressInput}
              placeholder="Address..."
              value={address || undefined}
              onChangeText={setAddress}
              editable={false}
              placeholderTextColor={Colors.mediumGray}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              <View style={styles.locationButtonContent}>
                {loadingLocation && <ActivityIndicator size={16} color={Colors.blue} style={{ marginRight: 8 }} />}
                <Text style={[styles.locationButtonText, loadingLocation && { color: Colors.blue, fontWeight: '600' }]}>Take My Current Location</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, !address && { backgroundColor: '#eee', borderColor: '#eee' }]}
              onPress={handleNext}
              disabled={!address}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {servicesByType.length === 0 ? (
        <Text style={{ color: '#888' }}>[No services available]</Text>
      ) : (
        <FlatList
          data={servicesByType[type?.key] || []}
          keyExtractor={(item) => item.name}
          renderItem={renderService}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#086189',
    marginBottom: 20,
    padding: 20,
    paddingBottom: 0,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bookButton: {
   // backgroundColor: '#086189',
    borderRadius: 20,
    borderWidth:1,
    borderColor: Colors.darkblue,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 36,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.blue,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  addressInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    marginBottom: 10,
    color: Colors.black,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  locationButton: {
    backgroundColor: '#f6faff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.blue,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButtonText: {
    color: Colors.blue,
    fontWeight: '600',
    fontSize: 13,
  },
  nextButton: {
    backgroundColor: Colors.blue,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    //backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.red,
    fontWeight: '700',
    lineHeight: 22,
  },
});

export default EmergencyServices