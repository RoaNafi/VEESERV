import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";
import styles from "./WorkshopCardSearchStyle";

const WorkshopCardSearch = ({ data }) => {
  const navigation = useNavigation();
  const { image, workshop_name, rate, address_id, services, workshop_id } = data;

  const handlePress = () => {
    const workshopData = {
      workshop_id:38, // this is a test id , it must take the id from data 
      workshop_name,
      rate,
      address_id,
      image,
      services: services || []
    };
    
    navigation.navigate("WorkshopDetails", { workshopData });
  };

  const renderServices = () => {
    const displayedServices = services.slice(0, 3);
    const remainingCount = services.length - 3;

    return (
      <View style={styles.servicesContainer}>
        {displayedServices.map((service, index) => (
          <View key={index} style={styles.serviceTag}>
            <Text style={styles.serviceText} numberOfLines={1}>
              {service.name || service}
            </Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={styles.moreTag}>
            <Text style={styles.moreText}>+{remainingCount}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s"
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {workshop_name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.orange} />
            <Text style={styles.rating}>{rate}</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color={Colors.blue} />
          <Text style={styles.location}>{address_id}</Text>
        </View>

        {renderServices()}
      </View>

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={Colors.mediumGray} 
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

export default WorkshopCardSearch; 