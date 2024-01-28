import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { db } from '../firebase'; // Import the Firebase configuration
import { query, where, getDocs, collection } from 'firebase/firestore';
import { format, toDate } from 'date-fns'; // Import date-fns library

function DateDetails({ route }) {
  const { selectedDate } = route.params;
  const [workoutData, setWorkoutData] = useState([]);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        // Convert the selectedDate to a JavaScript Date object
        const selectedDateObject = toDate(new Date(selectedDate));

        // Format the selected date as 'yyyy-MM-dd'
        const formattedDate = format(selectedDateObject, 'yyyy-MM-dd');

        const workoutRef = collection(db, 'workouts');
        const q = query(workoutRef, where('date', '==', formattedDate));
        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
          data.push(doc.data());
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
      {workoutData.map((data, index) => (
        <View key={index} style={styles.workoutContainer}>
          <Text style={styles.workoutItem}>Title: {data.title}</Text>
          <Text style={styles.workoutItem}>Workout Type: {data.workoutType}</Text>
          <Text style={styles.workoutItem}>Workout Name: {data.workoutName}</Text>
          <Text style={styles.workoutItem}>Weight: {data.weight}</Text>
          <Text style={styles.workoutItem}>Reps: {data.reps}</Text>
          <Text style={styles.workoutItem}>Notes: {data.notes}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = {
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
};

export default DateDetails;