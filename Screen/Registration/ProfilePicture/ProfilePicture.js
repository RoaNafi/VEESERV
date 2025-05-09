
// we dont use this file anymore....



import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../Components/Colors/Colors'; // Ensure this path is correct
import Modal from 'react-native-modal'; // Import the modal library

const { width, height } = Dimensions.get('window');

const ProfilePicture = ({ navigation, route }) => {
  const [profilePicture, setProfilePicture] = useState(null); 
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const { role } = route.params; // Route parameters for the user role to use in conditional rendering 

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, 
      aspect: [1, 1],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use the correct format
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleUploadPhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant photo library permissions to upload a photo.');
        return;
      }

      // Launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use the correct format
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      console.log('ImagePicker Result:', result); // Debugging: Log the result

      // Check if the operation was canceled
      if (result.canceled) {
        console.log('User canceled image selection');
        return;
      }

      // Check if assets are available
      if (!result.assets || result.assets.length === 0) {
        console.log('No assets found in the result');
        return;
      }

      // Set the profile picture
      const selectedImage = result.assets[0];
      setProfilePicture(selectedImage.uri);
      console.log('Selected Image URI:', selectedImage.uri); // Debugging: Log the selected image URI
    } catch (error) {
      console.error('Error uploading photo:', error); // Debugging: Log any errors
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    }
  };

  const handleSaveImage = () => {
    if (role === 'Mechanic') {
      setIsModalVisible(true); // Show the custom modal
    } else {
      // to open new session for user 
      navigateToLogin();
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login', { role });
  };

  

  const handleDeleteImage = () => {
    setProfilePicture(null); // Revert to the default image
  };

  return (
    <View style={styles.container}>
      {/* Skip Button at Top Right Corner (only visible when no image is selected) */}
      {!profilePicture && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSaveImage}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Set Your Profile Picture</Text>
        <View style={styles.profileContainer}>
          <Image
            // source={profilePicture ? { uri: profilePicture } : require('../../assets/Icones/user_profile.png')}
            style={styles.profileImage}
            resizeMode="cover" // Ensure the image fits properly
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUploadPhoto}>
          <Text style={styles.buttonText}>Upload from Library</Text>
        </TouchableOpacity>

        {/* Container for Delete and Save Buttons (only visible when an image is selected) */}
        {profilePicture && (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteImage}>
              <Text style={styles.deleteButtonText}>Delete Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveImageButton} onPress={handleSaveImage}>
              <Text style={styles.saveImageButtonText}>Save Image</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Custom Modal for Pending Approval */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Account Pending Approval</Text>
          <Text style={styles.modalText}>
            Thank you for signing up! Your account is currently under review.{' '}
            <Text style={styles.boldOrangeText}>wait for an email from us</Text> to confirm your account and join our community.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setIsModalVisible(false); // Hide the modal
              navigateToLogin(); // Navigate to the Login screen
              
            }}
          >
            <Text style={styles.modalButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: width * 0.1,
    marginTop: height * 0.2,
    alignItems: 'center',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: height * 0.03,
  },
  profileContainer: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: Colors.grayLight,
    marginBottom: height * 0.06,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android
    borderWidth: 3, // Added border
    borderColor: Colors.blue, // Border color
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: Colors.blue,
    width: '90%',
    paddingVertical: height * 0.015,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: height * 0.02,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android
  },
  buttonText: {
    color: Colors.white,
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  skipButton: {
    position: 'absolute',
    top: height * 0.07,
    right: width * 0.07,
  },
  skipButtonText: {
    fontSize: width * 0.04,
    color: Colors.blue,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row', // Align buttons horizontally
    justifyContent: 'space-between', // Add space between buttons
    width: '88%', // Match the width of other buttons
    marginTop: height * 0.02,
  },
  saveImageButton: {
    width: '48%', // Slightly less than half to account for spacing
    paddingVertical: height * 0.01,
    borderColor: Colors.green, // Green border color
    borderWidth: 1.3, // Add border width
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'transparent', // Make background transparent
  },
  saveImageButtonText: {
    color: Colors.green, // Change text color to green
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: '48%', // Slightly less than half to account for spacing
    paddingVertical: height * 0.01,
    borderColor: Colors.red, // Red border color
    borderWidth: 1.3, // Add border width
    borderRadius: 50,
    alignItems: 'center',
    backgroundColor: 'transparent', // Make background transparent
  },
  deleteButtonText: {
    color: Colors.red, // Change text color to red
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: height * 0.02,
  },
  modalText: {
    fontSize: width * 0.04,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  boldOrangeText: {
    fontWeight: 'bold',
    color: Colors.orange,
  },
  modalButton: {
    backgroundColor: Colors.blue,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.1,
    borderRadius: 50,
    alignItems: 'center',
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
});

export default ProfilePicture;