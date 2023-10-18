import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const WorkoutTracker = () => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [workoutType, setWorkoutType] = useState('');
    const [workoutName, setWorkoutName] = useState('');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [notes, setNotes] = useState('');
  
    const handleFormSubmit = () => {
      // Handle the form submission here, e.g., save data to a database or display it
      console.log('Title:', title);
      console.log('Date:', date);
      console.log('Workout Type:', workoutType);
      console.log('Workout Name:', workoutName);
      console.log('Weight:', weight);
      console.log('Reps:', reps);
      console.log('Notes:', notes);
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
  });
  
export default WorkoutTracker;