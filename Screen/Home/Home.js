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
import Footer from "../../Components/Footer/Footer ";
import { useFilterLogic } from "./ResultOperation/useFilterLogic";
import { useSortLogic } from "./ResultOperation/useSortLogic";

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
  const [categories, setCategories] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [originalSearchResults, setOriginalSearchResults] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch categories from the API and assign colors
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

  // Auto-scroll the banner images every 3 seconds
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

      // console.log("Search results response:", response.data);

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

  return (
    <View style={styles.container}>
      {/* search Container */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
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

      {/* Home page  */}
      {!isSearching && (
        <ScrollView style={styles.scrollContent}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {banners.map((img, index) => (
              <Image
                key={`banner-${index}`}
                source={{ uri: img }}
                style={styles.imageBanner}
              />
            ))}
          </ScrollView>

          {/* Explore our Services */}
          <Text style={styles.sectionTitle}>Explore our Services</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
          >
            {/* TODO: this must show examples to search -- serveses  */}
            {categories.map((item) => (
              <TouchableOpacity
                key={`category-${item.category_id}`}
                style={[styles.categoryChip, { backgroundColor: item.color }]}
              >
                <Text style={styles.categoryText}>{item.category_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Categories */}
          <Text style={styles.sectionTitle}>Categories</Text>
          {categories
            .slice(0, showAllCategories ? categories.length : 5)
            .map((item, index) => (
              <TouchableOpacity
                key={`category-list-${item.category_id}`}
                style={{
                  marginBottom: 10,
                  marginHorizontal: 20,
                  padding: 12,
                  backgroundColor: "#f8f8f8",
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  borderLeftWidth: 4,
                  borderLeftColor: item.color,
                }}
                // TODO onPress={() => navigation.navigate('CategoryDetails', { category: item })}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    backgroundColor: item.color,
                    borderRadius: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {index + 1}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 14, color: "#333", fontWeight: "500" }}
                >
                  {item.category_name}
                </Text>
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.mediumGray}
                  />
                </View>
              </TouchableOpacity>
            ))}

          {/* Show More Button */}
          {categories.length > 5 && (
            <TouchableOpacity
              style={{
                alignSelf: "center",
                padding: 10,
                marginBottom: 20,
                backgroundColor: "transparent",
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => setShowAllCategories(!showAllCategories)}
            >
              <Text
                style={{
                  color: Colors.mediumGray,
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              >
                {showAllCategories ? "SHOW LESS" : "SHOW MORE"}
              </Text>

              <Ionicons
                name={showAllCategories ? "chevron-up" : "chevron-down"}
                style={{
                  marginLeft: 10,
                  size: 20,
                  fontWeight: "bold",
                  color: Colors.mediumGray,
                }}
              />
            </TouchableOpacity>
          )}

          <Footer />
        </ScrollView>
      )}

      {isSearching && (
        <SearchResult
          searchResults={searchResults}
          isLoading={isLoading}
          searchTerm={searchTerm}
          navigation={navigation}
          setSortModalVisible={setSortModalVisible}
          setFilterModalVisible={setFilterModalVisible}
        />
      )}

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
    </View>
  );
};

export default Home;
