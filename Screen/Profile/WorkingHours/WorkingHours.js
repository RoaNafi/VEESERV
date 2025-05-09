import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, Modal, ScrollView } from 'react-native';
import axios from 'axios'; // Import axios for API calls
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from '../../../Components/Colors/Colors';
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Import the modal date-time picker
import moment from 'moment'; // To handle formatting of time
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../../../config'; // For API URL
const { width, height } = Dimensions.get('window');

const WorkingHours = ({ navigation, route }) => {
  const [workingHours, setWorkingHours] = useState({
    Monday: { open: true, startTime: '12:00 AM', endTime: '11:59 PM' },
    Tuesday: { open: true, startTime: '12:00 AM', endTime: '11:59 PM' },
    Wednesday: { open: true, startTime: '12:00 AM', endTime: '11:59 PM' },
    Thursday: { open: true, startTime: '12:00 AM', endTime: '11:59 PM' },
    Friday: { open: true, startTime: '12:00 AM', endTime: '11:59 PM' },
    Saturday: { open: true, startTime: '12:00 AM', endTime: '11:59 PM' },
    Sunday: { open: false, startTime: '12:00 AM', endTime: '11:59 PM' },
  });

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [isFocused, setIsFocused] = useState(false); // Track if input is focused

  const handleFocus = () => {
    setIsFocused(true);  // Set focus to true when the input is clicked
  };

  const handleBlur = () => {
    setIsFocused(false);  // Set focus to false when the input is blurred
  };
  const handleSaveWorkingHours = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
  
      if (!token) {
        Alert.alert('Error', 'No access token found. Please log in again.');
        return;
      }
  
      // 🧠 Convert the object into a string like "Mon-Fri: 9am - 5pm"
      const workingHoursSummary = summarizeWorkingHours(workingHours);
  
      const response = await axios.put(`${config.apiUrl}/profile/mechanic/working-hours`, {
        working_day_hours: workingHoursSummary,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        Alert.alert('Success', 'Working hours updated successfully!');
    
      }
    } catch (error) {
      console.error('Error updating working hours:', error);
      Alert.alert('Error', 'Failed to update working hours.');
    }
  };
  
  const summarizeWorkingHours = (hoursObj) => {
    const days = Object.keys(hoursObj).filter(day => hoursObj[day].open);
  
    if (days.length === 0) return 'Closed';
  
    const firstDay = days[0].slice(0, 3);
    const lastDay = days[days.length - 1].slice(0, 3);
  
    const commonStart = hoursObj[days[0]].startTime;
    const commonEnd = hoursObj[days[0]].endTime;
  
    return `${firstDay}-${lastDay}: ${commonStart} - ${commonEnd}`;
  };
  
  const handleToggleDay = (day) => {
    setWorkingHours(prevState => ({
      ...prevState,
      [day]: { ...prevState[day], open: !prevState[day].open },
    }));
  };

  const handleDatePickerConfirm = (date) => {
    const formattedTime = moment(date).format('hh:mm A');
    if (selectedDay && selectedField) {
      setWorkingHours(prevState => ({
        ...prevState,
        [selectedDay]: {
          ...prevState[selectedDay],
          [selectedField]: formattedTime,
        },
      }));
    }
    setDatePickerVisibility(false); // Hide the date picker
  };

  const renderTimeInput = (day, field) => (
    <TouchableOpacity
      style={[styles.timeInput, !workingHours[day].open && styles.disabledTimeInput]}
      onPress={() => {
        setSelectedDay(day);
        setSelectedField(field);
        setDatePickerVisibility(true); // Show the date picker
      }}
      disabled={!workingHours[day].open}
    >
      <Text style={[styles.timeText, !workingHours[day].open && styles.disabledTimeText]}>
        {workingHours[day][field]}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Working Hours</Text>

      <ScrollView style={styles.scrollContainer}>
        {Object.keys(workingHours).map((day, index) => (
          <View key={day} style={styles.dayContainer}>
            <View style={styles.dayRow}>
              <TouchableOpacity
                style={[styles.checkbox, workingHours[day].open && styles.checkboxChecked]}
                onPress={() => handleToggleDay(day)}
              >
                {workingHours[day].open && <Icon name="check" size={18} color={Colors.white} />}
              </TouchableOpacity>
              <Text style={styles.dayText}>{day}</Text>
            </View>
            <View style={styles.timeRow}>
              {renderTimeInput(day, 'startTime')}
              <Text style={styles.timeSeparator}>to</Text>
              {renderTimeInput(day, 'endTime')}
            </View>
            {index < Object.keys(workingHours).length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleSaveWorkingHours}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      <DateTimePickerModal
  isVisible={isDatePickerVisible}
  mode="time"
  date={new Date()}
  onConfirm={handleDatePickerConfirm}
  onCancel={() => setDatePickerVisibility(false)}
  themeVariant="light" // 👈 force light theme
  pickerContainerStyleIOS={{ backgroundColor: 'white' }} // iOS-specific styling
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: width * 0.05,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: Colors.black,
    marginVertical: height * 0.04,
  },
  scrollContainer: {
    width: '100%',
    marginBottom: height * 0.1,
  },
  dayContainer: {
    width: '100%',
    paddingVertical: height * 0.02,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayText: {
    fontSize: width * 0.045,
    color: Colors.black,
    marginLeft: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.blue,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.blue,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
  },
  timeInput: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.blue,
    borderRadius: 5,
    marginHorizontal: 8,
    width: width * 0.3,
    backgroundColor: Colors.white,
  },
  disabledTimeInput: {
    backgroundColor: Colors.grayLight,
    borderColor: Colors.grayLight,
  },
  timeText: {
    fontSize: width * 0.04,
    color: Colors.blue,
  },
  disabledTimeText: {
    color: Colors.red,
  },
  timeSeparator: {
    fontSize: width * 0.04,
    color: Colors.black,
    marginHorizontal: 10,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
    marginVertical: height * 0.02,
  },
  button: {
    backgroundColor: Colors.blue,
    paddingVertical: height * 0.015,
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: height * 0.02,
  },
  buttonText: {
    color: Colors.white,
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});

export default WorkingHours;
