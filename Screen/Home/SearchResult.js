import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Animated,FlatList , Image ,Modal , Alert  } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Components/Colors/Colors';
import ServiceCard from '../../Components/ServiceCard/ServiceCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const WorkshopCard = ({ item }) => {
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
      Alert.alert('Added to Favorites ❤️', `${item.name} has been added to your favorites.`);
    } else {
      // إزالة من المفضلة
      await axios.delete(
        `http://176.119.254.225:80/favourite/favorite/${item.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFav(false);
      Alert.alert('Removed from Favorites 💔', `${item.name} has been removed from your favorites.`);
    }

  } catch (error) {
    if (error.response && error.response.status === 409) {
      setFav(true);
      Alert.alert('Already in Favorites 🩷', `${item.name} is already in your favorites.`);
    } else {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Could not update favorites');
    }
  }
};


  return (
    <View style={styles.card}>
    <Image 
  source={item.image 
    ? { uri: item.image } 
    : { uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s" }
  } 
  style={styles.image} 
/>


      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address}>{item.city || 'No city'}, {item.street || 'No street'}</Text>
                 <View style={styles.ratingContainer}>
  <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 4 }} />
  <Text style={styles.rate}>Rate: {item.rate ? item.rate.toFixed(1) : 'N/A'}</Text>
</View>

        <View style={styles.buttonsRow}>
       <TouchableOpacity
  style={styles.servicesBtn}
  onPress={() => {
    const list = item.services_list?.split(',').map(s => s.trim()) || [];
    setSelectedServices(list);
    setServiceModalVisible(true);
  }}
>
  <Text style={styles.servicesBtnText}>See Services</Text>
</TouchableOpacity>


          <TouchableOpacity onPress={handleFav}>
  <Ionicons 
    name={fav ? 'heart' : 'heart-outline'} 
    size={28} 
    color={fav ? 'red' : 'gray'} 
  />
</TouchableOpacity>

        </View>
      </View>
      
      {/* مودال عرض الخدمات */}
     <Modal
  visible={serviceModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setServiceModalVisible(false)}
>
  <View style={{
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  }}>
    <View style={{
      backgroundColor: 'white', padding: 20, borderRadius: 10, width: '85%', maxHeight: '70%'
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Available Services</Text>

      <ScrollView style={{ marginBottom: 20 }}>
        {selectedServices.length > 0 ? selectedServices.map((s, idx) => (
          <Text key={idx} style={{ marginBottom: 5, fontSize: 15 }}>• {s}</Text>
        )) : (
          <Text>No services listed</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setServiceModalVisible(false)}
        style={{ backgroundColor: '#086189', padding: 12, borderRadius: 8, alignItems: 'center' }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
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
   card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3, // ظل بسيط أندرويد
    shadowColor: '#000', // ظل iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    
  minHeight: 150, // 👈 يعطيه شوي طول إضافي
},

 
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  address: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  rate: {
    color: '#444',
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  servicesBtn: {
    backgroundColor: '#086189',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  servicesBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
    ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  width: '85%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
},
serviceItem: {
  fontSize: 15,
  paddingVertical: 4,
},
closeBtn: {
  backgroundColor: '#086189',
  padding: 12,
  borderRadius: 8,
  marginTop: 15,
  alignItems: 'center',
},
closeBtnText: {
  color: '#fff',
  fontWeight: 'bold',
},
rate: {
  fontSize: 14,
  color: '#444',
},
});


export default SearchResult;