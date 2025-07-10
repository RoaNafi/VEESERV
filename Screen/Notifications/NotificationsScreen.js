import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from "../../Components/Colors/Colors";

export default function NotificationsScreen() {
  const [apiNotifications, setApiNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
 useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await axios.get('http://176.119.254.225:80/notification/notifications', {
        headers: {
             Authorization: `Bearer ${token}`,
        },
      });
      
      // axios يحط البيانات في res.data مباشرة
      const data = res.data;

      // عدل على حسب شكل بياناتك الحقيقية
      const formatted = data.notifications.map(n => ({
        id: n.notification_id.toString(),
        title: n.message,
        description: '',
        read: n.status === 'read',
      }));

      setApiNotifications(formatted);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching notifications');
      setLoading(false);
    }
  };

  fetchNotifications();
}, []);

  // Use only API notifications
  const combinedNotifications = apiNotifications;

  // Mark notification as read
  const handlePressNotification = async (item) => {
    if (!item.read) {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        await axios.patch(`http://176.119.254.225:80/notification/notifications/${item.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        // Optionally handle error
      }
      setApiNotifications((prev) => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationCard, item.read ? styles.read : styles.unread]} onPress={() => handlePressNotification(item)}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.read ? "notifications-outline" : "notifications"}
          size={22}
          color={item.read ? "#888" : "#086189"}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#086189" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Notifications</Text>
      <View style={styles.headerDivider} />
      <FlatList
        data={combinedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#086189",
    marginBottom: 8,
    paddingLeft:8,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    //marginBottom: 12,
    width: '100%',
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#086189",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    marginHorizontal: 4,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  unreadTitle: {
    color: "#086189",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#086189",
  },
  read: {
    opacity: 0.6,
  },
  unread: {
    opacity: 1,
  },
});
