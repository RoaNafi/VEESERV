import { StyleSheet } from 'react-native';
import Colors from '../Colors/Colors';

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
  },
  image: {
    width: 90,
    height: "100%",
    marginRight: 0,
  },
  info: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  topInfo: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workshopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkGray,
    flex: 1,
    marginRight: 8,
  },
  arrowIcon: {
    marginTop: 2,
  },
  middleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: Colors.orange,
    fontSize: 12,
    marginLeft: 2,
  },
  servicesContainer: {
    marginVertical: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  serviceName: {
    fontSize: 14,
    color: Colors.darkGray,
    flex: 1,
    marginRight: 8,
  },
  
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  distance: {
    fontSize: 12,
    color: Colors.darkGray,
  },
  bookButton: {
    borderWidth: 1,
    borderColor: Colors.Gray,
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  bookButtonText: {
    color: Colors.black,
    fontWeight: '600',
    fontSize: 14,
  },
});
