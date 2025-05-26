import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./WorkshopCardStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const WorkshopCard = ({ data, onBookPress, onShopPress }) => {
  const {
    image,
    //service_name,
    //service_description,
    workshop_name,
    rate,
    price,
    workshop_id,
  } = data;

  return (
    <TouchableOpacity onPress={onShopPress} activeOpacity={0.7}>
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
                {workshop_name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.darkGray}/>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Ionicons name="star" size={12} color="#FFD700"/>
            <Text style={styles.ratingText}>{rate.toFixed(1)}</Text>
          </View>

          <Text style={styles.price}>{price}₪</Text>

          <View style={styles.bottomInfo}>
            <Text style={styles.distance}>6 km</Text>
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={(e) => {
                e.stopPropagation(); // Prevent card press when clicking book button
                onBookPress();
              }}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default WorkshopCard;
