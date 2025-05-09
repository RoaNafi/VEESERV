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
  
});