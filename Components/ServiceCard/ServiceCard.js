import { View, Text, TouchableOpacity, Alert } from "react-native";
import styles from "./ServiceCardStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const ServiceCard = ({ data }) => {
  const {
    name, // اسم الخدمة
  } = data;

  const handleAddToCart = () => {
    Alert.alert(
      "Added to Cart",
      `${name} has been added to your cart`,
      [{ text: "OK" }]
    );
  };

  
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.serviceName} numberOfLines={2}>
          {name}
        </Text>

       

        <View style={styles.bottomInfo}>
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
