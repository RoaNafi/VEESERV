import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../Components/Colors/Colors';
import { color } from 'react-native-elements/dist/helpers';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
 
  avatar: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    marginBottom: 20,
    backgroundColor: Colors.black, 
  },
  
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 6,
  },
  info: {
    fontSize: 16,
    color: Colors.darkGray,
    marginBottom: 2,
  },
  menuContainer: {
    marginTop: 30,
    paddingHorizontal: width * 0.03,
  },
  menuItem: {
    backgroundColor: Colors.lightGray,
   // borderColor: Colors.darkGray,
   // borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 14,
    fontSize: 22,
    color: Colors.darkGray,
  },
  menuLabel: {
    fontSize: 18,
    color: Colors.darkGray,
  },

  logoutText:{
    color: Colors.red ,
    flex: 1, 
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    

  },
 


  doubleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
  },
  
  halfMenuItem: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workingHoursContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  workingHoursTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#086189',
    marginBottom: 5,
  },
  workingHoursText: {
    fontSize: 16,
    color: '#555',
  },
  linkButton: {
    marginTop: 10,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#086189',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    backgroundColor: Colors.red,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 70,
    paddingBottom: 40,
    paddingTop: 70,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#086189',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  applyButton: {
    marginTop: 24,
    backgroundColor: '#086189',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  
  
});
