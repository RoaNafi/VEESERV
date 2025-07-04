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

import api from '../../../api';

const AddService = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workshopId } = route.params;

const [categories, setCategories] = useState([]);
const [categoryOpen, setCategoryOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState(null);

const [serviceOptions, setServiceOptions] = useState([]);
const [serviceOpen, setServiceOpen] = useState(false);
const [selectedService, setSelectedService] = useState(null);

const [description, setDescription] = useState('');
const [price, setPrice] = useState('');
const [estimatedDuration, setEstimatedDuration] = useState('');
const [customServiceName, setCustomServiceName] = useState('');

const [isMobile, setIsMobile] = useState(false);
const [mobileFee, setMobileFee] = useState('');

  useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {
  try {
    const res = await api.get('/ServiceCategories/categories');
    const formatted = res.data.map(cat => ({
      label: cat.category_name,
      value: cat.category_id,
    }));
    setCategories(formatted);
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

// Fetch subcategories dynamically based on selected category
useEffect(() => {
  if (selectedCategory) {
    fetchSubCategories(selectedCategory);
  } else {
    setServiceOptions([]);
  }
}, [selectedCategory]);

const fetchSubCategories = async (categoryId) => {
  try {
    const res = await api.get(`/ServiceCategories/categories/${categoryId}/subcategories`);
    const formatted = res.data.map(sub => ({
      label: sub.subcategory_name,
      value: sub.subcategory_id,
    }));
    setServiceOptions(formatted);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
  }
};

const handleSubmit = async () => {
  console.log('handleSubmit called! Button pressed.');
  console.log('------------------------------------');

  const name = customServiceName || (serviceOptions.find(opt => opt.value === selectedService)?.label ?? '');

  // 1. تحقق من قيم الحقول قبل الإرسال
  console.log('Checking form fields...');
  console.log('name:', name);
  console.log('description:', description);
  console.log('price:', price);
  console.log('subcategory_id (selectedService):', selectedService);
  console.log('selectedCategory (category_id):', selectedCategory);
  console.log('estimatedDuration:', estimatedDuration);
  console.log('workshopId:', workshopId);
  console.log('isMobile:', isMobile);          // تأكد من وجود isMobile في الstate أو props
  console.log('mobileFee:', mobileFee);        // تأكد من وجود mobileFee في الstate أو props

  // Validation مع إضافة isMobile و mobileFee
  if (
    !name ||
    !description ||
    !price ||
    !selectedService ||
    !selectedCategory ||
    !estimatedDuration ||
    (isMobile && (!mobileFee || isNaN(mobileFee))) // لو الخدمة موبايل، لازم يكون في mobileFee صحيح
  ) {
    console.log('Validation failed: Missing or invalid fields.');
    return Alert.alert('⚠️ Missing Fields', 'Please fill all required fields correctly.');
  }
  console.log('Validation passed: All fields are filled.');
  console.log('------------------------------------');

  // 2. سجل البيانات التي سيتم إرسالها بالضبط
  const dataToSend = {
    service_name: name,
    service_description: description,
    category_id: selectedCategory,
    price: parseFloat(price),
    workshop_id: workshopId,
    subcategory_id: selectedService,
    estimated_duration: parseInt(estimatedDuration, 10),
    is_mobile: isMobile || false,                 // افتراضي false لو ما موجود
    mobile_fee: isMobile ? parseInt(mobileFee, 10) : 0,  // لو موبايل حط الفيزا وإلا 0
  };
  console.log('Data to be sent to backend:', dataToSend);
  console.log('------------------------------------');

  try {
    console.log('Attempting to send API request...');
    const res = await api.post('/service/services', dataToSend);

    console.log('API call successful!');
    console.log('Response from backend:', res.data);
    Alert.alert('✅ Success', res.data.message);
    navigation.goBack();
  } catch (err) {
    console.log('API call failed or encountered an error.');
    if (err.response) {
      console.error('Error response from backend:', err.response.data);
      console.error('Error status:', err.response.status);
      console.error('Error headers:', err.response.headers);
      Alert.alert('Error', err.response.data.message || 'Could not create service. Server error.');
    } else if (err.request) {
      console.error('No response received from backend (request made):', err.request);
      Alert.alert('Error', 'Could not connect to the server. Please check your internet connection.');
    } else {
      console.error('Error setting up request:', err.message);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
    Alert.alert('Error', 'Could not create service.');
  }
  console.log('------------------------------------');
};

return (
  <KeyboardAvoidingView
    style={{ flex: 1 ,backgroundColor: Colors.white}}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <View style={{ flex: 1 }}>
     
      <View style={{ paddingHorizontal: 20, paddingTop: 20, zIndex: 1000, backgroundColor: Colors.white }}>
        <Text style={styles.header}>Add New Service</Text>

        <DropDownPicker
          open={categoryOpen}
          value={selectedCategory}
          items={categories}
          setOpen={setCategoryOpen}
          setValue={setSelectedCategory}
          setItems={setCategories}
          placeholder="Select a Category"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
          zIndexInverse={1000}
        />
      </View>

      {/* Service dropdown and custom name input */}
      <View style={{ paddingHorizontal: 20, marginTop: 10, zIndex: 900 }}>
        <DropDownPicker
          open={serviceOpen}
          value={selectedService}
          items={serviceOptions}
          setOpen={setServiceOpen}
          setValue={setSelectedService}
          setItems={setServiceOptions}
          placeholder={
            selectedCategory
              ? serviceOptions.length > 0
                ? 'Choose a Service'
                : 'No services available for this category'
              : 'Select a Category first'
          }
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={2500}
          zIndexInverse={800}
        />
        {/* Show custom service name input if no service is selected */}
        {(!selectedService || serviceOptions.length === 0) && (
          <TextInput
            placeholder="Custom Service Name"
            value={customServiceName}
            onChangeText={setCustomServiceName}
            style={styles.input}
            placeholderTextColor={Colors.mediumGray}
          />
        )}
      </View>

    
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { paddingTop: 20 }]}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 20, zIndex: 4000 }}>
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            placeholderTextColor={Colors.mediumGray}
          />

          <TextInput
            placeholder="Price (e.g., 49.99)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={Colors.mediumGray}
          />

          <TextInput
            placeholder="Estimated Duration (minutes)"
            value={estimatedDuration}
            onChangeText={setEstimatedDuration}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={Colors.mediumGray}
          />
 {/* هنا زر تبديل isMobile */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
      <Text style={{ flex: 1, fontSize: 16, color: '#086189', fontWeight: '600' }}>
        Mobile Service?
      </Text>
      <Switch
        value={isMobile}
        onValueChange={setIsMobile}
        trackColor={{ false: '#ccc', true: '#086189' }}
        thumbColor={isMobile ? '#0b79d0' : '#f4f3f4'}
      />
    </View>

    {/* لو isMobile مفعل، خلي المستخدم يدخل رسوم الموبايل */}
    {isMobile && (
      <TextInput
        placeholder="Mobile Fee (e.g., 20)"
        value={mobileFee}
        onChangeText={setMobileFee}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={Colors.mediumGray}
      />
    )}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Add Service</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
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

export default AddService;
