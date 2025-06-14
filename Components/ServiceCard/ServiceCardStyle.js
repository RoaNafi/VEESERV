import { StyleSheet } from 'react-native';
import Colors from '../Colors/Colors';

export default StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    shadowColor: Colors.lightGray,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkGray,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 13,
    color: Colors.mediumGray,
    marginBottom: 16,
    lineHeight: 18,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: "flex-end",
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: Colors.blue,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  bookButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  addToCartButton: {
    backgroundColor: Colors.orange,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cartIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIcon: {
    marginLeft: -4,
  },
});
