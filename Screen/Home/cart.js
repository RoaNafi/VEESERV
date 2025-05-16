import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Cart = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // this gives you access to navigation

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

  const total = services.reduce((acc, curr) => acc + parseFloat(curr.price), 0);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.serviceName}>{item.service_name ?? 'Unnamed'}</Text>
        <Text style={styles.price}>${parseFloat(item.price ?? 0).toFixed(2)}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={24} color="#086189" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#086189" style={{ marginTop: 40 }} />
      ) : services.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <>
          {/* Total at the top */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>

          <FlatList
            data={services}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.flatListContent}
          />

          {/* Continue to Checkout Button */}
          <TouchableOpacity style={styles.checkoutButton}       onPress={() => navigation.navigate('DateTimePickerScreen')}

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
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#086189',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  serviceName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  totalContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    elevation: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#086189',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 18,
    marginTop: 40,
  },
  checkoutButton: {
    backgroundColor: '#086189',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 45,
    alignItems: 'center',
    elevation: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  flatListContent: {
    paddingHorizontal: 20,
  },
});
