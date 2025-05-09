// ChangePasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // assuming token is stored here
import { config } from '../../config'; // for API URL
const ChangePassword = ({ route, navigation }) => {
  const { userId } = route.params;
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const handleChange = async () => {
    if (newPass !== confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log("Fetched Token:", token); // Log the token to ensure it's fetched correctly
  
      if (!token) {
        Alert.alert("Error", "No token found.");
        return;
      }
  
      const res = await axios.post(`${config.apiUrl}/changePassword/reset-password`, {
        userId,
        currentPassword: current,
        newPassword: newPass,
      }, {
        headers: {
          Authorization: `Bearer ${token}`, // Add the Authorization header here
        }
      });
      Alert.alert("Success", "Password changed successfully.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong.");
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={current}
        onChangeText={setCurrent}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={newPass}
        onChangeText={setNewPass}
      />

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleChange}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#EDF6FF' },
  label: { fontSize: 16, marginBottom: 5, color: '#086189' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#086189',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default ChangePassword;
