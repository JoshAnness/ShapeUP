import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const WorkoutExecutionScreen = ({ route }) => {
  const { selectedDate, workoutId } = route.params;
  const [workouts, setWorkouts] = useState([]);
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [visibleImages, setVisibleImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'workouts', workoutId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const workoutData = docSnap.data();
          const exercises = await Promise.all(workoutData.exercises.map(async (exerciseName) => {
            const imageUrls = await fetchExerciseImages(exerciseName);
            return { name: exerciseName, imageUrls, sets: '', reps: '', weight: '' };
          }));
          setWorkouts([{ ...workoutData, exercises }]);
        }
      } catch (error) {
        console.error("Error fetching workout details: ", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchWorkoutDetails();
  }, [selectedDate, workoutId]);

  const fetchExerciseImages = async (exerciseName) => {
    const sanitizedExerciseName = exerciseName.replace(/\s+/g, '_').replace(/'/g, '').replace(/\//g, '_');
    const storage = getStorage();
    const imageRef = ref(storage, `exercise_images/${sanitizedExerciseName}_0.jpg`);
    try {
      const imageUrl = await getDownloadURL(imageRef);
      return [imageUrl];
    } catch (error) {
      console.log(`No image found for ${exerciseName}`);
      return [];
    }
  };

  const handleExerciseInput = (exerciseName, field, value) => {
    setExerciseInputs(inputs => ({
      ...inputs,
      [exerciseName]: {
        ...inputs[exerciseName],
        [field]: value,
      },
    }));
  };

  const saveWorkoutExecution = async (exerciseId, sets, reps, weight) => {
    const workoutExecutionRef = doc(db, 'workoutExecutions', `${workoutId}_${selectedDate}`);
    try {
      await updateDoc(workoutExecutionRef, {
        date: selectedDate,
        workoutId: workoutId,
        exercises: arrayUnion({
          exerciseId: exerciseId,
          sets: sets,
          reps: reps,
          weight: weight
        })
      });
      alert('Workout data saved successfully!');
    } catch (error) {
      console.error("Error saving workout execution:", error);
    }
  };

  const toggleImageVisibility = (exerciseName) => {
    setVisibleImages(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName],
    }));
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {workouts.map((workout, index) => (
        <View key={index} style={styles.workoutContainer}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          {workout.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseContainer}>
              <TouchableOpacity onPress={() => toggleImageVisibility(exercise.name)}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </TouchableOpacity>
              {visibleImages[exercise.name] && exercise.imageUrls.map((url, urlIndex) => (
                <Image key={urlIndex} source={{ uri: url }} style={styles.exerciseImage} />
              ))}
              <TextInput
                placeholder="Sets"
                style={styles.input}
                onChangeText={(text) => handleExerciseInput(exercise.name, 'sets', text)}
                value={exerciseInputs[exercise.name]?.sets || ''}
              />
              <TextInput
                placeholder="Reps"
                style={styles.input}
                onChangeText={(text) => handleExerciseInput(exercise.name, 'reps', text)}
                value={exerciseInputs[exercise.name]?.reps || ''}
              />
              <TextInput
                placeholder="Max Weight"
                style={styles.input}
                onChangeText={(text) => handleExerciseInput(exercise.name, 'weight', text)}
                value={exerciseInputs[exercise.name]?.weight || ''}
              />
              <Button title="Save" onPress={() => saveWorkoutExecution(exercise.id, exerciseInputs[exercise.name]?.sets, exerciseInputs[exercise.name]?.reps, exerciseInputs[exercise.name]?.weight)} />
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  workoutContainer: {
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseContainer: {
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
});

export default WorkoutExecutionScreen;