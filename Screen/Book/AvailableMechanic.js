import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  Animated,
} from "react-native";
import WorkshopCard from "../../Components/WorkshopCard/WorkshopCard";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import Filter from "../Book/ResultOperation/Filter";
import Sort from "../Book/ResultOperation/Sort";
import Colors from "../../Components/Colors/Colors";



const AvailableMechanic = ({ route, navigation }) => {
const { date = null, timeSlots = [], subcategoryIds } = route.params || {};
  //.log("date:", date, "time", timeSlots, "subcategoryIds:", subcategoryIds);

  const [rawWorkshops, setRawWorkshops] = useState({
    perfectMatch: [],
    partialMatch: [],
    splitMatch: [],
  });
  const [workshops, setWorkshops] = useState({
    perfectMatch: [],
    partialMatch: [],
    splitMatch: [],
  });

  const [loading, setLoading] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [selectedSortOption, setSelectedSortOption] = useState(null);
  const [showAllResults, setShowAllResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPerfectMatch, setFilteredPerfectMatch] = useState([]);
  const [filteredFetchedWorkshops, setFilteredFetchedWorkshops] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchBarWidth = useRef(new Animated.Value(1)).current;
  const [selectedTab, setSelectedTab] = useState('available');
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [fetchedWorkshops, setFetchedWorkshops] = useState([]);  // هنا خزّن الورش الجديدة
 const[selectedDate, setSelectedDate] = useState(null); // لتخزين التاريخ المختار من الكارد
 const normalizeTimeString = (time) => {
  return time
    .replace(/\u202F/g, " ") // استبدل الـ Narrow No-Break Space بـ Space عادي
    .replace(/^(\d):/, "0$1:") // أضف 0 للبداية لو الساعة رقم واحد
    .trim();
};


  // الفلترة والتحويل بأمان
const safeTimeSlots = Array.isArray(timeSlots) ? timeSlots.map(normalizeTimeString) : [];

const formattedTimeSlots = safeTimeSlots.length > 0
  ? safeTimeSlots.join(", ")
  : "";
  //console.log("Safe time slots:", safeTimeSlots);

  //console.log("Formatted time slots:", formattedTimeSlots);

  const transform = (list) => {
    //console.log("\n=== TRANSFORM INPUT ===");
    //console.log("Input list:", JSON.stringify(list, null, 2));

    const transformed = list.map((item) => {
      //console.log("\nProcessing item:", JSON.stringify(item, null, 2));
      const result = {
        workshop_name: item.workshop_name || "Workshop",
        rate: item.rate || item.rating || 0,
        workshop_id: item.workshop_id,
        image: item.profile_picture || "",
        distance: item.distance_km || 0,
        city: item.city || "Unknown City",
        street: item.street || "Unknown Street",
        mobileAssistance: item.mobile_assistance || false,

        services: (item.services || []).map(s => ({
          service_id: s.service_id || s.id,
          name: s.service_name || s.name || "Service",
          price: s.price || 0,
          is_mobile: s.is_mobile || false,
          mobile_fee: s.mobile_fee || 0,
        })),
      };
      //console.log("services:", result.services);
      //console.log("Transformed result:", JSON.stringify(result, null, 2));
      return result;
    });
    //to show all results in console
    //console.log("\n=== FINAL TRANSFORMED DATA ===");
    //console.log(JSON.stringify(transformed, null, 2));
    return transformed;
  };
  const fetchAvailableWorkshops = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("accessToken");

      // Prepare filter parameters
      const filterParams = {
        preferred_date: date,
        preferred_time: formattedTimeSlots,
      };
     // console.log ("Filter parameters:", filterParams);

      // Add rating filter if selected
      if (selectedRating) {
        filterParams.minRating = selectedRating;
      }

      // Add distance filter if selected
      if (selectedDistance) {
        filterParams.maxDistance = selectedDistance;
      }

      const response = await axios.post(
        "http://176.119.254.225:80/search/search-available-workshops",
        filterParams,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const {
        perfectMatch = [],
        partialMatch = [],
        splitMatch = [],
      } = response.data;

      // Apply local filtering for any additional criteria
      const filterWorkshops = (workshops) => {
        return workshops.filter(workshop => {
          // Rating filter
          if (selectedRating && workshop.rate < selectedRating) {
            return false;
          }

          // Distance filter
          if (selectedDistance && workshop.distance_km > selectedDistance) {
            return false;
          }

          return true;
        });
      };

      // Apply filters to each category
      const filteredPerfectMatch = filterWorkshops(perfectMatch);
      const filteredPartialMatch = filterWorkshops(partialMatch);
      const filteredSplitMatch = splitMatch.map(group => filterWorkshops(group));

      setRawWorkshops({
        perfectMatch: filteredPerfectMatch,
        partialMatch: filteredPartialMatch,
        splitMatch: filteredSplitMatch
      });

      setWorkshops({
        perfectMatch: transform(filteredPerfectMatch),
        partialMatch: transform(filteredPartialMatch),
        splitMatch: filteredSplitMatch.map(group => transform(group)),
      });

    } catch (error) {
      console.error("❌ Error fetching workshops:", error);
      Alert.alert(
        "Error",
        "Failed to fetch workshops. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const fetchWorkshopsWithoutDate = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");

      if (!subcategoryIds || subcategoryIds.length === 0) {
        throw new Error("No subcategory IDs provided");
      }

      const formattedIds = Array.isArray(subcategoryIds) ? subcategoryIds.join(",") : subcategoryIds;

      const response = await axios.get(
        `http://176.119.254.225:80/search/workshops/search`,
        {
          params: { subcategoryIds: formattedIds },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const workshops = response.data.workshops || [];

      const transformedWorkshops = transform(workshops);
      setFetchedWorkshops(transformedWorkshops);


      // تطبيق الفلترة إذا حابب
      const filtered = transformedWorkshops.filter((w) => {
        if (selectedRating && w.rate < selectedRating) return false;
        if (selectedDistance && w.distanceKm > selectedDistance) return false;
        return true;
      });

      // ممكن تحط setFilteredWorkshops هنا لو بدك تستخدمها

    } catch (error) {
      console.error("❌ Error fetching basic workshops:", error);
      Alert.alert("Error", "Failed to fetch workshops without date.");
    } finally {
      setLoading(false);
    }
  };


  // Update sorting functions
  const sortWorkshops = (workshops, sortOption) => {
    if (!sortOption) return workshops;

    const sortedWorkshops = [...workshops];
    const [category, direction] = sortOption.split('_');

    switch (category) {
      case 'rating':
        return direction === 'high'
          ? sortedWorkshops.sort((a, b) => (b.rate || 0) - (a.rate || 0))
          : sortedWorkshops.sort((a, b) => (a.rate || 0) - (b.rate || 0));

      case 'distance':
        return direction === 'high'
          ? sortedWorkshops.sort((a, b) => (b.distance || 0) - (a.distance || 0))
          : sortedWorkshops.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      case 'price':
        return direction === 'high'
          ? sortedWorkshops.sort((a, b) => {
            const totalPriceB = b.services?.reduce((sum, service) => sum + (service.price || 0), 0) || 0;
            const totalPriceA = a.services?.reduce((sum, service) => sum + (service.price || 0), 0) || 0;
            return totalPriceB - totalPriceA;
          })
          : sortedWorkshops.sort((a, b) => {
            const totalPriceA = a.services?.reduce((sum, service) => sum + (service.price || 0), 0) || Infinity;
            const totalPriceB = b.services?.reduce((sum, service) => sum + (service.price || 0), 0) || Infinity;
            return totalPriceA - totalPriceB;
          });

      default:
        return workshops;
    }
  };

  const applySort = () => {
    if (!selectedSortOption) return;

    // If we have fetched workshops (user skipped), apply sort to them
    if (fetchedWorkshops.length > 0 && (!rawWorkshops.perfectMatch || rawWorkshops.perfectMatch.length === 0)) {
      // Get the current list to sort (either filtered or original)
      let currentList;
      if (searchQuery || selectedRating || selectedDistance) {
        // If we have filters/search, use the filtered list
        currentList = filteredFetchedWorkshops.length > 0 ? filteredFetchedWorkshops : fetchedWorkshops;
      } else {
        // If no filters, use original list
        currentList = fetchedWorkshops;
      }
      
      const sortedFetched = sortWorkshops(currentList, selectedSortOption);
      setFilteredFetchedWorkshops(sortedFetched);
      return;
    }

    // Apply sort to date-selected workshops
    const sortedWorkshops = {
      perfectMatch: sortWorkshops(workshops.perfectMatch, selectedSortOption),
      partialMatch: sortWorkshops(workshops.partialMatch, selectedSortOption),
      splitMatch: workshops.splitMatch.map(group =>
        sortWorkshops(group, selectedSortOption)
      )
    };

    setWorkshops(sortedWorkshops);
  };

  // Update useEffect to handle sorting
  useEffect(() => {
    if (selectedSortOption) {
      applySort();
    }
  }, [selectedSortOption]);

  const applyFilters = () => {
    setShowAllResults(false); // Reset to show only first 3 results

    // If we have fetched workshops (user skipped), apply filters to them
    if (fetchedWorkshops.length > 0 && (!rawWorkshops.perfectMatch || rawWorkshops.perfectMatch.length === 0)) {
      const filteredFetched = fetchedWorkshops.filter(workshop => {
        // Rating filter
        if (selectedRating && workshop.rate < selectedRating) {
          return false;
        }

        // Distance filter
        if (selectedDistance && workshop.distance > selectedDistance) {
          return false;
        }

        return true;
      });
      
      setFilteredFetchedWorkshops(filteredFetched);
      return;
    }

    // Filter the workshops based on selected criteria (for date-selected scenario)
    const filterWorkshops = (workshops) => {
      return workshops.filter(workshop => {
        // Rating filter
        if (selectedRating && workshop.rate < selectedRating) {
          return false;
        }

        // Distance filter
        if (selectedDistance && workshop.distance_km > selectedDistance) {
          return false;
        }

        return true;
      });
    };

    // Apply filters to each category
    const filteredPerfectMatch = filterWorkshops(rawWorkshops.perfectMatch);
    const filteredPartialMatch = filterWorkshops(rawWorkshops.partialMatch);
    const filteredSplitMatch = rawWorkshops.splitMatch.map(group => filterWorkshops(group));

    // Update the workshops state with filtered results
    setWorkshops({
      perfectMatch: transform(filteredPerfectMatch),
      partialMatch: transform(filteredPartialMatch),
      splitMatch: filteredSplitMatch.map(group => transform(group)),
    });

    // Update filtered perfect match for search
    setFilteredPerfectMatch(transform(filteredPerfectMatch));
  };

  const resetFilters = () => {
    setSelectedRating(null);
    setSelectedDistance(null);
    setSelectedSortOption(null); // Reset sort as well
    setShowAllResults(false);

    // If we have fetched workshops (user skipped), reset them
    if (fetchedWorkshops.length > 0 && (!rawWorkshops.perfectMatch || rawWorkshops.perfectMatch.length === 0)) {
      setFilteredFetchedWorkshops(fetchedWorkshops);
      return;
    }

    // Reset to original data (for date-selected scenario)
    setWorkshops({
      perfectMatch: transform(rawWorkshops.perfectMatch),
      partialMatch: transform(rawWorkshops.partialMatch),
      splitMatch: rawWorkshops.splitMatch.map(group => transform(group)),
    });

    // Reset filtered perfect match for search
    setFilteredPerfectMatch(transform(rawWorkshops.perfectMatch));
  };

  // Update useEffect to handle filter changes
  useEffect(() => {
    if (selectedRating !== null || selectedDistance !== null) {
      applyFilters();
    }
  }, [selectedRating, selectedDistance]);


  const handleBookPress = (data, selectedTimeSlot , selectedDate) => {
    // Ensure services data is properly structured
    const formattedData = {
      ...data,
      services: data.services.map(service => ({
        service_id: service.service_id,
        service_name: service.name,
        is_mobile: service.is_mobile || false,
        mobile_fee: service.mobile_fee || 0,
        price: service.price
      }))
    };

    navigation.navigate("BookSummary", {
      data: formattedData,
      date: selectedDate || date,
      timeSlots: selectedTimeSlot,
    });
  };

  const handleShopPress = (data) => {
    // Ensure we have all required data before navigation
    const workshopData = {
      ...data,
      workshop_id: data.workshop_id,
      workshop_name: data.workshop_name,
      rate: data.rate,
      image: data.profile_picture,
      city: data.city || "Unknown City",
      street: data.street || "Unknown Street",
      services: data.services || [],
      date : date || null,
      timeSlots,
    };

    navigation.navigate("WorkshopDetails", { workshopData });
  };

  useEffect(() => {
    if (date && formattedTimeSlots.length > 0) {
      fetchAvailableWorkshops();
    } else {
      fetchWorkshopsWithoutDate();
    }
  }, [selectedRating, selectedDistance, date, formattedTimeSlots]);

  // Initialize filtered workshops when fetchedWorkshops changes
  useEffect(() => {
    setFilteredFetchedWorkshops(fetchedWorkshops);
  }, [fetchedWorkshops]);


  const handleBookMultiple = (combo) => {
    navigation.navigate("SplitBookingPage", {
      splitMatches: combo, // 🔥 أرسل المجموعة المختارة فقط
      date,
      timeSlots,
      selectedCar: route.params.selectedCar,
    });
  };

  const useFilterLogicForWorkshops = (
    originalData,
    selectedSortOption,
    setWorkshops,
    setFilterModalVisible,
    sortResults
  ) => {
    const [selectedRating, setSelectedRating] = useState(null);
    const [selectedDistance, setSelectedDistance] = useState(null);

    const applyFilters = () => {
      if (!selectedRating && !selectedDistance) {
        const sorted = sortResults(originalData, selectedSortOption);
        setWorkshops(sorted);
        setFilterModalVisible(false);
        return;
      }

      const filterFn = (item) => {
        if (selectedRating && item.rate < selectedRating) return false;
        if (selectedDistance && item.distance_km > selectedDistance) return false;
        return true;
      };

      const filteredData = {
        perfectMatch: originalData.perfectMatch.filter(filterFn),
        partialMatch: originalData.partialMatch?.filter(filterFn) || [],
        splitMatch: originalData.splitMatch?.filter(filterFn) || [],
      };

      const sortedFiltered = sortResults(filteredData, selectedSortOption);

      setWorkshops(sortedFiltered);
      setFilterModalVisible(false);
    };

    const resetFilters = () => {
      setSelectedRating(null);
      setSelectedDistance(null);

      const sorted = sortResults(originalData, selectedSortOption);
      setWorkshops(sorted);
    };

    return {
      selectedRating,
      setSelectedRating,
      selectedDistance,
      setSelectedDistance,
      applyFilters,
      resetFilters,
    };
  };

  // Function to get limited results
  const getLimitedResults = (data) => {
    if (showAllResults) return data;
    return data.slice(0, 3);
  };

  // Add loading indicator
  const renderLoading = () => {
    if (loading) {
      return (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <ActivityIndicator size="large" color={Colors.blue} />
        </View>
      );
    }
    return null;
  };

  // Add search filter function
  const filterWorkshopsBySearch = (query) => {
    if (!query.trim()) {
      setFilteredPerfectMatch(workshops.perfectMatch);
      setFilteredFetchedWorkshops(fetchedWorkshops);
      return;
    }

    // Search in perfect match workshops
    const filteredPerfect = workshops.perfectMatch.filter(workshop =>
      workshop.workshop_name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Search in fetched workshops (when user skips date selection)
    const filteredFetched = fetchedWorkshops.filter(workshop =>
      workshop.workshop_name.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredPerfectMatch(filteredPerfect);
    setFilteredFetchedWorkshops(filteredFetched);
  };

  // Apply sort to search results
  const applySortToSearchResults = () => {
    if (!selectedSortOption) return;
    
    // Apply sort to perfect match search results
    if (filteredPerfectMatch.length > 0) {
      const sortedPerfect = sortWorkshops(filteredPerfectMatch, selectedSortOption);
      setFilteredPerfectMatch(sortedPerfect);
    }
    
    // Apply sort to fetched workshops search results
    if (filteredFetchedWorkshops.length > 0) {
      const sortedFetched = sortWorkshops(filteredFetchedWorkshops, selectedSortOption);
      setFilteredFetchedWorkshops(sortedFetched);
    }
  };

  // Update useEffect to handle search
  useEffect(() => {
    filterWorkshopsBySearch(searchQuery);
  }, [searchQuery, workshops.perfectMatch, fetchedWorkshops]);

  // Apply sort when sort option changes
  useEffect(() => {
    if (selectedSortOption) {
      applySort();
    }
  }, [selectedSortOption]);

  const animateSearchFocus = (focused) => {
    Animated.spring(searchBarWidth, {
      toValue: focused ? 1 : 1,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    animateSearchFocus(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    animateSearchFocus(false);
  };

  const animateBorder = (toValue) => {
    Animated.spring(borderAnim, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  useEffect(() => {
    animateBorder(selectedTab === 'available' ? 0 : 1);
  }, [selectedTab]);

  return (
    <View style={{ flex: 1 }}>
      {renderLoading()}

      {/* --- FILTER & SORT MODALS --- */}
      <Filter
        visible={filterModalVisible}
        setVisible={setFilterModalVisible}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        selectedRating={selectedRating}
        selectedDistance={selectedDistance}
        setSelectedRating={setSelectedRating}
        setSelectedDistance={setSelectedDistance}
      />

      <Sort
        visible={sortModalVisible}
        setVisible={setSortModalVisible}
        applySort={applySort}
        setSelectedSortOption={setSelectedSortOption}
        selectedSortOption={selectedSortOption}
        sortOptions={[
          { id: 'price', label: 'Price', icon: 'pricetag' },
          { id: 'rating', label: 'Rating', icon: 'star' },
          { id: 'distance', label: 'Distance', icon: 'location' }
        ]}
      />

      {/* --- FILTER & SORT BUTTONS TOP BAR (Right Aligned) --- */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginVertical: 12,
          alignItems: "center",
        }}
      >
        {(workshops.perfectMatch?.length > 0 || fetchedWorkshops.length > 0) ? (
          <Animated.View style={{
            flex: searchBarWidth,
            marginRight: isSearchFocused ? 0 : 10,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingHorizontal: 15,
              height: 45,
              borderWidth: 1,
              borderColor: isSearchFocused ? Colors.mediumGray : '#E5E5E5',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <Ionicons
                name="search-outline"
                size={20}
                color={Colors.darkGray}
              />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontSize: 15,
                  color: Colors.darkGray,
                }}
                placeholder="Search workshops..."
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}
                placeholderTextColor="#999"
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={Colors.mediumGray} />
                </TouchableOpacity>
              ) : null}
            </View>
          </Animated.View>
        ) : (
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: Colors.darkGray,
            letterSpacing: 0.3,
          }}>
            Results
          </Text>
        )}

        {!isSearchFocused && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: "#fff",
                borderRadius: 12,
                height: 45,
                borderWidth: 1,
                borderColor: '#E5E5E5',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="filter-outline" size={18} color={Colors.darkGray} />
              <Text
                style={{
                  marginLeft: 6,
                  color: Colors.darkGray,
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                Filter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSortModalVisible(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: "#fff",
                borderRadius: 12,
                height: 45,
                borderWidth: 1,
                borderColor: '#E5E5E5',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={18}
                color={Colors.darkGray}
              />
              <Text
                style={{
                  marginLeft: 6,
                  color: Colors.darkGray,
                  fontWeight: "600",
                  fontSize: 15,
                }}
              >
                Sort
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* --- TABS --- */}
      {workshops.perfectMatch?.length > 0 && (
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 10,
          marginBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: Colors.mediumGray,
        }}>
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
              onPress={() => setSelectedTab('available')}
              style={{
                paddingVertical: 0,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: selectedTab === 'available' ? Colors.blue : Colors.mediumGray,
                fontWeight: '600',
                fontSize: 16,
              }}>
                Available
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{
            width: 1,
            height: 20,
            backgroundColor: Colors.mediumGray,
            alignSelf: 'center',
          }} />

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
              onPress={() => setSelectedTab('notAvailable')}
              style={{
                paddingVertical: 0,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: selectedTab === 'notAvailable' ? Colors.blue : Colors.mediumGray,
                fontWeight: '600',
                fontSize: 16,
              }}>
                Not Available
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
      {/* التاب الخاص بالورش الجديدة */}
      {fetchedWorkshops.length > 0 && (
        <View style={{ marginBottom: 70 }}>
          <FlatList
            data={searchQuery || selectedRating || selectedDistance || selectedSortOption ? filteredFetchedWorkshops : fetchedWorkshops}
            keyExtractor={item => item.workshop_id.toString()}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
            renderItem={({ item }) => (
              <WorkshopCard 
                data={item} 
                onBookPress={(time, actualDate) => handleBookPress(item, time, actualDate)}  // اضفت التاريخ هنا
                onShopPress={() => handleShopPress(item)} 
              />
            )}
          />
        </View>
      )}

      {/* --- WORKSHOP LIST OR SCHEDULED SERVICES --- */}
      {selectedTab === 'available' ? (
        <FlatList
          data={[
            ...(filteredPerfectMatch?.length > 0
              ? getLimitedResults(filteredPerfectMatch.map(item => ({ type: 'perfect', item })))
              : []),
            ...(workshops.splitMatch?.length > 0
              ? getLimitedResults(rawWorkshops.splitMatch.map((combo, index) => ({ type: 'split', combo, index })))
              : []),
            { type: 'empty', show: !filteredPerfectMatch?.length && !workshops.splitMatch?.length }
          ]}
          keyExtractor={(item, index) => `${item.type}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          ListFooterComponent={() => {
            const totalResults = (filteredPerfectMatch?.length || 0) + (workshops.splitMatch?.length || 0);
            if (totalResults > 3) {
              return (
                <TouchableOpacity
                  onPress={() => setShowAllResults(!showAllResults)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 15,
                    marginTop: 5,
                  }}
                >
                  <Text style={{
                    color: Colors.blue,
                    fontSize: 15,
                    fontWeight: '500',
                  }}>
                    {showAllResults ? 'Show Less' : `View ${totalResults - 3} more results`}
                  </Text>
                  <Ionicons
                    name={showAllResults ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.blue}
                    style={{ marginLeft: 4 }}
                  />
                </TouchableOpacity>
              );
            }
            return null;
          }}
          renderItem={({ item }) => {
            if (item.type === 'perfect') {
              const service = item.item.service || item.item.services?.[0] || {};
              const data = {
                image: item.item.image
                  ? item.item.image
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s",
                workshop_name: item.item.workshop_name || "unknow",
                rate: item.item.rate || 0,
                workshop_id: item.item.workshop_id,
                profile_picture: item.item.profile_picture || "",
                city: item.item.city || "Unknown City",
                street: item.item.street || "Unknown Street",
                services: (item.item.services || []).map(s => ({
                  name: s.name,
                  price: s.price,
                  service_id: s.service_id || s.id,
                  is_mobile: s.is_mobile || false,
                  mobile_fee: s.mobile_fee || 0
                }))
              };


              return (
                <WorkshopCard
                  data={data}
                  date={date}
                  timeSlots={timeSlots}

                  onBookPress={(time) => handleBookPress(data, time )} // تمرير الوقت المختار من الكارد
                  onShopPress={() => handleShopPress(data)}
                />
              );
            }

            if (item.type === 'split') {
              const workshopsMap = item.combo.reduce((acc, item) => {
                const key = item.workshop_id;
                if (!acc[key]) {
                  acc[key] = {
                    workshop_id: item.workshop_id,
                    workshop_name: item.workshop_name,
                    profile_picture: item.profile_picture || "",
                    rate: item.rating,
                    time: item.time,
                    services: [],
                  };
                }
                const service = item.service || item.services?.[0];
                if (service) acc[key].services.push(service);
                return acc;
              }, {});
              const groupedWorkshops = Object.values(workshopsMap);

              return (
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    padding: 10,
                    marginBottom: 20,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: 3 },
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      marginBottom: 10,
                    }}
                  >
                    🧩 Schedule Option {item.index + 1}
                  </Text>

                  {groupedWorkshops.map((workshop, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: "#f9f9f9",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 6,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Image

                          source={{
                            uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s",
                          }}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 12,
                            marginRight: 12,
                          }}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: "#333",
                            }}
                          >
                            {workshop.workshop_name}
                          </Text>
                          <Text style={{ fontSize: 14, color: "#FFD700" }}>
                            ⭐ {workshop.rate || "Not rated yet"}
                          </Text>
                        </View>
                      </View>

                      <View style={{ gap: 4, marginBottom: 12 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#555",
                            fontWeight: "600",
                          }}
                        >
                          Services:
                        </Text>
                        {workshop.services.map((srv, i) => (
                          <Text
                            key={i}
                            style={{ fontSize: 13, color: "#555" }}
                          >
                            • {srv.name} - {srv.price} NIS
                          </Text>
                        ))}
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#555",
                            marginTop: 6,
                          }}
                        >
                          Time:{" "}
                          <Text style={{ fontWeight: "600" }}>
                            {workshop.time || "N/A"}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => handleBookMultiple(item.combo)}
                    style={{
                      backgroundColor: "#086189",
                      paddingVertical: 12,
                      borderRadius: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      Book This Schedule
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            if (item.type === 'empty' && item.show) {
              return (
                <Text
                  style={{
                    fontSize: 16,
                    fontStyle: "italic",
                    color: "#888",
                    marginTop: 20,
                    textAlign: "center",
                  }}
                >
                  No workshops or scheduled services available.
                </Text>
              );
            }

            return null;
          }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{
            fontSize: 16,
            color: Colors.darkGray,
            textAlign: 'center',
            marginBottom: 10
          }}>
            Not Available workshops will be shown here
          </Text>
          <Text style={{
            fontSize: 14,
            color: Colors.mediumGray,
            textAlign: 'center'
          }}>
            Coming soon...
          </Text>
        </View>
      )}
    </View>
  );
};


export default AvailableMechanic;
