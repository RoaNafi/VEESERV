// the workshop id must be passed from the service details to the workshop details so we can git the workshop data from the api

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Colors from "../../Components/Colors/Colors";
import Ionicons from 'react-native-vector-icons/Ionicons';


const WorkshopDetails = ({ route }) => {
  const { serviceData } = route.params; // Get the workshop ID from route params

  const { workshop_name, rate } = serviceData; // Destructure the serviceData object

  // States to control expanded views
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  // Dummy data
  const workshopData = {
    address: "123 Main Street, Ramallah",
    phone: "+972 50-123-4567",
    rating: 4.7,
    reviews: [
      {
        id: 1,
        user: "David Cohen",
        rating: 5,
        date: "15 Oct 2023",
        comment: "Great service, very professional and quick!",
      },
      {
        id: 2,
        user: "Sarah Levy",
        rating: 4,
        date: "2 Oct 2023",
        comment: "Good experience overall. Fixed my car on time.",
      },
      {
        id: 3,
        user: "Moshe Abramov",
        rating: 5,
        date: "28 Sep 2023",
        comment:
          "Excellent workshop! They fixed issues other mechanics couldn't solve.",
      },
      {
        id: 4,
        user: "Rachel Goldstein",
        rating: 4,
        date: "15 Sep 2023",
        comment: "Good service at a fair price. Will come back.",
      },
      {
        id: 5,
        user: "Daniel Ben-David",
        rating: 5,
        date: "10 Sep 2023",
        comment: "Friendly staff and efficient service. Highly recommend!",
      },
      {
        id: 6,
        user: "Noa Klein",
        rating: 3,
        date: "5 Sep 2023",
        comment: "Service was okay but took longer than promised.",
      },
      {
        id: 7,
        user: "Yossi Mizrahi",
        rating: 5,
        date: "1 Sep 2023",
        comment: "Best workshop in town! Fair prices and excellent work.",
      },
      {
        id: 8,
        user: "Tali Shapiro",
        rating: 4,
        date: "25 Aug 2023",
        comment: "I'm a return customer and they never disappoint.",
      },
    ],
    services: [
      {
        id: 1,
        name: "Oil Change",
        price: 199,
        description: "Full synthetic oil change service",
      },
      {
        id: 2,
        name: "Brake Replacement",
        price: 450,
        description: "Front and rear brake pads replacement",
      },
      {
        id: 3,
        name: "Engine Diagnostics",
        price: 350,
        description: "Complete engine diagnostic scan",
      },
      {
        id: 4,
        name: "Tire Rotation",
        price: 150,
        description: "Rotate and balance all four tires",
      },
      {
        id: 5,
        name: "Air Conditioning Service",
        price: 300,
        description: "AC system check and refrigerant refill",
      },
      {
        id: 6,
        name: "Battery Replacement",
        price: 250,
        description: "Remove old battery and install new one",
      },
      {
        id: 7,
        name: "Headlight Replacement",
        price: 200,
        description: "Replace burnt out headlights",
      },
      {
        id: 8,
        name: "Wheel Alignment",
        price: 280,
        description: "Four-wheel alignment service",
      },
    ],
    image: null,
  };

  // Determine how many reviews/services to show
  const reviewsToShow = showAllReviews
    ? workshopData.reviews
    : workshopData.reviews.slice(0, 5);
  const servicesToShow = showAllServices
    ? workshopData.services
    : workshopData.services.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Workshop Image */}
        <Image
          source={{
            uri:
              workshopData.image ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s",
          }}
          style={styles.workshopImage}
          resizeMode="cover"
        />

        {/* Workshop Content */}
        <View style={styles.contentContainer}>
          {/* Workshop Name and Rating */}
          <View style={styles.headerContainer}>
            <Text style={styles.workshopName}>{serviceData.workshop_name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.ratingText}>
                {serviceData.rate} ({workshopData.reviews.length} reviews)
              </Text>
            </View>
          </View>

          {/* Workshop Address */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={22}
                color={Colors.darkGray}
              />
              <Text style={styles.infoText}>{workshopData.address}</Text>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Services</Text>

            {servicesToShow.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceLeft}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                </View>
                <Text style={styles.servicePrice}>{service.price}₪</Text>
              </View>
            ))}

            {workshopData.services.length > 5 && (
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

          {/* Reviews Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Reviews</Text>

            {reviewsToShow.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}

            {workshopData.reviews.length > 5 && (
              <TouchableOpacity
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
    height: 220,
  },

  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 16,
  },
  workshopName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginLeft: 4,
  },
  infoCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    color: Colors.darkGray,
    marginLeft: 10,
  },
  sectionCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 12,
  },
  // Service Styles
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  serviceLeft: {
    flex: 1,
    paddingRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  // Review Styles
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: "bold",
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
    color: Colors.darkGray,
    marginBottom: 6,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
  },
  // Show More Button
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    padding: 8,
  },
  showMoreText: {
    color: Colors.blue,
    fontSize: 14,
    marginRight: 4,
  },
});

export default WorkshopDetails;
