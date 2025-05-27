import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Calculate responsive values
const responsiveHorizontalPadding = width * 0.05; // 5% of screen width
const responsiveVerticalPadding = height * 0.02; // 2% of screen height
const responsiveMargin = width * 0.03; // 3% of screen width
const responsiveButtonHeight = height * 0.06; // 6% of screen height
const responsiveBottomPadding = height * 0.1; // 10% of screen height
const responsiveFontSize = width * 0.04; // 4% of screen width

const Cart = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchCartItems = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        console.log('Fetching cart items with token...');
        const res = await axios.get('http://176.119.254.225:80/cart/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Cart API Response:', res.data);
        console.log('Cart items:', res.data.cart);
        setServices(res.data.cart);
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Failed to load cart items:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Cart component mounted, fetching items...');
    fetchCartItems();
  }, []);

  const removeFromCart = async (indexToRemove, cart_id) => {
    try {
      console.log('Removing item from cart:', { indexToRemove, cart_id });
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return console.error('No token found');

      const response = await axios.delete('http://176.119.254.225:80/cart/remove-from-cart', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { cart_id }, // Axios sends body in 'data' for DELETE requests
      });
      console.log('Remove response:', response.data);

      const updatedServices = [...services];
      updatedServices.splice(indexToRemove, 1);
      setServices(updatedServices);
      console.log('Cart updated after removal');
   
    } catch (error) {
      console.error('Failed to remove item from cart:', error.response?.data || error.message);
    }
  };

  const clearCart = async () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Clearing entire cart...');
              const token = await AsyncStorage.getItem('accessToken');
              if (!token) return console.error('No token found');

              const response = await axios.delete('http://176.119.254.225:80/cart/clear-cart', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log('Clear cart response:', response.data);

              setServices([]); // Reset UI state
              console.log('Cart cleared successfully');
            } catch (error) {
              console.error('Failed to clear cart:', error.response?.data || error.message);
              Alert.alert('Error', 'Failed to clear cart. Please try again.');
            }
          }
        }
      ]
    );
  };

  const total = services?.reduce((acc, curr) => acc + parseFloat(curr?.price ?? 0), 0) ?? 0;
  //console.log('Current cart total:', total);
  //console.log('Current services in cart:', services);

  const renderItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View>
        <Text style={styles.itemTitle}>{item.service_name}</Text>
        <Text style={styles.itemPrice}>₪{parseFloat(item.price).toFixed(2)}</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(index, item.cart_id)}>
        <Ionicons name="close-circle-outline" size={28} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#086189" style={{ marginTop: 40 }} />
      ) : !services || services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={width * 0.25} color="#ccc" />
          <Text style={styles.emptyTitle}>Oops! Your Cart is Empty 😢</Text>
          <Text style={styles.emptySubtitle}>Don't worry! Let's fill it up with some amazing services ✨</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseButtonText}>Let's Go Shopping! 🛍️</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Shopping Cart</Text>
              <Text style={styles.itemCount}>{services.length} {services.length === 1 ? 'item' : 'items'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.clearCartButton} 
              onPress={clearCart}
            >
              <Ionicons name="trash-outline" size={responsiveFontSize * 2} color="#999" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={services}
            keyExtractor={(item) => item.cart_id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
          />

          {/* Fixed footer with total and checkout */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total Price</Text>
              <Text style={styles.priceValue}>₪{total.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('DateTimePickerScreen')}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveHorizontalPadding,
    paddingTop: responsiveVerticalPadding * 1.2,
    backgroundColor: '#f9f9f9',
   
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: responsiveFontSize * 1.3,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: responsiveFontSize * 0.9,
    color: '#666',
  },
  clearCartButton: {
    padding: responsiveHorizontalPadding * 0.5,
  },
  flatListContent: {
    padding: responsiveHorizontalPadding,
    paddingBottom: height * 0.15,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: responsiveHorizontalPadding,
    borderRadius: width * 0.03,
    marginBottom: responsiveMargin,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTitle: {
    fontSize: responsiveFontSize,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: responsiveFontSize * 0.9,
    color: '#666',
    marginTop: responsiveMargin * 0.3,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveHorizontalPadding,
    paddingVertical: responsiveVerticalPadding * 1.5,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: responsiveFontSize,
    color: '#888',
  },
  priceValue: {
    fontSize: responsiveFontSize * 1.4,
    fontWeight: 'bold',
    color: '#111',
  },
  checkoutButton: {
    width: "50%",
    backgroundColor: '#086189',
    paddingVertical: responsiveVerticalPadding * 0.8,
    paddingHorizontal: responsiveHorizontalPadding,
    borderRadius: width * 0.02,
    marginLeft: responsiveMargin * 0.5,
    height: "100%",
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize*1.2,
    fontWeight: '400',
    textAlign:"center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveHorizontalPadding,
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: responsiveFontSize * 1.3,
    fontWeight: '600',
    color: '#333',
    marginTop: responsiveVerticalPadding * 2,
    marginBottom: responsiveVerticalPadding * 0.5,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: responsiveFontSize * 0.9,
    color: '#666',
    marginBottom: responsiveVerticalPadding * 2,
    textAlign: 'center',
    lineHeight: responsiveFontSize * 1.4,
  },
  browseButton: {
    backgroundColor: '#086189',
    paddingVertical: responsiveVerticalPadding * 0.8,
    paddingHorizontal: responsiveHorizontalPadding * 1.5,
    borderRadius: width * 0.02,
    marginTop: responsiveVerticalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize,
    fontWeight: '600',
  },
});

