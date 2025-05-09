import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Image } from 'react-native';
import styles from './RoleSelectionStyle';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const UserTypeSelection = ({ isVisible, onClose, onSelectType }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    if (isVisible) {
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleValue, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleSelectType = (role ) => {
    onSelectType(role ); // Call the onSelectType prop (if needed)
    onClose(); // Close the modal
    navigation.navigate('SignUp', { role : role  }); 
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          {/* Logo */}
          {/* <Image
            source={require('../../assets/Logo/LogoVEESERV-Blue.png')}
            style={styles.logo}
          /> */}

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Welcome to VEESERV!</Text>

          {/* Description Text */}
          <Text style={styles.descriptionText}>
            Why you use VEESERV?
          </Text>

          {/* Service Provider Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelectType('Mechanic')}
          >
            <Text style={styles.optionText}>Service Provider</Text>
          </TouchableOpacity>

          {/* Client Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleSelectType('Customer')}
          >
            <Text style={styles.optionText}>Client</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default UserTypeSelection;