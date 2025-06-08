import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../Components/Colors/Colors';

const SearchByCompany = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState([
    { 
      id: '1', 
      name: 'Auto Service Center', 
      rating: 4.5, 
      distance: '2.3 km',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXV0byUyMHJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D',
      services: [
        { id: 1, name: 'Oil Change', price: '150₪', duration: 60 },
        { id: 2, name: 'Brake Service', price: '300₪', duration: 120 },
        { id: 3, name: 'Tire Rotation', price: '100₪', duration: 45 }
      ]
    },
    { 
      id: '2', 
      name: 'Quick Fix Garage', 
      rating: 4.2, 
      distance: '3.1 km',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXV0byUyMHJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D',
      services: [
        { id: 1, name: 'Oil Change', price: '140₪', duration: 60 },
        { id: 2, name: 'AC Service', price: '250₪', duration: 90 }
      ]
    },
    { 
      id: '3', 
      name: 'Pro Mechanics', 
      rating: 4.8, 
      distance: '1.5 km',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXV0byUyMHJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D',
      services: [
        { id: 1, name: 'Full Service', price: '500₪', duration: 180 },
        { id: 2, name: 'Engine Repair', price: '800₪', duration: 240 }
      ]
    },
    { 
      id: '4', 
      name: 'Car Care Experts', 
      rating: 4.3, 
      distance: '4.2 km',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXV0byUyMHJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D',
      services: [
        { id: 1, name: 'Oil Change', price: '160₪', duration: 60 },
        { id: 2, name: 'Tire Service', price: '200₪', duration: 90 }
      ]
    },
    { 
      id: '5', 
      name: 'Auto Solutions', 
      rating: 4.6, 
      distance: '2.8 km',
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXV0byUyMHJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D',
      services: [
        { id: 1, name: 'Oil Change', price: '145₪', duration: 60 },
        { id: 2, name: 'Brake Service', price: '280₪', duration: 120 }
      ]
    },
  ]);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleWorkshopPress = (workshop) => {
    navigation.navigate('CompanyDetails', { 
      workshop,
      selectedDate: route.params?.selectedDate,
      selectedTime: route.params?.selectedTime
    });
  };

  const renderCompanyItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.companyCard}
      onPress={() => handleWorkshopPress(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.companyImage}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View style={styles.topInfo}>
          <Text style={styles.companyName} numberOfLines={2}>{item.name}</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.darkGray} style={styles.arrowIcon} />
        </View>

        <View style={styles.middleInfo}>
          <Ionicons name="star" size={12} color="#FFD700"/>
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>

        <View style={styles.bottomInfo}>
          <Text style={styles.distance}>{item.distance}</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => handleWorkshopPress(item)}
          >
            <Text style={styles.bookButtonText}>View Times</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.blue} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) => item.id}
        renderItem={renderCompanyItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 10,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 0,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: Colors.lightGray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 2,
  },
  companyImage: {
    width: 90,
    height: "100%",
    marginRight: 0,
  },
  info: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  topInfo: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkGray,
    flex: 1,
    marginRight: 8,
  },
  arrowIcon: {
    marginTop: 2,
  },
  middleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    color: Colors.orange,
    fontSize: 12,
    marginLeft: 2,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  bookButton: {
    borderWidth: 1,
    borderColor: Colors.Gray,
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  bookButtonText: {
    color: Colors.black,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SearchByCompany; 