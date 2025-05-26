import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import WorkshopCard from "../../Components/WorkshopCard/WorkshopCard";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import Filter from "../Home/ResultOperation/Filter";
import Sort from "../Home/ResultOperation/Sort";
import Colors from "../../Components/Colors/Colors";

// دالة لتحويل الوقت من AM/PM إلى 24 ساعة
const convertTo24HourFormat = (time) => {
  const [timeStr, modifier] = time.split(" "); // فصل الوقت عن AM/PM
  let [hours, minutes] = timeStr.split(":"); // تقسيم الساعة والدقائق

  if (modifier === "PM" && hours !== "12") {
    hours = (parseInt(hours) + 12).toString(); // تحويل للـ 24 ساعة
  } else if (modifier === "AM" && hours === "12") {
    hours = "00"; // تحويل الساعة 12 AM إلى 00
  }

  return `${hours}:${minutes}`; // إعادة الوقت في تنسيق 24 ساعة
};

const AvailableMechanic = ({ route, navigation }) => {
  const { date, timeSlots } = route.params;
  console.log("Selected date:", date);
  console.log("Selected time slot(s):", timeSlots);

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
  const [mobileServiceOnly, setMobileServiceOnly] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(null);

  // تحويل الوقت إلى تنسيق 24 ساعة قبل الإرسال
  const convertedTimeSlots = timeSlots.map((time) =>
    convertTo24HourFormat(time)
  );
  console.log("Converted time slots:", convertedTimeSlots);
  // إذا كانت timeSlots تحتوي على عدة أوقات، سنحولها إلى سلسلة مفصولة بفواصل
  const formattedTimeSlots = convertedTimeSlots.join(", "); // جعلها سلسلة نصية مفصولة بفواصل
  console.log("Formatted time slots:", formattedTimeSlots);
  const transform = (list) =>
    list.map((item) => {
      const service = item.service || item.services?.[0] || {};
      return {
        image: item.workshop_image || "",
        service_name: service.name || "Service",
        service_description: "",
        workshop_name: item.workshop_name || "Workshop",
        rate: item.rate || item.rating || 0,
        price: service.price || 0,
        time: item.time || "N/A",
        service_id: service.id || service.service_id || null,
        workshop_id: item.workshop_id,
        services: item.services || [], // عشان الـ splitMatch تحتاج services كمصفوفة
      };
    });
  const fetchAvailableWorkshops = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("accessToken");

      const response = await axios.post(
        "http://176.119.254.225:80/search/search-available-workshops",
        {
          preferred_date: date,
          preferred_time: formattedTimeSlots,
          minRating: selectedRating,
          mobileAssistance: mobileServiceOnly,
          sortBy: selectedSortOption, // ⬅️ أرسليها للباك
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      const {
        perfectMatch = [],
        partialMatch = [],
        splitMatch = [],
      } = response.data;

      const mergedWorkshops = [...perfectMatch, ...partialMatch, ...splitMatch];
      console.log("Merged workshops:", mergedWorkshops);

      console.log("Transformed perfectMatch:", transform(perfectMatch));
      console.log("Transformed partialMatch:", transform(partialMatch));
      console.log("Transformed splitMatch:", transform(splitMatch));
      setRawWorkshops({ perfectMatch, partialMatch, splitMatch });
      setWorkshops({
        perfectMatch: transform(perfectMatch),
        partialMatch: transform(partialMatch),
        splitMatch: splitMatch.map((group) => transform(group)), // ✅
      });
    } catch (error) {
      console.error("❌ Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };


  const applySort = () => {
    if (!selectedSortOption) return; // ما تطبقش لو ما فيش اختيار
    console.log("Applying local sort:", selectedSortOption);
    const sorted = sortWorkshopsLocally(workshops, selectedSortOption);
    setWorkshops(sorted);
    console.log(
      "✅ Sorted workshops (perfectMatch):",
      sorted.perfectMatch.map((w) => w.price)
    );
  };

  useEffect(() => {
    if (selectedSortOption) {
      applySort();
    }
  }, [selectedSortOption]);

  const applyFilters = () => {
    fetchAvailableWorkshops();
  };

  const resetFilters = () => {
    setSelectedRating(null);
    setSelectedDistance(null);
    setMobileServiceOnly(false);
    fetchAvailableWorkshops();
  };

  const handleBookPress = (workshopData) => {
    navigation.navigate("Book", {
      workshopData,
      date,
      timeSlots,
    });
  };

  const handleShopPress = (workshopData) => {
    navigation.navigate("WorkshopDetails", { workshopData });
  };

  
  useEffect(() => {
    fetchAvailableWorkshops();
  }, [selectedRating, selectedDistance, mobileServiceOnly, selectedSortOption]);

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
    const [mobileServiceOnly, setMobileServiceOnly] = useState(false);

    const applyFilters = () => {
      if (!selectedRating && !selectedDistance && !mobileServiceOnly) {
        const sorted = sortResults(originalData, selectedSortOption);
        setWorkshops(sorted);
        setFilterModalVisible(false);
        return;
      }

      const filterFn = (item) => {
        if (selectedRating && item.rate < selectedRating) return false;
        if (selectedDistance && item.distance > selectedDistance) return false;
        if (mobileServiceOnly && !item.mobile_service) return false;
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
      setMobileServiceOnly(false);

      const sorted = sortResults(originalData, selectedSortOption);
      setWorkshops(sorted);
    };

    return {
      selectedRating,
      setSelectedRating,
      selectedDistance,
      setSelectedDistance,
      mobileServiceOnly,
      setMobileServiceOnly,
      applyFilters,
      resetFilters,
    };
  };


  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* --- FILTER & SORT MODALS --- */}
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

      {/* --- FILTER & SORT BUTTONS TOP BAR (Right Aligned) --- */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginVertical: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: Colors.black }}>
          Results
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 12,
              backgroundColor: Colors.lightGray,
              borderRadius: 10,
            }}
          >
            <Ionicons name="filter-outline" size={16} color={Colors.darkGray} />
            <Text
              style={{
                marginLeft: 4,
                color: Colors.darkGray,
                fontWeight: "bold",
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
              backgroundColor: Colors.lightGray,
              borderRadius: 10,
            }}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={16}
              color={Colors.darkGray}
            />
            <Text
              style={{
                marginLeft: 4,
                color: Colors.darkGray,
                fontWeight: "bold",
              }}
            >
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- WORKSHOP LIST OR SCHEDULED SERVICES --- */}
      <FlatList
        data={[
          ...(workshops.perfectMatch?.length > 0
            ? workshops.perfectMatch.map(item => ({ type: 'perfect', item }))
            : []),
          ...(workshops.splitMatch?.length > 0
            ? rawWorkshops.splitMatch.map((combo, index) => ({ type: 'split', combo, index }))
            : []),
          { type: 'empty', show: !workshops.perfectMatch?.length && !workshops.splitMatch?.length }
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        renderItem={({ item }) => {
          if (item.type === 'perfect') {
            const service = item.item.service || item.item.services?.[0] || {};
            const data = {
              image: item.item.workshop_image || "",
              service_name: service.name || "Service",
              service_description: "",
              workshop_name: item.item.workshop_name || "Workshop",
              rate: item.item.rate || 0,
              price: service.price || 0,
              service_id: service.id || service.service_id || null,
              workshop_id: item.item.workshop_id,
            };

            return (
              <WorkshopCard
                data={data}
                onBookPress={() => handleBookPress(data)}
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
    </View>
  );
};

const styles = {
  fixedButtons: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    gap: 12,
    zIndex: 10,
  },

  floatingButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },

  filterButton: {
    backgroundColor: "#4a90e2",
  },

  sortButton: {
    backgroundColor: "#50e3c2",
  },

  chatButton: {
    backgroundColor: "#f5a623",
  },
};

export default AvailableMechanic;
