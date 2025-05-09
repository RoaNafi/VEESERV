import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../Components/Colors/Colors'; // Import your color palette

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: width * 0.1,
    marginTop: height* 0.15,
  },
  logo: {
    width: width * 0.5, // Updated logo size
    height: height * 0.2, // Updated logo size
    resizeMode: 'contain',
    alignSelf: 'center', // Center the logo
    marginBottom: 0
  },
  inputContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: width * 0.02,
    borderBlockColor: Colors.grayDark,
    height: height * 0.07,
    paddingVertical: 0,
    paddingHorizontal: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android
    justifyContent: 'center',
  },
  input: {
    fontSize: width * 0.04,
    color: Colors.black,
    height: 40, // Increased height
    padding: 0, // Ensure no extra padding
  },
  button: {
    backgroundColor: Colors.blue, // Primary button color
    width: '100%',
    paddingVertical: height * 0.015,
    borderRadius: 50, // Updated borderRadius
    alignItems: 'center',
    marginBottom: height * 0.005,
  },
  buttonText: {
    color: Colors.white,
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: width * 0.04,
    color: Colors.black,
    textAlign: 'center',
  },
  signUpLink: {
    color: Colors.blue,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: Colors.blue,
    fontSize: width * 0.04,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.red,
    fontSize: width * 0.04,
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }], // Center the icon vertically
  },
});