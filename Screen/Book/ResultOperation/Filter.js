import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, TouchableWithoutFeedback, StyleSheet, Animated } from 'react-native';
import Colors from '../../../Components/Colors/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Filter = ({
  visible,
  setVisible,
  applyFilters,
  resetFilters,
  selectedRating,
  selectedDistance,
  setSelectedRating,
  setSelectedDistance,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [tempRating, setTempRating] = useState(selectedRating);
  const [tempDistance, setTempDistance] = useState(selectedDistance);

  useEffect(() => {
    if (visible) {
      setTempRating(selectedRating);
      setTempDistance(selectedDistance);
    }
  }, [visible]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible]);

  const handleClose = () => {
    animateOut();
  };

  const handleApply = () => {
    setSelectedRating(tempRating);
    setSelectedDistance(tempDistance);
    applyFilters();
    handleClose();
  };

  const handleReset = () => {
    setTempRating(null);
    setTempDistance(null);
    resetFilters();
    handleClose();
  };

  const FilterChip = ({ label, selected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.selectedChip,
      ]}
    >
      <Text style={[
        styles.chipText,
        selected && styles.selectedChipText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.header}>
                <Text style={styles.title}>Filter Options</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>
              <View style={styles.headerDivider} />

              <View style={styles.section}>
                <Text style={styles.label}>Minimum Rating</Text>
                <View style={styles.chipsContainer}>
                  {[1, 2, 3, 4, 5].map((rate) => (
                    <FilterChip
                      key={`rating-${rate}`}
                      label={`${rate}★`}
                      selected={tempRating === rate}
                      onPress={() => setTempRating(tempRating === rate ? null : rate)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Within Distance (km)</Text>
                <View style={styles.chipsContainer}>
                  {[2, 5, 10, 20].map((dist) => (
                    <FilterChip
                      key={`dist-${dist}`}
                      label={`${dist} km`}
                      selected={tempDistance === dist}
                      onPress={() => setTempDistance(tempDistance === dist ? null : dist)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.resetButton} 
                  onPress={handleReset}
                >
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton} 
                  onPress={handleApply}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  closeButton: {
    padding: 5,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.darkGray,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedChip: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
    color: Colors.darkGray,
  },
  selectedChipText: {
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 0.6,
    backgroundColor: Colors.lightGray,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1.4,
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetText: {
    color: Colors.red,
    fontSize: 16,
    fontWeight: '600',
  },
  applyText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Filter;
