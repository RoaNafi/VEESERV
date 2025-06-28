import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import styles from './ProfileStyle';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { config } from '../../../config'; // for API URL
import Footer from '../../../Components/Footer/Footer ';

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
      //console.log('Profile data:', data);     
      console.log('Fetched profile');
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
      <SafeAreaView style={styles.container}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerDivider} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#086189" />
        </View>
      </SafeAreaView>
    );
  }

  const { user, workshopDetails } = profile;
  const isMechanic = user.role === 'Mechanic';
  const isCustomer = user?.role === 'Customer';
  const isCompany = profile?.customerDetails?.is_company;

  const handleLogout = async () => {
    try {
      // remove token and clear stack after logout
      await AsyncStorage.removeItem('accessToken');
      navigation.reset({
        index: 0,
        routes: [{ name: 'RegNavigator', params: { screen: 'Login' } }],
      });
      Alert.alert('Logged out', 'You have been logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Something went wrong while logging out');
    }
  };

  const handleConvertToCompany = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${config.apiUrl}/convertToCompany`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to convert to company');
Alert.alert("Success", "Congratulations! Your account is now a company 🏢✨");

      fetchProfile(); // حتى يحدث البيانات ويختفي الزر
    } catch (error) {
      console.error("Error converting to company:", error);
      Alert.alert("Error", "We couldn't convert you to a company. Please try again");
    }
  };

  const menuItems = [
    {
      type: 'double',
      items: [
        { icon: 'create-outline', label: 'Edit Profile', action: () => navigation.navigate('EditProfile') },
        { icon: 'car', label: 'Garage', action: () => navigation.navigate('Garage') },
      ],
    },
    { icon: 'star', label: 'Favorite Workshops', action: () => navigation.navigate('FavoriteWorkshops') },
    { icon: 'time', label: 'History', action: () => navigation.navigate('HistoryScreen', { userId: user?.id }) },
    { icon: 'globe', label: 'Language', action: () => navigation.navigate('Language') },
    { icon: 'business', label: 'Company & Legal', action: () => navigation.navigate('CompanyLegal') },

    // 👇 زر التحويل يظهر فقط لو المستخدم زبون مش شركة
    ...(isCustomer && !isCompany ? [{
      icon: 'business',
      label: 'Switch to Company Mode',
      action: handleConvertToCompany,
    }] : []),

    ...(isMechanic ? [
      { icon: 'medal', label: 'Certification', action: () => navigation.navigate('CertificationScreen') },
      { icon: 'star', label: 'Specialization', action: () => navigation.navigate('WorkshopSpecializations', { userId: user?.id }) },
    ] : []),

    { icon: 'key', label: 'Change Password', action: () => navigation.navigate('ChangePassword', { userId: user?.id }) },
    { icon: 'log-out', label: 'Log out', action: handleLogout, isLogout: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Profile</Text>
      <View style={styles.headerDivider} />
      <ScrollView style={styles.scrollContent}>
        <View style={styles.centerContent}>
          <Image
            source={{ uri: user.profile_picture || 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{`${user.first_name} ${user.last_name}`}</Text>
          <Text style={styles.info}>{user.phone_number}</Text>
          <Text style={styles.info}>{user.email_address}</Text>

          {isMechanic && workshopDetails && (
            <>
              <Text style={styles.info}>Workshop: {workshopDetails.workshop_name}</Text>

              {workshopDetails.working_day_hours ? (
                <View style={styles.workingHoursContainer}>
                  <Text style={styles.workingHoursTitle}>Working Hours:</Text>
                  <Text style={styles.workingHoursText}>{workshopDetails.working_day_hours}</Text>
                </View>
              ) : (
                <Text style={[styles.info, { color: '#FF6347' }]}>Working hours not set</Text>
              )}

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

        <Footer/>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
