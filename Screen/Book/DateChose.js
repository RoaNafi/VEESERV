import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const TimeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM',
  '11:00 AM', '12:00 PM', '01:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM',
];

const DateTimePickerScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
const selectedDateOnly = selectedDate.toISOString().split('T')[0];

  const toggleTimeSlot = (slot) => {
    setSelectedSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const onChange = (event, date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowPicker(false);
  };

  const goToNextStep = () => {
    navigation.navigate('AvailableMechanic', {
  date: selectedDateOnly, // مثل "2025-05-13"
      timeSlots: selectedSlots,             // 🔹 الوقت المختار (مثلاً ["02:00 PM"])

});

  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Pick a date</Text>

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{selectedDate.toDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          textColor={Platform.OS === 'ios' ? '#086189' : undefined}
          accentColor={Platform.OS === 'ios' ? '#086189' : undefined}
          themeVariant="light"
        />
      )}

      <Text style={styles.heading}>Pick preferred time slots</Text>

      <FlatList
        data={TimeSlots}
        keyExtractor={(item) => item}
        numColumns={3}
        columnWrapperStyle={styles.timeRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.timeSlot,
              selectedSlots.includes(item) && styles.selectedSlot,
            ]}
            onPress={() => toggleTimeSlot(item)}
          >
            <Text style={selectedSlots.includes(item) ? styles.selectedText : styles.timeText}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[
          styles.nextBtn,
          !(selectedDate && selectedSlots.length) && styles.disabledBtn,
        ]}
        disabled={!(selectedDate && selectedSlots.length)}
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
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#086189',
  },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: '#086189',
    backgroundColor: '#E6F1F4',
    marginBottom: 20,
  },
  dateText: {
    color: '#086189',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeSlot: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginHorizontal: 4,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedSlot: {
    backgroundColor: '#086189',
    borderColor: '#086189',
  },
  timeText: {
    color: '#444',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextBtn: {
    marginTop: 30,
    backgroundColor: '#086189',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#086189',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledBtn: {
    backgroundColor: '#999',
  },
  nextText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
