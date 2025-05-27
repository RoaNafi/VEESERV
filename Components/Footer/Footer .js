import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  

  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't open link", err)
    );
  };

  return (
    <View style={styles.footerContainer}>
      {/* Social Media Icons */}
      <View style={styles.socialSection}>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://facebook.com")}
        >
          <Ionicons name="logo-facebook" size={24} color="#086189" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://x.com")}
        >
          <Ionicons name="logo-twitter" size={24} color="#086189" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://instagram.com")}
        >
          <Ionicons name="logo-instagram" size={24} color="#086189" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://linkedin.com")}
        >
          <Ionicons name="logo-linkedin" size={24} color="#086189" />
        </TouchableOpacity>
      </View>

      {/* Developers Credits */}
      <View style={styles.developersSection}>
        <Text style={styles.devHeader}>
          Made with <Text style={styles.heartIcon}>❤</Text> by
        </Text>
        <View style={styles.devNames}>
          <Text style={styles.devName}>Ro'a</Text>
          <Text style={styles.devDot}>•</Text>
          <Text style={styles.devName}>Dunia Alamal</Text>
          <Text style={styles.devDot}>•</Text>
          <Text style={styles.devName}>Safaa</Text>
          
         
        </View>
      </View>

      {/* Copyright */}
      <Text style={styles.copyright}>
        © {currentYear} VEESERV
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  socialSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    gap: 20,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  developersSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  devHeader: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  heartIcon: {
    color: "#FF4B4B",
    fontSize: 16,
  },
  devNames: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  devName: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  devDot: {
    color: "#999",
    fontSize: 14,
  },
  copyright: {
    textAlign: "center",
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
});

export default Footer;
