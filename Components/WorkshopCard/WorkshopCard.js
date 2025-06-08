import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./WorkshopCardStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const WorkshopCard = ({ data, onBookPress, onShopPress }) => {
  //console.log("\n=== WORKSHOP CARD DATA ===");
  //console.log("Full data object:", JSON.stringify(data, null, 2));
  //console.log("Services array:", JSON.stringify(data.services, null, 2));
  //console.log("Number of services:", data.services ? data.services.length : 0);
  //console.log("Is services array?", Array.isArray(data.services));
  //console.log("Services type:", typeof data.services);

  const {
    image,
    services,
    workshop_name,
    rate,
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
            <Text style={styles.workshopName} numberOfLines={2}>
              {workshop_name}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.darkGray} style={styles.arrowIcon} />
          </View>

          <View style={styles.middleInfo}>
            <Ionicons name="star" size={12} color="#FFD700"/>
            <Text style={styles.ratingText}>{rate.toFixed(1)}</Text>
          </View>

          <View style={styles.servicesContainer}>
            {Array.isArray(services) && services.length > 0 ? (
              services.map((service, index) => {
                //console.log(`Rendering service ${index}:`, JSON.stringify(service, null, 2));
                return (
                  <View key={index} style={styles.serviceItem}>
                    <Text style={styles.serviceName}>
                      {service.service_name || service.name} - {service.price}₪
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.serviceName}>No services available</Text>
            )}
          </View>

          <View style={styles.bottomInfo}>
            <Text style={styles.distance}>6 km</Text>
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={(e) => {
                e.stopPropagation();
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
