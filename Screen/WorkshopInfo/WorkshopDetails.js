import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Colors from "../../Components/Colors/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";

const WorkshopDetails = ({ route }) => {
const { workshopData } = route.params;
const workshopId = workshopData.workshop_id;

const [detailedWorkshop, setDetailedWorkshop] = useState(null);
const [reviews, setReviews] = useState([]);
const [loading, setLoading] = useState(true);
const [showAllReviews, setShowAllReviews] = useState(false);

  const [services, setServices] = useState([]);
  const [showAllServices, setShowAllServices] = useState(false);


useEffect(() => {
  const fetchWorkshopDetails = async () => {
    try {
      const workshopResponse = await fetch(`http://176.119.254.225:80/mechanic/workshop/${workshopId}`);
      const workshopJson = await workshopResponse.json();
      //console.log("Workshop JSON:", workshopJson);

      const reviewsResponse = await fetch(`http://176.119.254.225:80/mechanic/workshop/${workshopId}/reviews`);
      const reviewsJson = await reviewsResponse.json();
      //console.log("Reviews JSON:", reviewsJson);

      setDetailedWorkshop(workshopJson);
      setReviews(Array.isArray(reviewsJson) ? reviewsJson : []);
         // Fetch services (استخدم axios أو fetch حسب تفضيلك)
        const servicesResponse = await axios.get(`http://176.119.254.225:80/service/workshops/${workshopId}/services`);
      setServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
      //console.log("Services JSON:", servicesResponse.data);
    } catch (error) {
      console.error("Failed to fetch workshop details or reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (workshopId) {
    fetchWorkshopDetails();
    
  } else {
    console.warn("No workshopId received in params");
    setLoading(false);
  }
}, [workshopId]);
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  if (!workshopData) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 20, color: Colors.darkGray }}>
          Workshop data not available.
        </Text>
      </View>
    );
  }

  const servicesToShow = showAllServices
    ? services || []
    : (services || []).slice(0, 5);
    
  const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 5);

  // Fetch services for this workshop
 
  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={{
            uri:
              workshopData.image ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s",
          }}
          style={styles.workshopImage}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.workshopName}>{workshopData.workshop_name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {workshopData.rate?.toFixed(1) || "N/A"} ({reviews.length} reviews)
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={22} color={Colors.darkGray} />
              <Text style={styles.infoText}>{workshopData.address_id || "Address not available"}</Text>
            </View>
          </View>
 <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Services</Text>

        {servicesToShow.length === 0 ? (
          <Text>No services available.</Text>
        ) : (
          servicesToShow.map((service) => (
            <View key={service.service_id} style={styles.serviceItem}>
              <View style={styles.serviceLeft}>
                <Text style={styles.serviceName}>{service.service_name}</Text>
                <Text style={styles.serviceDescription}>{service.service_description}</Text>
              </View>
              <Text style={styles.servicePrice}>{service.price}₪</Text>
            </View>
          ))
        )}

        {services.length > 5 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllServices(!showAllServices)}
          >
            <Text style={styles.showMoreText}>
              {showAllServices ? "Show Less" : "Show More"}
            </Text>
            <Ionicons
              name={showAllServices ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.blue}
            />
          </TouchableOpacity>
        )}
      </View>
<View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Reviews</Text>

      {reviewsToShow.length === 0 ? (
        <Text>No reviews available.</Text>
      ) : (
        reviewsToShow.map((review) => (
          <View key={review.review_id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewUser}>Anonymous</Text>
              <View style={styles.reviewRating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.reviewRatingText}>{review.rating}</Text>
              </View>
            </View>
            <Text style={styles.reviewDate}>
              {new Date(review.review_date).toLocaleDateString() || "Date unknown"}
            </Text>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))
      )}

      {reviews.length > 5 && (
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          style={styles.showMoreButton}
          onPress={() => setShowAllReviews(!showAllReviews)}
        >
          <Text style={styles.showMoreText}>
            {showAllReviews ? "Show Less" : "Show More"}
          </Text>
          <Ionicons
            name={showAllReviews ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.blue}
          />
        </TouchableOpacity>
      )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  workshopImage: {
    width: "100%",
    height: 260,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 100,
  },

  headerContainer: {
    marginBottom: 24,
  },

  workshopName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: 0.4,
    marginBottom: 8,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    fontSize: 15,
    color: "#6B7280",
    marginLeft: 6,
  },

  infoCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoText: {
    fontSize: 15,
    color: "#4B5563",
    marginLeft: 14,
    flex: 1,
    flexWrap: "wrap",
    lineHeight: 20,
  },

  sectionCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 16,
  },

  // Service Styles
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  serviceLeft: {
    flex: 1,
    paddingRight: 14,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },

  serviceDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  servicePrice: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.blue,
  },

  // Review Styles
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  reviewUser: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },

  reviewRating: {
    flexDirection: "row",
    alignItems: "center",
  },

  reviewRatingText: {
    fontSize: 14,
    marginLeft: 4,
    color: Colors.black,
  },

  reviewDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },

  reviewComment: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 22,
  },

  // Show More Button
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#EEF6FF",
    borderRadius: 10,
    alignSelf: "center",
  },

  showMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.blue,
    marginRight: 6,
  },
});


export default WorkshopDetails;
