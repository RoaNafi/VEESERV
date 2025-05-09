import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { config } from '../../../config';

const History = ({ userId }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/history/history/${userId}`);
                setBookings(res.data);
            } catch (err) {
                console.error('Failed to load history:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    if (loading) return <ActivityIndicator size="large" color="#4B9CD3" style={{ marginTop: 40 }} />;

    return (
        <View style={styles.container}>
            {bookings.length === 0 ? (
                <View style={styles.noHistory}>
                    <Ionicons name="time-outline" size={60} color="#aaa" />
                    <Text style={styles.noText}>No bookings yet</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.booking_id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.title}>{item.service_name}</Text>
                            <Text style={styles.details}>Workshop: {item.workshop_name}</Text>
                            <Text style={styles.details}>Status: {item.booking_status}</Text>
                            <Text style={styles.details}>Scheduled: {item.scheduled_date}</Text>
                            <Text style={styles.details}>Completed: {item.completion_date || '—'}</Text>
                            <Text style={styles.details}>Price: ${item.price}</Text>
                            <Text style={styles.details}>Rating: {item.rate}⭐</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#EDF6FF' },
    noHistory: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noText: { marginTop: 12, fontSize: 18, color: '#777' },
    card: {
        backgroundColor: '#EDF6Fe',
        padding: 16,
        marginVertical: 8,
        borderRadius: 10,
        elevation: 2,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: '#086189' },
    details: { fontSize: 14, color: '#555', marginTop: 4 },
});

export default History;
