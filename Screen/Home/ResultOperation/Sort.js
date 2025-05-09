import React from 'react';
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Colors from '../../../Components/Colors/Colors';

const Sort = ({
  visible,
  setVisible,
  applySort,
  setSelectedSortOption
}) => {
  const handleSort = (option) => {
    setSelectedSortOption(option);
    applySort(option);
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setVisible(false)}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Sort by</Text>

              <TouchableOpacity style={styles.option} onPress={() => handleSort('lowPrice')}>
                <Text style={styles.optionText}>Price: Low to High</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={() => handleSort('highPrice')}>
                <Text style={styles.optionText}>Price: High to Low</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={() => handleSort('highRating')}>
                <Text style={styles.optionText}>Highest Rating</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={() => handleSort('nearDistance')}>
                <Text style={styles.optionText}>Closest Distance</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.black,
  },
  option: {
    width: '90%',
    backgroundColor: Colors.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    color: Colors.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Sort;
