import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Chip, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from "../../config";

const PRIMARY_COLOR = '#086189';

export default function WorkshopSpecializations() {
  const [currentSpecs, setCurrentSpecs] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllSpecializations = async () => {
      setLoading(true);
      try {
        // Fetch all available specializations
        const res = await axios.get(`${config.apiUrl}/specializations/specializations`);
        const allSpecs = res.data.specializations.map(s => ({
          label: s.name,
          value: s.specialization_id.toString(),
        }));
        setItems(allSpecs);

        // Fetch current specializations for logged-in user's workshop
        const userId = await AsyncStorage.getItem('userId');

        const token = await AsyncStorage.getItem('accessToken');
        if (!token || !userId) {
      console.warn('No token or userId found');
      return;
    }
    console.log('userId:', userId);
        console.log('token:', token);

        const resCurrent = await axios.get(
          `${config.apiUrl}/specializations/workshops/specializations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const currentSpecsFromApi = resCurrent.data.specializations.map(s => ({
          label: s.name,
          value: s.specialization_id.toString(),
        }));

        setCurrentSpecs(currentSpecsFromApi);
      } catch (error) {
        Alert.alert('Error', 'Failed to load specializations');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSpecializations();
  }, []);

  const removeSpec = (value) => {
    setCurrentSpecs(currentSpecs.filter(spec => spec.value !== value));
    // Optionally: send DELETE request to backend here
  };

  const addSelectedSpecs = async () => {
    try {
      setLoading(true);
          const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error('No user ID found');
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('No auth token found');
      console.log('userId11:', userId);

      await axios.post(
        `${config.apiUrl}/specializations/workshops/specializations`,
        {
          specialization_ids: selectedSpecs.map(Number),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const addedSpecs = selectedSpecs
        .map(sel => items.find(i => i.value === sel))
        .filter(Boolean);

      setCurrentSpecs(prev => [...prev, ...addedSpecs]);
      setSelectedSpecs([]);
      setOpen(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add specializations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Manage Your Specializations</Text>

      <Text style={styles.subTitle}>Current Specializations:</Text>
      <View style={styles.chipContainer}>
        {loading && <Text>Loading...</Text>}
        {!loading && currentSpecs.length === 0 && (
          <Text style={{ color: '#999' }}>No specializations selected yet.</Text>
        )}
        {currentSpecs.map(spec => (
          <Chip
            key={spec.value}
            onClose={() => removeSpec(spec.value)}
            style={styles.chip}
            textStyle={{ color: PRIMARY_COLOR }}
            closeIcon="close"
            closeIconColor={PRIMARY_COLOR}
          >
            {spec.label}
          </Chip>
        ))}
      </View>

      <Text style={styles.subTitle}>Add Specialization:</Text>

      <DropDownPicker
        multiple={true}
        min={0}
        max={10}
        searchable={true}
        placeholder="Select specializations..."
        open={open}
        value={selectedSpecs}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedSpecs}
        setItems={setItems}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        listMode="MODAL"
        modalProps={{
          animationType: 'slide',
        }}
        modalTitle="Select Specializations"
        modalAnimationType="slide"
      />

     <Button
  mode="contained"
  onPress={addSelectedSpecs}
  disabled={selectedSpecs.length === 0 || loading}
  style={styles.addButton}
  contentStyle={{ paddingVertical: 8 }}
  labelStyle={{ color: '#fff' }} // 👈 white font
>
  Add
</Button>
      <Text style={{ color: '#999', marginTop: 10 }}>
        * You can select multiple specializations.
      </Text> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#E3F1FA',
    marginRight: 8,
    marginBottom: 8,
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
  },
  dropdown: {
    borderColor: PRIMARY_COLOR,
  },
  dropdownContainer: {
    borderColor: PRIMARY_COLOR,
  },
  addButton: {
    marginTop: 15,
    backgroundColor: PRIMARY_COLOR,
  },
});
