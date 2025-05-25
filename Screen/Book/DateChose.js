import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

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

  // Format date as YYYY-MM-DD
  const selectedDateOnly =
    selectedDate.getFullYear() +
    "-" +
    String(selectedDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(selectedDate.getDate()).padStart(2, "0");

  const toggleTimeSlot = (slot) => {
    setSelectedSlot((prev) => (prev === slot ? null : slot)); // toggle single slot
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  // When user picks time from modal, format it nicely and save as selected slot
  const handleTimeConfirm = (time) => {
    // Format time to "hh:mm AM/PM"
    const formattedTime = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSelectedSlot(formattedTime);
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
            style={[styles.timeSlot, selectedSlot === item && styles.selectedSlot]}
            onPress={() => toggleTimeSlot(item)}
          >
            <Text style={selectedSlot === item ? styles.selectedText : styles.timeText}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

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
    backgroundColor: "#fff",
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
});
