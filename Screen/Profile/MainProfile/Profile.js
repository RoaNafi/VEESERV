

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from './ProfileStyle';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { config } from '../../../config'; // for API URL

const Profile = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${config.apiUrl}/myprofile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      
       console.log('Fetched profile' );  

      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Error', 'Could not load profile data');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#086189" />
      </View>
    );
  }

  const { user, workshopDetails } = profile;
  const isMechanic = user.role === 'Mechanic';

  const handleLogout = async () => {
    try {
      // Clear AsyncStorage and navigate to Login screen
      await AsyncStorage.removeItem('accessToken');
      navigation.navigate("RegNavigator", { screen: "Login" });

      Alert.alert('Logged out', 'You have been logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Something went wrong while logging out');
    }
  };

  const menuItems = [
    {
      type: 'double',
      items: [
        { icon: 'create-outline', label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
        {icon: isMechanic ? 'construct' : 'car', label: isMechanic ? 'Service' : 'Garage', action: () => navigation.navigate(isMechanic ? 'Service' : 'Garage') },
      ],
    },
    { icon: 'time', label: 'History', action: () => navigation.navigate('HistoryScreen',{ userId: user?.id }) 
  },
    { icon: 'globe', label: 'Language', action: () => navigation.navigate('Language') },
   
  ...(isMechanic ? [
    { icon: 'medal', label: 'Certification', action: () => navigation.navigate('CertificationScreen') },
    { icon: 'star', label: 'Specialization', action: () => navigation.navigate('SpecializationScreen') },
  ] : []),
  { icon: 'key', label: 'Change Password', action: () => navigation.navigate('ChangePassword',{ userId: user?.id }) },
  { icon: 'settings', label: 'Settings & Privacy', action: () => {} },
  { icon: 'people', label: 'Invite Friends', action: () => {} },
  { icon: 'log-out', label: 'Log out', action: handleLogout, isLogout: true },

];

  
return (
  <ScrollView style={styles.container}>
    <View style={styles.centerContent}>
      <Image
        source={{ uri: user.profile_picture || 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
      
        style={styles.avatar}
      />
    

      <Text style={styles.name}>{`${user.first_name} ${user.last_name}`}</Text>
      <Text style={styles.info}>{user.phone_number}</Text>
      <Text style={styles.info}>{user.email_address}</Text>

     {/* {console.log('User id:', user.idx)} */}
      {isMechanic && workshopDetails && (
        <>
          <Text style={styles.info}>Workshop: {workshopDetails.workshop_name}</Text>

          {/* Enhanced working hours display */}
          {workshopDetails.working_day_hours ? (
            <View style={styles.workingHoursContainer}>
              <Text style={styles.workingHoursTitle}>Working Hours:</Text>
              <Text style={styles.workingHoursText}>{workshopDetails.working_day_hours}</Text>
            </View>
          ) : (
            <Text style={[styles.info, { color: '#FF6347' }]}>Working hours not set</Text>
          )}

          {/* Link to more detailed working hours if needed */}
          <TouchableOpacity onPress={() => navigation.navigate('WorkingHours')} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>  edit working hours</Text>
          </TouchableOpacity>
        </>
      )}
    </View>

    <View style={styles.menuContainer}>
      {menuItems.map((item, idx) => {
        if (item.type === 'double') {
          return (
            <View key={idx} style={styles.doubleRow}>
              {item.items.map((subItem, subIdx) => (
                <TouchableOpacity
                  key={subIdx}
                  style={styles.halfMenuItem}
                  onPress={subItem.action}
                >
                  <View style={styles.menuItemLeft}>
                    <Ionicons name={subItem.icon} style={styles.menuIcon} />
                    <Text style={styles.menuLabel}>{subItem.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} />
                </TouchableOpacity>
              ))}
            </View>
          );
        } else {
          return (
            <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.action}>
              <View style={styles.menuItemLeft}>
                {!item.isLogout && <Ionicons name={item.icon} style={styles.menuIcon} />}
                <Text style={[styles.menuLabel, item.isLogout && styles.logoutText]}>
                  {item.label}
                </Text>
              </View>
              {!item.isLogout && <Ionicons name="chevron-forward" size={20} />}
            </TouchableOpacity>
          );
        }
      })}
    </View>
  </ScrollView>
);
  
};

export default Profile;
