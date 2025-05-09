import { StyleSheet } from 'react-native';
import Colors from '../../Components/Colors/Colors';

export default StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: Colors.lightGray,
    overflow: 'hidden',
    shadowColor: Colors.lightGray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 2,
    // height: 120,
  },
  image: {
    width: 90,
    height: "100%",
    marginRight: 0,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 90, 
    
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
    color: Colors.shineBlue,
    marginRight: 4,
   
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.black,
    //marginRight: 15,
    
  },
  middleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  ratingText: {
    color: Colors.orange,
    fontSize: 12,
  marginLeft: 2,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  distance: {
    fontSize: 14,
    color: Colors.darkGray,
  },
  bookButton: {
    backgroundColor: Colors.lightblue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  bookButtonText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 14,
  },
  serviceInfo: {
    marginTop: 4,
  },
  
  serviceName: {
    
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  
  serviceDescription: {
    fontSize: 12,
    color: Colors.mediumGray,
    
  },
  
});
