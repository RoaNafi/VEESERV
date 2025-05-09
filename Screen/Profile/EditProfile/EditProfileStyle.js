import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../Components/Colors/Colors';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 30,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: Colors.gray,
    marginTop: 6,
    fontSize: 12,
  },
  fieldContainer: {
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    fontSize: 16,
    color: Colors.black,
    marginBottom: 16,
    padding: 10,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: Colors.blue,
    marginBottom: 6,
    
  },
  input: {
   padding: 5,
    fontSize: 16,
    color: Colors.black,
 
  },
  saveButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    //marginHorizontal: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 4,
    backgroundColor: '#ddd',
    paddingVertical:  3,
    borderRadius: width * 0.025,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
