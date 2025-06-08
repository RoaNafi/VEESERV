import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../../config'; // adjust path to your config
import Colors from '../../Components/Colors/Colors';

const Subcategory = ({ route }) => {
  const { categoryId, categoryName } = route.params;

  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addedServices, setAddedServices] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [loadingItem, setLoadingItem] = useState(null); // Track which item is loading

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get(
        `${config.apiUrl}/ServiceCategories/categories/${categoryId}/subcategories`
      );
      //console.log('API Response:', JSON.stringify(response.data, null, 2));
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      Alert.alert('Error', 'Failed to load subcategories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (subcategoryId) => {
    setLoadingItem(subcategoryId); // Set loading state for this item
    const token = await AsyncStorage.getItem('accessToken');
    const userId = await AsyncStorage.getItem('userId');

    if (!token || !userId) {
      Alert.alert('Error', 'User not logged in');
      setLoadingItem(null);
      return;
    }

    try {
      if (addedServices.includes(subcategoryId)) {
        // Remove from cart
        console.log('Removing from cart, subcategoryId:', subcategoryId);
        console.log('Current cartItems:', cartItems);
        const cartId = cartItems[subcategoryId];
        console.log('Using cartId for removal:', cartId);

        try {
          const response = await axios.delete(
            `${config.apiUrl}/cart/remove-from-cart`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              data: { cart_id: cartId }
            }
          );
          console.log('Remove response:', response.data);

          if (response.status === 200) {
            setAddedServices(prev => prev.filter(id => id !== subcategoryId));
            setCartItems(prev => {
              const newItems = { ...prev };
              delete newItems[subcategoryId];
              return newItems;
            });
            console.log('Successfully removed from cart');
          }
        } catch (removeError) {
          console.error('Remove error:', removeError.response?.data || removeError.message);
          Alert.alert('Error', 'Failed to remove from cart');
        }
      } else {
        // Add to cart
        console.log('Adding to cart, subcategoryId:', subcategoryId);
        try {
          const response = await axios.post(
            `${config.apiUrl}/cart/add-to-cart`,
            { subcategory_id: subcategoryId },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          ///console.log('Add response:', response.data);

          if (response.status === 200 || response.status === 201) {
            setAddedServices(prev => [...prev, subcategoryId]);
            const cartId = response.data.cart?.cart_id;
            //console.log('Storing cartId:', cartId);
            setCartItems(prev => ({
              ...prev,
              [subcategoryId]: cartId
            }));
            //console.log('Successfully added to cart');
          }
        } catch (addError) {
          console.error('Add error:', addError.response?.data || addError.message);
          Alert.alert('Error', 'Failed to add to cart');
        }
      }
    } catch (error) {
      console.error('Cart operation failed:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update cart');
    } finally {
      setLoadingItem(null); // Clear loading state
    }
  };

  const renderSubcategory = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.serviceInfo}>
          <Text style={styles.name}>{item.subcategory_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleAddToCart(item.subcategory_id)}
          style={[
            styles.addToCartButton,
            addedServices.includes(item.subcategory_id) && styles.addedButton,
          ]}
          disabled={loadingItem === item.subcategory_id}
        >
          {loadingItem === item.subcategory_id ? (
            <ActivityIndicator size="small" color={Colors.black} />
          ) : addedServices.includes(item.subcategory_id) ? (
            <View style={styles.cartIconContainer}>
              <Ionicons name="checkmark" size={16} color={Colors.black} />
              <Ionicons
                name="cart"
                size={16}
                marginLeft={-4}
                color={Colors.black}
                style={styles.cartIcon}
              />
            </View>
          ) : (
            <View style={styles.cartIconContainer}>
              <Ionicons name="add" size={16} color={Colors.black} />
              <Ionicons
                name="cart"
                size={16}
                marginLeft={-4}
                color={Colors.black}
                style={styles.cartIcon}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#086189" />
      ) : (
        <FlatList
          data={subcategories}
          keyExtractor={(item) => item.subcategory_id.toString()}
          renderItem={renderSubcategory}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  listContainer: { 
    padding: 16,
    paddingBottom: 30 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333',
  },
  addToCartButton: {
    borderWidth: 1,
    borderColor: Colors.Gray,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 7,
  },
  addedButton: {
    backgroundColor: '#E8F5E9',
  },
  cartIconContainer: {
    flexDirection: 'row',
    position: 'relative',
    marginRight: 4,
    alignItems: 'center',
  },
  
  cartIcon: {
    marginLeft: -4,
  },
});

export default Subcategory;
