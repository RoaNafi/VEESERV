import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../Components/Colors/Colors";
import { CommonActions } from '@react-navigation/native';

const Payment = ({ route, navigation }) => {
  const { workshop_name, scheduledDate, location, services, totalPrice ,time } =
    route.params;
console.log("Payment route params:", route.params);
  const handlePay = () => {
    // TODO: send to backend or mark as paid
    alert("Payment Successful 🎉");
    
    // Reset navigation to the main tabs with Home selected
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Review & Pay</Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          Workshop: <Text style={styles.value}>{workshop_name}</Text>
        </Text>

        {/* the datenow is a string ... convert it to a date object if you need to use it  */}
       <Text style={styles.label}>
  Date: <Text style={styles.value}>{scheduledDate}</Text>
        </Text>

        <Text style={styles.label}>
          Time: <Text style={styles.value}>{time}</Text>
</Text>

        <Text style={styles.label}>
          Location: <Text style={styles.value}>{location}</Text>
        </Text>

        <Text style={styles.label}>Services:</Text>
        {services.map((s, index) => (
          <Text key={index} style={styles.serviceItem}>
            • {s.name} - {s.price}₪
          </Text>
        ))}

        <Text style={styles.total}>Total: {totalPrice}₪</Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePay}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
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
  card: { backgroundColor: Colors.lightGray, borderRadius: 12, padding: 16 },
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
  payButton: {
    marginTop: 30,
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  payButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 17 },
});

export default Payment;