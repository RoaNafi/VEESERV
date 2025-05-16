

import React, { useEffect, useState } from "react";
import { View, FlatList, Text, ActivityIndicator, TouchableOpacity ,Image} from "react-native";
import WorkshopCard from "../../Components/WorkshopCard/WorkshopCard";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import Filter from "../Home/ResultOperation/Filter";
import Sort from "../Home/ResultOperation/Sort";
// دالة لتحويل الوقت من AM/PM إلى 24 ساعة
const convertTo24HourFormat = (time) => {
  const [timeStr, modifier] = time.split(' ');  // فصل الوقت عن AM/PM
  let [hours, minutes] = timeStr.split(':');  // تقسيم الساعة والدقائق

  if (modifier === 'PM' && hours !== '12') {
    hours = (parseInt(hours) + 12).toString();  // تحويل للـ 24 ساعة
  } else if (modifier === 'AM' && hours === '12') {
    hours = '00';  // تحويل الساعة 12 AM إلى 00
  }

  return `${hours}:${minutes}`;  // إعادة الوقت في تنسيق 24 ساعة
};

const AvailableMechanic = ({ route, navigation }) => {
  const { date, timeSlots } = route.params;
  console.log("Selected date:", date);
  console.log("Selected time slot(s):", timeSlots);

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
  const convertedTimeSlots = timeSlots.map(time => convertTo24HourFormat(time));
  console.log("Converted time slots:", convertedTimeSlots);
  // إذا كانت timeSlots تحتوي على عدة أوقات، سنحولها إلى سلسلة مفصولة بفواصل
  const formattedTimeSlots = convertedTimeSlots.join(', ');  // جعلها سلسلة نصية مفصولة بفواصل
  console.log("Formatted time slots:", formattedTimeSlots);

  const fetchAvailableWorkshops = async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("accessToken");

      const response = await axios.post(
        "http://176.119.254.225:80/search/search-available-workshops",
        {
          preferred_date: date,
          preferred_time: formattedTimeSlots,  // إرسال الوقت كمصفوفة نصية
          minRating: selectedRating,
          mobileAssistance: mobileServiceOnly,
          // أضف أي فلتر ثاني حسب الحاجة مثل minPrice, maxPrice, locationId...
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      const { perfectMatch = [], partialMatch = [], splitMatch = [] } = response.data;

const mergedWorkshops = [
  ...perfectMatch,
  ...partialMatch,
  ...splitMatch,
];
      console.log("Merged workshops:", mergedWorkshops);
const transform = (list) =>
  list.map((item) => {
    const service = item.service || item.services?.[0] || {};
    return {
      image: item.workshop_image || "",
      service_name: service.name || "Service",
      service_description: "",
      workshop_name: item.workshop_name || "Workshop",
      rate: item.rating || 0,
      price: service.price || 0,
      time: item.time || "N/A",
      service_id: service.id || service.service_id || null,
      workshop_id: item.workshop_id,
      services: item.services || [], // عشان الـ splitMatch تحتاج services كمصفوفة
    };
  });
console.log("Transformed perfectMatch:", transform(perfectMatch));
console.log("Transformed partialMatch:", transform(partialMatch));
console.log("Transformed splitMatch:", transform(splitMatch));
setWorkshops({
  perfectMatch: transform(perfectMatch),
  partialMatch: transform(partialMatch),
  splitMatch: transform(splitMatch),
});




     
    } catch (error) {
      console.error("❌ Error fetching workshops:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchAvailableWorkshops();
  };

  const resetFilters = () => {
    setSelectedRating(null);
    setSelectedDistance(null);
    setMobileServiceOnly(false);
    fetchAvailableWorkshops();
  };

  const applySort = () => {
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
  const handleBookMultiple = (items) => {
  items.forEach(item => {
    const service = item.service || {};
    handleBookPress({
      workshop_id: item.workshop_id,
      service_id: service.id,
      service_name: service.name,
      service_description: "",
      time: item.time,
      rate: item.rating,
      price: service.price,
      image: item.workshop_image,
      workshop_name: item.workshop_name,
    });
  });
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
<View style={{
  flexDirection: 'row',
  justifyContent: 'flex-end',  // ⬅️ Align to the right
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 4,
  backgroundColor: '#f9f9f9',
  elevation: 2,
  marginTop: 4,
  marginHorizontal: 12
}}>
  <TouchableOpacity
    onPress={() => setFilterModalVisible(true)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#086189',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 10
    }}
  >
    <Ionicons name="filter" size={18} color="#fff" />
    <Text style={{ color: "#fff", marginLeft: 6, fontWeight: "600" }}>Filter</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => setSortModalVisible(true)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#086189',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20
    }}
  >
    <Ionicons name="funnel-outline" size={18} color="#fff" />
    <Text style={{ color: "#fff", marginLeft: 6, fontWeight: "600" }}>Sort</Text>
  </TouchableOpacity>
</View>


   {/* --- WORKSHOP LIST OR SCHEDULED SERVICES --- */}
<View style={{ paddingHorizontal: 12, paddingBottom: 20 }}>
  {/* If Perfect Match exists */}
  {workshops.perfectMatch?.length > 0 ? (
    <>
      <Text style={{
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        color: "#086189",
        marginTop: 10
      }}>
         Perfect Matches
      </Text>

      <FlatList
        data={workshops.perfectMatch}
        keyExtractor={(item, index) => "perfect-" + index}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const service = item.service || item.services?.[0] || {};
          const data = {
            image: item.workshop_image || "",
            service_name: service.name || "Service",
            service_description: "",
            workshop_name: item.workshop_name || "Workshop",
            rate: item.rating || 0,
            price: service.price || 0,
            service_id: service.id || service.service_id || null,
            workshop_id: item.workshop_id,
          };

          return (
            <WorkshopCard
              data={data}
              onBookPress={() => handleBookPress(data)}
              onShopPress={() => handleShopPress(data)}
            />
          );
        }}
      />
    </>
  ) : workshops.splitMatch?.length > 0 ? (
    <>
     <View style={{ paddingHorizontal: 12, paddingBottom: 20 }}>
  <Text style={{
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#086189",
    marginTop: 10,
  }}>
    📘 Your Scheduled Appointments
  </Text>

  <View style={{ gap: 16 }}>
    {workshops.splitMatch.map((item, index) => (
      <View
        key={index}
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        {/* Header with image and rating */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <Image
            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s" }}
            style={{ width: 60, height: 60, borderRadius: 12, marginRight: 12 }}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
              {item.workshop_name}
            </Text>
            <Text style={{ fontSize: 16, color: "#FFD700" }}>⭐ {item.rate || "Not rated yet"}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={{ gap: 4, marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: "#555" }}>Service: <Text style={{ fontWeight: "600" }}>{item.service_name}</Text></Text>
          <Text style={{ fontSize: 16, color: "#555" }}> Price: <Text style={{ fontWeight: "600" }}>{item.price} NIS</Text></Text>
          <Text style={{ fontSize: 16, color: "#555" }}> Time: <Text style={{ fontWeight: "600" }}>{item.time || "N/A"}</Text></Text>
        </View>

        {/* Location Button */}
        <TouchableOpacity
          onPress={() => console.log("View Location pressed")} // replace with actual handler
          style={{
            backgroundColor: "#e6f1f3",
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontSize: 15, color: "#086189", fontWeight: "600" }}>
            📍 View Location
          </Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>

  {/* Book Schedule CTA */}
  <TouchableOpacity
    onPress={() => handleBookMultiple(workshops.splitMatch)}
    style={{
      marginTop: 24,
      backgroundColor: "#086189",
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
      Book This Schedule
    </Text>
  </TouchableOpacity>
</View>

    </>
  ) : (
    <Text style={{
      fontSize: 16,
      fontStyle: "italic",
      color: "#888",
      marginTop: 20,
      textAlign: "center"
    }}>
      No workshops or scheduled services available.
    </Text>
  )}
</View>





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
