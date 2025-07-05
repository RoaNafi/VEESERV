import React, { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../../api'; // Adjust the import based on your project structure
import AsyncStorage from '@react-native-async-storage/async-storage';
import  Colors  from '../../../Components/Colors/Colors';

const EmergencyService = () => {
  const [services, setServices] = useState([]);
  const [workshopId, setWorkshopId] = useState(null);
  const navigation = useNavigation();

  
  useEffect(() => {
    getWorkshopIdAndFetchServices();
  }, []);

  const getWorkshopIdAndFetchServices = async () => {
    try {
        const token = await AsyncStorage.getItem('accessToken');
        console.log("Token received:", token);
        const userId = await AsyncStorage.getItem('userId'); 
        console.log("User ID:", userId);
  
      if (!token) throw new Error("Token not found");

      const response = await api.get('/service/my-workshop', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const id = response.data.workshopId;
      setWorkshopId(id);
      fetchServices(id, token);
        console.log("Workshop ID:", id);
    } catch (error) {
      console.error("⚠️ Failed to get workshop ID:", error);
      Alert.alert('Error', 'Could not load workshop.');
    }
  };
const fetchServices = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await api.get('/emergency/emergency', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("Fetched Emergency Services:", response.data); // 👈 اطبعيهم هون
    setServices(response.data.emergencyServices || []); // ✅ تأكدي تحطي empty array في حال مافي بيانات
  } catch (error) {
    console.error("Error fetching emergency services:", error);
    setServices([]); // 🔒 fallback آمن
  }
};

const handleDeleteService = async (id) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    await api.delete(`/emergency/emergency/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { workshopId }  // <-- أرسلي الـ workshopId زي ما الباك إند بده
    });

    setServices(services.filter(s => s.emergency_service_id !== id)); // اسم العمود الصحيح
    Alert.alert('✅ Deleted', 'Service deleted successfully');
  } catch (error) {
    console.error("❌ Failed to delete service:", error);
    Alert.alert('Error', 'Failed to delete the service');
  }
};


  const confirmDelete = (service) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${service.service_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDeleteService(service.service_id) },
      ]
    );
  };

  const handleAddService = () => {
    navigation.navigate("AddEmergencyService", { workshopId });
  };
  return (
    <View style={styles.container}>
  
      {services.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.noServicesText}>You haven't added any  emergency services yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {services.map(service => (
            <View key={service.service_id} style={styles.card}>

              <View style={styles.info}>
                <Text style={styles.title}>{service.name}</Text>
                <Text style={styles.category}>{service.category}</Text>
                <Text style={styles.description}>{service.description}</Text>
                <View style={styles.bottomRow}>
                  <Text style={styles.price}>${service.price}</Text>
             
                 
                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => confirmDelete(service)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {/* Floating Add Button */}
      <TouchableOpacity onPress={handleAddService} style={styles.fab}>
        <Text style={styles.addBtnText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    scrollContainer: {
      paddingBottom: 100,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: Colors.darkGray,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 0.6,
      borderColor: '#D9E8EF',
    },
    image: {
      width: 70,
      height: 70,
      borderRadius: 12,
      marginRight: 14,
      borderWidth: 1,
      borderColor: Colors.lightGray,
    },
    info: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: Colors.darkGray,
      marginBottom: 4,
    },
    category: {
      fontSize: 13,
      fontWeight: '600',
      color: Colors.lightblue,
      backgroundColor: '#EEF6FF',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      marginBottom: 6,
    },
    description: {
      fontSize: 13,
      color: Colors.mediumGray,
      lineHeight: 18,
      marginBottom: 4,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: Colors.blue,
    },
    deleteBtn: {
      backgroundColor: Colors.red,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      elevation: 2,
    },
    deleteText: {
      color: Colors.white,
      fontWeight: '600',
      fontSize: 14,
    },
    addBtn: {
        backgroundColor: Colors.blue,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      addBtnText: {
        color: Colors.white,
        fontSize: 30,
        marginTop: -2,
      },
      noServicesText: {
        fontSize: 16,
        color: Colors.mediumGray,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
      },
      emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
      },
      emptyImage: {
        width: 160,
        height: 160,
        resizeMode: 'contain',
        marginBottom: 10,
      },
      fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        backgroundColor: Colors.blue,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 100,
      },
      mobileFee: {
        fontSize: 14,
        color: Colors.darkGray,
        marginLeft: 10,
      },
    });


  export default EmergencyService;

