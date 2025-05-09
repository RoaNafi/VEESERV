import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Colors from '../../Components/Colors/Colors';
import { config } from '../../config'; // for API URL

const ResetPassword = ({ route, navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // For showing the loading spinner
  const { token, email_address } = route.params;

  const handleResetPassword = async () => {
    setIsLoading(true);  // Show loading spinner
    console.log('Sending token:', token);  // Log token to ensure it's not undefined
    console.log('Sending new password:', newPassword);  // Log new password to ensure it's correct
  
    try {
      const response = await axios.post(`${config.apiUrl}/resetpassword/reset-password`, {
        token: token,  // Ensure token is sent correctly
        new_password: newPassword  // Send the new password
      });
  
      console.log('Response:', response.data);
      setMessage(response.data.message);
  
      if (response.data.message === 'Password reset successful') {
        // Navigate to the login screen after successful reset
        setTimeout(() => {
          navigation.navigate('Login');  // Assuming 'Login' is the name of your login screen
        }, 1000);  // Delay to show the success message
      }
    } catch (error) {
      console.error('Error response:', error.response.data);  // Log the error response from the server
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);  // Hide loading spinner
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reset Your Password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Reset Password" onPress={handleResetPassword} color="#ffff" />
      </View>

      {isLoading && <ActivityIndicator size="large" color="#007bff" style={styles.loading} />}
      
      {message && (
        <Text style={message.includes('successful') ? styles.successMessage : styles.errorMessage}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.blue,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor :Colors.blue,
    borderRadius: 10,
    height: 40,
  },
  loading: {
    marginTop: 10,
  },
  successMessage: {
    marginTop: 20,
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    marginTop: 20,
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetPassword;
