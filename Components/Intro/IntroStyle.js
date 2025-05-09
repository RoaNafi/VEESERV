import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../Colors/Colors';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  imageBackground: {
    width: '100%',
    height: height * 0.65,
    resizeMode: 'cover',
    justifyContent: 'flex-start',
  },
  skipButton: {
    position: 'absolute',
    top: height* 0.05,
    right: 20,
  },
  skipText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  heading: {
    color: Colors.darkGray,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: Colors.black,
    fontSize: 18,
    textAlign: 'left',
    lineHeight: 25,
  },
  highlight: {
    color: Colors.orange,
    fontWeight: 'bold',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mediumGray,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: Colors.blue,
  },
  nextButton: {
    backgroundColor: Colors.blue,
    width: '70%',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
 
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    alignContent: 'center',
  },
});
