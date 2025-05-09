import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./WorkshopCardStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const WorkshopCard = ({ data, onBookPress, onShopPress }) => {
  const {
    image,
    service_name,
    service_description,
    workshop_name,
    rate,
    price,
  } = data;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s" }}
        style={styles.image}
      />

      <View style={styles.info}>
        <View style={styles.topInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {service_name}
            </Text>
          </View>
          <Text style={styles.price}>{price}₪</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Text style={{ color: Colors.darkGray, fontSize: 13, marginRight: 4 }}>by</Text>
          <Text style={styles.name} numberOfLines={1} onPress={onShopPress}>
            {workshop_name} ·
          </Text>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{rate.toFixed(1)}</Text>
        </View>

        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service_description}
        </Text>

        <View style={styles.bottomInfo}>
          <Text style={styles.distance}>6 km</Text>
          <TouchableOpacity style={styles.bookButton} onPress={onBookPress}>
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default WorkshopCard;
