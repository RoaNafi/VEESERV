import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import styles from './SignUpStyle';
import Colors from '../../../Components/Colors/Colors';
import { Ionicons } from '@expo/vector-icons'; // For the eye and location icons
import * as Location from 'expo-location'; // For geolocation

import Logo from '../../../assets/Logo/LogoVEESERV-Blue.png'; // Logo path
import { config } from '../../../config'; // For API URL

import { useEffect } from 'react';

const SignUp = ({ route, navigation }) => {
  // State for form fields
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email_address, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const role = route.params?.role || 'Customer';

  const [address, setAddress] = useState({
    street: '',
    city: '',
    lat: '',
    lng: '',
  });
  const [workshop_name, setWorkshopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    console.log('Received role:', role);
  }, [])

  // Animation values for floating labels
  const firstNameAnim = useRef(new Animated.Value(0)).current;
  const lastNameAnim = useRef(new Animated.Value(0)).current;
  const emailAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const phoneNumberAnim = useRef(new Animated.Value(0)).current;
  const addressAnim = useRef(new Animated.Value(0)).current;
  const workshopNameAnim = useRef(new Animated.Value(0)).current;


/*

this handleGetLocation retrieve the address from the API.
If that doesn't work, it will continue with a fake address.

this is so i can use it in the emulator  

*/


const handleGetLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission not granted.');
      return;
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

    const { latitude, longitude } = location.coords;
    console.log("Latitude:", latitude, "Longitude:", longitude); // Debugging

    let road = "Test Street";
    let city = "Test City";

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'veeserv-app/1.0',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        road = data.address?.road || "Unknown Street";
        city = data.address?.city || "Unknown City";
      } else {
        console.warn("🌐 API response not OK, using fallback address.");
      }
    } catch (apiError) {
      console.warn("🌐 API fetch failed, using fallback address.");
    }

    if (latitude && longitude) {
      setAddress({
        street: road,
        city: city,
        latitude: latitude,
        longitude: longitude,
      });
    } else {
      console.warn("Latitude or Longitude is null");
    }

    animateLabelUp(addressAnim);

  } catch (error) {
    Alert.alert('Error', `Location error: ${error.message}`);
  }
};


  useEffect(() => {
    if (address.street) {
      animateLabelUp(addressAnim);
    } else {
      handleBlur(addressAnim, '');
    }
  }, [address.street]);
  // Password validation
  const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    return minLength && hasUpperCase && hasLowerCase;
  };
  const handleSignUp = async () => {
    if (!first_name || !last_name || !email_address || !password) {
      setError('Please fill in all required fields.');
      return;
    }
  
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long and include both uppercase and lowercase letters.');
      return;
    }
  
    if (role === 'Mechanic') {
      if (!workshop_name || !phone_number || !address.street || !address.city) {
        setError('Please fill in all mechanic-specific fields including address.');
        return;
      }
    }
  
    setLoading(true);
    setError('');
    
    try {
      // Log the payload to ensure all fields are included
      const payload = {
        first_name,
        last_name,
        email_address,
        password,
        role,
      };
  
      if (role === 'Mechanic') {
        payload.workshop_name = workshop_name;
        payload.phone_number = phone_number;
        payload.address = address;
      }
  
      console.log('Payload being sent:', payload); // <-- Debug log
  
      const endpoint =
        role === 'Customer'
          ? `${config.apiUrl}/customer/signup`
          : `${config.apiUrl}/mechanic/signup`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        navigation.navigate('Login', { role });
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
   
  // Floating label styles
  const floatingLabelStyle = (anim) => ({
    position: 'absolute',
    left: 10,
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -10],
    }),
    fontSize: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A0A0A0', Colors.blue],
    }),
  });

  // Handle focus and blur for floating labels
  const animateLabelUp = (anim) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (anim, value) => {
    if (!value) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Logo */}
      <Image
        source={Logo}
        style={styles.logo}
      />



      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Let's get you started!</Text>

        {/* First Name Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={floatingLabelStyle(firstNameAnim)}>
            First Name
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={first_name}
            onChangeText={setFirstName}
            onFocus={() => animateLabelUp(firstNameAnim)}
            onBlur={() => handleBlur(firstNameAnim, first_name)}
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={floatingLabelStyle(lastNameAnim)}>
            Last Name
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={last_name}
            onChangeText={setLastName}
            onFocus={() => animateLabelUp(lastNameAnim)}
            onBlur={() => handleBlur(lastNameAnim, last_name)}
          />
        </View>
        
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={floatingLabelStyle(emailAnim)}>
            Email
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={email_address}
            onChangeText={setEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => animateLabelUp(emailAnim)}
            onBlur={() => handleBlur(emailAnim, email_address)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={floatingLabelStyle(passwordAnim)}>
            Password
          </Animated.Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => animateLabelUp(passwordAnim)}
            onBlur={() => handleBlur(passwordAnim, password)}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={24}
              color={Colors.gray}
            />
          </TouchableOpacity>
        </View>

        {/* Additional fields for Mechanics */}
        {role === 'Mechanic' && (
          <>
            {/* Workshop Name Input */}
            <View style={styles.inputContainer}>
              <Animated.Text style={floatingLabelStyle(workshopNameAnim)}>
                Workshop Name
              </Animated.Text>
              <TextInput
                style={styles.input}
                value={workshop_name}
                onChangeText={setWorkshopName}
                onFocus={() => animateLabelUp(workshopNameAnim)}
                onBlur={() => handleBlur(workshopNameAnim, workshop_name)}
              />
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Animated.Text style={floatingLabelStyle(phoneNumberAnim)}>
                Phone Number
              </Animated.Text>
              <TextInput
                style={styles.input}
                value={phone_number}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                onFocus={() => animateLabelUp(phoneNumberAnim)}
                onBlur={() => handleBlur(phoneNumberAnim, phone_number)}
              />
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
  {address.street !== '' && (
    <Animated.Text style={floatingLabelStyle(addressAnim)}>
      Address
    </Animated.Text>
  )}

  <TextInput
     style={[
      styles.addressInput,
      address.street === '' && { color: '#A0A0A0' }, // لون placeholder
    ]}
    value={
      address.street
        ? `${address.street}, ${address.city}`
        : 'click on the icon'
    }
    editable={false}
    
  />

  <TouchableOpacity
    style={styles.locationButton}
    onPress={handleGetLocation}
  >
    <Ionicons name="location" size={24} color={Colors.blue} />
  </TouchableOpacity>
</View>


          </>
        )}

        {/* Error Message */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Already Have an Account Link */}
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text
            style={styles.signInLink}
            onPress={() => navigation.navigate('Login')}
          >
            Log In
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;