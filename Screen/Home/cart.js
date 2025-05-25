import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Cart = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchCartItems = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const res = await axios.get('http://176.119.254.225:80/cart/cart', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setServices(res.data.cart);
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Failed to load cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const removeFromCart = async (indexToRemove, cart_id) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return console.error('No token found');

    await axios.delete('http://176.119.254.225:80/cart/remove-from-cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { cart_id }, // Axios sends body in 'data' for DELETE requests
    });

    const updatedServices = [...services];
    updatedServices.splice(indexToRemove, 1);
    setServices(updatedServices);
   
  } catch (error) {
    console.error('Failed to remove item from cart:', error);
  }
};

const clearCart = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return console.error('No token found');

    await axios.delete('http://176.119.254.225:80/cart/clear-cart', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setServices([]); // Reset UI state
  
  } catch (error) {
    console.error('Failed to clear cart:', error);
    
  }
};


  const total = services.reduce((acc, curr) => acc + parseFloat(curr.price ?? 0), 0);

return (
  <View style={styles.container}>
    {loading ? (
      <ActivityIndicator size="large" color="#086189" style={{ marginTop: 40 }} />
    ) : services.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    ) : (
      <>
        {/* Total and Clear */}
        <View style={styles.headerRow}>
          <Text style={styles.totalText}>Total: <Text style={styles.totalAmount}>${total.toFixed(2)}</Text></Text>
          <TouchableOpacity style={styles.clearCartButton} onPress={clearCart}>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.clearCartText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* List of services */}
        <FlatList
          data={services}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.itemCard}>
              <View>
                <Text style={styles.itemTitle}>{item.service_name ?? 'Unnamed Service'}</Text>
                <Text style={styles.itemPrice}>${parseFloat(item.price ?? 0).toFixed(2)}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(index, item.cart_id)}>
                <Ionicons name="close-circle-outline" size={28} color="#d9534f" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.flatListContent}
        />

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('DateTimePickerScreen')}
        >
          <Text style={styles.checkoutButtonText}>Continue to Checkout</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    color: '#086189',
    fontWeight: '700',
  },
  clearCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9534f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearCartText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  flatListContent: {
    paddingBottom: 80,
  },
  checkoutButton: {
    backgroundColor: '#086189',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom:16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


