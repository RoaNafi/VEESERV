import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const notificationsData = [
  { id: "1", title: "New Booking Confirmed", description: "Your booking at Workshop X is confirmed!", read: false },
  { id: "2", title: "Discount Offer!", description: "Get 20% off on your next service.", read: true },
  { id: "3", title: "Mechanic Reply", description: "Your mechanic replied to your message.", read: false },
  { id: "4", title: "Reminder", description: "Service appointment tomorrow at 10 AM.", read: true },
];

export default function NotificationsScreen() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📬 Notifications</Text>
      <FlatList
        data={notificationsData}
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
