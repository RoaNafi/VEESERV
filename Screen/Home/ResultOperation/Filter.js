import React from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Colors from '../../../Components/Colors/Colors';




const Filter = ({
  visible,
  setVisible,
  applyFilters,
  resetFilters,
  selectedRating,
  selectedDistance,
  mobileServiceOnly,
  setSelectedRating,
  setSelectedDistance,
  setMobileServiceOnly
}) => {
  const FilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? Colors.blue : Colors.lightGray },
      ]}
    >
      <Text style={{ color: selected ? '#fff' : '#333', fontWeight: '500' }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Filter Options</Text>

              <Text style={styles.label}>Minimum Rating</Text>
              <View style={styles.chipsContainer}>
                {[1, 2, 3, 4, 5].map((rate) => (
                  <FilterChip
                    key={`rating-${rate}`}
                    label={`${rate}★`}
                    selected={selectedRating === rate}
                    onPress={() => setSelectedRating(selectedRating === rate ? null : rate)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Within Distance (km)</Text>
              <View style={styles.chipsContainer}>
                {[2, 5, 10, 20].map((dist) => (
                  <FilterChip
                    key={`dist-${dist}`}
                    label={`${dist} km`}
                    selected={selectedDistance === dist}
                    onPress={() => setSelectedDistance(selectedDistance === dist ? null : dist)}
                  />
                ))}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Mobile Service Only</Text>
                <Switch value={mobileServiceOnly} onValueChange={setMobileServiceOnly} />
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.darkGray,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 70,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  applyButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  applyText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  resetText: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Filter;
