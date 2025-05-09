// UserTypeSelectionStyles.js
import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../Components/Colors/Colors';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.9,
    backgroundColor: Colors.white,
    borderRadius: width * 0.05,
    padding: width * 0.05,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  welcomeText: {
    fontSize: width * 0.06,
    color: Colors.black,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.05,
  },
  descriptionText: {
    fontSize: width * 0.04,
    width: '100%',
    color: Colors.grayDark,
    textAlign: 'left',
    marginBottom: height * 0.02,
  },
  option: {
    width: '100%',
    backgroundColor: Colors.lightGray,
    borderRadius: width * 0.02,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,

  },
  optionText: {
    fontSize: width * 0.04,
    color: Colors.black,
    fontWeight: '600',
    textAlign: 'left',
  },
});