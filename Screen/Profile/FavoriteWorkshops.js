import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../Components/Colors/Colors';

const FavoriteWorkshops = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await fetch('http://176.119.254.225:80/favourite/myfavorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (error) {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('WorkshopDetails', {
        workshopData: {
          workshop_id: item.workshop_id,
          workshop_name: item.workshop_name,
          image: item.image,
          city: item.city,
          street: item.street,
          rate: item.rate,
          address_id: item.street || item.address_id || '',
          ...item
        }
      })}
    >
      <Image
        source={item.image
          ? { uri: item.image }
          : { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s' }
        }
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.workshop_name}</Text>
        <Text style={styles.address}>{item.city || 'No city'}, {item.street || 'No street'}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" style={{ marginRight: 3 }} />
          <Text style={styles.rate}>Rate: {item.rate ? item.rate.toFixed(1) : 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.blue} style={{ marginTop: 30 }} />
      ) : favorites.length === 0 ? (
        <Text style={styles.emptyText}>You have no favorite workshops yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => String(item.workshop_id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.blue,
    marginTop: 24,
    marginBottom: 10,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7EF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F3F6FA',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 2,
  },
  address: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rate: {
    color: '#444',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default FavoriteWorkshops; 