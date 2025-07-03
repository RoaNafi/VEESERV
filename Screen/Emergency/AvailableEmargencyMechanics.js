import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import Colors from '../../Components/Colors/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Mock available workshops for the selected service
const MOCK_WORKSHOPS = [
  { id: '1', workshop_id: '38', workshop_name: 'Speedy Auto Workshop', address: '123 Main St', rate: 4.7, distance: 2.3, price: 120 },
  { id: '2', workshop_id: '2', workshop_name: 'QuickFix Garage', address: '456 Elm Ave', rate: 4.5, distance: 3.1, price: 110 },
  { id: '3', workshop_id: '3', workshop_name: 'Pro Mechanics', address: '789 Oak Blvd', rate: 4.8, distance: 1.7, price: 130 },
  { id: '4', workshop_id: '4', workshop_name: 'City Auto Service', address: '321 Maple Rd', rate: 4.6, distance: 2.9, price: 125 },
  { id: '5', workshop_id: '5', workshop_name: 'Speedy Auto Workshop', address: '123 Main St', rate: 4.7, distance: 2.3, price: 120 },
  { id: '6', workshop_id: '6', workshop_name: 'QuickFix Garage', address: '456 Elm Ave', rate: 4.5, distance: 3.1, price: 110 },
  { id: '7', workshop_id: '7', workshop_name: 'Pro Mechanics', address: '789 Oak Blvd', rate: 4.8, distance: 1.7, price: 130 },
  { id: '8', workshop_id: '8', workshop_name: 'City Auto Service', address: '321 Maple Rd', rate: 4.6, distance: 2.9, price: 125 },
];

// Add a placeholder image URL for each workshop
const PLACEHOLDER_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_tMgNKZhJEDKzb_xIrD28cZiHocJp-triUA&s';

const AvailableEmargencyMechanics = ({ route }) => {
  const { service, userAddress } = route?.params || {};
  const [selected, setSelected] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    console.log(`----AvailableEmargencyMechanics.js---`);
    console.log(`Service: ${service?.name || ''} | Address: ${userAddress || ''}`);
  }, [service, userAddress]);

  const workshops = MOCK_WORKSHOPS;
  const isSingle = workshops.length === 1;

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((sid) => sid !== id));
    } else if (isSingle || selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleContinue = () => {
    if (!isSingle && selected.length < 2) {
      Alert.alert('Select at least 2 workshops');
      return;
    }
    if (isSingle && selected.length < 1) {
      Alert.alert('Select the workshop to continue');
      return;
    }
    // Proceed to summary screen with selected workshops, service, and userAddress
    const selectedWorkshops = workshops.filter(w => selected.includes(w.id));
    navigation.navigate('EmergencyReqSummary', { selectedWorkshops, service, userAddress });
  };

  const renderWorkshop = ({ item }) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && styles.cardSelected,
          { shadowColor: isSelected ? '#ff1744' : '#000', elevation: isSelected ? 6 : 3 }
        ]}
        onPress={() => handleSelect(item.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardContent}>
          <Image source={{ uri: PLACEHOLDER_IMAGE }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name}>{item.workshop_name}</Text>
            <Text style={styles.address}>{item.address}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="star" size={14} color="#FFD700" style={styles.infoIcon} />
              <Text style={styles.rating}>{item.rate}</Text>
              <Ionicons name="location" size={14} color="#086189" style={styles.infoIcon} />
              <Text style={styles.distance}>{item.distance} km</Text>
            </View>
          </View>
          <View style={styles.checkCol}>
            {isSelected && (
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={18} color={'#fff'} />
              </View>
            )}
          </View>
          <View style={styles.rightCol}>
            <TouchableOpacity
              onPress={() => navigation.navigate('WorkshopDetails', { workshopData: item })}
              style={styles.arrowButton}
              activeOpacity={0.7}
            >
              <View style={styles.arrowCircle}>
                <Ionicons name="chevron-forward" size={18} color={Colors.blue} />
              </View>
            </TouchableOpacity>
            <Text style={styles.price}>{'₪' + item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const showInstruction = workshops.length > 1;

  return (
    <View style={styles.container}>
      {isSingle && (
        <Text style={styles.instruction}>
          Only one workshop is available for this service. Please select it to continue.
        </Text>
      )}
      {showInstruction && (
        <Text style={styles.instruction}>
          Please select <Text style={{ color: '#ff1744', fontWeight: 'bold' }}>at least 2</Text> and <Text style={{ color: '#ff1744', fontWeight: 'bold' }}>up to 3</Text> workshops.
        </Text>
      )}
      <FlatList
        data={workshops}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkshop}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={[styles.continueButton, ((isSingle && selected.length < 1) || (!isSingle && selected.length < 2)) && { backgroundColor: '#ccc', borderColor: '#ccc' }]}
        onPress={handleContinue}
        disabled={(isSingle && selected.length < 1) || (!isSingle && selected.length < 2)}
        activeOpacity={((isSingle && selected.length < 1) || (!isSingle && selected.length < 2)) ? 1 : 0.85}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    //padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#086189',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 15,
    color: '#444',
    //marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#fff6f6',
    //borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffeaea',
    //marginHorizontal: 10,
  },
  listContainer: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fcfcfc',
    borderRadius: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  cardSelected: {
    borderColor: '#ff1744',
    backgroundColor: 'rgba(255, 23, 68, 0.06)',
    shadowColor: '#ff1744',
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
   // minHeight: 80,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    //gap: 10, // removed for compact look
  },
  infoIcon: {
    marginRight: 2,
  },
  rating: {
    fontSize: 13,
    color: '#888',
    marginRight: 8,
    marginLeft: 0,
  },
  distance: {
    fontSize: 13,
    color: '#086189',
    marginRight: 8,
    marginLeft: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f3f3',
    resizeMode: 'cover',
  },
  checkCol: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff1744',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#ff1744',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(22, 114, 156, 0.13)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: Colors.blue,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  rightCol: {
    width: 48,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 6,
    alignSelf: 'stretch',
  },
  price: {
    fontSize: 15,
    color: Colors.blue,
    fontWeight: 'bold',
    marginTop: 'auto',
    //marginBottom: 2,
  },
});

export default AvailableEmargencyMechanics