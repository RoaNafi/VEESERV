import { View, Text, Image, TouchableOpacity, Modal, FlatList, ActivityIndicator, StyleSheet, Button } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from "../Colors/Colors";
import styles from "./WorkshopCardStyle";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const WorkshopCard = ({ data = {}, date, timeSlots, onBookPress, onShopPress, route }) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const [availableHours, setAvailableHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    timeSlots ? convertTo24HourFormat(timeSlots[0]) : null
  );
  console.log('WorkshopCard Props:', { timeSlots });
  const {
    profile_picture,
    image,
    workshop_name,
    rate = 0,
    city,
    street,
    services,
    workshop_id,
  } = data;
  console.log('------------------------------------------------');
  console.log('WorkshopCard Name:', workshop_name);
  console.log('WorkshopCard Rate:', rate);
  console.log('WorkshopCard City:', city);
  console.log('WorkshopCard Street:', street);
  console.log(services)
  console.log("WorkshopCard Date:", date);
  console.log("WorkshopCard timeSlots:", timeSlots);
  const service = Array.isArray(services)
    ? services
    : typeof services === 'string'
      ? services_list.split(',').map(s => s.trim())
      : [];


  const fetchAvailableHours = async () => {
    if (!workshop_id || !date) {
      console.warn('Missing workshop_id or date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`http://176.119.254.225:80/mechanic/workshop/${workshop_id}/hours`, {
        params: { date }
      });

      console.log('Raw workshop hours:', res.data);

      const allSlots = [];
      for (const period of res.data.available_hours) {
        const slots = generateTimeSlots(period.start_time, period.end_time);
        allSlots.push(...slots);
      }

      console.log('Generated time slots:', allSlots);
      setAvailableHours(allSlots);
    } catch (err) {
      console.error(err);
      setError('Failed to load hours');
      setAvailableHours([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (modalVisible) {
      if (!date) {
        setDatePickerVisible(true);
      } else {
        fetchAvailableHours(date);
      }
    }
  }, [modalVisible]);
  const generateTimeSlots = (start, end, intervalMinutes = 60) => {
    const slots = [];
    let [startHour, startMinute] = start.split(':').map(Number);
    let [endHour, endMinute] = end.split(':').map(Number);

    let current = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    while (current + intervalMinutes <= endTotal) {
      const hours = Math.floor(current / 60).toString().padStart(2, '0');
      const minutes = (current % 60).toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      current += intervalMinutes;
    }

    return slots;
  };

  const onCheckOtherTimes = () => {
    console.log('Checking other times for workshop:', workshop_name);
    console.log('Fetching available hours for date:', date);
    fetchAvailableHours();
    setModalVisible(true);
  };
  useEffect(() => {
    if (!selectedTimeSlot && timeSlots?.length > 0) {
      setSelectedTimeSlot(timeSlots[0]); // تأكد إنها بنفس فورمات اللي جوّا availableHours
      console.log('Setting initial selected time slot:', timeSlots[0]);
    }
  }, [timeSlots]);
  function convertTo24HourFormat(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  }

  return (
    <TouchableOpacity onPress={() => { 
      if (onShopPress) {
        // console.log('Pressed card data:-----------------------------------------------');
        // console.log( data);
        // console.log('----------------------------------------------');
        onShopPress();
      }
    }} activeOpacity={0.7}>
      <View style={styles.card}>
        <Image
          source={
            image && image.length > 10
              ? { uri: image }
              : profile_picture && profile_picture.length > 10
                ? { uri: profile_picture }
                : { uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTndajZaCUGn5HCQrAQIS6QBUNU9OZjAgXzDw&s" }
          }
          style={styles.image}
        />

        <View style={styles.info}>
          <View style={styles.topInfo}>
            <View style={styles.nameLocationContainer}>
              <Text style={styles.workshopName} numberOfLines={2}>
                {String(workshop_name || "Un workshop_named Workshop")}
              </Text>

              <Text style={styles.location} numberOfLines={1}>
                {String(street || "") + ", " + String(city || "Unknown City")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.darkGray} style={styles.arrowIcon} />
          </View>

          <View style={styles.ratingDistanceContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>
                {String(rate.toFixed(1))}
              </Text>
            </View>
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={12} color={Colors.blue} />
              <Text style={styles.distanceText}>
                {"6 km"}
              </Text>
            </View>
          </View>

          <View style={styles.servicesContainer}>
            {service.length > 0 ? (
              <>
                {service.map((service, index) => (
                  <View key={index} style={styles.serviceItem}>
                    <Text style={styles.serviceName}>
                      {String(service.name)} - {service.price}₪
                    </Text>
                  </View>
                ))}
                {service.length > 1 && (
                  <Text style={styles.totalPrice}>
                    Total: {service.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0)}₪
                  </Text>
                )}
              </>
            ) : (
              <Text>No services found</Text>
            )}
          </View>

          <View style={styles.bottomInfo}>
            


            <TouchableOpacity
              style={styles.otherTimesButton}
              onPress={onCheckOtherTimes}
            >
              <Text style={styles.otherTimesText}>Other Available Times</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={(e) => {
                e.stopPropagation();
                if (onBookPress) onBookPress(selectedTimeSlot);
              }}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
            
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Available Times & date</Text>

                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={(date) => {
                      setDatePickerVisible(false);
                      setSelectedDate(date);
                      // ممكن تحدث هنا البيانات حسب التاريخ الجديد، مثلاً تجيب الأوقات المتاحة الجديدة
                      fetchAvailableHours(date);
                    }}
                    onCancel={() => setDatePickerVisible(false)}
                    minimumDate={new Date()}
                    date={date || new Date()}
                    themeVariant="light"
                  />


                  {loading && <ActivityIndicator size="large" color="#4F46E5" />}

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  {!loading && !error && availableHours.length === 0 && (
                    <Text style={styles.noTimesText}>No available times for this date.</Text>
                  )}

                  {!loading && !error && availableHours.length > 0 && (
                    <FlatList
                      data={availableHours}
                      keyExtractor={(item, index) => index.toString()}
                      numColumns={3}
                      columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
                      contentContainerStyle={{ paddingHorizontal: 10 }}
                      renderItem={({ item }) => {
                        const isSelected = item === selectedTimeSlot;

                        return (
                          <TouchableOpacity
                            style={[
                              styles.timeSlot,
                              isSelected && styles.timeSlotSelected
                            ]}
                            onPress={() => {
                              setSelectedTimeSlot(item); // لما يختار وقت جديد
                            }}
                          >
                            <Text style={[
                              styles.timeSlotText,
                              isSelected && styles.timeSlotTextSelected
                            ]}>
                              {item}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />


                  )}


                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
};


export default WorkshopCard;
