import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../Components/Colors/Colors';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.black,
    alignSelf: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  defaultBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.orange,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  carIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  carName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  carYear: {
    fontSize: 16,
    color: Colors.darkGray,
    fontWeight: 'normal',
  },
  carDetails: {
    textAlign: 'center',
    color: Colors.darkGray,
    fontSize: 14,
    marginTop: 6,
  },
});
