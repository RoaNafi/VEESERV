import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import offer from '../../assets/offer.png'; // Placeholder image for offers
import AsyncStorage from "@react-native-async-storage/async-storage";

const OfferCard = ({ offer }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.85}>
    <Image source={offer.image} style={styles.icon} />
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{offer.title}</Text>
      <Text style={styles.desc}>{offer.description}</Text>
      <Text style={styles.expiry}>{offer.expiry}</Text>
    </View>
    <TouchableOpacity style={styles.btn}>
      <Text style={styles.btnText}>Grab Now</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const OffersScreen = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOffers = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) throw new Error('No token found');

        const response = await fetch('http://176.119.254.225:80/offer/offers/customers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        //console.log('Fetched offers:', data);

        if (!isMounted) return;

        if (response.ok) {
          setOffers(data.offers);
          console.log('Offers:', data.offers);
        } else {
          setError(data.message || 'Something went wrong!');
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch offers.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const renderOffer = ({ item }) => (
    <OfferCard
      offer={{
        title: item.description || 'Special Offer',
        description: `Discount: ${item.discount_percentage}% - ${item.total_price ? item.total_price + ' $' : '??'}`,
        expiry: `Valid until ${formatDate(item.end_date)}`,
        image: offer,
      }}
    />
  );

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Offers</Text>
      <View style={styles.headerDivider} />
      <ActivityIndicator size="large" color="#086189" style={{ flex: 1 }} />
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Offers</Text>
      <View style={styles.headerDivider} />
      <Text style={styles.errorText}>{error}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Offers</Text>
      <View style={styles.headerDivider} />
      <FlatList
        data={offers}
        keyExtractor={(item) => item.offer_id.toString()}
        renderItem={renderOffer}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#086189",
    marginBottom: 12,
    paddingLeft: 8,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#086189',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#086189',
    marginBottom: 6,
  },
  desc: {
    fontSize: 14,
    color: '#4A4A4A',
  },
  expiry: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF7F50',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#086189',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  contentContainer: {
    padding: 16,
  },
});

export default OffersScreen;
