import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { db } from '../firebase'; // Import Firebase configuration
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { format, startOfDay } from 'date-fns'; // Import date-fns library

const WorkoutTracker = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [notes, setNotes] = useState('');

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Set the current date (start of the day) when the component mounts
    const currentDate = format(startOfDay(new Date()), 'yyyy-MM-dd');
    setDate(currentDate);
  }, []);

  const handleFormSubmit = async () => {
    try {
      // Format the date as 'yyyy-MM-dd'
      const formattedDate = format(startOfDay(new Date(date)), 'yyyy-MM-dd');

      const workoutData = {
        title,
        date: formattedDate, // Store the date in 'yyyy-MM-dd' format
        workoutType,
        workoutName,
        weight,
        reps,
        notes,
      };
      await addDoc(collection(db, 'workouts'), workoutData);

      // Clear the input fields
      setTitle('');
      setWorkoutType('');
      setWorkoutName('');
      setWeight('');
      setReps('');
      setNotes('');

      // Show the "Workout Added!" pop-up
      setShowPopup(true);
    } catch (error) {
      console.error('Error adding workout to Firestore: ', error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout Tracker</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Date"
        value={date}
        onChangeText={setDate}
        editable={false} // Disable editing of the date field
      />
      <TextInput
        style={styles.input}
        placeholder="Workout Type"
        value={workoutType}
        onChangeText={setWorkoutType}
      />
      <TextInput
        style={styles.input}
        placeholder="Workout Name"
        value={workoutName}
        onChangeText={setWorkoutName}
      />
      <TextInput
        style={styles.input}
        placeholder="Weight"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="Reps"
        value={reps}
        onChangeText={setReps}
      />
      <TextInput
        style={styles.input}
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Button title="Add Workout" onPress={handleFormSubmit} />

      <Modal visible={showPopup} animationType="slide" transparent>
        <View style={styles.popupContainer}>
          <View style={styles.popup}>
            <Text>Workout Added!</Text>
            <TouchableOpacity onPress={closePopup}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});

export default WorkoutTracker;