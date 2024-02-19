import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { db } from '../firebase';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';

function DateDetails({ route }) {
  const { selectedDate } = route.params;
  const [workoutData, setWorkoutData] = useState([]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        const workoutRef = collection(db, 'workouts');
        const q = query(workoutRef, where('assignedDays', 'array-contains', selectedDate));
        const querySnapshot = await getDocs(q);
  
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
  
        setWorkoutData(data);
      } catch (error) {
        console.error('Error fetching workout data: ', error);
      }
    };
  
    fetchWorkoutData();
  }, [selectedDate]);  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Workouts for {selectedDate}</Text>
      {workoutData.length > 0 ? (
        workoutData.map((data, index) => (
          <View key={index} style={styles.workoutContainer}>
            <Text style={styles.workoutItem}>Workout Name: {data.name}</Text>
            {/* Add more details as per your data structure */}
          </View>
        ))
      ) : (
        <Text>No workouts assigned for this day.</Text>
      )}
    </ScrollView>
  );  
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  workoutContainer: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  workoutItem: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default DateDetails;