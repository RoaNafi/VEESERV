import { View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "./ServiceCardStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const ServiceCard = ({ data }) => {
  const {
    service_name,
    service_description,
  } = data;

  const handleAddToCart = () => {
    Alert.alert(
      "Added to Cart",
      `${service_name} has been added to your cart`,
      [{ text: "OK" }]
    );
  };

  const handleBookPress = () => {
    Alert.alert(
      "Book Service",
      `Would you like to book ${service_name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Book Now", onPress: () => Alert.alert("Success", "Service booked successfully!") }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.serviceName} numberOfLines={2}>
          {service_name}
        </Text>

        {service_description && (
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service_description}
          </Text>
        )}

        <View style={styles.bottomInfo}>
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookPress}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons name="add" size={16} color={Colors.white} />
              <Ionicons
                name="cart"
                size={16}
                color={Colors.white}
                style={styles.cartIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ServiceCard;
