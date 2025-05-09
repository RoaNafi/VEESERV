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
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Text style={styles.logoText}>VEESERV</Text>
        <Text style={styles.tagline}>Your Trusted Service Partner</Text>
      </View>

      {/* Company & Legal Links Section */}
      <Text style={styles.linkHeader}>Company & Legal</Text>
      <View style={styles.linksRow}>
        <View style={styles.linkColumn}>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Services</Text>
          </TouchableOpacity>
        </View>

      
        <View style={styles.linkColumn}>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy</Text>
          </TouchableOpacity>
          
        </View>

        <View style={styles.linkColumn}>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Social Media Icons */}
      <View style={styles.socialSection}>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://facebook.com")}
        >
          <Ionicons name="logo-facebook" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://x.com")}
        >
          <Ionicons name="logo-twitter" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://instagram.com")}
        >
          <Ionicons name="logo-instagram" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialIcon}
          onPress={() => openLink("https://linkedin.com")}
        >
          <Ionicons name="logo-linkedin" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Developers Credits */}
      <View style={styles.developersSection}>
        <Text style={styles.devHeader}>
          Developed with <Text style={{ color: "red" }}>❤</Text> by:
        </Text>
        <View style={styles.devNames}>
          <Text style={styles.devName}>Roa Nafi</Text>
          <Text style={styles.devDot}>•</Text>
          <Text style={styles.devName}>Safaa</Text>
          <Text style={styles.devDot}>•</Text>
          <Text style={styles.devName}>Dunia Alamal</Text>
        </View>
      </View>

      {/* Copyright */}
      <Text style={styles.copyright}>
        © {currentYear} AutoRepair. All rights reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e7e7e7",
  },
  logoSection: {
    marginBottom: 25,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: "#666",
  },
  linksRow: {
    flexDirection: "row",
    justifyContent: "start",
    marginBottom: 30,
  },
  linkColumn: {
    width: "40%",
    paddingRight: 10,
  },
  linkHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 15,
  },
  linkItem: {
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  socialSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e9e9e9",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 25,
  },
  developersSection: {
    alignItems: "center",
    marginBottom: 15,
  },
  devHeader: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
    textAlign: "center",
  },
  devNames: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  devName: {
    fontSize: 14,
    color: "#666",
  },
  devDot: {
    marginHorizontal: 8,
    color: "#aaa",
  },
  copyright: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
});

export default Footer;
