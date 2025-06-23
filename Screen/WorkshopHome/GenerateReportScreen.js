
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal, Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Alert } from 'react-native';    
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
const GenerateReportScreen = ({ route, navigation }) => {
  const { booking } = route.params; // يعني تبعت بيانات الحجز من الصفحة اللي فاتت

  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    if (!reportText.trim()) {
      Alert.alert('Please enter the report text');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.post(
        `http://176.119.254.225:80/booking/report/${booking.booking_id}`,
        {
          report_text: reportText,
          total_amount: booking.price,
          services: booking.services,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Report sent successfully!');
      navigation.goBack();

    } catch (error) {
      console.error(error);
      Alert.alert('Failed to send report');
    } finally {
      setLoading(false);
    }
  };
return (
  <ScrollView style={{ flex: 1, padding: 24, backgroundColor: '#f9f9f9' }}>
    <Text style={{
      fontWeight: '700',
      fontSize: 22,
      marginBottom: 16,
      color: '#222',
      letterSpacing: 0.4,
    }}>
      Generate Report for Booking #{booking.booking_id}
    </Text>

    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '600', fontSize: 16, color: '#555' }}>Customer:</Text>
      <Text style={{ fontSize: 16, color: '#111', marginTop: 4 }}>{booking.customer}</Text>
    </View>

    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '600', fontSize: 16, color: '#555' }}>Car:</Text>
      <Text style={{ fontSize: 16, color: '#111', marginTop: 4 }}>{booking.car}</Text>
    </View>

    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontWeight: '600', fontSize: 16, color: '#555' }}>Scheduled At:</Text>
      <Text style={{ fontSize: 16, color: '#111', marginTop: 4 }}>
        {booking.scheduled_date} - {booking.scheduled_time}
      </Text>
    </View>

    <Text style={{
      fontWeight: '700',
      fontSize: 18,
      marginBottom: 10,
      color: '#333',
      borderBottomWidth: 1,
      borderColor: '#ddd',
      paddingBottom: 6,
    }}>
      Services
    </Text>

    {booking.services.map((service, idx) => (
      <View
        key={idx}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 10,
          borderBottomWidth: idx === booking.services.length - 1 ? 0 : 1,
          borderColor: '#eee',
        }}
      >
        <Text style={{ fontSize: 16, color: '#222' }}>{service.name}</Text>
        <Text style={{ fontSize: 14, fontStyle: 'italic', color: service.status === 'approved' ? 'green' : '#999' }}>
          {service.status}
        </Text>
      </View>
    ))}

    <View style={{ marginTop: 24, marginBottom: 12 }}>
      <Text style={{ fontWeight: '700', fontSize: 18, color: '#333' }}>Total Amount</Text>
      <Text style={{ fontSize: 20, color: '#086189', fontWeight: '700', marginTop: 6 }}>
        {booking.price} NIS
      </Text>
    </View>

    <Text style={{
      fontWeight: '700',
      fontSize: 18,
      marginBottom: 10,
      color: '#333',
    }}>
      Report Text
    </Text>

    <TextInput
      multiline
      numberOfLines={6}
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        backgroundColor: 'white',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
      value={reportText}
      onChangeText={setReportText}
      placeholder="Write your report here..."
      placeholderTextColor="#999"
    />

    <TouchableOpacity
      onPress={submitReport}
      style={{
        backgroundColor: '#086189',
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 28,
        alignItems: 'center',
        opacity: loading ? 0.7 : 1,
      }}
      disabled={loading}
    >
      <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
        {loading ? 'Sending...' : 'Send Report'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        marginTop: 14,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#555', fontSize: 16 }}>Cancel</Text>
    </TouchableOpacity>
  </ScrollView>
);
};
export default GenerateReportScreen;