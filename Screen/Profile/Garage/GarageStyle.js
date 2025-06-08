import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../Components/Colors/Colors';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: width * 0.05,
  },
  scrollContent: {
    paddingBottom: height * 0.1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: width * 0.04,
    padding: width * 0.05,
    marginBottom: height * 0.02,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  carInfo: {
    flex: 1,
  },
  carTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: Colors.shineBlue,
  },
  carYear: {
    fontSize: width * 0.04,
    color: Colors.darkGray,
    fontWeight: 'normal',
  },
  carDetails: {
    fontSize: width * 0.035,
    color: Colors.darkGray,
    marginTop: height * 0.005,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.005,
    borderRadius: width * 0.02,
  },
  defaultText: {
    fontSize: width * 0.035,
    color: '#2E7D32',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: height * 0.015,
    gap: width * 0.05,
  },
  noCarText: {
    fontSize: width * 0.045,
    textAlign: 'center',
    color: Colors.darkGray,
    marginTop: height * 0.05,
  },
  fab: {
    position: 'absolute',
    right: width * 0.05,
    bottom: height * 0.03,
    backgroundColor: Colors.blue,
    borderRadius: width * 0.15,
    padding: width * 0.04,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.02,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: width * 0.035,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  activeButtonText: {
    color: '#2E7D32',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderColor: '#e74c3c',
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
});
