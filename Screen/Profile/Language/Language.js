// LanguageScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Language = ({ navigation }) => {
  const handleLanguageSelect = (lang) => {
    console.log("Selected language:", lang);
    // TODO: Save language preference if needed
    navigation.goBack(); // Or navigate to home or another screen
  };

  return (
    <View style={styles.container}>
      <Ionicons name="globe-outline" size={64} color="#4B9CD3" style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Choose Language / اختر اللغة</Text>

      <TouchableOpacity style={styles.button} onPress={() => handleLanguageSelect('ar')}>
        <Text style={styles.buttonText}>العربية</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleLanguageSelect('en')}>
        <Text style={styles.buttonText}>English</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#086189',
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
});

export default Language;
