import React, { useState ,useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import styles from './LoginStyle';
import Colors from '../../../Components/Colors/Colors';
import Logo from '../../../assets/Logo/LogoVEESERV-Blue.png';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // أضف هذا في الأعلى
import { config } from '../../../config'; // for API URL
import UserTypeSelection from '../../../Components/RoleSelection/RoleSelection';

const Login = ({ navigation }) => {

  // States
  const [email_address, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailAnim = useState(new Animated.Value(0))[0];
  const passwordAnim = useState(new Animated.Value(0))[0];

  const handleLogin = async () => {
    if (!email_address || !password) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
  
    if (!validateEmail(email_address)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${config.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address, password }),
      });
  
      const data = await response.json();
      //console.log('Login response:', data);
  
      if (!response.ok) {
        Alert.alert('Login Failed', data.message || 'Login failed');
        setLoading(false);
        return;
      }
  
      const { access_token, refresh_token, role, user_id, profilePicture } = data;
  
      if (!access_token || !refresh_token) {
        Alert.alert('Error', 'Invalid response from server. Please try again.');
        setLoading(false);
        return;
      }
  
      // Store tokens
      await AsyncStorage.setItem('accessToken', access_token);
      await AsyncStorage.setItem('refreshToken', refresh_token);
      await AsyncStorage.setItem('userId', user_id.toString());
      if (role) await AsyncStorage.setItem('userRole', role);
      if (profilePicture) await AsyncStorage.setItem('profilePicture', profilePicture);
  
      // ✅ Check if user is mechanic
      if (role === 'Mechanic') {
        const statusResponse = await fetch(`${config.apiUrl}/mechanic/api/mechanic/status`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
  
        const statusData = await statusResponse.json();
        console.log('Mechanic status:', statusData);
  
        if (statusData.approval_status === 'Pending') {
          Alert.alert(
            'Approval Needed',
            'Your account is under review. Please wait for the admin to approve your request.'
          );
          setLoading(false);
          return;
        }
      }
  
      // Navigate to home screen
     // ✅ هيك تفتح الـ Tabs وكل صفحة توصلها الـ params
     navigation.navigate('MainTabs', {
      role: role || 'Customer',
      // profilePicture: profilePicture || null,
    });
    

  
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Validations

  const validateEmail = (email_address) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email_address).toLowerCase());
  };


  // Focus and Blur
  useEffect(() => {
    if (email_address) {
      Animated.timing(emailAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [email_address]);
  
  useEffect(() => {
    if (password) {
      Animated.timing(passwordAnim, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [password]);

  
  const handleFocus = (anim) => {
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

  const emailLabelStyle = {
    position: 'absolute',
    left: 10,
    top: emailAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -10],
    }),
    fontSize: emailAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: emailAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A0A0A0', Colors.blue],
    }),
  };

  const passwordLabelStyle = {
    position: 'absolute',
    left: 10,
    top: passwordAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [15, -10],
    }),
    fontSize: passwordAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: passwordAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#A0A0A0', Colors.blue],
    }),
  };

  // Render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Image source={Logo} style={styles.logo} />

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={emailLabelStyle}>Email</Animated.Text>
          <TextInput
            style={styles.input}
            value={email_address}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => handleFocus(emailAnim)}
            onBlur={() => handleBlur(emailAnim, email_address)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Animated.Text style={passwordLabelStyle}>Password</Animated.Text>
          <TextInput
            key={showPassword ? 'visible' : 'hidden'}
            secureTextEntry={!showPassword}
            autoCorrect={false}
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            onFocus={() => handleFocus(passwordAnim)}
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={{ color: 'blue', textAlign: 'center', marginVertical: 5 }}>Forgot Password?</Text>
      </TouchableOpacity>

        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text
            style={styles.signUpLink}
            onPress={() => setIsModalVisible(true)}
          >
            Sign up
          </Text>
        </Text>

        <UserTypeSelection
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelectType={(type) => {
            navigation.navigate('SignUp', { userType: type });
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default Login;
