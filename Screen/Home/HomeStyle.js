import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../Components/Colors/Colors';

const { width } = Dimensions.get('window');

// this insted of add padding to the container
const PADDING = 20;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    height: 44,
    marginTop: width * 0.13,
    zIndex: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
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
  marginHorizontal: 10,
  marginBottom: 20,
},serviceCard: {
  backgroundColor: "#f8f8f9",
  borderColor: "#086189",
  borderRadius: 10,
  padding: 10,
  width: 250, // Set a fixed width for each card, adjust as necessary
  height: 120, // Set a fixed height for each card, adjust as necessary
  marginRight: 15, // Space between cards
  elevation: 3, // Optional for shadow effect on Android
  shadowColor: "#000", // Optional for shadow effect on iOS
  shadowOpacity: 0.1, // Optional for shadow effect on iOS
  shadowRadius: 5, // Optional for shadow effect on iOS
  shadowOffset: { width: 0, height: 4 }, // Optional for shadow effect on iOS
  flexDirection: "column", // Ensures content is stacked vertically
  justifyContent: "space-between", // Positions the content (name, price, button) properly
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
  backgroundColor: "#086189",
  paddingVertical: 6, // Reduced vertical padding to make the button smaller
  paddingHorizontal: 8, // Adjusted horizontal padding for smaller size
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginTop: "auto", // Push the button to the bottom of the container
  width: "50%", // Set a smaller width, adjust as necessary
  height: 40, // Set a fixed height for the button
  alignSelf: "flex-end", // Align the button to the right
  marginRight: 10, // Small margin from the right edge
},
buttonText: {
  color: "#fff",
  fontWeight: "bold",
},

serviceName: {
  fontSize: 15, // Adjust as needed
  fontWeight: 'bold', // Apply bold font weight to the service name
  color: "#333", // Text color
},

servicePrice: {
  fontSize: 13, // Adjust as needed
  fontWeight: 'bold', // Apply bold font weight to the price
  color: "#086189", // Price color
  marginTop: 5, // Space between price and button
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
    flexDirection: 'row',
    marginLeft: 20,
    marginBottom: 24,
    gap: 10,

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


subcategoryList: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20, // Add some padding around the list for spacing
  },
  subcategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 15, // Rounded corners for the box effect
    marginBottom: 15, // Space between items
    elevation: 5, // Shadow effect for modern look
    shadowColor: "#000", // Shadow color
    shadowOpacity: 0.1, // Light shadow opacity
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowRadius: 5, // Shadow blur effect
    justifyContent: "space-between", // Space out the content inside
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subcategoryText: {
    marginLeft: 10,
    fontSize: 16, // Slightly larger text for better readability
    fontWeight: "600", // Make text bolder
    color: "#333",
    flex: 1, // Take up available space to keep the checkbox at the right
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
});

