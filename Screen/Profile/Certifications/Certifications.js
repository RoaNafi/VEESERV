import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert, FlatList, Modal, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api'; // هذا اللي لازم تستعمليه
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';

const Certifications = () => {
    const [certifications, setCertifications] = useState([]);
    const [workshopId, setWorkshopId] = useState(null);
    const [showAddCertificationModal, setShowAddCertificationModal] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [newCertification, setNewCertification] = useState({
        certification_name: '',
        issued_by: '',
        issue_date: '',
        expiry_date: '',
        document_url: '',
    });
    const [selectedDateField, setSelectedDateField] = useState(null);
    
    // Fetch certifications and workshopId
    useEffect(() => {
        getWorkshopIdAndFetchServices();
    }, []);

    const getWorkshopIdAndFetchServices = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            if (!token) throw new Error("Token not found");

            const response = await api.get('/service/my-workshop', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const id = response.data.workshopId;
            setWorkshopId(id);

            // Fetch certifications
            fetchCertifications(id, token);
        } catch (error) {
            console.error("⚠️ Failed to get workshop ID:", error);
            Alert.alert('Error', 'Could not load workshop.');
        }
    };

    // Fetch certifications for the workshop
    const fetchCertifications = async (workshopId, token) => {
        try {
            const response = await api.get(`/certification/certifications/by-workshop/${workshopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCertifications(response.data);
        } catch (error) {
            console.error("Error fetching certifications:", error);
            Alert.alert('Error', 'Failed to fetch certifications.');
        }
    };

    const handleConfirmDate = (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        setNewCertification((prev) => ({
          ...prev,
          [selectedDateField]: formattedDate,
        }));
        setDatePickerVisibility(false);
      };
      
    const addCertification = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const { certification_name, issued_by, issue_date, expiry_date, document_url } = newCertification;
    
    const requestData = {
      workshop_id: workshopId,
      name: certification_name,
      issuing_authority: issued_by,
      issue_date: issue_date,
      valid_until: expiry_date,
      document_url
    };

    const response = await api.post('/certification/certifications', requestData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.status === 201) {
      setCertifications(prevCertifications => [...prevCertifications, response.data]);
      setShowAddCertificationModal(false);
      setNewCertification({
        certification_name: '',
        issued_by: '',
        issue_date: '',
        expiry_date: '',
        document_url: '',
      });
    }
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error("Error response:", error.response.data);
      Alert.alert('Error', `Failed to add certification: ${error.response.data.error}`);
    } else if (error.request) {
      // No response from server
      console.error("Error request:", error.request);
      Alert.alert('Error', 'Network error, please try again later.');
    } else {
      // Other errors
      console.error("Error message:", error.message);
      Alert.alert('Error', `Something went wrong: ${error.message}`);
    }
  }
};

    const confirmCancel = () => {
        Alert.alert(
            "Confirm Cancel",
            "Are you sure you want to cancel without saving?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => setShowAddCertificationModal(false) }
            ]
        );
    };
  const showDatePicker = () => {
  console.log("Date Picker should be visible now");
  setDatePickerVisibility(true);
};

    

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Workshop Certifications</Text>
    
          {certifications.length > 0 ? (
            <FlatList
              data={certifications}
              keyExtractor={(item) => item.certification_id.toString()}
              renderItem={({ item }) => (
                <View style={styles.certificationCard}>
                 <Text style={styles.certificationText}>{item.name}</Text>
<Text style={styles.certificationText}>{item.issuing_authority}</Text>
<Text style={styles.certificationText}>Issue Date: {item.issue_date}</Text>
<Text style={styles.certificationText}>Expiry Date: {item.valid_until}</Text>
                  <TouchableOpacity style={styles.deleteButton}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          ) : (
            <Text>No certifications yet. You can add one below.</Text>
          )}
    
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddCertificationModal(true)}
          >
            <Text style={styles.buttonText}>Add Certification</Text>
          </TouchableOpacity>
    
          {/* Modal */}
          <Modal
            visible={showAddCertificationModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddCertificationModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Add New Certification</Text>
    
                <Text style={styles.inputLabel}>Certification Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Certification Name"
                  value={newCertification.certification_name}
                  onChangeText={(text) =>
                    setNewCertification({ ...newCertification, certification_name: text })
                  }
                />
    
                <Text style={styles.inputLabel}>Issued By</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Issuing Authority"
                  value={newCertification.issued_by}
                  onChangeText={(text) =>
                    setNewCertification({ ...newCertification, issued_by: text })
                  }
                />
    
                <Text style={styles.inputLabel}>Issue Date</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dateField]}
                  onPress={() => {
                    setSelectedDateField('issue_date');
                    setDatePickerVisibility(true);
                  }}
                >
                  <Text style={{ color: newCertification.issue_date ? '#000' : '#aaa' }}>
                    {newCertification.issue_date || 'Enter Issue Date'}
                  </Text>
                </TouchableOpacity>
    
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TouchableOpacity
                  style={[styles.input, styles.dateField]}
                  onPress={() => {
                    setSelectedDateField('expiry_date');
                    setDatePickerVisibility(true);
                  }}
                >
                  <Text style={{ color: newCertification.expiry_date ? '#000' : '#aaa' }}>
                    {newCertification.expiry_date || 'Enter Expiry Date'}
                  </Text>
                </TouchableOpacity>
    
                <Text style={styles.inputLabel}>Document URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Document URL"
                  value={newCertification.document_url}
                  onChangeText={(text) =>
                    setNewCertification({ ...newCertification, document_url: text })
                  }
                />
    
                <TouchableOpacity style={styles.saveButton} onPress={addCertification}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={confirmCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
    
          {/* ✅ Render Date Picker OUTSIDE modal */}
          <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={() => setDatePickerVisibility(false)}
                // Add these properties to fix the text color issue
                textColor="#000000" // Black text for iOS
                isDarkModeEnabled={false}
                themeVariant="light" // Light theme for iOS
                // For Android, include theme styling
                androidPickerMode="spinner" // or 'calendar' or 'default'
                buttonTextColorIOS="#086189" // Blue for the confirm/cancel buttons on iOS
                pickerContainerStyleIOS={{backgroundColor: 'white'}} // White background on iOS
            />
        </View>
      );
    };
    
    
    const styles = StyleSheet.create({
      container: { flex: 1, padding: 20 },
      title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#086189' },
      certificationCard: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        marginBottom: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      certificationText: { fontSize: 16, color: '#333' },
      addButton: {
        padding: 10,
        backgroundColor: '#086189',
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
      },
      buttonText: { color: 'white', fontSize: 16 },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        width: '85%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
      },
      modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
      inputLabel: { fontSize: 14, marginBottom: 5, color: '#086189' },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 10,
        borderRadius: 5,
      },
      dateField: {
        height: 50,
        justifyContent: 'center',
      },
      saveButton: {
        padding: 10,
        backgroundColor: '#086189',
        borderRadius: 5,
        alignItems: 'center',
      },
      closeButton: {
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
      },
      deleteButton: {
        marginTop: 10,
        padding: 5,
        backgroundColor: '#ff4d4d',
        borderRadius: 5,
        alignItems: 'center',
      },
    });
export default Certifications;
