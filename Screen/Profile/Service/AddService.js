import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import api from '../../../api';

const AddService = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workshopId } = route.params;

  const [serviceOptions, setServiceOptions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [serviceOpen, setServiceOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [customServiceName, setCustomServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);
  
  const fetchServices = async () => {
    try {
      const res = await api.get('/ServiceCategories/services');
      const formatted = res.data.map(item => ({
        label: item.subcategory_name,
        value: item.subcategory_name,
        category_id: item.category_id,  // Make sure backend includes this
      }));
      setServiceOptions(formatted);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };
  
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
  
  // Automatically set the category when a known service is selected
  useEffect(() => {
    if (selectedService) {
      const match = serviceOptions.find(item => item.value === selectedService);
      if (match) {
        setSelectedCategory(match.category_id);
      }
    }
  }, [selectedService]);
  
  const handleSubmit = async () => {
    const name = selectedService || customServiceName;
  
    if (!name || !description || !price || !selectedCategory) {
      return Alert.alert('⚠️ Missing Fields', 'Please fill all fields.');
    }
  
    let subcategoryName = name;
  
    // If a custom name is used, attempt to add it to the SubCategories
    if (!selectedService) {
      try {
        const addRes = await api.post('/ServiceCategories/add-service', {
          subcategory_name: subcategoryName,
          category_id: selectedCategory,
        });
        console.log('New subcategory added:', addRes.data);
      } catch (error) {
        console.error('Failed to create new subcategory:', error);
        return Alert.alert('Error', 'Could not add new service name.');
      }
    }
  
    // Add the actual service entry to the workshop
    try {
      const res = await api.post('/service/services', {
        service_name: subcategoryName,
        service_description: description,
        category_id: selectedCategory,
        price: parseFloat(price),
        workshop_id: workshopId,
      });
  
      Alert.alert('✅ Success', res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error('Error submitting service:', err);
      Alert.alert('Error', 'Could not create service.');
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add New Service</Text>

        <DropDownPicker
          open={serviceOpen}
          value={selectedService}
          items={serviceOptions}
          setOpen={setServiceOpen}
          setValue={setSelectedService}
          setItems={setServiceOptions}
          placeholder="Choose an Existing Service"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
        />

        <Text style={styles.or}>or</Text>

        <TextInput
          placeholder="Write New Service Name"
          value={customServiceName}
          onChangeText={setCustomServiceName}
          style={styles.input}
          placeholderTextColor={Colors.mediumGray}
        />

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
          zIndex={2000}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Add Service</Text>
        </TouchableOpacity>
      </ScrollView>
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
    color: Colors.darkGray,
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
    borderWidth: 1,
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
