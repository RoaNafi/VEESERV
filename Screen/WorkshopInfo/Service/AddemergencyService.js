import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
   Switch,
  Platform
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';  
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../../api';

const AddEmergencyService = ({ navigation, route }) => {
  const { workshopId } = route.params;

  const [categories, setCategories] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [price, setPrice] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
const [serviceOpen, setServiceOpen] = useState(false);


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/emergency/emergencyService');
      // استخدمي res.data.emergencyServices حسب شكل الرد
      const formatted = res.data.emergencyServices.map(cat => ({
        label: cat.name,           // الاسم يظهر في القائمة
        value: cat.emergency_service_id, // القيمة التي نرسلها
        category: cat.category,
        description: cat.description,
      }));
      setCategories(formatted);
    } catch (err) {
      console.error('Error fetching categories:', err);
      Alert.alert('Error', 'Failed to load emergency services');
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !price) {
      return Alert.alert('⚠️ Missing Fields', 'Please fill all required fields.');
    }

    const dataToSend = {
      workshopId,
      emergency_service_id: selectedService,
      price: parseFloat(price),
      // لو بدك ترسلي اسم الخدمة المخصصة:
      // custom_service_name: customServiceName || null,
    };

    try {
      const token = await AsyncStorage.getItem('accessToken');

      const res = await api.post('/emergency/emergency', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('✅ Success', res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error('Error submitting emergency service:', err);
      if (err.response && err.response.data) {
        Alert.alert('Error', err.response.data.message || 'Server error.');
      } else {
        Alert.alert('Error', 'Failed to add emergency service.');
      }
    }
  };

return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: Colors.white }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, zIndex: 2000 }}>
        <Text style={styles.header}>Add Emergency Service</Text>

        <DropDownPicker
          open={serviceOpen}
          value={selectedService}
          items={categories}
          setOpen={setServiceOpen}
          setValue={setSelectedService}
          setItems={setCategories}
          placeholder="Select a Service"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={2000}
          zIndexInverse={1000}
        />

        <TextInput
          placeholder="Price (e.g., 49.99)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor={Colors.mediumGray}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Add Service</Text>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
);


};

const Colors = {
  white: '#FFFFFF',
  orange: '#FF5722',
  mediumGray: '#A0A0A5',
  darkGray: '#313335',
  lightGray: '#EFEFEF',
  blue: '#086189',
  lightblue: '#6F9FEE',
  darkblue: '#003B5C',
  black: '#000000',
  red: '#B8001F',
  green: '#387F39',
  lightgreen: '#A4E1B8',
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.white,
    flexGrow: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.darkblue,
    textTransform: 'uppercase',
  },
  or: {
    textAlign: 'center',
    marginVertical: 10,
    color: Colors.mediumGray,
    fontSize: 14,
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    color: Colors.darkGray,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    borderColor: Colors.blue,
    borderWidth: 0.5,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderColor: Colors.lightblue,
  },
  submitBtn: {
    backgroundColor: Colors.blue,
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    elevation: 4,
    marginTop: 10,
  },
  submitText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddEmergencyService;
