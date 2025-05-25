
import React, { useRef, useEffect, useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
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


const { width } = Dimensions.get("window");

const banners = [
  "https://www.steelcobuildings.com/wp-content/uploads/2024/06/AdobeStock_156266430_Preview-e1718286922289.jpeg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScjx6u5FKaBN0-ruxflRpLSztC_4Iuj73PDg&s",
  "https://www.steelcobuildings.com/wp-content/uploads/2024/06/AdobeStock_156266430_Preview-e1718286922289.jpeg",
];

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
 const [selectedCategory, setSelectedCategory] = useState(null);
const [subcategories, setSubcategories] = useState([]);
const [selectedSubcategories, setSelectedSubcategories] = useState([]);
const [cartCount, setCartCount] = useState(0);
const [addedServices, setAddedServices] = useState([]);



  useEffect(() => {
    const fetchFrequentServices = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/service/services/frequent`); // Adjust endpoint
        setFrequentServices(response.data);
      } catch (error) {
        console.error("Failed to fetch frequent services:", error);
        // fallback
        setFrequentServices([
          { id: 1, name: "Oil Change", price: 25 },
          { id: 2, name: "Tire Rotation", price: 15 },
        ]);
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
          Colors.orange,
          Colors.green,
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
const fetchSubcategories = async (categoryId) => {
  try {
    const response = await axios.get(`${config.apiUrl}/ServiceCategories/categories/${categoryId}/subcategories`);
    setSubcategories(response.data);
    console.log('Category ID:', categoryId);
    console.log('Subcategories:', response.data);
  } catch (error) {
    console.error("Failed to fetch subcategories:", error);
  }
};
const CustomCheckBox = ({ label, checked, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
    <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={24} color="#086189" />
    <Text style={{ marginLeft: 10 }}>{label}</Text>
  </TouchableOpacity>
);

 useEffect(() => {
    const getCartCount = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('accessToken');

      if (userId && token) {
        try {
          const response = await axios.get('https:176.119.254.225:80/cart/cart', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          let totalQuantity = 0;
          response.data.cart.forEach((item) => {
            totalQuantity += item.quantity;
          });
          setCartCount(totalQuantity); // Update the state with total quantity
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      }
    };

    getCartCount();
  }, [cartCount]); // Re-fetch when the cart count changes

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
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 200 || response.status === 201) {
      Alert.alert('Success', 'Item added to cart!');
      setAddedServices((prev) => [...prev, serviceId]); // Add to list of added items
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    Alert.alert('Error', 'Failed to add item to cart');
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  let isMounted = true;

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const res = await axios.get('http://176.119.254.225:80/cart/count', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isMounted && res.status === 200) {
        setCartCount(res.data.serviceCount);
      }
    } catch (err) {
      if (isMounted) {
        console.error('Cart count fetch error:', err.message);
      }
    }
  };

  fetchCartCount();

  return () => {
    isMounted = false;
  };
}, []);




  const toggleSubcategory = (subcategoryId) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId) // remove the subcategory
        : [...prev, subcategoryId] // add the subcategory
    );
  };

return (
  <View style={styles.container}>
    {/* Search Bar */}
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
      <ScrollView style={styles.scrollContent}>
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
                    <Text style={styles.buttonText}>
                      {addedServices.includes(service.id) ? 'Added' : 'Add to Cart'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Categories or Subcategories */}
        {selectedCategory ? (
          <>
            <Text style={styles.sectionTitle}>
              Subcategories for {selectedCategory.category_name}
            </Text>
            <View style={styles.separator} />

            <View style={styles.subcategoryList}>
              {subcategories.map((sub) => (
                <View key={sub.subcategory_id} style={styles.subcategoryItem}>
                  <TouchableOpacity
                    onPress={() => toggleSubcategory(sub.subcategory_id)}
                    style={styles.checkboxContainer}
                  >
                    <Ionicons
                      name={
                        selectedSubcategories.includes(sub.subcategory_id)
                          ? 'checkbox'
                          : 'square-outline'
                      }
                      size={24}
                      color="#086189"
                    />
                    <Text style={styles.subcategoryText}>
                      {sub.subcategory_name} - 	₪{sub.price}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Back to Categories */}
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={{
                alignSelf: 'center',
                marginTop: 20,
                padding: 10,
                backgroundColor: '#086189',
                borderRadius: 6,
                marginBottom: 30,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Back to Categories
              </Text>
            </TouchableOpacity>
           <TouchableOpacity
  style={[styles.addToCartButton, { alignSelf: 'center', marginTop: 20 }]}
  onPress={() => {
    selectedSubcategories.forEach((id) => handleAddToCart(id));
  }}
>
  <Text style={styles.buttonText}>Add Selected to Cart</Text>
</TouchableOpacity>

          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.separator} />

            {categories
              .slice(0, showAllCategories ? categories.length : 5)
              .map((item, index) => (
                <TouchableOpacity
                  key={`category-list-${item.category_id}`}
                  style={{
                    marginBottom: 10,
                    marginHorizontal: 20,
                    padding: 12,
                    backgroundColor: '#f8f8f8',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderLeftWidth: 4,
                    borderLeftColor: item.color,
                  }}
                  onPress={() => {
                    fetchSubcategories(item.category_id);
                    setSelectedCategory(item);
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      backgroundColor: item.color,
                      borderRadius: 18,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, color: '#333', fontWeight: '500' }}>
                    {item.category_name}
                  </Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.mediumGray} />
                  </View>
                </TouchableOpacity>
              ))}

            {categories.length > 5 && (
              <TouchableOpacity
                style={{
                  alignSelf: 'center',
                  padding: 10,
                  marginBottom: 20,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => setShowAllCategories(!showAllCategories)}
              >
                <Text style={{ color: Colors.mediumGray, fontWeight: 'bold', fontSize: 13 }}>
                  {showAllCategories ? 'SHOW LESS' : 'SHOW MORE'}
                </Text>
                <Ionicons
                  name={showAllCategories ? 'chevron-up' : 'chevron-down'}
                  style={{
                    marginLeft: 10,
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: Colors.mediumGray,
                  }}
                />
              </TouchableOpacity>
            )}
          </>
        )}

       
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
        {cartCount > 0 && (
          <View style={styles.cartNotification}>
            <Text style={styles.cartNotificationText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

};
export default Home;
