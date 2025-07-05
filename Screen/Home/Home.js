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
import Filter from "../Book/ResultOperation/Filter";
import Sort from "../Book/ResultOperation/Sort";
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [pressedCard, setPressedCard] = useState(null);

  const animatedValues = useRef({}).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const [favoriteMechanics, setFavoriteMechanics] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const animatedCircleValues = useRef({}).current;
  const freezeTimeoutRef = useRef(null);

  // Mock emergency service types (should come from backend in the future)
  const EMERGENCY_TYPES = [
    { key: 'mechanical', label: 'Mechanical Emergencies', icon: 'construct-outline' },
    { key: 'electrical', label: 'Electrical Emergencies', icon: 'flash-outline' },
    { key: 'repair', label: 'Repair Services', icon: 'build-outline' },
    { key: 'tire services', label: 'Tire Services', icon: 'aperture-outline' },
    { key: 'other', label: 'Other Services', icon: 'help-circle-outline' },
  ]; // TODO: Fetch from backend

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchFavorites = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const res = await axios.get('http://176.119.254.225:80/favourite/myfavorites', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (isActive) setFavoriteMechanics(res.data.favorites);
        } catch (error) {
          if (isActive) setFavoriteMechanics([]);
          console.error('Error fetching favorites:', error);
        } finally {
          if (isActive) setLoadingFavorites(false);
        }
      };
      setLoadingFavorites(true);
      fetchFavorites();
      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    if (!isSearching) {
      // Only refetch when returning to main home view
      const fetchFavorites = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const res = await axios.get('http://176.119.254.225:80/favourite/myfavorites', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFavoriteMechanics(res.data.favorites);
        } catch (error) {
          setFavoriteMechanics([]);
          console.error('Error fetching favorites:', error);
        } finally {
          setLoadingFavorites(false);
        }
      };
      setLoadingFavorites(true);
      fetchFavorites();
    }
  }, [isSearching]);

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

  useEffect(() => {
    if (isSearching) {
      Animated.spring(searchAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
    } else {
      Animated.spring(searchAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }).start();
    }
  }, [isSearching]);

  const animateTransition = (toSearch) => {
    if (toSearch) {
      // Animate to search results - smoother transition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsSearching(true);
        // Reset position before fading in
        slideAnim.setValue(20);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Animate back to home - keep the current smooth animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsSearching(false);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

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
      const response = await axios.get(`${config.apiUrl}/search/searchhome`, {
        params: { keyword: text },
      });
      const results = response.data.results || [];
      setOriginalSearchResults(results);
      setSearchResults(results);
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
    animateTransition(false);
  };




  // const { applySort, sortResults } = useSortLogic(
  //   searchResults,
  //   setSearchResults,
  //   setSelectedSortOption
  // );

  // const {
  //   selectedRating,
  //   setSelectedRating,
  //   selectedDistance,
  //   setSelectedDistance,
  //   mobileServiceOnly,
  //   setMobileServiceOnly,
  //   applyFilters,
  //   resetFilters,
  // } = useFilterLogic(
  //   originalSearchResults,
  //   selectedSortOption,
  //   setSearchResults,
  //   setFilterModalVisible,
  //   sortResults
  // );

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

  const getCircleAnimatedValue = (id) => {
    if (!animatedCircleValues[id]) {
      animatedCircleValues[id] = new Animated.Value(0);
    }
    return animatedCircleValues[id];
  };

  const handleCardPressIn = (id) => {
    if (freezeTimeoutRef.current) {
      clearTimeout(freezeTimeoutRef.current);
      freezeTimeoutRef.current = null;
    }
    Animated.timing(getCircleAnimatedValue(id), {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
    setPressedCard(id);
  };

  const handleCardPressOut = (id) => {
    // Freeze the animation at full size for 120ms before animating out
    freezeTimeoutRef.current = setTimeout(() => {
      Animated.timing(getCircleAnimatedValue(id), {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setPressedCard(null);
    }, 120);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar with Filter/Sort */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            transform: [{
              scale: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.03]
              })
            }]
          }
        ]}
      >
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.mediumGray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Anything..."
            placeholderTextColor={Colors.mediumGray}
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)} // بس تحدث القيمة
            onSubmitEditing={() => {
              handleSearch(searchTerm); // لما يضغط Enter نعمل بحث وتنقل
              animateTransition(true); // أنيميشن لو في
            }}
            returnKeyType="search"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.mediumGray} />
            </TouchableOpacity>
          )}
        </View>

        {isSearching && (
          <Animated.View
            style={[
              styles.searchActions,
              {
                opacity: searchAnim,
                transform: [{
                  translateX: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.searchActionButton}
              onPress={() => setSortModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="swap-vertical" size={24} color={Colors.green} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchActionButton}
              onPress={() => setFilterModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="options" size={24} color={Colors.orange} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {(!isSearching || searchTerm.trim().length === 0) ? (
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

            {/* Emergency Services Section */}
            <Text style={styles.sectionTitle}>Emergency Services</Text>
            <View style={styles.separator} />
            <View style={styles.emergencyTypeGrid}>
              {EMERGENCY_TYPES.map((item) => {
                const circleAnim = getCircleAnimatedValue(item.key);
                const scale = circleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                });
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.emergencyTypeCard}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('EmergencyServices', { type: item })}
                    onPressIn={() => handleCardPressIn(item.key)}
                    onPressOut={() => handleCardPressOut(item.key)}
                  >
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      {/* Animated grow-up circle */}
                      <Animated.View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          width: 60,
                          height: 60,
                          borderRadius: 30,
                          backgroundColor: 'rgba(243, 14, 14, 0.15)',
                          alignSelf: 'center',
                          top: '50%',
                          left: '50%',
                          transform: [
                            { translateX: -30 },
                            { translateY: -30 },
                            { scale },
                          ],
                        }}
                      />
                      <Ionicons name={item.icon} size={32} color={pressedCard === item.key ? '#ff1744' : '#ff1744'} style={{ marginBottom: 8 }} />
                      <Text style={styles.emergencyTypeLabel}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>
        ) : (
          <SearchResult
            searchResults={searchResults}
            isLoading={isLoading}
            searchTerm={searchTerm}
            navigation={navigation}
          />
        )}
      </Animated.View>

      {/* Modals */}
      {/* <Filter
        visible={filterModalVisible}
        setVisible={setFilterModalVisible}
        // applyFilters={applyFilters}
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
        // applySort={applySort}
        setSelectedSortOption={setSelectedSortOption}
      /> */}

      {/* Floating Buttons */}
      {!isSearching && (
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
      )}
    </View>
  );

};

export default Home;