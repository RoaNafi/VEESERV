import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../Components/Colors/Colors';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 8;
const CARD_PADDING = 10;
const NUM_COLUMNS = 3;

// Calculate card width based on screen width and margins
const cardWidth = (width - (CARD_MARGIN * 2 * NUM_COLUMNS) - (CARD_PADDING * 2)) / NUM_COLUMNS;

// this insted of add padding to the container
const PADDING = 20;

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: width * 0.13,
    gap: 10,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  searchIcon: {
    marginRight: 12,
    color: Colors.mediumGray,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    height: '100%',
    paddingVertical: 0,
  },

  searchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  searchActionButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  scrollContent: {
    flex: 1,
    marginTop:20,
  },
  searchResultsContainer: {
    flex: 1,
    //paddingHorizontal: 20,
    paddingTop: 10,

    
  },
  separator: {
    height: 1,             // Thin line
    backgroundColor: 'black',  // Black color
    marginBottom: 10, 
    marginHorizontal: 20,  // Adds space to the left and right of the line
        // Spacing after the line (you can adjust this)
  },
 frequentServicesContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 10,
  },
  serviceCard: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 10,
    padding: 10,
    width: width * 0.5,
    height: width * 0.3,
    marginRight: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "column",
    justifyContent: "space-between",
    numberOfLines:2,
    
  },
  serviceInfoRow: {
    flexDirection: "column", // Allow the content to stack vertically
    justifyContent: "space-between", // Ensure space between title/price and button
    flexGrow: 1, // Push the button to the bottom
  },
  serviceDetails: {
    marginBottom: 10, // Space between title/price and button
  },
  addToCartButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#086189",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: width * 0.08,
    flexDirection: "row",
    gap: 4,
  },
  buttonText: {
    color: "#086189",
    fontWeight: "600",
    fontSize: width * 0.032,
  },
  serviceName: {
    fontSize: width * 0.035,
    fontWeight: '700',
    color: "#333",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: "#086189",
    marginBottom: 6,
  },
  hoveredServiceCard: {
    transform: [{ scale: 1.05 }], // Slight scaling effect on hover for interaction
    shadowOpacity: 0.3, // More intense shadow on hover
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    //marginBottom: 15,
    color: Colors.black,
   // marginHorizontal: PADDING,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingTop: 50,
  },
  imageScroll: {
    paddingHorizontal: PADDING,
    marginBottom: 20
  },
  imageBanner: {
    width: width - 70,
    height: 160,
    borderRadius: 12,
    marginLeft: 10,
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: PADDING,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  categoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    

  },
  categoryText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: PADDING,
    marginBottom: 8,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verticalSeparator: {
    height: 20,
    width: 1,
    backgroundColor: Colors.lightGray,
  },
  horizontalSeparator: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginHorizontal: PADDING,
    marginVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
  },
  filterButtonText: {
    marginLeft: 4,
    color: Colors.darkGray,
    fontWeight: 'bold',
  },
  sortButtonText: {
    marginLeft: 4,
    color: Colors.darkGray,
    fontWeight: 'bold',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
    backgroundColor: '#086189',  // Change this color to whatever you like for the area under the filter button


  },
  modalContent: {
    height: 600,                     // Bigger to fit all filters
    backgroundColor: Colors.lightblue,     // Background of the WHOLE filter panel
    padding: 20,
    paddingTop: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.darkGray,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 10,
  },
  chipGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.lightblue,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  applyButton: {
    backgroundColor: Colors.blue,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  resetButtonText: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  selectedOption: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  searchResultsScroll: {
    flex: 1,
  },


  sortModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // خلفية شفافة شوي
  },
  
  sortModalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  
  sortModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.black,
  },
  
  sortOptionsContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  
  sortOptionButton: {
    width: '90%',
    backgroundColor: Colors.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  sortOptionText: {
    color: Colors.darkGray,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.blue, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  categoryChipText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  floatingButtonContainer: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  zIndex: 999, // Ensure it's above all other content
    position: 'relative',

},



fixedButtons: {
  position: 'absolute',
  bottom: 20,
  right: 20,
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 999, // فوق كلشي
},

floatingButton: {
  backgroundColor: '#086189',
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
  elevation: 5,
},

cartButton: {
  backgroundColor: '#FF6347',
},

chatButton: {
  backgroundColor: '#086189',
},

cartNotification: {
  position: 'absolute',
  top: -6,
  right: -6,
  backgroundColor: 'red',
  borderRadius: 12,
  width: 22,
  height: 22,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
},

cartNotificationText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
},

categoryGridContainer: {
  paddingHorizontal: PADDING,
  paddingBottom: 10,
},
categoryGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
categoryGridItem: {
  width: (width - (PADDING * 2) - 20) / 3,
  marginBottom: 10,
  backgroundColor: Colors.white,
  borderRadius: 12,
  padding: 12,
  aspectRatio: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  overflow: 'hidden',
},
categoryIconContainer: {
  width: '100%',
  height: '100%',
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  
},
iconContainer: {
  position: 'absolute',
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
  
},
categoryGridText: {
  fontSize: 12,
  color: '#333',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 4,
  paddingHorizontal: 2,
},
showMoreButton: {
  alignSelf: 'center',
  //padding: 10,
  marginBottom:25,
  backgroundColor: 'transparent',
  flexDirection: 'row',
  alignItems: 'center',
},
showMoreText: {
  color: Colors.mediumGray,
  fontWeight: 'bold',
  fontSize: 13,
},
showMoreIcon: {
  marginLeft: 10,
  fontSize: 20,
  fontWeight: 'bold',
  color: Colors.mediumGray,
},

iconWrapper: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginBottom: 8,
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
  
},

contentContainer: {
  flex: 1,
  position: 'relative',
},
favoriteMechanicCard: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  marginVertical: 12,
  marginHorizontal: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
},

favoriteMechanicHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

mechanicName: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
},

mechanicSubtitle: {
  fontSize: 14,
  color: '#666',
},

mechanicRating: {
  fontSize: 14,
  color: '#f1c40f',
},

bookNowButton: {
  backgroundColor: '#086189',
  borderRadius: 8,
  paddingVertical: 10,
  alignItems: 'center',
},

bookNowText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},

favoriteWorkshopCard: {
  width: width * 0.36,
  backgroundColor: '#fff',
  borderRadius: 14,
  marginRight: 10,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: '#E0E7EF',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 5,
  elevation: 2,
  overflow: 'hidden',
  position: 'relative',
  minHeight: width * 0.26,
  paddingBottom: 4,
},
favoriteWorkshopImage: {
  width: '100%',
  height: width * 0.16,
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  backgroundColor: '#F3F6FA',
},
favoriteWorkshopInfo: {
  padding: 8,
},
favoriteWorkshopName: {
  fontSize: 13,
  fontWeight: '700',
  color: '#1A202C',
  marginBottom: 1,
},
favoriteWorkshopAddress: {
  color: '#6B7280',
  fontSize: 11,
  marginBottom: 2,
},
favoriteWorkshopRatingRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
favoriteWorkshopRate: {
  color: '#444',
  fontWeight: '600',
  fontSize: 11,
},
favoriteHeartIcon: {
  position: 'absolute',
  top: 7,
  right: 7,
  zIndex: 2,
},
favoriteWorkshopCardPressed: {
  transform: [{ scale: 0.97 }],
  shadowOpacity: 0.13,
},
emergencyCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 14,
  borderWidth: 2,
  borderColor: '#ff1744',
  paddingVertical: 16,
  paddingHorizontal: 20,
  marginHorizontal: 20,
  marginTop: 24,
  marginBottom: 10,
  shadowColor: '#ff1744',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 4,
  justifyContent: 'center',
},
emergencyCardText: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#ff1744',
  letterSpacing: 0.5,
},
emergencyTypeCard: {
  width: (width - (PADDING * 2) - 10) / 2,
  marginBottom: 10,
  backgroundColor: Colors.white,
  borderRadius: 12,
  paddingVertical: 0,
  paddingHorizontal: 12,
  aspectRatio: 1.5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  overflow: 'hidden',
  marginRight: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
emergencyTypeLabel: {
  fontSize: 12,
  color: '#333',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 4,
  paddingHorizontal: 2,
},
emergencyTypeGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  paddingHorizontal: PADDING,
  paddingBottom: 10,
  marginRight: -10,
},

});

