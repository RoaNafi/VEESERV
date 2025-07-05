import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Dimensions, Alert } from 'react-native'
import Colors from '../../Components/Colors/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState, useRef } from 'react';

import * as Location from 'expo-location'; // Import Location API
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CommonActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { showActionSheetWithOptions } from 'react-native-action-sheet';
import { useActionSheet, ActionSheetProvider } from '@expo/react-native-action-sheet';

const { width, height } = Dimensions.get('window');
const horizontalPadding = Math.round(width * 0.06); // ~4% of screen width
const cardRadius = Math.round(width * 0.035); // ~3.5% of width
const buttonRadius = Math.round(width * 0.06); // ~6% of width
const baseFontSize = Math.round(width * 0.042); // ~4.2% of width
const smallFontSize = Math.round(width * 0.034); // ~3.4% of width
// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05; // 5% of screen width
const responsiveVerticalPadding = height * 0.02; // 2% of screen height
const responsiveMargin = width * 0.03; // 3% of screen width
const responsiveButtonHeight = height * 0.06; // 6% of screen height
const responsiveBottomPadding = height * 0.1; // 10% of screen height
const responsiveFontSize = width * 0.04; // 4% of screen width

const EmergencyReqSummary = ({ route, navigation }) => {
  const { selectedWorkshops = [], service, userAddress } = route.params || {};
  console.log("EmergencyReqSummary params:", route.params);
 const [selectedCar, setSelectedCar] = useState(null);
  const [allCars, setAllCars] = useState([]);
  // Extract price if available (for emergency, you may have service.price or service.estimated_price)
  const servicePrice = service?.price || service?.estimated_price || null;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();

    // دالة إرسال الحجز للطوارئ
  const sendEmergencyBooking = async () => {
    if (!selectedCar) {
      Alert.alert('Please select a vehicle before confirming!');
      return;
    }
    if (selectedWorkshops.length === 0) {
      Alert.alert('No workshops selected!');
      return;
    }

    setShowConfirmation(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const workshopIds = selectedWorkshops.map(w => w.workshop_id);
      const requested_datetime = new Date().toISOString(); // ممكن تعدلها حسب التاريخ والوقت المحددين
      const notes = ''; // ممكن تضيف حقل ملاحظات بالمكون وتربطه هنا


      const res = await axios.post('http://176.119.254.225:80/emergency/emergencyBooking', {
        vehicle_id: selectedCar.vehicle_id,
        notes,
        workshopIds,
        requested_datetime,
        user_address: {
          road: userAddress?.road || '',
          city: userAddress?.city || '',
        },
        emergency_service_id: service?.emergency_service_id || null, // تأكد من وجود service_id في الخدمة
        price : servicePrice, // تأكد من وجود السعر في الخدمة
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 201) {
        Alert.alert(
          'Notice',
          'Please pay attention to notifications!\nYou can also view your request details in the Booking page.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('MainTabs', { screen: 'MyBookings' });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to create emergency booking.');
    } finally {
      setShowConfirmation(false);
    }
  };
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
        console.log("Default car fetched:", res.data);
      }
    } catch (err) {
      // Remove the alert since we don't want to show it
      // Alert.alert('Please select a vehicle before proceeding with the booking.');
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
      console.log("All cars fetched:", res.data);
    } catch (err) {
      console.error('Error fetching all cars:', err);
    }
  };

 
   const handleOpenCarPicker = async () => {
     console.log("Opening car picker...");
  console.log("allCars length:", allCars.length);
     if (allCars.length !== 0) {
       await fetchAllCars();
       console.log("All cars fetched after opening picker:", allCars);
     }
 
     if (allCars.length === 0) {
       // If no cars available, show option to add a car
       Alert.alert(
         'No Cars Available',
         'You need to add a car to proceed with the booking.',
         [
           {
             text: 'Cancel',
             style: 'cancel'
           },

           {
             text: 'Add Car',
             onPress: () => navigation.navigate('AddCar', {
               fromBooking: true,
               bookingData: {
                 data: null,
                 date: null,
                 timeSlots: null
               }
             })
           }
         ]
       );
       return;
     }
 
    const options = allCars.map(car => `${car.make} ${car.model} (${car.year})`);
    options.push('Add New Car');
    options.push('Cancel');

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: 'Select a Car',
      },
      selectedIndex => {
        if (selectedIndex === undefined) return;
        
        if (selectedIndex === options.length - 2) {
          // Add New Car option selected
          navigation.navigate('AddCar', { 
            fromBooking: true,
           
          });
        } else if (selectedIndex !== options.length - 1) {
          // Regular car selected
          setSelectedCar(allCars[selectedIndex]);
        }
      }
    );
  };
    useFocusEffect(
      React.useCallback(() => {
        // Only fetch cars if we don't have any
        if (allCars.length === 0) {
          fetchAllCars();
        }
        // Only fetch default car if we don't have one selected
        if (!selectedCar) {
          fetchDefaultCar();
        }
      }, [allCars.length, selectedCar])
    );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="list" size={20} color={Colors.blue} />
          <Text style={styles.sectionTitleText}>Emergency Summary</Text>
        </View>

        {/* Summary Card (imitate BookSummary.js) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            {/* Service Label Row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="construct-outline" size={20} color={Colors.blue} />
                <Text style={styles.summaryLabel}>Service</Text>
              </View>
            </View>
            {/* Service Name + Price Row */}
            <View style={styles.serviceDetailsRow}>
              <Text style={styles.serviceNameText}>{service?.name || '-'}</Text>
              {servicePrice !== null && (
                <Text style={styles.servicePrice}>{servicePrice}₪</Text>
              )}
            </View>
            {/* Location Label Row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="location-outline" size={20} color={Colors.blue} />
                <Text style={styles.summaryLabel}>Location</Text>
              </View>
            </View>
            {/* Location Value Row */}
            <View style={styles.bookingDetails}>
              <Text style={styles.locationText}>{userAddress ? `${userAddress.road}, ${userAddress.city}` : 'No address'}</Text>
            </View>
          </View>
        </View>
 {/* Vehicle Selection */}
        <View style={styles.sectionTitleRow}>
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
                {allCars.length === 0 ? 'Add a Vehicle' : 'Select Vehicle'}
              </Text>
              {!showConfirmation && <Ionicons name="chevron-forward" size={20} color="#666" />}
            </View>
          )}
        </TouchableOpacity>
        {/* Selected Workshops Section Title */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="business" size={18} color={Colors.blue} />
          <Text style={styles.sectionTitleText}>Selected Workshops</Text>
        </View>

        {/* Workshops List */}
        <FlatList
          data={selectedWorkshops}
          keyExtractor={item => item.workshop_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.workshopCard}>
              {/* Name and Price Row */}
              <View style={styles.serviceDetailsRow}>
                <Text style={styles.workshopName}>{item.workshop_name}</Text>
                <Text style={styles.workshopPrice}>₪{item.price}</Text>
              </View>
              {/* Address Row */}
              <Text style={styles.workshopAddress}>{item.address}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          scrollEnabled={false}
        />
      </ScrollView>
      {/* Fixed bottom area */}
      <View style={styles.bottomFixed}>
        <View style={styles.infoTextCard}>
          {/* <Ionicons name="time-outline" size={22} color={Colors.red} style={{ marginBottom: 4 }} /> */}
          <Text style={styles.infoText}>
            Please wait up to <Text style={{ color: Colors.red, fontWeight: 'bold' }}>5 minutes</Text> for the workshop(s) to approve your emergency request.
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={sendEmergencyBooking} activeOpacity={0.8}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Math.round(width * 0.025),
    marginTop: Math.round(width * 0.045),
    marginHorizontal: horizontalPadding,
  },
  sectionTitleText: {
    fontSize: baseFontSize + 1,
    color: Colors.blue,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: cardRadius,
    marginBottom: Math.round(width * 0.045),
    marginHorizontal: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  summaryContent: {
    padding: Math.round(width * 0.04),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Math.round(width * 0.02),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: baseFontSize - 1,
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Math.round(width * 0.02),
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceNameText: {
    fontSize: baseFontSize,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: Math.round(width * 0.05),
  },
  bookingDetails: {
    paddingVertical: Math.round(width * 0.02),
    paddingHorizontal: 2,
  },
  locationText: {
    fontSize: baseFontSize,
    color: '#333',
    fontWeight: '600',
    marginLeft: Math.round(width * 0.05),
  },
  servicePrice: {
    fontSize: baseFontSize,
    color: Colors.blue,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Math.round(width * 0.04),
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: cardRadius,
    padding: Math.round(width * 0.035),
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120,
  },
  infoCardLabel: {
    fontSize: smallFontSize,
    color: Colors.darkGray,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoCardValue: {
    fontSize: baseFontSize,
    color: Colors.blue,
    fontWeight: 'bold',
  },
  workshopCard: {
    backgroundColor: '#fff',
    borderRadius: cardRadius,
    paddingHorizontal: Math.round(width * 0.035),
    paddingVertical: Math.round(width * 0.025),
    marginBottom: Math.round(width * 0.025),
    marginHorizontal: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  workshopName: {
    fontSize: baseFontSize,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
  },
  workshopPrice: {
    fontSize: baseFontSize,
    color: Colors.blue,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workshopAddress: {
    fontSize: smallFontSize,
    color: '#666',
    marginTop: 2,
  },
  infoTextCard: {
    flexDirection: 'column',
    alignItems: 'center',
    //backgroundColor: '#fff',
    borderRadius: 0,
    //paddingVertical: 12,
    //paddingHorizontal: horizontalPadding,
    marginBottom: Math.round(width * 0.04),
    //marginHorizontal: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: baseFontSize,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: Math.round(width * 0.052),
  },
  confirmButton: {
    backgroundColor: Colors.blue,
    borderRadius: buttonRadius,
    paddingVertical: Math.round(width * 0.038),
    alignItems: 'center',
    marginTop: 0,
    marginBottom:7,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.blue,
    
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: baseFontSize + 1,
    letterSpacing: 0.5,
  },
  bottomFixed: {
    backgroundColor: '#fff',
    paddingTop: Math.round(width * 0.035),
    paddingBottom: Math.round(width * 0.045),
    paddingHorizontal: horizontalPadding,
    
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'stretch',
  },
   disabledText: {
    color: '#999',
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
});

export default EmergencyReqSummary