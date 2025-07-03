import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Dimensions, Alert } from 'react-native'
import React from 'react'
import Colors from '../../Components/Colors/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const horizontalPadding = Math.round(width * 0.06); // ~4% of screen width
const cardRadius = Math.round(width * 0.035); // ~3.5% of width
const buttonRadius = Math.round(width * 0.06); // ~6% of width
const baseFontSize = Math.round(width * 0.042); // ~4.2% of width
const smallFontSize = Math.round(width * 0.034); // ~3.4% of width

const EmergencyReqSummary = ({ route, navigation }) => {
  const { selectedWorkshops = [], service, userAddress } = route.params || {};

  // Extract price if available (for emergency, you may have service.price or service.estimated_price)
  const servicePrice = service?.price || service?.estimated_price || null;

  const handleConfirm = () => {
    Alert.alert(
      'Notice',
      'Please pay attention to notifications!\nYou can also view your request details in the Booking page.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('MainTabs', { screen: 'MyBookings' });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="list" size={20} color={Colors.blue} />
          <Text style={styles.sectionTitleText}>Emergency Summary</Text>
        </View>

        {/* Summary Card (imitate BookSummary.js) */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryContent}>
            {/* Service Label Row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="construct-outline" size={20} color={Colors.blue} />
                <Text style={styles.summaryLabel}>Service</Text>
              </View>
            </View>
            {/* Service Name + Price Row */}
            <View style={styles.serviceDetailsRow}>
              <Text style={styles.serviceNameText}>{service?.name || '-'}</Text>
              {servicePrice !== null && (
                <Text style={styles.servicePrice}>{servicePrice}₪</Text>
              )}
            </View>
            {/* Location Label Row */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabelContainer}>
                <Ionicons name="location-outline" size={20} color={Colors.blue} />
                <Text style={styles.summaryLabel}>Location</Text>
              </View>
            </View>
            {/* Location Value Row */}
            <View style={styles.bookingDetails}>
              <Text style={styles.locationText}>{userAddress || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Selected Workshops Section Title */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="business" size={18} color={Colors.blue} />
          <Text style={styles.sectionTitleText}>Selected Workshops</Text>
        </View>

        {/* Workshops List */}
        <FlatList
          data={selectedWorkshops}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.workshopCard}>
              {/* Name and Price Row */}
              <View style={styles.serviceDetailsRow}>
                <Text style={styles.workshopName}>{item.workshop_name}</Text>
                <Text style={styles.workshopPrice}>₪{item.price}</Text>
              </View>
              {/* Address Row */}
              <Text style={styles.workshopAddress}>{item.address}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
          scrollEnabled={false}
        />
      </ScrollView>
      {/* Fixed bottom area */}
      <View style={styles.bottomFixed}>
        <View style={styles.infoTextCard}>
          {/* <Ionicons name="time-outline" size={22} color={Colors.red} style={{ marginBottom: 4 }} /> */}
          <Text style={styles.infoText}>
            Please wait up to <Text style={{ color: Colors.red, fontWeight: 'bold' }}>5 minutes</Text> for the workshop(s) to approve your emergency request.
          </Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.8}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Math.round(width * 0.025),
    marginTop: Math.round(width * 0.045),
    marginHorizontal: horizontalPadding,
  },
  sectionTitleText: {
    fontSize: baseFontSize + 1,
    color: Colors.blue,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: cardRadius,
    marginBottom: Math.round(width * 0.045),
    marginHorizontal: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  summaryContent: {
    padding: Math.round(width * 0.04),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Math.round(width * 0.02),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: baseFontSize - 1,
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  serviceDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Math.round(width * 0.02),
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceNameText: {
    fontSize: baseFontSize,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: Math.round(width * 0.05),
  },
  bookingDetails: {
    paddingVertical: Math.round(width * 0.02),
    paddingHorizontal: 2,
  },
  locationText: {
    fontSize: baseFontSize,
    color: '#333',
    fontWeight: '600',
    marginLeft: Math.round(width * 0.05),
  },
  servicePrice: {
    fontSize: baseFontSize,
    color: Colors.blue,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Math.round(width * 0.04),
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: cardRadius,
    padding: Math.round(width * 0.035),
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 120,
  },
  infoCardLabel: {
    fontSize: smallFontSize,
    color: Colors.darkGray,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoCardValue: {
    fontSize: baseFontSize,
    color: Colors.blue,
    fontWeight: 'bold',
  },
  workshopCard: {
    backgroundColor: '#fff',
    borderRadius: cardRadius,
    paddingHorizontal: Math.round(width * 0.035),
    paddingVertical: Math.round(width * 0.025),
    marginBottom: Math.round(width * 0.025),
    marginHorizontal: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  workshopName: {
    fontSize: baseFontSize,
    fontWeight: '600',
    color: Colors.black,
    flex: 1,
  },
  workshopPrice: {
    fontSize: baseFontSize,
    color: Colors.blue,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workshopAddress: {
    fontSize: smallFontSize,
    color: '#666',
    marginTop: 2,
  },
  infoTextCard: {
    flexDirection: 'column',
    alignItems: 'center',
    //backgroundColor: '#fff',
    borderRadius: 0,
    //paddingVertical: 12,
    //paddingHorizontal: horizontalPadding,
    marginBottom: Math.round(width * 0.04),
    //marginHorizontal: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: baseFontSize,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: Math.round(width * 0.052),
  },
  confirmButton: {
    backgroundColor: Colors.blue,
    borderRadius: buttonRadius,
    paddingVertical: Math.round(width * 0.038),
    alignItems: 'center',
    marginTop: 0,
    marginBottom:7,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.blue,
    
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: baseFontSize + 1,
    letterSpacing: 0.5,
  },
  bottomFixed: {
    backgroundColor: '#fff',
    paddingTop: Math.round(width * 0.035),
    paddingBottom: Math.round(width * 0.045),
    paddingHorizontal: horizontalPadding,
    
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
    alignItems: 'stretch',
  },
});

export default EmergencyReqSummary