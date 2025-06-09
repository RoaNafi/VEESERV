import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated } from 'react-native';
import Colors from '../../../Components/Colors/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const defaultSortOptions = [
  { id: 'price', label: 'Price', icon: 'pricetag' },
  { id: 'rating', label: 'Rating', icon: 'star' },
  { id: 'distance', label: 'Distance', icon: 'location' }
];

const Sort = ({
  visible,
  setVisible,
  applySort,
  setSelectedSortOption,
  selectedSortOption,
  sortOptions 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [selectedCategory, setSelectedCategory] = useState(null);

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
      setSelectedCategory(null);
    });
  };

  useEffect(() => {
    if (visible) {
      animateIn();
      // Reset selections when modal opens
      setSelectedCategory(null);
      setSelectedSortOption(null);
    }
  }, [visible]);

  const handleClose = () => {
    animateOut();
  };

  const handleSort = (category, direction) => {
    const option = `${category}_${direction}`;
    setSelectedSortOption(option);
    applySort();
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.header}>
                <Text style={styles.title}>Sort</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>
              <View style={styles.headerDivider} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sort by</Text>
                <View style={styles.optionsContainer}>
                  {(sortOptions || defaultSortOptions).map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.option,
                        selectedCategory === option.id && styles.selectedOption,
                      ]}
                      onPress={() => setSelectedCategory(option.id)}
                    >
                      <View style={styles.optionContent}>
                        <Ionicons 
                          name={option.icon} 
                          size={20} 
                          color={selectedCategory === option.id ? Colors.primary : Colors.darkGray} 
                          style={styles.optionIcon}
                        />
                        <Text style={[
                          styles.optionText,
                          selectedCategory === option.id && styles.selectedOptionText
                        ]}>
                          {option.label}
                        </Text>
                      </View>
                      {selectedCategory === option.id && (
                        <Ionicons name="checkmark" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order</Text>
                <View style={styles.orderRow}>
                  <TouchableOpacity
                    style={[
                      styles.orderOption,
                      selectedSortOption?.endsWith('_high') && styles.selectedOption,
                    ]}
                    onPress={() => selectedCategory && handleSort(selectedCategory, 'high')}
                    disabled={!selectedCategory}
                  >
                    <View style={styles.optionContent}>
                      <Ionicons 
                        name="arrow-down" 
                        size={20} 
                        color={selectedSortOption?.endsWith('_high') ? Colors.primary : Colors.darkGray} 
                        style={styles.optionIcon}
                      />
                      <Text style={[
                        styles.optionText,
                        selectedSortOption?.endsWith('_high') && styles.selectedOptionText,
                        !selectedCategory && styles.disabledText
                      ]}>
                        Descending
                      </Text>
                    </View>
                    {selectedSortOption?.endsWith('_high') && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.orderOption,
                      selectedSortOption?.endsWith('_low') && styles.selectedOption,
                    ]}
                    onPress={() => selectedCategory && handleSort(selectedCategory, 'low')}
                    disabled={!selectedCategory}
                  >
                    <View style={styles.optionContent}>
                      <Ionicons 
                        name="arrow-up" 
                        size={20} 
                        color={selectedSortOption?.endsWith('_low') ? Colors.primary : Colors.darkGray} 
                        style={styles.optionIcon}
                      />
                      <Text style={[
                        styles.optionText,
                        selectedSortOption?.endsWith('_low') && styles.selectedOptionText,
                        !selectedCategory && styles.disabledText
                      ]}>
                        Ascending
                      </Text>
                    </View>
                    {selectedSortOption?.endsWith('_low') && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
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
    paddingBottom: 50,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 45,
  },
  selectedOption: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionText: {
    color: Colors.darkGray,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  disabledText: {
    opacity: 0.5,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 45,
  },
});

export default Sort;
