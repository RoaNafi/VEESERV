import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Static fallback notifications
const notificationsData = [
  { id: "3", title: "Mechanic Reply", description: "Your mechanic replied to your message.", read: false },
];

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
        title: n.message.length > 30 ? n.message.slice(0, 30) + '...' : n.message,
        description: n.message,
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

  // دمج بيانات الـ API مع الـ static
  const combinedNotifications = [...apiNotifications, ...notificationsData];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationCard, item.read ? styles.read : styles.unread]}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={item.read ? "notifications-outline" : "notifications"}
          size={24}
          color={item.read ? "#888" : "#086189"}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
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
    <View style={styles.container}>
      <Text style={styles.header}>📬 Notifications</Text>
      <FlatList
        data={combinedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f9fc",
    paddingHorizontal: 16,
    paddingTop: 70,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    color: "#086189",
    marginBottom: 20,
    textAlign: "center",
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#086189",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
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
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#086189",
  },
  read: {
    opacity: 0.6,
  },
  unread: {
    opacity: 1,
  },
});
