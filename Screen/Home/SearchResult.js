import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Components/Colors/Colors';
import ServiceCard from '../../Components/ServiceCard/ServiceCard';
import WorkshopCardSearch from '../../Components/WorkshopCardSearch/WorkshopCardSearch';

// Mockup data for testing
const mockServices = [
  {
    service_id: 1,
    service_name: "Basic Car Wash",
    service_description: "Complete exterior wash and interior cleaning",
    price: 50,
    rating: 4.5,
    distance: "2.5 km",
    image: "https://example.com/carwash.jpg",
    available: true
  },
  {
    service_id: 2,
    service_name: "Oil Change Service",
    service_description: "Full synthetic oil change with filter replacement",
    price: 120,
    rating: 4.8,
    distance: "1.8 km",
    image: "https://example.com/oilchange.jpg",
    available: true
  },
  {
    service_id: 3,
    service_name: "Tire Rotation",
    service_description: "Tire rotation and balance service",
    price: 80,
    rating: 4.2,
    distance: "3.2 km",
    image: "https://example.com/tirerotation.jpg",
    available: false
  }
];

const mockWorkshops = [
  {
    workshop_id: 1,
    workshop_name: "AutoCare Center",
    rate: 4.7,
    address_id: "Tel Aviv, Allenby St. 123",
    image: "",
    services: ["Car Wash", "Oil Change", "Tire Service", "Brake Service"]
  },
  {
    workshop_id: 2,
    workshop_name: "Quick Fix Garage",
    rate: 4.3,
    address_id: "Jerusalem, Jaffa St. 45",
    image: "",
    services: ["Engine Repair", "Brake Service", "AC Service", "Paint Work"]
  },
  {
    workshop_id: 3,
    workshop_name: "Premium Auto Service",
    rate: 4.9,
    address_id: "Haifa, Herzl St. 78",
    image: "",
    services: ["Luxury Car Service", "Paint Work", "Detailing", "Engine Tuning"]
  }
];

const SearchResult = ({
  searchResults,
  isLoading,
  searchTerm,
  navigation,
}) => {
  const [selectedTab, setSelectedTab] = useState('services');
  const borderAnim = useRef(new Animated.Value(0)).current;

  const animateBorder = (toValue) => {
    Animated.spring(borderAnim, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  React.useEffect(() => {
    animateBorder(selectedTab === 'services' ? 0 : 1);
  }, [selectedTab]);

  // Use mock data if searchResults is empty
  const displayServices = searchResults?.services?.length > 0 ? searchResults.services : mockServices;
  const displayWorkshops = searchResults?.workshops?.length > 0 ? searchResults.workshops : mockWorkshops;

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <View style={styles.tabContainer}>
            <Animated.View style={{
              flex: 1,
              borderBottomWidth: borderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 0]
              }),
              borderBottomColor: Colors.blue,
              marginBottom: -1,
            }}>
              <TouchableOpacity
                onPress={() => setSelectedTab('services')}
                style={styles.tabButton}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === 'services' && styles.selectedTabText
                ]}>
                  Services
                </Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{
              flex: 1,
              borderBottomWidth: borderAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2]
              }),
              borderBottomColor: Colors.blue,
              marginBottom: -1,
            }}>
              <TouchableOpacity
                onPress={() => setSelectedTab('workshops')}
                style={styles.tabButton}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === 'workshops' && styles.selectedTabText
                ]}>
                  Workshops
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <ScrollView style={styles.scroll}>
            {selectedTab === 'services' ? (
              displayServices.map((result) => (
                <ServiceCard
                  key={`service-${result.service_id}`}
                  data={result}
                />
              ))
            ) : (
              displayWorkshops.map((result) => (
                <WorkshopCardSearch
                  key={`workshop-${result.workshop_id}`}
                  data={result}
                />
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    marginBottom:10,
    marginTop: 10,
  },
  tabButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: Colors.mediumGray,
    fontWeight: '600',
  },
  selectedTabText: {
    color: Colors.blue,
  },
});

export default SearchResult;
