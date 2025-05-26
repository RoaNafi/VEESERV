import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import styles from "./ServiceCardStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const ServiceCard = ({ data }) => {
  const {
    image,
    service_name,
    service_description,
    price,
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
      <Image
        source={{
          uri:
            image ||
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s",
        }}
        style={styles.image}
      />

      <View style={styles.info}>
        <View style={styles.topInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <Text style={[styles.serviceName, { flex: 1 }]} numberOfLines={2}>
              {service_name}
            </Text>
          </View>
        </View>

        {service_description && (
          <Text style={styles.description} numberOfLines={2}>
            {service_description}
          </Text>
        )}

        <Text style={styles.price}>{price}₪</Text>

        <View style={styles.bottomInfo}>
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookPress}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons name="add" size={16} color={Colors.black} />
              <Ionicons
                name="cart"
                size={16}
                marginLeft={-4}
                color={Colors.black}
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
