import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PRIMARY_COLOR = '#086189';

const sampleAppointments = [
  { id: '1', time: '09:00 AM', customer: 'John', car: 'Honda Civic', service: 'Oil Change', status: 'Pending' },
  { id: '2', time: '11:30 AM', customer: 'Anna', car: 'Toyota Corolla', service: 'Brake Check', status: 'Completed' },
  { id: '3', time: '02:00 PM', customer: 'Mark', car: 'Ford Focus', service: 'Engine Diagnosis', status: 'In Progress' },
];

const MechanicHomeScreen = () => {
  const [workshopData, setWorkshopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchWorkshopDetails = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const userId = await AsyncStorage.getItem('userId');

          if (!token || !userId) {
            console.error('Missing token or user ID');
            return;
          }

          const response = await axios.get('http://176.119.254.225:80/mechanic/home-me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          setWorkshopData(response.data);
          console.log('Workshop data:', response.data);
        } catch (error) {
          console.error('Failed to fetch workshop details:', error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchWorkshopDetails();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  if (!workshopData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load workshop data.</Text>
      </View>
    );
  }

 return (
  <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 70 }}>
    <Text style={styles.greeting}>
      Welcome back{workshopData?.user_name ? `, ${workshopData.user_name.split(' ')[0]}` : ''} 👋
    </Text>

  <Card style={styles.card}>
  <View style={styles.cardContent}>
    <View style={styles.infoRow}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{workshopData.workshop_name}</Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Status:</Text>
      <Text style={[styles.value, { color: workshopData.is_open ? '#4CAF50' : '#F44336' }]}>
        {workshopData.is_open ? 'Open ✅' : 'Closed ❌'}
      </Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Location:</Text>
      <Text style={styles.value}>📍 {workshopData.street}, {workshopData.city}</Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.label}>Rating:</Text>
      <Text style={styles.value}>⭐ {workshopData.rate ?? 'N/A'}</Text>
    </View>
  </View>
</Card>


    <Text style={styles.sectionTitle}>Today's Appointments</Text>
    <FlatList
      data={sampleAppointments}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingLeft: 16, paddingBottom: 10 }}
      renderItem={({ item }) => (
        <Card style={styles.appointmentCard}>
          <View style={styles.appointmentInfo}>
            <Text style={styles.appointmentTime}>🕒 {item.time}</Text>
            <Text style={styles.appointmentText}>{item.customer}'s {item.car}</Text>
            <Text style={styles.appointmentText}>{item.service}</Text>
            <Text style={[
              styles.statusChip,
              {
                backgroundColor:
                  item.status === 'Completed' ? '#C8E6C9' :
                  item.status === 'In Progress' ? '#FFECB3' :
                  '#FFCDD2',
                color:
                  item.status === 'Completed' ? '#388E3C' :
                  item.status === 'In Progress' ? '#FF9800' :
                  '#D32F2F'
              }
            ]}>
              {item.status}
            </Text>
          </View>
        </Card>
      )}
    />

    <Text style={styles.sectionTitle}>Quick Actions</Text>
    <View style={styles.actionsRow}>
      <ActionButton icon="clipboard-list" label="Appointments" />
      <ActionButton
          icon="plus"
          label="Add Service"
          onPress={() => navigation.navigate('ProfileNavigator', { screen: 'Service' })}
        />
        <ActionButton
          icon="tools"
          label="Specializations"
          onPress={() => navigation.navigate('ProfileNavigator', { screen: 'WorkshopSpecializations' })}
        />
      {/* <ActionButton icon="car" label="Vehicles" /> */}
    </View>

    <Text style={styles.sectionTitle}>Stats Summary</Text>
    <View style={styles.statsRow}>
      <StatCard label="Bookings" value="12" icon="calendar" />
      <StatCard label="Earnings" value="$870" icon="money-bill" />
      <StatCard label="Rating" value="4.8" icon="star" />
    </View>
  </ScrollView>
);

};

const ActionButton = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionButton}>
    <FontAwesome5 name={icon} size={22} color={PRIMARY_COLOR} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <FontAwesome5 name={icon} size={20} color={PRIMARY_COLOR} style={{ marginBottom: 6 }} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default MechanicHomeScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 20,
  },
 
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workshopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginVertical: 4,
  },
  location: {
    fontSize: 14,
    color: '#555',
  },
  rating: {
    fontSize: 14,
    color: '#555',
  },
 
  appointmentCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
  },
  appointmentText: {
    fontSize: 14,
    marginBottom: 4,
  },
  
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  actionButton: {
    alignItems: 'center',
    width: 70,
  },
  actionLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
 
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    color: 'red',
  },
  appointmentCard: {
  backgroundColor: '#fff',
  padding: 16,
  marginRight: 12,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
  width: 220,
},

appointmentInfo: {
  flexDirection: 'column',
},

appointmentTime: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginBottom: 6,
},

statusChip: {
  marginTop: 8,
  paddingVertical: 4,
  paddingHorizontal: 10,
  borderRadius: 20,
  fontSize: 12,
  alignSelf: 'flex-start',
  overflow: 'hidden',
  fontWeight: '600',

},

actionButton: {
  alignItems: 'center',
  backgroundColor: '#f1f9fd',
  padding: 12,
  borderRadius: 12,
  width: 120,
  height: 120,
  justifyContent: 'center',
  marginHorizontal: 4,
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},

statCard: {
  alignItems: 'center',
  padding: 14,
  borderRadius: 12,
  backgroundColor: '#f9f9f2',
  width: '30%',
  shadowColor: '#000',
  shadowOpacity: 0.2,
  
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 3,
  elevation: 2,
},

sectionTitle: {
  fontSize: 20,
  fontWeight: '700',
  marginTop: 28,
  marginBottom: 12,
  color: PRIMARY_COLOR,
},


workshopName: {
  fontSize: 20,
  fontWeight: '700',
  color: '#333',
},

status: {
  fontSize: 14,
  marginTop: 6,
  fontWeight: '600',
},

location: {
  fontSize: 14,
  color: '#666',
  marginTop: 4,
},

rating: {
  fontSize: 14,
  color: '#666',
  marginTop: 2,
},
card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'column',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 80, // fixed width for alignment
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flexShrink: 1,
  },

});
