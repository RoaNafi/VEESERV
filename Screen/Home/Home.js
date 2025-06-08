import React, { useRef, useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Animated,
  StyleSheet,
} from "react-native";
import styles from "./HomeStyle";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { config } from "../../config";
import axios from "axios";
import Colors from "../../Components/Colors/Colors";

import SearchResult from "./SearchResult";
import Filter from "./ResultOperation/Filter";
import Sort from "./ResultOperation/Sort";

import { useFilterLogic } from "./ResultOperation/useFilterLogic";
import { useSortLogic } from "./ResultOperation/useSortLogic";
// import { CheckBox } from '@rneui/themed'; // or '@react-native-elements'
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Subcategory from './Subcategory';
// this insted of add padding to the container
const PADDING = 20;

const { width } = Dimensions.get("window");

const banners = [
  "https://www.steelcobuildings.com/wp-content/uploads/2024/06/AdobeStock_156266430_Preview-e1718286922289.jpeg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScjx6u5FKaBN0-ruxflRpLSztC_4Iuj73PDg&s",
  "https://www.steelcobuildings.com/wp-content/uploads/2024/06/AdobeStock_156266430_Preview-e1718286922289.jpeg",
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Home = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [frequentServices, setFrequentServices] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [originalSearchResults, setOriginalSearchResults] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [addedServices, setAddedServices] = useState([]);

  const animatedValues = useRef({}).current;

  const getAnimatedValue = (id) => {
    if (!animatedValues[id]) {
      animatedValues[id] = new Animated.Value(0);
    }
    return animatedValues[id];
  };

  const handlePressIn = (id) => {
    Animated.spring(animatedValues[id], {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      // Reset animation after it completes
      Animated.spring(animatedValues[id], {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });
  };

  const handlePressOut = (id) => {
    // No need to do anything on press out since we're handling the reset in press in
  };

  useEffect(() => {
    const fetchFrequentServices = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/service/services/frequent`); // Adjust endpoint
        setFrequentServices(response.data);
      } catch (error) {
        console.error("Failed to fetch frequent services:", error);
        
      }
    };
    fetchFrequentServices();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${config.apiUrl}/ServiceCategories/categories`
        );
        const categoryColors = [
          Colors.red,
          Colors.lightblue,
          Colors.blue,
          Colors.green,
          Colors.lightOrange,
          Colors.lightgreen,
          Colors.yallow,
        ];

        const dataWithColors = response.data.map((cat, index) => ({
          ...cat,
          color: categoryColors[index % categoryColors.length],
        }));
        setCategories(dataWithColors);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({
        x: nextIndex * (width - 60),
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);


  const handleSearch = async (text) => {
    setIsSearching(true);
    setSearchTerm(text);
    if (text.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/search/search`, {
        params: { searchQuery: text },
      });
      setOriginalSearchResults(response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
  };



  const { applySort, sortResults } = useSortLogic(
    searchResults,
    setSearchResults,
    setSelectedSortOption
  );

  const {
    selectedRating,
    setSelectedRating,
    selectedDistance,
    setSelectedDistance,
    mobileServiceOnly,
    setMobileServiceOnly,
    applyFilters,
    resetFilters,
  } = useFilterLogic(
    originalSearchResults,
    selectedSortOption,
    setSearchResults,
    setFilterModalVisible,
    sortResults
  );

  const handleAddToCart = async (serviceId) => {
    if (addedServices.includes(serviceId)) return;

    setIsLoading(true);
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await AsyncStorage.getItem('userId');

    if (!token || !userId) {
      setIsLoading(false);
      Alert.alert('Error', 'User is not logged in');
      return;
    }

    try {
      const response = await axios.post(
        'http://176.119.254.225:80/cart/add-to-cart',
        { subcategory_id: serviceId },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Item added to cart!');
        setAddedServices((prev) => [...prev, serviceId]);
      }
    } catch (error) {
      //console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    // Map category names to appropriate icons
    const iconMap = {
      'Body': 'car-sport',
      'Car Wash': 'water',
      'Electrical': 'flash',
      'Maintenance': 'construct',
      'Mechanical': 'settings',
      'Paint': 'color-palette',
      'Polish': 'brush',
      'Repair': 'build',
      'Tire Services': 'aperture',
      // Default icon if category not found
      'default': 'car'
    };

    // Return the mapped icon or default icon if not found
    return iconMap[categoryName] || iconMap['default'];
  };

  return (
    <View style={styles.container}>
      {/* Fixed Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Anything..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => handleSearch(searchTerm)}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {!isSearching ? (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Banners */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {banners.map((img, index) => (
              <Image key={`banner-${index}`} source={{ uri: img }} style={styles.imageBanner} />
            ))}
          </ScrollView>

          {/* Frequently Booked Services */}
          <Text style={styles.sectionTitle}>Frequently Booked Services</Text>
          <View style={styles.separator} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.frequentServicesContainer}
          >
            {frequentServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>₪{service.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addToCartButton,
                      addedServices.includes(service.id) && { backgroundColor: '#ccc' },
                    ]}
                    onPress={() => handleAddToCart(service.id)}
                    disabled={addedServices.includes(service.id) || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons 
                          name={addedServices.includes(service.id) ? "checkmark-circle" : "cart-outline"} 
                          size={width * 0.045} 
                          color="#086189" 
                        />
                        <Text style={styles.buttonText}>
                          {addedServices.includes(service.id) ? 'Added' : 'Add to Cart'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Categories Grid */}
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.separator} />
          
          <View style={styles.categoryGridContainer}>
            <View style={styles.categoryGrid}>
              {(showAllCategories ? categories : categories.slice(0, 6)).map((item) => {
                const animatedValue = getAnimatedValue(item.category_id);
                
                const circleScale = animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 4]
                });

                const circleOpacity = animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.2]
                });

                return (
                  <AnimatedTouchable
                    key={`category-list-${item.category_id}`}
                    style={styles.categoryGridItem}
                    onPress={() => {
                      navigation.navigate('Subcategory', {
                        categoryId: item.category_id,
                        categoryName: item.category_name
                      });
                    }}
                    onPressIn={() => handlePressIn(item.category_id)}
                    onPressOut={() => handlePressOut(item.category_id)}
                    activeOpacity={1}
                  >
                    <View style={styles.categoryContent}>
                      <View style={styles.iconWrapper}>
                        <Animated.View 
                          style={[
                            styles.categoryIconContainer, 
                            { 
                              backgroundColor: item.color,
                              transform: [{ scale: circleScale }],
                              opacity: circleOpacity,
                              
                            }
                          ]}
                        />
                        <View style={styles.iconContainer}>
                          <Ionicons 
                            name={getCategoryIcon(item.category_name)} 
                            size={24} 
                            color="#fff" 
                          />
                        </View>
                      </View>
                      <Text 
                        style={styles.categoryGridText}
                          numberOfLines={1}
                      >
                        {item.category_name}
                      </Text>
                    </View>
                  </AnimatedTouchable>
                );
              })}
            </View>
          </View>

          
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllCategories(!showAllCategories)}
            >
              <Text style={styles.showMoreText}>
                {showAllCategories ? 'SHOW LESS' : 'SHOW MORE'}
              </Text>
              <Ionicons
                name={showAllCategories ? 'chevron-up' : 'chevron-down'}
                style={styles.showMoreIcon}
              />
            </TouchableOpacity>
          
        </ScrollView>
      ) : (
        <SearchResult
          searchResults={searchResults}
          isLoading={isLoading}
          searchTerm={searchTerm}
          navigation={navigation}
          setSortModalVisible={setSortModalVisible}
          setFilterModalVisible={setFilterModalVisible}
        />
      )}

      {/* Modals */}
      <Filter
        visible={filterModalVisible}
        setVisible={setFilterModalVisible}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        selectedRating={selectedRating}
        selectedDistance={selectedDistance}
        mobileServiceOnly={mobileServiceOnly}
        setSelectedRating={setSelectedRating}
        setSelectedDistance={setSelectedDistance}
        setMobileServiceOnly={setMobileServiceOnly}
      />
      <Sort
        visible={sortModalVisible}
        setVisible={setSortModalVisible}
        applySort={applySort}
        setSelectedSortOption={setSelectedSortOption}
      />

      {/* Floating Buttons */}
      <View style={styles.fixedButtons}>
        <TouchableOpacity
          style={[styles.floatingButton, styles.chatButton]}
          onPress={() => navigation.navigate('ChatBot')}
        >
          <Ionicons name="chatbubbles" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingButton, styles.cartButton]}
          onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

};

export default Home;