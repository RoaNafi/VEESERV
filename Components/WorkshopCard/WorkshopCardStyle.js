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
    marginHorizontal: 1,
    backgroundColor: "#fff",
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
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
    position: 'relative',
  },
  nameLocationContainer: {
    flex: 1,
    marginRight: 16,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.darkGray,
    opacity: 0.8,
  },
  arrowIcon: {
    marginTop: 4,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: Colors.orange,
    fontSize: 12,
    marginLeft: 2,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.blue,
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
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
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
