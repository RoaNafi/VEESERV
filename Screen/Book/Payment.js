
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../Components/Colors/Colors";
import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // لو بتخزني التوكن هناك
import { Alert } from 'react-native';

const Payment = ({ route, navigation }) => {
    const { bookings = [], workshop_name, totalPrice, date, address, selectedCar, timeSlots,bookingId } = route.params;

 

  console.log('✅ Bookings:', bookings);
  console.log('💵 Total Price:', totalPrice);
  console.log( workshop_name);
  console.log(timeSlots);
  console.log(bookingId);
  const handlePay = async () => {
  try {
        const token = await AsyncStorage.getItem("accessToken");


    const paymentPayload = {
      booking_id: bookingId,
      income_value: totalPrice,
      percent_to_admin: 0.1,  // أو احسبيها حسب المشروع
      percent_to_workshop: 0.9,
      type: 'card', // or 'cash', حسب ما بدك
    };
console.log( 'payment data :',paymentPayload);
    const res = await axios.post(
      'http://176.119.254.225:80/payment/payments', // غيّري حسب سيرفرك
      paymentPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Payment success:', res.data);

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

  // تجميع حسب الورشة
  const groupedByWorkshop = bookings.reduce((acc, item) => {
    const key = item.workshop_id;
    if (!acc[key]) {
      acc[key] = {
        workshop_name: item.workshop_name,
        workshop_id: item.workshop_id,
        services: [],
        time: [],
      };
    }
    acc[key].services.push(item.service);
    acc[key].time.push(item.time);
    return acc;
  }, {});
const formattedDate = new Date(date).toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Review & Pay</Text>

      {Object.values(groupedByWorkshop).map((workshop, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>
            Workshop: <Text style={styles.value}>{workshop_name}</Text>
          </Text>
          <Text style={styles.label}>
          Date: <Text style={styles.value}>{formattedDate}</Text>
             </Text>
          <Text style={styles.label}>Services:</Text>
         <View>
   {bookings.map((service, idx) => (
          <Text key={idx}>
            {service.service_name} - {service.price}₪ at {service.scheduled_time}
          </Text>
  ))}
</View>

          
        </View>
      ))}

      <View style={styles.bottomBar}>
        <View style={styles.priceWrapper}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>{totalPrice} ₪</Text>
        </View>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.white,
    flex: 1,
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: { backgroundColor: Colors.lightGray, borderRadius: 12, padding: 16 ,marginBottom: 10 },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 10,
  },
  value: { fontWeight: "normal", color: Colors.darkGray },
  serviceItem: { fontSize: 15, color: Colors.black, marginLeft: 10 },
  total: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.green,
  },
  
  bottomBar: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  flexDirection: "row",
  backgroundColor: "#fff",
  paddingBottom: 20,
  paddingTop: 10,
  paddingHorizontal: 20,
  justifyContent: "space-between",
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 12,
  elevation: 12,
  
},
priceWrapper: {
  flexDirection: "column",
},
totalLabel: {
  fontSize: 18,
    fontWeight: "700",
    color: "#333",
},
totalAmount: {
  fontSize: 20,
  fontWeight: "800",
  color: Colors.blue,
},
payButton: {
   backgroundColor: "#086189",
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  height:"100%",
  shadowColor: "#086189",
},
payButtonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "800",
  letterSpacing: 1,
},

});

export default Payment;