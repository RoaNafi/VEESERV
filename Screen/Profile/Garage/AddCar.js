import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import { config } from '../../../config'; // for API URL
const AddCarScreen = ({ navigation, route }) => {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [transmissions, setTransmissions] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);

  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [isDefault, setIsDefault] = useState(false);
const [carCount, setCarCount] = useState('1');

  const fromBooking = route.params?.fromBooking;

  // Fetch lists
  useEffect(() => { fetchMakes(); }, []);
  useEffect(() => { carMake && fetchModels(carMake); }, [carMake]);
  useEffect(() => { carMake && carModel && fetchYears(carMake, carModel); }, [carModel]);
  useEffect(() => {
    if (carMake && carModel && carYear) {
      fetchTransmissions(carMake, carModel, carYear);
      fetchFuelTypes(carMake, carModel, carYear);
    }
  }, [carYear]);

  const fetchMakes = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/makes`);
      setMakes(res.data.map(m => ({ label: m.make, value: m.make })));
    } catch (e) { console.error(e); }
  };

  const fetchModels = async make => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/models?make=${make}`);
      setModels(res.data.map(m => ({ label: m.model, value: m.model })));
    } catch (e) { console.error(e); }
  };

  const fetchYears = async (make, model) => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/years?make=${make}&model=${model}`);
      setYears(res.data.map(y => ({ label: String(y.year), value: y.year })));
    } catch (e) { console.error(e); }
  };

  const fetchTransmissions = async (make, model, year) => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/transmissions?make=${make}&model=${model}&year=${year}`);
      setTransmissions(res.data.map(t => ({ label: t.transmission, value: t.transmission })));
    } catch (e) { console.error(e); }
  };

  const fetchFuelTypes = async (make, model, year) => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/fuel-types?make=${make}&model=${model}&year=${year}`);
      setFuelTypes(res.data.map(f => ({ label: f.fuel_type, value: f.fuel_type })));
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async () => {
    if (!carMake || !carModel || !carYear || !transmission || !fuelType) {
      return Alert.alert('Error', 'Please fill in all fields.');
    }
    const token = await AsyncStorage.getItem('accessToken');
    const carData = {
      make: carMake,
      model: carModel,
      year: carYear,
      transmission: transmission === 'automatic' ? 'a' : 'm',
      fuel_type: fuelType,
      isDefault,
      quantity: Number(carCount),
    };

    try {
      await axios.post(`${config.apiUrl}/api/vehicles`, carData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Vehicle added!', [
        {
          text: 'OK',
          onPress: () => {
            if (route.params?.fromBooking) {
              // If coming from booking, go back to BookSummary
              navigation.goBack();
            } else {
              // Otherwise, go back to Garage
              navigation.goBack();
            }
          }
        }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add car');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add a New Car</Text>

      <Text style={styles.label}>Make</Text>
      <Dropdown
        style={styles.dropdown}
        data={makes}
        labelField="label"
        valueField="value"
        placeholder="Select Make"
        value={carMake}
        onChange={item => {
          setCarMake(item.value);
          setCarModel(''); // reset downstream
        }}
      />

      <Text style={styles.label}>Model</Text>
      <Dropdown
        style={styles.dropdown}
        data={models}
        labelField="label"
        valueField="value"
        placeholder="Select Model"
        value={carModel}
        onChange={item => {
          setCarModel(item.value);
          setCarYear('');
        }}
      />

      <Text style={styles.label}>Year</Text>
      <Dropdown
        style={styles.dropdown}
        data={years}
        labelField="label"
        valueField="value"
        placeholder="Select Year"
        value={carYear}
        onChange={item => {
          setCarYear(item.value);
        }}
      />

      <Text style={styles.label}>Transmission</Text>
      <Dropdown
        style={styles.dropdown}
        data={transmissions}
        labelField="label"
        valueField="value"
        placeholder="Select Transmission"
        value={transmission}
        onChange={item => setTransmission(item.value)}
      />

      <Text style={styles.label}>Fuel Type</Text>
      <Dropdown
        style={styles.dropdown}
        data={fuelTypes}
        labelField="label"
        valueField="value"
        placeholder="Select Fuel Type"
        value={fuelType}
        onChange={item => setFuelType(item.value)}
      />
<View style={{marginTop: 20}}>
  <Text style={{color: 'black'}}>Number of Cars</Text>
  <TextInput
    style={{
      borderWidth: 1,
      borderColor: 'gray',
      padding: 8,
      marginTop: 4,
      backgroundColor: 'white',
      color: 'black',
      borderRadius: 4,
    }}
    value={carCount}
    onChangeText={setCarCount}
    keyboardType="numeric"
  />
</View>

      <TouchableOpacity
        style={[styles.defaultButton, isDefault && styles.activeDefault]}
        onPress={() => setIsDefault(prev => !prev)}
      >
        <Text style={styles.defaultText}>
          {isDefault ? '✔ Default Car' : 'Set as Default'}
        </Text>
      </TouchableOpacity>
     
    



      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Add Car</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#086189',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
  },
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  defaultButton: {
    marginVertical: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  activeDefault: {
    borderColor: '#086189',
    backgroundColor: '#e6f5f9',
  },
  defaultText: {
    color: '#086189',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#086189',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  marginBottom: 15,
}

});

export default AddCarScreen;
