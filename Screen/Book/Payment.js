// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import Colors from "../../Components/Colors/Colors";
// import { CommonActions } from '@react-navigation/native';

// const Payment = ({ route, navigation }) => {
//   const { bookings, totalPrice, workshop_name } = route.params;
//   const { services = [] } = route.params;  // حط قيمة افتراضية عشان تتجنب undefined
//   const scheduledDate = bookings?.[0]?.scheduled_date;
//   const location = bookings?.[0]?.location;
//   const time = bookings?.[0]?.time?.[0];

//   console.log('✅ Bookings:', bookings);
//   console.log('💵 Total Price:', totalPrice);
// console.log('Services:', services);

//   const handlePay = () => {
//     alert("Payment Successful 🎉");

//     navigation.dispatch(
//       CommonActions.reset({
//         index: 0,
//         routes: [
//           {
//             name: 'MainTabs',
//             state: {
//               routes: [{ name: 'Home' }],
//               index: 0,
//             },
//           },
//         ],
//       })
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Review & Pay</Text>

//       <View style={styles.card}>
//         <Text style={styles.label}>
//           Workshop: <Text style={styles.value}>{workshop_name}</Text>
//         </Text>

//         <Text style={styles.label}>
//           Date: <Text style={styles.value}>{scheduledDate}</Text>
//         </Text>

//         <Text style={styles.label}>
//           Time: <Text style={styles.value}>{time}</Text>
//         </Text>

//         <Text style={styles.label}>
//           Location: <Text style={styles.value}>{location}</Text>
//         </Text>

//         <Text style={styles.label}>Services:</Text>
//         {services.map((s, index) => (
//   <Text key={index}>• {s.name} - {s.price}₪</Text>
// ))}


//         <Text style={styles.total}>Total: {totalPrice}₪</Text>
//       </View>

//       <TouchableOpacity style={styles.payButton} onPress={handlePay}>
//         <Text style={styles.payButtonText}>Pay Now</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     backgroundColor: Colors.white,
//     flex: 1,
//   },
//   header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   card: { backgroundColor: Colors.lightGray, borderRadius: 12, padding: 16 },
//   label: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: Colors.black,
//     marginTop: 10,
//   },
//   value: { fontWeight: "normal", color: Colors.darkGray },
//   serviceItem: { fontSize: 15, color: Colors.black, marginLeft: 10 },
//   total: {
//     marginTop: 15,
//     fontSize: 18,
//     fontWeight: "bold",
//     color: Colors.green,
//   },
//   payButton: {
//     marginTop: 30,
//     backgroundColor: Colors.blue,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   payButtonText: { color: Colors.white, fontWeight: "bold", fontSize: 17 },
// });

// export default Payment;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../../Components/Colors/Colors";
import { CommonActions } from '@react-navigation/native';
const Payment = ({ route, navigation }) => {
  const {
    bookings = [],
    totalPrice,
    date,
    address,
    selectedCar,
    timeSlots,
  } = route.params;

  // توليد payload للإرسال لاحقًا
  const payload = {
    bookings: bookings.map(item => ({
      workshop_id: item.workshop_id,
      scheduled_date: date,
      time: item.time,
      vehicle_id: selectedCar?.vehicle_id,
      services: item.services
        ? item.services.map(s => ({
            service_id: s.id || s.service_id,
            price: s.price,
          }))
        : [{
            service_id: item.service?.id || item.service?.service_id,
            price: item.service?.price,
          }],
    })),
    totalPrice,
    address: {
      address_id: address?.address_id,
      street: address?.street,
      city: address?.city,
    },
    temporary: true,
  };

  console.log('✅ Bookings:', bookings);
  console.log('💵 Total Price:', totalPrice);

  const handlePay = () => {
    alert("Payment Successful 🎉");

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Review & Pay</Text>

      {Object.values(groupedByWorkshop).map((workshop, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>
            Workshop: <Text style={styles.value}>{workshop.workshop_name}</Text>
          </Text>
          <Text style={styles.label}>
            Date: <Text style={styles.value}>{date}</Text>
          </Text>
          <Text style={styles.label}>
            Time: <Text style={styles.value}>{workshop.time.join(', ')}</Text>
          </Text>
          <Text style={styles.label}>Services:</Text>
          {workshop.services.map((s, idx) => (
            <Text key={idx}>• {s.name} - {s.price}₪</Text>
          ))}
        </View>
      ))}

      <Text style={styles.total}>Total: {totalPrice}₪</Text>

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