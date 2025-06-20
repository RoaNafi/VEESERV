import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Colors from "../../Components/Colors/Colors";

const TimeSlots = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
];

const DateTimePickerScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null); // can be string like "10:00 AM" or time string from picker
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [disabledSlots, setDisabledSlots] = useState([]); // Add this state for disabled slots

  // Format date as YYYY-MM-DD
  const selectedDateOnly =
    selectedDate.getFullYear() +
    "-" +
    String(selectedDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(selectedDate.getDate()).padStart(2, "0");

  // Function to check if a time slot is valid
  const isTimeSlotValid = (timeStr) => {
    const now = new Date();
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    
    // Convert to 24-hour format
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    // Create date object for the selected time
    const slotTime = new Date(selectedDate);
    slotTime.setHours(hours, minutes, 0, 0);

    // If selected date is today, check if time is in the future
    if (selectedDate.toDateString() === now.toDateString()) {
      // Add 30 minutes buffer to current time to allow for booking
      const bufferTime = new Date(now.getTime() + 30 * 60000);
      return slotTime > bufferTime;
    }

    return true;
  };

  // Update disabled slots whenever date changes
  useEffect(() => {
    const invalidSlots = TimeSlots.filter(slot => !isTimeSlotValid(slot));
    setDisabledSlots(invalidSlots);
  }, [selectedDate]);

  const toggleTimeSlot = (slot) => {
    if (disabledSlots.includes(slot)) return;
    if (!isTimeSlotValid(slot)) return;
    setSelectedSlot((prev) => (prev === slot ? null : slot));
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  // When user picks time from modal, format it nicely and save as selected slot
  const handleTimeConfirm = (time) => {
    const formattedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    // Create a new date object for comparison
    const selectedTime = new Date(selectedDate);
    selectedTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 30 * 60000);

    if (selectedDate.toDateString() === now.toDateString()) {
      if (selectedTime > bufferTime) {
        setSelectedSlot(formattedTime);
      } else {
        Alert.alert("Invalid Time", "Please select a time at least 30 minutes in the future.");
      }
    } else {
      setSelectedSlot(formattedTime);
    }
    hideTimePicker();
  };

  const handleConfirm = (date) => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const goToNextStep = () => {
   navigation.navigate("AvailableMechanic", {
  date: selectedDateOnly,
  timeSlots: selectedSlot ? [selectedSlot] : [], // always an array
});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pick a date</Text>

      <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerVisibility(true)}>
        <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        date={selectedDate}
        themeVariant="light"
      />

      <Text style={styles.heading}>Pick preferred time</Text>

      <TouchableOpacity style={styles.dateBtn} onPress={showTimePicker}>
        <Text style={styles.dateText}>{selectedSlot ?? "Select Time"}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={hideTimePicker}
        date={selectedDate}
        themeVariant="light"
      />

      <Text style={[styles.heading, { marginTop: 20 }]}>Or pick from quick slots</Text>

      <FlatList
        data={TimeSlots}
        keyExtractor={(item) => item}
        numColumns={3}
        columnWrapperStyle={styles.timeRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.timeSlot,
              selectedSlot === item && styles.selectedSlot,
              disabledSlots.includes(item) && styles.disabledSlot
            ]}
            onPress={() => toggleTimeSlot(item)}
            disabled={disabledSlots.includes(item)}
          >
            <Text style={[
              selectedSlot === item ? styles.selectedText : styles.timeText,
              disabledSlots.includes(item) && styles.disabledText
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.noteText}>
        Don't worry! You can change the date and time before confirming your booking. This is just to help us find available workshops.
      </Text>

      <TouchableOpacity
        style={[styles.nextBtn, !(selectedDate && selectedSlot) && styles.disabledBtn]}
        disabled={!(selectedDate && selectedSlot)}
        onPress={goToNextStep}
      >
        <Text style={styles.nextText}>Next Step →</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DateTimePickerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#086189",
  },
  dateBtn: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 15,
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: "#086189",
    backgroundColor: "#E6F1F4",
    marginBottom: 10,
  },
  dateText: {
    color: "#086189",
    fontWeight: "bold",
    fontSize: 16,
  },
  timeRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginHorizontal: 4,
    minWidth: 90,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedSlot: {
    backgroundColor: "#086189",
    borderColor: "#086189",
  },
  timeText: {
    color: "#444",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  nextBtn: {
    marginTop: 30,
    backgroundColor: "#086189",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#086189",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledBtn: {
    backgroundColor: "#999",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledSlot: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
});
