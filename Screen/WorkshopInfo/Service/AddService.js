import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
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
  const name = selectedService || customServiceName;

  if (!name || !description || !price || !subcategory_id || !selectedCategory || !estimatedDuration) {
    return Alert.alert('⚠️ Missing Fields', 'Please fill all fields.');
  }

  try {
    const res = await api.post('/service/services', {
      service_name: name,
      service_description: description,
      category_id: selectedCategory,
      price: parseFloat(price),
      workshop_id: workshopId,
      subcategory_id: selectedService,
      estimated_duration: parseInt(estimatedDuration, 10),
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
    style={{ flex: 1 ,backgroundColor: Colors.white}}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    {/* استخدمي View عامة للكل مع زبط ترتيب العناصر */}
    <View style={{ flex: 1 }}>
      {/* الـ Dropdowns برا الـ ScrollView، ولازم تعطيهم padding ومارجن كويسين */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, zIndex: 3000,  backgroundColor: Colors.white }}>
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

      <View style={{ paddingHorizontal: 20, marginTop: 10, zIndex: 2000 }}>
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
          zIndex={2000}
          zIndexInverse={900}
        />
      </View>

      {/* باقي الفورم */}
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { paddingTop: 20 }]}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 20 }}>
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
