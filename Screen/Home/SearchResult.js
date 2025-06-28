import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Animated, FlatList, Image, Modal, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Components/Colors/Colors';
import ServiceCard from '../../Components/ServiceCard/ServiceCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const WorkshopCard = ({ item, navigation }) => {
  const [fav, setFav] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const handleFav = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      if (!fav) {
        await axios.post(
          'http://176.119.254.225:80/favourite/favorite',
          { workshop_id: item.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFav(true);
      } else {
        // إزالة من المفضلة
        await axios.delete(
          `http://176.119.254.225:80/favourite/favorite/${item.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFav(false);
      }

    } catch (error) {
      if (error.response && error.response.status === 409) {
        setFav(true);
      } else {
        console.error('Error toggling favorite:', error);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.workshopCardModern}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('WorkshopDetails', { 
        workshopData: {
          workshop_id: item.id,
          workshop_name: item.name,
          image: item.image,
          city: item.city,
          street: item.street,
          rate: item.rate,
          address_id: item.street || item.address_id || '',
          // Pass through all other fields for future compatibility
          ...item
        }
      })}
    >
      <Ionicons name="chevron-forward" size={22} color={Colors.blue} style={styles.arrowIconModern} />
      <Image
        source={item.image
          ? { uri: item.image }
          : { uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s" }
        }
        style={styles.workshopImageModern}
      />
      <View style={styles.workshopInfoModern}>
        <Text style={styles.workshopNameModern}>{item.name}</Text>
        <Text style={styles.workshopAddressModern}>{item.city || 'No city'}, {item.street || 'No street'}</Text>
        <View style={styles.workshopRatingRowModern}>
          <Ionicons name="star" size={16} color="#FFD700" style={{ marginRight: 4 }} />
          <Text style={styles.workshopRateModern}>Rate: {item.rate ? item.rate.toFixed(1) : 'N/A'}</Text>
        </View>
        <View style={styles.workshopButtonsRowModern}>
          <TouchableOpacity onPress={handleFav}>
            <Ionicons
              name={fav ? 'heart' : 'heart-outline'}
              size={28}
              color={fav ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  const handleSeeServices = (servicesString) => {
    const servicesArray = servicesString ? servicesString.split(',').map(s => s.trim()) : [];
    setSelectedServices(servicesArray);
    setServiceModalVisible(true);
  };

  React.useEffect(() => {
    animateBorder(selectedTab === 'services' ? 0 : 1);
  }, [selectedTab]);

  const results = Array.isArray(searchResults) ? searchResults : [];
  const displayServices = results.filter(item => item.type === 'subcategory');
  const displayWorkshops = results.filter(item => item.type === 'workshop');

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
              displayServices.length > 0 ? (
                displayServices.map((result) => (
                  <ServiceCard
                    key={`service-${result.id}`}
                    data={result}
                  />
                ))
              ) : (
                <Text style={styles.noResultText}>No services found.</Text>
              )
            ) : (
              displayWorkshops.length > 0 ? (
                displayWorkshops.map(result => (
                  <WorkshopCard
                    key={`workshop-${result.id}`}
                    item={result}
                    navigation={navigation}
                  />
                ))
              ) : (
                <Text style={styles.noResultText}>No workshops found.</Text>
              )
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
    marginBottom: 10,
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
  workshopCardModern: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#E0E7EF',
    minHeight: 120,
    alignItems: 'center',
    padding: 10,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  workshopImageModern: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: '#F3F6FA',
  },
  workshopInfoModern: {
    flex: 1,
    justifyContent: 'center',
  },
  workshopNameModern: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  workshopAddressModern: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
  },
  workshopRatingRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  workshopRateModern: {
    color: '#444',
    fontWeight: '600',
    fontSize: 13,
  },
  workshopButtonsRowModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 10,
  },
  arrowIconModern: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
});

export default SearchResult;