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
 otherTimesButton: {
  marginTop: 8,
  paddingVertical: 8,
  borderRadius: 15,
  backgroundColor: '#003B5C', // لون بنفسجي كلاسيك مريح
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#003B5C',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 5, // للظل ع أندرويد
},

otherTimesText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 14,
  letterSpacing: 0.5,
  textAlign: 'center',
  paddingHorizontal: 10, // padding horizontal for better touch area
},

 modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // خلفية شفافة سوداوية
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
        color: '#003B5C',

  },
  timeItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeText: {
    fontSize: 16,
    color: '#003B5C',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#003B5C',
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  noTimesText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
    marginVertical: 10,
  },
 
timeSlotText: {
  fontSize: 14,
  color: '#003B5C',
},
timeSlot: {
  backgroundColor: '#E0F2FE',
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  borderColor: '#38BDF8',
  borderWidth: 1,
  marginBottom: 10,
  width: '30%',
},

timeSlotSelected: {
  backgroundColor: '#0C4A6E', // لون مختار
  borderColor: '#0C4A6E',
},



timeSlotTextSelected: {
  color: 'white',
},

});
