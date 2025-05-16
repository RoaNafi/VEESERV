import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Components/Colors/Colors';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05; // 5% of screen width
const responsiveVerticalPadding = height * 0.02; // 2% of screen height
const responsiveMargin = width * 0.03; // 3% of screen width
const responsiveButtonHeight = height * 0.06; // 6% of screen height
const responsiveImageHeight = height * 0.25; // 25% of screen height
const responsiveBottomPadding = height * 0.1; // 10% of screen height

const ServiceDetails = ({ route, navigation }) => {

  const { serviceData } = route.params;
  const {
    service_name,
    workshop_name,
    service_description,
    price,
  } = serviceData;
  const { workshop_id } = serviceData; // Extract workshop_id from serviceData
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main content area with scroll */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Service Image */}
       
        
        {/* Workshop Info - Now Clickable */}
        <TouchableOpacity 
          style={styles.innercard}
          onPress={() => navigation.navigate('WorkshopDetails', { workshopId: serviceData.workshop_id })}
        >
          <View style={styles.workshopContainer}>
            <View>
              <Text style={styles.label}>Workshop</Text>
              <Text style={styles.value}>{workshop_name || 'Workshop Name'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.darkGray} />
          </View>
        </TouchableOpacity>
        
        {/* Service Info */}
        <View style={styles.innercard}>
          <Text style={styles.label}>Service</Text>
          <Text style={styles.value}>{service_name || 'Service Name'}</Text>
          
          {/* Only render this if serviceDescription exists */}
          {service_description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.descriptionText}>{service_description}</Text>
            </View>
          )}
        </View>

        {/* Location/Distance Section */}
       
        
        {/* Add some padding to ensure content isn't hidden behind the footer */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Fixed footer for price and book button */}
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>{price || 0}₪</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={() => navigation.navigate('Book', {
            serviceData: result,
          })}
        >
          <Text style={styles.confirmButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    padding: responsiveHorizontalPadding,
    backgroundColor: Colors.white,
  },

  workshopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  innercard: {
    backgroundColor: Colors.lightGray,
    padding: responsiveHorizontalPadding,
    borderRadius: width * 0.03, // responsive border radius
    marginBottom: responsiveMargin,
  },
  label: {
    fontSize: width * 0.045, // responsive font size
    color: Colors.darkGray,
    marginBottom: responsiveMargin * 0.5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: width * 0.04, // responsive font size
    color: Colors.black,
  },
  descriptionContainer: {
    marginTop: responsiveMargin,
  },
  descriptionLabel: {
    fontSize: width * 0.04, // responsive font size
    color: Colors.darkGray,
    marginBottom: responsiveMargin * 0.5,
  },
  descriptionText: {
    fontSize: width * 0.035, // responsive font size
    color: Colors.black,
    lineHeight: width * 0.05, // responsive line height
  },
  bottomPadding: {
    height: responsiveBottomPadding,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveHorizontalPadding,
    paddingVertical: responsiveVerticalPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    elevation: 8, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  priceContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: width * 0.035, // responsive font size
    color: Colors.darkGray,
  },
  priceValue: {
    fontSize: width * 0.05, // responsive font size
    fontWeight: 'bold',
    color: Colors.black,
  },
  confirmButton: {
    backgroundColor: Colors.blue,
    paddingVertical: responsiveVerticalPadding,
    paddingHorizontal: responsiveHorizontalPadding,
    borderRadius: width * 0.03, // responsive border radius
    flex: 1,
    alignItems: 'center',
    marginLeft: responsiveMargin,
    height: responsiveButtonHeight,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: width * 0.04, // responsive font size
    fontWeight: 'bold',
  },
  
});

export default ServiceDetails;