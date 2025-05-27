import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Dimensions } from "react-native";
import Colors from "../../Components/Colors/Colors";
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05;
const responsiveVerticalPadding = height * 0.02;
const responsiveMargin = width * 0.03;
const responsiveButtonHeight = height * 0.06;
const responsiveBottomPadding = height * 0.1;
const responsiveFontSize = width * 0.04;

const Payment = ({ route, navigation }) => {
  const { bookings = [], workshop_name, totalPrice, date, address, selectedCar, timeSlots, bookingId } = route.params;

  const handlePay = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const paymentPayload = {
        booking_id: bookingId,
        income_value: totalPrice,
        percent_to_admin: 0.1,
        percent_to_workshop: 0.9,
        type: 'card',
      };

      const res = await axios.post(
        'http://176.119.254.225:80/payment/payments',
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Payment Successful 🎉", "Payment confirmed");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs', state: { routes: [{ name: 'Home' }], index: 0 } }],
        })
      );
    } catch (error) {
      console.error('Payment failed:', error);
      Alert.alert("Payment Failed ❌", "Something went wrong. Please try again.");
    }
  };

  const formattedDate = new Date(date).toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
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
                <Ionicons name="calendar-outline" size={20} color="#086189" />
                <Text style={styles.summaryLabel}>Date & Time</Text>
              </View>
              <Text style={styles.summaryValue}>{formattedDate} {timeSlots}</Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="car-outline" size={20} color="#086189" />
                <Text style={styles.summaryLabel}>Vehicle</Text>
              </View>
              <Text style={styles.summaryValue}>
                {selectedCar ? `${selectedCar.make} ${selectedCar.model} (${selectedCar.year})` : 'No vehicle selected'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="location-outline" size={20} color="#086189" />
                <Text style={styles.summaryLabel}>Location</Text>
              </View>
              <Text style={styles.summaryValue}>{address.street}, {address.city}</Text>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={styles.sectionTitle}>
          <Ionicons name="construct-outline" size={20} color="#086189" />
          <Text style={styles.sectionTitleText}>Services</Text>
        </View>

        <View style={styles.servicesCard}>
          {bookings.map((service, idx) => (
            <View key={idx} style={styles.serviceDetailsRow}>
              <View style={styles.serviceNameCell}>
                <Text style={styles.serviceNameText}>{service.service_name}</Text>
              </View>
              <View style={styles.servicePriceCell}>
                <Text style={styles.servicePrice}>{service.price}₪</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceValue}>{totalPrice}₪</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handlePay}>
          <Text style={styles.confirmButtonText}>Pay Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
  summaryValue: {
    fontSize: responsiveFontSize,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
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
  servicesCard: {
    backgroundColor: Colors.white,
    borderRadius: width * 0.035,
    marginBottom: responsiveMargin * 1.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
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
  servicePrice: {
    fontSize: responsiveFontSize,
    color: '#086189',
    fontWeight: '600',
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
});

export default Payment;